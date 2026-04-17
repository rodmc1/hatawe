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

function EmptySlot({ slotIndex, courtId }: { slotIndex: number; courtId: string }) {
  const { availablePlayers, queueSlots, playingCourts, addToCourtSlot } = useQueuing();

  const queuedPlayers = queueSlots.flatMap(s => s.players).filter((p): p is QueuePlayer => p !== null);
  const playingPlayers = playingCourts.flatMap(c => c.players).filter((p): p is QueuePlayer => p !== null);
  const hasCandidates = availablePlayers.length > 0 || queuedPlayers.length > 0 || playingPlayers.length > 0;

  if (!hasCandidates) {
    return <div className="w-7 h-7 rounded-full border-2 border-dashed border-white/50" />;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-7 h-7 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center text-white/70 hover:border-white hover:text-white transition-colors cursor-pointer focus:outline-none">
          <Plus size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {availablePlayers.length > 0 && (
          <>
            <DropdownMenuLabel>Available</DropdownMenuLabel>
            {availablePlayers.map(p => (
              <DropdownMenuItem key={p.id} onSelect={() => addToCourtSlot(courtId, slotIndex, p)}>
                {p.firstname} {p.lastname}
              </DropdownMenuItem>
            ))}
          </>
        )}
        {queuedPlayers.length > 0 && (
          <>
            {availablePlayers.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>In Queue</DropdownMenuLabel>
            {queuedPlayers.map(p => (
              <DropdownMenuItem key={p.id} onSelect={() => addToCourtSlot(courtId, slotIndex, p)}>
                {p.firstname} {p.lastname}
              </DropdownMenuItem>
            ))}
          </>
        )}
        {playingPlayers.length > 0 && (
          <>
            {(availablePlayers.length > 0 || queuedPlayers.length > 0) && <DropdownMenuSeparator />}
            <DropdownMenuLabel>Playing</DropdownMenuLabel>
            {playingPlayers.map(p => (
              <DropdownMenuItem key={p.id} onSelect={() => addToCourtSlot(courtId, slotIndex, p)}>
                {p.firstname} {p.lastname}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PlayerSlot({ player, slotIndex, courtId }: { player: QueuePlayer; slotIndex: number; courtId: string }) {
  const { availablePlayers, queueSlots, playingCourts, removeFromCourt, swapInCourt } = useQueuing();

  const queuedPlayers = queueSlots
    .flatMap(s => s.players)
    .filter((p): p is QueuePlayer => p !== null && p.id !== player.id);
  const playingCandidates = playingCourts
    .flatMap(c => c.players)
    .filter((p): p is QueuePlayer => p !== null && p.id !== player.id);

  const hasSwapCandidates = availablePlayers.length > 0 || queuedPlayers.length > 0 || playingCandidates.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer focus:outline-none">
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
              {availablePlayers.length > 0 && (
                <>
                  <DropdownMenuLabel>Available</DropdownMenuLabel>
                  {availablePlayers.map(p => (
                    <DropdownMenuItem key={p.id} onSelect={() => swapInCourt(courtId, slotIndex, p)}>
                      {p.firstname} {p.lastname}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {queuedPlayers.length > 0 && (
                <>
                  {availablePlayers.length > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel>In Queue</DropdownMenuLabel>
                  {queuedPlayers.map(p => (
                    <DropdownMenuItem key={p.id} onSelect={() => swapInCourt(courtId, slotIndex, p)}>
                      {p.firstname} {p.lastname}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {playingCandidates.length > 0 && (
                <>
                  {(availablePlayers.length > 0 || queuedPlayers.length > 0) && <DropdownMenuSeparator />}
                  <DropdownMenuLabel>Playing</DropdownMenuLabel>
                  {playingCandidates.map(p => (
                    <DropdownMenuItem key={p.id} onSelect={() => swapInCourt(courtId, slotIndex, p)}>
                      {p.firstname} {p.lastname}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <>
          {hasSwapCandidates && <DropdownMenuSeparator />}
          <DropdownMenuItem variant="destructive" onSelect={() => removeFromCourt(courtId, slotIndex)}>
            <Trash2 size={14} />
            Remove
          </DropdownMenuItem>
        </>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Court({ court }: { court: PhysicalCourt }) {
  const [p1, p2, p3, p4] = court.players;

  return (
    <div className="relative w-full rounded overflow-hidden" style={{ aspectRatio: '600 / 350' }}>
      <Image
        src="/assets/badminton_court.png"
        alt="Badminton court"
        fill
        sizes="(max-width: 640px) 100vw, 33vw"
        className="object-cover"
      />

      {/* Left side */}
      <div className="absolute" style={{ left: '23%', top: '35%', transform: 'translate(-50%, -50%)' }}>
        {p1 ? (
          <PlayerSlot player={p1} slotIndex={0} courtId={court.id} />
        ) : (
          <EmptySlot slotIndex={0} courtId={court.id} />
        )}
      </div>
      <div className="absolute" style={{ left: '23%', top: '65%', transform: 'translate(-50%, -50%)' }}>
        {p2 ? (
          <PlayerSlot player={p2} slotIndex={1} courtId={court.id} />
        ) : (
          <EmptySlot slotIndex={1} courtId={court.id} />
        )}
      </div>

      {/* Right side */}
      <div className="absolute" style={{ left: '77%', top: '35%', transform: 'translate(-50%, -50%)' }}>
        {p3 ? (
          <PlayerSlot player={p3} slotIndex={2} courtId={court.id} />
        ) : (
          <EmptySlot slotIndex={2} courtId={court.id} />
        )}
      </div>
      <div className="absolute" style={{ left: '77%', top: '65%', transform: 'translate(-50%, -50%)' }}>
        {p4 ? (
          <PlayerSlot player={p4} slotIndex={3} courtId={court.id} />
        ) : (
          <EmptySlot slotIndex={3} courtId={court.id} />
        )}
      </div>
    </div>
  );
}
