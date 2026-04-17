'use client';

import { useQueuing } from '../../_context/QueuingContext';
import QueueCourtCard from './QueueCourtCard';

export default function QueueList() {
  const { queueSlots } = useQueuing();
  const activePlayers = queueSlots.flatMap(s => s.players).filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Queue</h2>
        {activePlayers.length > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">
            {activePlayers.length} player{activePlayers.length !== 1 ? 's' : ''} waiting
          </p>
        )}
      </div>
      {activePlayers.length === 0 ? (
        <div className="px-5 py-12 flex items-center justify-center text-sm text-gray-400">
          No players in the queue yet.
        </div>
      ) : (
        <div className="p-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {queueSlots.map((slot, index) => (
            <QueueCourtCard key={slot.id} slot={slot} queueNumber={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
