use axum::{
    extract::{Path, Query, State},
    http::{header, StatusCode},
    response::Response,
    routing::{get, post, put},
    Extension, Json, Router,
};
use include_dir::{include_dir, Dir};
use rusqlite::{params_from_iter, types::Value as SqlValue, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};
use std::sync::{Arc, Mutex};
use tower_http::cors::CorsLayer;

static DIST: Dir = include_dir!("$CARGO_MANIFEST_DIR/../dist");

type SettingsPath = Arc<String>;

type Db = Arc<Mutex<Connection>>;
type ApiResult<T> = Result<T, (StatusCode, String)>;

fn db_err(e: impl std::fmt::Display) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
}

fn lock(db: &Db) -> ApiResult<std::sync::MutexGuard<'_, Connection>> {
    db.lock().map_err(db_err)
}

// --- Helpers ---

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
    params: &[SqlValue],
) -> Result<Vec<Value>, rusqlite::Error> {
    let column_names: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();
    let rows = stmt.query_map(params_from_iter(params.iter()), |row| {
        let mut obj = Map::new();
        for (i, name) in column_names.iter().enumerate() {
            let val = match row.get_ref(i)? {
                rusqlite::types::ValueRef::Null => Value::Null,
                rusqlite::types::ValueRef::Integer(n) => json!(n),
                rusqlite::types::ValueRef::Real(f) => json!(f),
                rusqlite::types::ValueRef::Text(s) => json!(std::str::from_utf8(s).unwrap_or("")),
                rusqlite::types::ValueRef::Blob(_) => Value::Null,
            };
            obj.insert(name.clone(), val);
        }
        Ok(Value::Object(obj))
    })?;
    rows.collect()
}

fn query_rows(conn: &Connection, sql: &str, params: &[SqlValue]) -> ApiResult<Vec<Value>> {
    let mut stmt = conn.prepare(sql).map_err(db_err)?;
    rows_to_json(&mut stmt, params).map_err(db_err)
}

fn build_insert(table: &str, data: &Map<String, Value>) -> (String, Vec<SqlValue>) {
    let keys: Vec<&String> = data.keys().collect();
    let placeholders: Vec<String> = (1..=keys.len()).map(|i| format!("?{i}")).collect();
    let sql = format!(
        "INSERT INTO {} ({}) VALUES ({})",
        table,
        keys.iter().map(|k| k.as_str()).collect::<Vec<_>>().join(", "),
        placeholders.join(", ")
    );
    let params: Vec<SqlValue> = data.values().map(json_to_sql_value).collect();
    (sql, params)
}

fn build_update(table: &str, data: &Map<String, Value>, id: i64) -> (String, Vec<SqlValue>) {
    let entries: Vec<(&String, &Value)> = data.iter().filter(|(k, _)| k.as_str() != "id").collect();
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

#[derive(Serialize)]
struct ExecuteResult {
    #[serde(rename = "lastInsertId")]
    last_insert_id: i64,
    #[serde(rename = "rowsAffected")]
    rows_affected: usize,
}

// --- Query parameter structs ---

#[derive(Deserialize)]
struct WorkshopFilter {
    workshop_id: Option<i64>,
}

#[derive(Deserialize)]
struct SearchQuery {
    q: String,
    workshop_id: Option<i64>,
}

// --- Shared CRUD primitives ---

fn do_list(conn: &Connection, table: &str) -> ApiResult<Vec<Value>> {
    let sql = format!("SELECT * FROM {} ORDER BY id DESC", table);
    query_rows(conn, &sql, &[])
}

fn do_get(conn: &Connection, table: &str, id: i64) -> ApiResult<Value> {
    let sql = format!("SELECT * FROM {} WHERE id = ?1", table);
    let rows = query_rows(conn, &sql, &[SqlValue::Integer(id)])?;
    Ok(rows.into_iter().next().unwrap_or(Value::Null))
}

fn do_create(conn: &Connection, table: &str, body: &Map<String, Value>) -> ApiResult<ExecuteResult> {
    let (sql, params) = build_insert(table, body);
    conn.execute(&sql, params_from_iter(params.iter())).map_err(db_err)?;
    Ok(ExecuteResult {
        last_insert_id: conn.last_insert_rowid(),
        rows_affected: conn.changes() as usize,
    })
}

fn do_update(conn: &Connection, table: &str, id: i64, body: &Map<String, Value>) -> ApiResult<()> {
    let (sql, params) = build_update(table, body, id);
    conn.execute(&sql, params_from_iter(params.iter())).map_err(db_err)?;
    Ok(())
}

fn do_delete(conn: &Connection, table: &str, id: i64) -> ApiResult<()> {
    let sql = format!("DELETE FROM {} WHERE id = ?1", table);
    conn.execute(&sql, [id]).map_err(db_err)?;
    Ok(())
}

macro_rules! crud_handlers {
    ($module:ident, $table:literal) => {
        #[allow(dead_code)]
        mod $module {
            use super::*;
            pub async fn list(State(db): State<Db>) -> ApiResult<Json<Vec<Value>>> {
                Ok(Json(do_list(&*lock(&db)?, $table)?))
            }
            pub async fn get(State(db): State<Db>, Path(id): Path<i64>) -> ApiResult<Json<Value>> {
                Ok(Json(do_get(&*lock(&db)?, $table, id)?))
            }
            pub async fn create(
                State(db): State<Db>,
                Json(body): Json<Map<String, Value>>,
            ) -> ApiResult<Json<ExecuteResult>> {
                Ok(Json(do_create(&*lock(&db)?, $table, &body)?))
            }
            pub async fn update(
                State(db): State<Db>,
                Path(id): Path<i64>,
                Json(body): Json<Map<String, Value>>,
            ) -> ApiResult<StatusCode> {
                do_update(&*lock(&db)?, $table, id, &body)?;
                Ok(StatusCode::OK)
            }
            pub async fn delete(State(db): State<Db>, Path(id): Path<i64>) -> ApiResult<StatusCode> {
                do_delete(&*lock(&db)?, $table, id)?;
                Ok(StatusCode::OK)
            }
        }
    };
}

crud_handlers!(customers, "customers");
crud_handlers!(workshops, "workshops");
crud_handlers!(makers, "makers");
crud_handlers!(models, "models");
crud_handlers!(appointments, "appointments");
crud_handlers!(default_estimate_items, "default_estimate_items");

// --- Workshop-scoped list handlers ---

const CUSTOMERS_BASE_QUERY: &str = "SELECT customers.*, \
    COALESCE(ec.estimate_count, 0) as estimate_count \
    FROM customers \
    LEFT JOIN (SELECT customer_id, COUNT(*) as estimate_count FROM estimates GROUP BY customer_id) ec \
    ON customers.id = ec.customer_id";

async fn list_customers(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    if let Some(wid) = f.workshop_id {
        Ok(Json(query_rows(&conn,
            &format!("{CUSTOMERS_BASE_QUERY} WHERE customers.workshop_id = ?1 ORDER BY customers.id DESC"),
            &[SqlValue::Integer(wid)])?))
    } else {
        Ok(Json(query_rows(&conn,
            &format!("{CUSTOMERS_BASE_QUERY} ORDER BY customers.id DESC"),
            &[])?))
    }
}

// --- Cars (with JOINs) ---

async fn create_car(
    State(db): State<Db>,
    Json(body): Json<Map<String, Value>>,
) -> ApiResult<Json<ExecuteResult>> {
    Ok(Json(do_create(&*lock(&db)?, "cars", &body)?))
}

async fn update_car(
    State(db): State<Db>,
    Path(id): Path<i64>,
    Json(body): Json<Map<String, Value>>,
) -> ApiResult<StatusCode> {
    do_update(&*lock(&db)?, "cars", id, &body)?;
    Ok(StatusCode::OK)
}

async fn delete_car(State(db): State<Db>, Path(id): Path<i64>) -> ApiResult<StatusCode> {
    do_delete(&*lock(&db)?, "cars", id)?;
    Ok(StatusCode::OK)
}

async fn delete_estimate(State(db): State<Db>, Path(id): Path<i64>) -> ApiResult<StatusCode> {
    do_delete(&*lock(&db)?, "estimates", id)?;
    Ok(StatusCode::OK)
}

const CARS_BASE_QUERY: &str = "SELECT cars.id as car_id,
    cars.model_id, cars.maker_id, cars.*,
    model.id as model_id, model.name as model_name,
    maker.id as maker_id, maker.name as maker_name,
    CONCAT(maker.name, ' ', model.name, ' ', number_plate, ' (', year, ')') as car_info
    FROM cars
    LEFT JOIN models as model ON cars.model_id = model.id
    LEFT JOIN makers as maker ON cars.maker_id = maker.id";

async fn list_cars(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    if let Some(wid) = f.workshop_id {
        let sql = format!("{CARS_BASE_QUERY} WHERE cars.workshop_id = ?1 ORDER BY cars.id DESC");
        Ok(Json(query_rows(&conn, &sql, &[SqlValue::Integer(wid)])?))
    } else {
        let sql = format!("{CARS_BASE_QUERY} ORDER BY cars.id DESC");
        Ok(Json(query_rows(&conn, &sql, &[])?))
    }
}

async fn get_customer_cars(
    State(db): State<Db>,
    Path(customer_id): Path<i64>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let sql = "SELECT cars.*, model.name as model_name, maker.name as maker_name
        FROM cars
        LEFT JOIN models as model ON cars.model_id = model.id
        LEFT JOIN makers as maker ON cars.maker_id = maker.id
        WHERE cars.customer_id = ?1
        ORDER BY cars.id DESC";
    Ok(Json(query_rows(&conn, sql, &[SqlValue::Integer(customer_id)])?))
}

async fn get_car_history(
    State(db): State<Db>,
    Path(car_id): Path<i64>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let sql = "SELECT
        e.id, e.date, e.labor_hours, e.labor_hourly_cost,
        e.discount, e.car_kms, e.notes,
        ROUND(
            (e.labor_hours * e.labor_hourly_cost) +
            COALESCE(ei.items_total, 0) - COALESCE(e.discount, 0),
        2) as total,
        ei.items_descriptions
        FROM estimates e
        LEFT JOIN (
            SELECT estimate_id,
                SUM(quantity * unit_price) as items_total,
                GROUP_CONCAT(quantity || '× ' || description, ' · ') as items_descriptions
            FROM estimate_items GROUP BY estimate_id
        ) ei ON e.id = ei.estimate_id
        WHERE e.car_id = ?1
        ORDER BY DATE(
            SUBSTR(e.date, 7, 4) || '-' ||
            SUBSTR(e.date, 4, 2) || '-' ||
            SUBSTR(e.date, 1, 2)
        ) DESC";
    Ok(Json(query_rows(&conn, sql, &[SqlValue::Integer(car_id)])?))
}

// --- Estimates (with JOINs) ---

const ESTIMATES_BASE_QUERY: &str = "SELECT
    estimates.id as estimate_id, estimates.car_id, estimates.customer_id,
    estimates.workshop_id, estimates.*,
    car.id as car_id, car.number_plate as car_number_plate,
    customer.id as customer_id, customer.name as customer_name,
    workshop.id as workshop_id, workshop.name as workshop_name,
    appointment.id as appointment_id, appointment.estimate_id,
    maker.name as maker_name,
    CONCAT(estimates.date, ' ', car.number_plate, ' ', customer.name) as estimate_info,
    ROUND(
        (estimates.labor_hours * estimates.labor_hourly_cost) +
        COALESCE(ei.items_total, 0) - COALESCE(estimates.discount, 0),
    2) as total
    FROM estimates
    LEFT JOIN cars as car ON estimates.car_id = car.id
    LEFT JOIN customers as customer ON estimates.customer_id = customer.id
    LEFT JOIN workshops as workshop ON estimates.workshop_id = workshop.id
    LEFT JOIN appointments as appointment ON appointment.estimate_id = estimates.id
    LEFT JOIN makers as maker ON car.maker_id = maker.id
    LEFT JOIN (
        SELECT estimate_id, SUM(quantity * unit_price) as items_total
        FROM estimate_items GROUP BY estimate_id
    ) ei ON estimates.id = ei.estimate_id";

async fn list_estimates(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    if let Some(wid) = f.workshop_id {
        let sql = format!("{ESTIMATES_BASE_QUERY} WHERE estimates.workshop_id = ?1 ORDER BY estimates.id DESC");
        Ok(Json(query_rows(&conn, &sql, &[SqlValue::Integer(wid)])?))
    } else {
        let sql = format!("{ESTIMATES_BASE_QUERY} ORDER BY estimates.id DESC");
        Ok(Json(query_rows(&conn, &sql, &[])?))
    }
}

async fn get_estimate(
    State(db): State<Db>,
    Path(id): Path<i64>,
) -> ApiResult<Json<Value>> {
    let conn = lock(&db)?;
    let sql = format!("{ESTIMATES_BASE_QUERY} WHERE estimates.id = ?1");
    let rows = query_rows(&conn, &sql, &[SqlValue::Integer(id)])?;
    Ok(Json(rows.into_iter().next().unwrap_or(Value::Null)))
}

async fn get_estimate_items(
    State(db): State<Db>,
    Path(estimate_id): Path<i64>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let sql = "SELECT *, quantity * unit_price AS total_price FROM estimate_items WHERE estimate_id = ?1";
    Ok(Json(query_rows(&conn, sql, &[SqlValue::Integer(estimate_id)])?))
}

async fn get_estimate_pdf_data(
    State(db): State<Db>,
    Path(estimate_id): Path<i64>,
) -> ApiResult<Json<Value>> {
    let conn = lock(&db)?;

    let estimate_sql = format!("{ESTIMATES_BASE_QUERY} WHERE estimates.id = ?1");
    let estimates = query_rows(&conn, &estimate_sql, &[SqlValue::Integer(estimate_id)])?;
    let Some(mut estimate) = estimates.into_iter().next() else {
        return Ok(Json(Value::Null));
    };

    if let Some(iva) = estimate.get("has_iva") {
        let bool_val = iva.as_str().map(|s| s == "true").unwrap_or(false);
        estimate.as_object_mut().unwrap().insert("has_iva".into(), json!(bool_val));
    }

    let car_id = estimate.get("car_id").and_then(|v| v.as_i64()).unwrap_or(0);
    let customer_id = estimate.get("customer_id").and_then(|v| v.as_i64()).unwrap_or(0);
    let workshop_id = estimate.get("workshop_id").and_then(|v| v.as_i64()).unwrap_or(0);

    let car_sql = format!("{CARS_BASE_QUERY} WHERE cars.id = ?1");
    let cars = query_rows(&conn, &car_sql, &[SqlValue::Integer(car_id)])?;
    let customers = query_rows(&conn, "SELECT * FROM customers WHERE id = ?1", &[SqlValue::Integer(customer_id)])?;
    let workshops = query_rows(&conn, "SELECT * FROM workshops WHERE id = ?1", &[SqlValue::Integer(workshop_id)])?;

    let car = cars.into_iter().next();
    let customer = customers.into_iter().next();
    let workshop = workshops.into_iter().next();

    if car.is_none() || customer.is_none() || workshop.is_none() {
        return Ok(Json(Value::Null));
    }

    Ok(Json(json!({
        "estimate": estimate,
        "car": car,
        "customer": customer,
        "workshop": workshop,
    })))
}

#[derive(Deserialize)]
struct EstimatePayload {
    estimate: Map<String, Value>,
    items: Vec<Map<String, Value>>,
}

fn persist_estimate(
    conn: &Connection,
    estimate: &Map<String, Value>,
    items: &[Map<String, Value>],
    existing_id: Option<i64>,
) -> ApiResult<i64> {
    let tx_result: Result<i64, rusqlite::Error> = (|| {
        conn.execute_batch("BEGIN TRANSACTION")?;

        let estimate_id = if let Some(id) = existing_id {
            let (sql, params) = build_update("estimates", estimate, id);
            conn.execute(&sql, params_from_iter(params.iter()))?;
            id
        } else {
            let (sql, params) = build_insert("estimates", estimate);
            conn.execute(&sql, params_from_iter(params.iter()))?;
            conn.last_insert_rowid()
        };

        conn.execute("DELETE FROM estimate_items WHERE estimate_id = ?1", [estimate_id])?;

        for item in items {
            let mut item_data = item.clone();
            item_data.remove("total_price");
            item_data.insert("estimate_id".to_string(), Value::Number(estimate_id.into()));
            let (sql, params) = build_insert("estimate_items", &item_data);
            conn.execute(&sql, params_from_iter(params.iter()))?;
        }

        conn.execute_batch("COMMIT")?;
        Ok(estimate_id)
    })();

    tx_result.map_err(|e| {
        let _ = conn.execute_batch("ROLLBACK");
        db_err(e)
    })
}

async fn create_estimate(
    State(db): State<Db>,
    Json(payload): Json<EstimatePayload>,
) -> ApiResult<Json<ExecuteResult>> {
    let conn = lock(&db)?;
    let id = persist_estimate(&conn, &payload.estimate, &payload.items, None)?;
    Ok(Json(ExecuteResult { last_insert_id: id, rows_affected: 1 }))
}

async fn update_estimate(
    State(db): State<Db>,
    Path(id): Path<i64>,
    Json(payload): Json<EstimatePayload>,
) -> ApiResult<StatusCode> {
    let conn = lock(&db)?;
    persist_estimate(&conn, &payload.estimate, &payload.items, Some(id))?;
    Ok(StatusCode::OK)
}

// --- Planner ---

async fn get_planner_events(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let (where_clause, params) = if let Some(wid) = f.workshop_id {
        ("WHERE a.workshop_id = ?1", vec![SqlValue::Integer(wid)])
    } else {
        ("", vec![])
    };
    let sql = format!("SELECT
        a.id as id, a.workshop_id, a.date, a.from_time, a.to_time,
        c.name as customer_name, c.phone as customer_phone,
        CONCAT(maker.name, ' ', model.name, ' (', car.year, ')') as car_info,
        car.number_plate,
        CASE WHEN a.estimate_id IS NOT NULL THEN 1 ELSE 0 END as estimate_status
        FROM appointments a
        LEFT JOIN estimates e ON a.estimate_id = e.id
        LEFT JOIN customers c ON COALESCE(e.customer_id, a.customer_id) = c.id
        LEFT JOIN cars car ON COALESCE(e.car_id, a.car_id) = car.id
        LEFT JOIN makers maker ON car.maker_id = maker.id
        LEFT JOIN models model ON car.model_id = model.id
        {where_clause}
        ORDER BY a.date DESC, a.from_time");
    Ok(Json(query_rows(&conn, &sql, &params)?))
}

// --- Inspections ---

async fn get_upcoming_inspections(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let (extra_where, params) = if let Some(wid) = f.workshop_id {
        ("AND c.workshop_id = ?1", vec![SqlValue::Integer(wid)])
    } else {
        ("", vec![])
    };
    let sql = format!("SELECT
        c.id as car_id, c.year, c.last_inspection_date,
        c.customer_id, cust.name as customer_name, cust.phone as customer_phone,
        ma.name as maker_name, md.name as model_name
        FROM cars c
        JOIN customers cust ON c.customer_id = cust.id
        JOIN makers ma ON c.maker_id = ma.id
        JOIN models md ON c.model_id = md.id
        WHERE c.last_inspection_date IS NOT NULL
        {extra_where}
        AND (
            DATE(
                SUBSTR(c.last_inspection_date, 7, 4) || '-' ||
                SUBSTR(c.last_inspection_date, 4, 2) || '-' ||
                SUBSTR(c.last_inspection_date, 1, 2),
                CASE
                    WHEN c.last_inspection_date = c.year THEN '+4 years'
                    ELSE '+2 years'
                END
            )
        ) <= DATE('now', '+30 days') ORDER BY c.last_inspection_date ASC");
    Ok(Json(query_rows(&conn, &sql, &params)?))
}

// --- Default Estimate Items ---

async fn search_default_estimate_items(
    State(db): State<Db>,
    Query(params): Query<SearchQuery>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let sql = "SELECT * FROM default_estimate_items
        WHERE LOWER(description) LIKE '%' || LOWER(?1) || '%'
        ORDER BY description ASC";
    Ok(Json(query_rows(&conn, sql, &[SqlValue::Text(params.q)])?))
}

// --- Dashboard ---

async fn dashboard_averages(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let (where_clause, params) = if let Some(wid) = f.workshop_id {
        ("WHERE e.workshop_id = ?1", vec![SqlValue::Integer(wid)])
    } else {
        ("", vec![])
    };
    let sql = format!("SELECT
        COUNT(*) as total_estimates,
        AVG(e.labor_hours) as avg_labor_hours,
        AVG(e.labor_hourly_cost) as avg_hourly_cost,
        AVG(COALESCE(e.discount, 0)) as avg_discount,
        AVG(COALESCE(ei.items_total, 0)) as avg_parts_cost,
        AVG(
            (e.labor_hours * e.labor_hourly_cost) +
            COALESCE(ei.items_total, 0) - COALESCE(e.discount, 0)
        ) as avg_total_estimate_value
        FROM estimates e
        LEFT JOIN (
            SELECT estimate_id, SUM(quantity * unit_price) as items_total
            FROM estimate_items GROUP BY estimate_id
        ) ei ON e.id = ei.estimate_id
        {where_clause}");
    Ok(Json(query_rows(&conn, &sql, &params)?))
}

async fn dashboard_brands(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let (where_clause, params) = if let Some(wid) = f.workshop_id {
        ("WHERE c.workshop_id = ?1", vec![SqlValue::Integer(wid)])
    } else {
        ("", vec![])
    };
    let sql = format!("SELECT m.name as brand_name, COUNT(c.id) as car_count
        FROM cars c JOIN makers m ON c.maker_id = m.id
        {where_clause}
        GROUP BY m.id, m.name ORDER BY car_count DESC");
    Ok(Json(query_rows(&conn, &sql, &params)?))
}

async fn dashboard_cars_by_year(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let (extra_where, params) = if let Some(wid) = f.workshop_id {
        ("AND workshop_id = ?1", vec![SqlValue::Integer(wid)])
    } else {
        ("", vec![])
    };
    let sql = format!("SELECT year, COUNT(*) as car_count
        FROM cars WHERE year IS NOT NULL {extra_where}
        GROUP BY year ORDER BY year ASC");
    Ok(Json(query_rows(&conn, &sql, &params)?))
}

async fn dashboard_revenue(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let (where_clause, params) = if let Some(wid) = f.workshop_id {
        ("WHERE e.workshop_id = ?1", vec![SqlValue::Integer(wid)])
    } else {
        ("", vec![])
    };
    let sql = format!("SELECT
        SUBSTR(e.date, 7, 4) || '-' || SUBSTR(e.date, 4, 2) as month,
        ROUND(SUM(
            (e.labor_hours * e.labor_hourly_cost) +
            COALESCE(ei.items_total, 0) - COALESCE(e.discount, 0)
        ), 2) as total_revenue
        FROM estimates e
        LEFT JOIN (
            SELECT estimate_id, SUM(quantity * unit_price) as items_total
            FROM estimate_items GROUP BY estimate_id
        ) ei ON e.id = ei.estimate_id
        {where_clause}
        GROUP BY SUBSTR(e.date, 7, 4) || '-' || SUBSTR(e.date, 4, 2)
        ORDER BY month ASC");
    Ok(Json(query_rows(&conn, &sql, &params)?))
}

async fn dashboard_top_customers(
    State(db): State<Db>,
    Query(f): Query<WorkshopFilter>,
) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    let (where_clause, params) = if let Some(wid) = f.workshop_id {
        ("WHERE e.workshop_id = ?1", vec![SqlValue::Integer(wid)])
    } else {
        ("", vec![])
    };
    let sql = format!("SELECT
        c.name as customer_name,
        ROUND(SUM(
            (e.labor_hours * e.labor_hourly_cost) +
            COALESCE(ei.items_total, 0) - COALESCE(e.discount, 0)
        ), 2) as total_revenue,
        COUNT(e.id) as estimate_count
        FROM estimates e
        JOIN customers c ON e.customer_id = c.id
        LEFT JOIN (
            SELECT estimate_id, SUM(quantity * unit_price) as items_total
            FROM estimate_items GROUP BY estimate_id
        ) ei ON e.id = ei.estimate_id
        {where_clause}
        GROUP BY e.customer_id, c.name
        ORDER BY total_revenue DESC LIMIT 10");
    Ok(Json(query_rows(&conn, &sql, &params)?))
}

// --- Search ---

async fn global_search(
    State(db): State<Db>,
    Query(params): Query<SearchQuery>,
) -> ApiResult<Json<Value>> {
    let q = params.q.trim().to_lowercase();
    if q.is_empty() {
        return Ok(Json(json!([])));
    }
    let pattern = SqlValue::Text(format!("%{q}%"));

    let conn = lock(&db)?;

    let (cust_filter, car_filter, est_filter) = if let Some(wid) = params.workshop_id {
        let w = SqlValue::Integer(wid);
        (vec![pattern.clone(), w.clone()], vec![pattern.clone(), w.clone()], vec![pattern.clone(), w])
    } else {
        (vec![pattern.clone()], vec![pattern.clone()], vec![pattern.clone()])
    };

    let wid_cust = if params.workshop_id.is_some() { "AND workshop_id = ?2" } else { "" };
    let wid_car = if params.workshop_id.is_some() { "AND cars.workshop_id = ?2" } else { "" };
    let wid_est = if params.workshop_id.is_some() { "AND e.workshop_id = ?2" } else { "" };

    let customers = query_rows(&conn,
        &format!("SELECT id, name, phone, email FROM customers
        WHERE (LOWER(name) LIKE ?1
            OR LOWER(COALESCE(phone, '')) LIKE ?1
            OR LOWER(COALESCE(email, '')) LIKE ?1
            OR LOWER(COALESCE(address, '')) LIKE ?1)
        {wid_cust}
        ORDER BY id DESC LIMIT 8"),
        &cust_filter)?;

    let cars = query_rows(&conn,
        &format!("SELECT cars.id, cars.number_plate, cars.year,
            maker.name as maker_name, model.name as model_name
        FROM cars
        LEFT JOIN makers as maker ON cars.maker_id = maker.id
        LEFT JOIN models as model ON cars.model_id = model.id
        WHERE (LOWER(cars.number_plate) LIKE ?1
            OR LOWER(COALESCE(maker.name, '')) LIKE ?1
            OR LOWER(COALESCE(model.name, '')) LIKE ?1)
        {wid_car}
        ORDER BY cars.id DESC LIMIT 8"),
        &car_filter)?;

    let estimates = query_rows(&conn,
        &format!("SELECT e.id, e.date, car.number_plate, customer.name as customer_name
        FROM estimates e
        LEFT JOIN cars as car ON e.car_id = car.id
        LEFT JOIN customers as customer ON e.customer_id = customer.id
        WHERE (LOWER(COALESCE(customer.name, '')) LIKE ?1
            OR LOWER(COALESCE(car.number_plate, '')) LIKE ?1
            OR e.date LIKE ?1)
        {wid_est}
        ORDER BY e.id DESC LIMIT 8"),
        &est_filter)?;

    let mut results: Vec<Value> = Vec::new();

    for c in customers {
        let name = c.get("name").and_then(|v| v.as_str()).unwrap_or("");
        let phone = c.get("phone").and_then(|v| v.as_str()).unwrap_or("");
        let email = c.get("email").and_then(|v| v.as_str()).unwrap_or("");
        let subtitle_parts: Vec<&str> = [phone, email].into_iter().filter(|s| !s.is_empty()).collect();
        results.push(json!({
            "type": "customer",
            "id": c.get("id"),
            "title": name,
            "subtitle": subtitle_parts.join(" · "),
            "page": "customers",
            "phone": phone,
        }));
    }

    for c in cars {
        let plate = c.get("number_plate").and_then(|v| v.as_str()).unwrap_or("");
        let maker = c.get("maker_name").and_then(|v| v.as_str()).unwrap_or("");
        let model = c.get("model_name").and_then(|v| v.as_str()).unwrap_or("");
        let year = c.get("year").and_then(|v| v.as_i64()).map(|y| y.to_string()).unwrap_or_default();
        let parts: Vec<&str> = [maker, model].into_iter().filter(|s| !s.is_empty()).collect();
        let mut subtitle = parts.join(" ");
        if !year.is_empty() { subtitle = format!("{subtitle} {year}"); }
        results.push(json!({
            "type": "car",
            "id": c.get("id"),
            "title": plate,
            "subtitle": subtitle.trim(),
            "page": "cars",
        }));
    }

    for e in estimates {
        let date = e.get("date").and_then(|v| v.as_str()).unwrap_or("");
        let plate = e.get("number_plate").and_then(|v| v.as_str()).unwrap_or("");
        let customer = e.get("customer_name").and_then(|v| v.as_str()).unwrap_or("");
        let title_parts: Vec<&str> = [date, plate].into_iter().filter(|s| !s.is_empty()).collect();
        results.push(json!({
            "type": "estimate",
            "id": e.get("id"),
            "title": title_parts.join(" · "),
            "subtitle": customer,
            "page": "estimates",
        }));
    }

    Ok(Json(json!(results)))
}

// --- Makers count ---

async fn makers_count(State(db): State<Db>) -> ApiResult<Json<Vec<Value>>> {
    let conn = lock(&db)?;
    Ok(Json(query_rows(&conn, "SELECT COUNT(*) as count FROM makers", &[])?))
}

// --- Settings (JSON file) ---

fn read_settings_file(path: &str) -> ApiResult<Map<String, Value>> {
    match std::fs::read_to_string(path) {
        Ok(content) => serde_json::from_str(&content).map_err(db_err),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            let defaults = Map::new();
            write_settings_file(path, &defaults)?;
            Ok(defaults)
        }
        Err(e) => Err(db_err(e)),
    }
}

fn write_settings_file(path: &str, data: &Map<String, Value>) -> ApiResult<()> {
    let json = serde_json::to_string_pretty(data).map_err(db_err)?;
    std::fs::write(path, json).map_err(db_err)
}

async fn get_setting(
    Extension(path): Extension<SettingsPath>,
    Path(key): Path<String>,
) -> ApiResult<Json<Value>> {
    let data = read_settings_file(&path)?;
    Ok(Json(data.get(&key).cloned().unwrap_or(Value::Object(Map::new()))))
}

async fn put_setting(
    Extension(path): Extension<SettingsPath>,
    Path(key): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<StatusCode> {
    let mut data = read_settings_file(&path)?;
    if let (Some(existing), Some(incoming)) = (
        data.get(&key).and_then(|v| v.as_object()),
        body.as_object(),
    ) {
        let mut merged = existing.clone();
        for (k, v) in incoming {
            merged.insert(k.clone(), v.clone());
        }
        data.insert(key, Value::Object(merged));
    } else {
        data.insert(key, body);
    }
    write_settings_file(&path, &data)?;
    Ok(StatusCode::OK)
}

async fn delete_setting(
    Extension(path): Extension<SettingsPath>,
    Path(key): Path<String>,
) -> ApiResult<StatusCode> {
    let mut data = read_settings_file(&path)?;
    data.remove(&key);
    write_settings_file(&path, &data)?;
    Ok(StatusCode::OK)
}

// --- Static files (embedded) ---

fn mime_from_path(path: &str) -> &'static str {
    match path.rsplit('.').next().unwrap_or("") {
        "html" => "text/html; charset=utf-8",
        "js" => "application/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" => "application/json",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "ico" => "image/x-icon",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "webmanifest" => "application/manifest+json",
        _ => "application/octet-stream",
    }
}

async fn serve_embedded(req: axum::extract::Request) -> Response {
    let path = req.uri().path().trim_start_matches('/');
    if let Some(file) = DIST.get_file(path) {
        Response::builder()
            .header(header::CONTENT_TYPE, mime_from_path(path))
            .body(axum::body::Body::from(file.contents().to_vec()))
            .unwrap()
    } else {
        let index = DIST.get_file("index.html").expect("index.html missing from dist");
        Response::builder()
            .header(header::CONTENT_TYPE, "text/html; charset=utf-8")
            .body(axum::body::Body::from(index.contents().to_vec()))
            .unwrap()
    }
}

// --- Router ---

pub async fn start(db_path: String) {
    let conn = Connection::open(&db_path).expect("Failed to open database");
    conn.execute_batch("PRAGMA journal_mode=WAL;").expect("Failed to set WAL mode");
    conn.busy_timeout(std::time::Duration::from_secs(5)).expect("Failed to set busy timeout");
    let db: Db = Arc::new(Mutex::new(conn));

    let settings_path: SettingsPath = Arc::new(
        std::path::Path::new(&db_path)
            .parent()
            .unwrap_or(std::path::Path::new("."))
            .join("settings.json")
            .to_string_lossy()
            .to_string(),
    );

    let api = Router::new()
        // Utility
        .route("/api/debug", get(|| async { Json(cfg!(debug_assertions)) }))
        .route("/api/lan-url", get(|| async {
            let ip = local_ip_address::local_ip()
                .map(|ip| format!("http://{}:3333", ip))
                .unwrap_or_else(|_| "http://localhost:3333".to_string());
            Json(json!({ "url": ip }))
        }))
        // Customers (scoped list, generic CRUD)
        .route("/api/customers", get(list_customers).post(customers::create))
        .route("/api/customers/{id}", get(customers::get).put(customers::update).delete(customers::delete))
        .route("/api/customers/{id}/cars", get(get_customer_cars))
        // Workshops
        .route("/api/workshops", get(workshops::list).post(workshops::create))
        .route("/api/workshops/{id}", get(workshops::get).put(workshops::update).delete(workshops::delete))
        // Makers
        .route("/api/makers", get(makers::list).post(makers::create))
        .route("/api/makers/count", get(makers_count))
        .route("/api/makers/{id}", get(makers::get).put(makers::update).delete(makers::delete))
        // Models
        .route("/api/models", get(models::list).post(models::create))
        .route("/api/models/{id}", get(models::get).put(models::update).delete(models::delete))
        // Cars (scoped list with JOINs, dedicated write handlers)
        .route("/api/cars", get(list_cars).post(create_car))
        .route("/api/cars/{id}", put(update_car).delete(delete_car))
        .route("/api/cars/{id}/history", get(get_car_history))
        // Estimates (scoped list with JOINs; create/update are transactional)
        .route("/api/estimates", get(list_estimates).post(create_estimate))
        .route("/api/estimates/{id}", get(get_estimate).put(update_estimate).delete(delete_estimate))
        .route("/api/estimates/{id}/items", get(get_estimate_items))
        .route("/api/estimates/{id}/pdf-data", get(get_estimate_pdf_data))
        // Appointments
        .route("/api/appointments", post(appointments::create))
        .route("/api/appointments/{id}", get(appointments::get).put(appointments::update).delete(appointments::delete))
        // Default estimate items
        .route("/api/default-estimate-items/search", get(search_default_estimate_items))
        .route("/api/default_estimate_items", get(default_estimate_items::list).post(default_estimate_items::create))
        .route("/api/default_estimate_items/{id}", get(default_estimate_items::get).put(default_estimate_items::update).delete(default_estimate_items::delete))
        // Planner / inspections / search (all scoped)
        .route("/api/planner/events", get(get_planner_events))
        .route("/api/inspections/upcoming", get(get_upcoming_inspections))
        .route("/api/search", get(global_search))
        // Dashboard (all scoped)
        .route("/api/dashboard/averages", get(dashboard_averages))
        .route("/api/dashboard/brands", get(dashboard_brands))
        .route("/api/dashboard/cars-by-year", get(dashboard_cars_by_year))
        .route("/api/dashboard/revenue", get(dashboard_revenue))
        .route("/api/dashboard/top-customers", get(dashboard_top_customers))
        // Settings (JSON file)
        .route("/api/settings/{key}", get(get_setting).put(put_setting).delete(delete_setting))
        .with_state(db)
        .layer(Extension(settings_path))
        .layer(CorsLayer::permissive())
        .fallback(get(serve_embedded));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3333")
        .await
        .expect("Failed to bind port 3333");

    println!("Server LAN avviato su http://0.0.0.0:3333");

    axum::serve(listener, api.into_make_service()).await.ok();
}
