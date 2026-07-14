'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addPlayer, type DbSkillLevel } from '@/app/players/actions'
import {
  type Player,
  type PlayerLevel,
  DB_TO_SKILL_LEVEL,
  SKILL_LEVEL_TO_DB,
  getInitials,
} from './player-types'
import { SkillLevelSelect } from './skill-level-select'

interface AddPlayerModalProps {
  open: boolean
  onClose: () => void
  onAdd: (player: Player) => void
}

export function AddPlayerModal({ open, onClose, onAdd }: AddPlayerModalProps) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<PlayerLevel>('Unrated')
  const [isSaving, setIsSaving] = useState(false)

  if (!open) return null

  async function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) return

    setIsSaving(true)
    try {
      const dbPlayer = await addPlayer({
        full_name: trimmedName,
        skill_level: SKILL_LEVEL_TO_DB[level] as DbSkillLevel,
      })

      onAdd({
        id: dbPlayer.id,
        name: dbPlayer.full_name,
        initials: getInitials(dbPlayer.full_name),
        level: DB_TO_SKILL_LEVEL[dbPlayer.skill_level] ?? 'Unrated',
        matchesPlayed: 0,
        wins: 0,
        membership: 'Non Member',
        avatarUrl: dbPlayer.avatar_url ?? undefined,
      })

      setName('')
      setLevel('Unrated')
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/10">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold text-foreground">Add Player</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-foreground">Player name</p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">Skill level</p>
            <SkillLevelSelect value={level} onChange={setLevel} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="inline-flex items-center gap-2 shadow-sm"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
