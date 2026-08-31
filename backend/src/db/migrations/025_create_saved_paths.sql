CREATE TABLE saved_paths (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL CONSTRAINT chk_saved_paths_title_not_empty CHECK (length(trim(title)) > 0),
    root_node_id INTEGER NOT NULL REFERENCES path_nodes(id) ON DELETE CASCADE,
    assessment_id INTEGER REFERENCES assessments(id) ON DELETE SET NULL,
    notes TEXT,
    is_shared BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_paths_user_updated ON saved_paths(user_id, updated_at);
CREATE INDEX idx_saved_paths_root ON saved_paths(root_node_id);
CREATE INDEX idx_saved_paths_assessment ON saved_paths(assessment_id);

CREATE TRIGGER trg_saved_paths_updated_at
BEFORE UPDATE ON saved_paths
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
