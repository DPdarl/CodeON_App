-- Add stars column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stars INTEGER DEFAULT 0;

-- Ensure RLS allows reading this column (usually automatic for public tables but good to verify policies if they restrict columns)
-- Existing policies should cover "select *" so this should be fine.
