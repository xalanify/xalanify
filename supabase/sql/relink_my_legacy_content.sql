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
  uname text;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;

  uname := lower(coalesce(target_username, split_part(coalesce(target_email, auth.jwt() ->> 'email', ''), '@', 1)));
  if uname = '' then
    return;
  end if;

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
end;
$$;

grant execute on function public.relink_my_legacy_content(text, text) to authenticated;
