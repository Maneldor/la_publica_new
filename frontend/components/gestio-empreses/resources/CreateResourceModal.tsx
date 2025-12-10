// components/gestio-empreses/resources/CreateResourceModal.tsx
'use client'

import { useState } from 'react'
import {
  Plus,
  FileText,
  MessageSquare,
  Video,
  CheckSquare,
  Presentation,
  BookOpen,
  X,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ResourceEditor } from './ResourceEditor'
import {
  ResourceType,
  RESOURCE_TYPE_LABELS,
  CreateResourceDTO,
  UpdateResourceDTO
} from '@/lib/gestio-empreses/types/resources'

interface CreateResourceModalProps {
  isOpen: boolean
  onClose: () => void
  onResourceCreated: () => void
}

const resourceTypeConfig: Record<ResourceType, {
  icon: any
  color: string
  bgColor: string
  description: string
  examples: string[]
}> = {
  [ResourceType.EMAIL_TEMPLATE]: {
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Plantilles per a correus electrònics personalitzats',
    examples: ['Email de benvinguda', 'Seguiment comercial', 'Proposta econòmica']
  },
  [ResourceType.SPEECH]: {
    icon: Presentation,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Scripts per a presentacions i trucades comercials',
    examples: ['Primera trucada', 'Presentació de producte', 'Tancament de venda']
  },
  [ResourceType.DOCUMENT]: {
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Documents comercials i contractes',
    examples: ['Proposta comercial', 'Pre-contracte', 'Condicions de servei']
  },
  [ResourceType.GUIDE]: {
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Guies pas a pas per a processos comercials',
    examples: ['Guia de qualificació', 'Procés de tancament', 'Onboarding client']
  },
  [ResourceType.CHECKLIST]: {
    icon: CheckSquare,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    description: 'Llistes de verificació per a fases del pipeline',
    examples: ['Checklist pre-venda', 'Verificació de documents', 'Control qualitat']
  },
  [ResourceType.VIDEO]: {
    icon: Video,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Vídeos formatius i materials multimèdia',
    examples: ['Tutorial de producte', 'Formació comercial', 'Demo personalitzada']
  }
}

export function CreateResourceModal({ isOpen, onClose, onResourceCreated }: CreateResourceModalProps) {
  const [step, setStep] = useState<'select' | 'edit'>('select')
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const handleTypeSelect = (type: ResourceType) => {
    setSelectedType(type)
    setStep('edit')
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setStep('select')
    setSelectedType(null)
  }

  const handleSave = async (data: CreateResourceDTO | UpdateResourceDTO) => {
    // Aquesta funció hauria d'estar connectada amb les actions
    console.log('Saving resource:', data)
    // TODO: Implementar createResource action
    onResourceCreated()
    onClose()
  }

  const resetModal = () => {
    setStep('select')
    setSelectedType(null)
    setShowEditor(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Modal de selecció de tipus */}
      {step === 'select' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Crear Nou Recurs Comercial
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Selecciona el tipus de recurs que vols crear
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Tipus de recursos */}
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(resourceTypeConfig).map(([type, config]) => {
                  const Icon = config.icon

                  return (
                    <button
                      key={type}
                      onClick={() => handleTypeSelect(type as ResourceType)}
                      className={cn(
                        "text-left p-6 rounded-xl border-2 transition-all hover:shadow-md group",
                        config.bgColor
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn("p-3 rounded-lg", config.bgColor)}>
                          <Icon className={cn("w-6 h-6", config.color)} />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>

                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {RESOURCE_TYPE_LABELS[type as ResourceType]}
                      </h3>

                      <p className="text-sm text-slate-600 mb-4">
                        {config.description}
                      </p>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Exemples:
                        </p>
                        {config.examples.map((example, index) => (
                          <div key={index} className="text-xs text-slate-500">
                            • {example}
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Información adicional */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded-full">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      Consells per crear recursos efectius
                    </h4>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1">
                      <li>• Utilitza placeholders per personalitzar el contingut automàticament</li>
                      <li>• Defineix clarament l'objectiu i la fase del pipeline</li>
                      <li>• Inclou exemples i consells per als gestors</li>
                      <li>• Revisa i actualitza el contingut periòdicament</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {showEditor && selectedType && (
        <ResourceEditor
          isOpen={showEditor}
          onClose={handleEditorClose}
          mode="create"
          onSave={handleSave}
        />
      )}
    </>
  )
}