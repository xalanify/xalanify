-- Run in Supabase SQL Editor.
-- Keeps a public profiles table synced with auth.users, with username and is_admin role.

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
    set username = excluded.username,
        email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Backfill existing auth users into profiles.
insert into public.profiles (user_id, username, email)
select
  u.id,
  lower(split_part(u.email, '@', 1)),
  u.email
from auth.users u
on conflict (user_id) do update
set email = excluded.email,
    updated_at = now();

-- Ensure unique usernames after backfill.
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

-- Optional default admin seed by email; update as needed.
update public.profiles
set is_admin = true,
    updated_at = now()
where email = 'adminx@adminx.com';

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
