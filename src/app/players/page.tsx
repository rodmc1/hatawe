'use client'

import { useMemo, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  ChevronDown,
  CirclePlus,
  Edit3,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

type PlayerLevel =
  | 'Unrated'
  | 'Beginner'
  | 'Intermediate Low'
  | 'Intermediate'
  | 'Intermediate High'
  | 'Advance'

interface Player {
  id: string
  name: string
  initials: string
  level: PlayerLevel
  matchesPlayed: number
  wins: number
  membership: 'Member' | 'Non Member'
  avatarUrl?: string
}

const LEVEL_OPTIONS: PlayerLevel[] = [
  'Unrated',
  'Beginner',
  'Intermediate Low',
  'Intermediate',
  'Intermediate High',
  'Advance',
]

const PLAYERS_MOCK: Player[] = [
  {
    id: 'p-1',
    name: 'Mina Tanaka',
    initials: 'MT',
    level: 'Unrated',
    matchesPlayed: 0,
    wins: 0,
    membership: 'Non Member',
  },
  {
    id: 'p-2',
    name: 'Aaron Lee',
    initials: 'AL',
    level: 'Beginner',
    matchesPlayed: 3,
    wins: 2,
    membership: 'Member',
  },
  {
    id: 'p-3',
    name: 'Sara Johnson',
    initials: 'SJ',
    level: 'Intermediate',
    matchesPlayed: 18,
    wins: 12,
    membership: 'Member',
  },
  {
    id: 'p-4',
    name: 'Ezra Kim',
    initials: 'EK',
    level: 'Advance',
    matchesPlayed: 34,
    wins: 24,
    membership: 'Member',
  },
  {
    id: 'p-5',
    name: 'Lina Ortiz',
    initials: 'LO',
    level: 'Beginner',
    matchesPlayed: 8,
    wins: 3,
    membership: 'Non Member',
  },
]

const LEVEL_STYLES: Record<PlayerLevel, string> = {
  Unrated:
    'border border-dashed border-slate-300 bg-slate-100/80 text-slate-700',
  Beginner: 'bg-emerald-100 text-emerald-700',
  'Intermediate Low': 'bg-cyan-100 text-cyan-700',
  Intermediate: 'bg-sky-100 text-sky-700',
  'Intermediate High': 'bg-violet-100 text-violet-700',
  Advance: 'bg-fuchsia-100 text-fuchsia-700',
}

function getWinRate(player: Player) {
  return player.matchesPlayed === 0
    ? 0
    : Math.round((player.wins / player.matchesPlayed) * 100)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((chunk) => chunk[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Page() {
  const [players, setPlayers] = useState<Player[]>(PLAYERS_MOCK)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<PlayerLevel | 'All'>('All')
  const [membershipFilter, setMembershipFilter] = useState<'All' | 'Member' | 'Non Member'>('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGuestName, setNewGuestName] = useState('')
  const [newGuestLevel, setNewGuestLevel] = useState<PlayerLevel>('Unrated')
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [editName, setEditName] = useState('')
  const [editLevel, setEditLevel] = useState<PlayerLevel>('Unrated')
  const [editMembership, setEditMembership] = useState<'Member' | 'Non Member'>('Member')

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

  const totalActive = players.length
  const totalMembers = players.filter(
    (player) => player.membership === 'Member',
  ).length

  function openEditModal(player: Player) {
    setEditingPlayer(player)
    setEditName(player.name)
    setEditLevel(player.level)
    setEditMembership(player.membership)
  }

  function closeEditModal() {
    setEditingPlayer(null)
  }

  function saveEditPlayer() {
    if (!editingPlayer) return
    const trimmedName = editName.trim()
    if (!trimmedName) return
    setPlayers((current) =>
      current.map((player) =>
        player.id === editingPlayer.id
          ? {
              ...player,
              name: trimmedName,
              initials: getInitials(trimmedName),
              level: editLevel,
              membership: editMembership,
            }
          : player,
      ),
    )
    closeEditModal()
  }

  function addGuestPlayer() {
    const trimmedName = newGuestName.trim()
    if (!trimmedName) return

    const newPlayer: Player = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name: trimmedName,
      initials: getInitials(trimmedName),
      level: newGuestLevel,
      matchesPlayed: 0,
      wins: 0,
      membership: 'Non Member',
    }

    setPlayers((current) => [newPlayer, ...current])
    setNewGuestName('')
    setNewGuestLevel('Unrated')
    setIsModalOpen(false)
  }

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
                      <h1 className="uppercase text-4xl font-semibold text-foreground tracking-[0.1em] text-sky-600">Players</h1>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Manage player levels and track match statistics from one responsive dashboard.
                      </p>
                    </div>

                    <Button size="lg" onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 shadow-sm">
                      <Plus className="h-4 w-4" />
                      Add Player
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard
                      label="Total players"
                      value={totalActive}
                      icon={<Users className="h-5 w-5 text-sky-600" />}
                      description="All registered players"
                    />
                    <StatCard
                      label="Members"
                      value={totalMembers}
                      icon={<Sparkles className="h-5 w-5 text-amber-600" />}
                      description="Players with active membership"
                    />
                  </div>
                </header>

                <section className="sticky top-6 z-20 mt-8 overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm md:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <label className="sr-only" htmlFor="player-search">
                        Search players
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="player-search"
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Search by player name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_auto] lg:items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between gap-2')}>
                            <span>{selectedLevel === 'All' ? 'All levels' : selectedLevel}</span>
                            <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          <DropdownMenuLabel>Filter by level</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={selectedLevel}
                            onValueChange={(value) =>
                              setSelectedLevel(value as PlayerLevel | 'All')
                            }
                          >
                              <DropdownMenuRadioItem value="All">All levels</DropdownMenuRadioItem>
                            {LEVEL_OPTIONS.map((level) => (
                              <DropdownMenuRadioItem key={level} value={level}>
                                {level}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-1">
                        {(['All', 'Member', 'Non Member'] as const).map((option) => (
                          <Button
                            key={option}
                            variant={membershipFilter === option ? 'default' : 'outline'}
                            size="sm"
                            className="min-w-0 text-[0.8rem]"
                            onClick={() => setMembershipFilter(option)}
                          >
                            {option === 'All' ? 'All' : option === 'Member' ? 'Members' : 'Non members'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mt-8 space-y-3">
                  <div className="hidden grid-cols-[3fr_2fr_1fr_1fr_1fr] gap-4 rounded-3xl border border-border bg-card px-4 py-3 text-xs uppercase tracking-[0.24em] text-muted-foreground md:grid">
                    <span className="flex items-center gap-2">Player</span>
                    <span>Level</span>
                    <span className="text-right">Matches</span>
                    <span className="text-right">Win rate</span>
                    <span className="text-right">Actions</span>
                  </div>

                  <div className="space-y-4">
                    {filteredPlayers.length > 0 ? (
                      filteredPlayers.map((player) => (
                        <PlayerItem
                          key={player.id}
                          player={player}
                          onEdit={openEditModal}
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

            {isModalOpen ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
                <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">Add Player</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground">
                      Player name
                      <Input
                        value={newGuestName}
                        onChange={(event) => setNewGuestName(event.target.value)}
                        placeholder="Enter name"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-foreground">
                      Skill level
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}>
                            {newGuestLevel}
                            <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuRadioGroup
                            value={newGuestLevel}
                            onValueChange={(value) => setNewGuestLevel(value as PlayerLevel)}
                          >
                            {LEVEL_OPTIONS.map((level) => (
                              <DropdownMenuRadioItem key={level} value={level}>
                                {level}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </label>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addGuestPlayer} className="inline-flex items-center gap-2 shadow-sm">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {editingPlayer ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
                <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-black/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">Edit Player</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Update player information and skill level.
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={closeEditModal}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-foreground">
                      Player name
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter name"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-foreground">
                      Level
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}>
                            {editLevel}
                            <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuLabel>Select level</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            value={editLevel}
                            onValueChange={(value) => setEditLevel(value as PlayerLevel)}
                          >
                            {LEVEL_OPTIONS.map((level) => (
                              <DropdownMenuRadioItem key={level} value={level}>
                                {level}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </label>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm text-foreground">Membership</p>
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                      {(['Member', 'Non Member'] as const).map((option) => (
                        <Button
                          key={option}
                          variant={editMembership === option ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setEditMembership(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={closeEditModal}>
                      Cancel
                    </Button>
                    <Button onClick={saveEditPlayer} className="inline-flex items-center gap-2 shadow-sm">
                      Save changes
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  description: string
}

function StatCard({ label, value, icon, description }: StatCardProps) {
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

interface PlayerItemProps {
  player: Player
  onEdit: (player: Player) => void
}

function PlayerItem({ player, onEdit }: PlayerItemProps) {
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

function LevelBadge({ level }: { level: PlayerLevel }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] ${LEVEL_STYLES[level]}`}
    >
      {level === 'Unrated' ? 'Unranked' : level}
    </span>
  )
}
