import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QueueClient } from '@/components/queue/QueueClient'
import type { QueuePlayer } from '@/lib/queue/types'

export default async function QueueSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = await createClient()

  // ── Auth + admin guard ────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentPlayer } = await supabase
    .from('players')
    .select('is_admin')
    .eq('auth_user_id', user.id)
    .single()

  if (!currentPlayer?.is_admin) redirect('/dashboard')

  // ── Fetch session ────────────────────────────────────────────────────
  const { data: session } = await supabase
    .from('sessions')
    .select('id, name, venue, court_count, status')
    .eq('id', sessionId)
    .single()

  if (!session) notFound()

  // ── Fetch members (for AddPlayerModal > Member tab) ──────────────────
  const { data: membersData } = await supabase
    .from('players')
    .select('id, full_name, avatar_url, skill_level, is_member, is_guest')
    .eq('is_member', true)
    .order('full_name')

  // ── Fetch recent guests (for AddPlayerModal > Guest tab) ─────────────
  const { data: recentGuestsData } = await supabase
    .from('players')
    .select('id, full_name, avatar_url, skill_level, is_member, is_guest')
    .eq('is_guest', true)
    .order('created_at', { ascending: false })
    .limit(30)

  function toQueuePlayer(p: {
    id: string
    full_name: string
    avatar_url: string | null
    skill_level: string | null
    is_member: boolean
    is_guest: boolean
  }): QueuePlayer {
    return {
      id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      skill_level: p.skill_level,
      is_member: p.is_member,
      is_guest: p.is_guest,
    }
  }

  return (
    <QueueClient
      session={session}
      members={(membersData ?? []).map(toQueuePlayer)}
      recentGuests={(recentGuestsData ?? []).map(toQueuePlayer)}
    />
  )
}
