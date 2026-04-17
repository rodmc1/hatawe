'use client';

import Image from 'next/image';
import { Trash2, RefreshCw, Plus } from 'lucide-react';
import PlayerCard from '@/components/common/PlayerCard';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { type QueuePlayer } from '../../types';
import { type PhysicalCourt, useQueuing } from '../../_context/QueuingContext';

const SLOT_POSITIONS = [
  { left: '23%', top: '35%' },
  { left: '23%', top: '65%' },
  { left: '77%', top: '35%' },
  { left: '77%', top: '65%' }
] as const;

function PlayerGroupList({
  available,
  queued,
  playing,
  onSelect
}: {
  available: QueuePlayer[];
  queued: QueuePlayer[];
  playing: QueuePlayer[];
  onSelect: (player: QueuePlayer) => void;
}) {
  return (
    <>
      {available.length > 0 && (
        <>
          <DropdownMenuLabel>Available</DropdownMenuLabel>
          {available.map(p => (
            <DropdownMenuItem key={`available-${p.id}`} onSelect={() => onSelect(p)}>
              {p.firstname} {p.lastname}
            </DropdownMenuItem>
          ))}
        </>
      )}
      {queued.length > 0 && (
        <>
          {available.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuLabel>In Queue</DropdownMenuLabel>
          {queued.map(p => (
            <DropdownMenuItem key={`queued-${p.id}`} onSelect={() => onSelect(p)}>
              {p.firstname} {p.lastname}
            </DropdownMenuItem>
          ))}
        </>
      )}
      {playing.length > 0 && (
        <>
          {(available.length > 0 || queued.length > 0) && <DropdownMenuSeparator />}
          <DropdownMenuLabel>Playing</DropdownMenuLabel>
          {playing.map(p => (
            <DropdownMenuItem key={`playing-${p.id}`} onSelect={() => onSelect(p)}>
              {p.firstname} {p.lastname}
            </DropdownMenuItem>
          ))}
        </>
      )}
    </>
  );
}

function EmptySlot({ slotIndex, courtId }: { slotIndex: number; courtId: string }) {
  const { availablePlayers, queuedPlayers, playingPlayers, addToCourtSlot } = useQueuing();

  const hasCandidates = availablePlayers.length > 0 || queuedPlayers.length > 0 || playingPlayers.length > 0;

  if (!hasCandidates) {
    return <div className="w-7 h-7 rounded-full border-2 border-dashed border-white/50" />;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-7 h-7 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center text-white/70 hover:border-white hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
          <Plus size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <PlayerGroupList
          available={availablePlayers}
          queued={queuedPlayers}
          playing={playingPlayers}
          onSelect={p => addToCourtSlot(courtId, slotIndex, p)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PlayerSlot({ player, slotIndex, courtId }: { player: QueuePlayer; slotIndex: number; courtId: string }) {
  const { availablePlayers, queuedPlayers, playingPlayers, removeFromCourt, swapInCourt } = useQueuing();

  const queueCandidates = queuedPlayers.filter(p => p.id !== player.id);
  const playingCandidates = playingPlayers.filter(p => p.id !== player.id);

  const hasSwapCandidates = availablePlayers.length > 0 || queueCandidates.length > 0 || playingCandidates.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
          <PlayerCard firstname={player.firstname} lastname={player.lastname} compact />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {hasSwapCandidates && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <RefreshCw size={14} />
              Swap
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <PlayerGroupList
                available={availablePlayers}
                queued={queueCandidates}
                playing={playingCandidates}
                onSelect={p => swapInCourt(courtId, slotIndex, p)}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        {hasSwapCandidates && <DropdownMenuSeparator />}
        <DropdownMenuItem variant="destructive" onSelect={() => removeFromCourt(courtId, slotIndex)}>
          <Trash2 size={14} />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Court({ court }: { court: PhysicalCourt }) {
  return (
    <div className="relative w-full rounded overflow-hidden" style={{ aspectRatio: '600 / 350' }}>
      <Image
        src="/assets/badminton_court.png"
        alt="Badminton court"
        fill
        sizes="(max-width: 640px) 100vw, 33vw"
        className="object-cover"
      />
      {/* Item 7: positions driven by SLOT_POSITIONS constant */}
      {SLOT_POSITIONS.map(({ left, top }, index) => {
        const player = court.players[index];
        return (
          <div key={index} className="absolute" style={{ left, top, transform: 'translate(-50%, -50%)' }}>
            {player ? (
              <PlayerSlot player={player} slotIndex={index} courtId={court.id} />
            ) : (
              <EmptySlot slotIndex={index} courtId={court.id} />
            )}
          </div>
        );
      })}
    </div>
  );
}
