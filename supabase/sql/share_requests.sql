-- Run in Supabase SQL Editor.
-- Enables in-app sharing requests for tracks/playlists.

create table if not exists public.share_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null,
  to_user_id uuid not null,
  from_username text not null default 'user',
  item_type text not null check (item_type in ('track', 'playlist')),
  item_title text not null,
  item_payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists share_requests_to_user_status_idx
  on public.share_requests (to_user_id, status, created_at desc);

create index if not exists share_requests_from_user_idx
  on public.share_requests (from_user_id, created_at desc);

create or replace function public.set_updated_at_share_requests()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_share_requests_updated_at on public.share_requests;
create trigger trg_share_requests_updated_at
before update on public.share_requests
for each row execute function public.set_updated_at_share_requests();

alter table public.share_requests enable row level security;

drop policy if exists "share_requests_select_own" on public.share_requests;
create policy "share_requests_select_own"
  on public.share_requests
  for select
  to authenticated
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

drop policy if exists "share_requests_insert_sender" on public.share_requests;
create policy "share_requests_insert_sender"
  on public.share_requests
  for insert
  to authenticated
  with check (auth.uid() = from_user_id and from_user_id <> to_user_id);

drop policy if exists "share_requests_update_receiver" on public.share_requests;
create policy "share_requests_update_receiver"
  on public.share_requests
  for update
  to authenticated
  using (auth.uid() = to_user_id)
  with check (
    auth.uid() = to_user_id and
    status in ('accepted', 'rejected')
  );
