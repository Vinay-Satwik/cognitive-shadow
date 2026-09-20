-- ==============================================================================
-- COGNITIVE SHADOW — MIGRATION 003: CRISIS SESSIONS RLS POLICIES & GRANTS
-- ==============================================================================
-- Run this migration in the Supabase Dashboard -> SQL Editor (project: fqwxhzezmvpesevlfzrq)
-- This ensures public.crisis_sessions has necessary columns, grants proper table
-- privileges to authenticated users, and establishes strict RLS policies.

-- 1. Ensure table and all columns exist
CREATE TABLE IF NOT EXISTS public.crisis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario TEXT NOT NULL,
  scenario_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'resolved')),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crisis_sessions ADD COLUMN IF NOT EXISTS scenario_id TEXT;
ALTER TABLE public.crisis_sessions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.crisis_sessions ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.crisis_sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;
ALTER TABLE public.crisis_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Grant table privileges to API roles (required before RLS can evaluate)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.crisis_sessions TO authenticated;
GRANT SELECT ON TABLE public.crisis_sessions TO anon;

-- 3. Ensure Row Level Security is enabled
ALTER TABLE public.crisis_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing / duplicate policies
DROP POLICY IF EXISTS "Users can create their own crisis sessions" ON public.crisis_sessions;
DROP POLICY IF EXISTS "Users can view their own crisis sessions" ON public.crisis_sessions;
DROP POLICY IF EXISTS "Users can update their own crisis sessions" ON public.crisis_sessions;
DROP POLICY IF EXISTS "Users can delete their own crisis sessions" ON public.crisis_sessions;
DROP POLICY IF EXISTS "Users can select own crisis sessions" ON public.crisis_sessions;
DROP POLICY IF EXISTS "Users can insert own crisis sessions" ON public.crisis_sessions;
DROP POLICY IF EXISTS "Users can update own crisis sessions" ON public.crisis_sessions;
DROP POLICY IF EXISTS "Users can delete own crisis sessions" ON public.crisis_sessions;

-- 5. Create minimum strict policies required for authenticated users (user_id = auth.uid())

-- INSERT Policy
CREATE POLICY "Users can create their own crisis sessions"
ON public.crisis_sessions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- SELECT Policy
CREATE POLICY "Users can view their own crisis sessions"
ON public.crisis_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- UPDATE Policy
CREATE POLICY "Users can update their own crisis sessions"
ON public.crisis_sessions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
