CREATE TABLE buildings(
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    length_m DOUBLE PRECISION,
    depth_m DOUBLE PRECISION
);

ALTER TABLE nodes ADD COLUMN building_id VARCHAR(50);

ALTER TABLE nodes
    ADD CONSTRAINT fk_node_building
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE;