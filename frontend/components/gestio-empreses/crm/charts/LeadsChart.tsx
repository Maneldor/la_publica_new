// components/gestio-empreses/crm/charts/LeadsChart.tsx
'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, parse } from 'date-fns'
import { ca } from 'date-fns/locale'

interface DataPoint {
  month: string
  created: number
  won: number
  lost: number
}

export function LeadsChart({ data }: { data: DataPoint[] }) {
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map((d) => ({
      ...d,
      monthLabel: format(parse(d.month, 'yyyy-MM', new Date()), 'MMM yy', { locale: ca }),
    }))
  }, [data])

  if (formattedData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-medium text-slate-900 mb-4">Leads per mes</h3>
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          No hi ha dades disponibles
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="font-medium text-slate-900 mb-4">Leads per mes</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="created" name="Creats" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="won" name="Guanyats" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lost" name="Perduts" fill="#64748b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}