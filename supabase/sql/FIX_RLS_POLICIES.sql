-- Script para corrigir políticas RLS
-- Executar no Supabase SQL Editor

BEGIN;

-- 1) Eliminar políticas antigas (se existirem)
DROP POLICY IF EXISTS "Allow all on playlists for owner" ON public.playlists;
DROP POLICY IF EXISTS "Allow all on liked_tracks for owner" ON public.liked_tracks;
DROP POLICY IF EXISTS "playlists_select" ON public.playlists;
DROP POLICY IF EXISTS "playlists_insert" ON public.playlists;
DROP POLICY IF EXISTS "playlists_update" ON public.playlists;
DROP POLICY IF EXISTS "playlists_delete" ON public.playlists;
DROP POLICY IF EXISTS "liked_tracks_select" ON public.liked_tracks;
DROP POLICY IF EXISTS "liked_tracks_insert" ON public.liked_tracks;
DROP POLICY IF EXISTS "liked_tracks_update" ON public.liked_tracks;
DROP POLICY IF EXISTS "liked_tracks_delete" ON public.liked_tracks;

-- 2) Criar políticas simples e permissivas para playlists
-- SELECT: qualquer utilizador autenticado pode ver playlists
CREATE POLICY playlists_select ON public.playlists
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: qualquer utilizador pode criar playlists para si
CREATE POLICY playlists_insert ON public.playlists
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: qualquer utilizador pode editar as suas próprias playlists
CREATE POLICY playlists_update ON public.playlists
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: qualquer utilizador pode eliminar as suas próprias playlists
CREATE POLICY playlists_delete ON public.playlists
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 3) Criar políticas simples e permissivas para liked_tracks
-- SELECT: qualquer utilizador autenticado pode ver favoritos
CREATE POLICY liked_tracks_select ON public.liked_tracks
  FOR SELECT TO authenticated
  USING (true);

-- INSERT: qualquer utilizador pode adicionar favoritos para si
CREATE POLICY liked_tracks_insert ON public.liked_tracks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: qualquer utilizador pode editar os seus favoritos
CREATE POLICY liked_tracks_update ON public.liked_tracks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: qualquer utilizador pode remover os seus favoritos
CREATE POLICY liked_tracks_delete ON public.liked_tracks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4) Reativar RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;

-- 5) Testar insert
INSERT INTO public.playlists (user_id, name, tracks_json)
VALUES ('0fa809b2-4637-4cc1-88f8-a2afcb2b2ceb', 'TESTE_RLS_FIX', '[]')
RETURNING id, name;

COMMIT;
