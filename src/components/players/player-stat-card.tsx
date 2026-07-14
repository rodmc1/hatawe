import type { ReactNode } from 'react'

interface PlayerStatCardProps {
  label: string
  value: number
  icon: ReactNode
  description: string
}

export function PlayerStatCard({ label, value, icon, description }: PlayerStatCardProps) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
        </div>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
