'use client';

import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { useClubs } from '@/hooks/useClubs';
import { type Club } from '@/lib/api/clubs';

const ROLE_VARIANT = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline'
} as const;

function getInitials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/20 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <Avatar size="lg">
          {club.logo ? <AvatarImage src={club.logo} alt={club.name} /> : null}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(club.name)}</AvatarFallback>
        </Avatar>
        <Badge variant={ROLE_VARIANT[club.role]} className="capitalize">
          {club.role}
        </Badge>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {club.name}
        </h3>
        <p className="text-xs text-muted-foreground">{club.memberCount} members</p>
      </div>
      <div className="flex items-center justify-between">
        <AvatarGroup>
          {club.members.slice(0, 3).map(member => (
            <Avatar key={member.id} size="sm">
              {member.avatar ? <AvatarImage src={member.avatar} alt={member.name} /> : null}
              <AvatarFallback className="text-[10px]">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
          ))}
          {club.memberCount > 3 && <AvatarGroupCount className="text-[10px]">+{club.memberCount - 3}</AvatarGroupCount>}
        </AvatarGroup>
      </div>
    </Link>
  );
}

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
      <Button>
        <Plus data-icon="inline-start" />
        Create Club
      </Button>
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
        <Button>
          <Plus data-icon="inline-start" />
          New Club
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map(club => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </>
  );
}
