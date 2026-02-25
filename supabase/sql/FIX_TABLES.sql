-- Script para corrigir tabelas em falta no Supabase
-- Execute este script no Supabase SQL Editor

BEGIN;

-- 1) Criar playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tracks_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Criar liked_tracks table
CREATE TABLE IF NOT EXISTS public.liked_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  track_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Criar share_requests table (para partilhas)
CREATE TABLE IF NOT EXISTS public.share_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_username text NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('track', 'playlist')),
  item_title text NOT NULL,
  item_payload jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4) Grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.playlists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.liked_tracks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.share_requests TO authenticated;

-- 5) Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_requests ENABLE ROW LEVEL SECURITY;

-- 6) Índices
CREATE INDEX IF NOT EXISTS playlists_user_id_idx ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS liked_tracks_user_id_idx ON public.liked_tracks(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS liked_tracks_user_track_idx ON public.liked_tracks(user_id, track_id);
CREATE INDEX IF NOT EXISTS share_requests_to_user_idx ON public.share_requests(to_user_id);
CREATE INDEX IF NOT EXISTS share_requests_from_user_idx ON public.share_requests(from_user_id);

-- 7) Políticas RLS para playlists
-- Permite ao dono ver as suas próprias playlists
DROP POLICY IF EXISTS playlists_select ON public.playlists;
CREATE POLICY playlists_select ON public.playlists FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Permite a qualquer utilizador autenticado ver playlists para importar
DROP POLICY IF EXISTS playlists_select_public ON public.playlists;
CREATE POLICY playlists_select_public ON public.playlists FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS playlists_insert ON public.playlists;
CREATE POLICY playlists_insert ON public.playlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS playlists_update ON public.playlists;
CREATE POLICY playlists_update ON public.playlists FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS playlists_delete ON public.playlists;
CREATE POLICY playlists_delete ON public.playlists FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 8) Políticas RLS para liked_tracks
DROP POLICY IF EXISTS liked_tracks_select ON public.liked_tracks;
CREATE POLICY liked_tracks_select ON public.liked_tracks FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS liked_tracks_insert ON public.liked_tracks;
CREATE POLICY liked_tracks_insert ON public.liked_tracks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS liked_tracks_update ON public.liked_tracks;
CREATE POLICY liked_tracks_update ON public.liked_tracks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS liked_tracks_delete ON public.liked_tracks;
CREATE POLICY liked_tracks_delete ON public.liked_tracks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 9) Políticas RLS para share_requests
DROP POLICY IF EXISTS share_requests_select_incoming ON public.share_requests;
CREATE POLICY share_requests_select_incoming ON public.share_requests FOR SELECT TO authenticated USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

DROP POLICY IF EXISTS share_requests_insert ON public.share_requests;
CREATE POLICY share_requests_insert ON public.share_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS share_requests_update ON public.share_requests;
CREATE POLICY share_requests_update ON public.share_requests FOR UPDATE TO authenticated USING (auth.uid() = to_user_id) WITH CHECK (auth.uid() = to_user_id);

-- 10) Função RPC para importar playlist por ID
CREATE OR REPLACE FUNCTION public.import_playlist_by_id(
  p_requester_id UUID,
  p_playlist_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_playlist RECORD;
  v_new_playlist RECORD;
  v_track_count INT := 0;
BEGIN
  IF p_requester_id IS NULL OR p_playlist_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'IDs obrigatórios.');
  END IF;

  -- Buscar playlist por UUID ou nome
  SELECT * INTO v_playlist
  FROM public.playlists
  WHERE id::TEXT = p_playlist_id OR id::TEXT LIKE '%' || p_playlist_id || '%'
  LIMIT 1;

  IF v_playlist IS NULL THEN
    SELECT * INTO v_playlist
    FROM public.playlists
    WHERE LOWER(name) = LOWER(p_playlist_id)
    LIMIT 1;
  END IF;

  IF v_playlist IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Playlist não encontrada.');
  END IF;

  -- Criar cópia da playlist
  INSERT INTO public.playlists (user_id, name, tracks_json, image_url)
  VALUES (p_requester_id, v_playlist.name, v_playlist.tracks_json, v_playlist.image_url)
  RETURNING id, name, tracks_json INTO v_new_playlist;

  SELECT COALESCE(array_length(v_playlist.tracks_json, 1), 0) INTO v_track_count;

  RETURN jsonb_build_object(
    'success', true,
    'name', v_new_playlist.name,
    'track_count', v_track_count,
    'playlist_id', v_new_playlist.id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', 'Erro: ' || SQLERRM);
END;
$$;

COMMIT;

-- Verificar se as tabelas foram criadas
SELECT 'playlists' as table_name, count(*) as row_count FROM public.playlists
UNION ALL
SELECT 'liked_tracks', count(*) FROM public.liked_tracks
UNION ALL
SELECT 'share_requests', count(*) FROM public.share_requests;
