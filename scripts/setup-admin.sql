-- Setup script for creating the first admin user
-- Instructions:
-- 1. First, create a user account through the normal signup process in your app
-- 2. Replace 'younessjellouli12@gmail.com' with the actual email of the user you want to make admin
-- 3. Run this script in your Supabase SQL Editor

-- STEP 1: Check existing users and their current roles
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- STEP 2: Set a user as super admin (replace the email below)
UPDATE profiles 
SET role = 'super_admin' 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'younessjellouli12@gmail.com' 
  LIMIT 1
);

-- If the above doesn't work (user might not have a profile yet), create one:
INSERT INTO profiles (user_id, role, full_name)
SELECT 
  id,
  'super_admin',
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User')
FROM auth.users 
WHERE email = 'younessjellouli12@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin';

-- STEP 3: Verify the admin user was set correctly
SELECT 
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE p.role IN ('admin', 'super_admin');

-- STEP 4: Initialize admin analytics (this will be done automatically via triggers)
SELECT update_admin_analytics();

-- STEP 5: Test the admin functions (replace email)
SELECT 'is_admin result:' as test, is_admin((SELECT id FROM auth.users WHERE email = 'younessjellouli12@gmail.com' LIMIT 1)) as result;
SELECT 'is_super_admin result:' as test, is_super_admin((SELECT id FROM auth.users WHERE email = 'younessjellouli12@gmail.com' LIMIT 1)) as result;

-- STEP 6: Final verification - show all admin users
SELECT 
  u.email,
  p.role,
  'Admin functions working: ' || 
  CASE 
    WHEN is_admin(u.id) AND is_super_admin(u.id) THEN 'YES (Super Admin)'
    WHEN is_admin(u.id) THEN 'YES (Admin)'
    ELSE 'NO'
  END as status
FROM auth.users u
JOIN profiles p ON u.id = p.user_id
WHERE p.role IN ('admin', 'super_admin');
