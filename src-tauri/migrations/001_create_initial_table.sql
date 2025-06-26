CREATE TABLE
    IF NOT EXISTS workshops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        vat_number TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        base_labor_cost DECIMAL(10, 2) NOT NULL
    );