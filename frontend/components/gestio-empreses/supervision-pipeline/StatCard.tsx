// components/gestio-empreses/supervision-pipeline/StatCard.tsx
'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles = {
  default: {
    bg: 'bg-slate-50',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    valueColor: 'text-slate-900'
  },
  success: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    valueColor: 'text-green-700'
  },
  warning: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-700'
  },
  danger: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: 'text-red-700'
  },
  info: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700'
  }
}

const sizeStyles = {
  sm: {
    padding: 'p-3',
    iconSize: 'h-4 w-4',
    iconWrapper: 'p-1.5',
    valueSize: 'text-lg',
    titleSize: 'text-xs'
  },
  md: {
    padding: 'p-4',
    iconSize: 'h-5 w-5',
    iconWrapper: 'p-2',
    valueSize: 'text-2xl',
    titleSize: 'text-sm'
  },
  lg: {
    padding: 'p-5',
    iconSize: 'h-6 w-6',
    iconWrapper: 'p-2.5',
    valueSize: 'text-3xl',
    titleSize: 'text-base'
  }
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  size = 'md'
}: StatCardProps) {
  const styles = variantStyles[variant]
  const sizes = sizeStyles[size]

  return (
    <div className={cn(
      'rounded-xl border border-slate-200 transition-shadow hover:shadow-sm',
      styles.bg,
      sizes.padding
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-slate-600 font-medium', sizes.titleSize)}>
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn('font-bold', styles.valueColor, sizes.valueSize)}>
              {value}
            </span>
            {trend && (
              <span className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div className={cn('rounded-lg', styles.iconBg, sizes.iconWrapper)}>
          <Icon className={cn(styles.iconColor, sizes.iconSize)} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}
