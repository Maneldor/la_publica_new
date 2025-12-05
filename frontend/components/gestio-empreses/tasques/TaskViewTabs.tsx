// components/gestio-empreses/tasques/TaskViewTabs.tsx
'use client'

import { List, Columns, Calendar, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewType = 'list' | 'kanban' | 'calendar' | 'timeline'

interface TaskViewTabsProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

const views = [
  { id: 'list' as ViewType, label: 'Llista', icon: List },
  { id: 'kanban' as ViewType, label: 'Kanban', icon: Columns },
  { id: 'calendar' as ViewType, label: 'Calendari', icon: Calendar },
  { id: 'timeline' as ViewType, label: 'Timeline', icon: GitBranch },
]

export function TaskViewTabs({ activeView, onViewChange }: TaskViewTabsProps) {
  return (
    <div className="flex items-center border-b border-slate-200">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeView === view.id
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
          )}
        >
          <view.icon className="h-4 w-4" strokeWidth={1.5} />
          {view.label}
        </button>
      ))}
    </div>
  )
}