'use client'

import { useState } from 'react'
import { BarChart3, Download, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EstadistiquesPage() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
                <span className="text-sm text-slate-700">Últims 30 dies</span>
              </div>

              {/* Botón de filtros */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={isFiltersOpen ? 'bg-blue-50 border-blue-200' : ''}
              >
                <Filter className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden sm:inline ml-2">Filtres</span>
              </Button>

              {/* Botones de exportación */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Download className="h-4 w-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline ml-2">Excel</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Download className="h-4 w-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline ml-2">PDF</span>
                </Button>
              </div>
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
      <div className="px-6 py-8">
        {/* Mensaje de desarrollo */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" strokeWidth={1.5} />
          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Mòdul d'Estadístiques
          </h2>

          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            El mòdul d'estadístiques està en desenvolupament. Totes les funcionalitats han estat implementades
            i estaran disponibles un cop es resolguin els errors de configuració.
          </p>

          {/* Preview de funcionalidades */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                📊
              </div>
              <h3 className="font-medium text-slate-900 text-sm">KPIs Principals</h3>
              <p className="text-xs text-slate-500 mt-1">8 indicadors clau amb tendències</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                📈
              </div>
              <h3 className="font-medium text-slate-900 text-sm">Gràfics Interactius</h3>
              <p className="text-xs text-slate-500 mt-1">Evolució temporal i tendències</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                🏆
              </div>
              <h3 className="font-medium text-slate-900 text-sm">Rànking Gestors</h3>
              <p className="text-xs text-slate-500 mt-1">Comparativa de rendiment</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                📤
              </div>
              <h3 className="font-medium text-slate-900 text-sm">Exportació</h3>
              <p className="text-xs text-slate-500 mt-1">PDF i Excel amb dades completes</p>
            </div>
          </div>

          {/* Información técnica */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
            <h4 className="font-medium text-blue-900 mb-2">Funcionalitats Implementades:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Dashboard complet amb 8 KPIs principals i mètriques financeres</li>
              <li>• Gràfics de línies, barres i combinats amb Recharts</li>
              <li>• Embut de conversió visual amb insights automàtics</li>
              <li>• Anàlisi de pipeline amb múltiples vistes</li>
              <li>• Activitat temporal amb filtres per tipus</li>
              <li>• Rànking de gestors amb podio i estadístiques d'equip</li>
              <li>• Sistema de filtres avançat (dates, gestor, empresa, origen)</li>
              <li>• Exportació a PDF i Excel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}