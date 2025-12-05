// components/gestio-empreses/tasques/ProgressBar.tsx
interface ProgressBarProps {
  completed: number
  total: number
  avgHours: number
  dueToday: number
  completionRate: number
}

export function ProgressBar({
  completed,
  total,
  avgHours,
  dueToday,
  completionRate
}: ProgressBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Progress bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-slate-900">Progrés de completat</h3>
          <span className="text-sm font-medium text-slate-700">{completionRate}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {completed} de {total} tasques completades
        </p>
      </div>

      {/* Performance metrics */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-medium text-slate-900 mb-3">Rendiment</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Temps mitjà completat</span>
            <span className="font-medium text-slate-900">{avgHours}h</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Tasques per avui</span>
            <span className={`font-medium ${dueToday > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {dueToday}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Taxa de completat</span>
            <span className="font-medium text-green-600">{completionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}