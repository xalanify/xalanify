-- Run in Supabase SQL Editor.
-- Allows the logged-in user to relink old playlist/liked rows by username/email prefix to current auth.uid().

create or replace function public.relink_my_legacy_content(
  target_email text default null,
  target_username text default null
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  me uuid := auth.uid();
  resolved_email text := coalesce(target_email, auth.jwt() ->> 'email', '');
  profile_username text;
  meta_username text := coalesce(auth.jwt() -> 'user_metadata' ->> 'username', '');
  uname text;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  select coalesce(username, '')
    into profile_username
  from public.profiles
  where user_id = me
  limit 1;

  for uname in
    select distinct candidate
    from unnest(array[
      lower(nullif(target_username, '')),
      lower(nullif(profile_username, '')),
      lower(nullif(meta_username, '')),
      lower(nullif(split_part(resolved_email, '@', 1), ''))
    ]) as t(candidate)
    where candidate is not null and candidate <> ''
  loop
    update public.playlists
    set user_id = me,
        username = uname
    where user_id is distinct from me
      and lower(coalesce(username, '')) = uname;

    update public.liked_tracks
    set user_id = me,
        username = uname
    where user_id is distinct from me
      and lower(coalesce(username, '')) = uname;
  end loop;
end;
$$;

grant execute on function public.relink_my_legacy_content(text, text) to authenticated;
