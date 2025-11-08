-- Create Admin Role with Limited Permissions - FIXED VERSION
-- This script creates a new admin role that can only access delicacies, destinations, and spots

-- 1. Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;

-- 2. Create admin_roles table to define different admin levels
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create admin_users table to manage admin panel users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role_id UUID REFERENCES admin_roles(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert admin roles
INSERT INTO admin_roles (role_name, description, permissions) VALUES
('superadmin', 'Full access to all features and user management', 
 '{"users": true, "destinations": true, "delicacies": true, "spots": true, "hotels": true, "restaurants": true, "eateries": true, "settings": true}'),
('admin', 'Limited access to content management only', 
 '{"users": false, "destinations": true, "delicacies": true, "spots": true, "hotels": false, "restaurants": false, "eateries": false, "settings": false}');

-- 5. Insert sample admin users
INSERT INTO admin_users (email, name, role_id) VALUES
('superadmin@tourmate.com', 'Super Administrator', (SELECT id FROM admin_roles WHERE role_name = 'superadmin')),
('admin@tourmate.com', 'Content Administrator', (SELECT id FROM admin_roles WHERE role_name = 'admin'));

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- 7. Enable RLS on admin tables
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for admin tables
DROP POLICY IF EXISTS "Allow all access to admin_roles" ON admin_roles;
CREATE POLICY "Allow all access to admin_roles" ON admin_roles
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to admin_users" ON admin_users;
CREATE POLICY "Allow all access to admin_users" ON admin_users
    FOR ALL USING (true);

-- 9. Create function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(admin_email TEXT, permission_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    SELECT ar.permissions INTO user_permissions
    FROM admin_users au
    JOIN admin_roles ar ON au.role_id = ar.id
    WHERE au.email = admin_email AND au.is_active = true;
    
    IF user_permissions IS NULL THEN
        RETURN false;
    END IF;
    
    RETURN COALESCE((user_permissions->permission_key)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to get admin user info
CREATE OR REPLACE FUNCTION get_admin_user_info(admin_email TEXT)
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    role_name TEXT,
    permissions JSONB,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.name,
        au.email,
        ar.role_name,
        ar.permissions,
        au.is_active
    FROM admin_users au
    JOIN admin_roles ar ON au.role_id = ar.id
    WHERE au.email = admin_email AND au.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Update last login function
CREATE OR REPLACE FUNCTION update_admin_last_login(admin_email TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE admin_users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE email = admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Admin role system created successfully!';
    RAISE NOTICE 'Roles created: superadmin (full access), admin (limited access)';
    RAISE NOTICE 'Sample users created: superadmin@tourmate.com, admin@tourmate.com';
    RAISE NOTICE 'Admin role system ready for use!';
END $$;
