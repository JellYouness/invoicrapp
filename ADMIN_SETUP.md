# Admin Dashboard Setup Guide

This guide explains how to set up and use the admin dashboard for Invoice Wiz Craft.

## Features

The admin dashboard provides:

### 📊 Analytics Dashboard

- **User Metrics**: Total users, new signups, active users
- **Revenue Analytics**: Total revenue, daily/weekly/monthly trends
- **Invoice Statistics**: Invoice creation patterns and trends
- **Subscription Breakdown**: Free vs Pro user distribution
- **Growth Charts**: Visual representation of user, revenue, and invoice growth

### 👥 User Management

- **User Overview**: Complete list of all users with detailed information
- **Role Management**: Assign admin and super admin roles
- **Subscription Management**: Update user subscription plans
- **User Details**: View comprehensive user profiles including invoices and clients
- **Account Management**: Delete user accounts (super admin only)

### 🔐 Access Control

- **Admin Roles**: Two levels of admin access
  - **Admin**: Can view analytics and manage user subscriptions
  - **Super Admin**: Full access including user deletion and role management

## Database Setup

1. **Run the migration**:

   ```sql
   -- Apply the admin system migration
   \i supabase/migrations/20250116_create_admin_system.sql
   ```

2. **Set up your first admin user**:
   ```sql
   -- Replace 'your-user-id' with your actual user ID
   UPDATE profiles
   SET role = 'super_admin'
   WHERE user_id = 'your-user-id';
   ```

## Admin Dashboard Access

### For Users

- Admin access link will appear in the dashboard sidebar for users with admin privileges
- Navigate to `/admin` to access the admin dashboard

### URL Access

- Direct URL: `https://your-domain.com/admin`
- Protected route - only accessible to users with admin or super_admin roles

## Admin Features Overview

### Analytics Tab

- **Real-time Metrics**: Current system statistics
- **Historical Data**: Trends over different time periods (7 days, 30 days, 90 days, 1 year)
- **Growth Rates**: Percentage change in users, revenue, and invoices
- **Top Users**: Users generating the most revenue
- **System Health**: Overview of platform performance

### User Management Tab

- **User List**: Paginated table of all users
- **Search & Filter**: Find users by email, name, role, or subscription plan
- **User Actions**:
  - View detailed user profile
  - Edit user role and subscription
  - Delete user account (super admin only)
- **User Details Modal**: Complete view of user data including:
  - Profile information
  - Subscription status
  - Invoice history
  - Client list

## Security Features

### Row Level Security (RLS)

- All admin tables have RLS enabled
- Only users with admin roles can access admin data
- Super admin restrictions for sensitive operations

### Admin Policies

- **View Access**: Admins can view all user data across the platform
- **Edit Permissions**: Role-based editing permissions
- **Delete Restrictions**: Only super admins can delete users

### Data Protection

- Sensitive operations require super admin privileges
- All admin actions are logged and tracked
- User data is protected with proper access controls

## Usage Instructions

### Assigning Admin Roles

1. **Make a user admin**:

   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE user_id = 'user-uuid';
   ```

2. **Make a user super admin**:

   ```sql
   UPDATE profiles
   SET role = 'super_admin'
   WHERE user_id = 'user-uuid';
   ```

3. **Remove admin privileges**:
   ```sql
   UPDATE profiles
   SET role = 'user'
   WHERE user_id = 'user-uuid';
   ```

### Managing User Subscriptions

Admins can update user subscription plans through the admin dashboard:

- Change from Free to Pro plan
- Downgrade Pro users to Free
- Update subscription status (active, cancelled, expired)

### Viewing Analytics

The analytics are automatically updated using database triggers:

- New user registrations
- Invoice creation and updates
- Revenue calculations
- Subscription changes

Manual refresh available through the dashboard interface.

## API Functions

The admin system includes several database functions:

### `update_admin_analytics()`

- Recalculates all analytics data
- Called automatically via triggers
- Can be called manually for refresh

### `is_admin(user_uuid)`

- Checks if a user has admin privileges
- Returns boolean
- Used for access control

### `is_super_admin(user_uuid)`

- Checks if a user has super admin privileges
- Returns boolean
- Used for sensitive operations

## Monitoring and Maintenance

### Analytics Data

- Analytics are updated in real-time via database triggers
- Historical data is preserved for trend analysis
- Manual recalculation available if needed

### Performance

- Indexes on key fields for fast queries
- Efficient pagination for large user lists
- Optimized queries for analytics calculations

### Backup Considerations

- Admin analytics table contains aggregated data
- Can be regenerated if needed
- Regular database backups recommended

## Troubleshooting

### Admin Access Issues

1. **Can't see admin dashboard**: Check user role in profiles table
2. **Access denied errors**: Ensure RLS policies are applied correctly
3. **Missing data**: Run `update_admin_analytics()` function

### Common Issues

1. **Analytics not updating**: Check database triggers are active
2. **User management errors**: Verify admin permissions
3. **Performance issues**: Check database indexes

### Support

For additional support or customization needs, refer to the main application documentation or contact the development team.

## Security Best Practices

1. **Limit super admin access** to trusted personnel only
2. **Regular audit** of admin user roles
3. **Monitor admin actions** through application logs
4. **Use strong authentication** for admin accounts
5. **Regular backup** of admin analytics data

## Future Enhancements

Planned features for future versions:

- Audit logging for admin actions
- Advanced analytics with custom date ranges
- Email notifications for admin events
- Bulk user management operations
- Export capabilities for user and analytics data



