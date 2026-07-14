-- ============================================================
-- Migration: 00003_players_decouple_auth
-- Description:
--   1. Decouple players.id from auth.users so admins can create
--      guest players that have no Supabase Auth account.
--   2. Expand skill_level values to match the six UI tiers.
--   3. Add is_member boolean column.
--   4. Update RLS policies, helper function, and trigger to use
--      the new auth_user_id column instead of id.
-- ============================================================


-- ── 1. Add auth_user_id — the new nullable FK to auth.users ──────────────

alter table public.players
  add column auth_user_id uuid unique references auth.users(id) on delete cascade;

-- Give id a default so rows inserted without an explicit id get a UUID
alter table public.players
  alter column id set default gen_random_uuid();


-- ── 2. Back-fill: existing rows used id = auth.users.id ──────────────────

update public.players set auth_user_id = id;


-- ── 3. Remove the old FK from players.id → auth.users ────────────────────
--   PostgreSQL auto-names an inline FK "<table>_<col>_fkey"

alter table public.players drop constraint if exists players_id_fkey;


-- ── 4. Make email nullable (admin-created guests may not have one) ────────

alter table public.players alter column email drop not null;


-- ── 5. Expand skill_level check constraint ────────────────────────────────

alter table public.players drop constraint if exists players_skill_level_check;

alter table public.players add constraint players_skill_level_check
  check (skill_level in (
    'unrated',
    'beginner',
    'intermediate_low',
    'intermediate',
    'intermediate_high',
    'advanced'
  ));

-- Normalise any pre-existing cased values to lowercase/snake_case
update public.players set skill_level = 'unrated'          where lower(skill_level) = 'unrated';
update public.players set skill_level = 'beginner'         where lower(skill_level) = 'beginner'
                                                              and skill_level <> 'beginner';
update public.players set skill_level = 'intermediate'     where lower(skill_level) = 'intermediate'
                                                              and skill_level <> 'intermediate';
update public.players set skill_level = 'advanced'         where lower(skill_level) in ('advanced', 'advance')
                                                              and skill_level <> 'advanced';


-- ── 6. Add membership column ──────────────────────────────────────────────

alter table public.players add column is_member boolean not null default false;


-- ── 7. Update RLS policies that compared id to auth.uid() ────────────────

-- Drop old identity-based policies (created in 00001 and 00002)
drop policy if exists "players: owner can update own row"  on public.players;
drop policy if exists "players: user can insert own row"   on public.players;

-- Owner updates their own row (matched via auth_user_id)
create policy "players: owner can update own row"
  on public.players
  for update
  to authenticated
  using  (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Authenticated user can insert their own row (used by auth callback upsert)
create policy "players: user can insert own row"
  on public.players
  for insert
  to authenticated
  with check (auth_user_id = auth.uid());

-- Admins can update any player (needed for admin-managed guest players)
create policy "players: admins can update any row"
  on public.players
  for update
  to authenticated
  using  (public.is_admin())
  with check (public.is_admin());


-- ── 8. Update is_admin() helper to look up via auth_user_id ──────────────

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select is_admin from public.players where auth_user_id = auth.uid()),
    false
  )
$$;


-- ── 9. Update handle_new_user() trigger ───────────────────────────────────
--   Generates a fresh UUID for id and stores the auth user id in auth_user_id.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.players (id, auth_user_id, full_name, email, avatar_url, skill_level)
  values (
    gen_random_uuid(),
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'unrated'
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;
