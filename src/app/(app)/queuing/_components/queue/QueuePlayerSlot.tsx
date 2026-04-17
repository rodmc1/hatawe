'use client';

import { MoreHorizontal, RefreshCw, Trash2 } from 'lucide-react';
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
import { useQueuing } from '../../_context/QueuingContext';

interface QueuePlayerSlotProps {
  player: QueuePlayer;
  slotIndex: number;
  slotId: string;
}

export default function QueuePlayerSlot({ player, slotIndex, slotId }: QueuePlayerSlotProps) {
  const { availablePlayers, queueSlots, playingCourts, removeFromQueue, swapInQueue, gamesPlayed, wins, losses } =
    useQueuing();

  const queueCandidates = queueSlots
    .flatMap(s => s.players)
    .filter((p): p is QueuePlayer => p !== null && p.id !== player.id);
  const playingCandidates = playingCourts
    .flatMap(c => c.players)
    .filter((p): p is QueuePlayer => p !== null && p.id !== player.id);

  const hasSwapCandidates = availablePlayers.length > 0 || queueCandidates.length > 0 || playingCandidates.length > 0;

  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-lg border border-gray-100 bg-gray-50 h-full">
      <PlayerCard
        firstname={player.firstname}
        lastname={player.lastname}
        level={player.level}
        gamesPlayed={gamesPlayed[player.id] ?? 0}
        wins={wins[player.id] ?? 0}
        losses={losses[player.id] ?? 0}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Options for ${player.firstname} ${player.lastname}`}
            className="ml-auto shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <MoreHorizontal size={14} aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
                      <DropdownMenuItem key={p.id} onSelect={() => swapInQueue(slotId, slotIndex, p)}>
                        {p.firstname} {p.lastname}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {queueCandidates.length > 0 && (
                  <>
                    {availablePlayers.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>In Queue</DropdownMenuLabel>
                    {queueCandidates.map(p => (
                      <DropdownMenuItem key={p.id} onSelect={() => swapInQueue(slotId, slotIndex, p)}>
                        {p.firstname} {p.lastname}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {playingCandidates.length > 0 && (
                  <>
                    {(availablePlayers.length > 0 || queueCandidates.length > 0) && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>Playing</DropdownMenuLabel>
                    {playingCandidates.map(p => (
                      <DropdownMenuItem key={p.id} onSelect={() => swapInQueue(slotId, slotIndex, p)}>
                        {p.firstname} {p.lastname}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          {hasSwapCandidates && <DropdownMenuSeparator />}
          <DropdownMenuItem variant="destructive" onSelect={() => removeFromQueue(slotId, slotIndex)}>
            <Trash2 size={14} />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
