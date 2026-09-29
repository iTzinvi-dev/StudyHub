-- Minimal stand-in for the parts of Supabase that schema.sql expects, so the
-- file can be run against a plain PostgreSQL server for testing.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;

create schema if not exists auth;

create table if not exists auth.users (
  id                 uuid primary key,
  email              text,
  raw_user_meta_data jsonb default '{}'::jsonb
);

-- Supabase's real auth.uid() reads the JWT claim set that PostgREST injects.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select (nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub')::uuid;
$$;

create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb;
$$;

grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant execute on function auth.jwt() to anon, authenticated;

-- schema.sql guards two tables that already exist on Supabase. Create them here
-- with the same columns so the file can run end to end.
create table if not exists public.profiles (
  id         uuid primary key,
  username   text,
  bio        text default '',
  avatar_url text default ''
);
create table if not exists public.study_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  topic      text,
  started_at timestamptz,
  ended_at   timestamptz
);

-- Supabase ships this publication; schema.sql adds room_members to it.
drop publication if exists supabase_realtime;
create publication supabase_realtime;

-- Supabase grants these to anon/authenticated on every public object by default.
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;
