ALTER TABLE rooms ADD COLUMN building_id VARCHAR(255);
ALTER TABLE rooms ADD COLUMN room_polygon TEXT;

ALTER TABLE rooms
ADD CONSTRAINT fk_rooms_building FOREIGN KEY (building_id) REFERENCES buildings(id);