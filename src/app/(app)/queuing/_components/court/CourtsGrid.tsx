'use client';

import { useState, useRef } from 'react';
import { Minus, Plus, Pencil, Play } from 'lucide-react';
import { useQueuing, type PhysicalCourt } from '../../_context/QueuingContext';
import Court from './Court';
import PlayingCourtCard from './PlayingCourtCard';

function IdleCourtCard({ court }: { court: PhysicalCourt }) {
  const { renamePhysicalCourt, startCourt } = useQueuing();
  const hasPlayers = court.players.some(Boolean);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(court.name);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setDraft(court.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const trimmed = draft.trim();
    renamePhysicalCourt(court.id, trimmed || court.name);
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') {
                  setDraft(court.name);
                  setEditing(false);
                }
              }}
              className="text-xs font-medium text-gray-500 text-center bg-white border border-gray-300 rounded px-1.5 py-0.5 w-28 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="flex items-center gap-1 group text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
              {court.name}
              <Pencil size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" aria-hidden="true" />
            </button>
          )}
        </div>
        {hasPlayers && (
          <button
            type="button"
            onClick={() => startCourt(court.id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
            <Play size={12} />
            Play
          </button>
        )}
      </div>
      <div className="relative w-full rounded overflow-hidden opacity-50" style={{ aspectRatio: '600 / 350' }}>
        <Court court={court} />
      </div>
    </div>
  );
}

export default function CourtsGrid() {
  const { physicalCourts, setCourtCount } = useQueuing();
  const count = physicalCourts.length;
  const playingCount = physicalCourts.filter(c => c.status === 'playing').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between px-1 pb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Courts</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {playingCount} of {count} court{count !== 1 ? 's' : ''} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Courts:</span>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setCourtCount(count - 1)}
              disabled={count <= 1}
              aria-label="Remove court"
              className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-medium text-gray-700">{count}</span>
            <button
              type="button"
              onClick={() => setCourtCount(count + 1)}
              aria-label="Add court"
              className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition-colors">
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {physicalCourts.map(court =>
          court.status === 'playing' ? (
            <PlayingCourtCard key={court.id} court={court} />
          ) : (
            <IdleCourtCard key={court.id} court={court} />
          )
        )}
      </div>
    </div>
  );
}
