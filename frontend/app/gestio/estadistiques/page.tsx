'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getKPIData,
  getChartData,
  getFunnelData,
  getPipelineData,
  getGestorRanking,
  type KPIData,
  type ChartDataPoint,
  type FunnelStage,
  type PipelineData,
  type GestorRanking,
  type StatisticsFilters
} from '@/lib/gestio-empreses/statistics-actions'
import { KPICards } from '@/components/gestio-empreses/estadistiques/KPICards'
import { LeadsChart } from '@/components/gestio-empreses/estadistiques/LeadsChart'
import { ConversionFunnel } from '@/components/gestio-empreses/estadistiques/ConversionFunnel'
import { PipelineChart } from '@/components/gestio-empreses/estadistiques/PipelineChart'
import { GestorRanking as GestorRankingComponent } from '@/components/gestio-empreses/estadistiques/GestorRanking'
import { StatisticsFilters as FiltersComponent } from '@/components/gestio-empreses/estadistiques/StatisticsFilters'
import { QuickExportButtons } from '@/components/gestio-empreses/estadistiques/ExportButton'

export default function EstadistiquesPage() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Estado de datos
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null)
  const [funnelData, setFunnelData] = useState<FunnelStage[] | null>(null)
  const [pipelineData, setPipelineData] = useState<PipelineData[] | null>(null)
  const [rankingData, setRankingData] = useState<GestorRanking[] | null>(null)

  // Estado de filtros
  const [filters, setFilters] = useState<StatisticsFilters>({
    dateFrom: '', // Inicializar con fechas por defecto si se desea (e.g. last 30 days)
    dateTo: ''
  })

  // Carga inicial y al cambiar filtros
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [kpis, charts, funnel, pipeline, ranking] = await Promise.all([
          getKPIData(filters),
          getChartData(filters),
          getFunnelData(filters),
          getPipelineData(filters),
          getGestorRanking(filters)
        ])

        setKpiData(kpis)
        setChartData(charts)
        setFunnelData(funnel)
        setPipelineData(pipeline)
        setRankingData(ranking)
      } catch (error) {
        console.error('Error carregant estadístiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              {/* Botón de filtros */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersOpen(true)}
                className={isFiltersOpen ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Filter className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline ml-2">Filtres</span>
              </Button>

              {/* Botones de exportación */}
              <QuickExportButtons filters={filters} />
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="px-6 pb-4">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <span>Gestió</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Estadístiques</span>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-6 py-8 md:px-8 max-w-7xl mx-auto space-y-8">

        {/* KPIs */}
        <section>
          <KPICards data={kpiData} isLoading={isLoading} />
        </section>

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadsChart data={chartData} isLoading={isLoading} />
          <ConversionFunnel data={funnelData} isLoading={isLoading} />
        </div>

        {/* Pipeline y Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PipelineChart data={pipelineData} isLoading={isLoading} />
          <GestorRankingComponent data={rankingData} isLoading={isLoading} />
        </div>

      </div>

      {/* Modal de Filtres */}
      <FiltersComponent
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  )
}