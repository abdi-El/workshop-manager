use tauri_plugin_sql::{Migration, MigrationKind};
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "CREATE TABLE IF NOT EXISTS workshops (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    address TEXT NOT NULL,
                    vat_number TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    email TEXT NOT NULL,
                    base_labor_cost DECIMAL(10, 2) NOT NULL
                    );",
        kind: MigrationKind::Up,
    }, Migration {
        version: 2,
        description: "create_customers_table",
        sql: "CREATE TABLE customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                address VARCHAR(255),
                phone VARCHAR(20) NOT NULL UNIQUE,
                email VARCHAR(100),
                workshop_id INTEGER NOT NULL,
                FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE
                );",
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:estimates.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::fetch])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
