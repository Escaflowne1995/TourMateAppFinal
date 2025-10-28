-- Admin Authentication Setup for Supabase
-- This creates an admin user in Supabase Auth for the admin panel
-- Run this in your Supabase Dashboard > SQL Editor

-- First, you need to create an admin user through Supabase Auth
-- Go to Authentication > Users in your Supabase Dashboard and create a user with:
-- Email: admin@admin.com
-- Password: password123 (or your preferred password)

-- Then run this SQL to create the admin profile
INSERT INTO users (email, name, role, phone, location, status) 
VALUES (
    'admin@admin.com', 
    'Super Administrator', 
    'admin', 
    '+639171234567', 
    'Cebu City, Philippines', 
    'ACTIVE'
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    location = EXCLUDED.location,
    status = EXCLUDED.status;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Admin user setup completed!';
    RAISE NOTICE 'Please create an admin user in Supabase Auth with email: admin@admin.com';
    RAISE NOTICE 'Then you can login to the admin panel.';
END $$;
