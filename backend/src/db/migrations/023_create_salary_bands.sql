CREATE TABLE salary_bands (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    career_node_id INTEGER NOT NULL REFERENCES path_nodes(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL CONSTRAINT chk_salary_bands_currency_not_empty CHECK (length(trim(currency)) > 0),
    min_lpa DECIMAL(8,2) CONSTRAINT chk_salary_bands_min_positive CHECK (min_lpa IS NULL OR min_lpa >= 0),
    max_lpa DECIMAL(8,2) CONSTRAINT chk_salary_bands_max_positive CHECK (max_lpa IS NULL OR max_lpa >= 0),
    region VARCHAR(255) CONSTRAINT chk_salary_bands_region_not_empty CHECK (region IS NULL OR length(trim(region)) > 0),
    is_illustrative BOOLEAN NOT NULL DEFAULT false,
    source_id INTEGER REFERENCES data_sources(id) ON DELETE SET NULL,
    captured_on DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_salary_range CHECK (min_lpa <= max_lpa)
);

CREATE INDEX idx_salary_bands_node ON salary_bands(career_node_id);
CREATE INDEX idx_salary_bands_source ON salary_bands(source_id);
CREATE INDEX idx_salary_bands_region ON salary_bands(region);
