import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Queuing',
  description:
    'Manage court queuing — assign players to courts, track active games, and manage the waiting list in real time.'
};

export default function QueuingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
