'use server'

import { createClient } from '@/lib/supabase/server'
import type { QueuePlayer } from './types'

// ── Guest player creation ─────────────────────────────────────────────────

export async function createGuestPlayer(input: {
  full_name: string
  skill_level?: string | null
}): Promise<QueuePlayer> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .insert({
      full_name: input.full_name,
      skill_level: input.skill_level ?? 'unrated',
      is_guest: true,
      is_member: false,
    })
    .select('id, full_name, avatar_url, skill_level, is_member, is_guest')
    .single()

  if (error) throw new Error(error.message)

  return {
    id: data.id,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    skill_level: data.skill_level,
    is_member: data.is_member,
    is_guest: data.is_guest,
  }
}

// ── Match result persistence ──────────────────────────────────────────────
// This is the only point during a session that touches the database.

export async function saveMatchResult(input: {
  sessionId: string
  courtNumber: number
  teamA: [QueuePlayer, QueuePlayer]
  teamB: [QueuePlayer, QueuePlayer]
  winningTeam: 'A' | 'B'
  startedAt: string // ISO string
}): Promise<void> {
  const supabase = await createClient()

  // Insert the match record
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({
      session_id: input.sessionId,
      court_number: input.courtNumber,
      status: 'completed',
      winning_team: input.winningTeam,
      started_at: input.startedAt,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (matchError || !match) {
    throw new Error(matchError?.message ?? 'Failed to create match record')
  }

  // Insert one match_teams row per player
  const teamRows = [
    ...input.teamA.map((p) => ({ match_id: match.id, player_id: p.id, team: 'A' as const })),
    ...input.teamB.map((p) => ({ match_id: match.id, player_id: p.id, team: 'B' as const })),
  ]

  const { error: teamsError } = await supabase.from('match_teams').insert(teamRows)

  if (teamsError) throw new Error(teamsError.message)
}
