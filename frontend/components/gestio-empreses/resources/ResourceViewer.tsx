// components/gestio-empreses/resources/ResourceViewer.tsx
'use client'

import { useState } from 'react'
import {
  FileText,
  MessageSquare,
  Video,
  CheckSquare,
  Presentation,
  BookOpen,
  X,
  Download,
  Copy,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CommercialResource,
  ResourceType,
  ExtractedResource,
  SpeechContent,
  EmailTemplateContent,
  DocumentContent,
  GuideContent,
  ChecklistContent,
  RESOURCE_TYPE_LABELS,
  PIPELINE_PHASE_LABELS,
  RESOURCE_CATEGORY_LABELS
} from '@/lib/gestio-empreses/types/resources'

interface ResourceViewerProps {
  resource: CommercialResource | ExtractedResource
  isOpen: boolean
  onClose: () => void
  onExtract?: (resource: CommercialResource, customValues?: Record<string, any>) => void
  onCopy?: (content: string) => void
  showPlaceholderEditor?: boolean
  leadId?: string
}

const typeIcons: Record<ResourceType, any> = {
  [ResourceType.SPEECH]: Presentation,
  [ResourceType.EMAIL_TEMPLATE]: MessageSquare,
  [ResourceType.DOCUMENT]: FileText,
  [ResourceType.GUIDE]: BookOpen,
  [ResourceType.VIDEO]: Video,
  [ResourceType.CHECKLIST]: CheckSquare,
}

export function ResourceViewer({
  resource,
  isOpen,
  onClose,
  onExtract,
  onCopy,
  showPlaceholderEditor = false,
  leadId
}: ResourceViewerProps) {
  const [showProcessed, setShowProcessed] = useState(true)
  const [customValues, setCustomValues] = useState<Record<string, any>>({})
  const [showPlaceholders, setShowPlaceholders] = useState(false)

  if (!isOpen) return null

  const isExtracted = 'extractedContent' in resource
  const resourceData = isExtracted ? resource.resource : resource
  const IconComponent = typeIcons[resourceData.type]

  const handleExtract = () => {
    if (onExtract && !isExtracted) {
      onExtract(resourceData, customValues)
    }
  }

  const handleCopy = () => {
    const contentToCopy = isExtracted
      ? (showProcessed ? resource.extractedContent : getOriginalContent())
      : getOriginalContent()

    navigator.clipboard.writeText(contentToCopy)
    onCopy?.(contentToCopy)
  }

  const getOriginalContent = (): string => {
    const content = resourceData.content

    switch (resourceData.type) {
      case ResourceType.SPEECH:
        const speechContent = content as SpeechContent
        return speechContent.script

      case ResourceType.EMAIL_TEMPLATE:
        const emailContent = content as EmailTemplateContent
        return `Assumpte: ${emailContent.subject}\n\n${emailContent.body}`

      case ResourceType.DOCUMENT:
        const docContent = content as DocumentContent
        return docContent.content || ''

      case ResourceType.GUIDE:
        const guideContent = content as GuideContent
        return guideContent.steps
          .map(step => `${step.title}\n${step.description}${step.tips ? '\nTips: ' + step.tips.join(', ') : ''}`)
          .join('\n\n')

      case ResourceType.CHECKLIST:
        const checklistContent = content as ChecklistContent
        return checklistContent.items
          .map(item => `☐ ${item.label}${item.description ? ': ' + item.description : ''}`)
          .join('\n')

      default:
        return JSON.stringify(content, null, 2)
    }
  }

  const renderContent = () => {
    const contentToShow = isExtracted && showProcessed
      ? resource.extractedContent
      : getOriginalContent()

    switch (resourceData.type) {
      case ResourceType.EMAIL_TEMPLATE:
        if (isExtracted && showProcessed) {
          const lines = resource.extractedContent.split('\n')
          const subject = lines[0]?.replace('Assumpte: ', '') || ''
          const body = lines.slice(2).join('\n')

          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assumpte
                </label>
                <div className="p-3 bg-slate-50 rounded border">
                  {subject}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cos del missatge
                </label>
                <div className="p-4 bg-slate-50 rounded border whitespace-pre-wrap">
                  {body}
                </div>
              </div>
            </div>
          )
        }
        break

      case ResourceType.CHECKLIST:
        const checklistContent = resourceData.content as ChecklistContent
        return (
          <div className="space-y-3">
            {checklistContent.items.map((item, index) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded">
                <div className="w-5 h-5 border border-slate-300 rounded flex items-center justify-center mt-0.5">
                  <span className="text-xs text-slate-500">☐</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{item.label}</div>
                  {item.description && (
                    <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                  )}
                </div>
                {item.required && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                    Obligatori
                  </span>
                )}
              </div>
            ))}
            {checklistContent.successCriteria && (
              <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                <div className="font-medium text-blue-800">Criteris d'èxit</div>
                <div className="text-blue-700 text-sm mt-1">
                  {checklistContent.successCriteria}
                </div>
              </div>
            )}
          </div>
        )

      case ResourceType.GUIDE:
        const guideContent = resourceData.content as GuideContent
        return (
          <div className="space-y-4">
            {guideContent.steps.map((step, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <h4 className="font-medium text-slate-800">{step.title}</h4>
                </div>
                <p className="text-slate-600 mb-2">{step.description}</p>
                {step.tips && step.tips.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-slate-700 mb-1">Tips:</div>
                    <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                      {step.tips.map((tip, tipIndex) => (
                        <li key={tipIndex}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.warnings && step.warnings.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-amber-700 mb-1">Advertències:</div>
                    <ul className="text-sm text-amber-600 list-disc list-inside space-y-1">
                      {step.warnings.map((warning, wIndex) => (
                        <li key={wIndex}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {guideContent.estimatedTime && (
              <div className="mt-4 text-sm text-slate-500">
                Temps estimat: {guideContent.estimatedTime} minuts
              </div>
            )}
          </div>
        )
    }

    // Contenido por defecto
    return (
      <div className="p-4 bg-slate-50 rounded border">
        <pre className="whitespace-pre-wrap text-sm">{contentToShow}</pre>
      </div>
    )
  }

  const renderPlaceholderEditor = () => {
    if (!showPlaceholderEditor || !resourceData.placeholders) return null

    return (
      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setShowPlaceholders(!showPlaceholders)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3"
        >
          <Settings className="w-4 h-4" />
          Personalitzar placeholders
          {showPlaceholders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showPlaceholders && (
          <div className="space-y-3">
            {resourceData.placeholders.map(placeholder => (
              <div key={placeholder.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {placeholder.label}
                  {placeholder.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  placeholder={placeholder.description}
                  value={customValues[placeholder.key] || ''}
                  onChange={(e) => setCustomValues(prev => ({
                    ...prev,
                    [placeholder.key]: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            ))}
            <button
              onClick={handleExtract}
              disabled={!leadId}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Aplicar personalització
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <IconComponent className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {resourceData.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{RESOURCE_TYPE_LABELS[resourceData.type]}</span>
                <span>•</span>
                <span>{PIPELINE_PHASE_LABELS[resourceData.phase]}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isExtracted && (
              <button
                onClick={() => setShowProcessed(!showProcessed)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {showProcessed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showProcessed ? 'Veure original' : 'Veure processat'}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>

            {!isExtracted && onExtract && leadId && (
              <button
                onClick={handleExtract}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Extreure
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Description */}
          <div className="mb-6">
            <p className="text-slate-600">{resourceData.description}</p>
          </div>

          {/* Main content */}
          <div className="mb-6">
            {renderContent()}
          </div>

          {/* Placeholder editor */}
          {renderPlaceholderEditor()}

          {/* Metadata */}
          <div className="border-t border-slate-200 pt-4 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-slate-700">Categoria</div>
                <div className="text-slate-600">{RESOURCE_CATEGORY_LABELS[resourceData.category]}</div>
              </div>
              <div>
                <div className="font-medium text-slate-700">Versió</div>
                <div className="text-slate-600">v{resourceData.version}</div>
              </div>
              <div>
                <div className="font-medium text-slate-700">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {resourceData.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {resourceData.tags.length > 2 && (
                    <span className="text-slate-500 text-xs">+{resourceData.tags.length - 2}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-medium text-slate-700">Accés</div>
                <div className="text-slate-600">{resourceData.accessRoles.length} rol{resourceData.accessRoles.length > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}