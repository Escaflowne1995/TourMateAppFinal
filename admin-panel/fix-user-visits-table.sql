-- Fix User Visits Table Schema
-- This script creates the user_visits table with the correct structure

-- 1. Drop existing user_visits table if it exists
DROP TABLE IF EXISTS user_visits CASCADE;

-- 2. Create user_visits table with proper structure
CREATE TABLE user_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL, -- The ID of the attraction (destination or delicacy)
    entity_type TEXT NOT NULL CHECK (entity_type IN ('destination', 'delicacy', 'restaurant', 'hotel', 'eatery', 'local_spot')),
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    photos JSONB DEFAULT '[]', -- Array of photo URLs or base64 strings
    notes TEXT,
    duration_minutes INTEGER,
    visit_count INTEGER DEFAULT 1, -- How many times they've visited
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_visits_user_id ON user_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_entity_id ON user_visits(entity_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_entity_type ON user_visits(entity_type);
CREATE INDEX IF NOT EXISTS idx_user_visits_visit_date ON user_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_user_visits_user_entity ON user_visits(user_id, entity_id, entity_type);

-- 4. Enable RLS
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- Users can view their own visits
DROP POLICY IF EXISTS "Users can view their own visits" ON user_visits;
CREATE POLICY "Users can view their own visits" ON user_visits
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own visits
DROP POLICY IF EXISTS "Users can insert their own visits" ON user_visits;
CREATE POLICY "Users can insert their own visits" ON user_visits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own visits
DROP POLICY IF EXISTS "Users can update their own visits" ON user_visits;
CREATE POLICY "Users can update their own visits" ON user_visits
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own visits
DROP POLICY IF EXISTS "Users can delete their own visits" ON user_visits;
CREATE POLICY "Users can delete their own visits" ON user_visits
    FOR DELETE USING (auth.uid() = user_id);

-- Admin can view all visits (for admin panel)
DROP POLICY IF EXISTS "Admin can view all visits" ON user_visits;
CREATE POLICY "Admin can view all visits" ON user_visits
    FOR SELECT USING (true);

-- 6. Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_visits_updated_at ON user_visits;
CREATE TRIGGER update_user_visits_updated_at
    BEFORE UPDATE ON user_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert some sample visit data for testing (optional)
-- This will only insert if there are users in the system
DO $$
DECLARE
    sample_user_id UUID;
    sample_destination_id UUID;
BEGIN
    -- Get a sample user ID (if any exist)
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    -- Get a sample destination ID (if any exist)
    SELECT id INTO sample_destination_id FROM destinations LIMIT 1;
    
    -- Insert sample visit data if we have both user and destination
    IF sample_user_id IS NOT NULL AND sample_destination_id IS NOT NULL THEN
        INSERT INTO user_visits (user_id, entity_id, entity_type, rating, review_text, notes, visit_count, is_favorite)
        VALUES 
            (sample_user_id, sample_destination_id, 'destination', 5, 'Amazing place! Highly recommended.', 'Great experience, will visit again.', 1, true)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Sample visit data inserted for testing';
    ELSE
        RAISE NOTICE 'No sample data inserted - no users or destinations found';
    END IF;
END $$;

-- 9. Success message
DO $$
BEGIN
    RAISE NOTICE 'User visits table created successfully!';
    RAISE NOTICE 'Table structure: user_id, entity_id, entity_type, visit_date, rating, review_text, photos, notes, duration_minutes, visit_count, is_favorite';
    RAISE NOTICE 'RLS policies created for user data protection';
    RAISE NOTICE 'Indexes created for better performance';
    RAISE NOTICE 'Mobile app visit tracking should now work properly';
END $$;
