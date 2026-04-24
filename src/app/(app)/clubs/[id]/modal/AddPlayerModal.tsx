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
import { Input } from '@/components/ui/input';

const playerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address')
});

interface AddPlayerModalProps {
  children: React.ReactNode;
}

export default function AddPlayerModal({ children }: AddPlayerModalProps) {
  const [open, setOpen] = useState(false);
  const playerForm = useForm({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: '',
      email: ''
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Player</DialogTitle>
          <DialogDescription>Invite new players to join your club and participate in games.</DialogDescription>
        </DialogHeader>
        <form className="grid w-full gap-4 py-4" onSubmit={playerForm.handleSubmit(data => console.log(data))}>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
