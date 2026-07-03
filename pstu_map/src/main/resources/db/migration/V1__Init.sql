CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    length_m DOUBLE PRECISION,
    depth_m DOUBLE PRECISION,
    map_polygon TEXT
);

CREATE TABLE floor_plans (
    id SERIAL PRIMARY KEY,
    building_id INT NOT NULL,
    floor_number INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_floor_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    CONSTRAINT uq_building_floor UNIQUE (building_id, floor_number)
);

CREATE TABLE nodes (
    id VARCHAR(50) PRIMARY KEY,
    building_id INT,
    floor INT NOT NULL,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL,
    CONSTRAINT fk_node_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
);

CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    building_id INT,
    floor INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    node_id VARCHAR(50) NOT NULL,
    qr_code VARCHAR(100) UNIQUE,
    room_polygon TEXT,
    CONSTRAINT fk_room_node FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_rooms_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
);

CREATE TABLE edges (
    id BIGSERIAL PRIMARY KEY,
    from_node VARCHAR(50) NOT NULL,
    to_node VARCHAR(50) NOT NULL,
    weight DOUBLE PRECISION NOT NULL,
    type VARCHAR(50) NOT NULL,
    CONSTRAINT fk_edge_from FOREIGN KEY (from_node) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_edge_to FOREIGN KEY (to_node) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT uq_edge_pair UNIQUE (from_node, to_node)
);

CREATE INDEX idx_edges_from ON edges(from_node);
CREATE INDEX idx_edges_to ON edges(to_node);
CREATE INDEX idx_rooms_node ON rooms(node_id);
CREATE INDEX idx_nodes_building ON nodes(building_id);
CREATE INDEX idx_rooms_building ON rooms(building_id);