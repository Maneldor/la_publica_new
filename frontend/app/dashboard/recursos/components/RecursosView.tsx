'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  FolderOpen,
  FileText,
  GraduationCap,
  Wrench,
  HelpCircle,
  Heart,
  Phone,
  ChevronDown,
  Download,
  ExternalLink,
  File,
  FileSpreadsheet,
  Video,
  Link as LinkIcon,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Tipos
interface Resource {
  id: number
  title: string
  description: string
  type: 'PDF' | 'DOC' | 'LINK' | 'VIDEO' | 'XLS'
  category: string
  url: string
  createdAt: string
  size?: string
}

interface Category {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'slate'
}

interface RecursosViewProps {
  userId: string
}

// Datos de ejemplo
const sampleResources: Resource[] = [
  // Documentació i Normatives
  {
    id: 1,
    title: 'Llei de Procediment Administratiu Comú',
    description: 'Text complet de la Llei 39/2015 actualitzada',
    type: 'PDF',
    category: 'Documentació i Normatives',
    url: '#',
    createdAt: 'fa 2 dies',
    size: '2.3 MB'
  },
  {
    id: 2,
    title: 'Protocol de Gestió de Dades Personals',
    description: 'Guia per al compliment del RGPD en l\'administració',
    type: 'PDF',
    category: 'Documentació i Normatives',
    url: '#',
    createdAt: 'fa 1 setmana',
    size: '1.8 MB'
  },
  {
    id: 3,
    title: 'Reglament de Contractació Pública',
    description: 'Normativa actualitzada sobre procediments de contractació',
    type: 'PDF',
    category: 'Documentació i Normatives',
    url: '#',
    createdAt: 'fa 3 dies',
    size: '3.1 MB'
  },
  {
    id: 4,
    title: 'Manual de Transparència i Bon Govern',
    description: 'Guia pràctica per a la transparència administrativa',
    type: 'DOC',
    category: 'Documentació i Normatives',
    url: '#',
    createdAt: 'fa 5 dies',
    size: '945 KB'
  },
  // Formació i Desenvolupament
  {
    id: 5,
    title: 'Curs: Atenció Ciutadana Digital',
    description: 'Formació online sobre serveis digitals al ciutadà',
    type: 'VIDEO',
    category: 'Formació i Desenvolupament',
    url: '#',
    createdAt: 'fa 2 setmanes',
    size: '180 min'
  },
  {
    id: 6,
    title: 'Webinar: Innovació en l\'Administració',
    description: 'Sessió sobre digitalització i modernització',
    type: 'VIDEO',
    category: 'Formació i Desenvolupament',
    url: '#',
    createdAt: 'fa 1 setmana',
    size: '90 min'
  },
  {
    id: 7,
    title: 'Manual de Lideratge Públic',
    description: 'Guia per al desenvolupament de competències directives',
    type: 'PDF',
    category: 'Formació i Desenvolupament',
    url: '#',
    createdAt: 'fa 4 dies',
    size: '2.7 MB'
  },
  // Eines i Aplicacions
  {
    id: 8,
    title: 'Plantilla de Memòria Justificativa',
    description: 'Model per a la redacció de memòries de projectes',
    type: 'DOC',
    category: 'Eines i Aplicacions',
    url: '#',
    createdAt: 'fa 6 dies',
    size: '156 KB'
  },
  {
    id: 9,
    title: 'Calculadora de Pressupostos',
    description: 'Eina per al càlcul de pressupostos departamentals',
    type: 'XLS',
    category: 'Eines i Aplicacions',
    url: '#',
    createdAt: 'fa 1 setmana',
    size: '234 KB'
  },
  {
    id: 10,
    title: 'Portal d\'Expedients Electrònics',
    description: 'Accés al sistema de gestió d\'expedients digitals',
    type: 'LINK',
    category: 'Eines i Aplicacions',
    url: '#',
    createdAt: 'fa 3 setmanes'
  },
  // Suport i Ajuda
  {
    id: 11,
    title: 'FAQ - Preguntes Freqüents',
    description: 'Respostes a les consultes més habituals',
    type: 'LINK',
    category: 'Suport i Ajuda',
    url: '#',
    createdAt: 'fa 2 dies'
  },
  {
    id: 12,
    title: 'Guia Ràpida de Tràmits',
    description: 'Procediments més comuns pas a pas',
    type: 'PDF',
    category: 'Suport i Ajuda',
    url: '#',
    createdAt: 'fa 1 setmana',
    size: '1.2 MB'
  },
  // Benestar i Salut
  {
    id: 13,
    title: 'Protocol de Salut Laboral',
    description: 'Mesures de prevenció i seguretat al lloc de treball',
    type: 'PDF',
    category: 'Benestar i Salut',
    url: '#',
    createdAt: 'fa 5 dies',
    size: '1.6 MB'
  },
  {
    id: 14,
    title: 'Recursos de Suport Psicològic',
    description: 'Serveis d\'atenció i benestar per a empleats',
    type: 'LINK',
    category: 'Benestar i Salut',
    url: '#',
    createdAt: 'fa 1 setmana'
  },
  // Directori
  {
    id: 15,
    title: 'Directori de Departaments',
    description: 'Organigrama i contactes de tots els departaments',
    type: 'LINK',
    category: 'Directori',
    url: '#',
    createdAt: 'fa 1 mes'
  }
]

// Categorías con iconos Lucide
const categories: Category[] = [
  {
    id: 'documentacio',
    title: 'Documentació i Normatives',
    icon: FileText,
    description: 'Lleis, reglaments i protocols administratius',
    color: 'blue'
  },
  {
    id: 'formacio',
    title: 'Formació i Desenvolupament',
    icon: GraduationCap,
    description: 'Cursos, webinars i materials de formació',
    color: 'green'
  },
  {
    id: 'eines',
    title: 'Eines i Aplicacions',
    icon: Wrench,
    description: 'Software, plantilles i calculadores',
    color: 'orange'
  },
  {
    id: 'suport',
    title: 'Suport i Ajuda',
    icon: HelpCircle,
    description: 'FAQ, contactes i guies ràpides',
    color: 'purple'
  },
  {
    id: 'benestar',
    title: 'Benestar i Salut',
    icon: Heart,
    description: 'Protocols i recursos de salut laboral',
    color: 'red'
  },
  {
    id: 'directori',
    title: 'Directori',
    icon: Phone,
    description: 'Organigrama i contactes departamentals',
    color: 'slate'
  }
]

// Color variants
const colorVariants = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' }
}

// File type colors and icons
const fileTypeConfig = {
  PDF: { icon: File, color: 'red' as const },
  DOC: { icon: FileText, color: 'blue' as const },
  XLS: { icon: FileSpreadsheet, color: 'green' as const },
  VIDEO: { icon: Video, color: 'purple' as const },
  LINK: { icon: LinkIcon, color: 'orange' as const }
}

export function RecursosView({ userId }: RecursosViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('name')

  // Stats
  const stats = useMemo(() => ({
    total: sampleResources.length,
    descarregats: 24,
    nous: 8,
    categories: categories.length
  }), [])

  // Filtrar recursos
  const filteredResources = useMemo(() => {
    return sampleResources.filter(resource =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  // Obtener recursos por categoría
  const getResourcesByCategory = (categoryTitle: string) => {
    const categoryResources = filteredResources.filter(r => r.category === categoryTitle)

    return categoryResources.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title)
        case 'date':
          return b.id - a.id
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Recursos"
          value={stats.total}
          icon={<FolderOpen className="h-5 w-5 text-cyan-600" />}
        />
        <StatCard
          label="Més Descarregats"
          value={stats.descarregats}
          icon={<Download className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          label="Nous Aquest Mes"
          value={stats.nous}
          icon={<FileText className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          label="Categories"
          value={stats.categories}
          icon={<FolderOpen className="h-5 w-5 text-purple-600" />}
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
              placeholder="Buscar recursos per títol, descripció o categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Selector de ordenación */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'type')}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-700"
          >
            <option value="name">Ordenar per Nom</option>
            <option value="date">Ordenar per Data</option>
            <option value="type">Ordenar per Tipus</option>
          </select>
        </div>
      </div>

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const categoryResources = getResourcesByCategory(category.title)
          const isExpanded = expandedCategory === category.id
          const Icon = category.icon
          const colors = colorVariants[category.color]

          return (
            <div
              key={category.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header de categoría */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "w-full p-5 text-left transition-colors",
                  isExpanded ? "bg-slate-50" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    colors.bg
                  )}>
                    <Icon className={cn("w-6 h-6", colors.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {category.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-sm font-medium", colors.text)}>
                        {categoryResources.length} recursos
                      </span>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-slate-400 transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              </button>

              {/* Lista de recursos expandida */}
              {isExpanded && (
                <div className="border-t border-slate-200 max-h-96 overflow-y-auto">
                  {categoryResources.length > 0 ? (
                    categoryResources.map((resource) => (
                      <ResourceItem
                        key={resource.id}
                        resource={resource}
                      />
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500">
                      No s'han trobat recursos en aquesta categoria
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mensaje si no hay resultados */}
      {searchTerm && filteredResources.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">
            No s'han trobat recursos
          </h3>
          <p className="text-sm text-slate-500">
            Prova a ajustar el terme de cerca
          </p>
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

// Componente ResourceItem
function ResourceItem({ resource }: { resource: Resource }) {
  const config = fileTypeConfig[resource.type]
  const Icon = config.icon
  const colors = colorVariants[config.color]

  return (
    <div className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icono del archivo */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          colors.bg
        )}>
          <Icon className={cn("w-5 h-5", colors.text)} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 line-clamp-1">
            {resource.title}
          </h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {resource.description}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded",
              colors.bg,
              colors.text
            )}>
              {resource.type}
            </span>
            {resource.size && (
              <span className="text-xs text-slate-400">
                {resource.size}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {resource.createdAt}
            </span>
          </div>
        </div>

        {/* Botón de acción */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            window.open(resource.url, '_blank')
          }}
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-80",
            config.color === 'red' && "bg-red-500",
            config.color === 'blue' && "bg-blue-500",
            config.color === 'green' && "bg-green-500",
            config.color === 'purple' && "bg-purple-500",
            config.color === 'orange' && "bg-orange-500"
          )}
        >
          {resource.type === 'LINK' ? (
            <>
              <ExternalLink className="w-3 h-3" />
              Obrir
            </>
          ) : (
            <>
              <Download className="w-3 h-3" />
              Descarregar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
