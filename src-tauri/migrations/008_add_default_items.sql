CREATE TABLE
    default_estimate_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        quantity INTEGER,
        unit_price REAL NOT NULL CHECK (unit_price >= 0)
    );