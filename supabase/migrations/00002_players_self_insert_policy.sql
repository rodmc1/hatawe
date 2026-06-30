-- ============================================================
-- Migration: 00002_players_self_insert_policy
-- Description: Allow an authenticated user to insert their own
--              player row. This is needed by the OAuth callback
--              route as a belt-and-suspenders guard alongside the
--              handle_new_user() trigger.
-- ============================================================

create policy "players: user can insert own row"
  on public.players
  for insert
  to authenticated
  with check (id = auth.uid());
