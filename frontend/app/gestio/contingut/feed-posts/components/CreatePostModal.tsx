'use client'

import { useState, useEffect, useRef } from 'react'
import {
  X,
  Loader2,
  Image as ImageIcon,
  FileText,
  BarChart2,
  Plus,
  Trash2,
  Calendar,
  Globe,
  Users,
  UserCheck,
  Lock,
  Pin,
  Star,
  Clock,
  Upload,
  Eye,
  Sparkles,
  Check,
  Settings,
  File,
  X as XIcon
} from 'lucide-react'
import { PostEditor } from '@/components/feed/PostEditor'

interface CreatePostModalProps {
  onClose: () => void
  onCreated: () => void
}

interface PollOption {
  id: string
  text: string
}

interface Group {
  id: string
  name: string
  membersCount?: number
  type?: string
}

interface Attachment {
  id: string
  file: File
  preview?: string
  type: 'image' | 'document'
  uploading?: boolean
  url?: string
}

type VisibilityType = 'PUBLIC' | 'GROUPS' | 'PRIVATE'

const VISIBILITY_OPTIONS: { value: VisibilityType; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'PUBLIC', label: 'Públic', icon: Globe, description: 'Tots els usuaris poden veure-ho' },
  { value: 'GROUPS', label: 'Grups específics', icon: UserCheck, description: 'Selecciona un o més grups' },
  { value: 'PRIVATE', label: 'Privat', icon: Lock, description: 'Només tu pots veure-ho' }
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export default function CreatePostModal({ onClose, onCreated }: CreatePostModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'poll'>('content')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    content: '',
    visibility: 'PUBLIC' as VisibilityType,
    selectedGroupIds: [] as string[],
    officialBadge: 'La Pública',
    isPinned: false,
    pinnedUntil: '',
    isFeatured: false,
    scheduledAt: '',
    // Enquesta
    hasPoll: false,
    pollQuestion: '',
    pollOptions: [
      { id: '1', text: '' },
      { id: '2', text: '' }
    ] as PollOption[],
    pollType: 'SINGLE' as 'SINGLE' | 'MULTIPLE',
    pollEndsAt: '',
    pollIsAnonymous: false,
    pollShowResults: 'AFTER_VOTE' as 'ALWAYS' | 'AFTER_VOTE' | 'AFTER_END' | 'NEVER'
  })

  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    setLoadingGroups(true)
    try {
      const res = await fetch('/api/groups?limit=100')
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
      selectedGroupIds: prev.selectedGroupIds.includes(groupId)
        ? prev.selectedGroupIds.filter(id => id !== groupId)
        : [...prev.selectedGroupIds, groupId]
    }))
    if (errors.groups) setErrors(prev => ({ ...prev, groups: '' }))
  }

  const selectAllGroups = () => {
    setFormData(prev => ({
      ...prev,
      selectedGroupIds: groups.map(g => g.id)
    }))
  }

  const deselectAllGroups = () => {
    setFormData(prev => ({
      ...prev,
      selectedGroupIds: []
    }))
  }

  const addPollOption = () => {
    if (formData.pollOptions.length >= 10) return
    setFormData(prev => ({
      ...prev,
      pollOptions: [...prev.pollOptions, { id: Date.now().toString(), text: '' }]
    }))
  }

  const removePollOption = (id: string) => {
    if (formData.pollOptions.length <= 2) return
    setFormData(prev => ({
      ...prev,
      pollOptions: prev.pollOptions.filter(o => o.id !== id)
    }))
  }

  const updatePollOption = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      pollOptions: prev.pollOptions.map(o => o.id === id ? { ...o, text } : o)
    }))
  }

  // Gestió d'adjunts
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files
    if (!files) return

    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES

    Array.from(files).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ ...prev, attachments: `El fitxer ${file.name} supera els 10MB` }))
        return
      }

      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, attachments: `Format no permès: ${file.name}` }))
        return
      }

      const attachment: Attachment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        type,
        preview: type === 'image' ? URL.createObjectURL(file) : undefined
      }

      setAttachments(prev => [...prev, attachment])
    })

    // Reset input
    e.target.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const att = prev.find(a => a.id === id)
      if (att?.preview) {
        URL.revokeObjectURL(att.preview)
      }
      return prev.filter(a => a.id !== id)
    })
  }

  const uploadAttachment = async (attachment: Attachment): Promise<string | null> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', attachment.file)
    formDataUpload.append('type', attachment.type)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (!res.ok) throw new Error('Error pujant fitxer')

      const data = await res.json()
      return data.url
    } catch (error) {
      console.error('Error uploading:', error)
      return null
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    const textContent = formData.content.replace(/<[^>]*>/g, '').trim()
    if (!textContent) {
      newErrors.content = 'El contingut és obligatori'
    }

    if (formData.visibility === 'GROUPS' && formData.selectedGroupIds.length === 0) {
      newErrors.groups = 'Selecciona almenys un grup'
    }

    if (formData.hasPoll) {
      if (!formData.pollQuestion.trim()) {
        newErrors.pollQuestion = 'La pregunta és obligatòria'
      }
      const validOptions = formData.pollOptions.filter(o => o.text.trim())
      if (validOptions.length < 2) {
        newErrors.pollOptions = 'Cal almenys 2 opcions'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      // Pujar adjunts primer
      const uploadedAttachments: { type: string; url: string; filename: string }[] = []

      for (const att of attachments) {
        setAttachments(prev => prev.map(a =>
          a.id === att.id ? { ...a, uploading: true } : a
        ))

        const url = await uploadAttachment(att)
        if (url) {
          uploadedAttachments.push({
            type: att.type.toUpperCase(),
            url,
            filename: att.file.name
          })
        }

        setAttachments(prev => prev.map(a =>
          a.id === att.id ? { ...a, uploading: false, url: url || undefined } : a
        ))
      }

      const body: Record<string, unknown> = {
        content: formData.content,
        type: formData.hasPoll ? 'POLL' : attachments.some(a => a.type === 'image') ? 'IMAGE' : 'TEXT',
        visibility: formData.visibility,
        officialBadge: formData.officialBadge || 'La Pública',
        isPinned: formData.isPinned,
        isFeatured: formData.isFeatured
      }

      if (formData.visibility === 'GROUPS' && formData.selectedGroupIds.length > 0) {
        body.groupId = formData.selectedGroupIds[0] // Per ara només un grup principal
      }

      if (formData.isPinned && formData.pinnedUntil) {
        body.pinnedUntil = new Date(formData.pinnedUntil).toISOString()
      }

      if (formData.scheduledAt) {
        body.scheduledAt = new Date(formData.scheduledAt).toISOString()
      }

      if (uploadedAttachments.length > 0) {
        body.attachments = uploadedAttachments
      }

      if (formData.hasPoll) {
        body.poll = {
          question: formData.pollQuestion,
          type: formData.pollType,
          options: formData.pollOptions.filter(o => o.text.trim()).map(o => o.text),
          isAnonymous: formData.pollIsAnonymous,
          showResults: formData.pollShowResults,
          ...(formData.pollEndsAt && { endsAt: new Date(formData.pollEndsAt).toISOString() })
        }
      }

      const res = await fetch('/api/gestio/feed-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error creant el post')
      }

      onCreated()
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Error creant el post' })
    } finally {
      setIsLoading(false)
    }
  }

  const getContentPreview = () => {
    return formData.content || '<p class="text-gray-400 italic">El contingut apareixerà aquí...</p>'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Crear Post Oficial</h2>
              <p className="text-sm text-gray-500">Publica contingut a la xarxa social</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showPreview ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              Previsualitzar
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {[
            { id: 'content', label: 'Contingut', icon: FileText },
            { id: 'settings', label: 'Configuració', icon: Settings },
            { id: 'poll', label: 'Enquesta', icon: BarChart2 }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'content' | 'settings' | 'poll')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'poll' && formData.hasPoll && (
                <span className="w-2 h-2 bg-purple-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            {showPreview ? (
              /* Previsualització */
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      LP
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">La Pública</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {formData.officialBadge || 'Oficial'}
                        </span>
                        {formData.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500" />
                        )}
                        {formData.isFeatured && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Ara mateix</p>
                    </div>
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-gray-900"
                    dangerouslySetInnerHTML={{ __html: getContentPreview() }}
                  />

                  {/* Preview attachments */}
                  {attachments.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {attachments.filter(a => a.type === 'image').map(att => (
                        <img
                          key={att.id}
                          src={att.preview}
                          alt=""
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                      {attachments.filter(a => a.type === 'document').map(att => (
                        <div key={att.id} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                          <File className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-700 truncate">{att.file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.hasPoll && formData.pollQuestion && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-900 mb-3">{formData.pollQuestion}</p>
                      <div className="space-y-2">
                        {formData.pollOptions.filter(o => o.text).map(option => (
                          <div key={option.id} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                            {option.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Formulari per tabs */
              <div className="space-y-6">
                {activeTab === 'content' && (
                  <>
                    {/* Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contingut del post *
                      </label>
                      <PostEditor
                        content={formData.content}
                        onChange={(content) => {
                          setFormData(prev => ({ ...prev, content }))
                          if (errors.content) setErrors(prev => ({ ...prev, content: '' }))
                        }}
                        placeholder="Escriu el contingut del post oficial..."
                        minHeight="200px"
                      />
                      {errors.content && (
                        <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                      )}
                    </div>

                    {/* Adjunts */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adjunts
                      </label>

                      {/* Botons afegir */}
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          Afegir imatge
                        </button>
                        <button
                          type="button"
                          onClick={() => documentInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <File className="w-4 h-4" />
                          Afegir document
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileSelect(e, 'image')}
                          className="hidden"
                        />
                        <input
                          ref={documentInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          multiple
                          onChange={(e) => handleFileSelect(e, 'document')}
                          className="hidden"
                        />
                      </div>

                      {/* Llista adjunts */}
                      {attachments.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {attachments.map(att => (
                            <div
                              key={att.id}
                              className="relative group border border-gray-200 rounded-lg overflow-hidden"
                            >
                              {att.type === 'image' && att.preview ? (
                                <img
                                  src={att.preview}
                                  alt=""
                                  className="w-full h-24 object-cover"
                                />
                              ) : (
                                <div className="h-24 flex items-center justify-center bg-gray-50">
                                  <div className="text-center">
                                    <File className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500 px-2 truncate max-w-[150px]">
                                      {att.file.name}
                                    </p>
                                  </div>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeAttachment(att.id)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <XIcon className="w-3 h-3" />
                              </button>
                              {att.uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {errors.attachments && (
                        <p className="mt-1 text-sm text-red-600">{errors.attachments}</p>
                      )}

                      <p className="mt-2 text-xs text-gray-500">
                        Formats permesos: JPG, PNG, GIF, WebP, PDF, DOC, DOCX. Màxim 10MB per fitxer.
                      </p>
                    </div>

                    {/* Badge oficial */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Badge oficial
                      </label>
                      <input
                        type="text"
                        value={formData.officialBadge}
                        onChange={(e) => setFormData(prev => ({ ...prev, officialBadge: e.target.value }))}
                        placeholder="La Pública"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Apareixerà com a etiqueta al costat del nom
                      </p>
                    </div>
                  </>
                )}

                {activeTab === 'settings' && (
                  <>
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
                              visibility: option.value,
                              selectedGroupIds: option.value !== 'GROUPS' ? [] : prev.selectedGroupIds
                            }))}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all ${
                              formData.visibility === option.value
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <option.icon className={`w-5 h-5 ${
                              formData.visibility === option.value ? 'text-purple-600' : 'text-gray-400'
                            }`} />
                            <div>
                              <p className={`font-medium text-sm ${
                                formData.visibility === option.value ? 'text-purple-900' : 'text-gray-900'
                              }`}>
                                {option.label}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                            </div>
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
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={selectAllGroups}
                              className="text-xs text-purple-600 hover:text-purple-700"
                            >
                              Seleccionar tots
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              type="button"
                              onClick={deselectAllGroups}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Deseleccionar tots
                            </button>
                          </div>
                        </div>

                        {loadingGroups ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                          </div>
                        ) : groups.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No hi ha grups disponibles
                          </p>
                        ) : (
                          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                            {groups.map(group => (
                              <label
                                key={group.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  formData.selectedGroupIds.includes(group.id)
                                    ? 'border-purple-600 bg-purple-600'
                                    : 'border-gray-300'
                                }`}>
                                  {formData.selectedGroupIds.includes(group.id) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <input
                                  type="checkbox"
                                  checked={formData.selectedGroupIds.includes(group.id)}
                                  onChange={() => toggleGroup(group.id)}
                                  className="sr-only"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{group.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {group.membersCount} membres
                                    {group.type && ` · ${group.type}`}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}

                        {formData.selectedGroupIds.length > 0 && (
                          <p className="mt-2 text-sm text-purple-600">
                            {formData.selectedGroupIds.length} grup(s) seleccionat(s)
                          </p>
                        )}

                        {errors.groups && (
                          <p className="mt-1 text-sm text-red-600">{errors.groups}</p>
                        )}
                      </div>
                    )}

                    {/* Opcions destacar */}
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.isPinned}
                          onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Pin className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-gray-900">Fixar al feed</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Apareixerà sempre a dalt
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" />
                            <span className="font-medium text-gray-900">Destacar</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Mostrarà un badge especial
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Data límit fixat */}
                    {formData.isPinned && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fixar fins (opcional)
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.pinnedUntil}
                          onChange={(e) => setFormData(prev => ({ ...prev, pinnedUntil: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                        />
                      </div>
                    )}

                    {/* Programar */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Programar publicació (opcional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-900"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Si no especifiques data, es publicarà immediatament
                      </p>
                    </div>
                  </>
                )}

                {activeTab === 'poll' && (
                  <>
                    {/* Toggle enquesta */}
                    <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasPoll}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasPoll: e.target.checked }))}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Afegir enquesta al post</span>
                      </div>
                    </label>

                    {formData.hasPoll && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                        {/* Pregunta */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pregunta de l'enquesta *
                          </label>
                          <input
                            type="text"
                            value={formData.pollQuestion}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, pollQuestion: e.target.value }))
                              if (errors.pollQuestion) setErrors(prev => ({ ...prev, pollQuestion: '' }))
                            }}
                            placeholder="Quina és la teva opinió sobre...?"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 text-gray-900"
                          />
                          {errors.pollQuestion && (
                            <p className="mt-1 text-sm text-red-600">{errors.pollQuestion}</p>
                          )}
                        </div>

                        {/* Opcions */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Opcions de resposta *
                          </label>
                          <div className="space-y-2">
                            {formData.pollOptions.map((option, index) => (
                              <div key={option.id} className="flex items-center gap-2">
                                <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                  {index + 1}
                                </span>
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) => updatePollOption(option.id, e.target.value)}
                                  placeholder={`Opció ${index + 1}`}
                                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                                {formData.pollOptions.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removePollOption(option.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {formData.pollOptions.length < 10 && (
                            <button
                              type="button"
                              onClick={addPollOption}
                              className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <Plus className="w-4 h-4" />
                              Afegir opció
                            </button>
                          )}
                          {errors.pollOptions && (
                            <p className="mt-1 text-sm text-red-600">{errors.pollOptions}</p>
                          )}
                        </div>

                        {/* Configuració enquesta */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipus de resposta
                            </label>
                            <select
                              value={formData.pollType}
                              onChange={(e) => setFormData(prev => ({ ...prev, pollType: e.target.value as 'SINGLE' | 'MULTIPLE' }))}
                              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-900"
                            >
                              <option value="SINGLE">Resposta única</option>
                              <option value="MULTIPLE">Múltiples respostes</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mostrar resultats
                            </label>
                            <select
                              value={formData.pollShowResults}
                              onChange={(e) => setFormData(prev => ({ ...prev, pollShowResults: e.target.value as 'ALWAYS' | 'AFTER_VOTE' | 'AFTER_END' | 'NEVER' }))}
                              className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-900"
                            >
                              <option value="ALWAYS">Sempre visibles</option>
                              <option value="AFTER_VOTE">Després de votar</option>
                              <option value="AFTER_END">Quan finalitzi</option>
                              <option value="NEVER">Mai (només admin)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data límit (opcional)
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.pollEndsAt}
                            onChange={(e) => setFormData(prev => ({ ...prev, pollEndsAt: e.target.value }))}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white text-gray-900"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.pollIsAnonymous}
                            onChange={(e) => setFormData(prev => ({ ...prev, pollIsAnonymous: e.target.checked }))}
                            className="rounded text-blue-600"
                          />
                          Vots anònims (no es mostrarà qui ha votat)
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {formData.visibility === 'GROUPS' && formData.selectedGroupIds.length > 0 && (
              <span className="flex items-center gap-1">
                <UserCheck className="w-4 h-4" />
                {formData.selectedGroupIds.length} grup(s)
              </span>
            )}
            {formData.scheduledAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Programat
              </span>
            )}
            {formData.hasPoll && (
              <span className="flex items-center gap-1">
                <BarChart2 className="w-4 h-4" />
                Amb enquesta
              </span>
            )}
            {attachments.length > 0 && (
              <span className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                {attachments.length} adjunt(s)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {formData.scheduledAt ? 'Programar' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
