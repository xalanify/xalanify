-- =====================================================================
-- Simple fix - just create tables and function
-- Run this in Supabase SQL Editor
-- =====================================================================

-- Step 1: Create tables (IF NOT EXISTS won't fail if they exist)
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tracks_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.liked_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  track_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Step 2: Add unique constraints (will fail silently if already exists, that's ok)
ALTER TABLE public.playlists ADD CONSTRAINT playlists_user_name_unique UNIQUE (user_id, name);
ALTER TABLE public.liked_tracks ADD CONSTRAINT liked_tracks_user_track_unique UNIQUE (user_id, track_id);

-- Step 3: Grants
GRANT ALL ON TABLE public.playlists TO authenticated;
GRANT ALL ON TABLE public.liked_tracks TO authenticated;
GRANT ALL ON TABLE public.playlists TO anon;
GRANT ALL ON TABLE public.liked_tracks TO anon;

-- Step 4: RLS Policies
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS playlists_owner ON public.playlists;
CREATE POLICY playlists_owner ON public.playlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS liked_tracks_owner ON public.liked_tracks;
CREATE POLICY liked_tracks_owner ON public.liked_tracks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Step 5: Indexes
CREATE INDEX IF NOT EXISTS idx_playlists_user ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_tracks_user ON public.liked_tracks(user_id);

-- Step 6: Create function with a NEW name to avoid conflict
CREATE OR REPLACE FUNCTION public.import_playlist_by_id_v2(
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

  SELECT * INTO v_playlist
  FROM public.playlists
  WHERE id::TEXT = p_playlist_id
  LIMIT 1;

  IF v_playlist IS NULL THEN
    SELECT * INTO v_playlist
    FROM public.playlists
    WHERE LOWER(name) = LOWER(p_playlist_id)
    LIMIT 1;
  END IF;

  IF v_playlist IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Playlist nao encontrada.');
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

GRANT EXECUTE ON FUNCTION public.import_playlist_by_id_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.import_playlist_by_id_v2 TO anon;

-- Verify
SELECT 'playlists' as table_name, count(*) as row_count FROM public.playlists
UNION ALL
SELECT 'liked_tracks', count(*) FROM public.liked_tracks;
