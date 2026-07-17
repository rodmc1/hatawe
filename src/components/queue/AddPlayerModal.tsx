'use client'

import { useState } from 'react'
import { Clock, Search, UserPlus, Users, X } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createGuestPlayer } from '@/lib/queue/actions'
import { useQueue } from './QueueProvider'
import type { QueuePlayer } from '@/lib/queue/types'

interface AddPlayerModalProps {
  open: boolean
  onClose: () => void
  members: QueuePlayer[]
  recentGuests: QueuePlayer[]
  /** IDs of all players already tracked in this session */
  trackedIds: Set<string>
}

export function AddPlayerModal({
  open,
  onClose,
  members,
  recentGuests,
  trackedIds,
}: AddPlayerModalProps) {
  const { addToAvailable } = useQueue()

  const [tab, setTab] = useState<'member' | 'guest'>('member')
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [guestName, setGuestName] = useState('')
  const [guestLevel, setGuestLevel] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Recent guests state — grows when a new guest is created this session
  const [localGuests, setLocalGuests] = useState<QueuePlayer[]>(recentGuests)

  if (!open) return null

  // ── Member tab ──────────────────────────────────────────────────────

  const filteredMembers = members.filter(
    (m) =>
      !trackedIds.has(m.id) &&
      m.full_name.toLowerCase().includes(memberSearch.toLowerCase()),
  )

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleAddMembers() {
    const toAdd = members.filter((m) => selectedIds.has(m.id))
    addToAvailable(toAdd)
    setSelectedIds(new Set())
    onClose()
  }

  // ── Guest tab ───────────────────────────────────────────────────────

  function handleAddRecentGuest(guest: QueuePlayer) {
    if (trackedIds.has(guest.id)) return
    addToAvailable([guest])
    onClose()
  }

  async function handleCreateGuest() {
    const name = guestName.trim()
    if (!name) return
    setIsSaving(true)
    try {
      const newGuest = await createGuestPlayer({
        full_name: name,
        skill_level: guestLevel.trim() || null,
      })
      setLocalGuests((prev) => [newGuest, ...prev])
      addToAvailable([newGuest])
      setGuestName('')
      setGuestLevel('')
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  function initials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col rounded-3xl border border-border bg-card shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold">Add Player</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab toggle */}
        <div className="mx-6 mb-4 grid grid-cols-2 gap-1.5 rounded-xl bg-muted p-1">
          <Button
            size="sm"
            variant={tab === 'member' ? 'default' : 'ghost'}
            className="gap-1.5"
            onClick={() => setTab('member')}
          >
            <Users className="h-3.5 w-3.5" />
            Member
          </Button>
          <Button
            size="sm"
            variant={tab === 'guest' ? 'default' : 'ghost'}
            className="gap-1.5"
            onClick={() => setTab('guest')}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Guest
          </Button>
        </div>

        {/* ── Member tab ─────────────────────────────────────────── */}
        {tab === 'member' ? (
          <div className="flex flex-col gap-3 px-6 pb-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members…"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {filteredMembers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {members.length === 0
                    ? 'No members registered.'
                    : 'All members already in session.'}
                </p>
              ) : (
                filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
                      selectedIds.has(m.id)
                        ? 'border-sky-400 bg-sky-50/60'
                        : 'hover:bg-muted/50',
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={m.full_name}
                          className="rounded-full"
                        />
                      ) : (
                        <AvatarFallback className="text-xs">
                          {initials(m.full_name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="flex-1 text-sm font-medium">{m.full_name}</span>
                    {selectedIds.has(m.id) && (
                      <span className="text-sky-500 text-sm">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {selectedIds.size > 0 && (
              <div className="flex justify-end">
                <Button onClick={handleAddMembers}>
                  Add {selectedIds.size} player
                  {selectedIds.size !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* ── Guest tab ──────────────────────────────────────────── */
          <div className="flex flex-col gap-5 px-6 pb-6">
            {/* Recent guests */}
            {localGuests.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Recent Guests
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {localGuests.map((guest) => {
                    const added = trackedIds.has(guest.id)
                    return (
                      <button
                        key={guest.id}
                        disabled={added}
                        onClick={() => handleAddRecentGuest(guest)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors',
                          added
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-muted/50',
                        )}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            {initials(guest.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-sm font-medium">
                          {guest.full_name}
                        </span>
                        {added && (
                          <span className="text-xs text-muted-foreground">
                            In session
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* New guest form */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                New Guest
              </h3>
              <div className="space-y-2">
                <Input
                  placeholder="Full name *"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateGuest()}
                />
                <Input
                  placeholder="Skill level (optional)"
                  value={guestLevel}
                  onChange={(e) => setGuestLevel(e.target.value)}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={handleCreateGuest}
                  disabled={isSaving || !guestName.trim()}
                >
                  {isSaving ? 'Adding…' : 'Add Guest'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
