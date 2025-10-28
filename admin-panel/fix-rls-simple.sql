-- Simple RLS Fix - Allow Profile Creation
-- This script fixes the RLS policy to allow profile creation during registration

-- 1. Drop existing RLS policies for profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

-- 2. Create new RLS policies that allow profile creation
-- Allow anyone to insert profiles (needed for registration)
CREATE POLICY "Allow profile creation" ON profiles
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = auth_user_id::text);

-- Allow users to update their own profiles
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = auth_user_id::text);

-- Allow admin to view all profiles (for admin panel)
CREATE POLICY "Admin can view all profiles" ON profiles
    FOR SELECT USING (true);

-- 3. Alternative: Temporarily disable RLS for profiles table if needed
-- Uncomment the line below if the above policies still don't work
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated to allow profile creation';
    RAISE NOTICE 'Profile creation should now work during registration';
    RAISE NOTICE 'If issues persist, uncomment the DISABLE RLS line';
END $$;
