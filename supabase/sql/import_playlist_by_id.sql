-- Import playlist by ID from another user
-- Allows users to import a public playlist by its ID

create or replace function public.import_playlist_by_id(
  p_requester_id uuid,
  p_playlist_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_playlist record;
  v_new_playlist_id uuid;
  v_track jsonb;
  v_tracks jsonb := '[]'::jsonb;
begin
  -- Check if requester is authenticated
  if p_requester_id is null then
    return jsonb_build_object('success', false, 'error', 'Utilizador não autenticado');
  end if;

  -- Find the playlist by ID
  select id, user_id, name, tracks_json, image_url, created_at
  into v_playlist
  from public.playlists
  where id = p_playlist_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Playlist não encontrada');
  end if;

  -- Build tracks array
  if v_playlist.tracks_json is not null and jsonb_typeof(v_playlist.tracks_json) = 'array' then
    v_tracks := v_playlist.tracks_json;
  end if;

  -- Create new playlist for requester (copy)
  v_new_playlist_id := gen_random_uuid();
  
  insert into public.playlists (id, user_id, name, tracks_json, image_url, created_at, updated_at)
  values (v_new_playlist_id, p_requester_id, v_playlist.name, v_tracks, v_playlist.image_url, now(), now());

  return jsonb_build_object(
    'success', true,
    'id', v_new_playlist_id,
    'name', v_playlist.name,
    'track_count', jsonb_array_length(v_tracks)
  );
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;

grant execute on function public.import_playlist_by_id(uuid, uuid) to authenticated;
