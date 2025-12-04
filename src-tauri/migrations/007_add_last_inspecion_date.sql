ALTER TABLE cars
ADD COLUMN last_inspection_date TEXT CHECK (last_inspection_date GLOB '??-??-????') default NULL;