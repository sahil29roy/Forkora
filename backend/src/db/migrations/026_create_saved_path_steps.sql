CREATE TABLE saved_path_steps (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    saved_path_id INTEGER NOT NULL REFERENCES saved_paths(id) ON DELETE CASCADE,
    step_order SMALLINT NOT NULL CONSTRAINT chk_saved_path_steps_order CHECK (step_order >= 0),
    node_id INTEGER NOT NULL REFERENCES path_nodes(id) ON DELETE CASCADE,
    edge_id INTEGER REFERENCES path_edges(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_path_step_order UNIQUE (saved_path_id, step_order)
);

CREATE INDEX idx_saved_path_steps_path ON saved_path_steps(saved_path_id);
CREATE INDEX idx_saved_path_steps_node ON saved_path_steps(node_id);
CREATE INDEX idx_saved_path_steps_edge ON saved_path_steps(edge_id);
