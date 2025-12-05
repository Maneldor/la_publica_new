'use client'

import { cn } from '@/lib/utils'

export type CalendarView = 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year'

interface AgendaViewSelectorProps {
  currentView: CalendarView
  onViewChange: (view: CalendarView) => void
}

const views: { id: CalendarView; label: string }[] = [
  { id: 'day', label: 'Dia' },
  { id: 'week', label: 'Setmana' },
  { id: 'month', label: 'Mes' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'semester', label: 'Semestre' },
  { id: 'year', label: 'Any' },
]

export function AgendaViewSelector({ currentView, onViewChange }: AgendaViewSelectorProps) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            currentView === view.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          {view.label}
        </button>
      ))}
    </div>
  )
}