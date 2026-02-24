-- Run this in Supabase SQL Editor.
-- Allows only admins from public.profiles(is_admin=true) to list users for share targets.

create or replace function public.list_share_targets(exclude_user_id uuid default null)
returns table (user_id uuid, username text, email text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller_is_admin boolean := false;
begin
  select coalesce(p.is_admin, false)
    into caller_is_admin
  from public.profiles p
  where p.user_id = auth.uid();

  if not caller_is_admin then
    raise exception 'forbidden';
  end if;

  return query
  select
    p.user_id,
    p.username,
    p.email
  from public.profiles p
  where exclude_user_id is null or p.user_id <> exclude_user_id
  order by p.username asc;
end;
$$;

grant execute on function public.list_share_targets(uuid) to authenticated;
