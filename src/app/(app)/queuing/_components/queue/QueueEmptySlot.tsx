'use client';

import { Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { useQueuing } from '../../_context/QueuingContext';

interface QueueEmptySlotProps {
  slotIndex: number;
  slotId: string;
}

export default function QueueEmptySlot({ slotIndex, slotId }: QueueEmptySlotProps) {
  const { availablePlayers, addToQueueSlot } = useQueuing();
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 h-full w-full">
      {availablePlayers.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Add player to this slot"
              className="flex items-center justify-center w-full h-full rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
              <Plus size={16} aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {availablePlayers.map(p => (
              <DropdownMenuItem key={p.id} onSelect={() => addToQueueSlot(slotId, slotIndex, p)}>
                {p.firstname} {p.lastname}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-dashed border-gray-300" />
      )}
    </div>
  );
}
