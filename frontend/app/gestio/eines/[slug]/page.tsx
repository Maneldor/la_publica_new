'use client'

import { useState } from 'react'
import { Plus, FileText, Mail, File, CheckSquare, Play, Book, X, Copy, Eye } from 'lucide-react'
import dynamic from 'next/dynamic'

// Import ReactQuill dinamically para evitar SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// Datos de ejemplo - esto se reemplazará por datos reales
const MOCK_RESOURCES = [
  {
    id: '1',
    title: 'Presentació Inicial per a PYMEs',
    type: 'SPEECH',
    content: 'Bon dia, sóc de La Pública Solucions...',
    category: 'TRUCADA_INICIAL',
    tags: ['primer-contacte', 'pyme'],
    accessRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC'],
    createdBy: { id: '1', name: 'Sistema' },
    updatedBy: { id: '1', name: 'Sistema' },
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: 'presentacio-inicial-pyme',
    description: 'Script per al primer contacte',
    isActive: true
  },
  {
    id: '2',
    title: 'Email de Seguiment',
    type: 'EMAIL_TEMPLATE',
    content: 'Estimat/da, li escric per fer seguiment...',
    category: 'SEGUIMENT',
    tags: ['seguiment', 'email'],
    accessRoles: ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC'],
    createdBy: { id: '1', name: 'Sistema' },
    updatedBy: { id: '1', name: 'Sistema' },
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: 'email-seguiment',
    description: 'Plantilla per al seguiment',
    isActive: true
  },
  {
    id: '3',
    title: 'Contracte Bàsic Pla Pioner',
    type: 'DOCUMENT',
    content: 'CONTRACTE DE SERVEIS DIGITALS...',
    category: 'DOCUMENTACIO',
    tags: ['contracte', 'pioner'],
    accessRoles: ['GESTOR_ESTRATEGIC', 'ADMIN'],
    createdBy: { id: '1', name: 'Sistema' },
    updatedBy: { id: '1', name: 'Sistema' },
    createdAt: new Date(),
    updatedAt: new Date(),
    slug: 'contracte-basic-pioner',
    description: 'Contracte per al pla Pioner',
    isActive: true
  }
]

const RESOURCE_TYPES = [
  { value: 'SPEECH', label: 'Discurs/Script', icon: FileText },
  { value: 'EMAIL_TEMPLATE', label: 'Plantilla Email', icon: Mail },
  { value: 'DOCUMENT', label: 'Document', icon: File },
  { value: 'CHECKLIST', label: 'Checklist', icon: CheckSquare },
  { value: 'VIDEO', label: 'Vídeo', icon: Play },
  { value: 'GUIDE', label: 'Guia', icon: Book }
]

export default function RecursosPage({ params }: { params: { slug: string } }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [selectedType, setSelectedType] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [resources] = useState(MOCK_RESOURCES)
  const [copied, setCopied] = useState(false)

  // Simular rol del usuario (esto vendría del contexto de autenticación)
  // Cambiar esta variable para probar diferentes roles:
  // 'ADMIN', 'CRM_COMERCIAL' -> Pueden crear recursos
  // 'GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE' -> Solo pueden usar recursos
  const userRole = 'ADMIN' // Cambiar para probar diferentes roles

  const canCreateResources = ['SUPER_ADMIN', 'ADMIN', 'CRM_COMERCIAL'].includes(userRole)
  const canUseResources = ['GESTOR_ESTANDARD', 'GESTOR_ESTRATEGIC', 'GESTOR_ENTERPRISE'].includes(userRole)

  const handleCreateResource = () => {
    // Aquí se guardará el recurso
    console.log('Crear recurso:', { selectedType, title, content })
    setShowCreateModal(false)
    setSelectedType('')
    setTitle('')
    setContent('')
  }

  // Configuración del editor WYSIWYG
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'link'
  ]

  const getIcon = (type: string) => {
    const resourceType = RESOURCE_TYPES.find(t => t.value === type)
    const Icon = resourceType?.icon || FileText
    return <Icon className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Recursos Comercials
              </h1>
              <p className="text-slate-600 mt-1">
                {canCreateResources
                  ? 'Crea nous recursos per als gestors comercials'
                  : 'Utilitza els recursos disponibles per a l\'activitat comercial'
                }
              </p>
            </div>
            {canCreateResources && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nou Recurs
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Grups de recursos - Todos pueden ver los recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESOURCE_TYPES.map((type) => {
              const typeResources = resources.filter(r => r.type === type.value)
              const Icon = type.icon

              return (
                <div key={type.value} className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{type.label}</h3>
                      <p className="text-sm text-slate-500">{typeResources.length} recursos</p>
                    </div>
                  </div>

                  {/* Recursos del tipus */}
                  <div className="space-y-3">
                    {typeResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedResource(resource)
                          setShowViewModal(true)
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900 text-sm">
                            {resource.title}
                          </h4>
                          <Eye className="w-4 h-4 text-slate-400" />
                        </div>

                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                          {resource.content.substring(0, 80)}...
                        </p>

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {resource.category}
                          </span>
                          <div className="text-xs text-slate-500">
                            {resource.accessRoles.length} rol{resource.accessRoles.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    ))}

                    {typeResources.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">
                        Cap recurs d'aquest tipus
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
      </div>

      {/* Modal Crear Recurs */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                Crear Nou Recurs
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Tipus de recurs */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipus de Recurs
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RESOURCE_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                          selectedType === type.value
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Títol */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Títol
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introdueix el títol del recurs..."
                />
              </div>

              {/* Editor WYSIWYG */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contingut
                </label>
                <div className="border border-slate-300 rounded-md">
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Escriu el contingut del recurs..."
                    className="bg-white"
                    style={{ minHeight: '200px' }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel·lar
              </button>
              <button
                onClick={handleCreateResource}
                disabled={!selectedType || !title || !content}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Recurs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Veure Recurs */}
      {showViewModal && selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-slate-200 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {selectedResource.title}
                </h2>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {selectedResource.category}
                  </span>
                  <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {RESOURCE_TYPES.find(t => t.value === selectedResource.type)?.label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedResource(null)
                  setCopied(false)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Descripció */}
              {selectedResource.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Descripció:</h3>
                  <p className="text-slate-600">{selectedResource.description}</p>
                </div>
              )}

              {/* Contingut principal */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Contingut:</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                    {selectedResource.content}
                  </pre>
                </div>
              </div>

              {/* Tags */}
              {selectedResource.tags && selectedResource.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Etiquetes:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResource.tags.map((tag: string, index: number) => (
                      <span key={index} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Botons d'acció */}
              {canUseResources && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedResource.content)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copiat!' : 'Copiar Contingut'}
                  </button>
                  <button
                    onClick={() => {
                      // Aquí podrías implementar lógica adicional per "usar" el recurs
                      console.log('Usando recurso:', selectedResource.id)
                      alert('Recurs utilitzat correctament!')
                      setShowViewModal(false)
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Utilitzar Recurs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}