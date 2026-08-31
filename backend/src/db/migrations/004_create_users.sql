CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role user_role NOT NULL,
    display_name VARCHAR(255) NOT NULL CONSTRAINT chk_users_display_name_not_empty CHECK (length(trim(display_name)) > 0),
    email VARCHAR(255) NOT NULL UNIQUE CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    phone VARCHAR(50) CONSTRAINT chk_users_phone_length CHECK (phone IS NULL OR length(trim(phone)) >= 7),
    class_level SMALLINT CONSTRAINT chk_users_class_level CHECK (class_level IS NULL OR (class_level >= 1 AND class_level <= 12)),
    school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
    preferred_language VARCHAR(50),
    is_minor BOOLEAN NOT NULL DEFAULT false,
    password_hash VARCHAR(255) NOT NULL CONSTRAINT chk_users_password_hash_not_empty CHECK (length(trim(password_hash)) > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP
);

CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role ON users(role);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
