-- Delete Spots Functionality from TourMate Application
-- This script removes the local_spots table and all related functionality

-- 1. Drop foreign key constraints that reference local_spots
-- First, check if user_visits table has any references to local_spot entity_type
-- We'll update the constraint to remove 'local_spot' from the allowed values

-- 2. Update user_visits table constraint to remove local_spot entity type
ALTER TABLE user_visits 
DROP CONSTRAINT IF EXISTS user_visits_entity_type_check;

ALTER TABLE user_visits 
ADD CONSTRAINT user_visits_entity_type_check 
CHECK (entity_type IN ('destination', 'delicacy', 'restaurant', 'hotel', 'eatery'));

-- 3. Remove any existing visits with local_spot entity_type
DELETE FROM user_visits WHERE entity_type = 'local_spot';

-- 4. Drop the local_spots table and all its dependencies
DROP TABLE IF EXISTS local_spots CASCADE;

-- 5. Drop any indexes related to local_spots
DROP INDEX IF EXISTS idx_local_spots_location;
DROP INDEX IF EXISTS idx_local_spots_active;
DROP INDEX IF EXISTS idx_local_spots_featured;

-- 6. Remove any RLS policies for local_spots (if they exist)
-- Note: These will be automatically dropped when the table is dropped

-- 7. Update admin_roles permissions to remove spots permission
-- First, let's see what roles exist and update their permissions
UPDATE admin_roles 
SET permissions = permissions - 'spots'
WHERE permissions ? 'spots';

-- 8. Remove spots permission from existing admin users' role permissions
-- This is handled by the above update since permissions are stored in the roles table

-- 9. Clean up any remaining references
-- Remove any admin users that might have been specifically assigned spots permissions
-- (This is optional - you might want to keep admin users but just remove their spots access)

-- 10. Verify the cleanup
-- Check that no tables reference local_spots
SELECT 
    table_name,
    column_name,
    constraint_name
FROM information_schema.constraint_column_usage 
WHERE table_name = 'local_spots';

-- This query should return no results if cleanup was successful

-- 11. Show remaining entity types in user_visits
SELECT DISTINCT entity_type FROM user_visits;

-- 12. Show updated admin role permissions
SELECT role_name, permissions FROM admin_roles;

COMMIT;
