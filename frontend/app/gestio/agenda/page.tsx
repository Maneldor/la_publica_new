'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { ca } from 'date-fns/locale'
import { AgendaViewSelector, type CalendarView } from '@/components/gestio-empreses/agenda/AgendaViewSelector'
import { AgendaDayView } from '@/components/gestio-empreses/agenda/AgendaDayView'
import { WeekView } from '@/components/gestio-empreses/agenda/WeekView'
import { AgendaMonthView } from '@/components/gestio-empreses/agenda/AgendaMonthView'
import { AgendaQuarterView } from '@/components/gestio-empreses/agenda/AgendaQuarterView'
import { AgendaSemesterView } from '@/components/gestio-empreses/agenda/AgendaSemesterView'
import { AgendaYearView } from '@/components/gestio-empreses/agenda/AgendaYearView'
import { ContactsSidebar } from '@/components/gestio-empreses/agenda/ContactsSidebar'
import { EventModal } from '@/components/gestio-empreses/agenda/EventModal'
import { getCalendarEvents, getEventStats } from '@/lib/gestio-empreses/calendar-actions'
import type { Contact } from '@/lib/gestio-empreses/contacts-actions'

export default function AgendaPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<CalendarView>('week')
  const [events, setEvents] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [editingEvent, setEditingEvent] = useState<any>(null)

  const currentUserId = session?.user?.id || ''

  // Carregar esdeveniments
  useEffect(() => {
    const loadData = async () => {
      if (!currentUserId) return
      setIsLoading(true)
      try {
        const [eventsData, statsData] = await Promise.all([
          getCalendarEvents(currentUserId),
          getEventStats(currentUserId)
        ])
        setEvents(eventsData)
        setStats(statsData)
      } catch (error) {
        console.error('Error carregant agenda:', error)
      }
      setIsLoading(false)
    }

    loadData()
  }, [currentUserId])

  const handleRefresh = async () => {
    if (!currentUserId) return
    const [eventsData, statsData] = await Promise.all([
      getCalendarEvents(currentUserId),
      getEventStats(currentUserId)
    ])
    setEvents(eventsData)
    setStats(statsData)
  }

  // Navegació
  const goToToday = () => setCurrentDate(new Date())

  const goToPrevious = () => {
    switch (currentView) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1))
        break
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case 'month':
        setCurrentDate(subMonths(currentDate, 1))
        break
      case 'quarter':
        setCurrentDate(subQuarters(currentDate, 1))
        break
      case 'semester':
        setCurrentDate(subMonths(currentDate, 6))
        break
      case 'year':
        setCurrentDate(subYears(currentDate, 1))
        break
    }
  }

  const goToNext = () => {
    switch (currentView) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1))
        break
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case 'month':
        setCurrentDate(addMonths(currentDate, 1))
        break
      case 'quarter':
        setCurrentDate(addQuarters(currentDate, 1))
        break
      case 'semester':
        setCurrentDate(addMonths(currentDate, 6))
        break
      case 'year':
        setCurrentDate(addYears(currentDate, 1))
        break
    }
  }

  const getDateRangeLabel = () => {
    switch (currentView) {
      case 'day':
        return format(currentDate, "d MMMM yyyy", { locale: ca })
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        return `${format(weekStart, 'd MMM', { locale: ca })} - ${format(weekEnd, 'd MMM yyyy', { locale: ca })}`
      case 'month':
        return format(currentDate, "MMMM yyyy", { locale: ca })
      case 'quarter':
        return `T${Math.ceil((currentDate.getMonth() + 1) / 3)} ${format(currentDate, 'yyyy')}`
      case 'semester':
        const sem = currentDate.getMonth() < 6 ? 1 : 2
        return `S${sem} ${format(currentDate, 'yyyy')}`
      case 'year':
        return format(currentDate, 'yyyy')
    }
  }

  // Handlers
  const handleDayClick = (date: Date) => {
    if (currentView !== 'day') {
      setCurrentDate(date)
      setCurrentView('day')
    }
  }

  const handleMonthClick = (date: Date) => {
    setCurrentDate(date)
    setCurrentView('month')
  }

  const handleSlotClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedContact(null)
    setEditingEvent(null)
    setShowEventModal(true)
  }

  const handleEventClick = (event: any) => {
    setEditingEvent(event)
    setSelectedDate(null)
    setSelectedContact(null)
    setShowEventModal(true)
  }

  const handleCreateEventFromContact = (contact: Contact) => {
    setSelectedContact(contact)
    setSelectedDate(new Date())
    setEditingEvent(null)
    setShowEventModal(true)
  }

  if (!session) {
    return <div>Carregant...</div>
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
            <h1 className="text-xl font-semibold text-slate-900">Agenda</h1>
          </div>
          <button
            onClick={() => {
              setSelectedDate(new Date())
              setSelectedContact(null)
              setEditingEvent(null)
              setShowEventModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nou esdeveniment
          </button>
        </div>

        <div className="flex items-center justify-between">
          {/* Navegació */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevious}
                className="p-2 hover:bg-slate-100 rounded-md transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
              </button>
              <button
                onClick={goToNext}
                className="p-2 hover:bg-slate-100 rounded-md transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
              </button>
            </div>
            <h2 className="text-lg font-medium text-slate-900 min-w-[200px]">
              {getDateRangeLabel()}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Avui
            </button>
          </div>

          {/* Selector de vista */}
          <AgendaViewSelector
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>
      </div>

      {/* Estadístiques */}
      {stats && (
        <div className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{stats.today || 0}</p>
                <p className="text-xs text-slate-500">Avui</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{stats.thisWeek || 0}</p>
                <p className="text-xs text-slate-500">Aquesta setmana</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{stats.thisMonth || 0}</p>
                <p className="text-xs text-slate-500">Aquest mes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contingut principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendari */}
        <div className="flex-1 bg-white overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">Carregant...</p>
            </div>
          ) : (
            <>
              {currentView === 'day' && (
                <AgendaDayView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onSlotClick={handleSlotClick}
                />
              )}
              {currentView === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onDateChange={(start, end) => setCurrentDate(start)}
                />
              )}
              {currentView === 'month' && (
                <AgendaMonthView
                  currentDate={currentDate}
                  events={events}
                  onDayClick={handleDayClick}
                  onEventClick={handleEventClick}
                />
              )}
              {currentView === 'quarter' && (
                <AgendaQuarterView
                  currentDate={currentDate}
                  events={events}
                  onDayClick={handleDayClick}
                  onMonthClick={handleMonthClick}
                />
              )}
              {currentView === 'semester' && (
                <AgendaSemesterView
                  currentDate={currentDate}
                  events={events}
                  onDayClick={handleDayClick}
                  onMonthClick={handleMonthClick}
                />
              )}
              {currentView === 'year' && (
                <AgendaYearView
                  currentDate={currentDate}
                  events={events}
                  onDayClick={handleDayClick}
                  onMonthClick={handleMonthClick}
                />
              )}
            </>
          )}
        </div>

        {/* Sidebar de contactes */}
        <ContactsSidebar
          userId={currentUserId}
          onCreateEvent={handleCreateEventFromContact}
        />
      </div>

      {/* Modal d'esdeveniment */}
      {showEventModal && (
        <EventModal
          event={editingEvent}
          initialDate={selectedDate}
          initialContact={selectedContact}
          onClose={() => {
            setShowEventModal(false)
            setEditingEvent(null)
            setSelectedDate(null)
            setSelectedContact(null)
          }}
          onSave={() => {
            setShowEventModal(false)
            setEditingEvent(null)
            setSelectedDate(null)
            setSelectedContact(null)
            handleRefresh()
          }}
        />
      )}
    </div>
  )
}