-- Disable RLS for Profiles Table
-- This script disables RLS for the profiles table to allow registration

-- 1. Disable RLS for profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Keep RLS enabled for users table (for admin panel security)
-- Users table RLS policies remain active

-- 3. Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS disabled for profiles table';
    RAISE NOTICE 'Profile creation should now work during registration';
    RAISE NOTICE 'Users table RLS remains active for admin panel security';
END $$;
