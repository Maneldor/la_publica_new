'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Package,
  RefreshCw,
  Plus,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExtraStats } from '@/components/gestio-empreses/extras/ExtraStats'
import { ExtraFilters } from '@/components/gestio-empreses/extras/ExtraFilters'
import { ExtraCard } from '@/components/gestio-empreses/extras/ExtraCard'
import { ExtraTable } from '@/components/gestio-empreses/extras/ExtraTable'
import { ExtraPreviewPanel } from '@/components/gestio-empreses/extras/ExtraPreviewPanel'
import toast, { Toaster } from 'react-hot-toast'

type ExtraCategory =
  | 'WEB_MAINTENANCE' | 'BRANDING' | 'MARKETING' | 'SEO'
  | 'CONTENT' | 'CONSULTING' | 'TRAINING' | 'DEVELOPMENT'
  | 'SUPPORT' | 'OTHER'

type PriceType = 'FIXED' | 'MONTHLY' | 'ANNUAL' | 'HOURLY' | 'CUSTOM'

interface Extra {
  id: string
  name: string
  slug: string
  description: string
  category: ExtraCategory
  basePrice: number
  priceType: PriceType
  active: boolean
  featured: boolean
  icon?: string
  _count?: {
    budgetItems: number
    invoiceItems: number
  }
}

export default function ExtrasPage() {
  const [extras, setExtras] = useState<Extra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: 'ALL',
    status: 'ALL',
    priceType: 'ALL',
  })

  // Preview
  const [selectedExtra, setSelectedExtra] = useState<Extra | null>(null)

  const loadExtras = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.category !== 'ALL') params.append('category', filters.category)
      if (filters.status === 'ACTIVE') params.append('active', 'true')
      if (filters.status === 'INACTIVE') params.append('active', 'false')
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/admin/extras?${params.toString()}`)
      const data = await response.json()
      setExtras(data.extras || [])
    } catch (error) {
      console.error('Error carregant extras:', error)
      toast.error('Error carregant extras')
    }
    setIsLoading(false)
  }, [filters])

  useEffect(() => {
    loadExtras()
  }, [loadExtras])

  const handleEdit = (extra: Extra) => {
    // TODO: Obrir modal d'edició o navegar a pàgina d'edició
    toast('Funcionalitat d\'edició pendent')
  }

  const handleToggleActive = async (extra: Extra) => {
    try {
      const response = await fetch(`/api/admin/extras/${extra.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !extra.active })
      })

      if (response.ok) {
        setExtras(prevExtras =>
          prevExtras.map(e =>
            e.id === extra.id ? { ...e, active: !extra.active } : e
          )
        )
        if (selectedExtra?.id === extra.id) {
          setSelectedExtra({ ...selectedExtra, active: !extra.active })
        }
        toast.success(extra.active ? 'Extra desactivat' : 'Extra activat')
      } else {
        toast.error('Error al canviar l\'estat')
      }
    } catch (error) {
      console.error('Error toggling extra:', error)
      toast.error('Error al canviar l\'estat')
    }
  }

  const handleDelete = async (extra: Extra) => {
    if (!confirm(`Segur que vols eliminar "${extra.name}"?`)) return

    try {
      const response = await fetch(`/api/admin/extras/${extra.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setExtras(prevExtras => prevExtras.filter(e => e.id !== extra.id))
        if (selectedExtra?.id === extra.id) {
          setSelectedExtra(null)
        }
        toast.success('Extra eliminat')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error deleting extra:', error)
      toast.error('Error al eliminar')
    }
  }

  // Filtrar extras
  const filteredExtras = extras.filter(extra => {
    if (filters.search) {
      const search = filters.search.toLowerCase()
      if (!extra.name.toLowerCase().includes(search) &&
          !extra.description.toLowerCase().includes(search)) {
        return false
      }
    }
    if (filters.status === 'FEATURED' && !extra.featured) return false
    if (filters.priceType !== 'ALL' && extra.priceType !== filters.priceType) return false
    return true
  })

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-7 w-7 text-purple-600" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Serveis Extra</h1>
            <p className="text-sm text-slate-500">
              Catàleg de serveis addicionals per oferir als clients
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                'px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors',
                viewMode === 'cards'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-2 text-sm font-medium flex items-center gap-2 transition-colors',
                viewMode === 'table'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <TableIcon className="h-4 w-4" strokeWidth={1.5} />
              Taula
            </button>
          </div>

          <button
            onClick={loadExtras}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} strokeWidth={1.5} />
            Actualitzar
          </button>

          <Link
            href="/gestio/admin/extras/crear"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nou extra
          </Link>
        </div>
      </div>

      {/* Stats */}
      <ExtraStats extras={extras} />

      {/* Filters */}
      <ExtraFilters filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw className="h-8 w-8 text-slate-300 mx-auto mb-4 animate-spin" strokeWidth={1.5} />
          <p className="text-slate-500">Carregant extras...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Extras list */}
          <div className="lg:col-span-3">
            {filteredExtras.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  Cap extra trobat
                </h3>
                <p className="text-slate-500 mb-4">
                  No hi ha extras que coincideixin amb els filtres seleccionats.
                </p>
                <Link
                  href="/gestio/admin/extras/crear"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                  Crear primer extra
                </Link>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredExtras.map((extra) => (
                  <ExtraCard
                    key={extra.id}
                    extra={extra}
                    onEdit={handleEdit}
                    onToggleActive={handleToggleActive}
                    onClick={() => setSelectedExtra(extra)}
                    isSelected={selectedExtra?.id === extra.id}
                  />
                ))}
              </div>
            ) : (
              <ExtraTable
                extras={filteredExtras}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
              />
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <ExtraPreviewPanel
                extra={selectedExtra}
                onClose={() => setSelectedExtra(null)}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}