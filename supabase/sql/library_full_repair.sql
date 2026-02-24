-- Run in Supabase SQL Editor.
-- Repairs library access for all users with UUID ownership.

begin;

-- 1) Basic grants for client role
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.playlists to authenticated;
grant select, insert, update, delete on table public.liked_tracks to authenticated;
grant execute on function public.relink_my_legacy_content(text, text) to authenticated;

-- 2) RLS by UUID owner
alter table public.playlists enable row level security;
alter table public.liked_tracks enable row level security;

drop policy if exists "playlists_select_own" on public.playlists;
create policy "playlists_select_own"
  on public.playlists
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "playlists_insert_own" on public.playlists;
create policy "playlists_insert_own"
  on public.playlists
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "playlists_update_own" on public.playlists;
create policy "playlists_update_own"
  on public.playlists
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "playlists_delete_own" on public.playlists;
create policy "playlists_delete_own"
  on public.playlists
  for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "liked_tracks_select_own" on public.liked_tracks;
create policy "liked_tracks_select_own"
  on public.liked_tracks
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "liked_tracks_insert_own" on public.liked_tracks;
create policy "liked_tracks_insert_own"
  on public.liked_tracks
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "liked_tracks_update_own" on public.liked_tracks;
create policy "liked_tracks_update_own"
  on public.liked_tracks
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "liked_tracks_delete_own" on public.liked_tracks;
create policy "liked_tracks_delete_own"
  on public.liked_tracks
  for delete to authenticated
  using (auth.uid() = user_id);

-- 3) Constraints / indexes
create index if not exists playlists_user_id_created_at_idx
  on public.playlists (user_id, created_at desc);

create index if not exists liked_tracks_user_id_created_at_idx
  on public.liked_tracks (user_id, created_at desc);

create unique index if not exists liked_tracks_user_track_unique
  on public.liked_tracks (user_id, track_id);

commit;
