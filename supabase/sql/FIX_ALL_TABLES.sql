-- =====================================================================
-- COMPLETE FIX: Create all tables with proper constraints and RLS
-- Run this in Supabase SQL Editor
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1. PLAYLISTS TABLE
-- =====================================================================
DROP TABLE IF EXISTS public.playlists CASCADE;

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

-- =====================================================================
-- 2. LIKED TRACKS TABLE
-- =====================================================================
DROP TABLE IF EXISTS public.liked_tracks CASCADE;

CREATE TABLE public.liked_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  track_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT liked_tracks_user_track_unique UNIQUE (user_id, track_id)
);

-- =====================================================================
-- 3. SHARE REQUESTS TABLE
-- =====================================================================
DROP TABLE IF EXISTS public.share_requests CASCADE;

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

-- =====================================================================
-- 4. GRANTS - Allow all authenticated operations
-- =====================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.playlists TO authenticated;
GRANT ALL ON TABLE public.liked_tracks TO authenticated;
GRANT ALL ON TABLE public.share_requests TO authenticated;

-- Also grant to anon for testing (remove in production)
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE public.playlists TO anon;
GRANT ALL ON table public.liked_tracks TO anon;
GRANT ALL ON TABLE public.share_requests TO anon;

-- =====================================================================
-- 5. ENABLE RLS
-- =====================================================================
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 6. RLS POLICIES - Simplified for owner-only access
-- =====================================================================

-- Playlists: Owner can do everything
DROP POLICY IF EXISTS "Owner can manage playlists" ON public.playlists;
CREATE POLICY "Owner can manage playlists" ON public.playlists
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Liked Tracks: Owner can do everything
DROP POLICY IF EXISTS "Owner can manage liked tracks" ON public.liked_tracks;
CREATE POLICY "Owner can manage liked tracks" ON public.liked_tracks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Share Requests: Participants can do everything
DROP POLICY IF EXISTS "Participants can manage share requests" ON public.share_requests;
CREATE POLICY "Participants can manage share requests" ON public.share_requests
  FOR ALL TO authenticated
  USING (auth.uid() = to_user_id OR auth.uid() = from_user_id)
  WITH CHECK (auth.uid() = to_user_id OR auth.uid() = from_user_id);

-- =====================================================================
-- 7. INDEXES
-- =====================================================================
DROP INDEX IF EXISTS playlists_user_id_idx;
CREATE INDEX playlists_user_id_idx ON public.playlists(user_id);

DROP INDEX IF EXISTS liked_tracks_user_id_idx;
CREATE INDEX liked_tracks_user_id_idx ON public.liked_tracks(user_id);

DROP INDEX IF EXISTS liked_tracks_user_track_idx;
CREATE UNIQUE INDEX liked_tracks_user_track_idx ON public.liked_tracks(user_id, track_id);

DROP INDEX IF EXISTS share_requests_to_user_idx;
CREATE INDEX share_requests_to_user_idx ON public.share_requests(to_user_id);

DROP INDEX IF EXISTS share_requests_from_user_idx;
CREATE INDEX share_requests_from_user_idx ON public.share_requests(from_user_id);

-- =====================================================================
-- 8. IMPORT PLAYLIST FUNCTION
-- =====================================================================
-- First drop any existing function with this name
DROP FUNCTION IF EXISTS public.import_playlist_by_id(UUID, TEXT);

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
    RETURN jsonb_build_object('success', false, 'error', 'IDs obrigatorios.');
  END IF;

  -- Buscar playlist por UUID
  SELECT * INTO v_playlist
  FROM public.playlists
  WHERE id::TEXT = p_playlist_id
  LIMIT 1;

  -- Se nao encontrou, buscar por nome parcial
  IF v_playlist IS NULL THEN
    SELECT * INTO v_playlist
    FROM public.playlists
    WHERE LOWER(name) = LOWER(p_playlist_id)
    LIMIT 1;
  END IF;

  IF v_playlist IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Playlist nao encontrada.');
  END IF;

  -- Criar copia da playlist
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.import_playlist_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.import_playlist_by_id TO anon;

COMMIT;

-- =====================================================================
-- VERIFY TABLES
-- =====================================================================
SELECT 
  'playlists' as table_name, 
  count(*) as row_count,
  (SELECT count(*) FROM information_schema.table_constraints WHERE table_name = 'playlists' AND constraint_type = 'UNIQUE CONSTRAINT') as unique_constraints
FROM public.playlists
UNION ALL
SELECT 
  'liked_tracks', 
  count(*),
  (SELECT count(*) FROM information_schema.table_constraints WHERE table_name = 'liked_tracks' AND constraint_type = 'UNIQUE CONSTRAINT')
FROM public.liked_tracks
UNION ALL
SELECT 
  'share_requests', 
  count(*),
  (SELECT count(*) FROM information_schema.table_constraints WHERE table_name = 'share_requests' AND constraint_type = 'UNIQUE CONSTRAINT')
FROM public.share_requests;
