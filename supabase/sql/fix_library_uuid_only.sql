-- Run in Supabase SQL Editor.
-- Purpose: move old rows to the current UUID of adminx@adminx.com
-- so the app can load library strictly by user_id.

do $$
declare
  v_email text := 'adminx@adminx.com';
  v_user_id uuid;
  v_username text;
  v_updated_playlists integer := 0;
  v_updated_likes integer := 0;
begin
  select id, lower(split_part(email, '@', 1))
    into v_user_id, v_username
  from auth.users
  where lower(email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    raise exception 'User not found in auth.users for email: %', v_email;
  end if;

  update public.playlists
  set user_id = v_user_id,
      username = v_username
  where user_id is distinct from v_user_id
    and lower(coalesce(username, '')) = v_username;
  get diagnostics v_updated_playlists = row_count;

  update public.liked_tracks
  set user_id = v_user_id,
      username = v_username
  where user_id is distinct from v_user_id
    and lower(coalesce(username, '')) = v_username;
  get diagnostics v_updated_likes = row_count;

  raise notice 'Relink complete. playlists=%, liked_tracks=%', v_updated_playlists, v_updated_likes;
end
$$;

