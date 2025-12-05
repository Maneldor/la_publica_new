// components/gestio-empreses/shared/PageHeader.tsx
// FITXER NOU - Header de pàgina reutilitzable

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="p-2 bg-slate-100 rounded-lg">
            <Icon className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}