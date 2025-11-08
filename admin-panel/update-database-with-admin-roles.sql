-- Update Database with Admin Role System
-- This script adds the admin role system to the existing database

-- 1. Create admin_roles table to define different admin levels
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create admin_users table to manage admin panel users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role_id UUID REFERENCES admin_roles(id),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert admin roles
INSERT INTO admin_roles (role_name, description, permissions) VALUES
('superadmin', 'Full access to all features and user management', 
 '{"users": true, "destinations": true, "delicacies": true, "spots": true, "hotels": true, "restaurants": true, "eateries": true, "settings": true}'),
('admin', 'Limited access to content management only', 
 '{"users": false, "destinations": true, "delicacies": true, "spots": true, "hotels": false, "restaurants": false, "eateries": false, "settings": false}')
ON CONFLICT (role_name) DO NOTHING;

-- 4. Insert sample admin users
INSERT INTO admin_users (email, name, role_id) VALUES
('superadmin@tourmate.com', 'Super Administrator', (SELECT id FROM admin_roles WHERE role_name = 'superadmin')),
('admin@tourmate.com', 'Content Administrator', (SELECT id FROM admin_roles WHERE role_name = 'admin'))
ON CONFLICT (email) DO NOTHING;

-- 5. Ensure local_spots table exists with proper structure
CREATE TABLE IF NOT EXISTS local_spots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Cultural',
    opening_hours TEXT,
    contact_number TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.1. Add featured column if it doesn't exist
ALTER TABLE local_spots 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

ALTER TABLE local_spots 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;

ALTER TABLE local_spots 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 6. Add missing columns to existing tables if they don't exist
ALTER TABLE destinations 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE local_delicacies 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_local_spots_location ON local_spots(location);
CREATE INDEX IF NOT EXISTS idx_local_spots_active ON local_spots(is_active);
CREATE INDEX IF NOT EXISTS idx_local_spots_featured ON local_spots(featured);

-- 8. Enable RLS on admin tables
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_spots ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for admin tables
DROP POLICY IF EXISTS "Allow all access to admin_roles" ON admin_roles;
CREATE POLICY "Allow all access to admin_roles" ON admin_roles
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to admin_users" ON admin_users;
CREATE POLICY "Allow all access to admin_users" ON admin_users
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access to local_spots" ON local_spots;
CREATE POLICY "Allow all access to local_spots" ON local_spots
    FOR ALL USING (true);

-- 10. Create function to check admin permissions
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

-- 11. Create function to get admin user info
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

-- 12. Update last login function
CREATE OR REPLACE FUNCTION update_admin_last_login(admin_email TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE admin_users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE email = admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Insert sample local spots data
INSERT INTO local_spots (name, location, description, category, featured, rating, review_count, is_active) VALUES
('Sirao Flower Garden', 'Cebu City', 'Known as the Little Amsterdam of Cebu.', 'Natural', true, 4.3, 89, true),
('Temple of Leah', 'Cebu City', 'A temple built as a symbol of undying love.', 'Cultural', true, 4.1, 67, true),
('Tops Lookout', 'Cebu City', 'Panoramic view of Cebu City and surrounding areas.', 'Natural', false, 4.0, 45, true),
('WOW Alejandra Garden', 'Cebu City', 'Beautiful garden with various flowers and plants.', 'Natural', false, 3.8, 23, true)
ON CONFLICT DO NOTHING;

-- 14. Success message
DO $$
BEGIN
    RAISE NOTICE 'Admin role system added successfully!';
    RAISE NOTICE 'Roles created: superadmin (full access), admin (limited access)';
    RAISE NOTICE 'Sample users created: superadmin@tourmate.com, admin@tourmate.com';
    RAISE NOTICE 'Local spots table created with sample data';
    RAISE NOTICE 'Admin role system ready for use!';
END $$;
