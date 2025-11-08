# Admin Role System Documentation

## Overview
This admin panel now supports role-based access control with two distinct admin roles:

1. **Super Administrator** - Full access to all features
2. **Content Administrator** - Limited access to content management only

## Admin Roles

### Super Administrator
- **Email**: `superadmin@tourmate.com`
- **Password**: `password`
- **Permissions**:
  - ✅ Users Management
  - ✅ Destinations Management
  - ✅ Delicacies Management
  - ✅ Spots Management
  - ✅ Hotels Management
  - ✅ Restaurants Management
  - ✅ Eateries Management
  - ✅ Settings Access

### Content Administrator
- **Email**: `admin@tourmate.com`
- **Password**: `password`
- **Permissions**:
  - ❌ Users Management
  - ✅ Destinations Management
  - ✅ Delicacies Management
  - ✅ Spots Management
  - ❌ Hotels Management
  - ❌ Restaurants Management
  - ❌ Eateries Management
  - ❌ Settings Access

## Features Implemented

### 1. Role-Based Navigation
- Navigation items are dynamically shown/hidden based on user permissions
- Super admin sees all navigation items
- Content admin only sees allowed sections

### 2. Permission-Based Dashboard
- Dashboard statistics only show data the user has permission to access
- Different welcome messages based on user role
- Role badges displayed in the header

### 3. Access Control
- Management views check permissions before rendering
- Access denied pages for unauthorized sections
- Graceful handling of permission restrictions

### 4. Spot Management
- Added local spots management alongside destinations and delicacies
- Full CRUD operations for spots
- Consistent UI with other content types

## Database Schema

### Admin Roles Table
```sql
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Admin Users Table
```sql
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
```

### Local Spots Table
```sql
CREATE TABLE local_spots (
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
```

## Setup Instructions

### 1. Database Setup
Run these SQL scripts in your Supabase dashboard:

1. **Create Admin Role System**:
   ```sql
   -- Run admin-panel/create-admin-role.sql
   ```

2. **Update Existing Database**:
   ```sql
   -- Run admin-panel/update-database-with-admin-roles.sql
   ```

### 2. Admin Panel Access
1. Open `admin-panel/admin.html` in your browser
2. Select the admin account from the dropdown
3. Enter password: `password`
4. Test different roles and permissions

## Testing

### Test Super Administrator
1. Login with `superadmin@tourmate.com`
2. Verify all navigation items are visible
3. Test access to all management sections
4. Verify dashboard shows all statistics

### Test Content Administrator
1. Login with `admin@tourmate.com`
2. Verify only allowed navigation items are visible
3. Test access to destinations, delicacies, and spots only
4. Verify access denied for users, hotels, restaurants, eateries
5. Verify dashboard shows only allowed statistics

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Admin tables have appropriate policies
- Content tables allow full access for admin panel

### Permission Checking
- Client-side permission checking for UI
- Server-side permission validation (when using Supabase)
- Graceful fallback for unauthorized access

### Authentication
- Role-based authentication system
- Session management
- Secure logout functionality

## Customization

### Adding New Roles
1. Insert new role in `admin_roles` table
2. Update permissions JSONB field
3. Add new admin users with the role
4. Update client-side permission checking

### Adding New Permissions
1. Add permission key to role permissions JSONB
2. Update `checkPermission` function
3. Add permission checks to relevant UI components
4. Update navigation and dashboard logic

## File Structure

```
admin-panel/
├── admin.html                          # Main admin panel
├── create-admin-role.sql               # Creates admin role system
├── update-database-with-admin-roles.sql # Updates existing database
├── test-admin-functionality.html      # Test interface
├── ADMIN_ROLES_README.md              # This documentation
└── admin-supabase-schema.sql          # Original schema
```

## Troubleshooting

### Common Issues

1. **Navigation items not showing/hiding properly**
   - Check browser console for JavaScript errors
   - Verify user permissions are loaded correctly
   - Check if `updateNavigation()` is called after login

2. **Access denied pages not working**
   - Verify permission mapping in `renderManagementView`
   - Check if `checkPermission` function is working
   - Ensure user is properly authenticated

3. **Database connection issues**
   - Verify Supabase credentials in admin.html
   - Check if RLS policies are correct
   - Ensure admin role tables exist

### Debug Mode
Enable debug mode by opening browser console and checking:
- User authentication status
- Permission object content
- Navigation update calls
- Permission check results

## Support

For issues or questions about the admin role system:
1. Check the test file: `admin-panel/test-admin-functionality.html`
2. Review browser console for errors
3. Verify database setup and permissions
4. Test with both admin accounts to isolate issues
