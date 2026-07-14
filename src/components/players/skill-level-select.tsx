'use client'

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between')}
      >
        {value}
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v) => onChange(v as PlayerLevel)}
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
