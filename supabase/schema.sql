-- ============================================================================
-- StudyHub — Supabase schema
-- Idempotent: safe to paste into the SQL Editor as many times as you like.
--
-- Assumes these already exist (created earlier, left untouched):
--   profiles(id, username, bio, avatar_url)
--   study_sessions(id, user_id, topic, started_at, ended_at)
--
-- Adds: rooms, room_members, streak_freezes, the signup -> profile trigger,
--       RLS policies for every table, and Realtime for presence.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- profiles: harden what already exists
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- /p/:username lookups need a case-insensitive, unique handle.
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

alter table public.profiles
  alter column username set not null;

-- ----------------------------------------------------------------------------
-- study_sessions: make sure the columns we rely on are constrained
-- ----------------------------------------------------------------------------
alter table public.study_sessions enable row level security;

alter table public.study_sessions
  alter column user_id set not null,
  alter column topic set not null,
  alter column started_at set not null;

-- ended_at is null while a session is running; Finish sets it.
create index if not exists study_sessions_user_started_idx
  on public.study_sessions (user_id, started_at desc);

-- Heatmaps and streaks group by day, in UTC. Computed from rows, never stored.
create index if not exists study_sessions_ended_idx
  on public.study_sessions (user_id, ended_at desc);

-- ----------------------------------------------------------------------------
-- rooms
-- ----------------------------------------------------------------------------
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  closed_at   timestamptz
);

create index if not exists rooms_code_idx on public.rooms (code);
create index if not exists rooms_open_idx on public.rooms (closed_at) where closed_at is null;

-- ----------------------------------------------------------------------------
-- room_members
--
-- `user_id` is unique on purpose: joining a room locks you to it. Leaving
-- deletes the row, which is the only way into another room.
-- ----------------------------------------------------------------------------
create table if not exists public.room_members (
  room_id      uuid not null references public.rooms (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  joined_at    timestamptz not null default now(),
  presence     text not null default 'away'
                 check (presence in ('studying', 'away', 'on break')),
  last_seen_at timestamptz not null default now(),
  primary key (room_id, user_id),
  unique (user_id)
);

create index if not exists room_members_room_idx on public.room_members (room_id);

-- ----------------------------------------------------------------------------
-- streak_freezes
-- ----------------------------------------------------------------------------
create table if not exists public.streak_freezes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  used_on    date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, used_on)
);

create index if not exists streak_freezes_user_idx on public.streak_freezes (user_id, used_on desc);

-- At most two freezes per calendar month. Enforced here so no client can
-- talk its way past it.
create or replace function public.enforce_streak_freeze_limit()
returns trigger
language plpgsql
as $$
declare
  used_this_month integer;
begin
  select count(*) into used_this_month
  from public.streak_freezes
  where user_id = new.user_id
    and date_trunc('month', used_on) = date_trunc('month', new.used_on)
    and id is distinct from new.id;

  if used_this_month >= 2 then
    raise exception 'Only two streak freezes per month.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists streak_freezes_limit on public.streak_freezes;
create trigger streak_freezes_limit
  before insert or update on public.streak_freezes
  for each row execute function public.enforce_streak_freeze_limit();

-- ----------------------------------------------------------------------------
-- Auto-create a profile on signup
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  candidate     text;
  suffix        integer := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'full_name',
    split_part(coalesce(new.email, ''), '@', 1),
    'student'
  );

  -- Keep it URL-safe and short.
  candidate := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g'));
  if candidate = '' or char_length(candidate) < 3 then
    candidate := 'student';
  end if;
  candidate := left(candidate, 20);

  -- Google handles collide constantly; add a counter until one is free.
  while exists (select 1 from public.profiles where lower(username) = lower(candidate)) loop
    suffix := suffix + 1;
    candidate := left(candidate, 17) || '_' || suffix;
  end loop;

  insert into public.profiles (id, username, bio, avatar_url)
  values (
    new.id,
    candidate,
    '',
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: any existing auth user without a profile gets one now.
insert into public.profiles (id, username, bio, avatar_url)
select
  u.id,
  'student_' || left(u.id::text, 6),
  '',
  ''
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- RLS policies
-- ----------------------------------------------------------------------------

-- profiles: readable by anyone (public /p/:username pages), writable by owner.
drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "owners can update their own profile" on public.profiles;
create policy "owners can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- study_sessions: private to the owner.
drop policy if exists "owners read their own sessions" on public.study_sessions;
create policy "owners read their own sessions"
  on public.study_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "owners insert their own sessions" on public.study_sessions;
create policy "owners insert their own sessions"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "owners update their own sessions" on public.study_sessions;
create policy "owners update their own sessions"
  on public.study_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- rooms: open rooms are discoverable so codes can be joined; owners manage.
drop policy if exists "open rooms are readable" on public.rooms;
create policy "open rooms are readable"
  on public.rooms for select
  using (closed_at is null or auth.uid() = owner_id);

drop policy if exists "signed-in users create rooms" on public.rooms;
create policy "signed-in users create rooms"
  on public.rooms for insert
  with check (auth.uid() = owner_id);

drop policy if exists "owners update their rooms" on public.rooms;
create policy "owners update their rooms"
  on public.rooms for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- room_members: you see the roster of rooms you belong to, and manage your own row.
drop policy if exists "members read their room roster" on public.room_members;
create policy "members read their room roster"
  on public.room_members for select
  using (
    auth.uid() = user_id
    or exists (select 1 from public.room_members m where m.room_id = room_id and m.user_id = auth.uid())
  );

drop policy if exists "users join as themselves" on public.room_members;
create policy "users join as themselves"
  on public.room_members for insert
  with check (auth.uid() = user_id);

drop policy if exists "users update their own membership" on public.room_members;
create policy "users update their own membership"
  on public.room_members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users leave rooms" on public.room_members;
create policy "users leave rooms"
  on public.room_members for delete
  using (auth.uid() = user_id);

-- streak_freezes: private to the owner.
drop policy if exists "owners read their own freezes" on public.streak_freezes;
create policy "owners read their own freezes"
  on public.streak_freezes for select
  using (auth.uid() = user_id);

drop policy if exists "owners insert their own freezes" on public.streak_freezes;
create policy "owners insert their own freezes"
  on public.streak_freezes for insert
  with check (auth.uid() = user_id);

drop policy if exists "owners delete their own freezes" on public.streak_freezes;
create policy "owners delete their own freezes"
  on public.streak_freezes for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Realtime: presence changes have to reach other members instantly.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'room_members'
  ) then
    alter publication supabase_realtime add table public.room_members;
  end if;
end
$$;

-- ----------------------------------------------------------------------------
-- Sanity output
-- ----------------------------------------------------------------------------
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'study_sessions', 'rooms', 'room_members', 'streak_freezes')
order by table_name;
