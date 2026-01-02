'use client'

import { useState } from 'react'
import { FileText, Search, Building2, ArrowLeft, Calculator, Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { PlanConfigurator } from '@/components/admin/PlanConfigurator'
import toast, { Toaster } from 'react-hot-toast'

interface Company {
  id: string
  name: string
  slug: string
  tier?: string
}

export default function GenerarPressupostosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Company[]>([])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/companies/search?q=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.data || [])
      }
    } catch (error) {
      console.error('Error buscant empreses:', error)
    }
    setIsSearching(false)
  }

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company)
    setSearchResults([])
    setSearchTerm('')
  }

  const handleBack = () => {
    setSelectedCompany(null)
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedCompany ? (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
            </button>
          ) : (
            <Calculator className="h-7 w-7 text-slate-600" strokeWidth={1.5} />
          )}
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {selectedCompany ? `Pressupost per ${selectedCompany.name}` : 'Generador de Pressupostos'}
            </h1>
            <p className="text-sm text-slate-500">
              {selectedCompany
                ? 'Configura el pla i extres per generar un pressupost personalitzat'
                : 'Selecciona una empresa per crear un pressupost personalitzat'
              }
            </p>
          </div>
        </div>
        {!selectedCompany && (
          <Link
            href="/gestio/admin/plans"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Veure plans base
          </Link>
        )}
      </div>

      {!selectedCompany ? (
        /* Buscador d'empreses */
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Cerca l'empresa
          </h2>

          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cerca per nom d'empresa..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchTerm.trim()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Cercant...' : 'Cercar'}
            </button>
          </div>

          {/* Resultats de cerca */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-slate-500 mb-3">
                {searchResults.length} empresa{searchResults.length !== 1 ? 's' : ''} trobada{searchResults.length !== 1 ? 'es' : ''}
              </p>
              {searchResults.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleSelectCompany(company)}
                  className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{company.name}</p>
                    <p className="text-sm text-slate-500">{company.slug}</p>
                  </div>
                  {company.tier && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      {company.tier}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Empreses recents o accés ràpid */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-4">
              O crea un pressupost sense empresa associada
            </h3>
            <button
              onClick={() => setSelectedCompany({ id: 'new', name: 'Nova Empresa', slug: 'nova-empresa' })}
              className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors w-full"
            >
              <div className="p-2 bg-slate-100 rounded-lg">
                <FileText className="h-5 w-5 text-slate-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-700">Pressupost genèric</p>
                <p className="text-sm text-slate-500">Sense associar a cap empresa específica</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Configurador de pressupost */
        <PlanConfigurator
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
          currentPlan={selectedCompany.tier || 'STANDARD'}
        />
      )}
    </div>
  )
}
