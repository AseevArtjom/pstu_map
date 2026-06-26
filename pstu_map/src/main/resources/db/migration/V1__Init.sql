CREATE TABLE nodes(
    id VARCHAR(50) PRIMARY KEY,
    floor INT NOT NULL,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL
);

CREATE TABLE rooms(
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    floor INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    node_id VARCHAR(50) NOT NULL,
    qr_code VARCHAR(100) UNIQUE,
    CONSTRAINT fk_room_node FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

CREATE TABLE edges(
    id BIGSERIAL PRIMARY KEY,
    from_node VARCHAR(50) NOT NULL,
    to_node VARCHAR(50) NOT NULL,
    weight DOUBLE PRECISION NOT NULL,
    type VARCHAR(50) NOT NULL,
    CONSTRAINT fk_edge_from FOREIGN KEY (from_node) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_edge_to FOREIGN KEY (to_node) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT uq_edge_pair UNIQUE (from_node,to_node)
);

CREATE INDEX idx_edges_from ON edges(from_node);
CREATE INDEX idx_rooms_node ON rooms(node_id);