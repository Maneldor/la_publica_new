// components/gestio-empreses/empreses/ConversionMetrics.tsx
import { Clock, CheckCircle, XCircle, Timer } from 'lucide-react'

interface ConversionSummary {
  pendingAdmin: number
  approvedThisMonth: number
  rejectedThisMonth: number
  avgConversionDays: number
}

export function ConversionMetrics({ summary }: { summary: ConversionSummary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50">
            <Clock className="h-5 w-5 text-amber-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900">
              {summary.pendingAdmin}
            </p>
            <p className="text-sm text-slate-500">Pendent Admin</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900">
              {summary.approvedThisMonth}
            </p>
            <p className="text-sm text-slate-500">Aprovades/mes</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50">
            <XCircle className="h-5 w-5 text-red-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900">
              {summary.rejectedThisMonth}
            </p>
            <p className="text-sm text-slate-500">Rebutjades/mes</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Timer className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900">
              {Math.round(summary.avgConversionDays)} dies
            </p>
            <p className="text-sm text-slate-500">Temps mitjà</p>
          </div>
        </div>
      </div>
    </div>
  )
}