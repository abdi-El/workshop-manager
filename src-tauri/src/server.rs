use axum::{
    extract::State,
    http::StatusCode,
    response::{Html, IntoResponse},
    routing::{get, post},
    Json, Router,
};
use regex::Regex;
use rusqlite::{params_from_iter, types::Value as SqlValue, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};
use std::sync::{Arc, Mutex};
use tower_http::cors::CorsLayer;

type Db = Arc<Mutex<Connection>>;

#[derive(Deserialize)]
struct QueryRequest {
    query: String,
    params: Option<Vec<Value>>,
}

#[derive(Serialize)]
struct ExecuteResult {
    #[serde(rename = "lastInsertId")]
    last_insert_id: i64,
    #[serde(rename = "rowsAffected")]
    rows_affected: usize,
}

#[derive(Deserialize)]
struct EstimateRequest {
    estimate: Map<String, Value>,
    items: Vec<Map<String, Value>>,
    #[serde(rename = "estimateId")]
    estimate_id: Option<i64>,
}

fn convert_params(sql: &str, params: &[Value]) -> (String, Vec<SqlValue>) {
    let re = Regex::new(r"\$(\d+)").unwrap();
    let converted_sql = re.replace_all(sql, "?$1").to_string();

    let sql_params: Vec<SqlValue> = params.iter().map(json_to_sql_value).collect();
    (converted_sql, sql_params)
}

fn json_to_sql_value(v: &Value) -> SqlValue {
    match v {
        Value::Null => SqlValue::Null,
        Value::Bool(b) => SqlValue::Text(b.to_string()),
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                SqlValue::Integer(i)
            } else {
                SqlValue::Real(n.as_f64().unwrap_or(0.0))
            }
        }
        Value::String(s) => SqlValue::Text(s.clone()),
        _ => SqlValue::Null,
    }
}

fn rows_to_json(
    stmt: &mut rusqlite::Statement,
    sql_params: &[SqlValue],
) -> Result<Vec<Value>, rusqlite::Error> {
    let column_names: Vec<String> = stmt
        .column_names()
        .iter()
        .map(|s| s.to_string())
        .collect();

    let rows = stmt.query_map(params_from_iter(sql_params.iter()), |row| {
        let mut obj = Map::new();
        for (i, name) in column_names.iter().enumerate() {
            let val = match row.get_ref(i)? {
                rusqlite::types::ValueRef::Null => Value::Null,
                rusqlite::types::ValueRef::Integer(n) => json!(n),
                rusqlite::types::ValueRef::Real(f) => json!(f),
                rusqlite::types::ValueRef::Text(s) => {
                    json!(std::str::from_utf8(s).unwrap_or(""))
                }
                rusqlite::types::ValueRef::Blob(_) => Value::Null,
            };
            obj.insert(name.clone(), val);
        }
        Ok(Value::Object(obj))
    })?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

async fn handle_query(
    State(db): State<Db>,
    Json(req): Json<QueryRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let params = req.params.unwrap_or_default();
    let (sql, sql_params) = convert_params(&req.query, &params);

    let conn = db.lock().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, format!("Lock error: {e}"))
    })?;

    let mut stmt = conn.prepare(&sql).map_err(|e| {
        (StatusCode::BAD_REQUEST, format!("SQL error: {e}"))
    })?;

    let rows = rows_to_json(&mut stmt, &sql_params).map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, format!("Query error: {e}"))
    })?;

    Ok(Json(rows))
}

async fn handle_execute(
    State(db): State<Db>,
    Json(req): Json<QueryRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let params = req.params.unwrap_or_default();
    let (sql, sql_params) = convert_params(&req.query, &params);

    let conn = db.lock().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, format!("Lock error: {e}"))
    })?;

    conn.execute(&sql, params_from_iter(sql_params.iter()))
        .map_err(|e| {
            (StatusCode::BAD_REQUEST, format!("Execute error: {e}"))
        })?;

    let last_id = conn.last_insert_rowid();
    let rows_affected = conn.changes() as usize;

    Ok(Json(ExecuteResult {
        last_insert_id: last_id,
        rows_affected,
    }))
}

fn build_insert(table: &str, data: &Map<String, Value>) -> (String, Vec<SqlValue>) {
    let keys: Vec<&String> = data.keys().collect();
    let placeholders: Vec<String> = (1..=keys.len()).map(|i| format!("?{i}")).collect();
    let sql = format!(
        "INSERT INTO {} ({}) VALUES ({})",
        table,
        keys.iter()
            .map(|k| k.as_str())
            .collect::<Vec<_>>()
            .join(", "),
        placeholders.join(", ")
    );
    let params: Vec<SqlValue> = data.values().map(json_to_sql_value).collect();
    (sql, params)
}

fn build_update(table: &str, data: &Map<String, Value>, id: i64) -> (String, Vec<SqlValue>) {
    let entries: Vec<(&String, &Value)> = data
        .iter()
        .filter(|(k, _)| k.as_str() != "id")
        .collect();
    let set_clause: Vec<String> = entries
        .iter()
        .enumerate()
        .map(|(i, (k, _))| format!("{} = ?{}", k, i + 1))
        .collect();
    let sql = format!(
        "UPDATE {} SET {} WHERE id = ?{}",
        table,
        set_clause.join(", "),
        entries.len() + 1
    );
    let mut params: Vec<SqlValue> = entries.iter().map(|(_, v)| json_to_sql_value(v)).collect();
    params.push(SqlValue::Integer(id));
    (sql, params)
}

async fn handle_estimates(
    State(db): State<Db>,
    Json(req): Json<EstimateRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let conn = db.lock().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, format!("Lock error: {e}"))
    })?;

    let tx_result: Result<(), rusqlite::Error> = (|| {
        conn.execute_batch("BEGIN TRANSACTION")?;

        let estimate_id = if let Some(id) = req.estimate_id {
            let (sql, params) = build_update("estimates", &req.estimate, id);
            conn.execute(&sql, params_from_iter(params.iter()))?;
            id
        } else {
            let (sql, params) = build_insert("estimates", &req.estimate);
            conn.execute(&sql, params_from_iter(params.iter()))?;
            conn.last_insert_rowid()
        };

        conn.execute(
            "DELETE FROM estimate_items WHERE estimate_id = ?1",
            [estimate_id],
        )?;

        for item in &req.items {
            let mut item_data = item.clone();
            item_data.remove("total_price");
            item_data.insert(
                "estimate_id".to_string(),
                Value::Number(estimate_id.into()),
            );
            let (sql, params) = build_insert("estimate_items", &item_data);
            conn.execute(&sql, params_from_iter(params.iter()))?;
        }

        conn.execute_batch("COMMIT")?;
        Ok(())
    })();

    match tx_result {
        Ok(()) => Ok(StatusCode::OK),
        Err(e) => {
            let _ = conn.execute_batch("ROLLBACK");
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Transaction error: {e}"),
            ))
        }
    }
}

async fn fallback_index() -> impl IntoResponse {
    Html(include_str!("../../dist/index.html"))
}

pub async fn start(db_path: String, dist_path: String) {
    let conn = Connection::open(&db_path).expect("Failed to open database");
    conn.execute_batch("PRAGMA journal_mode=WAL;")
        .expect("Failed to set WAL mode");
    let db: Db = Arc::new(Mutex::new(conn));

    let api = Router::new()
        .route("/api/debug", get(|| async { Json(cfg!(debug_assertions)) }))
        .route("/api/lan-url", get(|| async {
            let ip = local_ip_address::local_ip()
                .map(|ip| format!("http://{}:3333", ip))
                .unwrap_or_else(|_| "http://localhost:3333".to_string());
            Json(json!({ "url": ip }))
        }))
        .route("/api/query", post(handle_query))
        .route("/api/execute", post(handle_execute))
        .route("/api/estimates", post(handle_estimates))
        .with_state(db)
        .layer(CorsLayer::permissive());

    let serve_dir = tower_http::services::ServeDir::new(&dist_path)
        .fallback(tower::util::service_fn(|_req: axum::http::Request<axum::body::Body>| async {
            Ok::<_, std::convert::Infallible>(fallback_index().await.into_response())
        }));
    let app = api.fallback_service(serve_dir);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3333")
        .await
        .expect("Failed to bind port 3333");

    println!("Server LAN avviato su http://0.0.0.0:3333");

    axum::serve(listener, app).await.ok();
}
