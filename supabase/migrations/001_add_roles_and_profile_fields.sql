-- First, we need to add the new roles to the existing 'role' enum type.
-- Supabase uses enums for roles with RLS, so we alter the type.
-- Note: The type name might be different in your project (e.g., app_role).
-- Please verify the type name in your Supabase project's database types.
-- This command is idempotent; it won't add the value if it already exists.

ALTER TYPE public.role ADD VALUE IF NOT EXISTS 'student';
ALTER TYPE public.role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE public.role ADD VALUE IF NOT EXISTS 'employee';


-- Second, we add the new nullable columns to the 'profiles' table.
-- They are nullable because a student won't have a 'department',
-- and an admin won't have a 'course'.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS course TEXT,
  ADD COLUMN IF NOT EXISTS student_section TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Add comments to the new columns for clarity
COMMENT ON COLUMN public.profiles.course IS 'The course of study for a student.';
COMMENT ON COLUMN public.profiles.student_section IS 'The section or class for a student.';
COMMENT ON COLUMN public.profiles.department IS 'The department for an employee or staff member.';
COMMENT ON COLUMN public.profiles.job_title IS 'The job title for an employee or staff member.';
