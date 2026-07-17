'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LEVEL_OPTIONS, type PlayerLevel } from './player-types'

interface SkillLevelSelectProps {
  value: PlayerLevel
  onChange: (level: PlayerLevel) => void
}

export function SkillLevelSelect({ value, onChange }: SkillLevelSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}
      >
        {value}
        <ChevronDown className="h-4 w-4 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent style={{ minWidth: 'var(--radix-dropdown-menu-trigger-width)' }}>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v) => {
            onChange(v as PlayerLevel)
            setOpen(false)
          }}
        >
          {LEVEL_OPTIONS.map((level) => (
            <DropdownMenuRadioItem key={level} value={level}>
              {level}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
