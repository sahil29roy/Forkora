CREATE TABLE subjects (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE CONSTRAINT chk_subjects_code_not_empty CHECK (length(trim(code)) > 0),
    name VARCHAR(255) NOT NULL CONSTRAINT chk_subjects_name_not_empty CHECK (length(trim(name)) > 0)
);
