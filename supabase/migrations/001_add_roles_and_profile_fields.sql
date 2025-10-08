
-- Step 1: Create the new ENUM type for user roles.
-- This defines a list of accepted values for roles.
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'super_admin',
  'student',
  'staff',
  'employee'
);

-- Step 2: Alter the 'profiles' table to use the new 'user_role' type.
-- We'll change the column type from 'text' to 'user_role'.
-- It also changes the default role for new sign-ups to 'student'.
ALTER TABLE public.profiles
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE public.user_role USING role::public.user_role,
  ALTER COLUMN role SET DEFAULT 'student'::public.user_role;

-- Step 3: Add new columns to the 'profiles' table for role-specific data.
-- These columns are all optional (nullable) since they only apply to certain roles.
ALTER TABLE public.profiles
  ADD COLUMN course TEXT,
  ADD COLUMN student_section TEXT,
  ADD COLUMN department TEXT,
  ADD COLUMN job_title TEXT;

-- Step 4: Update the 'handle_new_user' function to set the default role.
-- This function is triggered when a new user signs up. We're setting the default
-- role to 'student' to align with the new public-facing registration flow.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'student' -- Default role for all new users is now 'student'.
  );
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Re-create the trigger to call the updated function.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
