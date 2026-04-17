'use client';

import { Fragment } from 'react';
import { Play } from 'lucide-react';
import QueuePlayerSlot from './QueuePlayerSlot';
import QueueEmptySlot from './QueueEmptySlot';
import { type QueueSlot, useQueuing } from '../../_context/QueuingContext';

interface QueueCourtCardProps {
  slot: QueueSlot;
  queueNumber: number;
}

const ROWS = [
  { team1: 0, team2: 2 },
  { team1: 1, team2: 3 }
] as const;

export default function QueueCourtCard({ slot, queueNumber }: QueueCourtCardProps) {
  const { playQueue, physicalCourts } = useQueuing();
  const hasIdleCourt = physicalCourts.some(c => c.status === 'idle');

  function renderSlot(offset: number) {
    const player = slot.players[offset];
    return player ? (
      <QueuePlayerSlot key={player.id} player={player} slotIndex={offset} slotId={slot.id} />
    ) : (
      <QueueEmptySlot key={`empty-${offset}`} slotIndex={offset} slotId={slot.id} />
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-xs font-semibold text-gray-700">Queue {queueNumber}</span>
        <button
          type="button"
          onClick={() => playQueue(slot.id)}
          disabled={!hasIdleCourt}
          aria-label={`Start play for Queue ${queueNumber}`}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <Play size={12} aria-hidden="true" />
          Play
        </button>
      </div>
      <div className="p-3 grid grid-cols-2 gap-x-2">
        <span className="text-xs font-semibold text-gray-400 text-center mb-1">Team 1</span>
        <span className="text-xs font-semibold text-gray-400 text-center mb-1">Team 2</span>
        {ROWS.map(({ team1, team2 }) => (
          <Fragment key={`row-${team1}`}>
            <div className="mb-2 h-[72px]">{renderSlot(team1)}</div>
            <div className="mb-2 h-[72px]">{renderSlot(team2)}</div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
