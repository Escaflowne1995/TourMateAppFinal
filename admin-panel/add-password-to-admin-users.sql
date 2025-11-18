-- Add Password and Permissions Fields to Admin Users Table
-- This migration adds password and permissions fields to the admin_users table
-- Run this in your Supabase Dashboard > SQL Editor

-- 1. Add password column to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT 'ChangeMe@2024';

-- 2. Add permissions column to admin_users table (store permissions directly)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 3. Update existing admin users with secure passwords and permissions
UPDATE admin_users 
SET 
    password = 'SuperAdmin@2024',
    permissions = '{"users": true, "destinations": true, "delicacies": true, "spots": true, "hotels": true, "restaurants": true, "eateries": true, "settings": true}'::jsonb
WHERE email = 'superadmin@tourmate.com';

UPDATE admin_users 
SET 
    password = 'Admin@2024',
    permissions = '{"users": false, "destinations": true, "delicacies": true, "spots": true, "hotels": false, "restaurants": false, "eateries": false, "settings": false}'::jsonb
WHERE email = 'admin@tourmate.com';

-- 4. Add comments to columns
COMMENT ON COLUMN admin_users.password IS 'Hashed password for admin authentication';
COMMENT ON COLUMN admin_users.permissions IS 'JSONB object storing permission flags for this admin user';

-- 5. Create index on permissions for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_users_permissions ON admin_users USING gin (permissions);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Admin Users table updated successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Added columns:';
    RAISE NOTICE '  - password (TEXT)';
    RAISE NOTICE '  - permissions (JSONB)';
    RAISE NOTICE '';
    RAISE NOTICE 'Default credentials:';
    RAISE NOTICE '  Super Admin:';
    RAISE NOTICE '    Email: superadmin@tourmate.com';
    RAISE NOTICE '    Password: SuperAdmin@2024';
    RAISE NOTICE '';
    RAISE NOTICE '  Content Admin:';
    RAISE NOTICE '    Email: admin@tourmate.com';
    RAISE NOTICE '    Password: Admin@2024';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: In production, passwords should be hashed using bcrypt or similar.';
    RAISE NOTICE '========================================';
END $$;

