CREATE TABLE
    appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workshop_id INTEGER NOT NULL,
        estimate_id INTEGER NULL,
        customer_id INTEGER NULL,
        car_id INTEGER NULL,
        date TEXT NOT NULL CHECK (date GLOB '??-??-????'),
        from_time TEXT NOT NULL CHECK (from_time GLOB '??:??'),
        to_time TEXT NOT NULL CHECK (to_time GLOB '??:??'),
        FOREIGN KEY (workshop_id) REFERENCES workshops (id) ON DELETE CASCADE,
        FOREIGN KEY (estimate_id) REFERENCES estimates (id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL,
        FOREIGN KEY (car_id) REFERENCES cars (id) ON DELETE SET NULL
    );