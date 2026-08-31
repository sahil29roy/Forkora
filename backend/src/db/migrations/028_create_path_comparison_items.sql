CREATE TABLE path_comparison_items (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    comparison_id INTEGER NOT NULL REFERENCES path_comparisons(id) ON DELETE CASCADE,
    saved_path_id INTEGER NOT NULL REFERENCES saved_paths(id) ON DELETE CASCADE,
    position SMALLINT NOT NULL CONSTRAINT chk_path_comparison_items_pos CHECK (position >= 0),
    CONSTRAINT unique_comparison_path UNIQUE (comparison_id, saved_path_id),
    CONSTRAINT unique_comparison_position UNIQUE (comparison_id, position)
);

CREATE INDEX idx_path_comparison_items_path ON path_comparison_items(saved_path_id);
