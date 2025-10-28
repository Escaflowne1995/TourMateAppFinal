-- Fix Destinations Table Schema
-- This script adds the missing 'featured' column to the destinations table

-- 1. Add the missing 'featured' column to destinations table
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 2. Add other potentially missing columns that the mobile app might need
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS coordinates JSONB;

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Additional columns that the mobile app expects
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS entrance_fee TEXT;

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]';

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS accessibility_features JSONB DEFAULT '[]';

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS best_time_to_visit TEXT;

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS estimated_duration TEXT;

ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'Easy';

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_destinations_featured ON destinations(featured);
CREATE INDEX IF NOT EXISTS idx_destinations_is_featured ON destinations(is_featured);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON destinations(rating);
CREATE INDEX IF NOT EXISTS idx_destinations_review_count ON destinations(review_count);

-- 4. Update some existing destinations to be featured (for testing)
UPDATE destinations 
SET featured = true, is_featured = true, rating = 4.5, review_count = 25
WHERE name IN ('Basilica del Santo Niño', 'Magellan''s Cross', 'Fort San Pedro')
AND featured IS NULL;

-- 5. Add sample data if destinations table is empty
INSERT INTO destinations (
    name, location, description, featured, is_featured, rating, review_count, 
    image_url, address, entrance_fee, website, amenities, accessibility_features,
    best_time_to_visit, estimated_duration, difficulty_level, coordinates, is_active
)
SELECT * FROM (VALUES
    ('Basilica del Santo Niño', 'Cebu City', 'The Basilica Minore del Santo Niño is the oldest Roman Catholic church in the Philippines.', 
     true, true, 4.8, 150, 'https://example.com/basilica.jpg', 'Osmeña Blvd, Cebu City, 6000 Cebu', 
     'Free', 'https://basilica.com', '["Parking", "Restrooms", "Gift Shop"]'::jsonb, 
     '["Wheelchair Accessible", "Audio Guide"]'::jsonb, 'Early morning or late afternoon', 
     '1-2 hours', 'Easy', '{"latitude": 10.2936, "longitude": 123.9015}'::jsonb, true),
    
    ('Magellan''s Cross', 'Cebu City', 'Historical landmark of the arrival of Christianity.', 
     true, true, 4.2, 89, 'https://example.com/magellan-cross.jpg', 'Magallanes St, Cebu City, 6000 Cebu', 
     'Free', 'https://magellanscross.com', '["Parking", "Guided Tours"]'::jsonb, 
     '["Wheelchair Accessible"]'::jsonb, 'Morning', '30 minutes', 'Easy', 
     '{"latitude": 10.2936, "longitude": 123.9015}'::jsonb, true),
    
    ('Fort San Pedro', 'Cebu City', 'Fort San Pedro is the oldest fort in the Philippines.', 
     true, true, 4.5, 120, 'https://example.com/fort-san-pedro.jpg', 'A. Pigafetta St, Cebu City, 6000 Cebu', 
     '₱30', 'https://fortsanpedro.com', '["Parking", "Museum", "Gift Shop"]'::jsonb, 
     '["Wheelchair Accessible"]'::jsonb, 'Afternoon', '1 hour', 'Easy', 
     '{"latitude": 10.2936, "longitude": 123.9015}'::jsonb, true),
    
    ('Temple of Leah', 'Cebu City', 'A temple built as a symbol of undying love.', 
     false, false, 4.3, 95, 'https://example.com/temple-leah.jpg', 'Busay Hills, Cebu City, 6000 Cebu', 
     '₱50', 'https://templeofleah.com', '["Parking", "Restaurant", "Viewing Deck"]'::jsonb, 
     '[]'::jsonb, 'Sunset', '1-2 hours', 'Easy', 
     '{"latitude": 10.3500, "longitude": 123.9000}'::jsonb, true),
    
    ('Sirao Flower Garden', 'Cebu City', 'Known as the Little Amsterdam of Cebu.', 
     false, false, 4.1, 67, 'https://example.com/sirao-garden.jpg', 'Sirao, Cebu City, 6000 Cebu', 
     '₱100', 'https://siraogarden.com', '["Parking", "Photo Spots", "Garden"]'::jsonb, 
     '[]'::jsonb, 'Early morning', '2-3 hours', 'Easy', 
     '{"latitude": 10.4000, "longitude": 123.8500}'::jsonb, true)
) AS new_destinations(
    name, location, description, featured, is_featured, rating, review_count, 
    image_url, address, entrance_fee, website, amenities, accessibility_features,
    best_time_to_visit, estimated_duration, difficulty_level, coordinates, is_active
)
WHERE NOT EXISTS (SELECT 1 FROM destinations WHERE name = new_destinations.name);

-- 6. Success message
DO $$
BEGIN
    RAISE NOTICE 'Destinations table schema updated successfully!';
    RAISE NOTICE 'Added missing columns: featured, rating, review_count, image_url, coordinates, address, is_featured';
    RAISE NOTICE 'Created indexes for better performance';
    RAISE NOTICE 'Updated existing destinations with sample data';
    RAISE NOTICE 'Mobile app should now work without column errors';
END $$;
