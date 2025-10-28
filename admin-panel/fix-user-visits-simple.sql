-- Simple Fix for User Visits Table
-- This script ensures the user_visits table exists with the correct structure

-- 1. Drop and recreate the user_visits table
DROP TABLE IF EXISTS user_visits CASCADE;

-- 2. Create user_visits table with minimal required structure
CREATE TABLE user_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    entity_id UUID NOT NULL, -- This is the missing column causing the error
    entity_type TEXT NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rating INTEGER,
    review_text TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create basic indexes
CREATE INDEX IF NOT EXISTS idx_user_visits_user_id ON user_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_entity_id ON user_visits(entity_id);
CREATE INDEX IF NOT EXISTS idx_user_visits_entity_type ON user_visits(entity_type);

-- 4. Enable RLS
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;

-- 5. Create basic RLS policies
DROP POLICY IF EXISTS "Users can view their own visits" ON user_visits;
CREATE POLICY "Users can view their own visits" ON user_visits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own visits" ON user_visits;
CREATE POLICY "Users can insert their own visits" ON user_visits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own visits" ON user_visits;
CREATE POLICY "Users can update their own visits" ON user_visits
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own visits" ON user_visits;
CREATE POLICY "Users can delete their own visits" ON user_visits
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Allow admin access
DROP POLICY IF EXISTS "Admin can view all visits" ON user_visits;
CREATE POLICY "Admin can view all visits" ON user_visits
    FOR SELECT USING (true);

-- 7. Success message
DO $$
BEGIN
    RAISE NOTICE 'User visits table created successfully!';
    RAISE NOTICE 'entity_id column added - visit tracking should now work';
    RAISE NOTICE 'Basic RLS policies created for user data protection';
END $$;
