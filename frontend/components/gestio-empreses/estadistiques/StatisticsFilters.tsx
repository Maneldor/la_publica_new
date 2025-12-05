'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Building2, Target, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getGestoresList, type StatisticsFilters } from '@/lib/gestio-empreses/statistics-actions'

interface StatisticsFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: StatisticsFilters
  onFiltersChange: (filters: StatisticsFilters) => void
}

const predefinedRanges = [
  { label: 'Avui', value: 'today' },
  { label: 'Aquesta setmana', value: 'thisWeek' },
  { label: 'Aquest mes', value: 'thisMonth' },
  { label: 'Últims 7 dies', value: 'last7Days' },
  { label: 'Últims 30 dies', value: 'last30Days' },
  { label: 'Últims 90 dies', value: 'last90Days' },
  { label: 'Aquest any', value: 'thisYear' },
  { label: 'Personalitzat', value: 'custom' }
]

const leadSources = [
  { label: 'Web', value: 'web' },
  { label: 'Trucada', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'Xarxes socials', value: 'social' },
  { label: 'Referència', value: 'referral' },
  { label: 'Event', value: 'event' },
  { label: 'Altres', value: 'other' }
]

function getDateRange(range: string) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  switch (range) {
    case 'today':
      return { from: todayStr, to: todayStr }
    case 'thisWeek': {
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
      return {
        from: weekStart.toISOString().split('T')[0],
        to: todayStr
      }
    }
    case 'thisMonth': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return {
        from: monthStart.toISOString().split('T')[0],
        to: todayStr
      }
    }
    case 'last7Days': {
      const weekAgo = new Date(today.setDate(today.getDate() - 7))
      return {
        from: weekAgo.toISOString().split('T')[0],
        to: todayStr
      }
    }
    case 'last30Days': {
      const monthAgo = new Date(today.setDate(today.getDate() - 30))
      return {
        from: monthAgo.toISOString().split('T')[0],
        to: todayStr
      }
    }
    case 'last90Days': {
      const quarterAgo = new Date(today.setDate(today.getDate() - 90))
      return {
        from: quarterAgo.toISOString().split('T')[0],
        to: todayStr
      }
    }
    case 'thisYear': {
      const yearStart = new Date(today.getFullYear(), 0, 1)
      return {
        from: yearStart.toISOString().split('T')[0],
        to: todayStr
      }
    }
    default:
      return { from: '', to: '' }
  }
}

export function StatisticsFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange
}: StatisticsFiltersProps) {
  const [localFilters, setLocalFilters] = useState<StatisticsFilters>(filters)
  const [selectedRange, setSelectedRange] = useState('last30Days')
  const [isCustomRange, setIsCustomRange] = useState(false)
  const [gestores, setGestores] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const loadGestores = async () => {
      try {
        const gestoresList = await getGestoresList()
        setGestores(gestoresList)
      } catch (error) {
        console.error('Error cargando gestores:', error)
      }
    }

    if (isOpen) {
      loadGestores()
    }
  }, [isOpen])

  const handleRangeChange = (range: string) => {
    setSelectedRange(range)

    if (range === 'custom') {
      setIsCustomRange(true)
    } else {
      setIsCustomRange(false)
      const { from, to } = getDateRange(range)
      setLocalFilters(prev => ({ ...prev, dateFrom: from, dateTo: to }))
    }
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleResetFilters = () => {
    const { from, to } = getDateRange('last30Days')
    const resetFilters: StatisticsFilters = {
      dateFrom: from,
      dateTo: to,
      gestorId: undefined,
      companyId: undefined,
      leadSource: undefined
    }
    setLocalFilters(resetFilters)
    setSelectedRange('last30Days')
    setIsCustomRange(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Filtres d'estadístiques</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Rango de fechas */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" strokeWidth={1.5} />
              Període de temps
            </Label>
            <Select value={selectedRange} onValueChange={handleRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un període" />
              </SelectTrigger>
              <SelectContent>
                {predefinedRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isCustomRange && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-600">Des de</Label>
                  <Input
                    type="date"
                    value={localFilters.dateFrom}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      dateFrom: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Fins a</Label>
                  <Input
                    type="date"
                    value={localFilters.dateTo}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      dateTo: e.target.value
                    }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gestor */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4" strokeWidth={1.5} />
              Gestor
            </Label>
            <Select
              value={localFilters.gestorId || ''}
              onValueChange={(value) => setLocalFilters(prev => ({
                ...prev,
                gestorId: value || undefined
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tots els gestors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tots els gestors</SelectItem>
                {gestores.map((gestor) => (
                  <SelectItem key={gestor.id} value={gestor.id}>
                    {gestor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Empresa */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Building2 className="h-4 w-4" strokeWidth={1.5} />
              Empresa
            </Label>
            <Input
              placeholder="Nom de l'empresa"
              value={localFilters.companyId || ''}
              onChange={(e) => setLocalFilters(prev => ({
                ...prev,
                companyId: e.target.value || undefined
              }))}
            />
          </div>

          {/* Fuente de leads */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Target className="h-4 w-4" strokeWidth={1.5} />
              Origen del lead
            </Label>
            <Select
              value={localFilters.leadSource || ''}
              onValueChange={(value) => setLocalFilters(prev => ({
                ...prev,
                leadSource: value || undefined
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Totes les fonts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Totes les fonts</SelectItem>
                {leadSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="text-slate-600"
          >
            Restablir
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel·lar
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar filtres
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}