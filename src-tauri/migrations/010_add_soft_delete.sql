ALTER TABLE customers ADD COLUMN deleted_at TEXT;
ALTER TABLE cars ADD COLUMN deleted_at TEXT;
ALTER TABLE estimates ADD COLUMN deleted_at TEXT;
ALTER TABLE appointments ADD COLUMN deleted_at TEXT;
