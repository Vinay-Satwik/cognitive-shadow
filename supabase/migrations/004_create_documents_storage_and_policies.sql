-- ==============================================================================
-- COGNITIVE SHADOW — MIGRATION 004: DOCUMENTS STORAGE BUCKET & RLS POLICIES
-- ==============================================================================
-- Run this migration in the Supabase Dashboard -> SQL Editor (project: fqwxhzezmvpesevlfzrq)
-- This creates the private 'documents' storage bucket with strict user-scoped
-- access policies, verifies public.documents table columns, and removes any
-- previously auto-generated fake document records.

-- 1. Ensure public.documents table has all needed columns
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

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_path TEXT NOT NULL DEFAULT '';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_size TEXT NOT NULL DEFAULT '';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_type TEXT NOT NULL DEFAULT 'PDF';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS related_asset TEXT;

-- 2. Ensure table-level permissions and RLS for public.documents
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.documents TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

CREATE POLICY "Users can select own documents" ON public.documents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents" ON public.documents
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents" ON public.documents
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 3. Configure private Supabase Storage bucket for documents (2 MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  2097152, -- 2 MB file size limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

-- 4. Strict User-Scoped Storage Policies (auth.uid() folder isolation)
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;

CREATE POLICY "Users can upload own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (select auth.uid()::text)
);

CREATE POLICY "Users can read own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (select auth.uid()::text)
);

CREATE POLICY "Users can update own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (select auth.uid()::text)
)
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (select auth.uid()::text)
);

CREATE POLICY "Users can delete own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- 5. Clean up fake default document record created during previous onboarding tests
DELETE FROM public.documents
WHERE name = 'Health Insurance Card & Advance Directive'
  AND (file_path IS NULL OR file_path = '' OR file_path = 'none');

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
