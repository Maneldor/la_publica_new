// components/gestio-empreses/leads/ai/AIScoreBadge.tsx
'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIScoreBadgeProps {
  score: number | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function AIScoreBadge({ score, size = 'md', showLabel = false }: AIScoreBadgeProps) {
  if (score === null || score === undefined) {
    return null
  }

  const getColor = (s: number) => {
    if (s >= 75) return 'bg-green-100 text-green-700 border-green-200'
    if (s >= 50) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <div className={cn(
      "inline-flex items-center font-medium rounded-full border",
      getColor(score),
      sizeClasses[size]
    )}>
      <Sparkles className={iconSizes[size]} strokeWidth={1.5} />
      <span>{score}</span>
      {showLabel && <span className="text-xs opacity-75">punts</span>}
    </div>
  )
}