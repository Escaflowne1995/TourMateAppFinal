# Admin Management Feature Guide

## Overview
This feature allows Super Administrators to create and manage admin accounts directly from the admin panel.

## Features Added

### 1. **Admin Management Navigation**
- A new "Admin Management" link in the navigation bar
- Only visible to Super Administrators
- Features a settings gear icon for easy identification

### 2. **Admin Management Dashboard**
The admin management view includes:
- **List of all admin accounts** with their details:
  - Name
  - Email
  - Role (Super Admin or Content Admin)
  - Status (Active/Inactive)
  - Creation date
  
- **Action buttons** for each admin:
  - **Edit**: Modify admin details, change password, or update role
  - **Activate/Deactivate**: Toggle admin account status

### 3. **Create New Admin Account**
Super admins can create new admin accounts with:
- **Name**: Admin's full name
- **Email**: Unique email address for login
- **Password**: Secure password (minimum 8 characters)
- **Role**: Choose between:
  - **Content Administrator**: Limited access to content management only
  - **Super Administrator**: Full access to all features

#### Permissions by Role

**Super Administrator**:
- ✅ Users Management
- ✅ Destinations Management
- ✅ Delicacies Management
- ✅ Spots Management
- ✅ Hotels Management
- ✅ Restaurants Management
- ✅ Eateries Management
- ✅ Settings Access
- ✅ Admin Management

**Content Administrator**:
- ❌ Users Management
- ✅ Destinations Management
- ✅ Delicacies Management
- ✅ Spots Management
- ❌ Hotels Management
- ❌ Restaurants Management
- ❌ Eateries Management
- ❌ Settings Access
- ❌ Admin Management

### 4. **Edit Admin Account**
- Modify admin name
- Update email (except for your own account)
- Change password (optional)
- Update role (except for your own account)
- Permissions are automatically updated based on role

### 5. **Activate/Deactivate Admin**
- Temporarily disable admin accounts without deleting them
- Inactive admins cannot log in
- Cannot deactivate your own account

## How to Use

### Accessing Admin Management
1. Log in as a Super Administrator
2. Click on "Admin Management" in the navigation bar
3. You'll see a list of all admin accounts

### Creating a New Admin
1. Click the **"Add Admin"** button
2. Fill in the form:
   - Enter the admin's name
   - Provide a unique email address
   - Create a secure password (min 8 characters)
   - Select the appropriate role
3. Click **"Create Admin"**
4. The new admin will be added and can log in immediately

### Editing an Admin
1. Click the **"Edit"** button next to the admin you want to modify
2. Update the necessary fields:
   - Change name
   - Update email (if not editing yourself)
   - Change password (leave blank to keep current)
   - Modify role (if not editing yourself)
3. Click **"Update Admin"**

### Deactivating an Admin
1. Click the **"Deactivate"** button next to the admin
2. Confirm the action
3. The admin account will be marked as inactive and cannot log in

### Reactivating an Admin
1. Click the **"Activate"** button next to the inactive admin
2. Confirm the action
3. The admin account will be reactivated

## Database Setup

### For Production (Supabase)
Run the SQL migration script to add password support:

```bash
# Run this SQL in your Supabase Dashboard > SQL Editor
# File: admin-panel/add-password-to-admin-users.sql
```

This will:
1. Add a `password` column to the `admin_users` table
2. Set default passwords for existing admins
3. Add necessary comments and documentation

### Current Credentials

**Super Administrator**:
- Email: `superadmin@tourmate.com`
- Password: `SuperAdmin@2024`

**Content Administrator**:
- Email: `admin@tourmate.com`
- Password: `Admin@2024`

## Security Considerations

### For Development (Current Setup)
- Passwords are stored in plain text in the mock data
- Suitable for testing and development only

### For Production
⚠️ **IMPORTANT**: Before deploying to production:

1. **Implement Password Hashing**:
   ```javascript
   // Use bcrypt or similar library
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Use Environment Variables**:
   - Store sensitive data in environment variables
   - Never commit passwords to version control

3. **Add Password Validation**:
   - Enforce strong password requirements
   - Require password change on first login
   - Implement password reset functionality

4. **Add Two-Factor Authentication (2FA)**:
   - Especially for Super Admin accounts
   - Use time-based one-time passwords (TOTP)

5. **Implement Audit Logging**:
   - Track admin account creation
   - Log admin actions
   - Monitor login attempts

## Troubleshooting

### "Access Denied" Message
- Only Super Administrators can access Admin Management
- Verify you're logged in as `superadmin@tourmate.com`

### Email Already Exists Error
- Each admin must have a unique email address
- Check the admin list for existing accounts
- Use a different email address

### Password Requirements Not Met
- Passwords must be at least 8 characters long
- Use a mix of uppercase, lowercase, numbers, and symbols for security

### Changes Not Reflecting
- Refresh the page or navigate away and back
- Check browser console for errors
- Verify you have the latest code version

## Technical Details

### Files Modified
1. **admin-panel/admin.html**:
   - Added Admin Management navigation link
   - Created `renderAdminManagementView()` function
   - Added form handlers for create, edit, and toggle status
   - Updated mock data with password fields
   - Added admin_users to data store management

2. **admin-panel/add-password-to-admin-users.sql**:
   - SQL migration to add password field
   - Updates existing admin records

### New Functions
- `renderAdminManagementView()`: Main view for admin management
- `showAddAdminForm()`: Display create admin form
- `editAdmin(adminId)`: Display edit admin form
- `toggleAdminStatus(adminId, currentStatus)`: Toggle active status
- `confirmToggleAdminStatus(adminId, newStatus)`: Confirm status change

## Future Enhancements

Potential improvements for future versions:
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Custom permission settings
- [ ] Admin activity logs
- [ ] Bulk admin operations
- [ ] Admin profile pictures
- [ ] Session management
- [ ] IP-based access restrictions
- [ ] Password expiration policies
- [ ] Role-based permission templates

## Support

If you encounter any issues or have questions:
1. Check this guide for common solutions
2. Review the browser console for error messages
3. Verify database connectivity
4. Ensure you're using the latest version

---

**Last Updated**: November 18, 2025  
**Version**: 1.0.0

