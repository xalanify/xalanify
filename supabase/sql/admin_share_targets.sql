-- Run this in Supabase SQL Editor.
-- Enables adminx@adminx.com to list users for share targets in app settings.

create or replace function public.list_share_targets(exclude_user_id uuid default null)
returns table (user_id uuid, username text, email text)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if coalesce((auth.jwt() ->> 'email'), '') <> 'adminx@adminx.com' then
    raise exception 'forbidden';
  end if;

  return query
  select
    u.id as user_id,
    coalesce(p.username, split_part(u.email, '@', 1), 'user') as username,
    u.email
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  where exclude_user_id is null or u.id <> exclude_user_id
  order by username asc;
end;
$$;

grant execute on function public.list_share_targets(uuid) to authenticated;
