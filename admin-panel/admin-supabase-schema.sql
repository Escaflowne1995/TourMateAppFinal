-- Admin Panel Supabase Database Schema
-- This creates all the tables needed for the TourMate Admin Panel
-- Run this in your Supabase Dashboard > SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (admin panel users)
-- First drop existing users table if it exists to avoid conflicts
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'viewer', -- admin, contributor, viewer
    phone TEXT,
    location TEXT,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, OFFLINE, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create destinations table
DROP TABLE IF EXISTS destinations CASCADE;
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Cultural', -- Cultural, Natural, Religious, etc.
    opening_hours TEXT,
    contact_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create local_delicacies table
DROP TABLE IF EXISTS local_delicacies CASCADE;
CREATE TABLE local_delicacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    origin TEXT NOT NULL, -- City/Town where it originates
    description TEXT,
    category TEXT DEFAULT 'Food/Beverage',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hotels table
DROP TABLE IF EXISTS hotels CASCADE;
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    stars INTEGER DEFAULT 3,
    description TEXT,
    opening_hours TEXT,
    contact_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create restaurants table
DROP TABLE IF EXISTS restaurants CASCADE;
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    location TEXT,
    description TEXT,
    opening_hours TEXT,
    contact_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create eateries table
DROP TABLE IF EXISTS eateries CASCADE;
CREATE TABLE eateries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    location TEXT,
    description TEXT,
    opening_hours TEXT,
    contact_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create local_spots table
DROP TABLE IF EXISTS local_spots CASCADE;
CREATE TABLE local_spots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'Cultural',
    opening_hours TEXT,
    contact_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table (for tracking user interactions)
DROP TABLE IF EXISTS user_preferences CASCADE;
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    type TEXT NOT NULL, -- local_delicacies, destinations, hotels, etc.
    action TEXT NOT NULL, -- Loves, Likes, Visited, Stayed At, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_destinations_location ON destinations(location);
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_delicacies_origin ON local_delicacies(origin);
CREATE INDEX IF NOT EXISTS idx_delicacies_active ON local_delicacies(is_active);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_hotels_active ON hotels(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_eateries_cuisine ON eateries(cuisine);
CREATE INDEX IF NOT EXISTS idx_eateries_active ON eateries(is_active);
CREATE INDEX IF NOT EXISTS idx_spots_location ON local_spots(location);
CREATE INDEX IF NOT EXISTS idx_spots_active ON local_spots(is_active);
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_content_id ON user_preferences(content_id);
CREATE INDEX IF NOT EXISTS idx_preferences_type ON user_preferences(type);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_delicacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE eateries ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access (allows anonymous access for admin panel)
-- Note: These policies allow full access - adjust based on your security needs

-- Users table policies
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Admin can insert users" ON users;
DROP POLICY IF EXISTS "Admin can update users" ON users;
DROP POLICY IF EXISTS "Admin can delete users" ON users;

CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update users" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Admin can delete users" ON users
    FOR DELETE USING (true);

-- Destinations table policies
DROP POLICY IF EXISTS "Admin can view all destinations" ON destinations;
DROP POLICY IF EXISTS "Admin can insert destinations" ON destinations;
DROP POLICY IF EXISTS "Admin can update destinations" ON destinations;
DROP POLICY IF EXISTS "Admin can delete destinations" ON destinations;

CREATE POLICY "Admin can view all destinations" ON destinations
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert destinations" ON destinations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update destinations" ON destinations
    FOR UPDATE USING (true);

CREATE POLICY "Admin can delete destinations" ON destinations
    FOR DELETE USING (true);

-- Local delicacies table policies
DROP POLICY IF EXISTS "Admin can view all delicacies" ON local_delicacies;
DROP POLICY IF EXISTS "Admin can insert delicacies" ON local_delicacies;
DROP POLICY IF EXISTS "Admin can update delicacies" ON local_delicacies;
DROP POLICY IF EXISTS "Admin can delete delicacies" ON local_delicacies;

CREATE POLICY "Admin can view all delicacies" ON local_delicacies
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert delicacies" ON local_delicacies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update delicacies" ON local_delicacies
    FOR UPDATE USING (true);

CREATE POLICY "Admin can delete delicacies" ON local_delicacies
    FOR DELETE USING (true);

-- Hotels table policies
DROP POLICY IF EXISTS "Admin can view all hotels" ON hotels;
DROP POLICY IF EXISTS "Admin can insert hotels" ON hotels;
DROP POLICY IF EXISTS "Admin can update hotels" ON hotels;
DROP POLICY IF EXISTS "Admin can delete hotels" ON hotels;

CREATE POLICY "Admin can view all hotels" ON hotels
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert hotels" ON hotels
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update hotels" ON hotels
    FOR UPDATE USING (true);

CREATE POLICY "Admin can delete hotels" ON hotels
    FOR DELETE USING (true);

-- Restaurants table policies
DROP POLICY IF EXISTS "Admin can view all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admin can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admin can update restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admin can delete restaurants" ON restaurants;

CREATE POLICY "Admin can view all restaurants" ON restaurants
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert restaurants" ON restaurants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update restaurants" ON restaurants
    FOR UPDATE USING (true);

CREATE POLICY "Admin can delete restaurants" ON restaurants
    FOR DELETE USING (true);

-- Eateries table policies
DROP POLICY IF EXISTS "Admin can view all eateries" ON eateries;
DROP POLICY IF EXISTS "Admin can insert eateries" ON eateries;
DROP POLICY IF EXISTS "Admin can update eateries" ON eateries;
DROP POLICY IF EXISTS "Admin can delete eateries" ON eateries;

CREATE POLICY "Admin can view all eateries" ON eateries
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert eateries" ON eateries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update eateries" ON eateries
    FOR UPDATE USING (true);

CREATE POLICY "Admin can delete eateries" ON eateries
    FOR DELETE USING (true);

-- Local spots table policies
DROP POLICY IF EXISTS "Admin can view all spots" ON local_spots;
DROP POLICY IF EXISTS "Admin can insert spots" ON local_spots;
DROP POLICY IF EXISTS "Admin can update spots" ON local_spots;
DROP POLICY IF EXISTS "Admin can delete spots" ON local_spots;

CREATE POLICY "Admin can view all spots" ON local_spots
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert spots" ON local_spots
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update spots" ON local_spots
    FOR UPDATE USING (true);

CREATE POLICY "Admin can delete spots" ON local_spots
    FOR DELETE USING (true);

-- User preferences table policies
DROP POLICY IF EXISTS "Admin can view all preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admin can insert preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admin can update preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admin can delete preferences" ON user_preferences;

CREATE POLICY "Admin can view all preferences" ON user_preferences
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert preferences" ON user_preferences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update preferences" ON user_preferences
    FOR UPDATE USING (true);

CREATE POLICY "Admin can delete preferences" ON user_preferences
    FOR DELETE USING (true);

-- Insert sample data for testing
INSERT INTO users (email, name, role, phone, location, status) VALUES
('admin@admin.com', 'Super Administrator', 'admin', '+639171234567', 'Cebu City, Philippines', 'ACTIVE'),
('jovita@local.com', 'Jovita Local', 'contributor', '+639171234568', 'Mandaue City, Philippines', 'ACTIVE'),
('tourist@visitor.com', 'New Visitor', 'viewer', '+639171234569', 'Cebu City, Philippines', 'OFFLINE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO local_delicacies (name, origin, description) VALUES
('Lechon Cebu', 'Cebu', 'A whole pig, spit-roasted over an open charcoal fire, stuffed with local aromatic herbs and spices like lemongrass, garlic, and green onion.'),
('Puso (Hanging Rice)', 'Cebu', 'Rice wrapped and boiled in woven coconut leaves.')
ON CONFLICT DO NOTHING;

INSERT INTO destinations (name, location, description) VALUES
('Basilica del Santo Niño', 'Cebu City', 'The Basilica Minore del Santo Niño is the oldest Roman Catholic church in the Philippines.'),
('Magellan''s Cross', 'Cebu City', 'Historical landmark of the arrival of Christianity.'),
('Fort San Pedro', 'Cebu City', 'Fort San Pedro is the oldest fort in the Philippines. It was established in 1738 and serves as the sanctuary for the Santo Niño de Cebu.')
ON CONFLICT DO NOTHING;

INSERT INTO local_spots (name, location, description) VALUES
('Sirao Flower Garden', 'Cebu City', 'Known as the Little Amsterdam of Cebu.')
ON CONFLICT DO NOTHING;

INSERT INTO hotels (name, city, stars, description) VALUES
('Quest Hotel & Conference Center Cebu', 'Cebu City', 4, 'Mid-range hotel near Ayala Center.')
ON CONFLICT DO NOTHING;

INSERT INTO restaurants (name, cuisine, description) VALUES
('Larsian', 'Barbecue', 'Popular barbecue food court.')
ON CONFLICT DO NOTHING;

INSERT INTO eateries (name, cuisine, description) VALUES
('Pungko-Pungko sa Fuente', 'Fried Food', 'Famous roadside fried food stalls.')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Admin panel database schema created successfully!';
    RAISE NOTICE 'Tables created: users, destinations, local_delicacies, hotels, restaurants, eateries, local_spots, user_preferences';
    RAISE NOTICE 'Sample data inserted for testing.';
    RAISE NOTICE 'You can now connect your admin panel to Supabase!';
END $$;
