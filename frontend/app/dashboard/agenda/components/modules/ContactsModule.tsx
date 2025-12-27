'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Star, Phone, Mail, Plus, Search,
  Loader2, X, MoreHorizontal, Trash2, Edit2,
  Building2, Check, User, ChevronDown, ChevronUp,
  Smartphone, MapPin, Globe, Linkedin, Briefcase,
  FileText, Hash, Factory
} from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
  id: string
  name: string
  contactType: string | null
  position: string | null
  department: string | null
  organization: string | null
  taxId: string | null
  sector: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  extension: string | null
  address: string | null
  city: string | null
  linkedin: string | null
  website: string | null
  notes: string | null
  isFavorite: boolean
  color: string | null
  category: { id: string; name: string; color: string } | null
}

interface Category {
  id: string
  name: string
  color: string
}

interface Stats {
  total: number
  favorites: number
  categories: number
}

interface ContactsModuleProps {
  onClose?: () => void
}

const COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6'
]

// Tipus de contacte predefinits
const CONTACT_TYPES = [
  { id: 'persona', name: 'Persona', icon: User },
  { id: 'empresa', name: 'Empresa', icon: Building2 },
  { id: 'proveidor', name: 'Proveïdor', icon: Factory },
  { id: 'client', name: 'Client', icon: Briefcase },
]

const DEFAULT_CATEGORIES = [
  { id: 'personal', name: 'Personal', color: '#10b981' },
  { id: 'treball', name: 'Treball', color: '#6366f1' },
  { id: 'familia', name: 'Família', color: '#f59e0b' },
  { id: 'serveis', name: 'Serveis', color: '#06b6d4' },
]

export function ContactsModule({ onClose }: ContactsModuleProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Form states
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [saving, setSaving] = useState(false)
  const [showMoreFields, setShowMoreFields] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0])

  const [formData, setFormData] = useState({
    name: '',
    contactType: 'persona',
    categoryId: '',
    organization: '',
    position: '',
    department: '',
    taxId: '',
    sector: '',
    email: '',
    phone: '',
    mobile: '',
    extension: '',
    address: '',
    city: '',
    linkedin: '',
    website: '',
    notes: '',
    isFavorite: false,
    color: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchContacts()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/user/contacts')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setContacts(data.contacts || [])
      setCategories(data.categories || [])
      setStats(data.stats || null)
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }

  const searchContacts = async () => {
    setIsSearching(true)
    try {
      const res = await fetch(`/api/user/contacts?search=${encodeURIComponent(searchQuery)}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSearchResults(data.contacts || [])
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contactType: 'persona',
      categoryId: '',
      organization: '',
      position: '',
      department: '',
      taxId: '',
      sector: '',
      email: '',
      phone: '',
      mobile: '',
      extension: '',
      address: '',
      city: '',
      linkedin: '',
      website: '',
      notes: '',
      isFavorite: false,
      color: ''
    })
    setEditingContact(null)
    setShowNewForm(false)
    setShowMoreFields(false)
    setShowNewCategory(false)
  }

  const openEditForm = (contact: Contact) => {
    setFormData({
      name: contact.name,
      contactType: contact.contactType || 'persona',
      categoryId: contact.category?.id || '',
      organization: contact.organization || '',
      position: contact.position || '',
      department: contact.department || '',
      taxId: contact.taxId || '',
      sector: contact.sector || '',
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      extension: contact.extension || '',
      address: contact.address || '',
      city: contact.city || '',
      linkedin: contact.linkedin || '',
      website: contact.website || '',
      notes: contact.notes || '',
      isFavorite: contact.isFavorite,
      color: contact.color || ''
    })
    setEditingContact(contact)
    setShowNewForm(true)
    setMenuOpen(null)
  }

  const createCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const res = await fetch('/api/user/contacts/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, color: newCategoryColor })
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setCategories([...categories, data.category])
      setFormData({ ...formData, categoryId: data.category.id })
      setNewCategoryName('')
      setShowNewCategory(false)
      toast.success('Grup creat')
    } catch {
      toast.error('Error creant grup')
    }
  }

  const saveContact = async () => {
    if (!formData.name.trim()) {
      toast.error('El nom és obligatori')
      return
    }

    setSaving(true)
    try {
      const url = editingContact
        ? `/api/user/contacts/${editingContact.id}`
        : '/api/user/contacts'

      const res = await fetch(url, {
        method: editingContact ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error()

      toast.success(editingContact ? 'Contacte actualitzat' : 'Contacte creat')
      resetForm()
      fetchData()
    } catch {
      toast.error('Error en guardar el contacte')
    } finally {
      setSaving(false)
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/user/contacts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Contacte eliminat')
      fetchData()
    } catch {
      toast.error('Error en eliminar')
    }
    setMenuOpen(null)
  }

  const toggleFavorite = async (id: string) => {
    try {
      await fetch(`/api/user/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_favorite' })
      })
      fetchData()
    } catch {
      toast.error('Error')
    }
    setMenuOpen(null)
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copiat!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (contact: Contact) => {
    if (contact.color) return contact.color
    if (contact.category?.color) return contact.category.color
    return COLORS[contact.name.charCodeAt(0) % COLORS.length]
  }

  const getContactTypeIcon = (type: string | null) => {
    const found = CONTACT_TYPES.find(t => t.id === type)
    return found?.icon || User
  }

  const isCompanyType = formData.contactType === 'empresa' || formData.contactType === 'proveidor' || formData.contactType === 'client'

  // Filter contacts
  const displayedContacts = searchQuery.length >= 2
    ? searchResults
    : activeTab === 'favorites'
      ? contacts.filter(c => c.isFavorite)
      : contacts

  // Combine categories
  const allCategories = [...DEFAULT_CATEGORIES, ...categories.filter(c =>
    !DEFAULT_CATEGORIES.find(dc => dc.name.toLowerCase() === c.name.toLowerCase())
  )]

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-xl">
            <Users className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Contactes</h3>
            <p className="text-xs text-gray-500">
              {stats ? `${stats.total} contactes · ${stats.favorites} favorits` : 'Els teus contactes'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg transition-colors ${
              showSearch ? 'bg-violet-100 text-violet-600' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowNewForm(!showNewForm); setEditingContact(null) }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cercar contactes..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-violet-500" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New/Edit Form */}
      <AnimatePresence>
        {showNewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-gray-700">
                {editingContact ? 'Editar contacte' : 'Nou contacte'}
              </span>
            </div>

            {/* Contact Type Selector */}
            <div className="flex gap-2">
              {CONTACT_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, contactType: type.id })}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      formData.contactType === type.id
                        ? 'bg-violet-100 border-violet-300 text-violet-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{type.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Name Field */}
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isCompanyType ? "Nom de l'empresa *" : "Nom i cognoms *"}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              autoFocus
            />

            {/* Category Selector */}
            <div className="space-y-2">
              {!showNewCategory ? (
                <div className="flex gap-2">
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setShowNewCategory(true)
                      } else {
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Grup / Categoria</option>
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="new">+ Crear nou grup...</option>
                  </select>
                  {formData.categoryId && (
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: allCategories.find(c => c.id === formData.categoryId)?.color || '#8b5cf6' }}
                    />
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg border border-violet-200 space-y-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom del nou grup"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Color:</span>
                    {COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          newCategoryColor === color ? 'ring-2 ring-offset-1 ring-violet-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNewCategory(false)}
                      className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                    >
                      Cancel·lar
                    </button>
                    <button
                      onClick={createCategory}
                      disabled={!newCategoryName.trim()}
                      className="px-3 py-1 text-xs bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50"
                    >
                      Crear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Contact Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Telèfon"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Expandable More Fields */}
            <button
              type="button"
              onClick={() => setShowMoreFields(!showMoreFields)}
              className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
            >
              {showMoreFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showMoreFields ? 'Menys camps' : 'Més camps'}
            </button>

            <AnimatePresence>
              {showMoreFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2 border-t border-gray-200"
                >
                  {/* Company-specific fields */}
                  {isCompanyType && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={formData.taxId}
                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                            placeholder="CIF / NIF"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                        <div className="relative">
                          <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={formData.sector}
                            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                            placeholder="Sector / Activitat"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Person at company fields */}
                  {!isCompanyType && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          placeholder="Empresa / Organització"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          placeholder="Càrrec"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {/* Common extended fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="Mòbil"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.extension}
                      onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                      placeholder="Extensió"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Adreça"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ciutat / Població"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        placeholder="LinkedIn"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="Web"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notes"
                      rows={2}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions Row */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    formData.isFavorite
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'hover:bg-gray-100 border-gray-200 text-gray-600'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${formData.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  Favorit
                </button>

                <div className="flex gap-1">
                  {COLORS.slice(0, 6).map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-5 h-5 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-1 ring-violet-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetForm}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={saveContact}
                  disabled={saving || !formData.name.trim()}
                  className="px-4 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingContact ? 'Guardar' : 'Afegir'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
        {(['all', 'favorites'] as const).map((tab) => {
          const count = tab === 'all' ? contacts.length : contacts.filter(c => c.isFavorite).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'all' ? <Users className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
              {tab === 'all' ? 'Tots' : 'Favorits'}
              {count > 0 && (
                <span className={`text-xs px-1.5 rounded-full ${
                  activeTab === tab ? 'bg-violet-100' : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Contacts List */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {displayedContacts.length === 0 ? (
          <div className="text-center py-6">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Cap resultat' : activeTab === 'favorites' ? 'Sense favorits' : 'Sense contactes'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center gap-1 mt-2 text-sm text-violet-600 hover:text-violet-700"
              >
                <Plus className="w-4 h-4" />
                Afegir contacte
              </button>
            )}
          </div>
        ) : (
          displayedContacts.map((contact) => {
            const TypeIcon = getContactTypeIcon(contact.contactType)
            return (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-medium flex-shrink-0 relative"
                  style={{ backgroundColor: getAvatarColor(contact) }}
                >
                  {getInitials(contact.name)}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <TypeIcon className="w-2.5 h-2.5 text-gray-500" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-gray-900 text-sm truncate">{contact.name}</p>
                    {contact.isFavorite && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                    )}
                    {contact.category && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: contact.category.color }}
                      >
                        {contact.category.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {contact.organization || contact.position || contact.sector || '—'}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(contact.phone || contact.mobile) && (
                    <button
                      onClick={() => copyToClipboard(contact.mobile || contact.phone!, `phone-${contact.id}`)}
                      className="p-1.5 hover:bg-violet-100 rounded-lg transition-colors"
                      title={contact.mobile || contact.phone || ''}
                    >
                      {copiedId === `phone-${contact.id}` ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </button>
                  )}
                  {contact.email && (
                    <button
                      onClick={() => window.location.href = `mailto:${contact.email}`}
                      className="p-1.5 hover:bg-violet-100 rounded-lg transition-colors"
                      title={contact.email}
                    >
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === contact.id ? null : contact.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                    <AnimatePresence>
                      {menuOpen === contact.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]"
                        >
                          <button
                            onClick={() => openEditForm(contact)}
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                            Editar
                          </button>
                          <button
                            onClick={() => toggleFavorite(contact.id)}
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <Star className={`w-4 h-4 ${contact.isFavorite ? 'text-gray-400' : 'text-amber-500'}`} />
                            {contact.isFavorite ? 'Treure favorit' : 'Afegir favorit'}
                          </button>
                          <button
                            onClick={() => deleteContact(contact.id)}
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Summary */}
      {stats && stats.total > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center gap-4 text-xs text-gray-500">
          <span>{stats.total} contactes</span>
          <span>{stats.favorites} favorits</span>
        </div>
      )}
    </div>
  )
}
