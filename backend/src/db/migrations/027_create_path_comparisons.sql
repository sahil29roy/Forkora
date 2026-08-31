CREATE TABLE path_comparisons (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) CONSTRAINT chk_path_comparisons_title_not_empty CHECK (title IS NULL OR length(trim(title)) > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_path_comparisons_user_created ON path_comparisons(user_id, created_at);
