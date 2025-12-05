// components/gestio-empreses/crm/charts/PipelineChart.tsx
'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parse } from 'date-fns'
import { ca } from 'date-fns/locale'

interface DataPoint {
  month: string
  pipeline: number
  won: number
}

export function PipelineChart({ data }: { data: DataPoint[] }) {
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map((d) => ({
      ...d,
      monthLabel: format(parse(d.month, 'yyyy-MM', new Date()), 'MMM yy', { locale: ca }),
      pipelineK: Math.round(d.pipeline / 1000),
      wonK: Math.round(d.won / 1000),
    }))
  }, [data])

  if (formattedData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-medium text-slate-900 mb-4">Evolució del pipeline (€)</h3>
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          No hi ha dades disponibles
        </div>
      </div>
    )
  }

  const formatValue = (value: number) => `${value}K €`

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="font-medium text-slate-900 mb-4">Evolució del pipeline (€)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={formatValue} />
            <Tooltip
              formatter={(value: number) => [`${value}K €`, '']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="pipelineK"
              name="Pipeline"
              stroke="#8b5cf6"
              fill="#8b5cf680"
            />
            <Area
              type="monotone"
              dataKey="wonK"
              name="Guanyat"
              stroke="#22c55e"
              fill="#22c55e80"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}