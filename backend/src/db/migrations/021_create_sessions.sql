CREATE TABLE sessions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_type VARCHAR(100) CONSTRAINT chk_sessions_device_not_empty CHECK (device_type IS NULL OR length(trim(device_type)) > 0),
    app_version VARCHAR(50) CONSTRAINT chk_sessions_version_not_empty CHECK (app_version IS NULL OR length(trim(app_version)) > 0),
    is_offline_synced BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    CONSTRAINT chk_sessions_dates CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX idx_sessions_user_started ON sessions(user_id, started_at);
