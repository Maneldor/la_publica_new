'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Sparkles,
  FolderOpen,
  Search,
  Filter,
  BookOpen,
  Users,
  Clock,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  GraduationCap,
  TrendingUp,
  Award
} from 'lucide-react'
import { GenerateCourseModal } from './components/GenerateCourseModal'
import { CreateCourseModal } from './components/CreateCourseModal'
import { CategoriesModal } from './components/CategoriesModal'

interface Course {
  id: string
  title: string
  shortDescription: string | null
  thumbnail: string | null
  type: 'MICRO' | 'BASIC' | 'COMPLETE' | 'PREMIUM'
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  isPublished: boolean
  isFeatured: boolean
  isActive: boolean
  isFree: boolean
  price: number | null
  createdAt: string
  category: { id: string; name: string } | null
  _count: {
    modules: number
    enrollments: number
    reviews: number
  }
  stats?: {
    avgRating: number
    completionRate: number
    totalDuration: number
  }
}

interface Category {
  id: string
  name: string
  description: string | null
  _count: { courses: number }
}

interface Stats {
  totalCourses: number
  publishedCourses: number
  totalEnrollments: number
  avgRating: number
}

export default function FormacioPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [searchQuery, selectedCategory, selectedType, selectedStatus])

  async function loadData() {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (selectedCategory) params.set('categoryId', selectedCategory)
      if (selectedType) params.set('type', selectedType)
      if (selectedStatus === 'published') params.set('isPublished', 'true')
      if (selectedStatus === 'draft') params.set('isPublished', 'false')

      const response = await fetch(`/api/gestio/courses?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setCourses(data.courses || [])
        setCategories(data.categories || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteCourse(id: string) {
    if (!confirm('Estàs segur que vols eliminar aquest curs?')) return

    try {
      const response = await fetch(`/api/gestio/courses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData()
      } else {
        const data = await response.json()
        alert(data.error || 'Error eliminant el curs')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error eliminant el curs')
    }
    setActionMenuId(null)
  }

  async function handleDuplicateCourse(id: string, title: string) {
    const newTitle = prompt('Nom del nou curs:', `${title} (còpia)`)
    if (!newTitle) return

    try {
      const response = await fetch(`/api/gestio/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', newTitle })
      })

      if (response.ok) {
        loadData()
      } else {
        alert('Error duplicant el curs')
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setActionMenuId(null)
  }

  async function handleTogglePublish(id: string, isPublished: boolean) {
    try {
      const response = await fetch(`/api/gestio/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', isPublished: !isPublished })
      })

      if (response.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setActionMenuId(null)
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

  function getTypeColor(type: string) {
    const colors: Record<string, string> = {
      MICRO: 'bg-blue-100 text-blue-700',
      BASIC: 'bg-green-100 text-green-700',
      COMPLETE: 'bg-purple-100 text-purple-700',
      PREMIUM: 'bg-amber-100 text-amber-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestió de Formació</h1>
        <p className="text-gray-600 mt-1">Crea i gestiona cursos formatius</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className="text-sm text-gray-500">Cursos totals</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedCourses}</p>
                <p className="text-sm text-gray-500">Publicats</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
                <p className="text-sm text-gray-500">Inscripcions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{(stats.avgRating ?? 0).toFixed(1)}</p>
                <p className="text-sm text-gray-500">Valoració mitjana</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Generar amb IA
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          <Plus className="w-4 h-4" />
          Crear manualment
        </button>
        <button
          onClick={() => setShowCategoriesModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
        >
          <FolderOpen className="w-4 h-4" />
          Categories
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cercar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          >
            <option value="">Totes les categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat._count.courses})
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          >
            <option value="">Tots els tipus</option>
            <option value="MICRO">Micro</option>
            <option value="BASIC">Bàsic</option>
            <option value="COMPLETE">Complet</option>
            <option value="PREMIUM">Premium</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          >
            <option value="">Tots els estats</option>
            <option value="published">Publicats</option>
            <option value="draft">Esborranys</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hi ha cursos</h3>
          <p className="text-gray-500 mb-4">
            Comença creant el teu primer curs manualment o amb IA
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4" />
              Generar amb IA
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              Crear manualment
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br from-purple-100 to-indigo-100">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-12 h-12 text-purple-300" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(course.type)}`}>
                    {getTypeLabel(course.type)}
                  </span>
                  {course.isFeatured && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                      Destacat
                    </span>
                  )}
                </div>
                {/* Status */}
                <div className="absolute top-2 right-2">
                  {course.isPublished ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      Publicat
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      <XCircle className="w-3 h-3" />
                      Esborrany
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuId(actionMenuId === course.id ? null : course.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                    {actionMenuId === course.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => router.push(`/gestio/contingut/formacio/${course.id}`)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleTogglePublish(course.id, course.isPublished)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          {course.isPublished ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              Despublicar
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Publicar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDuplicateCourse(course.id, course.title)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicar
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {course.shortDescription && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {course.shortDescription}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course._count.modules} mòduls
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course._count.enrollments}
                  </span>
                  {course.stats && (course.stats.avgRating ?? 0) > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      {(course.stats.avgRating ?? 0).toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Category & Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {course.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {course.category.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {getLevelLabel(course.level)}
                    </span>
                  </div>
                  {course.isFree ? (
                    <span className="text-sm font-medium text-green-600">Gratuït</span>
                  ) : course.price ? (
                    <span className="text-sm font-medium text-gray-900">
                      {course.price.toFixed(2)}€
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => router.push(`/gestio/contingut/formacio/${course.id}`)}
                  className="w-full py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  Gestionar curs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showGenerateModal && (
        <GenerateCourseModal
          categories={categories}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={(courseId) => {
            setShowGenerateModal(false)
            router.push(`/gestio/contingut/formacio/${courseId}`)
          }}
        />
      )}

      {showCreateModal && (
        <CreateCourseModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(courseId) => {
            setShowCreateModal(false)
            router.push(`/gestio/contingut/formacio/${courseId}`)
          }}
        />
      )}

      {showCategoriesModal && (
        <CategoriesModal
          onClose={() => {
            setShowCategoriesModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}
