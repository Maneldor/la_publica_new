import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  getDay,
  isAfter,
  parseISO,
  isToday as dateFnsIsToday,
  isTomorrow as dateFnsIsTomorrow,
} from 'date-fns'
import { ca } from 'date-fns/locale'

// Configuración para semanas que empiezan en lunes
const weekOptions = { weekStartsOn: 1 as const, locale: ca }

/**
 * Obtiene los días de la semana para una fecha dada
 */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, weekOptions)
  const end = endOfWeek(date, weekOptions)
  return eachDayOfInterval({ start, end })
}

/**
 * Obtiene todas las semanas de un mes para mostrar en un calendario
 */
export function getMonthCalendarDays(date: Date): Date[][] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, weekOptions)
  const calendarEnd = endOfWeek(monthEnd, weekOptions)

  const weeks = eachWeekOfInterval({ start: calendarStart, end: calendarEnd }, weekOptions)

  return weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart, weekOptions)
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  })
}

/**
 * Obtiene los 12 meses del año para una fecha dada
 */
export function getYearMonths(date: Date): Date[] {
  const yearStart = startOfYear(date)
  const yearEnd = endOfYear(date)
  return eachMonthOfInterval({ start: yearStart, end: yearEnd })
}

/**
 * Formatea una fecha para mostrar el rango de la semana
 */
export function formatWeekRange(date: Date): string {
  const start = startOfWeek(date, weekOptions)
  const end = endOfWeek(date, weekOptions)

  if (start.getMonth() === end.getMonth()) {
    return `${format(start, 'd', { locale: ca })} - ${format(end, 'd MMMM yyyy', { locale: ca })}`
  }

  return `${format(start, 'd MMM', { locale: ca })} - ${format(end, 'd MMM yyyy', { locale: ca })}`
}

/**
 * Formatea una fecha para mostrar el mes y año
 */
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: ca })
}

/**
 * Formatea una fecha para mostrar solo el año
 */
export function formatYear(date: Date): string {
  return format(date, 'yyyy', { locale: ca })
}

/**
 * Formatea una fecha para mostrar el día de la semana abreviado
 */
export function formatWeekdayShort(date: Date): string {
  return format(date, 'EEE', { locale: ca })
}

/**
 * Formatea una fecha para mostrar el día del mes
 */
export function formatDayOfMonth(date: Date): string {
  return format(date, 'd', { locale: ca })
}

/**
 * Formatea una fecha para mostrar el nombre del mes abreviado
 */
export function formatMonthShort(date: Date): string {
  return format(date, 'MMM', { locale: ca })
}

/**
 * Formatea una fecha para mostrar el nombre del mes completo
 */
export function formatMonthLong(date: Date): string {
  return format(date, 'MMMM', { locale: ca })
}

/**
 * Nombres de los días de la semana en catalán (empezando por lunes)
 */
export const WEEKDAY_NAMES = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']

/**
 * Nombres de los días de la semana completos en catalán
 */
export const WEEKDAY_NAMES_FULL = [
  'Dilluns',
  'Dimarts',
  'Dimecres',
  'Dijous',
  'Divendres',
  'Dissabte',
  'Diumenge',
]

/**
 * Comprueba si dos fechas son el mismo día
 */
export function areSameDay(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2)
}

/**
 * Comprueba si una fecha está en el mes actual
 */
export function isInCurrentMonth(date: Date, currentMonth: Date): boolean {
  return isSameMonth(date, currentMonth)
}

/**
 * Comprueba si una fecha es hoy
 */
export function isToday(date: Date): boolean {
  return dateFnsIsToday(date)
}

/**
 * Obtiene el índice del día de la semana (0 = lunes, 6 = domingo)
 */
export function getWeekdayIndex(date: Date): number {
  const day = getDay(date)
  // Convertir de domingo=0 a lunes=0
  return day === 0 ? 6 : day - 1
}

// ==================== FUNCIONES PARA RECORDATORIS ====================

/**
 * Convierte cualquier formato de fecha a objeto Date
 */
export function toDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null
  if (date instanceof Date) return date

  try {
    if (typeof date === 'string') {
      // Intentar parsear como ISO
      const parsed = parseISO(date)
      if (!isNaN(parsed.getTime())) return parsed

      // Intentar como Date string
      const dateObj = new Date(date)
      if (!isNaN(dateObj.getTime())) return dateObj
    }
    return null
  } catch {
    return null
  }
}

/**
 * Comprueba si un evento es FUTURO (aún no ha pasado)
 * Tiene en cuenta tanto la fecha como la hora del evento
 */
export function isEventFuture(event: { date: string | Date; time?: string; startTime?: string }): boolean {
  const now = new Date()
  const eventDate = toDate(event.date)

  if (!eventDate) return false

  // Si el evento es de un día futuro, es futuro
  if (isAfter(startOfDay(eventDate), startOfDay(now))) {
    return true
  }

  // Si es hoy, comprobar la hora
  if (isSameDay(eventDate, now)) {
    const eventTime = event.startTime || event.time
    if (eventTime) {
      const [hours, minutes] = eventTime.split(':').map(Number)
      const eventDateTime = new Date(eventDate)
      eventDateTime.setHours(hours, minutes, 0, 0)
      return isAfter(eventDateTime, now)
    }
    // Si no tiene hora, consideramos que es todo el día y aún es válido
    return true
  }

  // Es del pasado
  return false
}

/**
 * Retorna la etiqueta del día (Avui, Demà, Dilluns 6, etc.)
 */
export function getDayLabel(date: string | Date): string {
  const eventDate = toDate(date)
  if (!eventDate) return 'Data desconeguda'

  const today = new Date()

  if (isSameDay(eventDate, today)) {
    return 'Avui'
  }

  if (isSameDay(eventDate, addDays(today, 1))) {
    return 'Demà'
  }

  // Formato: "Dissabte 3" o "Dilluns 6"
  return format(eventDate, "EEEE d", { locale: ca })
}

/**
 * Retorna la clave de fecha para agrupar (yyyy-MM-dd)
 */
export function getDateKey(date: string | Date): string {
  const eventDate = toDate(date)
  if (!eventDate) return 'unknown'
  return format(eventDate, 'yyyy-MM-dd')
}

/**
 * Comprueba si una fecha es mañana
 */
export function isTomorrow(date: Date): boolean {
  return dateFnsIsTomorrow(date)
}

// Re-exportar funciones de navegación de date-fns
export {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
}
