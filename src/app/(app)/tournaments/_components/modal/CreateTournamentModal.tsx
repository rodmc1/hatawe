'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { DatePicker } from '@/components/common/DatePicker';
import { useCreateTournament } from '@/hooks/useTournaments';
import { useClubs } from '@/hooks/useClubs';

const createTournamentSchema = z.object({
  name: z
    .string()
    .min(3, 'Tournament name must be at least 3 characters')
    .max(80, 'Tournament name must be less than 80 characters'),
  club_id: z.string().min(1, 'Please select a club'),
  tournament_date: z.string().min(1, 'Tournament date is required'),
  max_participants: z.coerce
    .number({ message: 'Must be a number' })
    .int()
    .min(2, 'At least 2 participants required')
    .max(512, 'Max 512 participants'),
  poster: z.instanceof(File).optional()
});

type FormInput = z.input<typeof createTournamentSchema>;
type FormValues = z.output<typeof createTournamentSchema>;

interface PosterFieldProps {
  value: File | undefined;
  onChange: (file: File | undefined) => void;
}

function PosterField({ value, onChange }: PosterFieldProps) {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [value]);

  return (
    <Field>
      <FieldLabel htmlFor="create-tournament-poster">Poster Image</FieldLabel>
      {preview && (
        <div className="mx-auto aspect-[2/3] w-32 overflow-hidden rounded-xl border bg-muted">
          <img src={preview} alt="Poster preview" className="size-full object-cover" />
        </div>
      )}
      <div className="relative">
        <Input
          id="create-tournament-poster"
          type="file"
          accept="image/*"
          className={preview ? 'pr-9' : ''}
          onChange={e => {
            const file = e.target.files?.[0];
            onChange(file);
          }}
        />
        {preview && (
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              const input = document.getElementById('create-tournament-poster') as HTMLInputElement;
              if (input) input.value = '';
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        )}
      </div>
    </Field>
  );
}

export function CreateTournamentModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const createTournament = useCreateTournament();
  const { data: clubs = [] } = useClubs();
  const adminClubs = clubs.filter(c => c.role === 'admin');

  const form = useForm<FormInput, any, FormValues>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      name: '',
      club_id: '',
      tournament_date: '',
      max_participants: 32
    }
  });

  const onSubmit = (data: FormValues) => {
    createTournament.mutate(data, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Tournament</DialogTitle>
          <DialogDescription>Set up a new tournament for your club.</DialogDescription>
        </DialogHeader>
        <form id="create-tournament-form" className="overflow-y-auto px-1 py-1" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-tournament-name">Tournament Name</FieldLabel>
                  <Input
                    {...field}
                    id="create-tournament-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Summer Smash 2026"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Club */}
            <Controller
              name="club_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Club</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select a club" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {adminClubs.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Tournament Date */}
            <Controller
              name="tournament_date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tournament Date</FieldLabel>
                  <DatePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={date => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    placeholder="Pick a date"
                    className="w-full"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Max participants */}
            <Controller
              name="max_participants"
              control={form.control}
              render={({ field: { value, ...field }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-tournament-max">Max Participants</FieldLabel>
                  <Input
                    {...field}
                    value={value as number}
                    id="create-tournament-max"
                    type="number"
                    min={2}
                    max={512}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Poster */}
            <Controller
              name="poster"
              control={form.control}
              render={({ field: { onChange, value } }) => <PosterField value={value} onChange={onChange} />}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="create-tournament-form" disabled={createTournament.isPending}>
            {createTournament.isPending ? 'Creating...' : 'Create Tournament'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
