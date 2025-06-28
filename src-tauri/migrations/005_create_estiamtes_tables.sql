CREATE TABLE
    estimates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workshop_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        car_id INTEGER NULL,
        date TEXT NOT NULL CHECK (date GLOB '??-??-????'),
        labor_hours INTEGER NOT NULL CHECK (labor_hours >= 0),
        labor_hourly_cost REAL NOT NULL CHECK (labor_hourly_cost >= 0),
        discount REAL NULL CHECK (discount >= 0),
        car_kms INTEGER NOT NULL CHECK (car_kms >= 0),
        has_iva BOOLEAN NOT NULL DEFAULT 0,
        number_plate VARCHAR(20) NOT NULL UNIQUE,
        FOREIGN KEY (workshop_id) REFERENCES workshops (id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
        FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE CASCADE
    );

CREATE TABLE
    estimate_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estimate_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price REAL NOT NULL CHECK (unit_price >= 0),
        FOREIGN KEY (estimate_id) REFERENCES estimates (id) ON DELETE CASCADE
    );