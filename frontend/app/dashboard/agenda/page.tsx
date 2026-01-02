'use client'

import { useState, useEffect } from 'react'
import { format, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears } from 'date-fns'
import { ca } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { WelcomeBanner } from './components/WelcomeBanner'
import { DailyView } from './components/views/DailyView'
import { WeeklyView } from './components/views/WeeklyView'
import { MonthlyView } from './components/views/MonthlyView'
import { YearlyView } from './components/views/YearlyView'
import { EventModal } from './components/EventModal'
import { DayPopup } from './components/DayPopup'

import type { AgendaEvent } from '@/lib/constants/agenda'

type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export default function AgendaPage() {
  // Estats simples i directes
  const [events, setEvents] = useState<AgendaEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewType>('weekly')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Modals
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDayPopup, setShowDayPopup] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)

  // Carregar esdeveniments - SIMPLE I DIRECTE
  const loadEvents = async () => {
    try {
      const response = await fetch('/api/agenda/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('[Agenda] Error carregant:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar al muntar
  useEffect(() => {
    loadEvents()
  }, [])

  // Crear esdeveniment
  const handleCreateEvent = async (eventData: Partial<AgendaEvent>) => {
    try {
      const response = await fetch('/api/agenda/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })
      if (response.ok) {
        const newEvent = await response.json()
        setEvents(prev => [...prev, newEvent])
        setShowEventModal(false)
        setSelectedDate(null)
      }
    } catch (error) {
      console.error('[Agenda] Error creant:', error)
    }
  }

  // Actualitzar esdeveniment
  const handleUpdateEvent = async (eventId: string, eventData: Partial<AgendaEvent>) => {
    try {
      const response = await fetch(`/api/agenda/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })
      if (response.ok) {
        const updatedEvent = await response.json()
        setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e))
        setShowEventModal(false)
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('[Agenda] Error actualitzant:', error)
    }
  }

  // Eliminar esdeveniment
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/agenda/events/${eventId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setEvents(prev => prev.filter(e => e.id !== eventId))
        setShowEventModal(false)
        setSelectedEvent(null)
      }
    } catch (error) {
      console.error('[Agenda] Error eliminant:', error)
    }
  }

  // Navegació
  const navigatePrev = () => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'daily': return subDays(prev, 1)
        case 'weekly': return subWeeks(prev, 1)
        case 'monthly': return subMonths(prev, 1)
        case 'yearly': return subYears(prev, 1)
      }
    })
  }

  const navigateNext = () => {
    setCurrentDate(prev => {
      switch (currentView) {
        case 'daily': return addDays(prev, 1)
        case 'weekly': return addWeeks(prev, 1)
        case 'monthly': return addMonths(prev, 1)
        case 'yearly': return addYears(prev, 1)
      }
    })
  }

  const goToToday = () => setCurrentDate(new Date())

  // Títol segons vista
  const getTitle = () => {
    switch (currentView) {
      case 'daily':
        return format(currentDate, "EEEE, d MMMM yyyy", { locale: ca })
      case 'weekly':
        return format(currentDate, "'Setmana del' d MMMM", { locale: ca })
      case 'monthly':
        return format(currentDate, "MMMM yyyy", { locale: ca })
      case 'yearly':
        return format(currentDate, "yyyy")
    }
  }

  // Clicar en un dia
  const handleDayClick = (date: Date, e?: React.MouseEvent) => {
    const dayEvents = events.filter(ev =>
      format(new Date(ev.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )

    if (dayEvents.length === 0) {
      // Si no hi ha esdeveniments, obrir modal de creació
      setSelectedDate(date)
      setSelectedEvent(null)
      setShowEventModal(true)
    } else {
      // Si hi ha esdeveniments, mostrar popup
      setSelectedDate(date)
      if (e) {
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        setPopupPosition({ x: rect.left, y: rect.bottom + 8 })
      }
      setShowDayPopup(true)
    }
  }

  // Clicar en un esdeveniment
  const handleEventClick = (event: AgendaEvent) => {
    setSelectedEvent(event)
    setSelectedDate(new Date(event.date))
    setShowDayPopup(false)
    setShowEventModal(true)
  }

  // Afegir des del popup
  const handleAddFromPopup = () => {
    setShowDayPopup(false)
    setSelectedEvent(null)
    setShowEventModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">La Meva Agenda</h1>
          <p className="text-muted-foreground">Organitza el teu dia de manera eficient</p>
        </div>
      </div>

      {/* Frase del dia */}
      <WelcomeBanner />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tabs de vista */}
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as ViewType)}>
          <TabsList>
            <TabsTrigger value="daily">Diària</TabsTrigger>
            <TabsTrigger value="weekly">Setmanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
            <TabsTrigger value="yearly">Anual</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Navegació */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Avui
          </Button>
          <Button variant="outline" size="icon" onClick={navigatePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="min-w-[200px] text-center font-medium capitalize">
            {getTitle()}
          </span>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Botó afegir */}
        <Button onClick={() => { setSelectedDate(new Date()); setSelectedEvent(null); setShowEventModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nou esdeveniment
        </Button>
      </div>

      {/* Contingut de la vista */}
      <div className="bg-white rounded-xl border shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {currentView === 'daily' && (
              <DailyView
                date={currentDate}
                events={events}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
              />
            )}
            {currentView === 'weekly' && (
              <WeeklyView
                date={currentDate}
                events={events}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
              />
            )}
            {currentView === 'monthly' && (
              <MonthlyView
                date={currentDate}
                events={events}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
              />
            )}
            {currentView === 'yearly' && (
              <YearlyView
                date={currentDate}
                events={events}
                onDayClick={handleDayClick}
              />
            )}
          </>
        )}
      </div>

      {/* Modal crear/editar */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => { setShowEventModal(false); setSelectedEvent(null); setSelectedDate(null) }}
          onSave={selectedEvent ? (data) => handleUpdateEvent(selectedEvent.id, data) : handleCreateEvent}
          onDelete={selectedEvent ? () => handleDeleteEvent(selectedEvent.id) : undefined}
          event={selectedEvent}
          defaultDate={selectedDate || new Date()}
        />
      )}

      {/* Popup del dia */}
      {showDayPopup && selectedDate && (
        <DayPopup
          date={selectedDate}
          events={events.filter(e =>
            format(new Date(e.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
          )}
          position={popupPosition}
          onClose={() => setShowDayPopup(false)}
          onEventClick={handleEventClick}
          onAddEvent={handleAddFromPopup}
        />
      )}
    </div>
  )
}
