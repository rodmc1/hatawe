'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { type PlayerLevel, LEVEL_OPTIONS } from './player-types'

interface PlayerFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedLevel: PlayerLevel | 'All'
  onLevelChange: (level: PlayerLevel | 'All') => void
  membershipFilter: 'All' | 'Member' | 'Non Member'
  onMembershipChange: (value: 'All' | 'Member' | 'Non Member') => void
}

export function PlayerFilters({
  searchTerm,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  membershipFilter,
  onMembershipChange,
}: PlayerFiltersProps) {
  const [levelOpen, setLevelOpen] = useState(false)

  return (
    <section className="sticky top-6 z-20 mt-8 overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <label className="sr-only" htmlFor="player-search">
            Search players
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="player-search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by player name"
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_auto] lg:items-center">
          <DropdownMenu open={levelOpen} onOpenChange={setLevelOpen}>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'w-full justify-between gap-2',
              )}
            >
              <span>{selectedLevel === 'All' ? 'All levels' : selectedLevel}</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by level</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={selectedLevel}
                onValueChange={(v) => {
                  onLevelChange(v as PlayerLevel | 'All')
                  setLevelOpen(false)
                }}
              >
                <DropdownMenuRadioItem value="All">All levels</DropdownMenuRadioItem>
                {LEVEL_OPTIONS.map((level) => (
                  <DropdownMenuRadioItem key={level} value={level}>
                    {level}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted p-1">
            {(['All', 'Member', 'Non Member'] as const).map((option) => (
              <Button
                key={option}
                variant={membershipFilter === option ? 'default' : 'outline'}
                size="sm"
                className="min-w-0 text-[0.8rem]"
                onClick={() => onMembershipChange(option)}
              >
                {option === 'All' ? 'All' : option === 'Member' ? 'Members' : 'Non members'}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
