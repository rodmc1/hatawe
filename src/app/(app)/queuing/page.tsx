'use client';

import AvailablePlayers from './_components/players/AvailablePlayers';
import CourtsGrid from './_components/court/CourtsGrid';
import QueueList from './_components/queue/QueueList';
import { QueuingProvider } from './_context/QueuingContext';
import { type QueuePlayer } from './types';

const MOCK_PLAYERS: QueuePlayer[] = [
  { id: 1, firstname: 'James', lastname: 'Santos', level: 'advanced' },
  { id: 2, firstname: 'Maria', lastname: 'Reyes', level: 'intermediate high' },
  { id: 3, firstname: 'Carlo', lastname: 'Dela Cruz', level: 'intermediate low' },
  { id: 4, firstname: 'Ana', lastname: 'Garcia', level: 'beginner' },
  { id: 5, firstname: 'Miguel', lastname: 'Torres', level: 'advanced' },
  { id: 6, firstname: 'Sofia', lastname: 'Lim', level: 'intermediate high' },
  { id: 7, firstname: 'Andrei', lastname: 'Cruz', level: 'intermediate low' },
  { id: 8, firstname: 'Bianca', lastname: 'Ramos', level: 'beginner' },
  { id: 9, firstname: 'Renz', lastname: 'Villanueva', level: 'unrated' },
  { id: 10, firstname: 'Trisha', lastname: 'Bautista', level: 'intermediate high' },
  { id: 11, firstname: 'Kevin', lastname: 'Tan', level: 'advanced' },
  { id: 12, firstname: 'Yvonne', lastname: 'Mendoza', level: 'intermediate low' },
  { id: 13, firstname: 'Paolo', lastname: 'Aquino', level: 'beginner' },
  { id: 14, firstname: 'Lea', lastname: 'Navarro', level: 'unrated' }
];

export default function QueuingPage() {
  return (
    <QueuingProvider allPlayers={MOCK_PLAYERS}>
      <div className="space-y-4 mx-4">
        <AvailablePlayers />
        <QueueList />
        <CourtsGrid />
      </div>
    </QueuingProvider>
  );
}
