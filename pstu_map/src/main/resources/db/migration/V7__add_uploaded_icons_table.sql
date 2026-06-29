CREATE TABLE uploaded_icons (
    id SERIAL PRIMARY KEY,
    file_path VARCHAR(255) NOT NULL UNIQUE
);

ALTER TABLE buildings ADD COLUMN icon_id INT;

ALTER TABLE buildings
    ADD CONSTRAINT fk_buildings_icon
        FOREIGN KEY (icon_id) REFERENCES uploaded_icons(id)
            ON DELETE SET NULL;