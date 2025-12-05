'use client'

import { BarChart3, Download, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatisticsHeaderProps {
  onExport?: (format: 'pdf' | 'excel') => void
  onFilterToggle?: () => void
  isFilterOpen?: boolean
  selectedDateRange?: string
}

export function StatisticsHeader({
  onExport,
  onFilterToggle,
  isFilterOpen = false,
  selectedDateRange = 'Últims 30 dies'
}: StatisticsHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Título y descripción */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Estadístiques i Analítica
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Anàlisi complet del rendiment i KPIs del teu equip
              </p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-3">
            {/* Información del filtro actual */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <Calendar className="h-4 w-4 text-slate-500" strokeWidth={1.5} />
              <span className="text-sm text-slate-700">{selectedDateRange}</span>
            </div>

            {/* Botón de filtros */}
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterToggle}
              className={isFilterOpen ? 'bg-blue-50 border-blue-200' : ''}
            >
              <Filter className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden sm:inline ml-2">Filtres</span>
            </Button>

            {/* Botones de exportación */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.('excel')}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Download className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline ml-2">Excel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.('pdf')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Download className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline ml-2">PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb / navegación */}
      <div className="px-6 pb-4">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <span>Gestió</span>
          <span>/</span>
          <span className="text-slate-900 font-medium">Estadístiques</span>
        </nav>
      </div>
    </div>
  )
}