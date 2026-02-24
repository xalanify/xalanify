-- Run in Supabase SQL Editor if playlists/favorites disappeared after UUID change.
-- This moves legacy rows (matched by username/email prefix) to the current auth.users.id.

-- Change this email if needed:
do $$
declare
  target_email text := 'adminx@adminx.com';
  target_uuid uuid;
  target_username text;
begin
  select id into target_uuid from auth.users where email = target_email limit 1;
  if target_uuid is null then
    raise exception 'No auth user found for %', target_email;
  end if;

  target_username := lower(split_part(target_email, '@', 1));

  -- Relink playlists
  update public.playlists
  set user_id = target_uuid,
      username = target_username
  where (user_id is distinct from target_uuid)
    and lower(coalesce(username, '')) = target_username;

  -- Relink liked tracks
  update public.liked_tracks
  set user_id = target_uuid,
      username = target_username
  where (user_id is distinct from target_uuid)
    and lower(coalesce(username, '')) = target_username;
end $$;
