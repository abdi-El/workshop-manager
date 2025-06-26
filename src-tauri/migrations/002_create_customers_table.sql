CREATE TABLE
    customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        address VARCHAR(255),
        phone VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(100),
        workshop_id INTEGER NOT NULL,
        FOREIGN KEY (workshop_id) REFERENCES workshops (id) ON DELETE CASCADE
    );