'use client'

import { useState, useEffect, useRef } from 'react'
import { TYPOGRAPHY, INPUTS, BUTTONS } from '@/lib/design-system'
import {
  X,
  Briefcase,
  Lock,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Trash2,
  Users,
  Shield,
  MessageSquare,
  FileText,
  Settings,
  AlertCircle,
  Search,
  Check,
  Crown,
  ShieldCheck,
  Tag,
  Plus,
  XCircle
} from 'lucide-react'

interface User {
  id: string
  name: string | null
  nick: string | null
  email: string
  image?: string | null
}

interface Offer {
  id: string
  title: string
  company?: string | null
  category?: string | null
  image?: string | null
}

interface GroupMember {
  id?: string
  userId: string
  user?: User
  role: 'MEMBER' | 'MODERATOR' | 'ADMIN'
}

interface SensitiveCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  color?: string | null
}

interface Group {
  id?: string
  name: string
  slug: string
  description?: string | null
  type: 'PRIVATE' | 'SECRET' | 'PROFESSIONAL'
  image?: string | null
  coverImage?: string | null
  joinPolicy?: 'OPEN' | 'REQUEST' | 'INVITE_ONLY'
  contentVisibility?: 'PUBLIC' | 'MEMBERS_ONLY'
  memberListVisibility?: 'PUBLIC' | 'MEMBERS_ONLY'
  postPermission?: 'ALL_MEMBERS' | 'MODS_AND_ADMINS' | 'ADMINS_ONLY'
  enableForum?: boolean
  enableGallery?: boolean
  enableDocuments?: boolean
  enableGroupChat?: boolean
  isActive?: boolean
  membersCount?: number
  sectorOffers?: { offerId: string; offer?: Offer }[]
  members?: GroupMember[]
  sensitiveJobCategoryId?: string | null
  sensitiveJobCategory?: SensitiveCategory | null
  _count?: { members: number }
}

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  group: Group | null
  onSubmit: (data: Partial<Group> & { adminId?: string; moderatorIds?: string[]; sectorOfferIds?: string[]; sensitiveJobCategoryId?: string | null }) => Promise<void>
}

export function GroupModal({ isOpen, onClose, group, onSubmit }: GroupModalProps) {
  // Form data
  const [formData, setFormData] = useState<Partial<Group>>({
    name: '',
    slug: '',
    description: '',
    type: 'PROFESSIONAL',
    image: '',
    coverImage: '',
    joinPolicy: 'REQUEST',
    contentVisibility: 'MEMBERS_ONLY',
    memberListVisibility: 'MEMBERS_ONLY',
    postPermission: 'ALL_MEMBERS',
    enableForum: true,
    enableGallery: false,
    enableDocuments: false,
    enableGroupChat: false,
    isActive: true,
  })

  // Gestio d'usuaris (admin i moderadors)
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null)
  const [selectedModerators, setSelectedModerators] = useState<User[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userSearchResults, setUserSearchResults] = useState<User[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)
  const [userSearchType, setUserSearchType] = useState<'admin' | 'moderator' | null>(null)

  // Gestio d'ofertes sectorials
  const [selectedOffers, setSelectedOffers] = useState<Offer[]>([])
  const [offerSearchQuery, setOfferSearchQuery] = useState('')
  const [offerSearchResults, setOfferSearchResults] = useState<Offer[]>([])
  const [isSearchingOffers, setIsSearchingOffers] = useState(false)
  const [showOfferSearch, setShowOfferSearch] = useState(false)

  // Gestio de categories sensibles
  const [sensitiveCategories, setSensitiveCategories] = useState<SensitiveCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  // UI state
  const [activeSection, setActiveSection] = useState<string>('basic')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!group?.id

  // Inicialitzar dades quan s'obre el modal
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        slug: group.slug || '',
        description: group.description || '',
        type: group.type || 'PROFESSIONAL',
        image: group.image || '',
        coverImage: group.coverImage || '',
        joinPolicy: group.joinPolicy || 'REQUEST',
        contentVisibility: group.contentVisibility || 'MEMBERS_ONLY',
        memberListVisibility: group.memberListVisibility || 'MEMBERS_ONLY',
        postPermission: group.postPermission || 'ALL_MEMBERS',
        enableForum: group.enableForum ?? true,
        enableGallery: group.enableGallery ?? false,
        enableDocuments: group.enableDocuments ?? false,
        enableGroupChat: group.enableGroupChat ?? false,
        isActive: group.isActive ?? true,
      })

      // Carregar admin i moderadors existents
      if (group.members) {
        const admin = group.members.find(m => m.role === 'ADMIN')
        if (admin?.user) setSelectedAdmin(admin.user)

        const mods = group.members.filter(m => m.role === 'MODERATOR')
        setSelectedModerators(mods.map(m => m.user!).filter(Boolean))
      }

      // Carregar ofertes existents
      if (group.sectorOffers) {
        setSelectedOffers(group.sectorOffers.map(so => so.offer!).filter(Boolean))
      }

      // Carregar categoria sensible
      if (group.sensitiveJobCategoryId) {
        setSelectedCategoryId(group.sensitiveJobCategoryId)
      } else {
        setSelectedCategoryId(null)
      }
    } else {
      // Reset per nou grup
      setFormData({
        name: '',
        slug: '',
        description: '',
        type: 'PROFESSIONAL',
        image: '',
        coverImage: '',
        joinPolicy: 'REQUEST',
        contentVisibility: 'MEMBERS_ONLY',
        memberListVisibility: 'MEMBERS_ONLY',
        postPermission: 'ALL_MEMBERS',
        enableForum: true,
        enableGallery: false,
        enableDocuments: false,
        enableGroupChat: false,
        isActive: true,
      })
      setSelectedAdmin(null)
      setSelectedModerators([])
      setSelectedOffers([])
      setSelectedCategoryId(null)
    }
    setError(null)
    setActiveSection('basic')
  }, [group, isOpen])

  // Auto-generar slug
  useEffect(() => {
    if (!isEditing && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50)
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, isEditing])

  // Carregar categories sensibles quan s'obre el modal
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isOpen) return
      setIsLoadingCategories(true)
      try {
        const res = await fetch('/api/admin/sensitive-categories')
        if (res.ok) {
          const data = await res.json()
          setSensitiveCategories(data.categories || [])
        }
      } catch (err) {
        console.error('Error fetching sensitive categories:', err)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [isOpen])

  // Cercar usuaris
  useEffect(() => {
    const searchUsers = async () => {
      if (!userSearchQuery.trim() || userSearchQuery.length < 2) {
        setUserSearchResults([])
        return
      }

      setIsSearchingUsers(true)
      try {
        const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(userSearchQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          const filtered = data.users?.filter((u: User) =>
            u.id !== selectedAdmin?.id &&
            !selectedModerators.some(m => m.id === u.id)
          ) || []
          setUserSearchResults(filtered)
        }
      } catch (err) {
        console.error('Error searching users:', err)
      } finally {
        setIsSearchingUsers(false)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [userSearchQuery, selectedAdmin, selectedModerators])

  // Cercar ofertes
  useEffect(() => {
    const searchOffers = async () => {
      if (!offerSearchQuery.trim() || offerSearchQuery.length < 2) {
        setOfferSearchResults([])
        return
      }

      setIsSearchingOffers(true)
      try {
        const res = await fetch(`/api/admin/offers/search?q=${encodeURIComponent(offerSearchQuery)}&limit=10`)
        if (res.ok) {
          const data = await res.json()
          const filtered = data.offers?.filter((o: Offer) =>
            !selectedOffers.some(so => so.id === o.id)
          ) || []
          setOfferSearchResults(filtered)
        }
      } catch (err) {
        console.error('Error searching offers:', err)
      } finally {
        setIsSearchingOffers(false)
      }
    }

    const debounce = setTimeout(searchOffers, 300)
    return () => clearTimeout(debounce)
  }, [offerSearchQuery, selectedOffers])

  // Handlers d'imatges
  const handleImageUpload = async (file: File, type: 'cover' | 'avatar') => {
    if (!file) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('La imatge no pot superar els 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('El fitxer ha de ser una imatge')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', type === 'cover' ? 'group-cover' : 'group-avatar')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!res.ok) throw new Error('Error pujant imatge')

      const data = await res.json()

      if (type === 'cover') {
        setFormData(prev => ({ ...prev, coverImage: data.url }))
      } else {
        setFormData(prev => ({ ...prev, image: data.url }))
      }
    } catch {
      setError('Error pujant la imatge')
    } finally {
      setIsUploading(false)
    }
  }

  // Handlers d'usuaris
  const handleSelectAdmin = (user: User) => {
    setSelectedModerators(prev => prev.filter(m => m.id !== user.id))
    setSelectedAdmin(user)
    setUserSearchQuery('')
    setUserSearchResults([])
    setUserSearchType(null)
  }

  const handleSelectModerator = (user: User) => {
    if (user.id === selectedAdmin?.id) {
      setError('Aquest usuari ja es l\'admin del grup')
      return
    }
    setSelectedModerators(prev => [...prev, user])
    setUserSearchQuery('')
    setUserSearchResults([])
    setUserSearchType(null)
  }

  const handleRemoveAdmin = () => {
    setSelectedAdmin(null)
  }

  const handleRemoveModerator = (userId: string) => {
    setSelectedModerators(prev => prev.filter(m => m.id !== userId))
  }

  // Handlers d'ofertes
  const handleSelectOffer = (offer: Offer) => {
    setSelectedOffers(prev => [...prev, offer])
    setOfferSearchQuery('')
    setOfferSearchResults([])
    setShowOfferSearch(false)
  }

  const handleRemoveOffer = (offerId: string) => {
    setSelectedOffers(prev => prev.filter(o => o.id !== offerId))
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name?.trim()) {
      setError('El nom del grup es obligatori')
      return
    }

    if (!formData.slug?.trim()) {
      setError('El slug es obligatori')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const dataToSave = {
        ...formData,
        adminId: selectedAdmin?.id,
        moderatorIds: selectedModerators.map(m => m.id),
        sectorOfferIds: selectedOffers.map(o => o.id),
        sensitiveJobCategoryId: formData.type === 'PROFESSIONAL' ? selectedCategoryId : null,
      }

      await onSubmit(dataToSave)
      onClose()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error guardant el grup'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const sections = [
    { id: 'basic', label: 'Informacio', icon: FileText },
    { id: 'images', label: 'Imatges', icon: ImageIcon },
    { id: 'team', label: 'Equip', icon: Users },
    { id: 'offers', label: 'Ofertes', icon: Tag },
    { id: 'privacy', label: 'Privacitat', icon: Shield },
    { id: 'features', label: 'Funcions', icon: Settings },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className={TYPOGRAPHY.sectionTitle}>
                {isEditing ? 'Editar Grup' : 'Nou Grup Restringit'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Modifica la configuracio del grup' : 'Configura tots els detalls del grup'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={BUTTONS.icon}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navegacio de seccions */}
        <div className="flex border-b border-gray-200 px-4 flex-shrink-0 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            )
          })}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* ==================== SECCIO: Informacio basica ==================== */}
            {activeSection === 'basic' && (
              <div className="space-y-5">
                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-1`}>
                    Nom del grup <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Mossos d'Esquadra"
                    className={INPUTS.base}
                  />
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-1`}>
                    Slug (URL) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500">
                      /grups/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="mossos-d-esquadra"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-1`}>Descripcio</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripcio del grup..."
                    rows={4}
                    className={INPUTS.textarea}
                  />
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-3`}>
                    Tipus de grup <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['PROFESSIONAL', 'PRIVATE', 'SECRET'] as const).map((type) => {
                      const icons = { PROFESSIONAL: Briefcase, PRIVATE: Lock, SECRET: EyeOff }
                      const colors = { PROFESSIONAL: 'indigo', PRIVATE: 'amber', SECRET: 'red' }
                      const titles = { PROFESSIONAL: 'Professional', PRIVATE: 'Privat', SECRET: 'Secret' }
                      const descs = {
                        PROFESSIONAL: 'Cada usuari nomes pot pertanyer a UN grup professional',
                        PRIVATE: 'Visible pero cal sol·licitar acces',
                        SECRET: 'No visible, nomes per invitacio'
                      }
                      const Icon = icons[type]
                      const color = colors[type]
                      const isSelected = formData.type === type

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type }))}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? `border-${color}-500 bg-${color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                            isSelected ? `bg-${color}-100` : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-5 h-5 ${isSelected ? `text-${color}-600` : 'text-gray-500'}`} />
                          </div>
                          <p className="font-medium text-gray-900">{titles[type]}</p>
                          <p className="text-xs text-gray-500 mt-1">{descs[type]}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Categoria Sensible - nomes per a grups PROFESSIONAL */}
                {formData.type === 'PROFESSIONAL' && (
                  <div>
                    <label className={`block ${TYPOGRAPHY.label} mb-3`}>
                      Categoria sensible vinculada
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Si aquest grup es per a professionals amb necessitats de privacitat especials,
                      selecciona la categoria corresponent. Els membres que s&apos;uneixin
                      rebran automàticament les restriccions de privacitat.
                    </p>

                    {isLoadingCategories ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                        Carregant categories...
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Opció sense categoria */}
                        <label
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            !selectedCategoryId
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sensitiveCategory"
                            checked={!selectedCategoryId}
                            onChange={() => setSelectedCategoryId(null)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            !selectedCategoryId ? 'border-indigo-600' : 'border-gray-300'
                          }`}>
                            {!selectedCategoryId && (
                              <div className="w-2 h-2 rounded-full bg-indigo-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Sense categoria especial</p>
                            <p className="text-sm text-gray-500">Grup professional sense restriccions de privacitat addicionals</p>
                          </div>
                        </label>

                        {/* Categories sensibles */}
                        {sensitiveCategories.map((cat) => (
                          <label
                            key={cat.id}
                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedCategoryId === cat.id
                                ? 'border-amber-500 bg-amber-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="sensitiveCategory"
                              checked={selectedCategoryId === cat.id}
                              onChange={() => setSelectedCategoryId(cat.id)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                              selectedCategoryId === cat.id ? 'border-amber-600' : 'border-gray-300'
                            }`}>
                              {selectedCategoryId === cat.id && (
                                <div className="w-2 h-2 rounded-full bg-amber-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {cat.icon && <span className="text-lg">{cat.icon}</span>}
                                <p className="font-medium text-gray-900">{cat.name}</p>
                              </div>
                              {cat.description && (
                                <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
                              )}
                            </div>
                            <Shield
                              className="w-5 h-5 ml-2"
                              style={{ color: cat.color || '#f59e0b' }}
                            />
                          </label>
                        ))}

                        {sensitiveCategories.length === 0 && (
                          <p className="text-sm text-gray-500 italic">
                            No hi ha categories sensibles configurades. Pots crear-les a la secció de Categories.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Estat actiu */}
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Grup actiu</p>
                    <p className="text-sm text-gray-500">El grup es visible i accessible</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.isActive ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.isActive ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </label>
              </div>
            )}

            {/* ==================== SECCIO: Imatges ==================== */}
            {activeSection === 'images' && (
              <div className="space-y-6">
                {/* Imatge de portada */}
                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-3`}>Imatge de portada</label>
                  <div
                    className="relative h-48 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl overflow-hidden group cursor-pointer"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {formData.coverImage ? (
                      <>
                        <img src={formData.coverImage} alt="Portada" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            className="p-3 bg-white rounded-lg hover:bg-gray-100"
                            onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click() }}
                          >
                            <Upload className="w-5 h-5 text-gray-700" />
                          </button>
                          <button
                            type="button"
                            className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, coverImage: '' })) }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
                        <Upload className="w-10 h-10 mb-2" />
                        <p className="font-medium">Clica per pujar imatge de portada</p>
                        <p className="text-sm text-white/60">Recomanat: 1200x300px</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                  />
                </div>

                {/* Avatar del grup */}
                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-3`}>Avatar del grup</label>
                  <div className="flex items-center gap-6">
                    <div
                      className="relative w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl overflow-hidden group cursor-pointer"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="Avatar" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
                          <Users className="w-10 h-10 mb-1" />
                          <p className="text-xs">150x150px</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">
                        Puja una imatge quadrada per al avatar del grup. Recomanat: 150x150px o superior.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <Upload className="w-4 h-4 inline mr-2" />
                          Pujar imatge
                        </button>
                        {formData.image && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')}
                  />
                </div>

                {isUploading && (
                  <div className="flex items-center justify-center p-4 bg-indigo-50 rounded-lg">
                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mr-3" />
                    <span className="text-sm text-indigo-600">Pujant imatge...</span>
                  </div>
                )}
              </div>
            )}

            {/* ==================== SECCIO: Equip (Admin i Moderadors) ==================== */}
            {activeSection === 'team' && (
              <div className="space-y-6">
                {/* Administrador del grup */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className={`block ${TYPOGRAPHY.label}`}>Administrador del grup</label>
                      <p className="text-xs text-gray-500">L&apos;admin te control total sobre el grup</p>
                    </div>
                  </div>

                  {selectedAdmin ? (
                    <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center overflow-hidden">
                          {selectedAdmin.image ? (
                            <img src={selectedAdmin.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Crown className="w-6 h-6 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedAdmin.name || 'Sense nom'}</p>
                          <p className="text-sm text-gray-500">@{selectedAdmin.nick || 'sense-nick'} - {selectedAdmin.email}</p>
                        </div>
                        <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                          Admin
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveAdmin}
                        className="p-2 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar usuari per assignar com a admin..."
                          value={userSearchType === 'admin' ? userSearchQuery : ''}
                          onChange={(e) => { setUserSearchQuery(e.target.value); setUserSearchType('admin') }}
                          onFocus={() => setUserSearchType('admin')}
                          className={`${INPUTS.base} pl-10`}
                        />
                      </div>

                      {userSearchType === 'admin' && userSearchResults.length > 0 && (
                        <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto">
                          {userSearchResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleSelectAdmin(user)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {user.image ? (
                                  <img src={user.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-5 h-5 text-gray-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name || 'Sense nom'}</p>
                                <p className="text-sm text-gray-500">@{user.nick || 'sense-nick'}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Moderadors */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className={`block ${TYPOGRAPHY.label}`}>Moderadors</label>
                      <p className="text-xs text-gray-500">Els moderadors poden gestionar contingut i membres</p>
                    </div>
                    <span className="text-sm text-gray-500">{selectedModerators.length} seleccionats</span>
                  </div>

                  {selectedModerators.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {selectedModerators.map((mod) => (
                        <div key={mod.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center overflow-hidden">
                              {mod.image ? (
                                <img src={mod.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ShieldCheck className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{mod.name || 'Sense nom'}</p>
                              <p className="text-sm text-gray-500">@{mod.nick || 'sense-nick'}</p>
                            </div>
                            <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              Moderador
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveModerator(mod.id)}
                            className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuari per afegir com a moderador..."
                      value={userSearchType === 'moderator' ? userSearchQuery : ''}
                      onChange={(e) => { setUserSearchQuery(e.target.value); setUserSearchType('moderator') }}
                      onFocus={() => setUserSearchType('moderator')}
                      className={`${INPUTS.base} pl-10`}
                    />
                  </div>

                  {userSearchType === 'moderator' && userSearchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto">
                      {userSearchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleSelectModerator(user)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {user.image ? (
                              <img src={user.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.name || 'Sense nom'}</p>
                            <p className="text-sm text-gray-500">@{user.nick || 'sense-nick'}</p>
                          </div>
                          <Plus className="w-5 h-5 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {isSearchingUsers && (
                    <p className="text-sm text-gray-500 mt-2">Buscant usuaris...</p>
                  )}
                </div>
              </div>
            )}

            {/* ==================== SECCIO: Ofertes sectorials ==================== */}
            {activeSection === 'offers' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className={`block ${TYPOGRAPHY.label}`}>Ofertes sectorials vinculades</label>
                      <p className="text-xs text-gray-500">
                        Els membres d&apos;aquest grup veuran aquestes ofertes destacades
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{selectedOffers.length} ofertes</span>
                  </div>

                  {selectedOffers.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {selectedOffers.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-green-200 flex items-center justify-center overflow-hidden">
                              {offer.image ? (
                                <img src={offer.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Tag className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{offer.title}</p>
                              <p className="text-sm text-gray-500">
                                {offer.company && <span>{offer.company}</span>}
                                {offer.company && offer.category && <span> - </span>}
                                {offer.category && <span>{offer.category}</span>}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOffer(offer.id)}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar ofertes per vincular al grup..."
                      value={offerSearchQuery}
                      onChange={(e) => { setOfferSearchQuery(e.target.value); setShowOfferSearch(true) }}
                      onFocus={() => setShowOfferSearch(true)}
                      className={`${INPUTS.base} pl-10`}
                    />
                  </div>

                  {showOfferSearch && offerSearchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto">
                      {offerSearchResults.map((offer) => (
                        <button
                          key={offer.id}
                          type="button"
                          onClick={() => handleSelectOffer(offer)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                            {offer.image ? (
                              <img src={offer.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Tag className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{offer.title}</p>
                            <p className="text-sm text-gray-500">{offer.company}</p>
                          </div>
                          <Plus className="w-5 h-5 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {isSearchingOffers && (
                    <p className="text-sm text-gray-500 mt-2">Buscant ofertes...</p>
                  )}

                  {selectedOffers.length === 0 && !showOfferSearch && (
                    <div className="mt-4 p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
                      <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Cap oferta vinculada. Busca ofertes per afegir-les.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== SECCIO: Privacitat ==================== */}
            {activeSection === 'privacy' && (
              <div className="space-y-5">
                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-3`}>Politica d&apos;unio al grup</label>
                  <div className="space-y-2">
                    {[
                      { value: 'OPEN', label: 'Obert', desc: 'Qualsevol pot unir-se directament' },
                      { value: 'REQUEST', label: 'Sol·licitud', desc: 'Cal sol·licitar i ser aprovat per un admin' },
                      { value: 'INVITE_ONLY', label: 'Nomes invitacio', desc: 'Nomes es pot unir per invitacio' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.joinPolicy === option.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="joinPolicy"
                          value={option.value}
                          checked={formData.joinPolicy === option.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, joinPolicy: e.target.value as 'OPEN' | 'REQUEST' | 'INVITE_ONLY' }))}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          formData.joinPolicy === option.value ? 'border-indigo-600' : 'border-gray-300'
                        }`}>
                          {formData.joinPolicy === option.value && (
                            <div className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-500">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-3`}>Visibilitat del contingut</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'PUBLIC', label: 'Public', desc: 'Visible per tothom' },
                      { value: 'MEMBERS_ONLY', label: 'Nomes membres', desc: 'Nomes membres poden veure' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.contentVisibility === option.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="contentVisibility"
                          value={option.value}
                          checked={formData.contentVisibility === option.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, contentVisibility: e.target.value as 'PUBLIC' | 'MEMBERS_ONLY' }))}
                          className="sr-only"
                        />
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.desc}</p>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block ${TYPOGRAPHY.label} mb-3`}>Qui pot publicar</label>
                  <div className="space-y-2">
                    {[
                      { value: 'ALL_MEMBERS', label: 'Tots els membres' },
                      { value: 'MODS_AND_ADMINS', label: 'Moderadors i admins' },
                      { value: 'ADMINS_ONLY', label: 'Nomes admins' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.postPermission === option.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="postPermission"
                          value={option.value}
                          checked={formData.postPermission === option.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, postPermission: e.target.value as 'ALL_MEMBERS' | 'MODS_AND_ADMINS' | 'ADMINS_ONLY' }))}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                          formData.postPermission === option.value ? 'border-indigo-600' : 'border-gray-300'
                        }`}>
                          {formData.postPermission === option.value && (
                            <div className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SECCIO: Funcionalitats ==================== */}
            {activeSection === 'features' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  Activa o desactiva funcionalitats del grup
                </p>

                {[
                  { key: 'enableForum', icon: MessageSquare, label: 'Forum', desc: 'Discussions i debats organitzats per temes' },
                  { key: 'enableGallery', icon: ImageIcon, label: 'Galeria', desc: 'Compartir imatges i albums de fotos' },
                  { key: 'enableDocuments', icon: FileText, label: 'Documents', desc: 'Compartir i gestionar fitxers i documents' },
                  { key: 'enableGroupChat', icon: MessageSquare, label: 'Xat de grup', desc: 'Missatgeria instantania entre membres' },
                ].map((feature) => {
                  const Icon = feature.icon
                  const isEnabled = formData[feature.key as keyof typeof formData] as boolean

                  return (
                    <label
                      key={feature.key}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                          <Icon className={`w-5 h-5 ${isEnabled ? 'text-indigo-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{feature.label}</p>
                          <p className="text-sm text-gray-500">{feature.desc}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, [feature.key]: !prev[feature.key as keyof typeof formData] }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          isEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                          isEnabled ? 'translate-x-6' : ''
                        }`} />
                      </button>
                    </label>
                  )
                })}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={BUTTONS.ghost}
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`${BUTTONS.primary} flex items-center gap-2 disabled:opacity-50`}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardant...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEditing ? 'Guardar canvis' : 'Crear grup'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
