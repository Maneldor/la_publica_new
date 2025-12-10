// components/gestio-empreses/resources/ResourceEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Save,
  Eye,
  Copy,
  Plus,
  Minus,
  Type,
  Hash,
  Calendar,
  Mail,
  User,
  Building,
  AlertCircle,
  Info,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CommercialResource,
  ResourceType,
  PipelinePhase,
  ResourceCategory,
  ResourceRole,
  Placeholder,
  PlaceholderType,
  CreateResourceDTO,
  UpdateResourceDTO,
  SpeechContent,
  EmailTemplateContent,
  DocumentContent,
  GuideContent,
  ChecklistContent,
  RESOURCE_TYPE_LABELS,
  PIPELINE_PHASE_LABELS,
  RESOURCE_CATEGORY_LABELS,
  DEFAULT_PLACEHOLDERS
} from '@/lib/gestio-empreses/types/resources'

interface ResourceEditorProps {
  resource?: CommercialResource | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateResourceDTO | UpdateResourceDTO) => Promise<void>
  mode: 'create' | 'edit'
}

const placeholderIcons: Record<PlaceholderType, any> = {
  [PlaceholderType.COMPANY]: Building,
  [PlaceholderType.CONTACT]: User,
  [PlaceholderType.SYSTEM]: Calendar,
  [PlaceholderType.CUSTOM]: Hash,
}

export function ResourceEditor({ resource, isOpen, onClose, onSave, mode }: ResourceEditorProps) {
  const [formData, setFormData] = useState<CreateResourceDTO>({
    slug: '',
    title: '',
    description: '',
    type: ResourceType.EMAIL_TEMPLATE,
    phase: PipelinePhase.CONTACTED,
    category: ResourceCategory.PRESENTATION,
    content: { subject: '', body: '' },
    placeholders: [],
    tags: [],
    accessRoles: [ResourceRole.GESTOR_ESTANDARD],
    version: '1.0'
  })

  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'placeholders' | 'preview'>('basic')
  const [saving, setSaving] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Inicializar formulario cuando se abre el editor
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && resource) {
        setFormData({
          slug: resource.slug,
          title: resource.title,
          description: resource.description,
          type: resource.type,
          phase: resource.phase,
          category: resource.category,
          content: resource.content,
          placeholders: resource.placeholders || [],
          tags: resource.tags,
          accessRoles: resource.accessRoles,
          version: resource.version
        })
      } else {
        // Reset para crear nuevo
        setFormData({
          slug: '',
          title: '',
          description: '',
          type: ResourceType.EMAIL_TEMPLATE,
          phase: PipelinePhase.CONTACTED,
          category: ResourceCategory.PRESENTATION,
          content: getDefaultContent(ResourceType.EMAIL_TEMPLATE),
          placeholders: [],
          tags: [],
          accessRoles: [ResourceRole.GESTOR_ESTANDARD],
          version: '1.0'
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, resource])

  // Generar slug automáticamente desde el título
  useEffect(() => {
    if (mode === 'create' && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim()
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title, mode])

  // Actualizar contenido por defecto cuando cambia el tipo
  useEffect(() => {
    if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        content: getDefaultContent(prev.type)
      }))
    }
  }, [formData.type, mode])

  function getDefaultContent(type: ResourceType): any {
    switch (type) {
      case ResourceType.EMAIL_TEMPLATE:
        return {
          subject: 'Assumpte de l\'email - {{company.name}}',
          body: 'Estimat/da {{contact.name}},\n\n[Contingut del missatge]\n\nCordials salutacions,\n{{system.user.name}}\nLa Pública Solucions'
        }
      case ResourceType.SPEECH:
        return {
          script: 'Bon dia {{contact.name}},\n\nSóc {{system.user.name}} de La Pública Solucions...',
          duration: 5,
          objectives: ['Objectiu principal'],
          keyPoints: ['Punt clau 1', 'Punt clau 2'],
          objections: []
        }
      case ResourceType.DOCUMENT:
        return {
          format: 'MARKDOWN',
          content: '# Document per a {{company.name}}\n\n**Data:** {{system.date}}\n**Gestor:** {{system.user.name}}\n\n## Contingut\n\n[Contingut del document]'
        }
      case ResourceType.GUIDE:
        return {
          steps: [
            {
              title: 'Primer pas',
              description: 'Descripció del primer pas',
              tips: ['Consell útil']
            }
          ],
          estimatedTime: 10
        }
      case ResourceType.CHECKLIST:
        return {
          items: [
            {
              id: '1',
              label: 'Primera verificació',
              description: 'Descripció de la verificació',
              required: true,
              order: 1
            }
          ],
          successCriteria: 'Criteris d\'èxit'
        }
      default:
        return {}
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'El títol és obligatori'
    if (!formData.slug.trim()) newErrors.slug = 'L\'slug és obligatori'
    if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria'
    if (formData.tags.length === 0) newErrors.tags = 'Almenys un tag és obligatori'
    if (formData.accessRoles.length === 0) newErrors.accessRoles = 'Almenys un rol d\'accés és obligatori'

    // Validar contenido según tipo
    if (formData.type === ResourceType.EMAIL_TEMPLATE) {
      const content = formData.content as EmailTemplateContent
      if (!content.subject?.trim()) newErrors.content = 'L\'assumpte de l\'email és obligatori'
      if (!content.body?.trim()) newErrors.content = 'El cos de l\'email és obligatori'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      if (mode === 'edit' && resource) {
        await onSave({ id: resource.id, ...formData } as UpdateResourceDTO)
      } else {
        await onSave(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving resource:', error)
    } finally {
      setSaving(false)
    }
  }

  const addPlaceholder = () => {
    const newPlaceholder: Placeholder = {
      key: '',
      label: '',
      type: PlaceholderType.CUSTOM,
      description: '',
      required: false
    }
    setFormData(prev => ({
      ...prev,
      placeholders: [...prev.placeholders || [], newPlaceholder]
    }))
  }

  const updatePlaceholder = (index: number, field: keyof Placeholder, value: any) => {
    setFormData(prev => ({
      ...prev,
      placeholders: prev.placeholders?.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ) || []
    }))
  }

  const removePlaceholder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      placeholders: prev.placeholders?.filter((_, i) => i !== index) || []
    }))
  }

  const addTag = () => {
    const tag = prompt('Nou tag:')?.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const renderContentEditor = () => {
    switch (formData.type) {
      case ResourceType.EMAIL_TEMPLATE:
        return renderEmailEditor()
      case ResourceType.SPEECH:
        return renderSpeechEditor()
      case ResourceType.DOCUMENT:
        return renderDocumentEditor()
      case ResourceType.GUIDE:
        return renderGuideEditor()
      case ResourceType.CHECKLIST:
        return renderChecklistEditor()
      default:
        return <div className="text-slate-500">Selecciona un tipus de recurs</div>
    }
  }

  const renderEmailEditor = () => {
    const content = formData.content as EmailTemplateContent

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Assumpte *
          </label>
          <input
            type="text"
            value={content.subject || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              content: { ...content, subject: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Assumpte de l'email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cos del missatge *
          </label>
          <textarea
            value={content.body || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              content: { ...content, body: e.target.value }
            }))}
            rows={12}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Escriu el contingut de l'email aquí..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Dies per seguiment
          </label>
          <input
            type="number"
            value={content.followUpDays || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              content: { ...content, followUpDays: parseInt(e.target.value) || undefined }
            }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="7"
            min="1"
            max="30"
          />
        </div>
      </div>
    )
  }

  const renderSpeechEditor = () => {
    const content = formData.content as SpeechContent

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Script del discurs *
          </label>
          <textarea
            value={content.script || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              content: { ...content, script: e.target.value }
            }))}
            rows={10}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Escriu el script del discurs aquí..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Duració (minuts)
            </label>
            <input
              type="number"
              value={content.duration || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                content: { ...content, duration: parseInt(e.target.value) || undefined }
              }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5"
              min="1"
              max="60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Objectius
          </label>
          <div className="space-y-2">
            {(content.objectives || []).map((objective, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => {
                    const newObjectives = [...(content.objectives || [])]
                    newObjectives[index] = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      content: { ...content, objectives: newObjectives }
                    }))
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Objectiu"
                />
                <button
                  onClick={() => {
                    const newObjectives = (content.objectives || []).filter((_, i) => i !== index)
                    setFormData(prev => ({
                      ...prev,
                      content: { ...content, objectives: newObjectives }
                    }))
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  content: {
                    ...content,
                    objectives: [...(content.objectives || []), '']
                  }
                }))
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Afegir objectiu
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderDocumentEditor = () => {
    const content = formData.content as DocumentContent

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Format del document
          </label>
          <select
            value={content.format || 'MARKDOWN'}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              content: { ...content, format: e.target.value as any }
            }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="MARKDOWN">Markdown</option>
            <option value="HTML">HTML</option>
            <option value="PDF">PDF</option>
            <option value="DOC">Word</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Contingut del document *
          </label>
          <textarea
            value={content.content || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              content: { ...content, content: e.target.value }
            }))}
            rows={15}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Escriu el contingut del document aquí..."
          />
        </div>
      </div>
    )
  }

  const renderGuideEditor = () => {
    const content = formData.content as GuideContent

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Temps estimat (minuts)
          </label>
          <input
            type="number"
            value={content.estimatedTime || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              content: { ...content, estimatedTime: parseInt(e.target.value) || undefined }
            }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="10"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Passos de la guia
          </label>
          <div className="space-y-4">
            {(content.steps || []).map((step, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Pas {index + 1}</span>
                  <button
                    onClick={() => {
                      const newSteps = (content.steps || []).filter((_, i) => i !== index)
                      setFormData(prev => ({
                        ...prev,
                        content: { ...content, steps: newSteps }
                      }))
                    }}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => {
                    const newSteps = [...(content.steps || [])]
                    newSteps[index] = { ...step, title: e.target.value }
                    setFormData(prev => ({
                      ...prev,
                      content: { ...content, steps: newSteps }
                    }))
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                  placeholder="Títol del pas"
                />

                <textarea
                  value={step.description}
                  onChange={(e) => {
                    const newSteps = [...(content.steps || [])]
                    newSteps[index] = { ...step, description: e.target.value }
                    setFormData(prev => ({
                      ...prev,
                      content: { ...content, steps: newSteps }
                    }))
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Descripció del pas"
                />
              </div>
            ))}

            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  content: {
                    ...content,
                    steps: [
                      ...(content.steps || []),
                      { title: '', description: '', tips: [] }
                    ]
                  }
                }))
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Afegir pas
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderChecklistEditor = () => {
    const content = formData.content as ChecklistContent

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Criteris d'èxit
          </label>
          <textarea
            value={content.successCriteria || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              content: { ...content, successCriteria: e.target.value }
            }))}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Defineix els criteris d'èxit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Ítems del checklist
          </label>
          <div className="space-y-3">
            {(content.items || []).map((item, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Ítem {index + 1}</span>
                  <button
                    onClick={() => {
                      const newItems = (content.items || []).filter((_, i) => i !== index)
                      setFormData(prev => ({
                        ...prev,
                        content: { ...content, items: newItems }
                      }))
                    }}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const newItems = [...(content.items || [])]
                    newItems[index] = { ...item, label: e.target.value }
                    setFormData(prev => ({
                      ...prev,
                      content: { ...content, items: newItems }
                    }))
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                  placeholder="Etiqueta de l'ítem"
                />

                <textarea
                  value={item.description || ''}
                  onChange={(e) => {
                    const newItems = [...(content.items || [])]
                    newItems[index] = { ...item, description: e.target.value }
                    setFormData(prev => ({
                      ...prev,
                      content: { ...content, items: newItems }
                    }))
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                  placeholder="Descripció de l'ítem"
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.required}
                    onChange={(e) => {
                      const newItems = [...(content.items || [])]
                      newItems[index] = { ...item, required: e.target.checked }
                      setFormData(prev => ({
                        ...prev,
                        content: { ...content, items: newItems }
                      }))
                    }}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-600">Obligatori</span>
                </label>
              </div>
            ))}

            <button
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  content: {
                    ...content,
                    items: [
                      ...(content.items || []),
                      {
                        id: Date.now().toString(),
                        label: '',
                        description: '',
                        required: false,
                        order: (content.items || []).length + 1
                      }
                    ]
                  }
                }))
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Afegir ítem
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {mode === 'create' ? 'Crear Recurs' : `Editar: ${resource?.title}`}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Editor complet per a plantilles comercials
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Desant...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Desar
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          {[
            { id: 'basic', label: 'Informació bàsica', icon: Type },
            { id: 'content', label: 'Contingut', icon: Type },
            { id: 'placeholders', label: 'Placeholders', icon: Hash },
            { id: 'preview', label: 'Vista prèvia', icon: Eye }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-slate-600 hover:text-slate-800"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="max-w-2xl space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Títol *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      errors.title ? "border-red-300" : "border-slate-300"
                    )}
                    placeholder="Nom del recurs"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      errors.slug ? "border-red-300" : "border-slate-300"
                    )}
                    placeholder="slug-del-recurs"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripció *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.description ? "border-red-300" : "border-slate-300"
                  )}
                  placeholder="Descripció del recurs"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipus *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ResourceType }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fase del pipeline *
                  </label>
                  <select
                    value={formData.phase}
                    onChange={(e) => setFormData(prev => ({ ...prev, phase: e.target.value as PipelinePhase }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(PIPELINE_PHASE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ResourceCategory }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(RESOURCE_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tags *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={addTag}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Afegir tag
                </button>
                {errors.tags && (
                  <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rols d'accés *
                </label>
                <div className="space-y-2">
                  {Object.values(ResourceRole).map(role => (
                    <label key={role} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.accessRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              accessRoles: [...prev.accessRoles, role]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              accessRoles: prev.accessRoles.filter(r => r !== role)
                            }))
                          }
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-600">{role}</span>
                    </label>
                  ))}
                </div>
                {errors.accessRoles && (
                  <p className="text-sm text-red-600 mt-1">{errors.accessRoles}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'content' && renderContentEditor()}

          {activeTab === 'placeholders' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-slate-800">Gestió de Placeholders</h3>
                  <p className="text-sm text-slate-500">
                    Defineix els camps que es poden personalitzar
                  </p>
                </div>
                <button
                  onClick={addPlaceholder}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Afegir placeholder
                </button>
              </div>

              {(formData.placeholders || []).length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Hash className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No hi ha placeholders definits</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.placeholders?.map((placeholder, index) => {
                    const Icon = placeholderIcons[placeholder.type]
                    return (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <Icon className="w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            value={placeholder.key}
                            onChange={(e) => updatePlaceholder(index, 'key', e.target.value)}
                            placeholder="clau.placeholder"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                          />
                          <button
                            onClick={() => removePlaceholder(index)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            value={placeholder.label}
                            onChange={(e) => updatePlaceholder(index, 'label', e.target.value)}
                            placeholder="Etiqueta visible"
                            className="px-3 py-2 border border-slate-300 rounded-lg"
                          />
                          <select
                            value={placeholder.type}
                            onChange={(e) => updatePlaceholder(index, 'type', e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg"
                          >
                            {Object.values(PlaceholderType).map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <textarea
                          value={placeholder.description || ''}
                          onChange={(e) => updatePlaceholder(index, 'description', e.target.value)}
                          placeholder="Descripció del placeholder"
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                        />

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={placeholder.required || false}
                            onChange={(e) => updatePlaceholder(index, 'required', e.target.checked)}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-600">Camp obligatori</span>
                        </label>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="max-w-4xl">
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-800">Vista prèvia</h3>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700">
                    {JSON.stringify(formData.content, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}