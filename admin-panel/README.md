# TourMate Admin Panel - Supabase Connection Guide

This guide will help you connect your TourMate Admin Panel to Supabase.

## Prerequisites

- Supabase project set up
- Admin panel files in place
- Basic knowledge of Supabase Dashboard

## Step 1: Set Up Database Schema

1. Go to your Supabase Dashboard → SQL Editor
2. Copy and run the SQL from `admin-supabase-schema.sql`
3. This will create all necessary tables:
   - `users` - Admin panel users
   - `destinations` - Tourist destinations
   - `local_delicacies` - Local food items
   - `hotels` - Hotel listings
   - `restaurants` - Restaurant listings
   - `eateries` - Local eateries
   - `local_spots` - Local attractions
   - `user_preferences` - User interaction tracking

## Step 2: Set Up Admin Authentication

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" and create:
   - Email: `admin@admin.com`
   - Password: `password123` (or your preferred password)
   - Confirm email: Yes
3. Run the SQL from `admin-auth-setup.sql` to create the admin profile

## Step 3: Configure Admin Panel

The admin panel is already configured with your Supabase credentials:
- URL: `https://huzmuglxzkaztzxjerym.supabase.co`
- Anon Key: Already set in the HTML file

## Step 4: Test the Connection

1. Open `admin.html` in your browser
2. Try logging in with:
   - Email: `admin@admin.com`
   - Password: `password123`
3. You should see the dashboard with real data from Supabase

## Features Available

### Dashboard
- View statistics for all content types
- See popular destinations and delicacies
- Monitor user activity

### User Management
- View all registered users
- Edit user information
- Manage user roles and status

### Content Management
- **Destinations**: Add/edit tourist destinations
- **Delicacies**: Manage local food items
- **Hotels**: Manage hotel listings
- **Restaurants**: Manage restaurant listings
- **Eateries**: Manage local eateries
- **Local Spots**: Manage local attractions

### Data Operations
- Create new entries
- Edit existing entries
- Delete entries (with confirmation)
- Real-time updates

## Security Features

- Row Level Security (RLS) enabled on all tables
- Admin-level policies for full access
- Secure authentication through Supabase Auth
- Input validation and error handling

## Troubleshooting

### Connection Issues
- Check if Supabase URL and key are correct
- Verify database schema is created
- Check browser console for errors

### Authentication Issues
- Ensure admin user exists in Supabase Auth
- Check if user profile exists in `users` table
- Verify email/password combination

### Data Issues
- Check if tables exist and have data
- Verify RLS policies are set correctly
- Check browser console for API errors

## Customization

### Adding New Content Types
1. Create new table in Supabase
2. Add table to admin panel routes
3. Update form fields as needed
4. Add RLS policies

### Modifying Forms
- Edit the `modal.renderForm` function
- Add new field types as needed
- Update validation rules

### Styling
- Modify CSS classes in the `<style>` section
- Update Tailwind classes for different looks
- Customize colors and layouts

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase Dashboard for data
3. Test API calls in Supabase Dashboard → API
4. Check RLS policies if data access is restricted

The admin panel is now fully connected to Supabase and ready for production use!
