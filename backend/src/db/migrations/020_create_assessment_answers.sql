CREATE TABLE assessment_answers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_id INTEGER REFERENCES question_options(id) ON DELETE SET NULL,
    numeric_value INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_assessment_question UNIQUE (assessment_id, question_id),
    CONSTRAINT chk_assessment_answers_value_provided CHECK (option_id IS NOT NULL OR numeric_value IS NOT NULL)
);

CREATE INDEX idx_assessment_answers_question ON assessment_answers(question_id);
CREATE INDEX idx_assessment_answers_option ON assessment_answers(option_id);
