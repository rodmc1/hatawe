'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Layers, MapPin, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getSessions, createSession, type SessionRow } from './actions'
import { cn } from '@/lib/utils'

export default function QueueLandingPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [venue, setVenue] = useState('')
  const [courtCount, setCourtCount] = useState('4')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  async function handleCreate() {
    const count = parseInt(courtCount, 10)
    if (!name.trim() || !venue.trim() || isNaN(count) || count < 1) return

    setIsSaving(true)
    try {
      const session = await createSession({
        name: name.trim(),
        venue: venue.trim(),
        court_count: count,
      })
      router.push(`/queue/${session.id}`)
    } catch (err) {
      console.error(err)
      setIsSaving(false)
    }
  }

  function resetForm() {
    setName('')
    setVenue('')
    setCourtCount('4')
    setFormOpen(false)
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl">

                <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="uppercase text-4xl font-semibold tracking-[0.1em] text-sky-600">
                      Sessions
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start a new session or continue an existing one.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="inline-flex items-center gap-2 shadow-sm"
                    onClick={() => setFormOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    New Session
                  </Button>
                </header>

                {/* Sessions list */}
                <div className="mt-8 space-y-3">
                  {isLoading ? (
                    <div className="rounded-3xl border border-border bg-card px-6 py-10 text-center text-muted-foreground">
                      Loading sessions…
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center text-muted-foreground">
                      No sessions yet. Create one to get started.
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => router.push(`/queue/${session.id}`)}
                        className="w-full rounded-3xl border border-border bg-card p-5 text-left shadow-sm transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{session.name}</p>
                            <div className="mt-1.5 flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                {session.venue}
                              </span>
                              <span className="flex items-center gap-1">
                                <Layers className="h-3.5 w-3.5 shrink-0" />
                                {session.court_count} court{session.court_count !== 1 ? 's' : ''}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                {new Date(session.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                              session.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-600',
                            )}
                          >
                            {session.status}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* New Session modal */}
            {formOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">New Session</h2>
                    <Button variant="ghost" size="icon" onClick={resetForm}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="space-y-1.5">
                      <p className="text-sm text-foreground">Session name</p>
                      <Input
                        placeholder="Wednesday Night Badminton"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-foreground">Venue</p>
                      <Input
                        placeholder="Sports Hall A"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-foreground">Number of courts</p>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={courtCount}
                        onChange={(e) => setCourtCount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={resetForm} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={isSaving || !name.trim() || !venue.trim()}
                    >
                      {isSaving ? 'Creating…' : 'Create & Open Queue'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
