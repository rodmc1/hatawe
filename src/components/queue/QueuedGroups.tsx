'use client'

import { useDroppable } from '@dnd-kit/core'
import { ListOrdered, X } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQueue } from './QueueProvider'
import type { QueueGroup, QueueSlot } from '@/lib/queue/types'

export function QueuedGroups() {
  const { state, freeCourts } = useQueue()

  const sorted = [...state.queuedGroups].sort((a, b) => a.position - b.position)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <ListOrdered className="h-4 w-4" />
        Queue ({sorted.length})
      </h2>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No groups queued yet. Click or drag players to add them.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((group, idx) => (
            <QueueGroupCard
              key={group.localId}
              group={group}
              position={idx + 1}
              freeCourts={freeCourts}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ── Group card ────────────────────────────────────────────────────────────

interface QueueGroupCardProps {
  group: QueueGroup
  position: number
  freeCourts: number
}

function QueueGroupCard({ group, position, freeCourts }: QueueGroupCardProps) {
  const { playGroup } = useQueue()

  const allFilled = group.slots.every((s) => s.player !== null)
  const canPlay = allFilled && freeCourts > 0

  // Split slots by team, keeping original index for the droppable id
  const slotsA = group.slots
    .map((s, i) => ({ slot: s, index: i }))
    .filter((si) => si.slot.team === 'A')
  const slotsB = group.slots
    .map((s, i) => ({ slot: s, index: i }))
    .filter((si) => si.slot.team === 'B')

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      {/* Card header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          #{position}
        </span>
        <Button
          size="sm"
          className="h-7 px-3 text-xs"
          disabled={!canPlay}
          onClick={() => playGroup(group.localId)}
          title={
            !allFilled
              ? 'Fill all 4 slots first'
              : freeCourts === 0
              ? 'No free courts'
              : 'Send to a court'
          }
        >
          Play
        </Button>
      </div>

      {/* Slots — Team A | vs | Team B */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <div className="space-y-1.5">
          <span className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-600">
            Team A
          </span>
          {slotsA.map(({ slot, index }) => (
            <SlotCell
              key={index}
              slot={slot}
              groupId={group.localId}
              slotIndex={index}
            />
          ))}
        </div>

        <div className="flex h-full items-center justify-center px-1 pt-4">
          <span className="text-xs font-semibold text-muted-foreground">vs</span>
        </div>

        <div className="space-y-1.5">
          <span className="text-[0.6rem] font-bold uppercase tracking-widest text-rose-600">
            Team B
          </span>
          {slotsB.map(({ slot, index }) => (
            <SlotCell
              key={index}
              slot={slot}
              groupId={group.localId}
              slotIndex={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Slot cell (droppable) ─────────────────────────────────────────────────

interface SlotCellProps {
  slot: QueueSlot
  groupId: string
  slotIndex: number
}

function SlotCell({ slot, groupId, slotIndex }: SlotCellProps) {
  const { removeFromSlot } = useQueue()

  // Droppable id: "slot:{groupId}:{slotIndex}"
  // groupId is a UUID — contains hyphens but never colons, so split(':') is safe.
  const { isOver, setNodeRef } = useDroppable({
    id: `slot:${groupId}:${slotIndex}`,
    data: { groupId, slotIndex },
  })

  function initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  if (slot.player) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          'flex items-center justify-between gap-2 rounded-xl border bg-muted/40 px-2.5 py-1.5 transition-colors',
          isOver && 'border-sky-400 bg-sky-50/60 ring-1 ring-sky-300',
        )}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <Avatar className="h-6 w-6 shrink-0">
            {slot.player.avatar_url ? (
              <img
                src={slot.player.avatar_url}
                alt={slot.player.full_name}
                className="rounded-full"
              />
            ) : (
              <AvatarFallback className="text-[0.55rem]">
                {initials(slot.player.full_name)}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="truncate text-sm font-medium">{slot.player.full_name}</span>
        </div>
        <button
          onClick={() => removeFromSlot(groupId, slotIndex)}
          className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Remove from slot"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center justify-center rounded-xl border border-dashed px-2.5 py-1.5 text-xs text-muted-foreground transition-colors',
        isOver
          ? 'border-sky-400 bg-sky-50/60 text-sky-600'
          : 'hover:border-border/80',
      )}
    >
      {isOver ? 'Drop here' : 'Empty slot'}
    </div>
  )
}
