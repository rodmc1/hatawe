'use client'

import { Edit3 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LevelBadge } from './level-badge'
import { type Player, getWinRate } from './player-types'

interface PlayerItemProps {
  player: Player
  onEdit: (player: Player) => void
}

export function PlayerItem({ player, onEdit }: PlayerItemProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm md:grid md:grid-cols-[3fr_2fr_1fr_1fr_auto] md:items-center md:gap-4 md:p-5">
      <div className="flex items-center gap-3">
        <Avatar className="bg-muted text-foreground">
          {player.avatarUrl ? (
            <img src={player.avatarUrl} alt={player.name} />
          ) : (
            <AvatarFallback>{player.initials}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{player.name}</p>
          <p className="text-sm text-muted-foreground">{player.membership}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 md:mt-0">
        <LevelBadge level={player.level} />
      </div>

      <div className="mt-4 text-right text-sm text-muted-foreground md:mt-0">
        <p className="text-base font-semibold text-foreground">{player.matchesPlayed}</p>
        <span className="text-slate-500">Matches</span>
      </div>

      <div className="mt-4 text-right text-sm md:mt-0">
        <p className="text-base font-semibold text-foreground">{getWinRate(player)}%</p>
        <span className="text-slate-500">Win rate</span>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 md:mt-0">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => onEdit(player)}>
          <Edit3 className="h-4 w-4" />
          Edit
        </Button>
      </div>
    </div>
  )
}
