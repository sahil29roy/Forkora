CREATE TABLE exams (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE CONSTRAINT chk_exams_code_not_empty CHECK (length(trim(code)) > 0),
    name VARCHAR(255) NOT NULL CONSTRAINT chk_exams_name_not_empty CHECK (length(trim(name)) > 0),
    conducting_body VARCHAR(255) CONSTRAINT chk_exams_conducting_body_not_empty CHECK (conducting_body IS NULL OR length(trim(conducting_body)) > 0),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exams_conducting_body ON exams(conducting_body);
