'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit,
  Trash2,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  HelpCircle,
  Play,
  Clock,
  Users,
  Star,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
  MoreHorizontal,
  Copy,
  MoveVertical
} from 'lucide-react'
import { ModuleModal } from './components/ModuleModal'
import { LessonEditorModal } from './components/LessonEditorModal'
import { QuizEditorModal } from './components/QuizEditorModal'

interface Lesson {
  id: string
  title: string
  slug: string
  type: 'TEXT' | 'VIDEO' | 'QUIZ' | 'DOCUMENT' | 'EXTERNAL' | 'INTERACTIVE'
  estimatedDuration: number | null
  isFree: boolean
  isPublished: boolean
  order: number
  quiz?: {
    id: string
    title: string
    passingScore: number
    _count: { questions: number }
  } | null
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  isPublished: boolean
  isFree: boolean
  lessons: Lesson[]
  _count: { lessons: number }
}

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  shortDescription: string | null
  thumbnail: string | null
  coverImage: string | null
  type: 'MICRO' | 'BASIC' | 'COMPLETE' | 'PREMIUM'
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  isPublished: boolean
  isFeatured: boolean
  isActive: boolean
  isFree: boolean
  price: number | null
  hasCertificate: boolean
  requirements: string[]
  objectives: string[]
  targetAudience: string | null
  instructorName: string | null
  instructorBio: string | null
  category: { id: string; name: string } | null
  modules: Module[]
  _count: {
    modules: number
    enrollments: number
    reviews: number
  }
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content')

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [editingQuizLessonId, setEditingQuizLessonId] = useState<string | null>(null)

  const [lessonActionMenu, setLessonActionMenu] = useState<string | null>(null)

  // Form state for settings
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    type: 'BASIC' as Course['type'],
    level: 'BEGINNER' as Course['level'],
    isFree: true,
    price: '',
    hasCertificate: false,
    requirements: [] as string[],
    objectives: [] as string[],
    targetAudience: '',
    instructorName: '',
    instructorBio: ''
  })

  useEffect(() => {
    loadCourse()
  }, [id])

  async function loadCourse() {
    try {
      const response = await fetch(`/api/gestio/courses/${id}`)
      const data = await response.json()

      if (response.ok && data.course) {
        setCourse(data.course)
        setFormData({
          title: data.course.title || '',
          shortDescription: data.course.shortDescription || '',
          description: data.course.description || '',
          type: data.course.type,
          level: data.course.level,
          isFree: data.course.isFree,
          price: data.course.price?.toString() || '',
          hasCertificate: data.course.hasCertificate,
          requirements: data.course.requirements || [],
          objectives: data.course.objectives || [],
          targetAudience: data.course.targetAudience || '',
          instructorName: data.course.instructorName || '',
          instructorBio: data.course.instructorBio || ''
        })
        // Expand all modules by default
        setExpandedModules(new Set(data.course.modules.map((m: Module) => m.id)))
      }
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveSettings() {
    setSaving(true)
    try {
      const response = await fetch(`/api/gestio/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          shortDescription: formData.shortDescription,
          description: formData.description,
          type: formData.type,
          level: formData.level,
          isFree: formData.isFree,
          price: formData.isFree ? null : parseFloat(formData.price) || null,
          hasCertificate: formData.hasCertificate,
          requirements: formData.requirements,
          objectives: formData.objectives,
          targetAudience: formData.targetAudience,
          instructorName: formData.instructorName,
          instructorBio: formData.instructorBio
        })
      })

      if (response.ok) {
        loadCourse()
      }
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleTogglePublish() {
    try {
      const response = await fetch(`/api/gestio/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', isPublished: !course?.isPublished })
      })

      if (response.ok) {
        loadCourse()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm('Estàs segur que vols eliminar aquest mòdul i totes les seves lliçons?')) return

    try {
      const response = await fetch(`/api/gestio/courses/modules?id=${moduleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadCourse()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    if (!confirm('Estàs segur que vols eliminar aquesta lliçó?')) return

    try {
      const response = await fetch(`/api/gestio/courses/lessons?id=${lessonId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadCourse()
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setLessonActionMenu(null)
  }

  function toggleModule(moduleId: string) {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  function getLessonIcon(type: string) {
    switch (type) {
      case 'VIDEO': return <Video className="w-4 h-4 text-purple-500" />
      case 'QUIZ': return <HelpCircle className="w-4 h-4 text-amber-500" />
      case 'DOCUMENT': return <FileText className="w-4 h-4 text-blue-500" />
      case 'EXTERNAL': return <ExternalLink className="w-4 h-4 text-green-500" />
      case 'INTERACTIVE': return <Play className="w-4 h-4 text-pink-500" />
      default: return <BookOpen className="w-4 h-4 text-gray-500" />
    }
  }

  function getTypeLabel(type: string) {
    const labels: Record<string, string> = {
      MICRO: 'Micro',
      BASIC: 'Bàsic',
      COMPLETE: 'Complet',
      PREMIUM: 'Premium'
    }
    return labels[type] || type
  }

  function getLevelLabel(level: string) {
    const labels: Record<string, string> = {
      BEGINNER: 'Principiant',
      INTERMEDIATE: 'Intermedi',
      ADVANCED: 'Avançat',
      EXPERT: 'Expert'
    }
    return labels[level] || level
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-gray-900">Curs no trobat</h2>
        <button
          onClick={() => router.push('/gestio/contingut/formacio')}
          className="mt-4 text-purple-600 hover:underline"
        >
          Tornar a la llista
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/gestio/contingut/formacio')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    course.type === 'PREMIUM' ? 'bg-amber-100 text-amber-700' :
                    course.type === 'COMPLETE' ? 'bg-purple-100 text-purple-700' :
                    course.type === 'BASIC' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {getTypeLabel(course.type)}
                  </span>
                  <span className="text-sm text-gray-500">{getLevelLabel(course.level)}</span>
                  {course.isPublished ? (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Publicat
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <XCircle className="w-4 h-4" />
                      Esborrany
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePublish}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  course.isPublished
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {course.isPublished ? 'Despublicar' : 'Publicar'}
              </button>
              <button
                onClick={() => window.open(`/dashboard/formacio/${course.slug}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                Previsualitzar
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-4 -mb-px">
            <button
              onClick={() => setActiveTab('content')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'content'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Contingut
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuració
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'content' ? (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{course._count.modules}</p>
                    <p className="text-sm text-gray-500">Mòduls</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{course._count.enrollments}</p>
                    <p className="text-sm text-gray-500">Inscripcions</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{course._count.reviews}</p>
                    <p className="text-sm text-gray-500">Valoracions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Module Button */}
            <button
              onClick={() => {
                setEditingModule(null)
                setShowModuleModal(true)
              }}
              className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Afegir mòdul
            </button>

            {/* Modules */}
            {course.modules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sense mòduls</h3>
                <p className="text-gray-500">Comença afegint el primer mòdul del curs</p>
              </div>
            ) : (
              <div className="space-y-3">
                {course.modules.map((module, moduleIndex) => (
                  <div
                    key={module.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    {/* Module Header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        <button className="p-1">
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-purple-600">
                              Mòdul {moduleIndex + 1}
                            </span>
                            <span className="font-medium text-gray-900">{module.title}</span>
                            {!module.isPublished && (
                              <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                                Esborrany
                              </span>
                            )}
                            {module.isFree && (
                              <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                Gratuït
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {module._count.lessons} lliçons
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedModuleId(module.id)
                            setEditingLesson(null)
                            setShowLessonModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Afegir lliçó"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingModule(module)
                            setShowModuleModal(true)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Editar mòdul"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar mòdul"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons */}
                    {expandedModules.has(module.id) && (
                      <div className="divide-y divide-gray-100">
                        {module.lessons.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-400">
                            <p className="text-sm">No hi ha lliçons en aquest mòdul</p>
                            <button
                              onClick={() => {
                                setSelectedModuleId(module.id)
                                setEditingLesson(null)
                                setShowLessonModal(true)
                              }}
                              className="mt-2 text-sm text-purple-600 hover:underline"
                            >
                              Afegir primera lliçó
                            </button>
                          </div>
                        ) : (
                          module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                                {getLessonIcon(lesson.type)}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-900">{lesson.title}</span>
                                    {!lesson.isPublished && (
                                      <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                                        Esborrany
                                      </span>
                                    )}
                                    {lesson.isFree && (
                                      <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                        Gratuït
                                      </span>
                                    )}
                                    {lesson.type === 'QUIZ' && lesson.quiz && (
                                      <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                                        {lesson.quiz._count.questions} preguntes
                                      </span>
                                    )}
                                  </div>
                                  {lesson.estimatedDuration && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {lesson.estimatedDuration} min
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 relative">
                                <button
                                  onClick={() => {
                                    setSelectedModuleId(module.id)
                                    setEditingLesson(lesson)
                                    setShowLessonModal(true)
                                  }}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {lesson.type === 'QUIZ' && (
                                  <button
                                    onClick={() => {
                                      setEditingQuizLessonId(lesson.id)
                                      setShowQuizModal(true)
                                    }}
                                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                    title="Editar quiz"
                                  >
                                    <HelpCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => setLessonActionMenu(lessonActionMenu === lesson.id ? null : lesson.id)}
                                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {lessonActionMenu === lesson.id && (
                                  <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                    <button
                                      onClick={() => handleDeleteLesson(lesson.id)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Settings Tab
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Configuració del curs</h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Títol</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripció curta</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={2}
                  maxLength={160}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{formData.shortDescription.length}/160</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripció completa</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Type & Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipus</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Course['type'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="MICRO">Micro</option>
                    <option value="BASIC">Bàsic</option>
                    <option value="COMPLETE">Complet</option>
                    <option value="PREMIUM">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nivell</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as Course['level'] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="BEGINNER">Principiant</option>
                    <option value="INTERMEDIATE">Intermedi</option>
                    <option value="ADVANCED">Avançat</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preu</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFree}
                      onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Curs gratuït</span>
                  </label>
                  {!formData.isFree && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-gray-500">€</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasCertificate}
                    onChange={(e) => setFormData({ ...formData, hasCertificate: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Ofereix certificat al completar</span>
                </label>
              </div>

              {/* Instructor */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900">Instructor</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biografia</label>
                  <textarea
                    value={formData.instructorBio}
                    onChange={(e) => setFormData({ ...formData, instructorBio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Audiència objectiu</label>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardant...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar canvis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModuleModal && (
        <ModuleModal
          courseId={id}
          module={editingModule}
          onClose={() => {
            setShowModuleModal(false)
            setEditingModule(null)
          }}
          onSuccess={() => {
            setShowModuleModal(false)
            setEditingModule(null)
            loadCourse()
          }}
        />
      )}

      {showLessonModal && selectedModuleId && (
        <LessonEditorModal
          moduleId={selectedModuleId}
          lesson={editingLesson}
          onClose={() => {
            setShowLessonModal(false)
            setEditingLesson(null)
            setSelectedModuleId(null)
          }}
          onSuccess={() => {
            setShowLessonModal(false)
            setEditingLesson(null)
            setSelectedModuleId(null)
            loadCourse()
          }}
        />
      )}

      {showQuizModal && editingQuizLessonId && (
        <QuizEditorModal
          lessonId={editingQuizLessonId}
          onClose={() => {
            setShowQuizModal(false)
            setEditingQuizLessonId(null)
          }}
          onSuccess={() => {
            setShowQuizModal(false)
            setEditingQuizLessonId(null)
            loadCourse()
          }}
        />
      )}
    </div>
  )
}
