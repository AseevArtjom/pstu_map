INSERT INTO uploaded_icons (file_path) VALUES
('/uploads/icons/icon_canteen_7f3b.svg'),
('/uploads/icons/icon_art_a8e2.svg'),
('/uploads/icons/icon_sport_9b1a.svg');

UPDATE buildings SET icon_id = 1 WHERE id = 'canteen';
UPDATE buildings SET icon_id = 2 WHERE id = 'art_center';
UPDATE buildings SET icon_id = 3 WHERE id = 'sport';