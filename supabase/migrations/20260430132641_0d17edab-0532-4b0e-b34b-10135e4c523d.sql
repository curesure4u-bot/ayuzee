-- Add all new admin role types to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'product_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'orders_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'accounts_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'doctor_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ayush_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support_admin';