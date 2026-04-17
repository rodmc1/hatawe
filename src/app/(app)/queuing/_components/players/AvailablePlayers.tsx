'use client';

import { Plus } from 'lucide-react';
import PlayerCard from '@/components/common/PlayerCard';
import { useQueuing } from '../../_context/QueuingContext';

export default function AvailablePlayers() {
  const { availablePlayers, addToQueue, gamesPlayed, wins, losses } = useQueuing();
  const players = availablePlayers;
  const onAdd = addToQueue;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Available Players</h2>
        <p className="text-xs text-gray-400 mt-0.5">{players.length} players ready to play</p>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {players.map(player => (
          <button
            key={player.id}
            onClick={() => onAdd(player)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-colors text-left w-full group">
            <PlayerCard
              firstname={player.firstname}
              lastname={player.lastname}
              level={player.level}
              gamesPlayed={gamesPlayed[player.id] ?? 0}
              wins={wins[player.id] ?? 0}
              losses={losses[player.id] ?? 0}
            />
            <Plus size={16} className="ml-auto shrink-0 text-gray-400 group-hover:text-indigo-500" />
          </button>
        ))}
        {players.length === 0 && (
          <p className="col-span-full text-center text-sm text-gray-400 py-8">All players are in the queue.</p>
        )}
      </div>
    </div>
  );
}
