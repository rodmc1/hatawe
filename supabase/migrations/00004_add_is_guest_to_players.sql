-- ============================================================
-- Migration: 00004_add_is_guest_to_players
-- Description: Add is_guest flag to players so admins can create
--              walk-in guest players that are not auth users.
-- ============================================================

alter table public.players
  add column is_guest boolean not null default false;
