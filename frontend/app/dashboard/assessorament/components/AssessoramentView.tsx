'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search,
  Lightbulb,
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
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Assessment {
  id: number
  slug?: string
  title: string
  description: string
  company: {
    id: number
    name: string
    logo: string
    plan: string
  }
  type: string
  category: string
  duration: number
  mode: 'presencial' | 'online' | 'hibrid'
  images: string[]
  availableSlots: number
  isHighlighted: boolean
  isFavorite: boolean
  totalBooked: number
  rating: number
  createdAt: string
  requirements: string
}

interface AssessoramentViewProps {
  userId: string
}

type TabType = 'tots' | 'destacats' | 'favorits' | 'nous'
type ViewMode = 'grid' | 'list'

// Datos de ejemplo
const sampleAssessments: Assessment[] = [
  {
    id: 1,
    slug: 'assessorament-legal-contractacio-publica',
    title: 'Assessorament Legal en Contractació Pública',
    description: 'Consulta jurídica especialitzada en procediments de contractació pública i licitacions.',
    company: {
      id: 2,
      name: 'Consultoria Puig & Associats',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    type: 'Legal',
    category: 'Contractació Pública',
    duration: 60,
    mode: 'presencial',
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop'],
    availableSlots: 12,
    isHighlighted: true,
    isFavorite: false,
    totalBooked: 89,
    rating: 4.8,
    createdAt: 'fa 2 dies',
    requirements: 'Documentació del procediment, identificació professional'
  },
  {
    id: 2,
    slug: 'assessorament-fiscal-pimes',
    title: 'Assessorament Fiscal per PIMES',
    description: 'Consultoria tributària gratuïta especialitzada per a entitats públiques i PIMES col·laboradores.',
    company: {
      id: 4,
      name: 'Assessoria Fiscal Catalunya',
      logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
      plan: 'Estàndard'
    },
    type: 'Fiscal',
    category: 'Tributació',
    duration: 45,
    mode: 'online',
    images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop'],
    availableSlots: 8,
    isHighlighted: false,
    isFavorite: true,
    totalBooked: 123,
    rating: 4.6,
    createdAt: 'fa 1 setmana',
    requirements: 'Última declaració de la renda, nòmines dels últims 3 mesos'
  },
  {
    id: 3,
    slug: 'assessorament-transformacio-digital',
    title: 'Transformació Digital per Administracions',
    description: 'Consultoria tecnològica gratuïta especialitzada en digitalització de processos administratius.',
    company: {
      id: 1,
      name: 'DigitalPub Solutions',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    type: 'Tecnològic',
    category: 'Digitalització',
    duration: 90,
    mode: 'hibrid',
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop'],
    availableSlots: 15,
    isHighlighted: true,
    isFavorite: false,
    totalBooked: 95,
    rating: 4.5,
    createdAt: 'fa 3 dies',
    requirements: 'Descripció del projecte o procés a digitalitzar'
  },
  {
    id: 4,
    slug: 'assessorament-nutricional-empleats',
    title: 'Assessorament Nutricional per Empleats Públics',
    description: 'Consulta dietètica gratuïta per millorar hàbits alimentaris i benestar laboral.',
    company: {
      id: 5,
      name: 'Centre Nutrisalut',
      logo: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop',
      plan: 'Bàsic'
    },
    type: 'Salut',
    category: 'Nutrició',
    duration: 60,
    mode: 'presencial',
    images: ['https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop'],
    availableSlots: 6,
    isHighlighted: false,
    isFavorite: true,
    totalBooked: 234,
    rating: 4.9,
    createdAt: 'fa 5 dies',
    requirements: 'Conveni col·lectiu aplicable, descripció de la consulta'
  },
  {
    id: 5,
    slug: 'assessorament-sostenibilitat',
    title: 'Assessorament en Sostenibilitat i Medi Ambient',
    description: 'Consulta sobre polítiques ambientals, certificacions ecològiques i sostenibilitat corporativa.',
    company: {
      id: 3,
      name: 'EcoServeis Catalunya',
      logo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    type: 'Ambiental',
    category: 'Sostenibilitat',
    duration: 75,
    mode: 'online',
    images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=250&fit=crop'],
    availableSlots: 10,
    isHighlighted: false,
    isFavorite: false,
    totalBooked: 78,
    rating: 4.8,
    createdAt: 'fa 1 setmana',
    requirements: 'Informació sobre l\'organització o projecte'
  },
  {
    id: 6,
    slug: 'assessorament-proteccio-dades',
    title: 'Consulta en Seguretat i Protecció de Dades',
    description: 'Assessorament en RGPD, ciberseguretat i protecció de dades per a administracions públiques.',
    company: {
      id: 7,
      name: 'Seguretat Integral Catalunya',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      plan: 'Premium'
    },
    type: 'Seguretat',
    category: 'Protecció de Dades',
    duration: 60,
    mode: 'hibrid',
    images: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=250&fit=crop'],
    availableSlots: 4,
    isHighlighted: true,
    isFavorite: false,
    totalBooked: 123,
    rating: 4.9,
    createdAt: 'ahir',
    requirements: 'Descripció del sistema o dades a protegir'
  }
]

export function AssessoramentView({ userId }: AssessoramentViewProps) {
  const [assessments, setAssessments] = useState<Assessment[]>(sampleAssessments)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
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

  // Tipos disponibles
  const availableTypes = useMemo(() => {
    const types = new Set(assessments.map(a => a.type))
    return Array.from(types).sort()
  }, [assessments])

  // Stats
  const stats = useMemo(() => {
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    return {
      disponibles: assessments.length,
      realitzades: assessments.reduce((sum, a) => sum + a.totalBooked, 0),
      favorits: assessments.filter(a => a.isFavorite).length,
      empreses: new Set(assessments.map(a => a.company.id)).size
    }
  }, [assessments])

  // Tab counts
  const tabCounts = useMemo(() => ({
    tots: assessments.length,
    destacats: assessments.filter(a => a.isHighlighted).length,
    favorits: assessments.filter(a => a.isFavorite).length,
    nous: assessments.filter(a =>
      a.createdAt === 'ahir' ||
      a.createdAt.includes('fa 1 dia') ||
      a.createdAt.includes('fa 2 dies') ||
      a.createdAt.includes('fa 3 dies')
    ).length
  }), [assessments])

  // Filtrar assessoraments
  const filteredAssessments = useMemo(() => {
    let filtered = [...assessments]

    // Búsqueda
    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query) ||
        a.company.name.toLowerCase().includes(query)
      )
    }

    // Filtro por tipo
    if (selectedType) {
      filtered = filtered.filter(a => a.type === selectedType)
    }

    // Filtro por modalidad
    if (selectedMode) {
      filtered = filtered.filter(a => a.mode === selectedMode)
    }

    // Filtro por tab
    switch (activeTab) {
      case 'destacats':
        filtered = filtered.filter(a => a.isHighlighted)
        break
      case 'favorits':
        filtered = filtered.filter(a => a.isFavorite)
        break
      case 'nous':
        filtered = filtered.filter(a =>
          a.createdAt === 'ahir' ||
          a.createdAt.includes('fa 1 dia') ||
          a.createdAt.includes('fa 2 dies') ||
          a.createdAt.includes('fa 3 dies')
        )
        break
    }

    return filtered
  }, [assessments, searchTerm, selectedType, selectedMode, activeTab])

  // Toggle favorito
  const handleToggleFavorite = (e: React.MouseEvent, assessmentId: number) => {
    e.preventDefault()
    e.stopPropagation()

    setAssessments(assessments.map(a =>
      a.id === assessmentId
        ? { ...a, isFavorite: !a.isFavorite }
        : a
    ))
  }

  const tabs = [
    { id: 'tots' as TabType, label: 'Tots', count: tabCounts.tots },
    { id: 'destacats' as TabType, label: 'Destacats', count: tabCounts.destacats },
    { id: 'favorits' as TabType, label: 'Favorits', count: tabCounts.favorits },
    { id: 'nous' as TabType, label: 'Nous', count: tabCounts.nous }
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Assessoraments Disponibles"
          value={stats.disponibles}
          icon={<Lightbulb className="h-5 w-5 text-indigo-600" />}
        />
        <StatCard
          label="Consultes Realitzades"
          value={stats.realitzades}
          icon={<Users className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          label="Els Meus Favorits"
          value={stats.favorits}
          icon={<Heart className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          label="Empreses Col·laboradores"
          value={stats.empreses}
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
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
              placeholder="Cercar assessoraments per títol, tipus o empresa..."
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Selector de tipo */}
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">Tots els tipus</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Selector de modalidad */}
          <select
            value={selectedMode}
            onChange={(e) => { setSelectedMode(e.target.value); setPage(1) }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">Totes les modalitats</option>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
            <option value="hibrid">Híbrid</option>
          </select>

          {/* Botón filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors",
              showFilters || selectedType || selectedMode
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Filter className="h-4 w-4" />
            Filtres
            {(selectedType || selectedMode) && (
              <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {[selectedType, selectedMode].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSelectedType(''); setSelectedMode(''); setPage(1) }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors",
                  !selectedType && !selectedMode
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                Netejar filtres
              </button>
              {availableTypes.map(type => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setPage(1) }}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full transition-colors",
                    selectedType === type
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1) }}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "text-indigo-600 border-indigo-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
            )}
          >
            {tab.label}
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              activeTab === tab.id
                ? "bg-indigo-100 text-indigo-700"
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
          {filteredAssessments.length} assessorament{filteredAssessments.length !== 1 ? 's' : ''} trobat{filteredAssessments.length !== 1 ? 's' : ''}
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

      {/* Grid/Lista de assessoraments */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No s'han trobat assessoraments</h3>
          <p className="text-sm text-slate-500">Prova a ajustar els filtres o el terme de cerca</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredAssessments.map(assessment => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssessments.map(assessment => (
            <AssessmentListItem
              key={assessment.id}
              assessment={assessment}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Componente StatCard
function StatCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
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

// Componente AssessmentCard (Grid view)
function AssessmentCard({
  assessment,
  onToggleFavorite
}: {
  assessment: Assessment
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

  return (
    <Link
      href={`/dashboard/assessorament/${assessment.slug || assessment.id}`}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all"
    >
      {/* Imagen */}
      <div className="relative h-40 bg-slate-100">
        {assessment.images[0] ? (
          <Image
            src={assessment.images[0]}
            alt={assessment.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Lightbulb className="w-12 h-12 text-slate-300" />
          </div>
        )}

        {/* Botón favorito */}
        <button
          onClick={(e) => onToggleFavorite(e, assessment.id)}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
        >
          <Heart
            className={cn(
              "w-4 h-4",
              assessment.isFavorite
                ? "fill-red-500 text-red-500"
                : "text-slate-400"
            )}
          />
        </button>

        {/* Badge destacado */}
        {assessment.isHighlighted && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-white" />
            Destacat
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Tipo y modalidad */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {assessment.type}
          </span>
          <span className="flex items-center gap-1">
            {getModeIcon(assessment.mode)}
            {getModeLabel(assessment.mode)}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
          {assessment.title}
        </h3>

        {/* Empresa */}
        <p className="text-xs text-slate-600 mb-3">
          {assessment.company.name}
        </p>

        {/* Info */}
        <div className="flex items-center gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {assessment.duration} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {assessment.availableSlots} places
          </span>
          <span className="flex items-center gap-1 text-yellow-600">
            <Star className="w-3 h-3 fill-yellow-500" />
            {assessment.rating}
          </span>
        </div>
      </div>
    </Link>
  )
}

// Componente AssessmentListItem (List view)
function AssessmentListItem({
  assessment,
  onToggleFavorite
}: {
  assessment: Assessment
  onToggleFavorite: (e: React.MouseEvent, id: number) => void
}) {
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'online': return 'Online'
      case 'presencial': return 'Presencial'
      default: return 'Híbrid'
    }
  }

  return (
    <Link
      href={`/dashboard/assessorament/${assessment.slug || assessment.id}`}
      className="group flex gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:shadow-lg hover:border-slate-300 transition-all"
    >
      {/* Imagen */}
      <div className="relative w-32 h-24 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
        {assessment.images[0] ? (
          <Image
            src={assessment.images[0]}
            alt={assessment.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-slate-300" />
          </div>
        )}
        {assessment.isHighlighted && (
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
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                {assessment.type}
              </span>
              <span className="text-xs text-slate-500">
                {getModeLabel(assessment.mode)}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              {assessment.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{assessment.company.name}</p>
          </div>
          <button
            onClick={(e) => onToggleFavorite(e, assessment.id)}
            className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Heart
              className={cn(
                "w-5 h-5",
                assessment.isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-slate-400"
              )}
            />
          </button>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {assessment.duration} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {assessment.availableSlots} places
          </span>
          <span className="flex items-center gap-1 text-yellow-600">
            <Star className="w-3 h-3 fill-yellow-500" />
            {assessment.rating}
          </span>
          <span>{assessment.totalBooked} reserves</span>
        </div>
      </div>
    </Link>
  )
}
