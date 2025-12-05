// components/gestio-empreses/pipeline/PipelineFilters.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Filter, LayoutGrid, List, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineFiltersProps {
  totalLeads: number
  totalValue: number
}

export function PipelineFilters({ totalLeads, totalValue }: PipelineFiltersProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsRefreshing(false)
  }

  const formatCurrency = (value: number) => {
    const numValue = typeof value === 'number' ? value : Number(value) || 0
    return new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(numValue)
  }

  return (
    <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
      {/* Estadístiques */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs text-slate-500">Total leads</p>
          <p className="text-lg font-semibold text-slate-800">{totalLeads}</p>
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <div>
          <p className="text-xs text-slate-500">Valor pipeline</p>
          <p className="text-lg font-semibold text-slate-800">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Accions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors",
            isRefreshing && "opacity-50"
          )}
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            isRefreshing && "animate-spin"
          )} strokeWidth={1.5} />
          Actualitzar
        </button>
      </div>
    </div>
  )
}