import type { Metadata } from 'next';
import { TournamentList } from './_components/TournamentList';
import { AnnouncementPosters } from './_components/AnnouncementPosters';
import { getAnnouncementPosters } from '@/lib/contentful/announcements';

export const metadata: Metadata = {
  title: 'Tournaments',
  description:
    'Discover and join upcoming badminton tournaments. View announcements, standings, and registration details.'
};

export default async function TournamentsPage() {
  const posters = await getAnnouncementPosters();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <h1 className="text-lg font-semibold text-foreground">Tournaments</h1>
      <AnnouncementPosters posters={posters} />
      <TournamentList />
    </div>
  );
}
