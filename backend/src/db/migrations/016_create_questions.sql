CREATE TABLE questions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    questionnaire_id INTEGER NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
    text TEXT NOT NULL CONSTRAINT chk_questions_text_not_empty CHECK (length(trim(text)) > 0),
    dimension assessment_dimension NOT NULL,
    type question_type NOT NULL,
    order_index SMALLINT NOT NULL CONSTRAINT chk_questions_order_index CHECK (order_index >= 0),
    CONSTRAINT unique_questionnaire_order UNIQUE (questionnaire_id, order_index)
);

CREATE INDEX idx_questions_q_order ON questions(questionnaire_id, order_index);
