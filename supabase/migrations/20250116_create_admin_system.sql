-- Create admin system for the invoice app
-- This migration adds admin roles and necessary tables for admin dashboard

-- Add role field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Create index for role
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Create admin_analytics table for storing app-wide analytics
CREATE TABLE IF NOT EXISTS public.admin_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    new_users_today INTEGER DEFAULT 0,
    active_users_last_7_days INTEGER DEFAULT 0,
    active_users_last_30_days INTEGER DEFAULT 0,
    
    -- Invoice metrics
    total_invoices INTEGER DEFAULT 0,
    invoices_created_today INTEGER DEFAULT 0,
    invoices_created_this_week INTEGER DEFAULT 0,
    invoices_created_this_month INTEGER DEFAULT 0,
    
    -- Revenue metrics
    total_revenue DECIMAL(12,2) DEFAULT 0,
    revenue_today DECIMAL(12,2) DEFAULT 0,
    revenue_this_week DECIMAL(12,2) DEFAULT 0,
    revenue_this_month DECIMAL(12,2) DEFAULT 0,
    
    -- Subscription metrics
    free_users INTEGER DEFAULT 0,
    pro_users INTEGER DEFAULT 0,
    
    -- Other metrics
    total_clients INTEGER DEFAULT 0,
    avg_invoices_per_user DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per date
    UNIQUE(date)
);

-- Create index for date lookups
CREATE INDEX IF NOT EXISTS admin_analytics_date_idx ON public.admin_analytics(date DESC);

-- Enable RLS for admin_analytics
ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_analytics (only admins can access)
CREATE POLICY "Only admins can view analytics" ON public.admin_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can insert analytics" ON public.admin_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can update analytics" ON public.admin_analytics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create admin policies for profiles table (admins can view all profiles)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles as admin_profile
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.role IN ('admin', 'super_admin')
        )
    );

-- Create admin policies for subscriptions table (admins can view all)
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update all subscriptions" ON subscriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create admin policies for invoices table (admins can view all)
CREATE POLICY "Admins can view all invoices" ON public.invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create admin policies for clients table (admins can view all)
CREATE POLICY "Admins can view all clients" ON public.clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create admin policies for user_settings table (admins can view all)
CREATE POLICY "Admins can view all user_settings" ON user_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Function to calculate and update admin analytics
CREATE OR REPLACE FUNCTION public.update_admin_analytics()
RETURNS void AS $$
DECLARE
    analytics_date DATE := CURRENT_DATE;
BEGIN
    -- Insert or update analytics for today
    INSERT INTO public.admin_analytics (
        date,
        total_users,
        new_users_today,
        active_users_last_7_days,
        active_users_last_30_days,
        total_invoices,
        invoices_created_today,
        invoices_created_this_week,
        invoices_created_this_month,
        total_revenue,
        revenue_today,
        revenue_this_week,
        revenue_this_month,
        free_users,
        pro_users,
        total_clients,
        avg_invoices_per_user
    )
    SELECT
        analytics_date,
        -- User metrics
        (SELECT COUNT(*) FROM auth.users WHERE deleted_at IS NULL),
        (SELECT COUNT(*) FROM auth.users WHERE DATE(created_at) = analytics_date AND deleted_at IS NULL),
        (SELECT COUNT(DISTINCT user_id) FROM public.invoices WHERE created_at >= analytics_date - INTERVAL '7 days'),
        (SELECT COUNT(DISTINCT user_id) FROM public.invoices WHERE created_at >= analytics_date - INTERVAL '30 days'),
        
        -- Invoice metrics
        (SELECT COUNT(*) FROM public.invoices),
        (SELECT COUNT(*) FROM public.invoices WHERE DATE(created_at) = analytics_date),
        (SELECT COUNT(*) FROM public.invoices WHERE created_at >= analytics_date - INTERVAL '7 days'),
        (SELECT COUNT(*) FROM public.invoices WHERE created_at >= analytics_date - INTERVAL '30 days'),
        
        -- Revenue metrics
        (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoices WHERE status = 'paid'),
        (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoices WHERE status = 'paid' AND DATE(updated_at) = analytics_date),
        (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoices WHERE status = 'paid' AND updated_at >= analytics_date - INTERVAL '7 days'),
        (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoices WHERE status = 'paid' AND updated_at >= analytics_date - INTERVAL '30 days'),
        
        -- Subscription metrics
        (SELECT COUNT(*) FROM subscriptions WHERE plan_type = 'free'),
        (SELECT COUNT(*) FROM subscriptions WHERE plan_type = 'pro'),
        
        -- Other metrics
        (SELECT COUNT(*) FROM public.clients),
        (SELECT CASE 
            WHEN COUNT(DISTINCT user_id) > 0 
            THEN CAST(COUNT(*) AS DECIMAL) / COUNT(DISTINCT user_id)
            ELSE 0 
        END FROM public.invoices)
    
    ON CONFLICT (date) DO UPDATE SET
        total_users = EXCLUDED.total_users,
        new_users_today = EXCLUDED.new_users_today,
        active_users_last_7_days = EXCLUDED.active_users_last_7_days,
        active_users_last_30_days = EXCLUDED.active_users_last_30_days,
        total_invoices = EXCLUDED.total_invoices,
        invoices_created_today = EXCLUDED.invoices_created_today,
        invoices_created_this_week = EXCLUDED.invoices_created_this_week,
        invoices_created_this_month = EXCLUDED.invoices_created_this_month,
        total_revenue = EXCLUDED.total_revenue,
        revenue_today = EXCLUDED.revenue_today,
        revenue_this_week = EXCLUDED.revenue_this_week,
        revenue_this_month = EXCLUDED.revenue_this_month,
        free_users = EXCLUDED.free_users,
        pro_users = EXCLUDED.pro_users,
        total_clients = EXCLUDED.total_clients,
        avg_invoices_per_user = EXCLUDED.avg_invoices_per_user,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid 
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update analytics when new invoices are created
CREATE OR REPLACE FUNCTION public.trigger_update_analytics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.update_admin_analytics();
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for invoice changes
DROP TRIGGER IF EXISTS invoice_analytics_trigger ON public.invoices;
CREATE TRIGGER invoice_analytics_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.invoices
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_update_analytics();

-- Create trigger for user creation
DROP TRIGGER IF EXISTS user_analytics_trigger ON auth.users;
CREATE TRIGGER user_analytics_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.trigger_update_analytics();

-- Update timestamp trigger for admin_analytics
CREATE TRIGGER update_admin_analytics_updated_at
    BEFORE UPDATE ON public.admin_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Initial analytics calculation
SELECT public.update_admin_analytics();


