'use client';

import { Plus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { useClubs } from '@/hooks/useClubs';
import { ClubCard } from './ClubCard';
import { CreateClubModal } from './modal/CreateClubModal';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Users className="size-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-foreground">No clubs yet</h3>
        <p className="text-sm text-muted-foreground">Create or join a club to start playing</p>
      </div>
      <CreateClubModal>
        <Button>
          <Plus data-icon="inline-start" />
          Create Club
        </Button>
      </CreateClubModal>
    </div>
  );
}

function ClubGrid({ clubs, isFetching }: { clubs: ReturnType<typeof useClubs>['data']; isFetching: boolean }) {
  const list = clubs ?? [];

  if (list.length === 0 && !isFetching) {
    return <p className="py-12 text-center text-sm text-muted-foreground">No clubs found</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {isFetching
        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        : list.map(club => <ClubCard key={club.id} club={club} />)}
    </div>
  );
}

export function ClubList() {
  const { data: clubs = [], isFetching } = useClubs();
  const myClubs = clubs.filter(club => club.role === 'admin' || club.role === 'member');

  if (clubs.length === 0 && !isFetching) {
    return (
      <Card className="shadow-xl">
        <EmptyState />
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <Tabs defaultValue="all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-1.5">
                  {clubs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="my-clubs">
                My Clubs
                <Badge variant="secondary" className="ml-1.5">
                  {myClubs.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <CreateClubModal>
              <Button>
                <Plus data-icon="inline-start" />
                New Club
              </Button>
            </CreateClubModal>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value="all">
            <ClubGrid clubs={clubs} isFetching={isFetching} />
          </TabsContent>
          <TabsContent value="my-clubs">
            <ClubGrid clubs={myClubs} isFetching={isFetching} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
