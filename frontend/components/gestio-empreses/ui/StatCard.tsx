// components/gestio-empreses/ui/StatCard.tsx
// FITXER NOU - Card d'estadístiques Enterprise Professional

import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  className?: string
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-slate-200 p-5",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>

          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-sm",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <TrendingDown className="h-4 w-4" strokeWidth={1.5} />
              )}
              <span className="font-medium">{trend.value}%</span>
              {trend.label && (
                <span className="text-slate-500 font-normal">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className="p-2.5 bg-slate-50 rounded-lg">
            <Icon className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  )
}