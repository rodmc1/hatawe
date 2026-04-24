'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Users, Eye, X, ArrowRight } from 'lucide-react';
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

function PosterPreviewModal({ tournament, onClose }: { tournament: Tournament; onClose: () => void }) {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${tournament.name} poster`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}>
      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
        <X className="size-5" />
      </button>
      <div className="relative w-full h-full" onClick={e => e.stopPropagation()}>
        {tournament.poster_url ? (
          <Image
            src={tournament.poster_url}
            alt={tournament.name}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl font-black text-white/20">{tournament.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const [previewing, setPreviewing] = React.useState(false);
  const { label, variant } = statusConfig[tournament.status];
  const spotsLeft = tournament.max_participants - tournament.registered_count;

  return (
    <>
      {previewing && <PosterPreviewModal tournament={tournament} onClose={() => setPreviewing(false)} />}
      <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-primary/20 hover:shadow-sm">
        {/* Poster */}
        <button
          type="button"
          onClick={() => setPreviewing(true)}
          className="group/poster relative aspect-[2/3] w-full overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {tournament.poster_url ? (
            <Image
              src={tournament.poster_url}
              alt={tournament.name}
              fill
              className="object-cover transition-transform duration-300 group-hover/poster:scale-105"
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
          {/* Hover preview overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover/poster:bg-black/50 transition-colors duration-300 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300">
              <Eye className="size-6 text-white" />
              <span className="text-xs font-semibold text-white tracking-wide">Preview</span>
            </div>
          </div>
          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          {/* Club name on poster */}
          <p className="absolute bottom-2 left-3 text-xs font-medium text-white/80">{tournament.club_name}</p>
        </button>

        {/* Info */}
        <Link
          href={`/tournaments/${tournament.id}`}
          className="group/info flex flex-col gap-2 p-3 hover:bg-muted/50 transition-colors">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground leading-snug">{tournament.name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3 shrink-0" />
            <span>{formatDate(tournament.tournament_date)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3 shrink-0" />
            <span>
              {tournament.registered_count}/{tournament.max_participants}
              {tournament.status === 'open' && spotsLeft > 0 && (
                <span className="ml-1 text-primary font-medium">· {spotsLeft} left</span>
              )}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
            <span>{tournament.status === 'open' ? 'Register now' : 'View details'}</span>
            <ArrowRight className="size-3 transition-transform group-hover/info:translate-x-0.5" />
          </div>
        </Link>
      </div>
    </>
  );
}
