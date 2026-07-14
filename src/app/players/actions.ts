'use server'

import { createClient } from '@/lib/supabase/server'

export type DbSkillLevel =
  | 'unrated'
  | 'beginner'
  | 'intermediate_low'
  | 'intermediate'
  | 'intermediate_high'
  | 'advanced'

export interface PlayerRow {
  id: string
  full_name: string
  avatar_url: string | null
  skill_level: DbSkillLevel
  is_member: boolean
  is_admin: boolean
  matchesPlayed: number
  wins: number
}

export async function getPlayers(): Promise<PlayerRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .select(
      `id, full_name, avatar_url, skill_level, is_member, is_admin,
       match_teams ( team, matches ( status, winning_team ) )`,
    )
    .order('full_name')

  if (error) throw new Error(error.message)

  return (data ?? []).map((player) => {
    const teams = (player.match_teams ?? []) as Array<{
      team: string
      matches: { status: string; winning_team: string | null } | null
    }>

    const matchesPlayed = teams.length
    const wins = teams.filter(
      (mt) =>
        mt.matches?.status === 'completed' &&
        mt.matches?.winning_team === mt.team,
    ).length

    return {
      id: player.id,
      full_name: player.full_name,
      avatar_url: player.avatar_url,
      skill_level: player.skill_level as DbSkillLevel,
      is_member: player.is_member,
      is_admin: player.is_admin,
      matchesPlayed,
      wins,
    }
  })
}

export async function addPlayer(input: {
  full_name: string
  skill_level: DbSkillLevel
}): Promise<PlayerRow> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('players')
    .insert({
      full_name: input.full_name,
      skill_level: input.skill_level,
      is_member: false,
    })
    .select('id, full_name, avatar_url, skill_level, is_member, is_admin')
    .single()

  if (error) throw new Error(error.message)

  return {
    id: data.id,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    skill_level: data.skill_level as DbSkillLevel,
    is_member: data.is_member,
    is_admin: data.is_admin,
    matchesPlayed: 0,
    wins: 0,
  }
}

export async function updatePlayer(
  id: string,
  input: {
    full_name?: string
    skill_level?: DbSkillLevel
    is_member?: boolean
  },
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('players')
    .update(input)
    .eq('id', id)

  if (error) throw new Error(error.message)
}
