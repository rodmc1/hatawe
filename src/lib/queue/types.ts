// ── Queue state types ─────────────────────────────────────────────────────
// These types define the in-memory state that drives the queue UI.
// Nothing here is persisted to the database while the session is running —
// only completed match results are written (see actions.ts).

export interface QueuePlayer {
  id: string
  full_name: string
  avatar_url: string | null
  skill_level: string | null
  is_member: boolean
  is_guest: boolean
}

export interface QueueSlot {
  player: QueuePlayer | null
  team: 'A' | 'B'
}

export interface QueueGroup {
  localId: string
  /** slots[0..1] = Team A, slots[2..3] = Team B */
  slots: [QueueSlot, QueueSlot, QueueSlot, QueueSlot]
  /** FIFO insertion order; lower = earlier in queue */
  position: number
}

export interface OngoingCourt {
  courtNumber: number
  teamA: [QueuePlayer, QueuePlayer]
  teamB: [QueuePlayer, QueuePlayer]
  /** ISO string so the value is JSON/localStorage serialisable */
  startedAt: string
  fromGroupId: string
}

export interface QueuePageState {
  availablePlayers: QueuePlayer[]
  queuedGroups: QueueGroup[]
  ongoingCourts: OngoingCourt[]
}

export function emptyQueueState(): QueuePageState {
  return { availablePlayers: [], queuedGroups: [], ongoingCourts: [] }
}

export function createQueueGroup(position: number): QueueGroup {
  return {
    localId: crypto.randomUUID(),
    position,
    slots: [
      { player: null, team: 'A' },
      { player: null, team: 'A' },
      { player: null, team: 'B' },
      { player: null, team: 'B' },
    ],
  }
}
