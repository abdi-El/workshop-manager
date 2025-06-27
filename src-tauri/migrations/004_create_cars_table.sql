CREATE TABLE
    cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        workshop_id INTEGER NOT NULL,
        maker_id INTEGER NULL,
        model_id INTEGER NULL,
        year INTEGER NOT NULL CHECK (year > 1885),
        number_plate VARCHAR(20) NOT NULL UNIQUE,
        FOREIGN KEY (workshop_id) REFERENCES workshops (id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
        FOREIGN KEY (maker_id) REFERENCES makers (id) ON DELETE SET NULL,
        FOREIGN KEY (model_id) REFERENCES models (id) ON DELETE SET NULL
    );