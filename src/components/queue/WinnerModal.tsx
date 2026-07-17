'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQueue } from './QueueProvider'
import type { OngoingCourt } from '@/lib/queue/types'

interface WinnerModalProps {
  court: OngoingCourt | null
  onClose: () => void
}

export function WinnerModal({ court, onClose }: WinnerModalProps) {
  const { resolveMatch } = useQueue()
  const [isSaving, setIsSaving] = useState(false)

  if (!court) return null

  async function handlePickWinner(team: 'A' | 'B') {
    if (!court) return
    setIsSaving(true)
    try {
      await resolveMatch(court.courtNumber, team)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Court {court.courtNumber} — Who won?
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {/* Team A */}
          <button
            disabled={isSaving}
            onClick={() => handlePickWinner('A')}
            className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 text-left transition-colors hover:border-blue-400 hover:bg-blue-100 disabled:opacity-50"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
              Team A
            </p>
            {court.teamA.map((p) => (
              <p key={p.id} className="truncate text-sm font-medium text-foreground">
                {p.full_name}
              </p>
            ))}
          </button>

          {/* Team B */}
          <button
            disabled={isSaving}
            onClick={() => handlePickWinner('B')}
            className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-left transition-colors hover:border-rose-400 hover:bg-rose-100 disabled:opacity-50"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-600">
              Team B
            </p>
            {court.teamB.map((p) => (
              <p key={p.id} className="truncate text-sm font-medium text-foreground">
                {p.full_name}
              </p>
            ))}
          </button>
        </div>

        {isSaving && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Saving match result…
          </p>
        )}
      </div>
    </div>
  )
}
