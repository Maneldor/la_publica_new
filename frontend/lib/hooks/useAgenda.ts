'use client'

import { useState, useEffect, useCallback } from 'react'

// Types
export interface Esdeveniment {
  id: string
  time: string
  title: string
  description?: string
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

export function useAgenda(currentDate: Date) {
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

  // Cargar eventos
  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/agenda/events?date=${dateParam}`)
      if (!res.ok) throw new Error('Error carregant esdeveniments')
      const data = await res.json()
      setEsdeveniments(data)
    } catch (err) {
      console.error('Error loading events:', err)
    }
  }, [dateParam])

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

  // Recargar cuando cambia la fecha
  useEffect(() => {
    if (isInitialized) {
      loadAll()
    }
  }, [dateParam, isInitialized])

  // ==================== ACCIONES ====================

  // EVENTOS
  const addEvent = async (event: Omit<Esdeveniment, 'id'>) => {
    try {
      const res = await fetch('/api/agenda/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, date: dateParam })
      })
      if (!res.ok) throw new Error('Error creant esdeveniment')
      const newEvent = await res.json()
      setEsdeveniments(prev => [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time)))
      return newEvent
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
      if (!res.ok) throw new Error('Error actualitzant esdeveniment')
      setEsdeveniments(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
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
    
    // Acciones config
    dismissWelcome,
    
    // Utilidades
    reload: loadAll
  }
}