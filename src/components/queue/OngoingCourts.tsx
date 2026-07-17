'use client'

import { useState } from 'react'
import { Swords } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useQueue } from './QueueProvider'
import { WinnerModal } from './WinnerModal'
import type { OngoingCourt, QueuePlayer } from '@/lib/queue/types'

export function OngoingCourts() {
  const { state } = useQueue()
  const [selectedCourt, setSelectedCourt] = useState<OngoingCourt | null>(null)

  const sorted = [...state.ongoingCourts].sort(
    (a, b) => a.courtNumber - b.courtNumber,
  )

  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Swords className="h-4 w-4" />
        On Court ({sorted.length})
      </h2>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          No games in progress.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((court) => (
            <CourtCard
              key={court.courtNumber}
              court={court}
              onDecideWinner={() => setSelectedCourt(court)}
            />
          ))}
        </div>
      )}

      <WinnerModal
        court={selectedCourt}
        onClose={() => setSelectedCourt(null)}
      />
    </section>
  )
}

// ── Court card ────────────────────────────────────────────────────────────

function CourtCard({
  court,
  onDecideWinner,
}: {
  court: OngoingCourt
  onDecideWinner: () => void
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          Court {court.courtNumber}
        </span>
        <Button
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={onDecideWinner}
        >
          Decide Winner
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <div className="space-y-1.5">
          <span className="text-[0.6rem] font-bold uppercase tracking-widest text-blue-600">
            Team A
          </span>
          {court.teamA.map((p) => (
            <PlayerChip key={p.id} player={p} />
          ))}
        </div>

        <div className="flex h-full items-center justify-center px-1 pt-4">
          <span className="text-xs font-semibold text-muted-foreground">vs</span>
        </div>

        <div className="space-y-1.5">
          <span className="text-[0.6rem] font-bold uppercase tracking-widest text-rose-600">
            Team B
          </span>
          {court.teamB.map((p) => (
            <PlayerChip key={p.id} player={p} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PlayerChip({ player }: { player: QueuePlayer }) {
  function initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div className="flex items-center gap-1.5">
      <Avatar className="h-6 w-6 shrink-0">
        {player.avatar_url ? (
          <img
            src={player.avatar_url}
            alt={player.full_name}
            className="rounded-full"
          />
        ) : (
          <AvatarFallback className="text-[0.55rem]">
            {initials(player.full_name)}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="truncate text-sm">{player.full_name}</span>
    </div>
  )
}
