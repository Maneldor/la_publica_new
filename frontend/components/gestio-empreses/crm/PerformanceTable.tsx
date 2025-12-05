// components/gestio-empreses/crm/PerformanceTable.tsx
import { cn } from '@/lib/utils'

interface GestorPerformance {
  name: string
  role: string
  total: number
  won: number
  active: number
  pipeline: number
  conversion: number
}

const roleLabels: Record<string, string> = {
  EMPLOYEE: 'Estàndard',
  ACCOUNT_MANAGER: 'Estratègic',
  ADMIN: 'Enterprise',
}

export function PerformanceTable({ data }: { data: GestorPerformance[] }) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K €`
    return `${value} €`
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-medium text-slate-900">Rendiment per gestor</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-500">Gestor</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-slate-500">Rol</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-500">Total</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-500">Actius</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-500">Guanyats</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-500">Pipeline</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-slate-500">Conversió</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((gestor, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {gestor.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {roleLabels[gestor.role] || gestor.role}
                </td>
                <td className="px-4 py-3 text-sm text-right text-slate-700">
                  {gestor.total}
                </td>
                <td className="px-4 py-3 text-sm text-right text-slate-700">
                  {gestor.active}
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                  {gestor.won}
                </td>
                <td className="px-4 py-3 text-sm text-right text-slate-700">
                  {formatCurrency(gestor.pipeline)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-sm font-medium',
                    gestor.conversion >= 30 ? 'bg-green-100 text-green-700' :
                    gestor.conversion >= 15 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-700'
                  )}>
                    {gestor.conversion}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}