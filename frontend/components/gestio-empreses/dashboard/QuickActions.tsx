// components/gestio-empreses/dashboard/QuickActions.tsx
// FITXER NOU - Accions ràpides del dashboard

'use client'

import Link from 'next/link'
import {
  Plus,
  Search,
  FileText,
  Calendar,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    label: 'Nou lead',
    description: 'Afegir contacte comercial',
    icon: Plus,
    href: '/gestor-empreses/leads/nou',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    label: 'Cercar lead',
    description: 'Buscar per nom o empresa',
    icon: Search,
    href: '/gestor-empreses/leads',
    color: 'bg-slate-600 hover:bg-slate-700',
  },
  {
    label: 'Importar leads',
    description: 'Des de fitxer CSV',
    icon: Upload,
    href: '/gestor-empreses/leads/importar',
    color: 'bg-slate-600 hover:bg-slate-700',
  },
  {
    label: 'Agenda',
    description: 'Reunions i trucades',
    icon: Calendar,
    href: '/gestor-empreses/agenda',
    color: 'bg-slate-600 hover:bg-slate-700',
  },
]

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-slate-200 p-4", className)}>
      <h3 className="font-medium text-slate-800 mb-4">Accions ràpides</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-white transition-colors",
                action.color
              )}
            >
              <div className="p-1.5 bg-white/20 rounded">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-white/70">{action.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}