CREATE TABLE uploaded_icons (
    id SERIAL PRIMARY KEY,
    file_path VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE room_types (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    default_color VARCHAR(7) DEFAULT '#2F80ED',
    default_icon_id INT,
    CONSTRAINT fk_room_types_icon FOREIGN KEY (default_icon_id) REFERENCES uploaded_icons(id) ON DELETE SET NULL
);

CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    length_m DOUBLE PRECISION,
    depth_m DOUBLE PRECISION,
    icon_id INT,
    map_polygon TEXT,
    hex_color VARCHAR(7) DEFAULT '#2F80ED',
    CONSTRAINT fk_buildings_icon FOREIGN KEY (icon_id) REFERENCES uploaded_icons(id) ON DELETE SET NULL
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
    room_type_id INT NOT NULL,
    node_id VARCHAR(50),
    qr_code VARCHAR(100) UNIQUE,
    room_polygon TEXT,
    custom_color VARCHAR(7),
    custom_icon_id INT,
    CONSTRAINT fk_room_node FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE SET NULL,
    CONSTRAINT fk_rooms_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    CONSTRAINT fk_rooms_type FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_rooms_custom_icon FOREIGN KEY (custom_icon_id) REFERENCES uploaded_icons(id) ON DELETE SET NULL
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
CREATE INDEX idx_rooms_type ON rooms(room_type_id);