-- Run in Supabase SQL Editor (role postgres).
-- Shows whether auth users, profiles, playlists and liked_tracks are aligned by UUID.

with auth_users as (
  select
    u.id as auth_user_id,
    u.email,
    lower(split_part(u.email, '@', 1)) as email_username
  from auth.users u
),
profiles_data as (
  select p.user_id, p.username, p.email, p.is_admin
  from public.profiles p
),
likes_by_user as (
  select lt.user_id, count(*) as likes_count
  from public.liked_tracks lt
  group by lt.user_id
),
playlists_by_user as (
  select pl.user_id, count(*) as playlists_count
  from public.playlists pl
  group by pl.user_id
),
likes_by_username as (
  select lower(coalesce(lt.username, '')) as uname, count(*) as likes_by_username
  from public.liked_tracks lt
  group by lower(coalesce(lt.username, ''))
),
playlists_by_username as (
  select lower(coalesce(pl.username, '')) as uname, count(*) as playlists_by_username
  from public.playlists pl
  group by lower(coalesce(pl.username, ''))
)
select
  au.auth_user_id,
  au.email,
  au.email_username,
  pd.username as profile_username,
  pd.is_admin,
  coalesce(lu.likes_count, 0) as likes_by_uuid,
  coalesce(pu.playlists_count, 0) as playlists_by_uuid,
  coalesce(ln.likes_by_username, 0) as likes_by_username,
  coalesce(pn.playlists_by_username, 0) as playlists_by_username
from auth_users au
left join profiles_data pd on pd.user_id = au.auth_user_id
left join likes_by_user lu on lu.user_id = au.auth_user_id
left join playlists_by_user pu on pu.user_id = au.auth_user_id
left join likes_by_username ln on ln.uname = au.email_username
left join playlists_by_username pn on pn.uname = au.email_username
order by au.email asc;

