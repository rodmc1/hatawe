import { LEVEL_STYLES, type PlayerLevel } from './player-types'

interface LevelBadgeProps {
  level: PlayerLevel
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] ${LEVEL_STYLES[level]}`}
    >
      {level === 'Unrated' ? 'Unranked' : level}
    </span>
  )
}
