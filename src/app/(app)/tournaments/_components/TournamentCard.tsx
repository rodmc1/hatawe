import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type Tournament, type TournamentStatus } from '@/lib/api/tournaments';

function getInitials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusConfig: Record<
  TournamentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  open: { label: 'Open', variant: 'default' },
  full: { label: 'Full', variant: 'destructive' },
  ongoing: { label: 'Ongoing', variant: 'secondary' },
  closed: { label: 'Closed', variant: 'outline' }
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const { label, variant } = statusConfig[tournament.status];
  const spotsLeft = tournament.max_participants - tournament.registered_count;

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-primary/20 hover:shadow-sm">
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {tournament.poster_url ? (
          <Image
            src={tournament.poster_url}
            alt={tournament.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl font-bold text-muted-foreground/40">{getInitials(tournament.name)}</span>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute right-2 top-2">
          <Badge variant={variant}>{label}</Badge>
        </div>
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Club name on poster */}
        <p className="absolute bottom-2 left-3 text-xs font-medium text-white/80">{tournament.club_name}</p>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {tournament.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="size-3 shrink-0" />
          <span>{formatDate(tournament.tournament_date)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3 shrink-0" />
          <span>
            {tournament.registered_count}/{tournament.max_participants} registered
            {tournament.status === 'open' && spotsLeft > 0 && (
              <span className="ml-1 text-primary">
                · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
              </span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
