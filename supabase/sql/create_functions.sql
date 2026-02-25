-- =====================================================================
-- XALANIFY: SQL Functions para operações rápidas
-- =====================================================================
-- Criar funções otimizadas para evitar timeouts
-- =====================================================================

-- FUNÇÃO 1: Adicionar música aos favoritos (muito mais rápida)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.add_liked_track(
  p_user_id uuid,
  p_track_id text,
  p_track_data jsonb
)
RETURNS boolean AS $$
DECLARE
  v_result boolean;
BEGIN
  INSERT INTO public.liked_tracks (user_id, track_id, track_data)
  VALUES (p_user_id, p_track_id, p_track_data)
  ON CONFLICT (user_id, track_id) DO UPDATE
  SET track_data = EXCLUDED.track_data,
      updated_at = now()
  RETURNING true INTO v_result;
  
  RETURN COALESCE(v_result, true);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in add_liked_track: %', SQLERRM;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions para a função
GRANT EXECUTE ON FUNCTION public.add_liked_track(uuid, text, jsonb) TO authenticated;

-- FUNÇÃO 2: Remover música dos favoritos
-- =====================================================================
CREATE OR REPLACE FUNCTION public.remove_liked_track(
  p_user_id uuid,
  p_track_id text
)
RETURNS boolean AS $$
BEGIN
  DELETE FROM public.liked_tracks
  WHERE user_id = p_user_id AND track_id = p_track_id;
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in remove_liked_track: %', SQLERRM;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions para a função
GRANT EXECUTE ON FUNCTION public.remove_liked_track(uuid, text) TO authenticated;

-- FUNÇÃO 3: Criar playlist
-- =====================================================================
CREATE OR REPLACE FUNCTION public.create_playlist_fn(
  p_user_id uuid,
  p_name text,
  p_image_url text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  created_at timestamptz
) AS $$
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

-- Permissions para a função
GRANT EXECUTE ON FUNCTION public.create_playlist_fn(uuid, text, text) TO authenticated;

-- FUNÇÃO 4: Adicionar track à playlist
-- =====================================================================
CREATE OR REPLACE FUNCTION public.add_track_to_playlist_fn(
  p_playlist_id uuid,
  p_track jsonb
)
RETURNS boolean AS $$
DECLARE
  v_current_tracks jsonb;
BEGIN
  -- Get current tracks
  SELECT tracks_json INTO v_current_tracks
  FROM public.playlists
  WHERE id = p_playlist_id;
  
  -- If track not already in list, add it
  IF NOT v_current_tracks @> p_track THEN
    UPDATE public.playlists
    SET tracks_json = v_current_tracks || jsonb_build_array(p_track),
        updated_at = now()
    WHERE id = p_playlist_id;
  END IF;
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in add_track_to_playlist_fn: %', SQLERRM;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions para a função
GRANT EXECUTE ON FUNCTION public.add_track_to_playlist_fn(uuid, jsonb) TO authenticated;

-- FUNÇÃO 5: Remover track da playlist
-- =====================================================================
CREATE OR REPLACE FUNCTION public.remove_track_from_playlist_fn(
  p_playlist_id uuid,
  p_track_id text
)
RETURNS boolean AS $$
DECLARE
  v_current_tracks jsonb;
BEGIN
  -- Get current tracks
  SELECT tracks_json INTO v_current_tracks
  FROM public.playlists
  WHERE id = p_playlist_id;
  
  -- Remove track with matching id
  UPDATE public.playlists
  SET tracks_json = (
    SELECT jsonb_agg(track)
    FROM jsonb_array_elements(v_current_tracks) AS track
    WHERE track->>'id' != p_track_id
  ),
      updated_at = now()
  WHERE id = p_playlist_id;
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in remove_track_from_playlist_fn: %', SQLERRM;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions para a função
GRANT EXECUTE ON FUNCTION public.remove_track_from_playlist_fn(uuid, text) TO authenticated;

-- FUNÇÃO 6: Verificar se playlist existe
-- =====================================================================
CREATE OR REPLACE FUNCTION public.check_playlist_exists(
  p_user_id uuid,
  p_name text
)
RETURNS TABLE (
  id uuid,
  name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name
  FROM public.playlists p
  WHERE p.user_id = p_user_id AND LOWER(p.name) = LOWER(p_name)
  LIMIT 1;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::uuid, NULL::text WHERE false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions para a função
GRANT EXECUTE ON FUNCTION public.check_playlist_exists(uuid, text) TO authenticated;

-- Adicionar constraint UNIQUE se não existir
ALTER TABLE public.playlists
ADD CONSTRAINT playlists_user_name_unique UNIQUE (user_id, name);

-- Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_playlists_user_name ON public.playlists(user_id, LOWER(name));
