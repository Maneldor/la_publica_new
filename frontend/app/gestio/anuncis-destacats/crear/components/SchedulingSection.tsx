'use client'

import { useState } from 'react'
import {
  AdvancedScheduling,
  DayOfWeek,
  TimeSlot,
  CampaignPeriod,
  RecurrenceType,
  PeriodType,
  PERIOD_CONFIG,
  WEEKDAYS_CONFIG,
  RECURRENCE_CONFIG
} from '@/lib/types/featuredAds'
import {
  Calendar,
  Clock,
  CalendarDays,
  Repeat,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Settings2,
  Zap,
  Info,
  CalendarRange
} from 'lucide-react'
import { ScheduleCalendar } from './ScheduleCalendar'

interface SchedulingSectionProps {
  scheduling: AdvancedScheduling
  onChange: (scheduling: AdvancedScheduling) => void
  showPricing?: boolean
  currentPrice?: number
}

export function SchedulingSection({
  scheduling,
  onChange,
  showPricing = false,
  currentPrice = 0
}: SchedulingSectionProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    timeSlots: false,
    weekDays: false,
    campaigns: false,
    rotation: false,
    recurrence: false
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateScheduling = (updates: Partial<AdvancedScheduling>) => {
    onChange({ ...scheduling, ...updates })
  }

  // Generar ID único
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // ===== FRANJAS HORARIAS =====
  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: generateId(),
      startTime: '09:00',
      endTime: '18:00'
    }
    updateScheduling({
      timeSlots: {
        ...scheduling.timeSlots,
        slots: [...scheduling.timeSlots.slots, newSlot]
      }
    })
  }

  const updateTimeSlot = (id: string, field: 'startTime' | 'endTime', value: string) => {
    updateScheduling({
      timeSlots: {
        ...scheduling.timeSlots,
        slots: scheduling.timeSlots.slots.map(slot =>
          slot.id === id ? { ...slot, [field]: value } : slot
        )
      }
    })
  }

  const removeTimeSlot = (id: string) => {
    updateScheduling({
      timeSlots: {
        ...scheduling.timeSlots,
        slots: scheduling.timeSlots.slots.filter(slot => slot.id !== id)
      }
    })
  }

  // ===== CAMPAÑAS =====
  const addCampaignPeriod = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const newPeriod: CampaignPeriod = {
      id: generateId(),
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      isActive: true
    }
    updateScheduling({
      campaigns: {
        ...scheduling.campaigns,
        periods: [...scheduling.campaigns.periods, newPeriod]
      }
    })
  }

  const updateCampaignPeriod = (id: string, field: keyof CampaignPeriod, value: any) => {
    updateScheduling({
      campaigns: {
        ...scheduling.campaigns,
        periods: scheduling.campaigns.periods.map(period =>
          period.id === id ? { ...period, [field]: value } : period
        )
      }
    })
  }

  const removeCampaignPeriod = (id: string) => {
    updateScheduling({
      campaigns: {
        ...scheduling.campaigns,
        periods: scheduling.campaigns.periods.filter(period => period.id !== id)
      }
    })
  }

  // ===== DÍAS DE LA SEMANA =====
  const toggleWeekDay = (day: DayOfWeek) => {
    const currentDays = scheduling.weekDays.days
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    updateScheduling({
      weekDays: {
        ...scheduling.weekDays,
        days: newDays
      }
    })
  }

  const selectPresetDays = (preset: 'all' | 'weekdays' | 'weekend') => {
    let days: DayOfWeek[]
    switch (preset) {
      case 'all':
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        break
      case 'weekdays':
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        break
      case 'weekend':
        days = ['saturday', 'sunday']
        break
    }
    updateScheduling({
      weekDays: { ...scheduling.weekDays, days }
    })
  }

  const isAdvancedMode = scheduling.mode === 'advanced'

  return (
    <div className="space-y-4">
      {/* Header con toggle de modo */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Programació
        </h3>
        <button
          type="button"
          onClick={() => updateScheduling({ mode: isAdvancedMode ? 'simple' : 'advanced' })}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isAdvancedMode
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          {isAdvancedMode ? 'Mode Avançat' : 'Mode Simple'}
        </button>
      </div>

      {/* MODO SIMPLE */}
      {!isAdvancedMode && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data d'inici
              </label>
              <input
                type="date"
                value={scheduling.startsAt}
                onChange={(e) => updateScheduling({ startsAt: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duració</label>
              <select
                value={scheduling.period}
                onChange={(e) => updateScheduling({ period: e.target.value as PeriodType })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.entries(PERIOD_CONFIG).filter(([key]) => key !== 'custom').map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {showPricing && currentPrice > 0 && (
            <div className="mt-4 flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="text-sm text-blue-600">Preu</p>
                <p className="text-2xl font-bold text-blue-700">{currentPrice.toFixed(2)} €</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODO AVANZADO */}
      {isAdvancedMode && (
        <div className="space-y-3">
          {/* Fechas básicas */}
          <CollapsibleSection
            title="Dates i Duració"
            icon={<CalendarRange className="w-4 h-4" />}
            isExpanded={expandedSections.basic}
            onToggle={() => toggleSection('basic')}
            badge={scheduling.period !== 'monthly' ? PERIOD_CONFIG[scheduling.period].label : undefined}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data d'inici
                </label>
                <input
                  type="date"
                  value={scheduling.startsAt}
                  onChange={(e) => updateScheduling({ startsAt: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data fi (opcional)
                </label>
                <input
                  type="date"
                  value={scheduling.endsAt || ''}
                  onChange={(e) => updateScheduling({ endsAt: e.target.value || undefined })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                O selecciona duració predefinida
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PERIOD_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateScheduling({ period: key as PeriodType })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      scheduling.period === key
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Franjas horarias */}
          <CollapsibleSection
            title="Franges Horàries"
            icon={<Clock className="w-4 h-4" />}
            isExpanded={expandedSections.timeSlots}
            onToggle={() => toggleSection('timeSlots')}
            isEnabled={scheduling.timeSlots.enabled}
            onToggleEnabled={(enabled) =>
              updateScheduling({ timeSlots: { ...scheduling.timeSlots, enabled } })
            }
            badge={scheduling.timeSlots.enabled ? `${scheduling.timeSlots.slots.length} franges` : undefined}
          >
            <p className="text-sm text-gray-500 mb-4">
              L'anunci només es mostrarà durant aquestes franges horàries
            </p>
            <div className="space-y-3">
              {scheduling.timeSlots.slots.map((slot, index) => (
                <div key={slot.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-400">fins</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(slot.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTimeSlot}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Afegir franja
              </button>
            </div>
          </CollapsibleSection>

          {/* Días de la semana */}
          <CollapsibleSection
            title="Dies de la Setmana"
            icon={<CalendarDays className="w-4 h-4" />}
            isExpanded={expandedSections.weekDays}
            onToggle={() => toggleSection('weekDays')}
            isEnabled={scheduling.weekDays.enabled}
            onToggleEnabled={(enabled) =>
              updateScheduling({ weekDays: { ...scheduling.weekDays, enabled } })
            }
            badge={scheduling.weekDays.enabled ? `${scheduling.weekDays.days.length} dies` : undefined}
          >
            <p className="text-sm text-gray-500 mb-4">
              L'anunci només es mostrarà aquests dies de la setmana
            </p>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => selectPresetDays('all')}
                className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Tots
              </button>
              <button
                type="button"
                onClick={() => selectPresetDays('weekdays')}
                className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Laborables
              </button>
              <button
                type="button"
                onClick={() => selectPresetDays('weekend')}
                className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cap de setmana
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(WEEKDAYS_CONFIG) as [DayOfWeek, { label: string; shortLabel: string }][]).map(
                ([day, config]) => {
                  const isSelected = scheduling.weekDays.days.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekDay(day)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.shortLabel}
                    </button>
                  )
                }
              )}
            </div>
          </CollapsibleSection>

          {/* Múltiples campañas */}
          <CollapsibleSection
            title="Campanyes Múltiples"
            icon={<CalendarRange className="w-4 h-4" />}
            isExpanded={expandedSections.campaigns}
            onToggle={() => toggleSection('campaigns')}
            isEnabled={scheduling.campaigns.enabled}
            onToggleEnabled={(enabled) =>
              updateScheduling({ campaigns: { ...scheduling.campaigns, enabled } })
            }
            badge={scheduling.campaigns.enabled ? `${scheduling.campaigns.periods.length} períodes` : undefined}
          >
            <p className="text-sm text-gray-500 mb-4">
              Defineix múltiples períodes d'activitat per a l'anunci
            </p>
            <div className="space-y-3">
              {scheduling.campaigns.periods.map((period, index) => (
                <div key={period.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Període {index + 1}</span>
                  <input
                    type="date"
                    value={period.startDate}
                    onChange={(e) => updateCampaignPeriod(period.id, 'startDate', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <span className="text-gray-400">→</span>
                  <input
                    type="date"
                    value={period.endDate}
                    onChange={(e) => updateCampaignPeriod(period.id, 'endDate', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={period.isActive}
                      onChange={(e) => updateCampaignPeriod(period.id, 'isActive', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600"
                    />
                    <span className="text-sm text-gray-600">Actiu</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeCampaignPeriod(period.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg ml-auto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCampaignPeriod}
                className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Afegir període
              </button>
            </div>
          </CollapsibleSection>

          {/* Rotación y prioridad */}
          <CollapsibleSection
            title="Rotació i Prioritat"
            icon={<Shuffle className="w-4 h-4" />}
            isExpanded={expandedSections.rotation}
            onToggle={() => toggleSection('rotation')}
            isEnabled={scheduling.rotation.enabled}
            onToggleEnabled={(enabled) =>
              updateScheduling({ rotation: { ...scheduling.rotation, enabled } })
            }
            badge={scheduling.rotation.enabled ? `Pes: ${scheduling.rotation.weight}%` : undefined}
          >
            <p className="text-sm text-gray-500 mb-4">
              Configura com es mostra l'anunci quan competeix amb altres
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioritat (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={scheduling.priority}
                    onChange={(e) => updateScheduling({ priority: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-bold text-purple-600 text-lg">
                    {scheduling.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Major prioritat = es mostra abans</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pes de rotació (1-100%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={scheduling.rotation.weight}
                    onChange={(e) =>
                      updateScheduling({
                        rotation: { ...scheduling.rotation, weight: parseInt(e.target.value) }
                      })
                    }
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-bold text-purple-600 text-lg">
                    {scheduling.rotation.weight}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Probabilitat de ser seleccionat en rotació</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Límit d'impressions
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Sense límit"
                    value={scheduling.rotation.maxImpressions || ''}
                    onChange={(e) =>
                      updateScheduling({
                        rotation: {
                          ...scheduling.rotation,
                          maxImpressions: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Límit de clics
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Sense límit"
                    value={scheduling.rotation.maxClicks || ''}
                    onChange={(e) =>
                      updateScheduling({
                        rotation: {
                          ...scheduling.rotation,
                          maxClicks: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Recurrencia */}
          <CollapsibleSection
            title="Recurrència"
            icon={<Repeat className="w-4 h-4" />}
            isExpanded={expandedSections.recurrence}
            onToggle={() => toggleSection('recurrence')}
            badge={scheduling.recurrence.type !== 'none' ? RECURRENCE_CONFIG[scheduling.recurrence.type].label : undefined}
          >
            <p className="text-sm text-gray-500 mb-4">
              Repeteix l'anunci automàticament
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(RECURRENCE_CONFIG) as [RecurrenceType, { label: string }][]).map(
                  ([type, config]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        updateScheduling({
                          recurrence: { ...scheduling.recurrence, type }
                        })
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        scheduling.recurrence.type === type
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  )
                )}
              </div>
              {scheduling.recurrence.type !== 'none' && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cada
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={scheduling.recurrence.interval}
                        onChange={(e) =>
                          updateScheduling({
                            recurrence: {
                              ...scheduling.recurrence,
                              interval: parseInt(e.target.value) || 1
                            }
                          })
                        }
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-600">
                        {scheduling.recurrence.type === 'daily' && 'dies'}
                        {scheduling.recurrence.type === 'weekly' && 'setmanes'}
                        {scheduling.recurrence.type === 'monthly' && 'mesos'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Termina després de
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Il·limitat"
                      value={scheduling.recurrence.endAfterOccurrences || ''}
                      onChange={(e) =>
                        updateScheduling({
                          recurrence: {
                            ...scheduling.recurrence,
                            endAfterOccurrences: e.target.value ? parseInt(e.target.value) : undefined
                          }
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">repeticions</p>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Vista previa del calendario */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Vista Prèvia del Calendari
            </h4>
            <ScheduleCalendar scheduling={scheduling} />
          </div>
        </div>
      )}
    </div>
  )
}

// Componente auxiliar para secciones colapsables
interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
  isEnabled?: boolean
  onToggleEnabled?: (enabled: boolean) => void
  badge?: string
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  icon,
  isExpanded,
  onToggle,
  isEnabled,
  onToggleEnabled,
  badge,
  children
}: CollapsibleSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-500">{icon}</div>
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onToggleEnabled !== undefined && (
            <label
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => onToggleEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-500">Actiu</span>
            </label>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">{children}</div>
      )}
    </div>
  )
}
