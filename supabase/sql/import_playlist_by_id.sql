-- Função para importar playlist por ID
-- Cria uma cópia da playlist para o utilizador atual

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
  -- Validar input
  IF p_requester_id IS NULL OR p_playlist_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ID de utilizador e ID de playlist são obrigatórios.'
    );
  END IF;

  -- Buscar a playlist original (qualquer utilizador pode partilhar playlists publicamente)
  -- Primeiro tenta por UUID
  SELECT * INTO v_playlist
  FROM public.playlists
  WHERE id::TEXT = p_playlist_id
    OR id::TEXT LIKE '%' || p_playlist_id || '%'
  LIMIT 1;

  -- Se não encontrou, tenta por nome
  IF v_playlist IS NULL THEN
    SELECT * INTO v_playlist
    FROM public.playlists
    WHERE LOWER(name) = LOWER(p_playlist_id)
    LIMIT 1;
  END IF;

  IF v_playlist IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Playlist não encontrada. Verifica o ID.'
    );
  END IF;

  -- Criar nova playlist para o utilizador
  INSERT INTO public.playlists (user_id, name, tracks_json, image_url)
  VALUES (
    p_requester_id,
    v_playlist.name,
    v_playlist.tracks_json,
    v_playlist.image_url
  )
  RETURNING id, name, tracks_json INTO v_new_playlist;

  -- Contar faixas importadas
  SELECT COALESCE(array_length(v_playlist.tracks_json, 1), 0) INTO v_track_count;

  RETURN jsonb_build_object(
    'success', true,
    'name', v_new_playlist.name,
    'track_count', v_track_count,
    'playlist_id', v_new_playlist.id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'Erro ao importar playlist: ' || SQLERRM
  );
END;
$$;

-- Verificar se a função foi criada
SELECT proname, prosrc FROM pg_proc WHERE proname = 'import_playlist_by_id';
