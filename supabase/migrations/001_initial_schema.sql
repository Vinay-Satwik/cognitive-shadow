-- ==============================================================================
-- COGNITIVE SHADOW — PHASE 2A INITIAL DATABASE SCHEMA
-- ==============================================================================
-- Migration: 001_initial_schema.sql
-- Description: Foundation schema for Cognitive Shadow personal crisis operating system.
-- Includes:
--   1. extensions
--   2. profiles
--   3. documents
--   4. assets
--   5. emergency_contacts
--   6. emergency_plans
--   7. crisis_sessions
--   8. crisis_tasks
--   9. secure_shares
--   10. timeline_events
--   11. indexes & constraints
--   12. Row Level Security (RLS) & Policies
--   13. Triggers for profiles & timestamps
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. USER PROFILES
-- ==============================================================================
-- Profile model bound to Supabase Auth auth.users.id
-- Sensitive passwords remain isolated in auth.users; never stored in profiles.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  first_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  blood_group TEXT DEFAULT '',
  allergies TEXT DEFAULT '',
  medical_notes TEXT DEFAULT '',
  emergency_directive TEXT DEFAULT '',
  primary_location TEXT DEFAULT '',
  avatar_url TEXT,
  has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for profiles updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Automatic trigger to create profile record when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_name TEXT;
  extracted_first TEXT;
BEGIN
  extracted_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  IF extracted_name <> '' THEN
    extracted_first := split_part(extracted_name, ' ', 1);
  ELSE
    extracted_first := '';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    extracted_name,
    extracted_first
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. DOCUMENTS
-- ==============================================================================
-- Secure personal vault records (Identity, Medical, Insurance, Vehicle, Property, Legal)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Identity', 'Medical', 'Insurance', 'Vehicle', 'Property', 'Legal', 'Other')),
  description TEXT NOT NULL DEFAULT '',
  file_path TEXT NOT NULL DEFAULT '',
  file_size TEXT NOT NULL DEFAULT '1.2 MB',
  file_type TEXT NOT NULL DEFAULT 'PDF',
  expiry_date TEXT,
  emergency_access_level TEXT NOT NULL DEFAULT 'Important' CHECK (emergency_access_level IN ('Critical', 'Important', 'Standard', 'Restricted')),
  relevance_tags TEXT[] NOT NULL DEFAULT '{}',
  related_asset TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. ASSETS
-- ==============================================================================
-- Critical personal assets: vehicles, properties, medical devices, key equipment
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Vehicle',
  registration_or_serial TEXT NOT NULL DEFAULT '',
  insurer TEXT NOT NULL DEFAULT '',
  policy_number TEXT NOT NULL DEFAULT '',
  estimated_value TEXT NOT NULL DEFAULT '',
  warranty_status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT NOT NULL DEFAULT '',
  related_documents TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. EMERGENCY CONTACTS
-- ==============================================================================
-- Emergency proxies, care circle members, legal executors, medical responders
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'Proxy',
  role TEXT NOT NULL DEFAULT 'Emergency Contact',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  is_medical_proxy BOOLEAN NOT NULL DEFAULT FALSE,
  availability TEXT NOT NULL DEFAULT '24/7 Standby',
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce at most one primary contact per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_emergency_contacts_single_primary
  ON public.emergency_contacts (user_id)
  WHERE is_primary = TRUE;

CREATE TRIGGER set_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. EMERGENCY PLANS
-- ==============================================================================
-- Contingency playbooks for five core crisis scenarios
CREATE TABLE IF NOT EXISTS public.emergency_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN (
    'Major Automobile Accident',
    'Critical Medical Emergency',
    'Home / Property Emergency',
    'Travel Emergency',
    'Identity / Document Loss'
  )),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '🛡️',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  relevant_document_ids UUID[] NOT NULL DEFAULT '{}',
  relevant_asset_ids UUID[] NOT NULL DEFAULT '{}',
  relevant_contact_ids UUID[] NOT NULL DEFAULT '{}',
  default_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  sharing_rules TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_emergency_plans_updated_at
  BEFORE UPDATE ON public.emergency_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 7. CRISIS SESSIONS
-- ==============================================================================
-- Live crisis activation tracking
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

-- ==============================================================================
-- 8. CRISIS TASKS
-- ==============================================================================
-- Priority response tasks executed during an active crisis session
CREATE TABLE IF NOT EXISTS public.crisis_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crisis_session_id UUID NOT NULL REFERENCES public.crisis_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_contact_id UUID REFERENCES public.emergency_contacts(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TRIGGER set_crisis_tasks_updated_at
  BEFORE UPDATE ON public.crisis_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. SECURE SHARES
-- ==============================================================================
-- Time-bounded emergency access granted to responders/insurers/contacts
CREATE TABLE IF NOT EXISTS public.secure_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crisis_session_id UUID REFERENCES public.crisis_sessions(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  recipient_information TEXT NOT NULL,
  recipient_email TEXT,
  access_status TEXT NOT NULL DEFAULT 'Active' CHECK (access_status IN ('Active', 'Revoked', 'Expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- ==============================================================================
-- 10. TIMELINE EVENTS
-- ==============================================================================
-- Immutable operational audit trail for crisis actions
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crisis_session_id UUID REFERENCES public.crisis_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 11. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_category ON public.documents(user_id, category);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_plans_user_id ON public.emergency_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_sessions_user_id ON public.crisis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_sessions_status ON public.crisis_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_crisis_tasks_session ON public.crisis_tasks(crisis_session_id);
CREATE INDEX IF NOT EXISTS idx_crisis_tasks_user ON public.crisis_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_secure_shares_session ON public.secure_shares(crisis_session_id);
CREATE INDEX IF NOT EXISTS idx_secure_shares_user ON public.secure_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_session ON public.timeline_events(crisis_session_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user ON public.timeline_events(user_id);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Every user-owned table enforces strict Row Level Security.
-- Users can only SELECT, INSERT, UPDATE, and DELETE rows where user_id = auth.uid().
-- Profiles table enforces id = auth.uid().

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can select own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Documents Policies
CREATE POLICY "Users can select own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Assets Policies
CREATE POLICY "Users can select own assets" ON public.assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON public.assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON public.assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON public.assets
  FOR DELETE USING (auth.uid() = user_id);

-- Emergency Contacts Policies
CREATE POLICY "Users can select own contacts" ON public.emergency_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON public.emergency_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON public.emergency_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON public.emergency_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Emergency Plans Policies
CREATE POLICY "Users can select own emergency plans" ON public.emergency_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency plans" ON public.emergency_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency plans" ON public.emergency_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency plans" ON public.emergency_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Crisis Sessions Policies
CREATE POLICY "Users can select own crisis sessions" ON public.crisis_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crisis sessions" ON public.crisis_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crisis sessions" ON public.crisis_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crisis sessions" ON public.crisis_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Crisis Tasks Policies
CREATE POLICY "Users can select own crisis tasks" ON public.crisis_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crisis tasks" ON public.crisis_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crisis tasks" ON public.crisis_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crisis tasks" ON public.crisis_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Secure Shares Policies
CREATE POLICY "Users can select own secure shares" ON public.secure_shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own secure shares" ON public.secure_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own secure shares" ON public.secure_shares
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own secure shares" ON public.secure_shares
  FOR DELETE USING (auth.uid() = user_id);

-- Timeline Events Policies
CREATE POLICY "Users can select own timeline events" ON public.timeline_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline events" ON public.timeline_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline events" ON public.timeline_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline events" ON public.timeline_events
  FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- 13. ROLE GRANTS (Permit PostgREST anon & authenticated access filtered by RLS)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
