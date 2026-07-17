'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queue/query-client'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { QueueProvider, type SessionData } from './QueueProvider'
import { AvailablePlayers } from './AvailablePlayers'
import { QueuedGroups } from './QueuedGroups'
import { OngoingCourts } from './OngoingCourts'
import type { QueuePlayer } from '@/lib/queue/types'

interface QueueClientProps {
  session: SessionData
  members: QueuePlayer[]
  recentGuests: QueuePlayer[]
}

export function QueueClient({ session, members, recentGuests }: QueueClientProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
              <div className="min-h-screen bg-background px-4 py-6 sm:px-6">
                <QueueProvider session={session}>
                  <header className="mb-6">
                    <h1 className="uppercase text-3xl font-semibold tracking-[0.1em] text-sky-600">
                      {session.name}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {session.venue}&ensp;·&ensp;
                      {session.court_count} court{session.court_count !== 1 ? 's' : ''}
                    </p>
                  </header>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <AvailablePlayers members={members} recentGuests={recentGuests} />
                    <QueuedGroups />
                    <OngoingCourts />
                  </div>
                </QueueProvider>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </QueryClientProvider>
  )
}
