'use client'

import { useMemo, useState } from 'react'
import {
  AdvancedScheduling,
  DayOfWeek,
  PERIOD_CONFIG,
  WEEKDAYS_CONFIG
} from '@/lib/types/featuredAds'
import { ChevronLeft, ChevronRight, Clock, Check, X } from 'lucide-react'

interface ScheduleCalendarProps {
  scheduling: AdvancedScheduling
}

const WEEKDAY_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]

export function ScheduleCalendar({ scheduling }: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const start = new Date(scheduling.startsAt)
    return new Date(start.getFullYear(), start.getMonth(), 1)
  })

  // Calcular los días del mes actual
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    // Ajustar para que la semana empiece en lunes
    let startDay = firstDayOfMonth.getDay() - 1
    if (startDay < 0) startDay = 6

    const days: { date: Date; isCurrentMonth: boolean }[] = []

    // Días del mes anterior
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false })
    }

    // Días del mes actual
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }

    // Días del mes siguiente para completar la cuadrícula
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }

    return days
  }, [currentMonth])

  // Determinar si un día está activo según la programación
  const isDayActive = (date: Date): { active: boolean; partial: boolean; reasons: string[] } => {
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = WEEKDAY_ORDER[date.getDay() === 0 ? 6 : date.getDay() - 1]
    const reasons: string[] = []

    // Verificar fechas básicas
    const startDate = new Date(scheduling.startsAt)
    startDate.setHours(0, 0, 0, 0)

    let endDate: Date
    if (scheduling.endsAt) {
      endDate = new Date(scheduling.endsAt)
    } else if (scheduling.period !== 'custom') {
      endDate = new Date(startDate.getTime() + PERIOD_CONFIG[scheduling.period].days * 24 * 60 * 60 * 1000)
    } else {
      endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) // Default 30 días
    }
    endDate.setHours(23, 59, 59, 999)

    const dateCheck = new Date(date)
    dateCheck.setHours(12, 0, 0, 0)

    // Verificar si está en el rango de fechas
    const inDateRange = dateCheck >= startDate && dateCheck <= endDate

    if (!inDateRange) {
      // Verificar campañas múltiples
      if (scheduling.campaigns.enabled && scheduling.campaigns.periods.length > 0) {
        const inCampaign = scheduling.campaigns.periods.some(period => {
          if (!period.isActive) return false
          const campStart = new Date(period.startDate)
          const campEnd = new Date(period.endDate)
          campStart.setHours(0, 0, 0, 0)
          campEnd.setHours(23, 59, 59, 999)
          return dateCheck >= campStart && dateCheck <= campEnd
        })
        if (!inCampaign) {
          return { active: false, partial: false, reasons: ['Fora del període'] }
        }
        reasons.push('Campanya activa')
      } else {
        return { active: false, partial: false, reasons: ['Fora del període'] }
      }
    }

    // Verificar días de la semana
    if (scheduling.weekDays.enabled) {
      if (!scheduling.weekDays.days.includes(dayOfWeek)) {
        return { active: false, partial: false, reasons: ['Dia no actiu'] }
      }
      reasons.push(WEEKDAYS_CONFIG[dayOfWeek].label)
    }

    // Si hay franjas horarias, es parcialmente activo
    const hasTimeSlots = scheduling.timeSlots.enabled && scheduling.timeSlots.slots.length > 0
    if (hasTimeSlots) {
      const slots = scheduling.timeSlots.slots.map(s => `${s.startTime}-${s.endTime}`).join(', ')
      reasons.push(`Horaris: ${slots}`)
    }

    return {
      active: true,
      partial: hasTimeSlots,
      reasons
    }
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const monthName = currentMonth.toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })

  // Estadísticas del mes
  const monthStats = useMemo(() => {
    const stats = { active: 0, partial: 0, inactive: 0 }
    calendarDays
      .filter(d => d.isCurrentMonth)
      .forEach(d => {
        const status = isDayActive(d.date)
        if (status.active) {
          if (status.partial) stats.partial++
          else stats.active++
        } else {
          stats.inactive++
        }
      })
    return stats
  }, [calendarDays, scheduling])

  return (
    <div className="select-none">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-medium text-gray-900 capitalize ml-2">{monthName}</span>
        </div>
        <button
          type="button"
          onClick={goToToday}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Avui
        </button>
      </div>

      {/* Cabecera de días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_ORDER.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {WEEKDAYS_CONFIG[day].shortLabel}
          </div>
        ))}
      </div>

      {/* Cuadrícula de días */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const status = isDayActive(day.date)
          const isToday = day.date.toDateString() === new Date().toDateString()
          const isStartDate = day.date.toISOString().split('T')[0] === scheduling.startsAt

          return (
            <div
              key={index}
              className={`
                relative aspect-square flex items-center justify-center text-sm rounded-lg
                transition-colors cursor-default group
                ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                ${day.isCurrentMonth && status.active && !status.partial ? 'bg-green-100 text-green-800' : ''}
                ${day.isCurrentMonth && status.active && status.partial ? 'bg-amber-100 text-amber-800' : ''}
                ${day.isCurrentMonth && !status.active ? 'bg-gray-50 text-gray-400' : ''}
                ${isToday ? 'ring-2 ring-purple-500 ring-offset-1' : ''}
                ${isStartDate ? 'ring-2 ring-blue-500' : ''}
              `}
            >
              <span className={isToday ? 'font-bold' : ''}>{day.date.getDate()}</span>

              {/* Indicadores */}
              {day.isCurrentMonth && status.active && status.partial && (
                <Clock className="absolute bottom-0.5 right-0.5 w-3 h-3 text-amber-600" />
              )}

              {/* Tooltip */}
              {day.isCurrentMonth && status.reasons.length > 0 && (
                <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    {status.active ? (
                      <div className="flex items-center gap-1 text-green-400 mb-1">
                        <Check className="w-3 h-3" />
                        Actiu
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400 mb-1">
                        <X className="w-3 h-3" />
                        Inactiu
                      </div>
                    )}
                    {status.reasons.map((reason, i) => (
                      <div key={i} className="text-gray-300">{reason}</div>
                    ))}
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Leyenda y estadísticas */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span>Actiu ({monthStats.active})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span>Parcial ({monthStats.partial})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
            <span>Inactiu ({monthStats.inactive})</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded ring-2 ring-purple-500" />
          <span>Avui</span>
        </div>
      </div>

      {/* Resumen de la programación */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-xs font-medium text-gray-700 mb-2">Resum de la Programació</h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>
            <span className="font-medium">Inici:</span>{' '}
            {new Date(scheduling.startsAt).toLocaleDateString('ca-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </li>
          {scheduling.endsAt && (
            <li>
              <span className="font-medium">Fi:</span>{' '}
              {new Date(scheduling.endsAt).toLocaleDateString('ca-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </li>
          )}
          {scheduling.weekDays.enabled && (
            <li>
              <span className="font-medium">Dies:</span>{' '}
              {scheduling.weekDays.days.map(d => WEEKDAYS_CONFIG[d].shortLabel).join(', ')}
            </li>
          )}
          {scheduling.timeSlots.enabled && scheduling.timeSlots.slots.length > 0 && (
            <li>
              <span className="font-medium">Horaris:</span>{' '}
              {scheduling.timeSlots.slots.map(s => `${s.startTime}-${s.endTime}`).join(', ')}
            </li>
          )}
          {scheduling.campaigns.enabled && scheduling.campaigns.periods.length > 0 && (
            <li>
              <span className="font-medium">Campanyes:</span>{' '}
              {scheduling.campaigns.periods.filter(p => p.isActive).length} períodes actius
            </li>
          )}
          {scheduling.recurrence.type !== 'none' && (
            <li>
              <span className="font-medium">Recurrència:</span>{' '}
              Cada {scheduling.recurrence.interval}{' '}
              {scheduling.recurrence.type === 'daily' && 'dies'}
              {scheduling.recurrence.type === 'weekly' && 'setmanes'}
              {scheduling.recurrence.type === 'monthly' && 'mesos'}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
