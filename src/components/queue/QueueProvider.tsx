'use client'

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  createQueueGroup,
  emptyQueueState,
  type OngoingCourt,
  type QueueGroup,
  type QueuePageState,
  type QueuePlayer,
} from '@/lib/queue/types'
import { saveMatchResult } from '@/lib/queue/actions'

// ── Session type (passed down from the server component) ─────────────────

export interface SessionData {
  id: string
  name: string
  venue: string
  court_count: number
  status: string
}

// ── Context interface ─────────────────────────────────────────────────────

interface QueueContextValue {
  state: QueuePageState
  session: SessionData
  freeCourts: number
  // Available players
  addToAvailable: (players: QueuePlayer[]) => void
  // Queue group actions
  quickAddPlayer: (player: QueuePlayer) => void
  bulkAddToQueue: (players: QueuePlayer[]) => void
  removeFromSlot: (groupId: string, slotIndex: number) => void
  placeInSlot: (playerId: string, groupId: string, slotIndex: number) => void
  playGroup: (groupId: string) => void
  // Match resolution
  resolveMatch: (courtNumber: number, winningTeam: 'A' | 'B') => Promise<void>
}

const QueueContext = createContext<QueueContextValue | null>(null)

export function useQueue(): QueueContextValue {
  const ctx = useContext(QueueContext)
  if (!ctx) throw new Error('useQueue must be used inside <QueueProvider>')
  return ctx
}

// ── Provider ──────────────────────────────────────────────────────────────

interface QueueProviderProps {
  session: SessionData
  children: ReactNode
}

export function QueueProvider({ session, children }: QueueProviderProps) {
  const qc = useQueryClient()
  const queueKey = ['queue', session.id] as const

  const [activePlayer, setActivePlayer] = useState<QueuePlayer | null>(null)

  // State lives in TanStack Query cache; persisted to localStorage via
  // persistQueryClient configured in lib/queue/query-client.ts
  const { data: state = emptyQueueState() } = useQuery<QueuePageState>({
    queryKey: queueKey,
    queryFn: emptyQueueState,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 12,
  })

  function updateQueue(updater: (prev: QueuePageState) => QueuePageState) {
    qc.setQueryData<QueuePageState>(queueKey, (prev = emptyQueueState()) =>
      updater(prev),
    )
  }

  function maxPosition(groups: QueueGroup[]) {
    return groups.length === 0 ? -1 : Math.max(...groups.map((g) => g.position))
  }

  // ── Available-player actions ─────────────────────────────────────────

  function addToAvailable(players: QueuePlayer[]) {
    updateQueue((prev) => {
      const existingIds = new Set(prev.availablePlayers.map((p) => p.id))
      const fresh = players.filter((p) => !existingIds.has(p.id))
      return { ...prev, availablePlayers: [...prev.availablePlayers, ...fresh] }
    })
  }

  // ── Queue-group actions ──────────────────────────────────────────────

  /** Click a player card → fill the first open slot (auto-balancing teams) */
  function quickAddPlayer(player: QueuePlayer) {
    updateQueue((prev) => {
      const alreadyQueued = prev.queuedGroups.some((g) =>
        g.slots.some((s) => s.player?.id === player.id),
      )
      if (alreadyQueued) return prev

      let newGroups = [...prev.queuedGroups]

      const groupIdx = newGroups.findIndex((g) =>
        g.slots.some((s) => s.player === null),
      )

      if (groupIdx === -1) {
        // No open group — create one and place in first Team A slot
        const group = createQueueGroup(maxPosition(newGroups) + 1)
        group.slots[0] = { ...group.slots[0], player }
        newGroups = [...newGroups, group]
      } else {
        // Find the less-full team within the group (tie-break: Team A first)
        const group = { ...newGroups[groupIdx] }
        const slots = group.slots.map((s) => ({ ...s })) as QueueGroup['slots']

        const aFilled = slots.filter((s) => s.team === 'A' && s.player).length
        const bFilled = slots.filter((s) => s.team === 'B' && s.player).length
        const targetTeam = aFilled <= bFilled ? 'A' : 'B'

        const slotIdx = slots.findIndex(
          (s) => s.team === targetTeam && s.player === null,
        )
        slots[slotIdx] = { ...slots[slotIdx], player }
        group.slots = slots
        newGroups[groupIdx] = group
      }

      return {
        ...prev,
        availablePlayers: prev.availablePlayers.filter((p) => p.id !== player.id),
        queuedGroups: newGroups,
      }
    })
  }

  /** Select exactly 4 players → create one new group, split 2+2 */
  function bulkAddToQueue(players: QueuePlayer[]) {
    if (players.length !== 4) return
    updateQueue((prev) => {
      const group = createQueueGroup(maxPosition(prev.queuedGroups) + 1)
      group.slots[0] = { ...group.slots[0], player: players[0] }
      group.slots[1] = { ...group.slots[1], player: players[1] }
      group.slots[2] = { ...group.slots[2], player: players[2] }
      group.slots[3] = { ...group.slots[3], player: players[3] }
      return {
        ...prev,
        availablePlayers: prev.availablePlayers.filter(
          (p) => !players.some((pl) => pl.id === p.id),
        ),
        queuedGroups: [...prev.queuedGroups, group],
      }
    })
  }

  /** Remove a player from a slot → returns them to Available.
   *  The group keeps its position (pinned). */
  function removeFromSlot(groupId: string, slotIndex: number) {
    updateQueue((prev) => {
      const groupIdx = prev.queuedGroups.findIndex((g) => g.localId === groupId)
      if (groupIdx === -1) return prev

      const group = prev.queuedGroups[groupIdx]
      const removed = group.slots[slotIndex].player
      if (!removed) return prev

      const newSlots = group.slots.map((s, i) =>
        i === slotIndex ? { ...s, player: null } : { ...s },
      ) as QueueGroup['slots']

      return {
        ...prev,
        availablePlayers: [...prev.availablePlayers, removed],
        queuedGroups: prev.queuedGroups.map((g, i) =>
          i === groupIdx ? { ...g, slots: newSlots } : g,
        ),
      }
    })
  }

  /** Drop a player onto a slot (empty or filled).
   *  If filled, the current occupant is returned to Available. */
  function placeInSlot(playerId: string, groupId: string, slotIndex: number) {
    updateQueue((prev) => {
      const player = prev.availablePlayers.find((p) => p.id === playerId)
      if (!player) return prev

      const groupIdx = prev.queuedGroups.findIndex((g) => g.localId === groupId)
      if (groupIdx === -1) return prev

      const occupant = prev.queuedGroups[groupIdx].slots[slotIndex].player

      let newAvailable = prev.availablePlayers.filter((p) => p.id !== playerId)
      if (occupant) newAvailable = [...newAvailable, occupant]

      const newSlots = prev.queuedGroups[groupIdx].slots.map((s, i) =>
        i === slotIndex ? { ...s, player } : { ...s },
      ) as QueueGroup['slots']

      return {
        ...prev,
        availablePlayers: newAvailable,
        queuedGroups: prev.queuedGroups.map((g, i) =>
          i === groupIdx ? { ...g, slots: newSlots } : g,
        ),
      }
    })
  }

  /** Send a fully filled group onto the lowest free court */
  function playGroup(groupId: string) {
    updateQueue((prev) => {
      const group = prev.queuedGroups.find((g) => g.localId === groupId)
      if (!group || group.slots.some((s) => !s.player)) return prev

      const usedCourts = new Set(prev.ongoingCourts.map((c) => c.courtNumber))
      let courtNumber = 1
      while (usedCourts.has(courtNumber) && courtNumber <= session.court_count) {
        courtNumber++
      }
      if (courtNumber > session.court_count) return prev // no free court

      const [s0, s1, s2, s3] = group.slots
      const newCourt: OngoingCourt = {
        courtNumber,
        teamA: [s0.player!, s1.player!],
        teamB: [s2.player!, s3.player!],
        startedAt: new Date().toISOString(),
        fromGroupId: groupId,
      }

      return {
        ...prev,
        queuedGroups: prev.queuedGroups.filter((g) => g.localId !== groupId),
        ongoingCourts: [...prev.ongoingCourts, newCourt],
      }
    })
  }

  /** Pick a winner: writes match to DB then returns all 4 players to Available */
  async function resolveMatch(courtNumber: number, winningTeam: 'A' | 'B') {
    const court = state.ongoingCourts.find((c) => c.courtNumber === courtNumber)
    if (!court) return

    await saveMatchResult({
      sessionId: session.id,
      courtNumber,
      teamA: court.teamA,
      teamB: court.teamB,
      winningTeam,
      startedAt: court.startedAt,
    })

    updateQueue((prev) => {
      const c = prev.ongoingCourts.find((oc) => oc.courtNumber === courtNumber)
      if (!c) return prev
      return {
        ...prev,
        ongoingCourts: prev.ongoingCourts.filter(
          (oc) => oc.courtNumber !== courtNumber,
        ),
        availablePlayers: [
          ...prev.availablePlayers,
          ...c.teamA,
          ...c.teamB,
        ],
      }
    })
  }

  const freeCourts =
    session.court_count - state.ongoingCourts.length

  // ── Drag-and-drop ────────────────────────────────────────────────────
  // Draggable: player cards in Available (id = "player:{playerId}")
  // Droppable: slots in Queued groups  (id = "slot:{groupId}:{slotIndex}")
  // Slot IDs use ":" as separator; group localIds are UUID-format (hyphens only).

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8 px of movement before activating drag so short taps
      // fire the onClick quick-add handler instead.
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  )

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    if (id.startsWith('player:')) {
      const playerId = id.slice('player:'.length)
      setActivePlayer(
        state.availablePlayers.find((p) => p.id === playerId) ?? null,
      )
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActivePlayer(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    if (activeId.startsWith('player:') && overId.startsWith('slot:')) {
      // "slot:{groupId}:{slotIndex}" — groupId is UUID (no colons), safe to split
      const parts = overId.split(':')
      const groupId = parts[1]
      const slotIndex = parseInt(parts[2], 10)
      const playerId = activeId.slice('player:'.length)
      placeInSlot(playerId, groupId, slotIndex)
    }
  }

  return (
    <QueueContext.Provider
      value={{
        state,
        session,
        freeCourts,
        addToAvailable,
        quickAddPlayer,
        bulkAddToQueue,
        removeFromSlot,
        placeInSlot,
        playGroup,
        resolveMatch,
      }}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActivePlayer(null)}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {activePlayer && (
            <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-sm font-medium opacity-90 pointer-events-none">
              {activePlayer.full_name}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </QueueContext.Provider>
  )
}
