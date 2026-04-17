'use client';

import { useState, useRef } from 'react';
import { Pencil, Trophy, Clock } from 'lucide-react';
import { useQueuing, type PhysicalCourt } from '../../_context/QueuingContext';
import { useTimer } from '../../_hooks/useTimer';
import Court from './Court';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

export default function PlayingCourtCard({ court }: { court: PhysicalCourt }) {
  const { renamePhysicalCourt, finishCourt } = useQueuing();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(court.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const elapsed = useTimer(court.startedAt);

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

  const isPresentPlayer = <T,>(player: T | null | undefined): player is T => player != null;
  const team1 = [court.players[0], court.players[1]].filter(isPresentPlayer);
  const team2 = [court.players[2], court.players[3]].filter(isPresentPlayer);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-1">
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
            className="flex items-center gap-1 group text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
            {court.name}
            <Pencil size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" aria-hidden="true" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-gray-400 tabular-nums">
            <Clock size={11} aria-hidden="true" />
            {elapsed}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors">
                <Trophy size={12} />
                Winner
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto">
              <DropdownMenuLabel className="pb-2">Select Winner</DropdownMenuLabel>
              <div className="flex gap-2 px-1 pb-1">
                <button
                  type="button"
                  onClick={() => finishCourt(court.id, 1)}
                  className="flex flex-col items-center gap-1 flex-1 rounded-lg border border-gray-200 px-3 py-2 hover:border-amber-400 hover:bg-amber-50 transition-colors text-left min-w-[80px]">
                  <span className="text-sm">🏆</span>
                  <span className="text-xs font-semibold text-gray-700">Team 1</span>
                  {team1.map(p => (
                    <span key={p.id} className="text-xs text-gray-400 whitespace-nowrap">
                      {p.firstname} {p.lastname}
                    </span>
                  ))}
                </button>
                <button
                  type="button"
                  onClick={() => finishCourt(court.id, 2)}
                  className="flex flex-col items-center gap-1 flex-1 rounded-lg border border-gray-200 px-3 py-2 hover:border-amber-400 hover:bg-amber-50 transition-colors text-left min-w-[80px]">
                  <span className="text-sm">🏆</span>
                  <span className="text-xs font-semibold text-gray-700">Team 2</span>
                  {team2.map(p => (
                    <span key={p.id} className="text-xs text-gray-400 whitespace-nowrap">
                      {p.firstname} {p.lastname}
                    </span>
                  ))}
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Court court={court} />
      <div className="relative w-full pt-1 min-h-[3.5rem]">
        <div
          className="absolute flex flex-col items-center gap-0.5"
          style={{ left: '23%', transform: 'translateX(-50%)' }}>
          <span className="text-xs font-semibold text-gray-500">Team 1</span>
        </div>
        <div
          className="absolute flex flex-col items-center gap-0.5"
          style={{ left: '77%', transform: 'translateX(-50%)' }}>
          <span className="text-xs font-semibold text-gray-500">Team 2</span>
        </div>
      </div>
    </div>
  );
}
