'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Link2,
  Search,
  Heart,
  Globe,
  ExternalLink,
  Phone,
  Mail,
  Loader2,
  LayoutGrid,
  List,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Sparkles,
  TrendingUp,
  Eye,
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import { PageLayout } from '@/components/layout/PageLayout'
import { CreateCustomLinkModal } from './components/CreateCustomLinkModal'
import { CreateFolderModal } from './components/CreateFolderModal'

// ============================================
// INTERFÍCIES
// ============================================

interface PublicLink {
  id: string
  name: string
  slogan: string | null
  description: string | null
  website: string
  phone: string | null
  email: string | null
  logo: string | null
  isHighlighted: boolean
  totalVisits: number
  category: { id: string; name: string; color: string }
}

interface CustomLink {
  id: string
  name: string
  url: string
  description: string | null
  icon: string | null
  color: string
  visitCount: number
  folderId: string | null
  folder: { id: string; name: string } | null
}

interface FavoriteLink {
  id: string
  linkId: string
  customName: string | null
  link: PublicLink
}

interface Folder {
  id: string
  name: string
  icon: string | null
  color: string
  _count: { favoriteLinks: number; customLinks: number }
}

interface Category {
  id: string
  name: string
  color: string
}

type TabType = 'tots' | 'destacats' | 'favorits' | 'personals' | 'mes-visitats'

// ============================================
// COMPONENT ICONA
// ============================================

function LinkIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return <Link2 className={`${sizes[size]} text-cyan-600`} />
}

// ============================================
// COMPONENT PRINCIPAL
// ============================================

export default function EnllacosPage() {
  const { data: session, status } = useSession()

  // Dades
  const [publicLinks, setPublicLinks] = useState<PublicLink[]>([])
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([])
  const [favorites, setFavorites] = useState<FavoriteLink[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  // UI State
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('tots')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Modals
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null)

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [session])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Carregar enllaços públics
      const publicRes = await fetch('/api/enllacos')
      if (publicRes.ok) {
        const publicData = await publicRes.json()

        // Transformar els enllaços per incloure la categoria
        const linksWithCategory = (publicData.links || []).map((link: any) => ({
          ...link,
          category: publicData.categories?.find((c: Category) => c.id === link.categoryId) || {
            id: link.categoryId,
            name: 'Sense categoria',
            color: '#6b7280'
          }
        }))

        setPublicLinks(linksWithCategory)
        setCategories(publicData.categories || [])
      }

      // Carregar dades de l'usuari si està autenticat
      if (session?.user) {
        const userRes = await fetch('/api/user/links')
        if (userRes.ok) {
          const userData = await userRes.json()
          setCustomLinks(userData.customLinks || [])
          setFavorites(userData.favorites || [])
          setFolders(userData.folders || [])
          setFavoriteIds(new Set((userData.favorites || []).map((f: FavoriteLink) => f.linkId)))
        }
      }
    } catch (error) {
      console.error('Error carregant dades:', error)
      toast.error('Error carregant enllaços')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (linkId: string) => {
    if (!session?.user) {
      toast.error('Has d\'iniciar sessió per guardar favorits')
      return
    }

    setActionLoading(linkId)

    try {
      if (favoriteIds.has(linkId)) {
        const res = await fetch(`/api/user/links/favorites/${linkId}`, { method: 'DELETE' })
        if (!res.ok) throw new Error()
        setFavoriteIds(prev => {
          const next = new Set(prev)
          next.delete(linkId)
          return next
        })
        toast.success('Eliminat de favorits')
      } else {
        const res = await fetch('/api/user/links/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkId })
        })
        if (!res.ok) throw new Error()
        setFavoriteIds(prev => new Set([...prev, linkId]))
        toast.success('Afegit a favorits')
      }
      fetchData()
    } catch {
      toast.error('Error actualitzant favorits')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteCustomLink = async (linkId: string) => {
    if (!confirm('Segur que vols eliminar aquest enllaç?')) return

    setActionLoading(linkId)
    try {
      const res = await fetch(`/api/user/links/custom/${linkId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Enllaç eliminat')
      fetchData()
    } catch {
      toast.error('Error eliminant enllaç')
    } finally {
      setActionLoading(null)
    }
  }

  const trackVisit = async (linkId: string, url: string, isCustom: boolean) => {
    window.open(url, '_blank', 'noopener,noreferrer')

    try {
      if (isCustom) {
        await fetch(`/api/user/links/custom/${linkId}`, { method: 'POST' })
      } else {
        await fetch('/api/enllacos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkId })
        })
      }
    } catch {
      // Silent fail
    }
  }

  // Filtrar enllaços
  const filterBySearch = (name: string, description?: string | null, slogan?: string | null) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return name.toLowerCase().includes(query) ||
           (description?.toLowerCase().includes(query) ?? false) ||
           (slogan?.toLowerCase().includes(query) ?? false)
  }

  const filterByCategory = (link: PublicLink) => {
    if (!selectedCategory) return true
    return link.category.id === selectedCategory
  }

  // Obtenir enllaços segons tab
  const getFilteredLinks = (): (PublicLink | CustomLink)[] => {
    switch (activeTab) {
      case 'destacats':
        return publicLinks
          .filter(l => l.isHighlighted)
          .filter(l => filterBySearch(l.name, l.description, l.slogan))
          .filter(filterByCategory)

      case 'favorits':
        return favorites
          .filter(f => filterBySearch(f.link.name, f.link.description, f.link.slogan))
          .map(f => ({
            ...f.link,
            category: f.link.category || { id: '', name: 'Sense categoria', color: '#6b7280' }
          }))

      case 'personals':
        return customLinks.filter(l => filterBySearch(l.name, l.description))

      case 'mes-visitats':
        return [...publicLinks]
          .sort((a, b) => b.totalVisits - a.totalVisits)
          .slice(0, 10)
          .filter(l => filterBySearch(l.name, l.description, l.slogan))

      default: // tots
        return publicLinks
          .filter(l => filterBySearch(l.name, l.description, l.slogan))
          .filter(filterByCategory)
    }
  }

  const filteredLinks = getFilteredLinks()
  const isPersonalsTab = activeTab === 'personals'

  // Tabs config
  const tabs = [
    { id: 'tots', label: 'Tots', count: publicLinks.length, icon: LayoutGrid },
    { id: 'destacats', label: 'Destacats', count: publicLinks.filter(l => l.isHighlighted).length, icon: Sparkles },
    { id: 'favorits', label: 'Els Meus Favorits', count: favorites.length, icon: Heart },
    { id: 'personals', label: 'Enllaços Personals', count: customLinks.length, icon: Link2 },
    { id: 'mes-visitats', label: 'Més Visitats', count: Math.min(10, publicLinks.length), icon: TrendingUp }
  ]

  // Stats
  const stats = {
    publicLinks: publicLinks.length,
    favorites: favorites.length,
    customLinks: customLinks.length,
    categories: categories.length
  }

  if (status === 'loading') {
    return (
      <PageLayout
        title="Enllaços d'Interès"
        subtitle="Recursos útils d'administracions, entitats i associacions"
        icon={<LinkIcon size="lg" />}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Enllaços d'Interès"
      subtitle="Recursos útils d'administracions, entitats i associacions"
      icon={<LinkIcon size="lg" />}
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Globe}
            label="Enllaços Disponibles"
            value={stats.publicLinks}
            color="text-cyan-600"
            bgColor="bg-cyan-50"
          />
          <StatCard
            icon={Heart}
            label="Els Meus Favorits"
            value={stats.favorites}
            color="text-pink-600"
            bgColor="bg-pink-50"
          />
          <StatCard
            icon={Link2}
            label="Enllaços Personals"
            value={stats.customLinks}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <StatCard
            icon={FolderOpen}
            label="Categories"
            value={stats.categories}
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
        </div>

        {/* Filtres i Accions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Cerca */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cercar enllaços..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Filtre categoria */}
            {activeTab !== 'personals' && activeTab !== 'favorits' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Totes les categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}

            {/* Vista grid/list */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-cyan-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-cyan-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Botó Carpetes */}
            {session?.user && (
              <button
                onClick={() => setShowFolderModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Carpetes</span>
              </button>
            )}

            {/* Botó Nou Enllaç */}
            {session?.user && (
              <button
                onClick={() => { setEditingLink(null); setShowCreateLinkModal(true) }}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nou Enllaç</span>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contingut */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
          </div>
        ) : filteredLinks.length === 0 ? (
          <EmptyState
            tab={activeTab}
            onCreateLink={() => { setEditingLink(null); setShowCreateLinkModal(true) }}
            isLoggedIn={!!session?.user}
          />
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
          }>
            {isPersonalsTab ? (
              // Enllaços personals
              (filteredLinks as CustomLink[]).map(link => (
                <CustomLinkCard
                  key={link.id}
                  link={link}
                  viewMode={viewMode}
                  onEdit={() => { setEditingLink(link); setShowCreateLinkModal(true) }}
                  onDelete={() => deleteCustomLink(link.id)}
                  onVisit={() => trackVisit(link.id, link.url, true)}
                  isLoading={actionLoading === link.id}
                />
              ))
            ) : (
              // Enllaços públics
              (filteredLinks as PublicLink[]).map(link => (
                <PublicLinkCard
                  key={link.id}
                  link={link}
                  viewMode={viewMode}
                  isFavorite={favoriteIds.has(link.id)}
                  onToggleFavorite={() => toggleFavorite(link.id)}
                  onVisit={() => trackVisit(link.id, link.website, false)}
                  isLoading={actionLoading === link.id}
                  isLoggedIn={!!session?.user}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateLinkModal && (
        <CreateCustomLinkModal
          onClose={() => { setShowCreateLinkModal(false); setEditingLink(null) }}
          onCreated={() => { setShowCreateLinkModal(false); setEditingLink(null); fetchData() }}
          folders={folders}
          editingLink={editingLink}
        />
      )}

      {showFolderModal && (
        <CreateFolderModal
          onClose={() => setShowFolderModal(false)}
          onUpdated={() => { setShowFolderModal(false); fetchData() }}
          folders={folders}
        />
      )}
    </PageLayout>
  )
}

// ============================================
// COMPONENTS AUXILIARS
// ============================================

function StatCard({ icon: Icon, label, value, color, bgColor }: {
  icon: any
  label: string
  value: number
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ tab, onCreateLink, isLoggedIn }: { tab: TabType; onCreateLink: () => void; isLoggedIn: boolean }) {
  const messages = {
    tots: { title: 'No hi ha enllaços', description: 'No s\'han trobat enllaços amb aquests filtres' },
    destacats: { title: 'Sense destacats', description: 'No hi ha enllaços destacats disponibles' },
    favorits: { title: 'Sense favorits', description: 'Afegeix enllaços als teus favorits clicant el cor' },
    personals: { title: 'Sense enllaços personals', description: 'Crea el teu primer enllaç personalitzat' },
    'mes-visitats': { title: 'Sense visites', description: 'Encara no hi ha estadístiques de visites' }
  }

  const msg = messages[tab]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Link2 className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{msg.title}</h3>
      <p className="text-gray-500 mb-6">{msg.description}</p>
      {tab === 'personals' && isLoggedIn && (
        <button
          onClick={onCreateLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crear Enllaç
        </button>
      )}
    </div>
  )
}

function PublicLinkCard({ link, viewMode, isFavorite, onToggleFavorite, onVisit, isLoading, isLoggedIn }: {
  link: PublicLink
  viewMode: 'grid' | 'list'
  isFavorite: boolean
  onToggleFavorite: () => void
  onVisit: () => void
  isLoading: boolean
  isLoggedIn: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
        {/* Icona */}
        <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
          {link.logo ? (
            <img src={link.logo} alt="" className="w-8 h-8 object-contain" />
          ) : (
            <Globe className="w-6 h-6 text-cyan-600" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 truncate">{link.name}</h3>
            {link.isHighlighted && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
          </div>
          {link.slogan && (
            <p className="text-sm text-gray-500 truncate">{link.slogan}</p>
          )}
        </div>

        {/* Categoria */}
        <span
          className="px-3 py-1 rounded-full text-xs font-medium text-white hidden md:block"
          style={{ backgroundColor: link.category.color }}
        >
          {link.category.name}
        </span>

        {/* Visites */}
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{link.totalVisits} visites</span>
        </div>

        {/* Accions */}
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              onClick={onToggleFavorite}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all ${
                isFavorite
                  ? 'text-pink-500 bg-pink-50 hover:bg-pink-100'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500' : ''}`} />
              )}
            </button>
          )}

          <button
            onClick={onVisit}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Visitar
          </button>
        </div>
      </div>
    )
  }

  // Grid view - NOU DISSENY (estil gestió)
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
      {/* Header amb icona i títol */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
          {link.logo ? (
            <img src={link.logo} alt="" className="w-8 h-8 object-contain" />
          ) : (
            <Globe className="w-6 h-6 text-cyan-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{link.name}</h3>
            {link.isHighlighted && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
          </div>
          {link.slogan && (
            <p className="text-sm text-gray-500 truncate">{link.slogan}</p>
          )}
        </div>

        {/* Menú accions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                <button
                  onClick={() => { onVisit(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visitar web
                </button>
                {isLoggedIn && (
                  <button
                    onClick={() => { onToggleFavorite(); setShowMenu(false) }}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
                    {isFavorite ? 'Treure de favorits' : 'Afegir a favorits'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Informació de contacte */}
      <div className="space-y-1.5 mb-4 text-sm text-gray-600">
        {link.website && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-500" />
            <a
              href={link.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:underline truncate"
            >
              {link.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        {link.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{link.phone}</span>
          </div>
        )}
        {link.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <a href={`mailto:${link.email}`} className="hover:underline truncate">
              {link.email}
            </a>
          </div>
        )}
      </div>

      {/* Footer: Categoria + Visites */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: link.category.color }}
        >
          {link.category.name}
        </span>

        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{link.totalVisits} visites</span>
        </div>
      </div>
    </div>
  )
}

function CustomLinkCard({ link, viewMode, onEdit, onDelete, onVisit, isLoading }: {
  link: CustomLink
  viewMode: 'grid' | 'list'
  onEdit: () => void
  onDelete: () => void
  onVisit: () => void
  isLoading: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
        {/* Icona */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
          style={{ backgroundColor: `${link.color}15` }}
        >
          {link.icon || <Link2 className="w-5 h-5" style={{ color: link.color }} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{link.name}</h3>
          <p className="text-sm text-gray-500 truncate">{link.description || link.url}</p>
        </div>

        {/* Carpeta */}
        {link.folder && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <FolderOpen className="w-3.5 h-3.5" />
            {link.folder.name}
          </span>
        )}

        {/* Visites */}
        <span className="text-sm text-gray-400 hidden lg:block">
          {link.visitCount} visites
        </span>

        {/* Accions */}
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-lg">
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={onDelete} disabled={isLoading} className="p-2 hover:bg-red-50 rounded-lg">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-400" />
            )}
          </button>
          <button
            onClick={onVisit}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Visitar
          </button>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${link.color}15` }}
        >
          {link.icon || <Link2 className="w-6 h-6" style={{ color: link.color }} />}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                <button
                  onClick={() => { onEdit(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 truncate">{link.name}</h3>
      {link.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{link.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>{link.visitCount} visites</span>
        {link.folder && (
          <span className="flex items-center gap-1">
            <FolderOpen className="w-3 h-3" />
            {link.folder.name}
          </span>
        )}
      </div>

      <button
        onClick={onVisit}
        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        Visitar
      </button>
    </div>
  )
}
