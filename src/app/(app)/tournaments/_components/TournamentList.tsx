'use client';

import Link from 'next/link';
import { Plus, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTournaments } from '@/hooks/useTournaments';
import { useClubs } from '@/hooks/useClubs';
import { TournamentCard } from './TournamentCard';
import { CreateTournamentModal } from './modal/CreateTournamentModal';
import { type Tournament } from '@/lib/api/tournaments';

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Trophy className="size-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">No tournaments yet</h3>
        <p className="text-sm text-muted-foreground">
          {isAdmin ? 'Create the first tournament for your club.' : 'Check back later for upcoming tournaments.'}
        </p>
      </div>
      {isAdmin && (
        <CreateTournamentModal>
          <Button>
            <Plus data-icon="inline-start" />
            New Tournament
          </Button>
        </CreateTournamentModal>
      )}
    </div>
  );
}

function TournamentGrid({ tournaments, loading }: { tournaments: Tournament[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-border bg-background p-0 overflow-hidden">
            <Skeleton className="aspect-[2/3] w-full rounded-none" />
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tournaments.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">No tournaments found</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tournaments.map(t => (
        <TournamentCard key={t.id} tournament={t} />
      ))}
    </div>
  );
}

export function TournamentList() {
  const { data: tournaments = [], isFetching } = useTournaments();
  const { data: clubs = [] } = useClubs();
  const isAdmin = clubs.some(c => c.role === 'admin');

  const upcoming = tournaments.filter(t => t.status === 'open' || t.status === 'full');
  const ongoing = tournaments.filter(t => t.status === 'ongoing');
  const past = tournaments.filter(t => t.status === 'closed');

  if (tournaments.length === 0 && !isFetching) {
    return (
      <Card className="shadow-xl">
        <EmptyState isAdmin={isAdmin} />
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <Tabs defaultValue="upcoming">
        <CardHeader>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming
                {upcoming.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5">
                    {upcoming.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ongoing">
                Ongoing
                {ongoing.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5">
                    {ongoing.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <CreateTournamentModal>
                  <Button>
                    <Plus data-icon="inline-start" />
                    New Tournament
                  </Button>
                </CreateTournamentModal>
                <Button asChild variant="outline">
                  <Link href="/mini-tournament">
                    <Plus data-icon="inline-start" />
                    Start Mini Tournament
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="upcoming">
            <TournamentGrid tournaments={upcoming} loading={isFetching} />
          </TabsContent>
          <TabsContent value="ongoing">
            <TournamentGrid tournaments={ongoing} loading={isFetching} />
          </TabsContent>
          <TabsContent value="past">
            <TournamentGrid tournaments={past} loading={isFetching} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
