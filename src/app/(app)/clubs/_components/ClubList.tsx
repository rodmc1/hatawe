'use client';

import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function ClubList() {
  const { data: clubs = [] } = useClubs();

  if (clubs.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-muted-foreground">
            {clubs.length} club{clubs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateClubModal>
          <Button>
            <Plus data-icon="inline-start" />
            New Club
          </Button>
        </CreateClubModal>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map(club => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </>
  );
}
