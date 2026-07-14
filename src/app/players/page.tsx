'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getPlayers } from './actions'
import {
  type Player,
  type PlayerLevel,
  DB_TO_SKILL_LEVEL,
  getInitials,
} from '@/components/players/player-types'
import { PlayerStatCard } from '@/components/players/player-stat-card'
import { PlayerFilters } from '@/components/players/player-filters'
import { PlayerItem } from '@/components/players/player-item'
import { AddPlayerModal } from '@/components/players/add-player-modal'
import { EditPlayerModal } from '@/components/players/edit-player-modal'

function dbPlayerToUi(p: Awaited<ReturnType<typeof getPlayers>>[number]): Player {
  return {
    id: p.id,
    name: p.full_name,
    initials: getInitials(p.full_name),
    level: DB_TO_SKILL_LEVEL[p.skill_level] ?? 'Unrated',
    matchesPlayed: p.matchesPlayed,
    wins: p.wins,
    membership: p.is_member ? 'Member' : 'Non Member',
    avatarUrl: p.avatar_url ?? undefined,
  }
}

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<PlayerLevel | 'All'>('All')
  const [membershipFilter, setMembershipFilter] = useState<'All' | 'Member' | 'Non Member'>('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  useEffect(() => {
    getPlayers()
      .then((rows) => setPlayers(rows.map(dbPlayerToUi)))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
      const matchesLevel = selectedLevel === 'All' || player.level === selectedLevel
      const matchesMembership =
        membershipFilter === 'All' || player.membership === membershipFilter
      return matchesSearch && matchesLevel && matchesMembership
    })
  }, [players, searchTerm, selectedLevel, membershipFilter])

  const totalMembers = players.filter((p) => p.membership === 'Member').length

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-background text-foreground px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <header className="space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h1 className="uppercase text-4xl font-semibold text-foreground tracking-[0.1em] text-sky-600">
                        Players
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Manage player levels and track match statistics from one responsive dashboard.
                      </p>
                    </div>

                    <Button
                      size="lg"
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Player
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <PlayerStatCard
                      label="Total players"
                      value={players.length}
                      icon={<Users className="h-5 w-5 text-sky-600" />}
                      description="All registered players"
                    />
                    <PlayerStatCard
                      label="Members"
                      value={totalMembers}
                      icon={<Sparkles className="h-5 w-5 text-amber-600" />}
                      description="Players with active membership"
                    />
                  </div>
                </header>

                <PlayerFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedLevel={selectedLevel}
                  onLevelChange={setSelectedLevel}
                  membershipFilter={membershipFilter}
                  onMembershipChange={setMembershipFilter}
                />

                <section className="mt-8 space-y-3">
                  <div className="hidden grid-cols-[3fr_2fr_1fr_1fr_1fr] gap-4 rounded-3xl border border-border bg-card px-4 py-3 text-xs uppercase tracking-[0.24em] text-muted-foreground md:grid">
                    <span className="flex items-center gap-2">Player</span>
                    <span>Level</span>
                    <span className="text-right">Matches</span>
                    <span className="text-right">Win rate</span>
                    <span className="text-right">Actions</span>
                  </div>

                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="rounded-3xl border border-border bg-card px-6 py-10 text-center text-muted-foreground">
                        Loading players…
                      </div>
                    ) : filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player) => (
                        <PlayerItem
                          key={player.id}
                          player={player}
                          onEdit={setEditingPlayer}
                        />
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center text-muted-foreground">
                        No players match your filters. Try a broader search or clear the selected level.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            <AddPlayerModal
              open={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAdd={(player) => setPlayers((prev) => [player, ...prev])}
            />

            <EditPlayerModal
              player={editingPlayer}
              onClose={() => setEditingPlayer(null)}
              onSave={(updated) =>
                setPlayers((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p)),
                )
              }
            />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}



