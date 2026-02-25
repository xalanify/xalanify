-- ============================================================
-- COMPLETE FIX - Criar tabelas, funções e políticas desde o início
-- Executar no Supabase SQL Editor
-- ============================================================

BEGIN;

-- ============================================================
-- 1) DROPS (começar limpo)
-- ============================================================
DROP TABLE IF EXISTS public.playlists CASCADE;
DROP TABLE IF EXISTS public.liked_tracks CASCADE;
DROP TABLE IF EXISTS public.share_requests CASCADE;

DROP FUNCTION IF EXISTS public.add_liked_track(uuid, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.remove_liked_track(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_playlist_fn(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.add_track_to_playlist_fn(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.remove_track_from_playlist_fn(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.check_playlist_exists(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.import_playlist_by_id(uuid, text) CASCADE;

-- ============================================================
-- 2) CREATE TABLES
-- ============================================================

-- Playlists table
CREATE TABLE public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tracks_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT playlists_user_name_unique UNIQUE (user_id, name)
);

-- Liked tracks table
CREATE TABLE public.liked_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  track_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT liked_tracks_user_track_unique UNIQUE (user_id, track_id)
);

-- Share requests table
CREATE TABLE public.share_requests (
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

-- ============================================================
-- 3) GRANTS
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- ============================================================
-- 4) INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS playlists_user_id_idx ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS playlists_user_name_idx ON public.playlists(user_id, LOWER(name));
CREATE INDEX IF NOT EXISTS liked_tracks_user_id_idx ON public.liked_tracks(user_id);
CREATE INDEX IF NOT EXISTS liked_tracks_user_track_idx ON public.liked_tracks(user_id, track_id);
CREATE INDEX IF NOT EXISTS share_requests_to_user_idx ON public.share_requests(to_user_id);
CREATE INDEX IF NOT EXISTS share_requests_from_user_idx ON public.share_requests(from_user_id);

-- ============================================================
-- 5) RLS - ATIVAR COM POLÍTICAS MUITO PERMISSIVAS
-- ============================================================
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_requests ENABLE ROW LEVEL SECURITY;

-- Playlists policies - everyone can do everything (for testing)
CREATE POLICY "playlists_all_authenticated" ON public.playlists
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "playlists_all_anon" ON public.playlists
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- Liked tracks policies - everyone can do everything (for testing)
CREATE POLICY "liked_tracks_all_authenticated" ON public.liked_tracks
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "liked_tracks_all_anon" ON public.liked_tracks
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- Share requests policies
CREATE POLICY "share_requests_all_authenticated" ON public.share_requests
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 6) FUNCTIONS
-- ============================================================

-- Add liked track function
CREATE OR REPLACE FUNCTION public.add_liked_track(
  p_user_id uuid,
  p_track_id text,
  p_track_data jsonb
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO public.liked_tracks (user_id, track_id, track_data)
  VALUES (p_user_id, p_track_id, p_track_data)
  ON CONFLICT (user_id, track_id) DO UPDATE
  SET track_data = EXCLUDED.track_data,
      updated_at = now();
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in add_liked_track: %', SQLERRM;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.add_liked_track TO authenticated, anon;

-- Remove liked track function
CREATE OR REPLACE FUNCTION public.remove_liked_track(
  p_user_id uuid,
  p_track_id text
)
RETURNS boolean AS $$
BEGIN
  DELETE FROM public.liked_tracks WHERE user_id = p_user_id AND track_id = p_track_id;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in remove_liked_track: %', SQLERRM;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.remove_liked_track TO authenticated, anon;

-- Create playlist function
CREATE OR REPLACE FUNCTION public.create_playlist_fn(
  p_user_id uuid,
  p_name text,
  p_image_url text DEFAULT NULL
)
RETURNS TABLE (id uuid, name text, created_at timestamptz) AS $$
BEGIN
  INSERT INTO public.playlists (user_id, name, tracks_json, image_url)
  VALUES (p_user_id, p_name, '[]'::jsonb, p_image_url)
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN QUERY
  SELECT p.id, p.name, p.created_at
  FROM public.playlists p
  WHERE p.user_id = p_user_id AND p.name = p_name
  LIMIT 1;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in create_playlist_fn: %', SQLERRM;
  RETURN QUERY SELECT NULL::uuid, NULL::text, NULL::timestamptz WHERE false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_playlist_fn TO authenticated, anon;

-- Import playlist function
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

  SELECT * INTO v_playlist
  FROM public.playlists
  WHERE id::TEXT = p_playlist_id OR id::TEXT LIKE '%' || p_playlist_id || '%'
  LIMIT 1;

  IF v_playlist IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Playlist não encontrada.');
  END IF;

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

GRANT EXECUTE ON FUNCTION public.import_playlist_by_id TO authenticated, anon;

COMMIT;

-- ============================================================
-- 7) TEST INSERT
-- ============================================================
INSERT INTO public.playlists (user_id, name, tracks_json)
VALUES ('0fa809b2-4637-4cc1-88f8-a2afcb2b2ceb', 'COMPLETE_FIX_TEST', '[]')
RETURNING id, name;

-- Verify
SELECT 'playlists' as table_name, count(*) FROM public.playlists
UNION ALL
SELECT 'liked_tracks', count(*) FROM public.liked_tracks;
