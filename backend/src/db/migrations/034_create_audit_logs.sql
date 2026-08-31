CREATE TABLE audit_logs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL CONSTRAINT chk_audit_logs_action_not_empty CHECK (length(trim(action)) > 0),
    entity_type VARCHAR(100) NOT NULL CONSTRAINT chk_audit_logs_entity_type_not_empty CHECK (length(trim(entity_type)) > 0),
    entity_id INTEGER CONSTRAINT chk_audit_logs_entity_id CHECK (entity_id >= 0),
    metadata JSONB,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor_occurred ON audit_logs(actor_user_id, occurred_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
