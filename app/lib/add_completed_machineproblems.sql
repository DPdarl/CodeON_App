-- Add completed_machineproblems column to users table to track challenge progress
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS completed_machineproblems text[] DEFAULT '{}';

-- Notify simple reload
NOTIFY pgrst, 'reload config';
