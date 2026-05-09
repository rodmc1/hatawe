import type { Metadata } from 'next';
import MiniTournamentPage from './_components/page';

export const metadata: Metadata = {
  title: 'Mini Tournament',
  description: 'Set up a quick doubles tournament with randomized partners.'
};

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <MiniTournamentPage />
    </div>
  );
}
