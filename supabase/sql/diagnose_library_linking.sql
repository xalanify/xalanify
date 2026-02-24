-- Diagnostic: run in Supabase SQL Editor to see where your library rows are linked.
-- Update the email below if needed.

with me as (
  select
    id as auth_user_id,
    email,
    lower(split_part(email, '@', 1)) as email_username
  from auth.users
  where email = 'adminx@adminx.com'
  limit 1
),
likes_by_user as (
  select user_id, count(*) as likes_count
  from public.liked_tracks
  group by user_id
),
likes_by_name as (
  select lower(coalesce(username, '')) as uname, count(*) as likes_count
  from public.liked_tracks
  group by lower(coalesce(username, ''))
),
playlists_by_user as (
  select user_id, count(*) as playlists_count
  from public.playlists
  group by user_id
),
playlists_by_name as (
  select lower(coalesce(username, '')) as uname, count(*) as playlists_count
  from public.playlists
  group by lower(coalesce(username, ''))
)
select
  me.auth_user_id,
  me.email,
  me.email_username,
  p.username as profile_username,
  p.is_admin,
  coalesce(lu.likes_count, 0) as likes_by_current_user_id,
  coalesce(pu.playlists_count, 0) as playlists_by_current_user_id,
  coalesce(ln.likes_count, 0) as likes_by_email_username,
  coalesce(pn.playlists_count, 0) as playlists_by_email_username
from me
left join public.profiles p on p.user_id = me.auth_user_id
left join likes_by_user lu on lu.user_id = me.auth_user_id
left join playlists_by_user pu on pu.user_id = me.auth_user_id
left join likes_by_name ln on ln.uname = me.email_username
left join playlists_by_name pn on pn.uname = me.email_username;
