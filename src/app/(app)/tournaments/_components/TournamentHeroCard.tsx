import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Users, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Tournament, type TournamentStatus } from '@/lib/api/tournaments';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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

export function TournamentHeroCard({ tournament }: { tournament: Tournament }) {
  const { label, variant } = statusConfig[tournament.status];
  const spotsLeft = tournament.max_participants - tournament.registered_count;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted">
      {/* Background poster */}
      <div className="relative h-64 w-full sm:h-80">
        {tournament.poster_url ? (
          <Image
            src={tournament.poster_url}
            alt={tournament.name}
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-muted">
            <span className="text-6xl font-black text-primary/20">{tournament.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {/* Full overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content over image */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={variant} className="w-fit">
                {label}
              </Badge>
              <span className="text-xs font-medium text-white/60">{tournament.club_name}</span>
            </div>
            <h2 className="text-xl font-bold text-white sm:text-2xl">{tournament.name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5 text-sm text-white/80">
                <CalendarDays className="size-4" />
                <span>{formatDate(tournament.tournament_date)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/80">
                <Users className="size-4" />
                <span>
                  {tournament.registered_count}/{tournament.max_participants} registered
                  {tournament.status === 'open' && spotsLeft > 0 && (
                    <span className="ml-1 text-primary-foreground/90 font-medium">
                      · {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild size="sm" variant="secondary">
              <Link href={`/tournaments/${tournament.id}`}>
                View Details
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
