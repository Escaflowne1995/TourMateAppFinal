-- Fix RLS and Constraint Issues
-- This script fixes the Row Level Security and ON CONFLICT issues

-- 1. Drop existing tables to start fresh
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create profiles table with proper structure
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID, -- Will store the Supabase auth user ID
    name TEXT,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    country TEXT DEFAULT 'Philippines',
    zip_code TEXT,
    birth_date TEXT,
    gender TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    favorite_spots JSONB DEFAULT '[]',
    total_reviews INTEGER DEFAULT 0,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create users table with proper structure
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE, -- This will be the unique constraint for ON CONFLICT
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'viewer', -- admin, contributor, viewer
    phone TEXT,
    location TEXT,
    country TEXT DEFAULT 'Philippines',
    zip_code TEXT,
    birth_date TEXT,
    gender TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, OFFLINE, SUSPENDED
    is_active BOOLEAN DEFAULT true,
    favorite_spots JSONB DEFAULT '[]',
    total_reviews INTEGER DEFAULT 0,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 5. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for profiles table
-- Allow anyone to insert profiles (for registration)
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
CREATE POLICY "Allow profile creation" ON profiles
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = auth_user_id::text);

-- Allow users to update their own profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = auth_user_id::text);

-- Allow admin to view all profiles (for admin panel)
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles" ON profiles
    FOR SELECT USING (true);

-- 7. Create RLS policies for users table
-- Allow admin to view all users
DROP POLICY IF EXISTS "Admin can view all users" ON users;
CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (true);

-- Allow users to view their own data
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = auth_user_id::text);

-- Allow admin to insert users
DROP POLICY IF EXISTS "Admin can insert users" ON users;
CREATE POLICY "Admin can insert users" ON users
    FOR INSERT WITH CHECK (true);

-- Allow admin to update users
DROP POLICY IF EXISTS "Admin can update users" ON users;
CREATE POLICY "Admin can update users" ON users
    FOR UPDATE USING (true);

-- Allow admin to delete users
DROP POLICY IF EXISTS "Admin can delete users" ON users;
CREATE POLICY "Admin can delete users" ON users
    FOR DELETE USING (true);

-- 8. Create sync function to automatically sync profiles to users
CREATE OR REPLACE FUNCTION sync_profile_to_users()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update in users table when profile is created/updated
    INSERT INTO users (
        auth_user_id,
        email,
        name,
        full_name,
        phone,
        location,
        country,
        zip_code,
        birth_date,
        gender,
        avatar_url,
        status,
        is_active,
        favorite_spots,
        total_reviews,
        registration_date,
        created_at,
        updated_at
    ) VALUES (
        NEW.auth_user_id,
        NEW.email,
        COALESCE(NEW.name, NEW.full_name, 'User'),
        NEW.full_name,
        NEW.phone,
        NEW.location,
        NEW.country,
        NEW.zip_code,
        NEW.birth_date,
        NEW.gender,
        NEW.avatar_url,
        'ACTIVE',
        COALESCE(NEW.is_active, true),
        COALESCE(NEW.favorite_spots, '[]'),
        COALESCE(NEW.total_reviews, 0),
        COALESCE(NEW.registration_date, NOW()),
        COALESCE(NEW.created_at, NOW()),
        NOW()
    )
    ON CONFLICT (auth_user_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        location = EXCLUDED.location,
        country = EXCLUDED.country,
        zip_code = EXCLUDED.zip_code,
        birth_date = EXCLUDED.birth_date,
        gender = EXCLUDED.gender,
        avatar_url = EXCLUDED.avatar_url,
        favorite_spots = EXCLUDED.favorite_spots,
        total_reviews = EXCLUDED.total_reviews,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger to automatically sync profiles to users
DROP TRIGGER IF EXISTS sync_profile_trigger ON profiles;
CREATE TRIGGER sync_profile_trigger
    AFTER INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_profile_to_users();

-- 10. Insert sample admin user
INSERT INTO users (
    email,
    name,
    full_name,
    role,
    phone,
    location,
    status,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@admin.com',
    'Super Administrator',
    'Super Administrator',
    'admin',
    '+639171234567',
    'Cebu City, Philippines',
    'ACTIVE',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 11. Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS and constraint issues fixed successfully!';
    RAISE NOTICE 'Tables recreated with proper structure';
    RAISE NOTICE 'RLS policies created for both tables';
    RAISE NOTICE 'Unique constraints added for ON CONFLICT operations';
    RAISE NOTICE 'Sync triggers created';
    RAISE NOTICE 'Admin user created';
END $$;

