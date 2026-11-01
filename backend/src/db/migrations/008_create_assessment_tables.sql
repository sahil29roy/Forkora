-- Migration 008: Create Assessment Module Tables

-- 1. Custom Enum Types
DO $$ BEGIN
    CREATE TYPE assessment_module_type AS ENUM ('ACADEMIC', 'APTITUDE', 'BEHAVIOURAL', 'SITUATIONAL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE assessment_attempt_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE question_source_type AS ENUM ('CURATED', 'LLM');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Assessment Modules Definition Table
CREATE TABLE IF NOT EXISTS assessment_modules (
    id VARCHAR(50) PRIMARY KEY,
    module_type assessment_module_type NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    total_questions SMALLINT NOT NULL,
    estimated_duration_minutes SMALLINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_assessment_modules_updated_at
BEFORE UPDATE ON assessment_modules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed Default Assessment Modules
INSERT INTO assessment_modules (id, module_type, title, description, instructions, total_questions, estimated_duration_minutes)
VALUES
    ('academic', 'ACADEMIC', 'Academic Assessment', 'Evaluates core subject comprehension tailored to your educational stream and subjects.', 'Read each question carefully and select the best answer from the given choices. 10 questions will be presented.', 10, 15),
    ('aptitude', 'APTITUDE', 'Aptitude Assessment', 'Measures logical deduction, numerical reasoning, and problem-solving velocity.', 'Solve each reasoning puzzle and choose the correct answer. You have 10 questions.', 10, 15),
    ('behavioural', 'BEHAVIOURAL', 'Behavioural Assessment', 'Explores learning style, initiative, adaptability, and collaboration preferences.', 'Read each statement carefully and select the option that best describes how you think, feel or behave. 10 statements.', 10, 10),
    ('situational', 'SITUATIONAL', 'Situational Assessment', 'Assesses decision-making, ethical judgment, and practical responses to real-world scenarios.', 'Analyze each scenario and select the course of action you would most likely take. 5 scenario questions.', 5, 10)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    instructions = EXCLUDED.instructions,
    total_questions = EXCLUDED.total_questions,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes;

-- 3. Assessment Questions Master Table
CREATE TABLE IF NOT EXISTS assessment_questions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL REFERENCES assessment_modules(id) ON DELETE CASCADE,
    source question_source_type NOT NULL DEFAULT 'CURATED',
    subject VARCHAR(100),
    topic VARCHAR(150),
    difficulty VARCHAR(50) DEFAULT 'Moderate',
    class_level SMALLINT CONSTRAINT chk_assessment_questions_class CHECK (class_level IS NULL OR (class_level >= 1 AND class_level <= 12)),
    question_text TEXT NOT NULL CONSTRAINT chk_assessment_questions_text CHECK (length(trim(question_text)) > 0),
    correct_answer TEXT,
    scoring_rubric JSONB,
    generation_metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_module ON assessment_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_subject ON assessment_questions(subject);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_class ON assessment_questions(class_level);

CREATE TRIGGER trg_assessment_questions_updated_at
BEFORE UPDATE ON assessment_questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Question Options Table
CREATE TABLE IF NOT EXISTS assessment_question_options (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL CONSTRAINT chk_assessment_options_text CHECK (length(trim(option_text)) > 0),
    option_order SMALLINT NOT NULL DEFAULT 0,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    score_value NUMERIC(5, 2),
    score_metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessment_question_options_qid ON assessment_question_options(question_id);

-- 5. Assessment Attempts Table
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id VARCHAR(50) NOT NULL REFERENCES assessment_modules(id) ON DELETE CASCADE,
    status assessment_attempt_status NOT NULL DEFAULT 'NOT_STARTED',
    attempt_number SMALLINT NOT NULL DEFAULT 1,
    total_questions SMALLINT NOT NULL,
    answered_count SMALLINT NOT NULL DEFAULT 0,
    score NUMERIC(5, 2),
    score_breakdown JSONB,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_module ON assessment_attempts(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON assessment_attempts(status);

CREATE TRIGGER trg_assessment_attempts_updated_at
BEFORE UPDATE ON assessment_attempts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Assigned Questions for Attempt (stores stable randomized order and shuffled options)
CREATE TABLE IF NOT EXISTS assessment_assigned_questions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    display_order SMALLINT NOT NULL,
    assigned_options JSONB NOT NULL,
    is_answered BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_assigned_attempt_question UNIQUE (attempt_id, question_id),
    CONSTRAINT uq_assigned_attempt_display_order UNIQUE (attempt_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_assigned_questions_attempt ON assessment_assigned_questions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assigned_questions_question ON assessment_assigned_questions(question_id);

-- 7. Student Responses Table
CREATE TABLE IF NOT EXISTS assessment_responses (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    assigned_question_id INTEGER NOT NULL REFERENCES assessment_assigned_questions(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    selected_option_id INTEGER REFERENCES assessment_question_options(id) ON DELETE SET NULL,
    selected_option_text TEXT,
    response_value SMALLINT,
    is_correct BOOLEAN,
    score_awarded NUMERIC(5, 2),
    answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_response_attempt_assigned UNIQUE (attempt_id, assigned_question_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_attempt ON assessment_responses(attempt_id);

CREATE TRIGGER trg_assessment_responses_updated_at
BEFORE UPDATE ON assessment_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 8. Assessment Results Table
CREATE TABLE IF NOT EXISTS assessment_results (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    attempt_id INTEGER NOT NULL UNIQUE REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id VARCHAR(50) NOT NULL REFERENCES assessment_modules(id) ON DELETE CASCADE,
    total_questions SMALLINT NOT NULL,
    correct_answers SMALLINT NOT NULL DEFAULT 0,
    score_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    summary JSONB NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessment_results_user ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_module ON assessment_results(module_id);
