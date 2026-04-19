import Image from 'next/image';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type Club } from '@/lib/api/clubs';

function getInitials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadge(role: Club['role']) {
  if (role === 'admin') return { label: 'Admin', variant: 'default' as const };
  if (role === 'member') return { label: 'Member', variant: 'secondary' as const };
  return { label: 'View Club', variant: 'outline' as const };
}

export function ClubCard({ club }: { club: Club }) {
  const { label, variant } = getRoleBadge(club.role);

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group relative flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background p-5 text-center transition-all hover:border-primary/20 hover:shadow-sm">
      <div className="relative size-72 shrink-0 overflow-hidden rounded-lg bg-muted">
        {club.logo ? (
          <Image src={club.logo} alt={club.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground/50">{getInitials(club.name)}</span>
          </div>
        )}
      </div>
      <div className="flex w-full flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {club.name}
          </h3>
          <Badge variant={variant} className="shrink-0">
            {label}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3" />
          <span>
            {club.memberCount} member{club.memberCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
