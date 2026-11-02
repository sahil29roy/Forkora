-- Migration 009: Create Career Graph, Pathways, Rules, and Preferences Tables

-- 1. Extend student_profiles to persist career preferences, interests, and ML predictions
ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_careers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS work_environment VARCHAR(100) DEFAULT 'No preference',
ADD COLUMN IF NOT EXISTS career_type VARCHAR(100) DEFAULT 'No preference',
ADD COLUMN IF NOT EXISTS preferred_location VARCHAR(100) DEFAULT 'No preference',
ADD COLUMN IF NOT EXISTS ml_predictions JSONB DEFAULT '{}'::jsonb;

-- 2. Custom Enum Types for Career Graph
DO $$ BEGIN
    CREATE TYPE career_node_type AS ENUM ('EDUCATION_LEVEL', 'STREAM', 'EXAM', 'COURSE', 'CAREER', 'SPECIALIZATION');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE career_transition_type AS ENUM ('ACADEMIC', 'EXAM', 'DIRECT', 'LATERAL', 'CAREER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE career_reversibility AS ENUM ('REVERSIBLE', 'PARTIALLY_REVERSIBLE', 'LOCKED_IN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE career_eligibility_status AS ENUM ('ELIGIBLE', 'CONDITIONALLY_ELIGIBLE', 'NOT_ELIGIBLE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Career Graph Nodes Table
CREATE TABLE IF NOT EXISTS career_nodes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    node_type career_node_type NOT NULL,
    education_level VARCHAR(50) NOT NULL, -- CLASS_10, CLASS_12, EXAM, GRADUATION, CAREER
    stream VARCHAR(50) DEFAULT 'ANY',     -- SCIENCE_PCM, SCIENCE_PCB, COMMERCE, HUMANITIES, ANY
    description TEXT NOT NULL,
    typical_duration_months INTEGER NOT NULL DEFAULT 0,
    salary_range_inr JSONB DEFAULT '{"min": 0, "max": 0, "median": 0}'::jsonb,
    skills TEXT[] DEFAULT '{}',
    relevant_subjects TEXT[] DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_career_nodes_type ON career_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_career_nodes_level ON career_nodes(education_level);
CREATE INDEX IF NOT EXISTS idx_career_nodes_stream ON career_nodes(stream);
CREATE INDEX IF NOT EXISTS idx_career_nodes_code ON career_nodes(code);

CREATE TRIGGER trg_career_nodes_updated_at
BEFORE UPDATE ON career_nodes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Career Graph Edges (Transitions) Table
CREATE TABLE IF NOT EXISTS career_edges (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    from_node_id INTEGER NOT NULL REFERENCES career_nodes(id) ON DELETE CASCADE,
    to_node_id INTEGER NOT NULL REFERENCES career_nodes(id) ON DELETE CASCADE,
    transition_type career_transition_type NOT NULL DEFAULT 'ACADEMIC',
    reversibility career_reversibility NOT NULL DEFAULT 'REVERSIBLE',
    min_duration_months INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_career_edges_no_self_loops CHECK (from_node_id <> to_node_id),
    CONSTRAINT uq_career_edges_from_to UNIQUE (from_node_id, to_node_id)
);

CREATE INDEX IF NOT EXISTS idx_career_edges_from ON career_edges(from_node_id);
CREATE INDEX IF NOT EXISTS idx_career_edges_to ON career_edges(to_node_id);

CREATE TRIGGER trg_career_edges_updated_at
BEFORE UPDATE ON career_edges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Career & Course Rules (Prerequisites & Constraints) Table
CREATE TABLE IF NOT EXISTS career_rules (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    node_id INTEGER NOT NULL REFERENCES career_nodes(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL, -- REQUIRED_SUBJECTS, MIN_MARKS, REQUIRED_STREAM, REQUIRED_EXAM
    required_stream VARCHAR(50),
    required_subjects TEXT[] DEFAULT '{}',
    min_aggregate_marks NUMERIC(5, 2),
    required_exam_node_id INTEGER REFERENCES career_nodes(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_career_rules_node_id ON career_rules(node_id);

-- 6. Student Career Recommendations Cache Table
CREATE TABLE IF NOT EXISTS career_recommendations_cache (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_node_id INTEGER NOT NULL REFERENCES career_nodes(id) ON DELETE CASCADE,
    compatibility_score NUMERIC(5, 2) NOT NULL,
    eligibility_status career_eligibility_status NOT NULL,
    score_breakdown JSONB NOT NULL,
    reasons TEXT[] NOT NULL DEFAULT '{}',
    pathways JSONB NOT NULL DEFAULT '[]'::jsonb,
    calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_career_rec_user_career UNIQUE (user_id, career_node_id)
);

CREATE INDEX IF NOT EXISTS idx_career_rec_user ON career_recommendations_cache(user_id);
