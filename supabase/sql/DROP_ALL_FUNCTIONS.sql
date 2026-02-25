-- Generate and execute DROP statements for all import_playlist functions
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT oid::regprocedure::text as func_name
    FROM pg_proc
    WHERE proname LIKE 'import_playlist%'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.func_name || ' CASCADE';
    RAISE NOTICE 'Dropped: %', r.func_name;
  END LOOP;
END $$;

-- Now create the clean function
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

GRANT EXECUTE ON FUNCTION public.import_playlist_by_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.import_playlist_by_id TO anon;

-- Verify
SELECT proname, pronargs FROM pg_proc WHERE proname = 'import_playlist_by_id';
