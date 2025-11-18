-- Fix Admin Users Table - Add All Missing Columns
-- This script ensures all required columns exist in the admin_users table
-- Run this in your Supabase Dashboard > SQL Editor

-- First, let's check what columns exist and add missing ones

-- 1. Add 'name' column if missing
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Admin User';

-- 2. Add 'email' column if missing
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE NOT NULL DEFAULT 'admin@example.com';

-- 3. Add 'role' column if missing (THIS IS THE ONE CAUSING YOUR ERROR)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin';

-- 4. Add 'password' column if missing
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT 'ChangeMe@2024';

-- 5. Add 'permissions' column if missing (JSONB for storing permission flags)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 6. Add 'is_active' column if missing
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 7. Add 'role_id' column if missing (for foreign key to admin_roles)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES admin_roles(id);

-- 8. Add 'last_login' column if missing
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 9. Add 'created_at' column if missing
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 10. Add 'updated_at' column if missing
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Now update existing admin users with proper data
-- Super Admin
UPDATE admin_users 
SET 
    name = 'Super Administrator',
    email = 'superadmin@tourmate.com',
    role = 'superadmin',
    password = 'SuperAdmin@2024',
    permissions = '{"users": true, "destinations": true, "delicacies": true, "spots": true, "hotels": true, "restaurants": true, "eateries": true, "settings": true}'::jsonb,
    is_active = true
WHERE email = 'superadmin@tourmate.com';

-- Content Admin
UPDATE admin_users 
SET 
    name = 'Content Administrator',
    email = 'admin@tourmate.com',
    role = 'admin',
    password = 'Admin@2024',
    permissions = '{"users": false, "destinations": true, "delicacies": true, "spots": true, "hotels": false, "restaurants": false, "eateries": false, "settings": false}'::jsonb,
    is_active = true
WHERE email = 'admin@tourmate.com';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_permissions ON admin_users USING gin (permissions);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Add column comments
COMMENT ON COLUMN admin_users.name IS 'Full name of the admin user';
COMMENT ON COLUMN admin_users.email IS 'Unique email address for login';
COMMENT ON COLUMN admin_users.role IS 'Admin role: superadmin or admin';
COMMENT ON COLUMN admin_users.password IS 'Hashed password for admin authentication';
COMMENT ON COLUMN admin_users.permissions IS 'JSONB object storing permission flags';
COMMENT ON COLUMN admin_users.is_active IS 'Whether the admin account is active';

-- Show success message with table structure
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Admin Users Table Fixed Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'All required columns are now present:';
    RAISE NOTICE '  ✓ id (UUID)';
    RAISE NOTICE '  ✓ name (TEXT)';
    RAISE NOTICE '  ✓ email (TEXT)';
    RAISE NOTICE '  ✓ role (TEXT)';
    RAISE NOTICE '  ✓ password (TEXT)';
    RAISE NOTICE '  ✓ permissions (JSONB)';
    RAISE NOTICE '  ✓ is_active (BOOLEAN)';
    RAISE NOTICE '  ✓ role_id (UUID)';
    RAISE NOTICE '  ✓ last_login (TIMESTAMP)';
    RAISE NOTICE '  ✓ created_at (TIMESTAMP)';
    RAISE NOTICE '  ✓ updated_at (TIMESTAMP)';
    RAISE NOTICE '';
    RAISE NOTICE 'Default Admin Credentials:';
    RAISE NOTICE '  Super Admin:';
    RAISE NOTICE '    📧 Email: superadmin@tourmate.com';
    RAISE NOTICE '    🔑 Password: SuperAdmin@2024';
    RAISE NOTICE '';
    RAISE NOTICE '  Content Admin:';
    RAISE NOTICE '    📧 Email: admin@tourmate.com';
    RAISE NOTICE '    🔑 Password: Admin@2024';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Change passwords in production!';
    RAISE NOTICE '========================================';
END $$;

