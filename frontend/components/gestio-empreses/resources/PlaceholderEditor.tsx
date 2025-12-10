// components/gestio-empreses/resources/PlaceholderEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Save,
  Eye,
  EyeOff,
  Hash,
  Building,
  User,
  Calendar,
  AlertCircle,
  Info,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CommercialResource,
  ExtractedResource,
  PlaceholderType,
  LeadData
} from '@/lib/gestio-empreses/types/resources'
import {
  generatePlaceholderConfig,
  processContentWithPlaceholders,
  getQuickPreview
} from '@/lib/gestio-empreses/utils/placeholder-utils'

interface PlaceholderEditorProps {
  resource: CommercialResource
  leadData: LeadData
  userId: string
  userName?: string
  isOpen: boolean
  onClose: () => void
  onExtract?: (extractedResource: ExtractedResource) => void
  onCopy?: (content: string) => void
}

const placeholderTypeIcons: Record<PlaceholderType, any> = {
  [PlaceholderType.COMPANY]: Building,
  [PlaceholderType.CONTACT]: User,
  [PlaceholderType.SYSTEM]: Calendar,
  [PlaceholderType.CUSTOM]: Hash,
}

const placeholderTypeColors: Record<PlaceholderType, string> = {
  [PlaceholderType.COMPANY]: 'text-blue-600',
  [PlaceholderType.CONTACT]: 'text-green-600',
  [PlaceholderType.SYSTEM]: 'text-purple-600',
  [PlaceholderType.CUSTOM]: 'text-orange-600',
}

export function PlaceholderEditor({
  resource,
  leadData,
  userId,
  userName,
  isOpen,
  onClose,
  onExtract,
  onCopy
}: PlaceholderEditorProps) {
  const [customValues, setCustomValues] = useState<Record<string, any>>({})
  const [showPreview, setShowPreview] = useState(true)
  const [extractedContent, setExtractedContent] = useState('')
  const [processing, setProcessing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Procesar contenido cuando cambien los valores
  useEffect(() => {
    if (isOpen) {
      processContent()
    }
  }, [customValues, isOpen, leadData])

  const processContent = () => {
    setProcessing(true)

    try {
      // Generar configuración de placeholders
      const placeholderConfig = generatePlaceholderConfig(
        leadData,
        userId,
        userName,
        customValues
      )

      // Obtener contenido según el tipo de recurso
      let contentToProcess = ''

      switch (resource.type) {
        case 'EMAIL_TEMPLATE':
          const emailContent = resource.content as any
          contentToProcess = `${emailContent.subject}\n\n${emailContent.body}`
          break
        case 'SPEECH':
          contentToProcess = (resource.content as any).script || ''
          break
        case 'DOCUMENT':
          contentToProcess = (resource.content as any).content || ''
          break
        case 'GUIDE':
          const guideContent = resource.content as any
          contentToProcess = guideContent.steps
            ?.map((step: any) => `${step.title}\n${step.description}`)
            .join('\n\n') || ''
          break
        case 'CHECKLIST':
          const checklistContent = resource.content as any
          contentToProcess = checklistContent.items
            ?.map((item: any) => `☐ ${item.label}: ${item.description}`)
            .join('\n') || ''
          break
        default:
          contentToProcess = JSON.stringify(resource.content)
      }

      // Procesar placeholders
      const preview = processContentWithPlaceholders(contentToProcess, placeholderConfig)
      setExtractedContent(preview.processedContent)

      // Verificar errores de validación
      const newErrors: Record<string, string> = {}
      resource.placeholders?.forEach(placeholder => {
        if (placeholder.required && placeholder.type === PlaceholderType.CUSTOM) {
          const value = customValues[placeholder.key]
          if (!value || (typeof value === 'string' && !value.trim())) {
            newErrors[placeholder.key] = 'Aquest camp és obligatori'
          }
        }
      })
      setErrors(newErrors)

    } catch (error) {
      console.error('Error processing content:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleCustomValueChange = (key: string, value: any) => {
    setCustomValues(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleExtract = () => {
    if (Object.keys(errors).length > 0) {
      alert('Si us plau, emplena tots els camps obligatoris')
      return
    }

    const extractedResource: ExtractedResource = {
      resource,
      extractedContent,
      placeholderValues: {
        ...generatePlaceholderConfig(leadData, userId, userName, customValues).systemValues,
        ...generatePlaceholderConfig(leadData, userId, userName, customValues).companyValues,
        ...generatePlaceholderConfig(leadData, userId, userName, customValues).contactValues,
        ...customValues
      }
    }

    onExtract?.(extractedResource)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.(extractedContent)
  }

  const resetValues = () => {
    setCustomValues({})
  }

  // Agrupar placeholders por tipo
  const groupedPlaceholders = resource.placeholders?.reduce((acc, placeholder) => {
    if (!acc[placeholder.type]) {
      acc[placeholder.type] = []
    }
    acc[placeholder.type].push(placeholder)
    return acc
  }, {} as Record<PlaceholderType, typeof resource.placeholders>)

  // Obtener valores automáticos
  const autoValues = generatePlaceholderConfig(leadData, userId, userName)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Personalitzar: {resource.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ajusta els camps variables per a {leadData.companyName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Amagar vista prèvia' : 'Mostrar vista prèvia'}
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiat!' : 'Copiar'}
            </button>

            <button
              onClick={handleExtract}
              disabled={Object.keys(errors).length > 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              Extreure
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Panel de edición */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-slate-200">
            <div className="space-y-6">
              {/* Información del lead */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Informació del lead</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Empresa:</span>
                    <span className="ml-2 font-medium">{leadData.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Contacte:</span>
                    <span className="ml-2 font-medium">{leadData.contactName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <span className="ml-2 font-medium">{leadData.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Gestor:</span>
                    <span className="ml-2 font-medium">{userName || 'Sistema'}</span>
                  </div>
                </div>
              </div>

              {/* Placeholders editables */}
              {groupedPlaceholders && Object.entries(groupedPlaceholders).map(([type, placeholders]) => {
                const Icon = placeholderTypeIcons[type as PlaceholderType]
                const color = placeholderTypeColors[type as PlaceholderType]

                // Solo mostrar placeholders CUSTOM (editables para gestores)
                if (type !== PlaceholderType.CUSTOM) return null

                return (
                  <div key={type} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-5 h-5", color)} />
                      <h3 className="text-sm font-medium text-slate-700">
                        Camps personalitzables
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {placeholders?.map(placeholder => (
                        <div key={placeholder.key}>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            {placeholder.label}
                            {placeholder.required && <span className="text-red-500 ml-1">*</span>}
                          </label>

                          {placeholder.description && (
                            <p className="text-xs text-slate-500 mb-2">
                              {placeholder.description}
                            </p>
                          )}

                          <input
                            type="text"
                            value={customValues[placeholder.key] || ''}
                            onChange={(e) => handleCustomValueChange(placeholder.key, e.target.value)}
                            className={cn(
                              "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                              errors[placeholder.key] ? "border-red-300" : "border-slate-300"
                            )}
                            placeholder={`Introdueix ${placeholder.label.toLowerCase()}`}
                          />

                          {errors[placeholder.key] && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors[placeholder.key]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Información de valores automáticos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">
                      Valors automàtics
                    </h4>
                    <p className="text-xs text-blue-700 mt-1 mb-3">
                      Aquests camps s'omplen automàticament amb les dades del lead i del sistema.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-blue-600">Data:</span>
                        <span className="ml-2">{autoValues.systemValues['system.date']}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Empresa:</span>
                        <span className="ml-2">{autoValues.companyValues['company.name']}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Contacte:</span>
                        <span className="ml-2">{autoValues.contactValues['contact.name'] || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Gestor:</span>
                        <span className="ml-2">{autoValues.systemValues['system.user.name']}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <button
                  onClick={resetValues}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  <RefreshCw className="w-4 h-4" />
                  Restablir valors
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel·lar
                  </button>
                  <button
                    onClick={handleExtract}
                    disabled={Object.keys(errors).length > 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Aplicar i extreure
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de vista previa */}
          {showPreview && (
            <div className="w-1/2 p-6 bg-slate-50 overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">Vista prèvia</h3>
                {processing && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Processant...
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                  {extractedContent || 'Configura els camps per veure la vista prèvia...'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}