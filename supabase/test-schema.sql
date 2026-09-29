-- Functional test for schema.sql, run as the non-superuser `authenticated` role
-- so row level security actually applies.
\set ON_ERROR_STOP on

delete from public.room_members;
delete from public.rooms;
delete from public.streak_freezes;
delete from public.study_sessions;
delete from public.profiles;
delete from auth.users;

-- Three signups. The trigger should build all three profiles.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'ana@example.com', '{"full_name":"Ana Rahman"}'),
  ('22222222-2222-4222-8222-222222222222', 'bil@example.com', '{"full_name":"Bilal Haque"}'),
  ('33333333-3333-4333-8333-333333333333', 'car@example.com', '{"full_name":"Carol Islam"}');

select '[1] trigger created profiles' as test, count(*)::text as result from public.profiles;
select '[2] usernames are url-safe' as test,
       string_agg(username, ', ' order by username) as result from public.profiles;

-- ---------------------------------------------------------------- Ana signs in
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111"}', false);

select '[3] start_study_session returns an id' as test,
       (public.start_study_session('Calculus') is not null)::text as result;

do $$
declare sid uuid;
begin
  select id into sid from public.study_sessions where topic = 'Calculus';
  perform public.finish_study_session(sid);
end $$;

select '[4] finish stamps ended_at on the server' as test,
       (ended_at is not null and ended_at >= started_at)::text as result
from public.study_sessions where topic = 'Calculus';
select '[5] owner reads own sessions' as test, count(*)::text as result from public.study_sessions;

-- Ana creates a room and joins it, both through her own policies.
insert into public.rooms (code, name, owner_id)
values ('MATH42', 'Calculus grind', '11111111-1111-4111-8111-111111111111');
insert into public.room_members (room_id, user_id, presence)
select id, '11111111-1111-4111-8111-111111111111', 'studying' from public.rooms where code = 'MATH42';

-- THE REGRESSION TEST: this raised 42P17 before my_room_id() existed.
select '[6] roster read does not recurse' as test, count(*)::text as result from public.room_members;

-- A user cannot join someone else into a room.
do $$
begin
  insert into public.room_members (room_id, user_id, presence)
  select id, '22222222-2222-4222-8222-222222222222', 'away' from public.rooms where code = 'MATH42';
  raise notice '[7] FAIL: Ana added Bilal for him';
exception when insufficient_privilege then
  raise notice '[7] cannot join someone else: PASS';
end $$;

-- --------------------------------- Carol gets her own room (setup, bypasses RLS)
reset role;
insert into public.rooms (code, name, owner_id)
values ('CHEM11', 'Chemistry', '33333333-3333-4333-8333-333333333333');
insert into public.room_members (room_id, user_id, presence)
select id, '33333333-3333-4333-8333-333333333333', 'studying' from public.rooms where code = 'CHEM11';

-- ------------------------------------------------------------- Bilal signs in
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222"}', false);

insert into public.room_members (room_id, user_id, presence)
select id, '22222222-2222-4222-8222-222222222222', 'away' from public.rooms where code = 'MATH42';

select '[8] roster is Ana + me, never Carol' as test,
       (count(*) = 2)::text as result from public.room_members;
select '[9] my_room_id resolves to my room' as test,
       ((select code from public.rooms where id = public.my_room_id()) = 'MATH42')::text as result;

insert into public.rooms (code, name, owner_id)
values ('PHYS77', 'Physics', '22222222-2222-4222-8222-222222222222');
do $$
begin
  insert into public.room_members (room_id, user_id, presence)
  select id, '22222222-2222-4222-8222-222222222222', 'studying' from public.rooms where code = 'PHYS77';
  raise notice '[10] FAIL: a second room was allowed';
exception when unique_violation then
  raise notice '[10] one room per user: PASS';
end $$;

-- Streak freezes: two per calendar month, the third must be refused.
insert into public.streak_freezes (user_id, used_on) values
  ('22222222-2222-4222-8222-222222222222', date_trunc('month', now())::date),
  ('22222222-2222-4222-8222-222222222222', date_trunc('month', now())::date + 5);
do $$
begin
  insert into public.streak_freezes (user_id, used_on) values
    ('22222222-2222-4222-8222-222222222222', date_trunc('month', now())::date + 9);
  raise notice '[11] FAIL: a third freeze was allowed';
exception when check_violation then
  raise notice '[11] freeze capped at 2/month: PASS';
end $$;

select '[12] my_streak_freezes lists my own' as test, count(*)::text as result from public.my_streak_freezes();

-- --------------------------------------------------------------- signed out
reset role;
select '[13] public_profile_stats finds a user' as test,
       (public.public_profile_stats('anarahman') ->> 'username') as result;
select '[14] unknown username is null' as test,
       (public.public_profile_stats('nobody_here') is null)::text as result;

select set_config('request.jwt.claims', '', false);
set role authenticated;
select '[15] signed out reads no sessions' as test, count(*)::text as result from public.study_sessions;
select '[16] signed out reads no roster' as test, count(*)::text as result from public.room_members;
select '[17] signed out reads no freezes' as test, count(*)::text as result from public.streak_freezes;
reset role;

select '[18] room_members is in the realtime publication' as test, tablename as result
from pg_publication_tables where pubname = 'supabase_realtime';

select '[19] row level security is on everywhere' as test,
       (count(*) = 5)::text as result
from pg_class
where relname in ('profiles','study_sessions','rooms','room_members','streak_freezes')
  and relrowsecurity;
