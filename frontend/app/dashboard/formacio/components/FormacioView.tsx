'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  GraduationCap,
  Heart,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  Users,
  Video,
  MapPin,
  Building2,
  Grid3X3,
  List,
  Award,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  institution: string
  logo: string
  featuredImage: string
  instructorAvatar: string
  category: string
  duration: number
  level: string
  mode: 'online' | 'presencial' | 'hibrid'
  price: number
  originalPrice: number
  startDate: string
  endDate: string
  availableSlots: number
  totalSlots: number
  isHighlighted: boolean
  isFavorite: boolean
  enrolled: number
  rating: number
  createdAt: string
}

interface FormacioViewProps {
  userId: string
}

type TabType = 'tots' | 'recomanats' | 'meus' | 'finalitzats' | 'nous'
type ViewMode = 'grid' | 'list'

// Datos de ejemplo
const sampleCourses: Course[] = [
  {
    id: 1,
    title: 'Desenvolupament Web amb React',
    description: 'Aprèn a crear aplicacions web modernes amb React, hooks i eines actuals del desenvolupament frontend.',
    instructor: 'Marc González',
    institution: 'TechAcademy Barcelona',
    logo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    category: 'Tecnologia',
    duration: 40,
    level: 'Intermedi',
    mode: 'online',
    price: 299,
    originalPrice: 399,
    startDate: '2024-11-15',
    endDate: '2024-12-20',
    availableSlots: 15,
    totalSlots: 25,
    isHighlighted: true,
    isFavorite: false,
    enrolled: 156,
    rating: 4.8,
    createdAt: 'fa 2 dies'
  },
  {
    id: 2,
    title: 'Excel Avançat per a Professionals',
    description: 'Domina les funcions avançades d\'Excel: taules dinàmiques, macros, anàlisi de dades i automatització.',
    instructor: 'Laura Martínez',
    institution: 'Institut de Formació Professional',
    logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=80&h=80&fit=crop&crop=face',
    category: 'Ofimàtica',
    duration: 20,
    level: 'Avançat',
    mode: 'presencial',
    price: 180,
    originalPrice: 180,
    startDate: '2024-11-08',
    endDate: '2024-11-29',
    availableSlots: 8,
    totalSlots: 20,
    isHighlighted: false,
    isFavorite: true,
    enrolled: 89,
    rating: 4.9,
    createdAt: 'fa 1 setmana'
  },
  {
    id: 3,
    title: 'Disseny UX/UI amb Figma',
    description: 'Curs complet de disseny d\'experiència d\'usuari i interfícies amb Figma, des de zero fins a nivell professional.',
    instructor: 'Anna Roca',
    institution: 'Escola de Disseny Digital',
    logo: 'https://images.unsplash.com/photo-1558655146-9f40138edf8d?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    category: 'Disseny',
    duration: 35,
    level: 'Principiant',
    mode: 'hibrid',
    price: 350,
    originalPrice: 450,
    startDate: '2024-11-10',
    endDate: '2024-12-15',
    availableSlots: 22,
    totalSlots: 30,
    isHighlighted: true,
    isFavorite: false,
    enrolled: 234,
    rating: 4.7,
    createdAt: 'fa 3 dies'
  },
  {
    id: 4,
    title: 'Màrqueting Digital i SEO',
    description: 'Estratègies de màrqueting digital, SEO, SEM, analítica web i campanyes publicitàries en xarxes socials.',
    instructor: 'David Torres',
    institution: 'Marketing Institute',
    logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    category: 'Màrqueting Digital',
    duration: 30,
    level: 'Intermedi',
    mode: 'online',
    price: 250,
    originalPrice: 320,
    startDate: '2024-11-20',
    endDate: '2024-12-18',
    availableSlots: 12,
    totalSlots: 35,
    isHighlighted: false,
    isFavorite: true,
    enrolled: 178,
    rating: 4.6,
    createdAt: 'fa 5 dies'
  },
  {
    id: 5,
    title: 'Anglès Tècnic per a Professionals',
    description: 'Millora el teu anglès professional amb vocabulari tècnic, presentacions i comunicació empresarial.',
    instructor: 'Sarah Johnson',
    institution: 'English Professional Center',
    logo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
    category: 'Idiomes',
    duration: 25,
    level: 'Intermedi',
    mode: 'presencial',
    price: 220,
    originalPrice: 220,
    startDate: '2024-11-12',
    endDate: '2024-12-10',
    availableSlots: 6,
    totalSlots: 15,
    isHighlighted: false,
    isFavorite: false,
    enrolled: 67,
    rating: 4.8,
    createdAt: 'fa 1 setmana'
  },
  {
    id: 6,
    title: 'Gestió de Projectes amb Scrum',
    description: 'Metodologies àgils, Scrum Master, planificació de projectes i lideratge d\'equips de desenvolupament.',
    instructor: 'Carlos Ruiz',
    institution: 'Agile Academy',
    logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    category: 'Gestió i Lideratge',
    duration: 28,
    level: 'Avançat',
    mode: 'hibrid',
    price: 380,
    originalPrice: 480,
    startDate: '2024-11-25',
    endDate: '2024-12-23',
    availableSlots: 18,
    totalSlots: 25,
    isHighlighted: true,
    isFavorite: false,
    enrolled: 145,
    rating: 4.9,
    createdAt: 'ahir'
  },
  {
    id: 7,
    title: 'Python per a Anàlisi de Dades',
    description: 'Introducció a Python, pandas, numpy, matplotlib i anàlisi estadístic per a ciència de dades.',
    instructor: 'Elena Vidal',
    institution: 'Data Science Hub',
    logo: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=150&h=150&fit=crop',
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop',
    instructorAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face',
    category: 'Tecnologia',
    duration: 45,
    level: 'Principiant',
    mode: 'online',
    price: 320,
    originalPrice: 420,
    startDate: '2024-11-18',
    endDate: '2024-12-30',
    availableSlots: 25,
    totalSlots: 40,
    isHighlighted: false,
    isFavorite: true,
    enrolled: 298,
    rating: 4.7,
    createdAt: 'fa 4 dies'
  }
]

export function FormacioView({ userId }: FormacioViewProps) {
  const [courses, setCourses] = useState<Course[]>(sampleCourses)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedMode, setSelectedMode] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('tots')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Debounce para búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(debouncedSearch)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedSearch])

  // Categorías disponibles
  const availableCategories = useMemo(() => {
    const categories = new Set(courses.map(c => c.category))
    return Array.from(categories).sort()
  }, [courses])

  // Stats
  const stats = useMemo(() => {
    return {
      disponibles: courses.length,
      meusCursos: 3, // Simulado
      certificats: 7, // Simulado
      hores: 120     // Simulado
    }
  }, [courses])

  // Tab counts
  const tabCounts = useMemo(() => ({
    tots: courses.length,
    recomanats: courses.filter(c => c.isHighlighted).length,
    meus: 3,
    finalitzats: 2,
    nous: courses.filter(c =>
      c.createdAt === 'ahir' ||
      c.createdAt.includes('fa 1 dia') ||
      c.createdAt.includes('fa 2 dies') ||
      c.createdAt.includes('fa 3 dies')
    ).length
  }), [courses])

  // Filtrar cursos
  const filteredCourses = useMemo(() => {
    let filtered = [...courses]

    // Búsqueda
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.instructor.toLowerCase().includes(query) ||
        c.institution.toLowerCase().includes(query)
      )
    }

    // Filtro por categoría
    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory)
    }

    // Filtro por nivel
    if (selectedLevel) {
      filtered = filtered.filter(c => c.level === selectedLevel)
    }

    // Filtro por modalidad
    if (selectedMode) {
      filtered = filtered.filter(c => c.mode === selectedMode)
    }

    // Filtro por tab
    switch (activeTab) {
      case 'recomanats':
        filtered = filtered.filter(c => c.isHighlighted)
        break
      case 'meus':
        filtered = filtered.filter(c => c.rating >= 4.7)
        break
      case 'finalitzats':
        filtered = filtered.slice(-2)
        break
      case 'nous':
        filtered = filtered.filter(c =>
          c.createdAt === 'ahir' ||
          c.createdAt.includes('fa 1 dia') ||
          c.createdAt.includes('fa 2 dies') ||
          c.createdAt.includes('fa 3 dies')
        )
        break
    }

    return filtered
  }, [courses, searchTerm, selectedCategory, selectedLevel, selectedMode, activeTab])

  // Toggle favorito
  const handleToggleFavorite = (e: React.MouseEvent, courseId: number) => {
    e.preventDefault()
    e.stopPropagation()

    setCourses(courses.map(c =>
      c.id === courseId
        ? { ...c, isFavorite: !c.isFavorite }
        : c
    ))
  }

  const tabs = [
    { id: 'tots' as TabType, label: 'Tots', count: tabCounts.tots },
    { id: 'recomanats' as TabType, label: 'Recomanats', count: tabCounts.recomanats },
    { id: 'meus' as TabType, label: 'Els Meus Cursos', count: tabCounts.meus },
    { id: 'finalitzats' as TabType, label: 'Finalitzats', count: tabCounts.finalitzats },
    { id: 'nous' as TabType, label: 'Nous', count: tabCounts.nous }
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Cursos Disponibles"
          value={stats.disponibles}
          icon={<GraduationCap className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          label="Els Meus Cursos"
          value={stats.meusCursos}
          icon={<BookOpen className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          label="Certificats Obtinguts"
          value={stats.certificats}
          icon={<Award className="h-5 w-5 text-yellow-600" />}
        />
        <StatCard
          label="Hores de Formació"
          value={`${stats.hores}h`}
          icon={<Clock className="h-5 w-5 text-purple-600" />}
        />
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cercar cursos per títol, instructor o temàtica..."
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Selector de categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          >
            <option value="">Totes les categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Selector de nivel */}
          <select
            value={selectedLevel}
            onChange={(e) => { setSelectedLevel(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          >
            <option value="">Tots els nivells</option>
            <option value="Principiant">Principiant</option>
            <option value="Intermedi">Intermedi</option>
            <option value="Avançat">Avançat</option>
          </select>

          {/* Botón filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors",
              showFilters || selectedCategory || selectedLevel || selectedMode
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {(selectedCategory || selectedLevel || selectedMode) && (
              <span className="bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {[selectedCategory, selectedLevel, selectedMode].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedCategory(''); setSelectedLevel(''); setSelectedMode(''); setPage(1) }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors",
                  !selectedCategory && !selectedLevel && !selectedMode
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                Netejar filtres
              </button>
              <span className="text-slate-300 px-2">|</span>
              <span className="text-xs text-slate-500 self-center">Modalitat:</span>
              {['online', 'presencial', 'hibrid'].map(mode => (
                <button
                  key={mode}
                  onClick={() => { setSelectedMode(mode); setPage(1) }}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full transition-colors capitalize",
                    selectedMode === mode
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {mode === 'hibrid' ? 'Híbrid' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1) }}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
              activeTab === tab.id
                ? "text-emerald-600 border-emerald-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              activeTab === tab.id
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Header con contador y toggle de vista */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {filteredCourses.length} curs{filteredCourses.length !== 1 ? 'os' : ''} trobat{filteredCourses.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'grid'
                ? "bg-slate-200 text-slate-700"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-colors",
              viewMode === 'list'
                ? "bg-slate-200 text-slate-700"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid/Lista de cursos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No s'han trobat cursos</h3>
          <p className="text-sm text-slate-500">Prova a ajustar els filtres o el terme de cerca</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map(course => (
            <CourseListItem
              key={course.id}
              course={course}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Componente StatCard
function StatCard({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente CourseCard (Grid view)
function CourseCard({
  course,
  onToggleFavorite
}: {
  course: Course
  onToggleFavorite: (e: React.MouseEvent, id: number) => void
}) {
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'online': return <Video className="h-3 w-3" />
      case 'presencial': return <MapPin className="h-3 w-3" />
      default: return <Building2 className="h-3 w-3" />
    }
  }

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'online': return 'Online'
      case 'presencial': return 'Presencial'
      default: return 'Híbrid'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Principiant': return 'bg-green-100 text-green-700'
      case 'Intermedi': return 'bg-yellow-100 text-yellow-700'
      case 'Avançat': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const hasDiscount = course.originalPrice > course.price

  return (
    <Link
      href={`/dashboard/formacio/${course.id}`}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all"
    >
      {/* Imagen */}
      <div className="relative h-40 bg-slate-100">
        {course.featuredImage ? (
          <Image
            src={course.featuredImage}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-slate-300" />
          </div>
        )}

        {/* Botón favorito */}
        <button
          onClick={(e) => onToggleFavorite(e, course.id)}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            className={cn(
              "w-4 h-4",
              course.isFavorite
                ? "fill-red-500 text-red-500"
                : "text-slate-400"
            )}
          />
        </button>

        {/* Badge destacado */}
        {course.isHighlighted && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            Recomanat
          </div>
        )}

        {/* Badge descuento */}
        {hasDiscount && (
          <div className="absolute bottom-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{Math.round((1 - course.price / course.originalPrice) * 100)}%
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Categoría y nivel */}
        <div className="flex items-center gap-2 text-xs mb-2">
          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            {course.category}
          </span>
          <span className={cn("px-2 py-0.5 rounded-full", getLevelColor(course.level))}>
            {course.level}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors text-sm">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-xs text-slate-600 mb-2">
          {course.instructor} · {course.institution}
        </p>

        {/* Precio */}
        <div className="flex items-center gap-2 mb-3">
          {hasDiscount && (
            <span className="text-slate-400 line-through text-sm">
              {course.originalPrice}€
            </span>
          )}
          <span className="text-lg font-bold text-emerald-600">
            {course.price}€
          </span>
        </div>

        {/* Info */}
        <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration}h
          </span>
          <span className="flex items-center gap-1">
            {getModeIcon(course.mode)}
            {getModeLabel(course.mode)}
          </span>
          <span className="flex items-center gap-1 text-yellow-600">
            <Star className="w-3 h-3 fill-yellow-500" />
            {course.rating}
          </span>
        </div>
      </div>
    </Link>
  )
}

// Componente CourseListItem (List view)
function CourseListItem({
  course,
  onToggleFavorite
}: {
  course: Course
  onToggleFavorite: (e: React.MouseEvent, id: number) => void
}) {
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'online': return 'Online'
      case 'presencial': return 'Presencial'
      default: return 'Híbrid'
    }
  }

  const hasDiscount = course.originalPrice > course.price

  return (
    <Link
      href={`/dashboard/formacio/${course.id}`}
      className="group flex gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:shadow-lg hover:border-slate-300 transition-all"
    >
      {/* Imagen */}
      <div className="relative w-40 h-28 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
        {course.featuredImage ? (
          <Image
            src={course.featuredImage}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-slate-300" />
          </div>
        )}
        {course.isHighlighted && (
          <div className="absolute top-1 left-1 bg-yellow-500 text-white p-1 rounded-full">
            <Star className="w-3 h-3 fill-white" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                {course.category}
              </span>
              <span className="text-xs text-slate-500">
                {course.level} · {getModeLabel(course.mode)}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
              {course.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{course.instructor} · {course.institution}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              {hasDiscount && (
                <span className="text-slate-400 line-through text-sm block">
                  {course.originalPrice}€
                </span>
              )}
              <span className="text-xl font-bold text-emerald-600">
                {course.price}€
              </span>
            </div>
            <button
              onClick={(e) => onToggleFavorite(e, course.id)}
              className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Heart
                className={cn(
                  "w-5 h-5",
                  course.isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-slate-400"
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration}h
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {course.enrolled} inscrits
          </span>
          <span className="flex items-center gap-1 text-yellow-600">
            <Star className="w-3 h-3 fill-yellow-500" />
            {course.rating}
          </span>
          <span>{course.availableSlots} places disponibles</span>
        </div>
      </div>
    </Link>
  )
}
