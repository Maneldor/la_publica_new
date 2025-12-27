'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  Plus,
  Settings,
  Play,
  Pause,
  RefreshCw,
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Tag,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  Edit,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import ScheduleConfigModal from './components/ScheduleConfigModal'
import FixedTopicModal from './components/FixedTopicModal'
import DynamicTopicModal from './components/DynamicTopicModal'
import ScheduleLogsModal from './components/ScheduleLogsModal'

interface Category {
  id: string
  name: string
  color: string | null
}

interface FixedTopic {
  id: string
  dayOfWeek: number
  topic: string
  description: string | null
  category: Category | null
  keywords: string[]
  suggestedSubtopics: string[]
}

interface DynamicTopic {
  id: string
  topic: string
  description: string | null
  category: Category | null
  keywords: string[]
  priority: number
  status: 'PENDING' | 'USED' | 'SKIPPED' | 'SCHEDULED'
  useAfterDate: string | null
  useBeforeDate: string | null
}

interface Schedule {
  id: string
  name: string
  isActive: boolean
  isPaused: boolean
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  daysOfWeek: number[]
  publishTime: string
  autoPublish: boolean
  language: string
  tone: string
  articleLength: 'SHORT' | 'MEDIUM' | 'LONG' | 'EXTRA_LONG'
  defaultCategory: Category | null
  defaultCategoryId: string | null
  defaultVisibility: 'PUBLIC' | 'GROUPS' | 'PRIVATE'
  notifyOnGenerate: boolean
  notifyUserIds: string[]
  lastRunAt: string | null
  nextRunAt: string | null
  fixedTopics: FixedTopic[]
  dynamicTopics: DynamicTopic[]
  createdBy: { id: string; name: string | null; nick: string | null }
  _count: {
    logs: number
    fixedTopics: number
    dynamicTopics: number
  }
}

interface ScheduleStats {
  schedule: Schedule
  stats: {
    totalGenerated: number
    successfulGenerations: number
    failedGenerations: number
    pendingDynamicTopics: number
    usedDynamicTopics: number
    postsGenerated: number
    avgGenerationTime: number
    lastWeekGenerations: number
  }
  recentLogs: Array<{
    id: string
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED'
    topicType: 'FIXED' | 'DYNAMIC' | null
    topicUsed: string | null
    postTitle: string | null
    errorMessage: string | null
    executionTime: number | null
    createdAt: string
  }>
}

const DAYS = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge']
const FREQUENCY_LABELS = {
  DAILY: 'Diari',
  WEEKLY: 'Setmanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensual'
}
const LENGTH_LABELS = {
  SHORT: 'Curt (~500 paraules)',
  MEDIUM: 'Mitjà (~1000 paraules)',
  LONG: 'Llarg (~1500 paraules)',
  EXTRA_LONG: 'Molt llarg (~2000 paraules)'
}

export default function BlogProgramacioPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Modals
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showFixedTopicModal, setShowFixedTopicModal] = useState(false)
  const [showDynamicTopicModal, setShowDynamicTopicModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [editingFixedTopic, setEditingFixedTopic] = useState<FixedTopic | null>(null)
  const [editingDynamicTopic, setEditingDynamicTopic] = useState<DynamicTopic | null>(null)

  // Actions
  const [isRunning, setIsRunning] = useState<string | null>(null)
  const [isPausing, setIsPausing] = useState<string | null>(null)

  useEffect(() => {
    loadSchedules()
    loadCategories()
  }, [])

  const loadSchedules = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/gestio/blog/auto-schedule')
      const data = await res.json()
      if (res.ok && data.schedules) {
        setSchedules(data.schedules)
        // Auto-select first schedule if exists
        if (data.schedules.length > 0 && !selectedSchedule) {
          await loadScheduleDetail(data.schedules[0].id)
        }
      }
    } catch (error) {
      console.error('Error carregant programacions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadScheduleDetail = async (scheduleId: string) => {
    setIsLoadingDetail(true)
    try {
      const res = await fetch(`/api/gestio/blog/auto-schedule/${scheduleId}`)
      const data = await res.json()
      if (res.ok) {
        setSelectedSchedule(data)
      }
    } catch (error) {
      console.error('Error carregant detall:', error)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/blog/categories')
      const data = await res.json()
      if (res.ok) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error carregant categories:', error)
    }
  }

  const handleTogglePause = async (scheduleId: string) => {
    setIsPausing(scheduleId)
    try {
      const res = await fetch(`/api/gestio/blog/auto-schedule/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_pause' })
      })
      if (res.ok) {
        await loadSchedules()
        if (selectedSchedule?.schedule.id === scheduleId) {
          await loadScheduleDetail(scheduleId)
        }
      }
    } catch (error) {
      console.error('Error canviant pausa:', error)
    } finally {
      setIsPausing(null)
    }
  }

  const handleRunNow = async (scheduleId: string) => {
    if (!confirm('Vols executar la generació ara mateix? Això crearà un nou article basat en la configuració actual.')) return

    setIsRunning(scheduleId)
    try {
      const res = await fetch(`/api/gestio/blog/auto-schedule/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_now' })
      })
      const data = await res.json()
      if (res.ok) {
        if (data.postId) {
          alert(`Article generat correctament! ID: ${data.postId}`)
        }
        await loadScheduleDetail(scheduleId)
      } else {
        alert(data.error || 'Error executant generació')
      }
    } catch (error) {
      console.error('Error executant:', error)
      alert('Error executant generació')
    } finally {
      setIsRunning(null)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Segur que vols eliminar aquesta programació? Això eliminarà també tots els temes associats.')) return

    try {
      const res = await fetch(`/api/gestio/blog/auto-schedule/${scheduleId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await loadSchedules()
        if (selectedSchedule?.schedule.id === scheduleId) {
          setSelectedSchedule(null)
        }
      }
    } catch (error) {
      console.error('Error eliminant:', error)
    }
  }

  const handleDeleteTopic = async (topicId: string, type: 'fixed' | 'dynamic') => {
    if (!confirm('Segur que vols eliminar aquest tema?')) return
    if (!selectedSchedule) return

    try {
      const res = await fetch(`/api/gestio/blog/auto-schedule/${selectedSchedule.schedule.id}/topics?topicId=${topicId}&type=${type}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await loadScheduleDetail(selectedSchedule.schedule.id)
      }
    } catch (error) {
      console.error('Error eliminant tema:', error)
    }
  }

  const openEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setShowConfigModal(true)
  }

  const openNewSchedule = () => {
    setEditingSchedule(null)
    setShowConfigModal(true)
  }

  const handleScheduleSaved = async () => {
    setShowConfigModal(false)
    setEditingSchedule(null)
    await loadSchedules()
  }

  const handleTopicSaved = async () => {
    setShowFixedTopicModal(false)
    setShowDynamicTopicModal(false)
    setEditingFixedTopic(null)
    setEditingDynamicTopic(null)
    if (selectedSchedule) {
      await loadScheduleDetail(selectedSchedule.schedule.id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregant programacions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/gestio/contingut/blog"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-indigo-600" />
              Programació Automàtica
            </h1>
            <p className="text-gray-600 mt-1">
              Configura la generació automàtica d&apos;articles amb IA
            </p>
          </div>
        </div>
        <button
          onClick={openNewSchedule}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova programació
        </button>
      </div>

      {schedules.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Cap programació configurada
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Crea una programació per generar articles automàticament amb IA segons els temes i la freqüència que defineixis.
          </p>
          <button
            onClick={openNewSchedule}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            Crear primera programació
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedules list */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Programacions
            </h2>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                onClick={() => loadScheduleDetail(schedule.id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedSchedule?.schedule.id === schedule.id
                    ? 'border-indigo-500 ring-2 ring-indigo-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                    <p className="text-sm text-gray-500">
                      {FREQUENCY_LABELS[schedule.frequency]} · {schedule.publishTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {schedule.isPaused ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                        Pausat
                      </span>
                    ) : schedule.isActive ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Actiu
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        Inactiu
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {schedule._count.fixedTopics} fixes
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {schedule._count.dynamicTopics} dinàmics
                  </span>
                  <span className="flex items-center gap-1">
                    <History className="w-3.5 h-3.5" />
                    {schedule._count.logs}
                  </span>
                </div>
                {schedule.nextRunAt && !schedule.isPaused && (
                  <p className="text-xs text-indigo-600 mt-2">
                    Pròxima: {new Date(schedule.nextRunAt).toLocaleString('ca-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Schedule detail */}
          <div className="lg:col-span-2">
            {isLoadingDetail ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
              </div>
            ) : selectedSchedule ? (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedSchedule.stats.successfulGenerations}
                        </p>
                        <p className="text-xs text-gray-500">Èxits</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedSchedule.stats.failedGenerations}
                        </p>
                        <p className="text-xs text-gray-500">Errors</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedSchedule.stats.postsGenerated}
                        </p>
                        <p className="text-xs text-gray-500">Articles</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedSchedule.stats.avgGenerationTime > 0
                            ? `${Math.round(selectedSchedule.stats.avgGenerationTime / 1000)}s`
                            : '-'}
                        </p>
                        <p className="text-xs text-gray-500">Temps mig</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions bar */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleTogglePause(selectedSchedule.schedule.id)}
                      disabled={isPausing === selectedSchedule.schedule.id}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedSchedule.schedule.isPaused
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {isPausing === selectedSchedule.schedule.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : selectedSchedule.schedule.isPaused ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                      {selectedSchedule.schedule.isPaused ? 'Reprendre' : 'Pausar'}
                    </button>

                    <button
                      onClick={() => handleRunNow(selectedSchedule.schedule.id)}
                      disabled={isRunning === selectedSchedule.schedule.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      {isRunning === selectedSchedule.schedule.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      Executar ara
                    </button>

                    <button
                      onClick={() => setShowLogsModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      <History className="w-4 h-4" />
                      Historial
                    </button>

                    <div className="flex-1" />

                    <button
                      onClick={() => openEditSchedule(selectedSchedule.schedule)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Configurar
                    </button>

                    <button
                      onClick={() => handleDeleteSchedule(selectedSchedule.schedule.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Fixed topics (Calendar) */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Temes Fixes (Setmanals)</h3>
                      <p className="text-sm text-gray-500">Temes assignats a dies específics de la setmana</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingFixedTopic(null)
                        setShowFixedTopicModal(true)
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Afegir
                    </button>
                  </div>
                  <div className="grid grid-cols-7 divide-x divide-gray-200">
                    {DAYS.map((day, index) => {
                      const topic = selectedSchedule.schedule.fixedTopics.find(t => t.dayOfWeek === index)
                      const isActiveDay = selectedSchedule.schedule.daysOfWeek.includes(index)

                      return (
                        <div
                          key={day}
                          className={`p-3 min-h-[120px] ${
                            isActiveDay ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <p className={`text-xs font-medium mb-2 ${
                            isActiveDay ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {day.substring(0, 3)}
                          </p>
                          {topic ? (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                {topic.topic}
                              </p>
                              {topic.category && (
                                <span
                                  className="inline-block px-1.5 py-0.5 text-xs rounded text-white"
                                  style={{ backgroundColor: topic.category.color || '#6366f1' }}
                                >
                                  {topic.category.name}
                                </span>
                              )}
                              <div className="flex gap-1 pt-1">
                                <button
                                  onClick={() => {
                                    setEditingFixedTopic(topic)
                                    setShowFixedTopicModal(true)
                                  }}
                                  className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTopic(topic.id, 'fixed')}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : isActiveDay ? (
                            <button
                              onClick={() => {
                                setEditingFixedTopic({ dayOfWeek: index } as FixedTopic)
                                setShowFixedTopicModal(true)
                              }}
                              className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Dynamic topics pool */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Pool de Temes Dinàmics</h3>
                      <p className="text-sm text-gray-500">
                        Temes que s&apos;utilitzen quan no hi ha tema fix ({selectedSchedule.stats.pendingDynamicTopics} pendents)
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingDynamicTopic(null)
                        setShowDynamicTopicModal(true)
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Afegir
                    </button>
                  </div>
                  {selectedSchedule.schedule.dynamicTopics.length === 0 ? (
                    <div className="p-8 text-center">
                      <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Cap tema dinàmic configurat</p>
                      <button
                        onClick={() => {
                          setEditingDynamicTopic(null)
                          setShowDynamicTopicModal(true)
                        }}
                        className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        Afegir primer tema
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {selectedSchedule.schedule.dynamicTopics.map((topic) => (
                        <div key={topic.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {topic.topic}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                                  topic.status === 'PENDING'
                                    ? 'bg-blue-100 text-blue-700'
                                    : topic.status === 'USED'
                                    ? 'bg-green-100 text-green-700'
                                    : topic.status === 'SCHEDULED'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {topic.status}
                                </span>
                                {topic.priority > 0 && (
                                  <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">
                                    Prioritat: {topic.priority}
                                  </span>
                                )}
                              </div>
                              {topic.description && (
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {topic.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                {topic.category && (
                                  <span
                                    className="px-1.5 py-0.5 rounded text-white"
                                    style={{ backgroundColor: topic.category.color || '#6366f1' }}
                                  >
                                    {topic.category.name}
                                  </span>
                                )}
                                {topic.keywords.length > 0 && (
                                  <span>{topic.keywords.length} paraules clau</span>
                                )}
                                {topic.useAfterDate && (
                                  <span>Des de: {new Date(topic.useAfterDate).toLocaleDateString('ca-ES')}</span>
                                )}
                                {topic.useBeforeDate && (
                                  <span>Fins: {new Date(topic.useBeforeDate).toLocaleDateString('ca-ES')}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingDynamicTopic(topic)
                                  setShowDynamicTopicModal(true)
                                }}
                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTopic(topic.id, 'dynamic')}
                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent logs */}
                {selectedSchedule.recentLogs.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Últimes execucions</h3>
                      <button
                        onClick={() => setShowLogsModal(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Veure tot
                      </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {selectedSchedule.recentLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="px-6 py-3 flex items-center gap-4">
                          {log.status === 'SUCCESS' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : log.status === 'FAILED' ? (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          ) : log.status === 'RUNNING' ? (
                            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {log.postTitle || log.topicUsed || 'Execució'}
                            </p>
                            {log.errorMessage && (
                              <p className="text-xs text-red-500 truncate">{log.errorMessage}</p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex-shrink-0">
                            {new Date(log.createdAt).toLocaleString('ca-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {log.executionTime && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {Math.round(log.executionTime / 1000)}s
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona una programació per veure els detalls</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showConfigModal && (
        <ScheduleConfigModal
          schedule={editingSchedule}
          categories={categories}
          onClose={() => {
            setShowConfigModal(false)
            setEditingSchedule(null)
          }}
          onSaved={handleScheduleSaved}
        />
      )}

      {showFixedTopicModal && selectedSchedule && (
        <FixedTopicModal
          scheduleId={selectedSchedule.schedule.id}
          topic={editingFixedTopic}
          categories={categories}
          existingDays={selectedSchedule.schedule.fixedTopics.map(t => t.dayOfWeek)}
          onClose={() => {
            setShowFixedTopicModal(false)
            setEditingFixedTopic(null)
          }}
          onSaved={handleTopicSaved}
        />
      )}

      {showDynamicTopicModal && selectedSchedule && (
        <DynamicTopicModal
          scheduleId={selectedSchedule.schedule.id}
          topic={editingDynamicTopic}
          categories={categories}
          onClose={() => {
            setShowDynamicTopicModal(false)
            setEditingDynamicTopic(null)
          }}
          onSaved={handleTopicSaved}
        />
      )}

      {showLogsModal && selectedSchedule && (
        <ScheduleLogsModal
          scheduleId={selectedSchedule.schedule.id}
          onClose={() => setShowLogsModal(false)}
        />
      )}
    </div>
  )
}
