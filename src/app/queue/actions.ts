'use server'

import { createClient } from '@/lib/supabase/server'

export interface SessionRow {
  id: string
  name: string
  venue: string
  court_count: number
  status: string
  created_at: string
}

export async function getSessions(): Promise<SessionRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select('id, name, venue, court_count, status, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createSession(input: {
  name: string
  venue: string
  court_count: number
}): Promise<SessionRow> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Resolve players.id for the current auth user (needed for created_by FK)
  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!player) throw new Error('Player record not found')

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({ ...input, created_by: player.id })
    .select('id, name, venue, court_count, status, created_at')
    .single()

  if (error || !session) throw new Error(error?.message ?? 'Failed to create session')
  return session
}
