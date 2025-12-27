'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  Globe,
  UserCheck,
  Lock,
  Check,
  // Icones per fòrums
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  HelpCircle,
  Lightbulb,
  Target,
  BookOpen,
  Wrench,
  Palette,
  Gamepad2,
  Trophy,
  Star,
  Flame,
  Briefcase,
  Building2,
  Scale,
  ClipboardList,
  Users,
  Heart,
  Megaphone,
  Bell,
  Calendar,
  FileText,
  FolderOpen,
  Settings,
  Shield,
  Zap,
  Coffee,
  GraduationCap,
  Landmark,
  Gavel,
  HandHelping,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

interface Forum {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  visibility: 'PUBLIC' | 'GROUPS' | 'PRIVATE'
  isActive: boolean
  isLocked: boolean
  order: number
  requiresApproval?: boolean
  allowPolls?: boolean
  allowAttachments?: boolean
  category: { id: string; name: string } | null
  categoryId?: string
  groups: { id: string; name: string }[]
  moderators: { id: string; name: string | null; nick: string | null }[]
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Group {
  id: string
  name: string
}

interface CreateForumModalProps {
  forum: Forum | null
  categories: Category[]
  onClose: () => void
  onSuccess: () => void
}

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Públic', icon: Globe, description: 'Visible per a tothom' },
  { value: 'GROUPS', label: 'Grups', icon: UserCheck, description: 'Només membres de grups seleccionats' },
  { value: 'PRIVATE', label: 'Privat', icon: Lock, description: 'Només administradors' }
]

// Icones disponibles per als fòrums (Lucide)
const ICON_OPTIONS = [
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'MessagesSquare', icon: MessagesSquare },
  { name: 'HelpCircle', icon: HelpCircle },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Target', icon: Target },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Wrench', icon: Wrench },
  { name: 'Palette', icon: Palette },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Trophy', icon: Trophy },
  { name: 'Star', icon: Star },
  { name: 'Flame', icon: Flame },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Building2', icon: Building2 },
  { name: 'Scale', icon: Scale },
  { name: 'Gavel', icon: Gavel },
  { name: 'ClipboardList', icon: ClipboardList },
  { name: 'Users', icon: Users },
  { name: 'Heart', icon: Heart },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Bell', icon: Bell },
  { name: 'Calendar', icon: Calendar },
  { name: 'FileText', icon: FileText },
  { name: 'FolderOpen', icon: FolderOpen },
  { name: 'Settings', icon: Settings },
  { name: 'Shield', icon: Shield },
  { name: 'Zap', icon: Zap },
  { name: 'Coffee', icon: Coffee },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Landmark', icon: Landmark },
  { name: 'HandHelping', icon: HandHelping },
  { name: 'Info', icon: Info }
]

const COLOR_OPTIONS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#1e293b', // slate
  '#78716c'  // stone
]

// Helper per obtenir el component d'icona pel nom
const getIconComponent = (iconName: string) => {
  const found = ICON_OPTIONS.find(i => i.name === iconName)
  return found?.icon || MessageCircle
}

export default function CreateForumModal({
  forum,
  categories,
  onClose,
  onSuccess
}: CreateForumModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)

  const [formData, setFormData] = useState({
    name: forum?.name || '',
    slug: forum?.slug || '',
    description: forum?.description || '',
    icon: forum?.icon || 'MessageCircle',
    color: forum?.color || '#6366f1',
    visibility: (forum?.visibility || 'PUBLIC') as 'PUBLIC' | 'GROUPS' | 'PRIVATE',
    categoryId: forum?.category?.id || '',
    groupIds: forum?.groups?.map(g => g.id) || [] as string[],
    order: forum?.order || 0,
    isActive: forum?.isActive ?? true,
    isLocked: forum?.isLocked ?? false,
    requiresApproval: forum?.requiresApproval ?? false,
    allowPolls: forum?.allowPolls ?? true,
    allowAttachments: forum?.allowAttachments ?? true
  })

  // Auto-generar slug
  useEffect(() => {
    if (!forum?.id && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name, forum?.id])

  useEffect(() => {
    if (formData.visibility === 'GROUPS') {
      fetchGroups()
    }
  }, [formData.visibility])

  const fetchGroups = async () => {
    setLoadingGroups(true)
    try {
      const res = await fetch('/api/gestio/grups')
      const data = await res.json()
      setGroups(data.groups || [])
    } catch {
      console.error('Error carregant grups')
    } finally {
      setLoadingGroups(false)
    }
  }

  const toggleGroup = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId)
        ? prev.groupIds.filter(id => id !== groupId)
        : [...prev.groupIds, groupId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nom és obligatori')
      return
    }

    if (formData.visibility === 'GROUPS' && formData.groupIds.length === 0) {
      toast.error('Selecciona almenys un grup')
      return
    }

    setIsLoading(true)

    try {
      const url = forum?.id
        ? `/api/gestio/forums/${forum.id}`
        : '/api/gestio/forums'

      const method = forum?.id ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error')
      }

      toast.success(forum?.id ? 'Fòrum actualitzat' : 'Fòrum creat')
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error guardant el fòrum')
    } finally {
      setIsLoading(false)
    }
  }

  const SelectedIcon = getIconComponent(formData.icon)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {forum?.id ? 'Editar Fòrum' : 'Nou Fòrum'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Icona i Color */}
          <div className="grid grid-cols-2 gap-6">
            {/* Selector d'icona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icona
              </label>
              <div className="grid grid-cols-8 gap-1 p-3 border border-gray-200 rounded-xl max-h-32 overflow-y-auto">
                {ICON_OPTIONS.map(({ name, icon: IconComponent }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                    className={`p-2 rounded-lg transition-all ${
                      formData.icon === name
                        ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-600'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                    title={name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-6 gap-2 p-3 border border-gray-200 rounded-xl">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      formData.color === color
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Preview */}
              <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: formData.color + '20' }}
                >
                  <SelectedIcon
                    className="w-5 h-5"
                    style={{ color: formData.color }}
                  />
                </div>
                <span className="text-sm text-gray-600">Previsualització</span>
              </div>
            </div>
          </div>

          {/* Nom i Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Normativa General"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 py-2.5 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-500 text-sm">
                  /
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="normativa-general"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Descripció */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripció
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descriu de què tracta aquest fòrum..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none text-gray-900 bg-white placeholder-gray-400"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
            >
              <option value="">Sense categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Visibilitat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Visibilitat
            </label>
            <div className="grid grid-cols-3 gap-3">
              {VISIBILITY_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    visibility: option.value as 'PUBLIC' | 'GROUPS' | 'PRIVATE',
                    groupIds: option.value !== 'GROUPS' ? [] : prev.groupIds
                  }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.visibility === option.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option.icon className={`w-6 h-6 ${
                    formData.visibility === option.value ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.visibility === option.value ? 'text-indigo-900' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500 text-center">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de grups */}
          {formData.visibility === 'GROUPS' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Selecciona grups *
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, groupIds: groups.map(g => g.id) }))}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    Tots
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, groupIds: [] }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cap
                  </button>
                </div>
              </div>

              {loadingGroups ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : groups.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No hi ha grups disponibles</p>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {groups.map(group => (
                    <label
                      key={group.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        formData.groupIds.includes(group.id)
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {formData.groupIds.includes(group.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.groupIds.includes(group.id)}
                        onChange={() => toggleGroup(group.id)}
                        className="sr-only"
                      />
                      <span className="text-sm text-gray-900">{group.name}</span>
                    </label>
                  ))}
                </div>
              )}

              {formData.groupIds.length > 0 && (
                <p className="mt-2 text-sm text-indigo-600">
                  {formData.groupIds.length} grup(s) seleccionat(s)
                </p>
              )}
            </div>
          )}

          {/* Ordre i Actiu */}
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordre
              </label>
              <input
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
              />
            </div>

            <label className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-900">Fòrum actiu</span>
            </label>
          </div>

          {/* Opcions avançades */}
          <details className="border border-gray-200 rounded-xl">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
              Opcions avançades
            </summary>
            <div className="p-4 pt-0 space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.requiresApproval}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Requerir aprovació</span>
                  <p className="text-xs text-gray-500">Els temes nous necessiten aprovació d'un moderador</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData(prev => ({ ...prev, isLocked: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Bloquejar fòrum</span>
                  <p className="text-xs text-gray-500">No es poden crear temes nous</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.allowPolls}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowPolls: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Permetre enquestes</span>
                  <p className="text-xs text-gray-500">Els usuaris poden crear enquestes als temes</p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.allowAttachments}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowAttachments: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Permetre adjunts</span>
                  <p className="text-xs text-gray-500">Els usuaris poden adjuntar fitxers</p>
                </div>
              </label>
            </div>
          </details>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {forum?.id ? 'Guardar Canvis' : 'Crear Fòrum'}
          </button>
        </div>
      </div>
    </div>
  )
}
