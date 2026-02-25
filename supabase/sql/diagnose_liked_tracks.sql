-- Script de diagnóstico e reparo para liked_tracks
-- Execute no Supabase SQL Editor

-- 1) Primeiro, verificar se a tabela existe e sua estrutura
SELECT 
  'Tabela liked_tracks existe' as status,
  (SELECT count(*) FROM information_schema.tables WHERE table_name = 'liked_tracks') as table_exists;

-- 2) Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'liked_tracks'
ORDER BY ordinal_position;

-- 3) Verificar índices existentes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'liked_tracks';

-- 4) Verificar políticas RLS
SELECT polname, polpermissive, polroles, polcmd, polqual::text, polwithcheck::text
FROM pg_policy 
WHERE polrelid = 'liked_tracks'::regclass;

-- 5) Verificar dados existentes
SELECT count(*) as total_liked_tracks FROM public.liked_tracks;

-- 6) Criar/recriar tabela e estruturas se necessário
BEGIN;

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.liked_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  track_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Garantir que a constraint única existe
DROP INDEX IF EXISTS liked_tracks_user_track_idx;
CREATE UNIQUE INDEX liked_tracks_user_track_idx ON public.liked_tracks(user_id, track_id);

-- Grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.liked_tracks TO authenticated;

-- RLS
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS liked_tracks_select ON public.liked_tracks;
CREATE POLICY liked_tracks_select ON public.liked_tracks FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS liked_tracks_insert ON public.liked_tracks;
CREATE POLICY liked_tracks_insert ON public.liked_tracks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS liked_tracks_upsert ON public.liked_tracks;
CREATE POLICY liked_tracks_upsert ON public.liked_tracks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS liked_tracks_update ON public.liked_tracks;
CREATE POLICY liked_tracks_update ON public.liked_tracks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS liked_tracks_delete ON public.liked_tracks;
CREATE POLICY liked_tracks_delete ON public.liked_tracks FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMIT;

-- 7) Teste: Inserir um registo de teste (substitua o user_id por um válido)
-- INSERT INTO public.liked_tracks (user_id, track_id, track_data) 
-- VALUES ('YOUR_USER_ID', 'test_track_123', '{"title": "Test"}');
