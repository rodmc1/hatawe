export type PlayerLevel =
  | 'Unrated'
  | 'Beginner'
  | 'Intermediate Low'
  | 'Intermediate'
  | 'Intermediate High'
  | 'Advance'

export interface Player {
  id: string
  name: string
  initials: string
  level: PlayerLevel
  matchesPlayed: number
  wins: number
  membership: 'Member' | 'Non Member'
  avatarUrl?: string
}

export const LEVEL_OPTIONS: PlayerLevel[] = [
  'Unrated',
  'Beginner',
  'Intermediate Low',
  'Intermediate',
  'Intermediate High',
  'Advance',
]

export const LEVEL_STYLES: Record<PlayerLevel, string> = {
  Unrated: 'border border-dashed border-slate-300 bg-slate-100/80 text-slate-700',
  Beginner: 'bg-emerald-100 text-emerald-700',
  'Intermediate Low': 'bg-cyan-100 text-cyan-700',
  Intermediate: 'bg-sky-100 text-sky-700',
  'Intermediate High': 'bg-violet-100 text-violet-700',
  Advance: 'bg-fuchsia-100 text-fuchsia-700',
}

export const SKILL_LEVEL_TO_DB: Record<PlayerLevel, string> = {
  'Unrated': 'unrated',
  'Beginner': 'beginner',
  'Intermediate Low': 'intermediate_low',
  'Intermediate': 'intermediate',
  'Intermediate High': 'intermediate_high',
  'Advance': 'advanced',
}

export const DB_TO_SKILL_LEVEL: Record<string, PlayerLevel> = {
  unrated: 'Unrated',
  beginner: 'Beginner',
  intermediate_low: 'Intermediate Low',
  intermediate: 'Intermediate',
  intermediate_high: 'Intermediate High',
  advanced: 'Advance',
}

export function getWinRate(player: Player): number {
  return player.matchesPlayed === 0
    ? 0
    : Math.round((player.wins / player.matchesPlayed) * 100)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((chunk) => chunk[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
