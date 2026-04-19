'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, ChevronsUpDown } from 'lucide-react';

export interface MultipleSelectOption {
  value: string;
  label: string;
}

interface MultipleSelectProps {
  options: MultipleSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export function MultipleSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  emptyMessage = 'No options available'
}: MultipleSelectProps) {
  const selectedOptions = options.filter(o => value.includes(o.value));

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue) ? value.filter(v => v !== optionValue) : [...value, optionValue]
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" type="button" className="w-full justify-between font-normal">
            {selectedOptions.length > 0
              ? `${selectedOptions.length} selected`
              : placeholder}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="max-h-60 overflow-y-auto p-1">
            {options.length === 0 ? (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">{emptyMessage}</div>
            ) : (
              options.map(option => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent">
                  <Checkbox
                    checked={value.includes(option.value)}
                    onCheckedChange={() => toggle(option.value)}
                    className="data-checked:border-border data-checked:bg-muted data-checked:text-foreground"
                  />
                  {option.label}
                </label>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map(option => (
            <Badge key={option.value} variant="secondary" className="gap-1">
              {option.label}
              <button
                type="button"
                onClick={() => onChange(value.filter(v => v !== option.value))}
                className="rounded-full hover:bg-muted-foreground/20">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
