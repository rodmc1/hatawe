'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updatePlayer, type DbSkillLevel } from '@/app/players/actions'
import {
  type Player,
  type PlayerLevel,
  SKILL_LEVEL_TO_DB,
  getInitials,
} from './player-types'
import { SkillLevelSelect } from './skill-level-select'

interface EditPlayerModalProps {
  player: Player | null
  onClose: () => void
  onSave: (updated: Player) => void
}

export function EditPlayerModal({ player, onClose, onSave }: EditPlayerModalProps) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<PlayerLevel>('Unrated')
  const [membership, setMembership] = useState<'Member' | 'Non Member'>('Member')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (player) {
      setName(player.name)
      setLevel(player.level)
      setMembership(player.membership)
    }
  }, [player])

  if (!player) return null

  async function handleSave() {
    if (!player) return
    const trimmedName = name.trim()
    if (!trimmedName) return

    setIsSaving(true)
    try {
      await updatePlayer(player.id, {
        full_name: trimmedName,
        skill_level: SKILL_LEVEL_TO_DB[level] as DbSkillLevel,
        is_member: membership === 'Member',
      })

      onSave({
        ...player,
        name: trimmedName,
        initials: getInitials(trimmedName),
        level,
        membership,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Edit Player</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Update player information and skill level.
            </p>
          </div>
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
            <p className="text-sm text-foreground">Level</p>
            <SkillLevelSelect value={level} onChange={setLevel} />
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm text-foreground">Membership</p>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            {(['Member', 'Non Member'] as const).map((option) => (
              <Button
                key={option}
                variant={membership === option ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMembership(option)}
              >
                {option}
              </Button>
            ))}
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
            {isSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
