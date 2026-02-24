-- Xalanify bootstrap (run once in Supabase SQL Editor)
-- Creates profile/admin + sharing structures used by the current app code.

-- 1) Profiles (username + admin role)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_profiles_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  base_username text;
  candidate text;
  suffix integer := 1;
begin
  base_username := lower(coalesce(split_part(new.email, '@', 1), 'user'));
  candidate := base_username;

  while exists (select 1 from public.profiles p where p.username = candidate and p.user_id <> new.id) loop
    suffix := suffix + 1;
    candidate := base_username || suffix::text;
  end loop;

  insert into public.profiles (user_id, username, email)
  values (new.id, candidate, new.email)
  on conflict (user_id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Backfill old auth users that already existed
insert into public.profiles (user_id, username, email)
select
  u.id,
  lower(split_part(u.email, '@', 1)),
  u.email
from auth.users u
on conflict (user_id) do update
set email = excluded.email,
    updated_at = now();

-- Fix duplicate usernames after backfill
with ranked as (
  select
    user_id,
    username,
    row_number() over (partition by username order by created_at, user_id) as rn
  from public.profiles
)
update public.profiles p
set username = p.username || ranked.rn::text,
    updated_at = now()
from ranked
where ranked.user_id = p.user_id
  and ranked.rn > 1;

-- Set current admin account(s) here:
update public.profiles
set is_admin = true,
    updated_at = now()
where email in ('adminx@adminx.com');

-- Optional compatibility view (if your app queries users_public)
create or replace view public.users_public as
select user_id as id, username, email
from public.profiles;

-- RLS: profiles
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2) Share requests table
create table if not exists public.share_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
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

-- 3) Admin-only target listing via profiles.is_admin
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
