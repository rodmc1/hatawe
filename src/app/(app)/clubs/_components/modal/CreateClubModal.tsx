'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateClub } from '@/hooks/useClubs';
import { useCourts } from '@/hooks/useCourts';
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
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';
import { MultipleSelect } from '@/components/common/MultipleSelect';
import { X } from 'lucide-react';

interface LogoFieldProps {
  value: File | undefined;
  onChange: (file: File | undefined) => void;
}

function LogoField({ value, onChange }: LogoFieldProps) {
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
      <FieldLabel htmlFor="create-club-logo">Club Logo</FieldLabel>
      {preview && (
        <div className="mx-auto aspect-square overflow-hidden rounded-xl border bg-muted">
          <img src={preview} alt="Logo preview" className="size-full object-cover" />
        </div>
      )}
      <div className="relative">
        <Input
          id="create-club-logo"
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
              const input = document.getElementById('create-club-logo') as HTMLInputElement;
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

const createClubSchema = z.object({
  name: z
    .string()
    .min(3, 'Club name must be at least 3 characters')
    .max(50, 'Club name must be less than 50 characters'),
  description: z.string().max(255, 'Description must be less than 255 characters').optional(),
  courtIds: z.array(z.string()).optional(),
  logo: z.instanceof(File).optional()
});

export function CreateClubModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const createClub = useCreateClub();
  const { data: courts = [] } = useCourts();

  const clubForm = useForm({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      name: '',
      description: '',
      courtIds: [] as string[]
    }
  });

  const onSubmit = (data: z.infer<typeof createClubSchema>) => {
    createClub.mutate(data, {
      onSuccess: () => {
        clubForm.reset();
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Club</DialogTitle>
          <DialogDescription>Create a new club to start organizing games and managing players.</DialogDescription>
        </DialogHeader>
        <form id="create-club-form" className="overflow-y-auto" onSubmit={clubForm.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={clubForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-club-name">Club Name</FieldLabel>
                  <Input
                    {...field}
                    id="create-club-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Batangas Smashers"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="logo"
              control={clubForm.control}
              render={({ field: { onChange, value } }) => <LogoField value={value} onChange={onChange} />}
            />
            <Controller
              name="description"
              control={clubForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-club-description">Description</FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="create-club-description"
                      placeholder="Tell us about your club..."
                      rows={4}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {(field.value ?? '').length}/255 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="courtIds"
              control={clubForm.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Courts</FieldLabel>
                  <MultipleSelect
                    options={courts.map(c => ({ value: c.id, label: c.name }))}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Select courts..."
                    emptyMessage="No courts available"
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="create-club-form" disabled={createClub.isPending}>
            {createClub.isPending ? 'Creating...' : 'Create Club'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
