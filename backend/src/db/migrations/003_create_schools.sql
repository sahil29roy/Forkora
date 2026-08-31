CREATE TABLE schools (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL CONSTRAINT chk_schools_name_not_empty CHECK (length(trim(name)) > 0),
    district VARCHAR(255) CONSTRAINT chk_schools_district_not_empty CHECK (district IS NULL OR length(trim(district)) > 0),
    state VARCHAR(255) CONSTRAINT chk_schools_state_not_empty CHECK (state IS NULL OR length(trim(state)) > 0),
    board board_type,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schools_state_district ON schools(state, district);
CREATE INDEX idx_schools_board ON schools(board);
