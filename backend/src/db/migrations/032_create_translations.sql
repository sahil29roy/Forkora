CREATE TABLE translations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL CONSTRAINT chk_translations_entity_type CHECK (length(trim(entity_type)) > 0),
    entity_id INTEGER NOT NULL CONSTRAINT chk_translations_entity_id CHECK (entity_id >= 0),
    language_code VARCHAR(10) NOT NULL CONSTRAINT chk_translations_lang CHECK (length(trim(language_code)) > 0),
    field VARCHAR(100) NOT NULL CONSTRAINT chk_translations_field CHECK (length(trim(field)) > 0),
    translated_text TEXT NOT NULL CONSTRAINT chk_translations_text CHECK (length(trim(translated_text)) > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_translation UNIQUE (entity_type, entity_id, language_code, field)
);

CREATE INDEX idx_translations_language ON translations(language_code);
CREATE INDEX idx_translations_entity ON translations(entity_type, entity_id);
