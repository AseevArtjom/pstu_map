ALTER TABLE buildings ADD COLUMN map_polygon TEXT;

UPDATE buildings
SET map_polygon = '200,695 475,690 475,725 200,728'
WHERE id = '5';