'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// Types
export type ViewType = 'diaria' | 'setmanal' | 'mensual' | 'anual'

export interface Esdeveniment {
  id: string
  date?: string  // ISO date string for filtering across views
  time: string
  title: string
  description?: string
  startTime?: string
  endTime?: string
  allDay?: boolean
  category?: string
  location?: string
  reminder?: string
  repeat?: string
  notification?: string
}

export interface Tasca {
  id: string
  text: string
  completed: boolean
}

export interface Goal {
  id: string
  text: string
  tasks: Tasca[]
}

export interface Habit {
  id: string
  emoji: string
  name: string
  days: boolean[]
}

export interface Reflexio {
  mood: string | null
  text: string
}

export interface AgendaModule {
  id: string
  moduleType: string
  isActive: boolean
  position: number
}

export interface AgendaConfig {
  hasCompletedSetup: boolean
  hasSeenWelcome: boolean
  showBaseModules: {
    events: boolean
    goals: boolean
    habits: boolean
    reflection: boolean
  }
}

// Format date to YYYY-MM-DD
const formatDateParam = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Helper to get date range based on view type
const getDateRangeForView = (date: Date, view: ViewType): { start: Date, end: Date } => {
  switch (view) {
    case 'diaria': {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    case 'setmanal': {
      // Week (Monday to Sunday) - using proper date arithmetic
      const dayOfWeek = date.getDay()
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const start = new Date(date.getTime() + daysToMonday * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
      end.setHours(23, 59, 59, 999)
      return { start, end }
    }
    case 'mensual': {
      // Full month
      const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
      return { start, end }
    }
    case 'anual': {
      // Full year
      const start = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0)
      const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999)
      return { start, end }
    }
    default:
      return { start: new Date(date), end: new Date(date) }
  }
}

export function useAgenda(currentDate: Date, currentView: ViewType = 'diaria') {
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Data states
  const [esdeveniments, setEsdeveniments] = useState<Esdeveniment[]>([])
  const [goal, setGoal] = useState<Goal | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [reflexio, setReflexio] = useState<Reflexio>({ mood: null, text: '' })
  const [modules, setModules] = useState<AgendaModule[]>([])
  const [config, setConfig] = useState<AgendaConfig | null>(null)
  
  // Error state
  const [error, setError] = useState<string | null>(null)

  const dateParam = formatDateParam(currentDate)

  // Inicializar agenda (crear datos ejemplo si es primera vez)
  const initAgenda = useCallback(async () => {
    try {
      const res = await fetch('/api/agenda/init')
      if (!res.ok) throw new Error('Error inicialitzant agenda')
      const data = await res.json()
      setConfig(data.config || null)
      setIsInitialized(true)
    } catch (err) {
      console.error('Error init agenda:', err)
      setError('Error inicialitzant agenda')
    }
  }, [])

  // Calculate date range based on view - use useMemo to avoid recreating objects
  const { rangeStart, rangeEnd, rangeKey } = useMemo(() => {
    const { start, end } = getDateRangeForView(currentDate, currentView)
    const key = `${formatDateParam(start)}-${formatDateParam(end)}-${currentView}`
    return { rangeStart: start, rangeEnd: end, rangeKey: key }
  }, [currentDate.getTime(), currentView])

  // Cargar eventos - uses range for non-daily views
  const loadEvents = useCallback(async () => {
    try {
      let res: Response
      if (currentView === 'diaria') {
        // For daily view, use simple date endpoint
        res = await fetch(`/api/agenda/events?date=${dateParam}`)
      } else {
        // For other views, use range endpoint
        const startStr = formatDateParam(rangeStart)
        const endStr = formatDateParam(rangeEnd)
        res = await fetch(`/api/agenda/events/range?start=${startStr}&end=${endStr}`)
      }
      if (!res.ok) throw new Error('Error carregant esdeveniments')
      const data = await res.json()
      // Asegurar que todas las fechas son strings ISO para el filtrado
      const formattedData = (data as any[]).map(event => ({
        ...event,
        date: typeof event.date === 'string' ? event.date : new Date(event.date).toISOString()
      }))
      setEsdeveniments(formattedData)
    } catch (err) {
      console.error('Error loading events:', err)
    }
  }, [dateParam, currentView, rangeStart, rangeEnd])

  // Cargar objetivo y tareas
  const loadGoal = useCallback(async () => {
    try {
      const res = await fetch(`/api/agenda/goals?date=${dateParam}`)
      if (!res.ok) throw new Error('Error carregant objectiu')
      const data = await res.json()
      setGoal(data)
    } catch (err) {
      console.error('Error loading goal:', err)
    }
  }, [dateParam])

  // Cargar hábitos
  const loadHabits = useCallback(async () => {
    try {
      const res = await fetch(`/api/agenda/habits?date=${dateParam}`)
      if (!res.ok) throw new Error('Error carregant hàbits')
      const apiHabits = await res.json()
      
      // Mapear hábitos de la API al formato del frontend
      const mappedHabits: Habit[] = apiHabits.map((apiHabit: any) => {
        // Calcular los 7 días de la semana actual
        const currentDate = new Date(dateParam)
        const currentDay = currentDate.getDay()
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1))
        
        const days = []
        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(startOfWeek)
          dayDate.setDate(startOfWeek.getDate() + i)
          const dayDateStr = dayDate.toISOString().split('T')[0]
          
          // Verificar si hay log para este día
          const hasLogForDay = apiHabit.logs?.some((log: any) => 
            log.date.split('T')[0] === dayDateStr && log.completed
          )
          days.push(hasLogForDay || false)
        }
        
        return {
          id: apiHabit.id,
          emoji: apiHabit.emoji,
          name: apiHabit.name,
          days
        }
      })
      
      setHabits(mappedHabits)
    } catch (err) {
      console.error('Error loading habits:', err)
    }
  }, [dateParam])

  // Cargar reflexión
  const loadReflection = useCallback(async () => {
    try {
      const res = await fetch(`/api/agenda/reflection?date=${dateParam}`)
      if (!res.ok) throw new Error('Error carregant reflexió')
      const data = await res.json()
      setReflexio(data)
    } catch (err) {
      console.error('Error loading reflection:', err)
    }
  }, [dateParam])

  // Cargar módulos
  const loadModules = useCallback(async () => {
    try {
      const res = await fetch('/api/agenda/modules')
      if (!res.ok) throw new Error('Error carregant mòduls')
      const data = await res.json()
      setModules(data)
    } catch (err) {
      console.error('Error loading modules:', err)
    }
  }, [])

  // Cargar todo
  const loadAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([
      loadEvents(),
      loadGoal(),
      loadHabits(),
      loadReflection(),
      loadModules()
    ])
    setIsLoading(false)
  }, [loadEvents, loadGoal, loadHabits, loadReflection, loadModules])

  // Inicializar y cargar al montar
  useEffect(() => {
    const init = async () => {
      await initAgenda()
      await loadAll()
    }
    init()
  }, []) // Solo al montar

  // Track del último rango cargado para evitar recargas innecesarias
  const [lastLoadedRange, setLastLoadedRange] = useState<string | null>(null)

  // Función para cargar eventos de una fecha específica (llamar manualmente)
  const loadEventsForDate = useCallback(async (date: Date) => {
    const dateStr = formatDateParam(date)
    setIsLoading(true)
    try {
      const res = await fetch(`/api/agenda/events?date=${dateStr}`)
      if (!res.ok) throw new Error('Error carregant esdeveniments')
      const data = await res.json()
      setEsdeveniments(data)
      setLastLoadedRange(dateStr)
    } catch (err) {
      console.error('Error loading events for date:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Recargar cuando cambia el rango (fecha o vista) SOLO si es diferente
  useEffect(() => {
    if (isInitialized && rangeKey !== lastLoadedRange) {
      loadAll()
      setLastLoadedRange(rangeKey)
    }
  }, [rangeKey, isInitialized, lastLoadedRange, loadAll])

  // Helper function to filter events by specific date
  const getEventsForDate = useCallback((date: Date): Esdeveniment[] => {
    const targetDate = formatDateParam(date)
    return esdeveniments.filter(event => {
      if (!event.date) return false
      const eventDate = event.date.split('T')[0]
      return eventDate === targetDate
    })
  }, [esdeveniments])

  // Helper function to check if a date has events
  const dateHasEvents = useCallback((date: Date): boolean => {
    return getEventsForDate(date).length > 0
  }, [getEventsForDate])

  // ==================== ACCIONES ====================

  // EVENTOS
  const addEvent = async (event: Omit<Esdeveniment, 'id'> & { date?: string }) => {
    try {
      // Usar la fecha del evento si existe, sino usar dateParam
      const eventDate = event.date || dateParam
      const res = await fetch('/api/agenda/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, date: eventDate })
      })
      if (!res.ok) throw new Error('Error creant esdeveniment')
      const newEvent = await res.json()
      // Asegurar que date es string ISO para el filtrado
      const formattedEvent = {
        ...newEvent,
        date: typeof newEvent.date === 'string' ? newEvent.date : new Date(newEvent.date).toISOString()
      }
      setEsdeveniments(prev => [...prev, formattedEvent].sort((a, b) => (a.time || '').localeCompare(b.time || '')))
      return formattedEvent
    } catch (err) {
      console.error('Error adding event:', err)
      throw err
    }
  }

  const updateEvent = async (id: string, updates: Partial<Esdeveniment>) => {
    try {
      const res = await fetch(`/api/agenda/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('API error:', errorData)
        throw new Error('Error actualitzant esdeveniment')
      }
      const updatedEvent = await res.json()
      // Update local state with the response from server
      setEsdeveniments(prev => prev.map(e => e.id === id ? { ...e, ...updatedEvent } : e))
      return updatedEvent
    } catch (err) {
      console.error('Error updating event:', err)
      throw err
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/agenda/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error eliminant esdeveniment')
      setEsdeveniments(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error('Error deleting event:', err)
      throw err
    }
  }

  // OBJETIVO
  const updateGoalText = async (text: string) => {
    try {
      const res = await fetch('/api/agenda/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateParam, text })
      })
      if (!res.ok) throw new Error('Error actualitzant objectiu')
      const updatedGoal = await res.json()
      setGoal(prev => prev ? { ...prev, text: updatedGoal.text } : null)
    } catch (err) {
      console.error('Error updating goal:', err)
      throw err
    }
  }

  // TAREAS
  const addTask = async (text: string) => {
    if (!goal) return
    try {
      const res = await fetch('/api/agenda/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: goal.id, text })
      })
      if (!res.ok) throw new Error('Error creant tasca')
      const newTask = await res.json()
      setGoal(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : null)
      return newTask
    } catch (err) {
      console.error('Error adding task:', err)
      throw err
    }
  }

  const toggleTask = async (taskId: string) => {
    const task = goal?.tasks.find(t => t.id === taskId)
    if (!task) return
    try {
      const res = await fetch(`/api/agenda/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      })
      if (!res.ok) throw new Error('Error actualitzant tasca')
      setGoal(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
      } : null)
    } catch (err) {
      console.error('Error toggling task:', err)
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/agenda/tasks/${taskId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error eliminant tasca')
      setGoal(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) } : null)
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }

  // HÁBITOS
  const addHabit = async (emoji: string, name: string) => {
    try {
      const res = await fetch('/api/agenda/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, name })
      })
      if (!res.ok) throw new Error('Error creant hàbit')
      const apiHabit = await res.json()
      
      // Mapear el hábito de la API al formato esperado por el frontend
      const newHabit: Habit = {
        id: apiHabit.id,
        emoji: apiHabit.emoji,
        name: apiHabit.name,
        days: [false, false, false, false, false, false, false] // Inicializar array vacío para los 7 días
      }
      
      setHabits(prev => [...prev, newHabit])
      return newHabit
    } catch (err) {
      console.error('Error adding habit:', err)
      throw err
    }
  }

  const updateHabit = async (habitId: string, emoji: string, name: string) => {
    try {
      const res = await fetch(`/api/agenda/habits/${habitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, name })
      })
      if (!res.ok) throw new Error('Error actualitzant hàbit')
      
      // Actualizar en el estado local
      setHabits(prev => prev.map(h => 
        h.id === habitId ? { ...h, emoji, name } : h
      ))
    } catch (err) {
      console.error('Error updating habit:', err)
      throw err
    }
  }

  const toggleHabitDay = async (habitId: string, dayIndex: number) => {
    // Calcular la fecha del día específico
    const targetDate = new Date(currentDate)
    const currentDay = targetDate.getDay()
    const currentDayIndex = currentDay === 0 ? 6 : currentDay - 1
    const diff = dayIndex - currentDayIndex
    targetDate.setDate(targetDate.getDate() + diff)
    
    try {
      const res = await fetch(`/api/agenda/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formatDateParam(targetDate) })
      })
      if (!res.ok) throw new Error('Error actualitzant hàbit')
      const { completed } = await res.json()
      
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          const newDays = [...h.days]
          newDays[dayIndex] = completed
          return { ...h, days: newDays }
        }
        return h
      }))
    } catch (err) {
      console.error('Error toggling habit:', err)
      throw err
    }
  }

  const deleteHabit = async (habitId: string) => {
    try {
      const res = await fetch(`/api/agenda/habits/${habitId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error eliminant hàbit')
      setHabits(prev => prev.filter(h => h.id !== habitId))
    } catch (err) {
      console.error('Error deleting habit:', err)
      throw err
    }
  }

  // REFLEXIÓN
  const saveReflection = async (mood: string | null, text: string) => {
    try {
      const res = await fetch('/api/agenda/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateParam, mood, text })
      })
      if (!res.ok) throw new Error('Error guardant reflexió')
      setReflexio({ mood, text })
    } catch (err) {
      console.error('Error saving reflection:', err)
      throw err
    }
  }

  // MÓDULOS
  const toggleModule = async (moduleType: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/agenda/modules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleType, isActive })
      })
      if (!res.ok) throw new Error('Error actualitzant mòdul')
      const updated = await res.json()
      setModules(prev => {
        const existing = prev.find(m => m.moduleType === moduleType)
        if (existing) {
          return prev.map(m => m.moduleType === moduleType ? { ...m, isActive } : m)
        }
        return [...prev, updated]
      })
    } catch (err) {
      console.error('Error toggling module:', err)
      throw err
    }
  }

  // Marcar welcome como visto
  const dismissWelcome = async () => {
    try {
      await fetch('/api/agenda/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasSeenWelcome: true })
      })
      setConfig(prev => prev ? { ...prev, hasSeenWelcome: true } : null)
    } catch (err) {
      console.error('Error dismissing welcome:', err)
    }
  }

  return {
    // Estados
    isLoading,
    error,
    config,
    esdeveniments,
    goal,
    habits,
    reflexio,
    modules,

    // Acciones eventos
    addEvent,
    updateEvent,
    deleteEvent,

    // Acciones objetivo/tareas
    updateGoalText,
    addTask,
    toggleTask,
    deleteTask,

    // Acciones hábitos
    addHabit,
    updateHabit,
    toggleHabitDay,
    deleteHabit,

    // Acciones reflexión
    saveReflection,

    // Acciones módulos
    toggleModule,

    // Carga de datos
    loadEventsForDate,

    // Helpers para filtrar eventos por fecha (para vistas semanal/mensual/anual)
    getEventsForDate,
    dateHasEvents,

    // Acciones config
    dismissWelcome,

    // Utilidades
    reload: loadAll
  }
}