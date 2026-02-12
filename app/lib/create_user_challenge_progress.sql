
-- Create user_challenge_progress table if not exists (Basic structure)
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id text NOT NULL REFERENCES public.challenges(id),
  PRIMARY KEY (user_id, challenge_id)
);

-- Ensure columns exist (Idempotent updates)
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('completed', 'in_progress', 'failed')) DEFAULT 'in_progress';
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS stars integer DEFAULT 0;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS code_submitted text;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS execution_time_ms integer;
ALTER TABLE public.user_challenge_progress ADD COLUMN IF NOT EXISTS executed_at timestamptz DEFAULT now();

-- Enable RLS
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Policies (Drop first to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_challenge_progress;
CREATE POLICY "Users can insert their own progress" ON public.user_challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_challenge_progress;
CREATE POLICY "Users can update their own progress" ON public.user_challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read their own progress" ON public.user_challenge_progress;
CREATE POLICY "Users can read their own progress" ON public.user_challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Match History Table
CREATE TABLE IF NOT EXISTS public.match_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mode text,
    winner_name text,
    participants_count integer,
    results jsonb,
    played_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id)
);
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert match history" ON public.match_history;
CREATE POLICY "Authenticated users can insert match history" ON public.match_history
    FOR INSERT TO authenticated WITH CHECK (true);
    
DROP POLICY IF EXISTS "Authenticated users can read match history" ON public.match_history;
CREATE POLICY "Authenticated users can read match history" ON public.match_history
    FOR SELECT TO authenticated USING (true);

-- Reload Schema Cache (Important for new columns to be seen by API)
NOTIFY pgrst, 'reload config';

