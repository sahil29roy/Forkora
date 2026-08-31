CREATE TABLE question_options (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL CONSTRAINT chk_question_options_label_not_empty CHECK (length(trim(label)) > 0),
    value INTEGER,
    order_index SMALLINT NOT NULL CONSTRAINT chk_question_options_order_index CHECK (order_index >= 0),
    CONSTRAINT unique_question_option_order UNIQUE (question_id, order_index)
);

CREATE INDEX idx_question_options_q_order ON question_options(question_id, order_index);
