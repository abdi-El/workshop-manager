use tauri_plugin_sql::{Migration, MigrationKind};
mod commands;


#[tauri::command]
fn is_debug() -> bool {
  return tauri::is_dev();
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../migrations/001_create_initial_table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_customers_table",
            sql: include_str!("../migrations/002_create_customers_table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_makers_and_models_table",
            sql: include_str!("../migrations/003_create_makers_and_models_tables.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create_cars_table",
            sql: include_str!("../migrations/004_create_cars_table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create_estiamtes_table",
            sql: include_str!("../migrations/005_create_estiamtes_tables.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create_appointments_table",
            sql: include_str!("../migrations/006_create_appointments_table.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "add_last_inspection_date_to_cars",
            sql: include_str!("../migrations/007_add_last_inspecion_date.sql"),
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_sql::Builder::new()
                .add_migrations("sqlite:estimates.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![commands::fetch, is_debug])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
