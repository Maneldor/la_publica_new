// components/gestio-empreses/supervision-pipeline/PerformanceBar.tsx
'use client'

import { cn } from '@/lib/utils'

interface PerformanceBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const variantColors = {
  default: {
    bar: 'bg-blue-500',
    bg: 'bg-blue-100'
  },
  success: {
    bar: 'bg-green-500',
    bg: 'bg-green-100'
  },
  warning: {
    bar: 'bg-amber-500',
    bg: 'bg-amber-100'
  },
  danger: {
    bar: 'bg-red-500',
    bg: 'bg-red-100'
  }
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3'
}

export function PerformanceBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'default'
}: PerformanceBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const colors = variantColors[variant]

  // Auto-select variant based on performance
  let autoVariant = variant
  if (variant === 'default') {
    if (percentage >= 70) autoVariant = 'success'
    else if (percentage >= 40) autoVariant = 'warning'
    else if (percentage < 40 && value > 0) autoVariant = 'danger'
  }
  const autoColors = variantColors[autoVariant]

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className="text-xs text-slate-600">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs font-medium text-slate-700">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', autoColors.bg, sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            autoColors.bar
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
