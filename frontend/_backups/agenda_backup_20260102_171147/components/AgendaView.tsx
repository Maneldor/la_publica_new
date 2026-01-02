'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  Trash2,
  Edit2,
  Edit3,
  Package,
  Users,
  MapPin,
  Tag,
  Bell,
  Repeat,
} from 'lucide-react'
import {
  CalendarDaysIcon,
  TargetIcon,
  HabitsIcon,
  ReflectionIcon,
  SparklesIcon,
  ModulesIcon,
  ClockIcon,
  TrophyIcon,
  GratitudeIcon,
  ConclusionsIcon,
  ReadingIcon,
  TravelIcon,
  TriangleIcon,
  TimeCapsuleIcon,
  VisualizationIcon,
  PrivateIcon,
  IconWrapper,
} from '@/components/icons'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY, BUTTONS } from '@/lib/design-system'
import {
  getWeekDays,
  getMonthCalendarDays,
  getYearMonths,
  formatWeekRange,
  formatMonthYear,
  formatYear,
  formatWeekdayShort,
  formatDayOfMonth,
  formatMonthShort,
  formatMonthLong,
  WEEKDAY_NAMES,
  WEEKDAY_NAMES_FULL,
  areSameDay,
  isInCurrentMonth,
  isToday as isDateToday,
} from '@/lib/utils/calendar'

import { useAgenda, Esdeveniment, ViewType } from '@/lib/hooks/useAgenda'
import { EVENT_CATEGORIES, getCategoryStyles } from '@/lib/constants/agenda'
import { WelcomeBanner } from './WelcomeBanner'
import { ConfigModal } from './ConfigModal'
import {
  DesafiamentModule,
  AgraïmentsModule,
  ConclusionsModule,
  LecturesModule,
  ViatgesModule,
  TrianglesModule,
  CapsulaModule,
  VisualitzacionsModule,
  DiariPrivatModule,
  ContactsModule,
} from './modules'

interface AgendaViewProps {
  userId: string
  userName: string
}

// Mapeo de iconos por módulo
const MODULE_ICONS: Record<string, React.ReactNode> = {
  objectius: <TargetIcon size="sm" />,
  habits: <HabitsIcon size="sm" />,
  reflexio: <ReflectionIcon size="sm" />,
  desafiament: <TrophyIcon size="sm" />,
  agraiments: <GratitudeIcon size="sm" />,
  conclusions: <ConclusionsIcon size="sm" />,
  lectures: <ReadingIcon size="sm" />,
  viatges: <TravelIcon size="sm" />,
  triangles: <TriangleIcon size="sm" />,
  capsula: <TimeCapsuleIcon size="sm" />,
  visualitzacions: <VisualizationIcon size="sm" />,
  diari: <PrivateIcon size="sm" />,
}

// Constante para módulos opcionales
const OPTIONAL_MODULES_LIST = [
  { id: 'objectius', name: 'Objectius', defaultActive: true },
  { id: 'habits', name: "Seguiment d'Hàbits", defaultActive: true },
  { id: 'reflexio', name: 'Reflexió del Dia', defaultActive: false },
  { id: 'desafiament', name: 'Desafiament 21 dies', defaultActive: false },
  { id: 'agraiments', name: 'Agraïments', defaultActive: false },
  { id: 'conclusions', name: 'Conclusions', defaultActive: false },
  { id: 'lectures', name: 'Les meves lectures', defaultActive: false },
  { id: 'viatges', name: 'Els meus viatges', defaultActive: false },
  { id: 'triangles', name: '6 Triangles de la vida', defaultActive: false },
  { id: 'capsula', name: 'Càpsula del temps', defaultActive: false },
  { id: 'visualitzacions', name: 'Visualitzacions', defaultActive: false },
  { id: 'diari', name: 'Diari Privat', defaultActive: false },
]

// Mapeo de componentes de módulos
const MODULE_COMPONENTS: Record<string, React.ComponentType<{ onClose?: () => void }>> = {
  desafiament: DesafiamentModule,
  agraiments: AgraïmentsModule,
  conclusions: ConclusionsModule,
  lectures: LecturesModule,
  viatges: ViatgesModule,
  triangles: TrianglesModule,
  capsula: CapsulaModule,
  visualitzacions: VisualitzacionsModule,
  diari: DiariPrivatModule,
}

// Componente para módulos activos
function ActiveModuleCard({ moduleType, onDeactivate }: { moduleType: string; onDeactivate: () => void }) {
  const ModuleComponent = MODULE_COMPONENTS[moduleType]

  // Si existe un componente para este módulo, renderizarlo
  if (ModuleComponent) {
    return <ModuleComponent onClose={onDeactivate} />
  }

  // Fallback para módulos sin componente
  const moduleInfo = OPTIONAL_MODULES_LIST.find((m) => m.id === moduleType)
  const ModuleIcon = MODULE_ICONS[moduleType] || <IconWrapper icon={Package} color="gray" size="sm" />

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {ModuleIcon}
          <h3 className="font-semibold text-gray-900">{moduleInfo?.name || moduleType}</h3>
        </div>
        <button onClick={onDeactivate} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">Mòdul {moduleInfo?.name || moduleType} activat</p>
        <p className="text-xs mt-1">Funcionalitat en desenvolupament</p>
      </div>
    </div>
  )
}

// Constantes para el banner de bienvenida
const WELCOME_VISITS_KEY = 'agenda_welcome_visits'
const WELCOME_DISMISSED_KEY = 'agenda_welcome_dismissed'
const MAX_WELCOME_VISITS = 3

export function AgendaView({ userId, userName }: AgendaViewProps) {
  const [currentView, setCurrentView] = useState<ViewType>('diaria')
  const [currentDate, setCurrentDate] = useState(() => new Date()) // Función para evitar problemas de SSR
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  // Asegurar que la fecha inicial es correcta al montar (evita problemas de caché/SSR)
  useEffect(() => {
    setCurrentDate(new Date())
  }, [])
  
  // Estados locales para inputs
  const [localGoalText, setLocalGoalText] = useState('')
  const [localReflexio, setLocalReflexio] = useState<{ mood: string | null; text: string }>({ mood: null, text: '' })
  const [newHabitEmoji, setNewHabitEmoji] = useState('✨')
  const [newHabitName, setNewHabitName] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  // Estados para editar hábitos
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [editHabitName, setEditHabitName] = useState('')
  const [editHabitEmoji, setEditHabitEmoji] = useState('✨')
  const [showEmojiPickerForEdit, setShowEmojiPickerForEdit] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTaskText, setNewTaskText] = useState('')
  
  // Estados para modal de eventos
  const [editingEvent, setEditingEvent] = useState<Esdeveniment | null>(null)
  const [eventForm, setEventForm] = useState({
    date: '', // Fecha del evento en formato YYYY-MM-DD
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    allDay: false,
    category: 'personal',
    location: '',
    reminder: 'none',
    repeat: 'none',
    notification: 'none',
  })
  
  // Estados para editar hábitos
  const [editingHabit, setEditingHabit] = useState<string | null>(null)
  const [editingHabitName, setEditingHabitName] = useState('')

  // Estado para popup de día en vista mensual/semanal
  const [selectedDayPopup, setSelectedDayPopup] = useState<Date | null>(null)

  // Hook que maneja toda la lógica de datos - pasamos la vista para cargar el rango correcto
  const {
    isLoading,
    config,
    esdeveniments,
    goal,
    habits,
    reflexio,
    modules,
    addEvent,
    updateEvent,
    deleteEvent,
    updateGoalText,
    addTask,
    toggleTask,
    deleteTask,
    addHabit,
    updateHabit,
    toggleHabitDay,
    deleteHabit,
    saveReflection,
    toggleModule,
    getEventsForDate,
    dateHasEvents,
  } = useAgenda(currentDate, currentView)

  // Sincronizar estados locales con datos del hook
  useEffect(() => {
    if (goal) {
      setLocalGoalText(goal.text)
    }
  }, [goal])

  useEffect(() => {
    setLocalReflexio(reflexio)
  }, [reflexio])

  // Lógica del banner de bienvenida con 3 visitas máximo
  useEffect(() => {
    // Comprobar si el usuario ha cerrado permanentemente el banner
    const dismissed = localStorage.getItem(WELCOME_DISMISSED_KEY) === 'true'
    if (dismissed) {
      setShowWelcome(false)
      return
    }

    // Comprobar número de visitas
    const visits = parseInt(localStorage.getItem(WELCOME_VISITS_KEY) || '0')

    if (visits < MAX_WELCOME_VISITS) {
      setShowWelcome(true)
      // Incrementar contador de visitas
      localStorage.setItem(WELCOME_VISITS_KEY, (visits + 1).toString())
    } else {
      // Ya ha visto el banner 3 veces, no mostrar más
      setShowWelcome(false)
    }
  }, [])

  // Cerrar temporalmente (solo esta sesión/visita)
  const dismissWelcomeTemporarily = () => {
    setShowWelcome(false)
    // No hacemos nada más, la próxima visita volverá a salir si no ha llegado a 3
  }

  // Cerrar permanentemente (no vuelve a salir nunca)
  const dismissWelcomePermanently = () => {
    setShowWelcome(false)
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true')
  }

  // Cerrar emoji pickers al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker) {
        setShowEmojiPicker(false)
      }
      if (showEmojiPickerForEdit) {
        setShowEmojiPickerForEdit(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showEmojiPicker, showEmojiPickerForEdit])

  // Calcular si estamos viendo "hoy" (necesario para sincronización)
  const isViewingToday = currentDate.toDateString() === new Date().toDateString()

  // Sincronizar fecha automáticamente cuando la pestaña vuelve a estar activa
  // o cuando detecta que ha pasado a un nuevo día
  useEffect(() => {
    const checkDateSync = () => {
      const today = new Date()
      const todayStr = today.toDateString()
      const currentStr = currentDate.toDateString()

      // Si la fecha real ha cambiado y estábamos viendo "hoy", actualizar
      if (currentStr !== todayStr) {
        const wasViewingToday = localStorage.getItem('agenda_viewing_today') === 'true'
        if (wasViewingToday) {
          setCurrentDate(today)
        }
      }
    }

    // Verificar al volver a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDateSync()
      }
    }

    // Verificar cada minuto (por si pasa medianoche)
    const interval = setInterval(checkDateSync, 60000)

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [currentDate])

  // Guardar si el usuario está viendo "hoy"
  useEffect(() => {
    localStorage.setItem('agenda_viewing_today', isViewingToday.toString())
  }, [isViewingToday])

  // Filtrar módulos activos
  const activeModules = modules.filter(m => m.isActive)

  // Helper para formatear fecha a YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Funciones para manejar modales y acciones rápidas
  const getDefaultEventForm = (date: Date) => ({
    date: formatDateToString(date),
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    allDay: false,
    category: 'personal',
    location: '',
    reminder: 'none',
    repeat: 'none',
    notification: 'none',
  })

  const handleOpenEventModal = (event?: Esdeveniment, forDate?: Date) => {
    // Determinar la fecha: evento existente > fecha especificada > fecha actual
    const targetDate = forDate || currentDate
    const eventDateStr = event?.date
      ? (typeof event.date === 'string' ? event.date.split('T')[0] : formatDateToString(new Date(event.date)))
      : formatDateToString(targetDate)

    if (event) {
      setEditingEvent(event)
      // Cast to access extended fields
      const extEvent = event as any
      setEventForm({
        date: eventDateStr,
        title: event.title,
        description: event.description || '',
        startTime: extEvent.startTime || event.time || '',
        endTime: extEvent.endTime || '',
        allDay: extEvent.allDay || false,
        category: extEvent.category || 'altres',
        location: extEvent.location || '',
        reminder: extEvent.reminder || 'none',
        repeat: extEvent.repeat || 'none',
        notification: extEvent.notification || 'none',
      })
    } else {
      setEditingEvent(null)
      setEventForm(getDefaultEventForm(targetDate))
    }
    setShowEventModal(true)
  }

  const handleOpenTaskModal = () => {
    setNewTaskText('')
    setShowTaskModal(true)
  }

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Funciones de navegación de fecha
  const goToToday = () => setCurrentDate(new Date())
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (currentView === 'diaria') newDate.setDate(newDate.getDate() - 1)
    else if (currentView === 'setmanal') newDate.setDate(newDate.getDate() - 7)
    else if (currentView === 'mensual') newDate.setMonth(newDate.getMonth() - 1)
    else if (currentView === 'anual') newDate.setFullYear(newDate.getFullYear() - 1)
    setCurrentDate(newDate)
  }
  
  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (currentView === 'diaria') newDate.setDate(newDate.getDate() + 1)
    else if (currentView === 'setmanal') newDate.setDate(newDate.getDate() + 7)
    else if (currentView === 'mensual') newDate.setMonth(newDate.getMonth() + 1)
    else if (currentView === 'anual') newDate.setFullYear(newDate.getFullYear() + 1)
    setCurrentDate(newDate)
  }

  // Formateo de fecha según vista
  const formatDate = (date: Date) => {
    switch (currentView) {
      case 'diaria':
        return date.toLocaleDateString('ca-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'setmanal':
        return formatWeekRange(date)
      case 'mensual':
        return formatMonthYear(date)
      case 'anual':
        return formatYear(date)
      default:
        return date.toLocaleDateString('ca-ES')
    }
  }

  const isToday = currentDate.toDateString() === new Date().toDateString()

  // Datos para las diferentes vistas
  const weekDays = getWeekDays(currentDate)
  const monthCalendarDays = getMonthCalendarDays(currentDate)
  const yearMonths = getYearMonths(currentDate)

  return (
    <div className="space-y-6">
      {/* Banner de bienvenida (máximo 3 visitas o hasta configurar) */}
      <AnimatePresence>
        {showWelcome && (
          <WelcomeBanner
            onDismissTemporary={dismissWelcomeTemporarily}
            onDismissPermanent={() => {
              dismissWelcomePermanently()
              setShowConfigModal(true)
            }}
          />
        )}
      </AnimatePresence>

      {/* Frase del día */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 mb-6">
        <CardContent padding="default">
          <div className="flex items-start gap-3">
            <SparklesIcon size="sm" />
            <div>
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
                Frase del dia
              </p>
              <p className="text-amber-800 italic leading-relaxed">
                &quot;El secret de progressar és començar. El secret de començar és dividir les teves tasques complexes i aclaparadores en petites tasques manejables, i després començar per la primera.&quot;
              </p>
              <p className={`${TYPOGRAPHY.small} text-amber-600 mt-2`}>— Mark Twain</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista selector amb botó de configuració */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        {/* Tabs a l'esquerra */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          {(['diaria', 'setmanal', 'mensual', 'anual'] as ViewType[]).map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === view
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        {/* Selector de data a la dreta */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
            {formatDate(currentDate)}
          </h2>

          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {!isToday && (
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-lg hover:bg-indigo-200 transition-colors"
            >
              Avui
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal - Vista Diaria */}
      {currentView === 'diaria' && (
        /* Contenido principal - Layout con panel lateral */
        <div className="flex gap-6">
          {/* Área principal - Grid 2x2 de módulos base */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* MÓDULO 1: Agenda del Dia */}
              <Card>
                <CardHeader noDivider>
                  <CardTitle
                    icon={<CalendarDaysIcon size="md" />}
                    subtitle="Les teves cites i esdeveniments"
                  >
                    Agenda del Dia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                
                {esdeveniments.length > 0 ? (
                  <div className="space-y-2">
                    {esdeveniments.map((event) => {
                      const catStyles = getCategoryStyles((event as any).category)
                      return (
                        <div
                          key={event.id}
                          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors group border-l-4 ${catStyles.borderColor} ${catStyles.bgLight}`}
                        >
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${catStyles.bgColor}`} />
                          <span className={`text-sm font-medium w-14 ${catStyles.textColor}`}>{event.time}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{event.title}</div>
                            {event.description && (
                              <div className="text-gray-600 text-sm">{event.description}</div>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEventModal(event)}
                              className="p-1 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-2">
                      <ClockIcon size="lg" variant="ghost" />
                    </div>
                    <p className="text-gray-400 text-sm">No tens esdeveniments avui</p>
                  </div>
                )}
                
                <button
                  onClick={() => handleOpenEventModal()}
                  className="w-full mt-4 py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Afegir esdeveniment
                </button>
                </CardContent>
              </Card>

              {/* MÓDULO 2: Contactes (Fix) */}
              <ContactsModule />
            </div>

            {/* Módulos opcionales activados */}
            {activeModules.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {activeModules.map((mod) => {
                  // Renderizar módulos especiales inline
                  if (mod.moduleType === 'objectius') {
                    return (
                      <Card key={mod.moduleType}>
                        <CardHeader noDivider>
                          <CardTitle
                            icon={<TargetIcon size="md" />}
                            subtitle="Defineix i segueix els teus objectius"
                            action={
                              <button
                                onClick={() => toggleModule(mod.moduleType, false)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            }
                          >
                            Objectius
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {/* Objectiu del dia */}
                          <div className="mb-4">
                            <label className="text-sm text-gray-600 mb-1 block">Objectiu del dia:</label>
                            <input
                              type="text"
                              value={localGoalText}
                              onChange={(e) => setLocalGoalText(e.target.value)}
                              onBlur={() => goal && updateGoalText(localGoalText)}
                              placeholder="Quin és el teu objectiu principal avui?"
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                            />
                          </div>

                          {/* Llista de tasques */}
                          <div className="space-y-2 mb-4">
                            {goal?.tasks && goal.tasks.length > 0 ? (
                              goal.tasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-3 group">
                                  <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      task.completed
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-gray-300 hover:border-emerald-500'
                                    }`}
                                  >
                                    {task.completed && <Check className="w-3 h-3 text-white" />}
                                  </button>
                                  <span className={`flex-1 ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                    {task.text}
                                  </span>
                                  <button
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm text-center py-2">No tens tasques definides</p>
                            )}
                          </div>

                          {/* Barra de progrés */}
                          {goal?.tasks && goal.tasks.length > 0 && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Progrés</span>
                                <span className="font-medium text-gray-900">
                                  {goal.tasks.filter(t => t.completed).length}/{goal.tasks.length}
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${goal.tasks.length > 0 ? (goal.tasks.filter(t => t.completed).length / goal.tasks.length) * 100 : 0}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <button
                            onClick={handleOpenTaskModal}
                            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Afegir tasca
                          </button>
                        </CardContent>
                      </Card>
                    )
                  }

                  if (mod.moduleType === 'habits') {
                    return (
                      <Card key={mod.moduleType}>
                        <CardHeader noDivider>
                          <CardTitle
                            icon={<HabitsIcon size="md" />}
                            subtitle="Construeix rutines positives"
                            action={
                              <button
                                onClick={() => toggleModule(mod.moduleType, false)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            }
                          >
                            Seguiment d'Hàbits
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {habits.length > 0 ? (
                            <div className="space-y-3">
                              {habits.map((habit) => (
                                <div key={habit.id} className="flex items-center gap-3 group">
                                  {editingHabitId === habit.id ? (
                                    <>
                                      <div className="relative">
                                        <button
                                          onClick={() => setShowEmojiPickerForEdit(!showEmojiPickerForEdit)}
                                          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-lg"
                                        >
                                          {editHabitEmoji}
                                        </button>
                                        {showEmojiPickerForEdit && (
                                          <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute top-10 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-10"
                                          >
                                            <div className="grid grid-cols-6 gap-1">
                                              {['✨', '🏃', '📚', '💧', '🧘', '🎯', '💪', '🌱', '☀️', '🎨', '✍️', '🎵', '🍎', '😴', '🧠', '💼', '🏋️', '🚴'].map((emoji) => (
                                                <button
                                                  key={emoji}
                                                  onClick={() => {
                                                    setEditHabitEmoji(emoji)
                                                    setShowEmojiPickerForEdit(false)
                                                  }}
                                                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-sm"
                                                >
                                                  {emoji}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <input
                                        type="text"
                                        value={editHabitName}
                                        onChange={(e) => setEditHabitName(e.target.value)}
                                        onKeyDown={async (e) => {
                                          if (e.key === 'Enter' && editHabitName.trim()) {
                                            try {
                                              await updateHabit(habit.id, editHabitEmoji, editHabitName.trim())
                                              setEditingHabitId(null)
                                              setEditHabitName('')
                                              setEditHabitEmoji('✨')
                                            } catch (error) {
                                              console.error('Error actualitzant hàbit:', error)
                                            }
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingHabitId(null)
                                            setEditHabitName('')
                                            setEditHabitEmoji('✨')
                                          }
                                        }}
                                        className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                                        autoFocus
                                      />
                                      <div className="flex gap-1">
                                        {habit.days.map((completed, dayIndex) => (
                                          <button
                                            key={dayIndex}
                                            onClick={() => toggleHabitDay(habit.id, dayIndex)}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110 ${
                                              completed ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-orange-100'
                                            }`}
                                            title={['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'][dayIndex]}
                                          >
                                            {completed ? '●' : '○'}
                                          </button>
                                        ))}
                                      </div>
                                      <button
                                        onClick={async () => {
                                          if (editHabitName.trim()) {
                                            try {
                                              await updateHabit(habit.id, editHabitEmoji, editHabitName.trim())
                                              setEditingHabitId(null)
                                              setEditHabitName('')
                                              setEditHabitEmoji('✨')
                                            } catch (error) {
                                              console.error('Error actualitzant hàbit:', error)
                                            }
                                          }
                                        }}
                                        className="p-1 hover:bg-green-50 rounded transition-all"
                                      >
                                        <Check className="w-4 h-4 text-green-500" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingHabitId(null)
                                          setEditHabitName('')
                                          setEditHabitEmoji('✨')
                                        }}
                                        className="p-1 hover:bg-gray-50 rounded transition-all"
                                      >
                                        <X className="w-4 h-4 text-gray-500" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-lg w-8">{habit.emoji}</span>
                                      <span className="text-sm text-gray-700 w-20 truncate">{habit.name}</span>
                                      <div className="flex gap-1">
                                        {habit.days.map((completed, dayIndex) => (
                                          <button
                                            key={dayIndex}
                                            onClick={() => toggleHabitDay(habit.id, dayIndex)}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110 ${
                                              completed ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-orange-100'
                                            }`}
                                            title={['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'][dayIndex]}
                                          >
                                            {completed ? '●' : '○'}
                                          </button>
                                        ))}
                                      </div>
                                      <button
                                        onClick={() => {
                                          setEditingHabitId(habit.id)
                                          setEditHabitName(habit.name)
                                          setEditHabitEmoji(habit.emoji)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-50 rounded transition-all"
                                      >
                                        <Edit3 className="w-4 h-4 text-blue-500" />
                                      </button>
                                      <button
                                        onClick={() => deleteHabit(habit.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="flex justify-center mb-2">
                                <HabitsIcon size="lg" variant="ghost" />
                              </div>
                              <p className="text-gray-400 text-sm">No tens hàbits configurats</p>
                            </div>
                          )}

                          {/* Input para añadir hábito */}
                          <div className="mt-4">
                            <div className="flex gap-2">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowEmojiPicker(!showEmojiPicker)
                                  }}
                                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-lg"
                                >
                                  {newHabitEmoji}
                                </button>
                                {showEmojiPicker && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-10"
                                  >
                                    <div className="grid grid-cols-6 gap-1">
                                      {['✨', '🏃', '📚', '💧', '🧘', '🎯', '💪', '🌱', '☀️', '🎨', '✍️', '🎵', '🍎', '😴', '🧠', '💼', '🏋️', '🚴'].map((emoji) => (
                                        <button
                                          key={emoji}
                                          onClick={() => {
                                            setNewHabitEmoji(emoji)
                                            setShowEmojiPicker(false)
                                          }}
                                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-lg"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <input
                                type="text"
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter' && newHabitName.trim()) {
                                    try {
                                      await addHabit(newHabitEmoji, newHabitName.trim())
                                      setNewHabitName('')
                                      setNewHabitEmoji('✨')
                                    } catch (error) {
                                      console.error('Error afegint hàbit:', error)
                                    }
                                  }
                                }}
                                placeholder="Nom de l'hàbit..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                              />
                              <button
                                onClick={async () => {
                                  if (newHabitName.trim()) {
                                    try {
                                      await addHabit(newHabitEmoji, newHabitName.trim())
                                      setNewHabitName('')
                                      setNewHabitEmoji('✨')
                                    } catch (error) {
                                      console.error('Error afegint hàbit:', error)
                                    }
                                  }
                                }}
                                disabled={!newHabitName.trim()}
                                className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }

                  if (mod.moduleType === 'reflexio') {
                    return (
                      <Card key={mod.moduleType}>
                        <CardHeader noDivider>
                          <CardTitle
                            icon={<ReflectionIcon size="md" />}
                            subtitle="Com t'has sentit avui?"
                            action={
                              <button
                                onClick={() => toggleModule(mod.moduleType, false)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            }
                          >
                            Reflexió del Dia
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {/* Selector de mood */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">El meu estat d&apos;ànim</p>
                            <div className="flex gap-2">
                              {['😊', '😐', '😔', '😢', '🤩'].map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => setLocalReflexio(prev => ({ ...prev, mood: emoji }))}
                                  className={`w-10 h-10 text-xl rounded-lg transition-all ${
                                    localReflexio.mood === emoji
                                      ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                                      : 'hover:bg-gray-100'
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Textarea reflexió */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Les meves reflexions</p>
                            <textarea
                              value={localReflexio.text}
                              onChange={(e) => setLocalReflexio(prev => ({ ...prev, text: e.target.value }))}
                              placeholder="Què ha passat avui? Com et sents? Què has après?"
                              rows={4}
                              className="w-full p-3 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                            />
                          </div>

                          <button
                            onClick={() => saveReflection(localReflexio.mood, localReflexio.text)}
                            className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                          >
                            Guardar Reflexió
                          </button>
                        </CardContent>
                      </Card>
                    )
                  }

                  // Para otros módulos, usar el componente genérico
                  return (
                    <ActiveModuleCard
                      key={mod.moduleType}
                      moduleType={mod.moduleType}
                      onDeactivate={() => toggleModule(mod.moduleType, false)}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Panel lateral derecho - Módulos opcionales */}
          <div className="w-72 flex-shrink-0 hidden xl:block">
            <Card className="sticky top-6">
              <CardHeader noDivider>
                <CardTitle
                  icon={<ModulesIcon size="xs" variant="ghost" />}
                  subtitle="Clica per afegir a la teva agenda"
                >
                  Mòduls opcionals
                </CardTitle>
              </CardHeader>
              <CardContent>
              
              {/* Módulos disponibles (no activos) */}
              <div className="space-y-2">
                {OPTIONAL_MODULES_LIST
                  .filter(m => !activeModules.find(am => am.moduleType === m.id))
                  .map((modul) => (
                    <button
                      key={modul.id}
                      onClick={() => toggleModule(modul.id, true)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left"
                    >
                      {MODULE_ICONS[modul.id] || <IconWrapper icon={Package} color="gray" size="sm" />}
                      <span className="text-sm text-gray-700 flex-1">{modul.name}</span>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
              </div>

              {/* Módulos activos */}
              {activeModules.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-4" />
                  <h4 className={`${TYPOGRAPHY.label} mb-3`}>Actius</h4>
                  <div className="space-y-2">
                    {activeModules.map((mod) => {
                      const modulInfo = OPTIONAL_MODULES_LIST.find(m => m.id === mod.moduleType)
                      return (
                        <div
                          key={mod.moduleType}
                          className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg"
                        >
                          {MODULE_ICONS[mod.moduleType] || <IconWrapper icon={Package} color="gray" size="sm" />}
                          <span className="text-sm text-indigo-700 flex-1">{modulInfo?.name || mod.moduleType}</span>
                          <button
                            onClick={() => toggleModule(mod.moduleType, false)}
                            className="p-1 hover:bg-indigo-100 rounded"
                          >
                            <X className="w-4 h-4 text-indigo-400" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Vista Setmanal */}
      {currentView === 'setmanal' && (
        <Card>
          <CardContent padding="default">
            {/* Capçalera amb dies de la setmana */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {weekDays.map((day, index) => {
                const dayIsToday = isDateToday(day)
                const isSelected = areSameDay(day, currentDate)
                return (
                  <div
                    key={index}
                    className={`text-center p-3 rounded-xl cursor-pointer transition-all ${
                      dayIsToday
                        ? 'bg-indigo-600 text-white'
                        : isSelected
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setCurrentDate(day)
                      setCurrentView('diaria')
                    }}
                  >
                    <div className={`text-xs font-medium ${dayIsToday ? 'text-indigo-100' : 'text-gray-500'}`}>
                      {WEEKDAY_NAMES_FULL[index]}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${dayIsToday ? 'text-white' : 'text-gray-900'}`}>
                      {formatDayOfMonth(day)}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Contingut de la setmana - Hores del dia */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day, dayIndex) => {
                  // Filtrar eventos para este día específico usando la función del hook
                  const dayEvents = getEventsForDate(day)
                  const dayIsToday = isDateToday(day)

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[200px] p-2 rounded-lg ${
                        dayIsToday ? 'bg-indigo-50/50' : 'bg-gray-50'
                      }`}
                    >
                      {dayEvents.length > 0 ? (
                        <div className="space-y-2">
                          {dayEvents.slice(0, 3).map((event) => {
                            const catStyles = getCategoryStyles((event as any).category)
                            return (
                              <div
                                key={event.id}
                                className={`p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-3 ${catStyles.borderColor}`}
                                onClick={() => {
                                  setCurrentDate(day)
                                  setCurrentView('diaria')
                                }}
                              >
                                <div className={`text-xs font-medium ${catStyles.textColor}`}>{event.time}</div>
                                <div className="text-sm text-gray-900 truncate">{event.title}</div>
                              </div>
                            )
                          })}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayEvents.length - 3} més
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <button
                            onClick={() => {
                              setCurrentDate(day)
                              handleOpenEventModal(undefined, day)
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista Mensual */}
      {currentView === 'mensual' && (
        <div className="relative">
          <Card>
            <CardContent padding="default">
              {/* Capçalera amb dies de la setmana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAY_NAMES.map((day, index) => (
                  <div key={index} className="text-center py-2">
                    <span className="text-xs font-semibold text-gray-500">{day}</span>
                  </div>
                ))}
              </div>

              {/* Calendari */}
              <div className="space-y-1">
                {monthCalendarDays.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-1">
                    {week.map((day, dayIndex) => {
                      const dayIsToday = isDateToday(day)
                      const isCurrentMonth = isInCurrentMonth(day, currentDate)
                      const isSelected = selectedDayPopup ? areSameDay(day, selectedDayPopup) : false
                      const hasEvents = isCurrentMonth && dateHasEvents(day)

                      return (
                        <div
                          key={dayIndex}
                          onClick={() => {
                            if (isCurrentMonth) {
                              setSelectedDayPopup(day)
                              setCurrentDate(day)
                            }
                          }}
                          className={`aspect-square p-1 rounded-lg cursor-pointer transition-all group relative ${
                            !isCurrentMonth
                              ? 'text-gray-300 cursor-default'
                              : dayIsToday
                              ? 'bg-indigo-600 text-white'
                              : isSelected
                              ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                              : 'hover:bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="h-full flex flex-col">
                            <span className={`text-sm font-medium ${!isCurrentMonth ? 'text-gray-300' : ''}`}>
                              {formatDayOfMonth(day)}
                            </span>
                            {/* Indicador d'esdeveniments */}
                            {hasEvents && (
                              <div className="flex gap-0.5 mt-auto">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Llegenda */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-xs text-gray-600">Esdeveniments</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-gray-600">Tasques</span>
                </div>
                <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-xs text-gray-600">Reflexions</span>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Popup del dia seleccionat */}
          <AnimatePresence>
            {selectedDayPopup && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-0 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-20 overflow-hidden"
                style={{ maxHeight: '400px' }}
              >
                {/* Capçalera del popup */}
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-indigo-100 uppercase tracking-wide">
                        {formatWeekdayShort(selectedDayPopup)}
                      </p>
                      <p className="text-lg font-semibold">
                        {formatDayOfMonth(selectedDayPopup)} {formatMonthShort(selectedDayPopup)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDayPopup(null)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contingut */}
                <div className="p-4 max-h-64 overflow-y-auto">
                  {(() => {
                    const popupEvents = selectedDayPopup ? getEventsForDate(selectedDayPopup) : []
                    return popupEvents.length > 0 ? (
                      <div className="space-y-2">
                        {popupEvents.map((event) => {
                          const catStyles = getCategoryStyles((event as any).category)
                          return (
                            <div
                              key={event.id}
                              className={`flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group border-l-3 ${catStyles.borderColor} ${catStyles.bgLight}`}
                            >
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${catStyles.bgColor}`} />
                              <span className={`text-xs font-medium mt-0.5 w-12 ${catStyles.textColor}`}>
                                {event.time}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {event.title}
                                </p>
                                {event.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    handleOpenEventModal(event)
                                    setSelectedDayPopup(null)
                                  }}
                                  className="p-1 hover:bg-blue-50 rounded"
                                >
                                  <Edit2 className="w-3 h-3 text-blue-500" />
                                </button>
                                <button
                                  onClick={() => deleteEvent(event.id)}
                                  className="p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <ClockIcon size="md" variant="ghost" />
                        <p className="text-sm text-gray-500 mt-2">
                          No hi ha esdeveniments
                        </p>
                      </div>
                    )
                  })()}
                </div>

                {/* Botons d'acció */}
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedDayPopup) {
                          handleOpenEventModal(undefined, selectedDayPopup)
                        }
                        setSelectedDayPopup(null)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Afegir esdeveniment
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('diaria')
                        setSelectedDayPopup(null)
                      }}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Veure dia
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Vista Anual */}
      {currentView === 'anual' && (
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {yearMonths.map((month, index) => {
              const monthDays = getMonthCalendarDays(month)
              const isCurrentMonthNow = month.getMonth() === new Date().getMonth() &&
                                         month.getFullYear() === new Date().getFullYear()

              return (
                <Card
                  key={index}
                  className={`transition-all hover:shadow-md ${
                    isCurrentMonthNow ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                  }`}
                >
                  <CardContent padding="compact">
                    {/* Nom del mes - clic obre vista mensual */}
                    <div
                      className={`text-sm font-semibold mb-2 cursor-pointer hover:underline ${
                        isCurrentMonthNow ? 'text-indigo-600' : 'text-gray-900'
                      }`}
                      onClick={() => {
                        setCurrentDate(month)
                        setCurrentView('mensual')
                      }}
                    >
                      {formatMonthLong(month)}
                    </div>

                    {/* Mini calendari */}
                    <div className="space-y-0.5">
                      {/* Capçalera */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {WEEKDAY_NAMES.map((day, idx) => (
                          <div key={idx} className="text-center">
                            <span className="text-[8px] text-gray-400">{day.charAt(0)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Dies - clic obre popup */}
                      {monthDays.slice(0, 6).map((week, weekIdx) => (
                        <div key={weekIdx} className="grid grid-cols-7 gap-0.5">
                          {week.map((day, dayIdx) => {
                            const dayIsToday = isDateToday(day)
                            const isMonthDay = isInCurrentMonth(day, month)

                            return (
                              <button
                                key={dayIdx}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (isMonthDay) {
                                    setSelectedDayPopup(day)
                                    setCurrentDate(day)
                                  }
                                }}
                                disabled={!isMonthDay}
                                className={`aspect-square flex items-center justify-center rounded-sm transition-all ${
                                  !isMonthDay
                                    ? 'text-gray-200 cursor-default'
                                    : dayIsToday
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'text-gray-700 hover:bg-indigo-100 cursor-pointer'
                                }`}
                              >
                                <span className="text-[9px]">{formatDayOfMonth(day)}</span>
                              </button>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Popup del dia seleccionat (igual que a la vista mensual) */}
          <AnimatePresence>
            {selectedDayPopup && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden"
              >
                {/* Capçalera del popup */}
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-indigo-100 uppercase tracking-wide">
                        {formatWeekdayShort(selectedDayPopup)}
                      </p>
                      <p className="text-lg font-semibold">
                        {formatDayOfMonth(selectedDayPopup)} {formatMonthShort(selectedDayPopup)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDayPopup(null)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contingut */}
                <div className="p-4 max-h-64 overflow-y-auto">
                  {(() => {
                    const popupEvents = selectedDayPopup ? getEventsForDate(selectedDayPopup) : []
                    return popupEvents.length > 0 ? (
                      <div className="space-y-2">
                        {popupEvents.map((event) => {
                          const catStyles = getCategoryStyles((event as any).category)
                          return (
                            <div
                              key={event.id}
                              className={`flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group border-l-3 ${catStyles.borderColor} ${catStyles.bgLight}`}
                            >
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${catStyles.bgColor}`} />
                              <span className={`text-xs font-medium mt-0.5 w-12 ${catStyles.textColor}`}>
                                {event.time}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {event.title}
                                </p>
                                {event.description && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    handleOpenEventModal(event)
                                    setSelectedDayPopup(null)
                                  }}
                                  className="p-1 hover:bg-blue-50 rounded"
                                >
                                  <Edit2 className="w-3 h-3 text-blue-500" />
                                </button>
                                <button
                                  onClick={() => deleteEvent(event.id)}
                                  className="p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <ClockIcon size="md" variant="ghost" />
                        <p className="text-sm text-gray-500 mt-2">
                          No hi ha esdeveniments
                        </p>
                      </div>
                    )
                  })()}
                </div>

                {/* Botons d'acció */}
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedDayPopup) {
                          handleOpenEventModal(undefined, selectedDayPopup)
                        }
                        setSelectedDayPopup(null)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Afegir esdeveniment
                    </button>
                    <button
                      onClick={() => {
                        setCurrentView('diaria')
                        setSelectedDayPopup(null)
                      }}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Veure dia
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay per tancar popup */}
          {selectedDayPopup && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSelectedDayPopup(null)}
            />
          )}
        </div>
      )}

      {/* Modal Afegir/Editar Esdeveniment */}
      <AnimatePresence>
        {showEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => {
              setShowEventModal(false)
              setEditingEvent(null)
              setEventForm(getDefaultEventForm(currentDate))
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon size="md" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingEvent ? 'Editar esdeveniment' : 'Nou esdeveniment'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowEventModal(false)
                    setEditingEvent(null)
                    setEventForm(getDefaultEventForm(currentDate))
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Camp Títol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Títol *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Reunió d'equip"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                    autoFocus
                  />
                </div>

                {/* Tot el dia Switch */}
                <div className="flex items-center justify-between py-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tot el dia
                  </label>
                  <button
                    type="button"
                    onClick={() => setEventForm(prev => ({ ...prev, allDay: !prev.allDay }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      eventForm.allDay ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        eventForm.allDay ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Hora d'inici i fi (només si no és tot el dia) */}
                {!eventForm.allDay && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora d'inici *
                      </label>
                      <input
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de fi
                      </label>
                      <input
                        type="time"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEventForm(prev => ({ ...prev, category: cat.id }))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          eventForm.category === cat.id
                            ? 'bg-gray-100 ring-2 ring-blue-500 ring-offset-1'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${cat.bgColor}`} />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ubicació */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Ubicació
                    </span>
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: Sala de reunions, Online..."
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                {/* Camp Descripció */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripció <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalls addicionals de l'esdeveniment..."
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                {/* Recordatori - Toggle simple */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        eventForm.reminder !== 'none' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <Bell className={`w-5 h-5 transition-colors ${
                          eventForm.reminder !== 'none' ? 'text-orange-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <label htmlFor="reminder-toggle" className="font-medium text-gray-900 cursor-pointer">
                          Recordatori
                        </label>
                        <p className="text-xs text-gray-500">
                          {eventForm.reminder !== 'none'
                            ? "Apareixerà a la teva llista de recordatoris"
                            : "Activa per veure'l a Recordatoris"
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      id="reminder-toggle"
                      type="button"
                      onClick={() => setEventForm(prev => ({
                        ...prev,
                        reminder: prev.reminder === 'none' ? 'active' : 'none'
                      }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        eventForm.reminder !== 'none' ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                          eventForm.reminder !== 'none' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Repetir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Repetir
                    </span>
                  </label>
                  <select
                    value={eventForm.repeat}
                    onChange={(e) => setEventForm(prev => ({ ...prev, repeat: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white"
                  >
                    <option value="none">No repetir</option>
                    <option value="daily">Cada dia</option>
                    <option value="weekdays">Dies feiners (Dl-Dv)</option>
                    <option value="weekly">Cada setmana</option>
                    <option value="biweekly">Cada 2 setmanes</option>
                    <option value="monthly">Cada mes</option>
                    <option value="yearly">Cada any</option>
                  </select>
                </div>

                {/* Notificació */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Avís/Notificació
                    </span>
                  </label>
                  <select
                    value={eventForm.notification}
                    onChange={(e) => setEventForm(prev => ({ ...prev, notification: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 bg-white"
                  >
                    <option value="none">Sense notificació</option>
                    <option value="popup">Finestra emergent</option>
                    <option value="email">Correu electrònic</option>
                    <option value="both">Ambdues</option>
                  </select>
                </div>
              </div>

              {/* Botons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowEventModal(false)
                    setEditingEvent(null)
                    setEventForm(getDefaultEventForm(currentDate))
                  }}
                  className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={async () => {
                    // Validar camps obligatoris
                    if (!eventForm.title.trim()) return
                    if (!eventForm.allDay && !eventForm.startTime) return

                    const eventData = {
                      date: eventForm.date, // Fecha del evento
                      time: eventForm.allDay ? '00:00' : eventForm.startTime,
                      startTime: eventForm.allDay ? undefined : eventForm.startTime,
                      endTime: eventForm.allDay ? undefined : eventForm.endTime || undefined,
                      allDay: eventForm.allDay,
                      title: eventForm.title.trim(),
                      description: eventForm.description.trim() || undefined,
                      category: eventForm.category,
                      location: eventForm.location || undefined,
                      reminder: eventForm.reminder,
                      repeat: eventForm.repeat,
                      notification: eventForm.notification,
                    }

                    try {
                      if (editingEvent) {
                        await updateEvent(editingEvent.id, eventData)
                      } else {
                        await addEvent(eventData)
                      }
                      setShowEventModal(false)
                      setEditingEvent(null)
                      setEventForm(getDefaultEventForm(currentDate))
                    } catch (error) {
                      console.error('Error guardant esdeveniment:', error)
                    }
                  }}
                  disabled={!eventForm.title.trim() || (!eventForm.allDay && !eventForm.startTime)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEvent ? 'Guardar canvis' : 'Afegir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Afegir Tasca */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TargetIcon size="md" />
                  <h3 className="text-lg font-semibold text-gray-900">Nova tasca</h3>
                </div>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Què has de fer?
                </label>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTaskText.trim()) {
                      addTask(newTaskText.trim())
                      setNewTaskText('')
                      setShowTaskModal(false)
                    }
                  }}
                  placeholder="Ex: Revisar documentació"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={() => {
                    if (newTaskText.trim()) {
                      addTask(newTaskText.trim())
                      setNewTaskText('')
                      setShowTaskModal(false)
                    }
                  }}
                  disabled={!newTaskText.trim()}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Afegir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Configuración */}
      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        modules={modules}
        onToggleModule={toggleModule}
      />
    </div>
  )
}