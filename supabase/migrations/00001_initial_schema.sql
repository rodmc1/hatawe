-- ============================================================
-- Migration: 00001_initial_schema
-- Description: Initial schema for badminton doubles queuing app
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() (no-op if already enabled)
create extension if not exists "pgcrypto";


-- ============================================================
-- TABLES
-- ============================================================

create table public.players (
  id            uuid        not null references auth.users (id) on delete cascade,
  full_name     text        not null,
  email         text        not null,
  avatar_url    text,
  skill_level   text        not null check (skill_level in ('beginner', 'intermediate', 'advanced')),
  is_admin      boolean     not null default false,
  created_at    timestamptz not null default now(),

  constraint players_pkey primary key (id)
);

create table public.sessions (
  id          uuid        not null default gen_random_uuid(),
  name        text        not null,
  venue       text        not null,
  court_count int         not null check (court_count > 0),
  status      text        not null default 'active' check (status in ('active', 'completed')),
  created_by  uuid        not null references public.players (id) on delete restrict,
  created_at  timestamptz not null default now(),

  constraint sessions_pkey primary key (id)
);

create table public.queue_entries (
  id          uuid        not null default gen_random_uuid(),
  session_id  uuid        not null references public.sessions (id) on delete cascade,
  player_id   uuid        not null references public.players (id) on delete cascade,
  status      text        not null default 'waiting' check (status in ('waiting', 'playing', 'done')),
  created_at  timestamptz not null default now(),

  constraint queue_entries_pkey primary key (id),
  -- A player can only have one active entry per session
  constraint queue_entries_session_player_unique unique (session_id, player_id)
);

create table public.matches (
  id            uuid        not null default gen_random_uuid(),
  session_id    uuid        not null references public.sessions (id) on delete cascade,
  court_number  int         not null check (court_number > 0),
  status        text        not null default 'in_progress' check (status in ('in_progress', 'completed')),
  winning_team  text                 check (winning_team in ('A', 'B')),
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,

  constraint matches_pkey primary key (id)
);

create table public.match_teams (
  id         uuid not null default gen_random_uuid(),
  match_id   uuid not null references public.matches (id) on delete cascade,
  player_id  uuid not null references public.players (id) on delete cascade,
  team       text not null check (team in ('A', 'B')),

  constraint match_teams_pkey primary key (id),
  -- A player can only appear once per match
  constraint match_teams_match_player_unique unique (match_id, player_id)
);


-- ============================================================
-- INDEXES
-- ============================================================

create index idx_sessions_created_by      on public.sessions      (created_by);
create index idx_sessions_status          on public.sessions      (status);

create index idx_queue_entries_session_id on public.queue_entries (session_id);
create index idx_queue_entries_player_id  on public.queue_entries (player_id);
-- FIFO ordering within a session
create index idx_queue_entries_fifo       on public.queue_entries (session_id, created_at asc);

create index idx_matches_session_id       on public.matches       (session_id);
create index idx_matches_status           on public.matches       (status);

create index idx_match_teams_match_id     on public.match_teams   (match_id);
create index idx_match_teams_player_id    on public.match_teams   (player_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.players      enable row level security;
alter table public.sessions     enable row level security;
alter table public.queue_entries enable row level security;
alter table public.matches      enable row level security;
alter table public.match_teams  enable row level security;


-- Helper: reusable admin check
-- Returns true when the calling user has is_admin = true in players
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select is_admin from public.players where id = auth.uid()),
    false
  )
$$;


-- ── players ──────────────────────────────────────────────────

-- Any authenticated user can read all players
create policy "players: authenticated users can read"
  on public.players
  for select
  to authenticated
  using (true);

-- A player can only update their own row
create policy "players: owner can update own row"
  on public.players
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- A player row is created via a trigger on auth.users (see below),
-- so no direct INSERT policy is needed for regular users.
-- Admins can insert (e.g. for seeding / back-office tooling).
create policy "players: admins can insert"
  on public.players
  for insert
  to authenticated
  with check (public.is_admin());


-- ── sessions ─────────────────────────────────────────────────

create policy "sessions: authenticated users can read"
  on public.sessions
  for select
  to authenticated
  using (true);

create policy "sessions: admins can insert"
  on public.sessions
  for insert
  to authenticated
  with check (public.is_admin());

create policy "sessions: admins can update"
  on public.sessions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ── queue_entries ─────────────────────────────────────────────

create policy "queue_entries: authenticated users can read"
  on public.queue_entries
  for select
  to authenticated
  using (true);

create policy "queue_entries: admins can insert"
  on public.queue_entries
  for insert
  to authenticated
  with check (public.is_admin());

create policy "queue_entries: admins can update"
  on public.queue_entries
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ── matches ──────────────────────────────────────────────────

create policy "matches: authenticated users can read"
  on public.matches
  for select
  to authenticated
  using (true);

create policy "matches: admins can insert"
  on public.matches
  for insert
  to authenticated
  with check (public.is_admin());

create policy "matches: admins can update"
  on public.matches
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ── match_teams ───────────────────────────────────────────────

create policy "match_teams: authenticated users can read"
  on public.match_teams
  for select
  to authenticated
  using (true);

create policy "match_teams: admins can insert"
  on public.match_teams
  for insert
  to authenticated
  with check (public.is_admin());

create policy "match_teams: admins can update"
  on public.match_teams
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ============================================================
-- AUTO-CREATE player ROW ON SIGN-UP
-- Mirrors new auth.users rows into public.players so the
-- players table is always in sync with Supabase Auth.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.players (id, full_name, email, avatar_url, skill_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'skill_level', 'beginner')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
