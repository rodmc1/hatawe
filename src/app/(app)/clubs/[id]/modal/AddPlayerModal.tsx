'use client';

import { FieldLabel } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useState } from 'react';
import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/common/DatePicker';
import { type PlayerLevel } from '@/lib/types/player';
import { useAddPlayer } from '@/hooks/usePlayers';

const PLAYER_LEVELS: PlayerLevel[] = ['unrated', 'beginner', 'intermediate low', 'intermediate high', 'advanced'];

const playerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  level: z.enum(['unrated', 'beginner', 'intermediate low', 'intermediate high', 'advanced']),
  membershipDate: z.date().optional()
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

interface AddPlayerModalProps {
  children: React.ReactNode;
}

export default function AddPlayerModal({ children }: AddPlayerModalProps) {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const clubId = params.id as string;

  const { mutate: addPlayer, isPending } = useAddPlayer(clubId, () => setOpen(false));

  const playerForm = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      level: 'unrated',
      membershipDate: undefined
    }
  });

  function onSubmit(values: PlayerFormValues) {
    addPlayer(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Player</DialogTitle>
          <DialogDescription>Invite new players to join your club and participate in games.</DialogDescription>
        </DialogHeader>
        <form className="grid w-full gap-4 py-4" onSubmit={playerForm.handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={playerForm.control}
            render={({ field, fieldState }) => (
              <div className="grid w-full items-center gap-1.5">
                <FieldLabel
                  htmlFor="player-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Name
                </FieldLabel>
                <Input
                  id="player-name"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
                {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
              </div>
            )}
          />
          <Controller
            name="email"
            control={playerForm.control}
            render={({ field, fieldState }) => (
              <div className="grid w-full items-center gap-1.5">
                <FieldLabel
                  htmlFor="player-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </FieldLabel>
                <Input
                  id="player-email"
                  type="email"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                />
                {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
              </div>
            )}
          />
          <Controller
            name="level"
            control={playerForm.control}
            render={({ field }) => (
              <div className="grid w-full items-center gap-1.5">
                <FieldLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Level
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAYER_LEVELS.map(level => (
                      <SelectItem key={level} value={level} className="capitalize">
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
          <Controller
            name="membershipDate"
            control={playerForm.control}
            render={({ field }) => (
              <div className="grid w-full items-center gap-1.5">
                <FieldLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Membership Date
                </FieldLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pick a date"
                  className="w-full"
                />
              </div>
            )}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Player'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
