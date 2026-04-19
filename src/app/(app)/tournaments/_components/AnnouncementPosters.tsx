'use client';

import * as React from 'react';
import Image from 'next/image';
import { Eye, X } from 'lucide-react';
import { type AnnouncementPoster } from '@/lib/contentful/announcements';

function PosterModal({ poster, onClose }: { poster: AnnouncementPoster; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
        <X className="size-5" />
      </button>
      <div className="relative w-full h-full" onClick={e => e.stopPropagation()}>
        <Image src={poster.imageUrl} alt={poster.title} fill className="object-contain" sizes="100vw" priority />
      </div>
    </div>
  );
}

export function AnnouncementPosters({ posters }: { posters: AnnouncementPoster[] }) {
  const [selected, setSelected] = React.useState<AnnouncementPoster | null>(null);

  if (posters.length === 0) return null;

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Announcements</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {posters.map(poster => (
            <button
              key={poster.id}
              type="button"
              onClick={() => setSelected(poster)}
              className="group flex flex-col gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted aspect-[2/3] w-full">
                <Image
                  src={poster.imageUrl}
                  alt={poster.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Eye className="size-6 text-white" />
                    <span className="text-xs font-semibold text-white tracking-wide">View</span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-semibold text-foreground line-clamp-2 text-left px-1">{poster.title}</p>
            </button>
          ))}
        </div>
      </section>

      {selected && <PosterModal poster={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
