'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQueue } from './QueueProvider'
import { AddPlayerModal } from './AddPlayerModal'
import type { QueuePlayer } from '@/lib/queue/types'

interface AvailablePlayersProps {
  members: QueuePlayer[]
  recentGuests: QueuePlayer[]
}

export function AvailablePlayers({ members, recentGuests }: AvailablePlayersProps) {
  const { state, quickAddPlayer, bulkAddToQueue } = useQueue()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)

  const players = state.availablePlayers

  // All IDs currently tracked in this session (available + queued + on court)
  const trackedIds = new Set([
    ...players.map((p) => p.id),
    ...state.queuedGroups.flatMap((g) =>
      g.slots.map((s) => s.player?.id).filter(Boolean),
    ),
    ...state.ongoingCourts.flatMap((c) => [...c.teamA, ...c.teamB].map((p) => p.id)),
  ])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 4) {
        next.add(id)
      }
      return next
    })
  }

  function handleBulkAdd() {
    const toQueue = players.filter((p) => selected.has(p.id))
    if (toQueue.length !== 4) return
    bulkAddToQueue(toQueue)
    setSelected(new Set())
  }

  return (
    <section className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Users className="h-4 w-4" />
          Available ({players.length})
        </h2>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 px-2.5 text-xs"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Player
        </Button>
      </div>

      {/* Selection banner */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-700 border border-sky-200">
          <span>{selected.size} / 4 selected</span>
          {selected.size === 4 ? (
            <Button size="sm" className="h-6 px-2.5 text-xs" onClick={handleBulkAdd}>
              Add to Queue
            </Button>
          ) : (
            <span className="text-xs text-sky-500">
              Select {4 - selected.size} more
            </span>
          )}
        </div>
      )}

      {/* Player list */}
      <div className="space-y-2">
        {players.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No players yet. Add players to get started.
          </div>
        ) : (
          players.map((player) => (
            <DraggablePlayerCard
              key={player.id}
              player={player}
              selected={selected.has(player.id)}
              onToggleSelect={() => toggleSelect(player.id)}
              onQuickAdd={() => quickAddPlayer(player)}
            />
          ))
        )}
      </div>

      <AddPlayerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        members={members}
        recentGuests={recentGuests}
        trackedIds={trackedIds as Set<string>}
      />
    </section>
  )
}

// ── Draggable player card ────────────────────────────────────────────────

interface DraggablePlayerCardProps {
  player: QueuePlayer
  selected: boolean
  onToggleSelect: () => void
  onQuickAdd: () => void
}

function DraggablePlayerCard({
  player,
  selected,
  onToggleSelect,
  onQuickAdd,
}: DraggablePlayerCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player:${player.id}`,
    data: { player },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  function initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2.5 rounded-2xl border bg-card px-3 py-2.5 shadow-sm transition-colors',
        isDragging && 'opacity-40',
        selected && 'border-sky-400 bg-sky-50/60 ring-1 ring-sky-400',
      )}
    >
      {/* Checkbox — stops propagation so it doesn't trigger quick-add */}
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 shrink-0 cursor-pointer accent-sky-600"
      />

      {/* Drag + click area */}
      <div
        className="flex flex-1 cursor-pointer items-center gap-2 min-w-0"
        onClick={onQuickAdd}
        {...listeners}
        {...attributes}
      >
        <Avatar className="h-7 w-7 shrink-0">
          {player.avatar_url ? (
            <img
              src={player.avatar_url}
              alt={player.full_name}
              className="rounded-full"
            />
          ) : (
            <AvatarFallback className="text-[0.65rem]">
              {initials(player.full_name)}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="truncate text-sm font-medium">{player.full_name}</span>
        {player.is_guest && (
          <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-amber-700">
            Guest
          </span>
        )}
      </div>
    </div>
  )
}
