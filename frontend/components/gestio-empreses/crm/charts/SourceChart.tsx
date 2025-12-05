// components/gestio-empreses/crm/charts/SourceChart.tsx
'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface SourceData {
  source: string
  label: string
  count: number
  value: number
}

const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#64748b']

export function SourceChart({ data }: { data: SourceData[] }) {
  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((d) => d.count > 0)
  }, [data])

  if (filteredData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-medium text-slate-900 mb-4">Leads per font</h3>
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          No hi ha dades disponibles
        </div>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="font-medium text-slate-900 mb-4">Leads per font</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke="#64748b"
              width={100}
            />
            <Tooltip
              formatter={(value: number) => [`${value} leads`, '']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}