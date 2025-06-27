CREATE TABLE
    makers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE
    );

CREATE TABLE
    models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        maker_id INTEGER NOT NULL,
        FOREIGN KEY (maker_id) REFERENCES makers (id) ON DELETE CASCADE,
        UNIQUE (name, maker_id)
    );