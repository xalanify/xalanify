-- =====================================================================
-- XALANIFY: Reset Completo de Tabelas - Liked Tracks, Playlists, Share Requests
-- =====================================================================
-- Este script elimina e recria todas as tabelas do zero com:
-- - Schemas corretos e otimizados
-- - RLS policies funcionais
-- - Foreign keys para auth.users(id)
-- - Índices para performance
-- =====================================================================

-- PASSO 1: Eliminar tabelas existentes (CASCADE para remover dependências)
-- =====================================================================
DROP TABLE IF EXISTS public.share_requests CASCADE;
DROP TABLE IF EXISTS public.playlists CASCADE;
DROP TABLE IF EXISTS public.liked_tracks CASCADE;

-- PASSO 2: Criar tabela LIKED_TRACKS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.liked_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  track_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_id)
);

-- Índices para performance
CREATE INDEX idx_liked_tracks_user_id ON public.liked_tracks(user_id);
CREATE INDEX idx_liked_tracks_created_at ON public.liked_tracks(created_at DESC);
CREATE INDEX idx_liked_tracks_user_created ON public.liked_tracks(user_id, created_at DESC);

-- RLS na tabela liked_tracks
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário só pode ver seus próprios favoritos
CREATE POLICY "liked_tracks_select_policy" 
  ON public.liked_tracks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Usuário só pode adicionar seus próprios favoritos
CREATE POLICY "liked_tracks_insert_policy" 
  ON public.liked_tracks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuário só pode atualizar seus próprios favoritos
CREATE POLICY "liked_tracks_update_policy" 
  ON public.liked_tracks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuário só pode deletar seus próprios favoritos
CREATE POLICY "liked_tracks_delete_policy" 
  ON public.liked_tracks FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- PASSO 3: Criar tabela PLAYLISTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text,
  tracks_json jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlists_created_at ON public.playlists(created_at DESC);

-- RLS na tabela playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário só pode ver suas próprias playlists
CREATE POLICY "playlists_select_policy" 
  ON public.playlists FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Usuário só pode criar suas próprias playlists
CREATE POLICY "playlists_insert_policy" 
  ON public.playlists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuário só pode atualizar suas próprias playlists
CREATE POLICY "playlists_update_policy" 
  ON public.playlists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuário só pode deletar suas próprias playlists
CREATE POLICY "playlists_delete_policy" 
  ON public.playlists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- PASSO 4: Criar tabela SHARE_REQUESTS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.share_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('track', 'playlist')),
  item_title text NOT NULL,
  item_payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_share_requests_to_user ON public.share_requests(to_user_id);
CREATE INDEX idx_share_requests_from_user ON public.share_requests(from_user_id);
CREATE INDEX idx_share_requests_status ON public.share_requests(status);
CREATE INDEX idx_share_requests_created ON public.share_requests(created_at DESC);

-- RLS na tabela share_requests
ALTER TABLE public.share_requests ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário pode ver requests que recebeu ou enviou
CREATE POLICY "share_requests_select_policy" 
  ON public.share_requests FOR SELECT TO authenticated
  USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

-- INSERT: Usuário autenticado pode criar requests
CREATE POLICY "share_requests_insert_policy" 
  ON public.share_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- UPDATE: Destinatário pode aceitar/rejeitar, criador pode ver o status
CREATE POLICY "share_requests_update_policy" 
  ON public.share_requests FOR UPDATE TO authenticated
  USING (auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = to_user_id);

-- DELETE: Apenas o destinatário pode deletar
CREATE POLICY "share_requests_delete_policy" 
  ON public.share_requests FOR DELETE TO authenticated
  USING (auth.uid() = to_user_id);

-- PASSO 5: Permissions (Grants)
-- =====================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.liked_tracks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.playlists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.share_requests TO authenticated;

-- PASSO 6: Verificação de Status
-- =====================================================================
SELECT 'liked_tracks' as table_name, COUNT(*) as records FROM public.liked_tracks
UNION ALL
SELECT 'playlists' as table_name, COUNT(*) as records FROM public.playlists
UNION ALL
SELECT 'share_requests' as table_name, COUNT(*) as records FROM public.share_requests;

-- PASSO 7: Listar RLS Policies Ativas
-- =====================================================================
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
