CREATE TABLE node_subjects (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    node_id INTEGER NOT NULL REFERENCES path_nodes(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    is_prerequisite BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT unique_node_subject UNIQUE (node_id, subject_id)
);

CREATE INDEX idx_node_subjects_subject ON node_subjects(subject_id);
