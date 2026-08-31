CREATE TABLE node_exam_requirements (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    node_id INTEGER NOT NULL REFERENCES path_nodes(id) ON DELETE CASCADE,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT unique_node_exam UNIQUE (node_id, exam_id)
);

CREATE INDEX idx_node_exam_reqs_exam ON node_exam_requirements(exam_id);
