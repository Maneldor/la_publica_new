'use client'

import { useState, useEffect } from 'react'
import {
  Mail,
  FileText,
  Palette,
  Save,
  RotateCcw,
  Loader2,
  Eye,
  Code,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Package,
  Coins,
  Calendar,
  PartyPopper,
  Gift,
  Star,
  CheckCircle,
  Bell,
  Heart,
  Sparkles
} from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  getEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate,
  resetEmailTemplate,
  initializeEmailTemplates,
  type EmailTemplateData,
  type EmailTemplateUpdateData
} from '@/lib/actions/email-template-actions'

// Client-side preview function (not a server action)
function renderEmailPreview(template: EmailTemplateData, customData?: Record<string, string>): {
  subject: string
  body: string
  title: string
  subtitle: string | null
  buttonText: string | null
  footer: string | null
} {
  const defaultPreviewData: Record<string, string> = {
    nom: 'Joan Garcia',
    email: 'joan.garcia@exemple.cat',
    empresa: 'Tech Solutions BCN',
    nomEmpresa: 'La Meva Empresa SL',
    verificacioUrl: 'https://lapublica.cat/verificar/abc123',
    resetUrl: 'https://lapublica.cat/reset/xyz789',
    url: 'https://lapublica.cat/detall',
    empresaUrl: 'https://lapublica.cat/empresa/la-meva-empresa',
    ofertaUrl: 'https://lapublica.cat/oferta/super-descompte',
    titol: 'Títol de la Notificació',
    previsualitzacio: 'Text de previsualització',
    missatge: 'Aquest és el contingut del missatge de notificació.',
    textBoto: 'Veure més',
    titolOferta: 'Descompte exclusiu en serveis',
    descripcioOferta: 'Aprofita aquest descompte exclusiu per a membres de La Pública.',
    descompte: '25',
    dataFi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ca-ES'),
  }

  const data = { ...defaultPreviewData, ...customData }

  const replaceVariables = (text: string | null): string => {
    if (!text) return ''
    let result = text
    Object.entries(data).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return result
  }

  return {
    subject: replaceVariables(template.subject),
    body: replaceVariables(template.body),
    title: replaceVariables(template.title),
    subtitle: replaceVariables(template.subtitle),
    buttonText: replaceVariables(template.buttonText),
    footer: replaceVariables(template.footer),
  }
}

// ============================================
// TYPES
// ============================================

interface EmailContentEditorProps {
  onSave?: () => void
}

// ============================================
// COMPONENT
// ============================================

export function EmailContentEditor({ onSave }: EmailContentEditorProps) {
  const [templates, setTemplates] = useState<EmailTemplateData[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateData | null>(null)
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplateData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'styles'>('content')
  const [showCode, setShowCode] = useState(false)

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setIsLoading(true)
    const result = await getEmailTemplates()
    if (result.success && result.data) {
      setTemplates(result.data)
      if (result.data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(result.data[0])
        setEditedTemplate(result.data[0])
      }
    } else if (result.data?.length === 0) {
      // Initialize templates if empty
      await handleInitialize()
    }
    setIsLoading(false)
  }

  const handleInitialize = async () => {
    setIsLoading(true)
    const result = await initializeEmailTemplates()
    if (result.success) {
      toast.success(`${result.count} templates inicialitzats`)
      await loadTemplates()
    } else {
      toast.error(result.error || 'Error al inicialitzar')
    }
    setIsLoading(false)
  }

  const selectTemplate = (template: EmailTemplateData) => {
    if (hasChanges) {
      if (!confirm('Tens canvis sense guardar. Vols continuar?')) {
        return
      }
    }
    setSelectedTemplate(template)
    setEditedTemplate(template)
    setHasChanges(false)
  }

  const updateField = <K extends keyof EmailTemplateData>(field: K, value: EmailTemplateData[K]) => {
    if (!editedTemplate) return
    setEditedTemplate({ ...editedTemplate, [field]: value })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!editedTemplate || !selectedTemplate) return

    setIsSaving(true)
    const updateData: EmailTemplateUpdateData = {
      subject: editedTemplate.subject,
      preheader: editedTemplate.preheader,
      title: editedTemplate.title,
      subtitle: editedTemplate.subtitle,
      body: editedTemplate.body,
      buttonText: editedTemplate.buttonText,
      buttonUrl: editedTemplate.buttonUrl,
      footer: editedTemplate.footer,
      styles: editedTemplate.styles,
    }

    const result = await updateEmailTemplate(selectedTemplate.name, updateData)

    if (result.success && result.data) {
      setSelectedTemplate(result.data)
      setEditedTemplate(result.data)
      setHasChanges(false)
      toast.success('Template guardat correctament')
      onSave?.()
    } else {
      toast.error(result.error || 'Error al guardar')
    }
    setIsSaving(false)
  }

  const handleReset = async () => {
    if (!selectedTemplate) return

    if (!confirm('Això restaurarà el template als valors per defecte. Continuar?')) {
      return
    }

    setIsSaving(true)
    const result = await resetEmailTemplate(selectedTemplate.name)

    if (result.success && result.data) {
      setSelectedTemplate(result.data)
      setEditedTemplate(result.data)
      setHasChanges(false)
      toast.success('Template restaurat')
    } else {
      toast.error(result.error || 'Error al restaurar')
    }
    setIsSaving(false)
  }

  // Get preview with replaced variables
  const preview = editedTemplate ? renderEmailPreview(editedTemplate) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-3 text-slate-600">Carregant templates...</span>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Mail className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No hi ha templates</h3>
        <p className="text-sm text-slate-500 mb-4">Inicialitza els templates d'email per defecte</p>
        <button
          onClick={handleInitialize}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <RefreshCw className="h-4 w-4" />
          Inicialitzar Templates
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <Mail className="h-5 w-5 text-orange-600" />
        <span className="text-sm font-medium text-slate-700">Template:</span>
        <select
          value={selectedTemplate?.name || ''}
          onChange={(e) => {
            const template = templates.find(t => t.name === e.target.value)
            if (template) selectTemplate(template)
          }}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
        >
          {templates.map((t) => (
            <option key={t.name} value={t.name}>
              {t.displayName} - {t.description}
            </option>
          ))}
        </select>
      </div>

      {editedTemplate && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('content')}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'content'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              <FileText className="h-4 w-4" />
              Contingut
            </button>
            <button
              onClick={() => setActiveTab('styles')}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === 'styles'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              <Palette className="h-4 w-4" />
              Estils
            </button>
            <div className="ml-auto flex items-center gap-2 pb-3">
              <button
                onClick={() => setShowCode(!showCode)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  showCode ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600'
                )}
                title="Mostrar codi"
              >
                <Code className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Editor Panel */}
            <div className="space-y-6">
              {activeTab === 'content' && (
                <ContentEditor
                  template={editedTemplate}
                  onChange={updateField}
                />
              )}
              {activeTab === 'styles' && (
                <StylesEditor
                  template={editedTemplate}
                  onChange={(styles) => updateField('styles', styles)}
                />
              )}
            </div>

            {/* Preview Panel */}
            <div className="sticky top-4">
              {showCode ? (
                <CodePreview template={editedTemplate} />
              ) : (
                <EmailPreview template={editedTemplate} preview={preview} />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {hasChanges && (
              <span className="flex items-center gap-2 text-sm text-amber-600">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Canvis sense guardar
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
                  hasChanges
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================
// CONTENT EDITOR
// ============================================

function ContentEditor({
  template,
  onChange,
}: {
  template: EmailTemplateData
  onChange: <K extends keyof EmailTemplateData>(field: K, value: EmailTemplateData[K]) => void
}) {
  const availableVariables = template.variables || []

  return (
    <div className="space-y-5">
      {/* Subject */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Assumpte del correu
        </label>
        <input
          type="text"
          value={template.subject}
          onChange={(e) => onChange('subject', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          placeholder="Benvingut/da a La Pública!"
        />
      </div>

      {/* Preheader */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Previsualització (preheader)
          <span className="font-normal text-slate-400 ml-2">opcional</span>
        </label>
        <input
          type="text"
          value={template.preheader || ''}
          onChange={(e) => onChange('preheader', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          placeholder="Text que apareix a la inbox abans d'obrir"
        />
        <p className="text-xs text-slate-500">
          Text que es mostra a la llista de correus abans d'obrir
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Títol principal
        </label>
        <input
          type="text"
          value={template.title}
          onChange={(e) => onChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          placeholder="Benvingut a La Pública"
        />
      </div>

      {/* Subtitle */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Subtítol
          <span className="font-normal text-slate-400 ml-2">opcional</span>
        </label>
        <input
          type="text"
          value={template.subtitle || ''}
          onChange={(e) => onChange('subtitle', e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
          placeholder="La teva comunitat de professionals"
        />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Cos del missatge
        </label>
        <textarea
          value={template.body}
          onChange={(e) => onChange('body', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 font-mono resize-none"
          placeholder="Hola {{nom}}..."
        />
      </div>

      {/* Button */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Text del botó
            <span className="font-normal text-slate-400 ml-2">opcional</span>
          </label>
          <input
            type="text"
            value={template.buttonText || ''}
            onChange={(e) => onChange('buttonText', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
            placeholder="Verificar compte"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            URL del botó
          </label>
          <input
            type="text"
            value={template.buttonUrl || ''}
            onChange={(e) => onChange('buttonUrl', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500"
            placeholder="{{verificacioUrl}}"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Peu de pàgina
          <span className="font-normal text-slate-400 ml-2">opcional</span>
        </label>
        <textarea
          value={template.footer || ''}
          onChange={(e) => onChange('footer', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 resize-none"
          placeholder="Si tens cap dubte, contacta'ns."
        />
      </div>

      {/* Variables Helper */}
      {availableVariables.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">
            Variables disponibles:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableVariables.map((v) => (
              <VariableTag key={v} variable={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// STYLES EDITOR
// ============================================

function StylesEditor({
  template,
  onChange,
}: {
  template: EmailTemplateData
  onChange: (styles: Record<string, string> | null) => void
}) {
  const styles = template.styles || {}

  const updateStyle = (key: string, value: string) => {
    onChange({ ...styles, [key]: value })
  }

  const styleFields = [
    { key: 'headerBg', label: 'Fons capçalera', type: 'color', default: '#1E3A5F' },
    { key: 'headerText', label: 'Text capçalera', type: 'color', default: '#FFFFFF' },
    { key: 'bodyBg', label: 'Fons cos', type: 'color', default: '#FFFFFF' },
    { key: 'bodyText', label: 'Text cos', type: 'color', default: '#334155' },
    { key: 'buttonBg', label: 'Fons botó', type: 'color', default: '#1E3A5F' },
    { key: 'buttonText', label: 'Text botó', type: 'color', default: '#FFFFFF' },
    { key: 'footerBg', label: 'Fons peu', type: 'color', default: '#F8FAFC' },
    { key: 'footerText', label: 'Text peu', type: 'color', default: '#64748B' },
    { key: 'linkColor', label: 'Color enllaços', type: 'color', default: '#1E3A5F' },
    { key: 'borderRadius', label: 'Border radius', type: 'text', default: '8px' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Personalitza els estils d'aquest template. Deixa en blanc per usar els estils globals.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {styleFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              {field.label}
            </label>
            <div className="flex gap-2">
              {field.type === 'color' && (
                <input
                  type="color"
                  value={styles[field.key] || field.default}
                  onChange={(e) => updateStyle(field.key, e.target.value)}
                  className="w-10 h-9 rounded cursor-pointer border border-slate-200"
                />
              )}
              <input
                type="text"
                value={styles[field.key] || ''}
                onChange={(e) => updateStyle(field.key, e.target.value)}
                placeholder={field.default}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onChange(null)}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        Restaurar estils per defecte
      </button>
    </div>
  )
}

// ============================================
// EMOJI TO ICON MAPPING
// ============================================

const emojiToIcon: Record<string, React.ReactNode> = {
  '📦': <Package className="inline-block h-4 w-4 text-amber-600" />,
  '💰': <Coins className="inline-block h-4 w-4 text-amber-600" />,
  '📅': <Calendar className="inline-block h-4 w-4 text-blue-600" />,
  '🎉': <PartyPopper className="inline-block h-4 w-4 text-pink-500" />,
  '🎁': <Gift className="inline-block h-4 w-4 text-purple-600" />,
  '⭐': <Star className="inline-block h-4 w-4 text-yellow-500" />,
  '✅': <CheckCircle className="inline-block h-4 w-4 text-green-600" />,
  '🔔': <Bell className="inline-block h-4 w-4 text-orange-500" />,
  '❤️': <Heart className="inline-block h-4 w-4 text-red-500" />,
  '✨': <Sparkles className="inline-block h-4 w-4 text-yellow-500" />,
  '•': <span className="inline-block w-1.5 h-1.5 bg-current rounded-full mx-1" />,
}

// Function to render text with Lucide icons replacing emojis
function renderTextWithIcons(text: string): React.ReactNode {
  const emojiPattern = /📦|💰|📅|🎉|🎁|⭐|✅|🔔|❤️|✨|•/g
  const parts = text.split(emojiPattern)
  const matches = text.match(emojiPattern) || []

  const result: React.ReactNode[] = []

  parts.forEach((part, index) => {
    result.push(part)
    if (matches[index]) {
      result.push(
        <React.Fragment key={`icon-${index}`}>
          {emojiToIcon[matches[index]] || matches[index]}
        </React.Fragment>
      )
    }
  })

  return result
}

// ============================================
// EMAIL PREVIEW
// ============================================

function EmailPreview({
  template,
  preview,
}: {
  template: EmailTemplateData
  preview: ReturnType<typeof renderEmailPreview> | null
}) {
  if (!preview) return null

  const styles = template.styles || {}

  return (
    <div className="bg-slate-200 p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-medium">Vista prèvia</span>
        <Eye className="h-4 w-4 text-slate-400" />
      </div>

      <div
        className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* Header */}
        <div
          className="text-center py-6 px-4"
          style={{
            backgroundColor: styles.headerBg || '#1E3A5F',
            color: styles.headerText || '#FFFFFF',
          }}
        >
          <div
            className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center font-bold text-lg"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: styles.headerText || '#FFFFFF',
            }}
          >
            LP
          </div>
          <h1 className="text-xl font-bold mb-1">{renderTextWithIcons(preview.title)}</h1>
          {preview.subtitle && (
            <p className="text-sm opacity-80">{renderTextWithIcons(preview.subtitle)}</p>
          )}
        </div>

        {/* Body */}
        <div
          className="px-6 py-6"
          style={{
            backgroundColor: styles.bodyBg || '#FFFFFF',
            color: styles.bodyText || '#334155',
          }}
        >
          <div className="text-sm leading-relaxed mb-6">
            {preview.body.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {renderTextWithIcons(line)}
                {idx < preview.body.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          {/* Button */}
          {preview.buttonText && (
            <div className="text-center">
              <button
                className="px-6 py-3 rounded-lg font-medium text-sm"
                style={{
                  backgroundColor: styles.buttonBg || '#1E3A5F',
                  color: styles.buttonText || '#FFFFFF',
                  borderRadius: styles.borderRadius || '8px',
                }}
              >
                {renderTextWithIcons(preview.buttonText)}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {preview.footer && (
          <div
            className="px-6 py-4 text-center border-t"
            style={{
              backgroundColor: styles.footerBg || '#F8FAFC',
              color: styles.footerText || '#64748B',
              borderColor: '#E2E8F0',
            }}
          >
            <div className="text-xs">
              {preview.footer.split('\n').map((line, idx) => (
                <React.Fragment key={idx}>
                  {renderTextWithIcons(line)}
                  {idx < (preview.footer?.split('\n').length || 1) - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subject preview */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500 mb-1">Assumpte:</p>
        <p className="text-sm font-medium text-slate-900">{renderTextWithIcons(preview.subject)}</p>
      </div>
    </div>
  )
}

// ============================================
// CODE PREVIEW
// ============================================

function CodePreview({ template }: { template: EmailTemplateData }) {
  const [copied, setCopied] = useState(false)

  const codeString = JSON.stringify({
    name: template.name,
    subject: template.subject,
    title: template.title,
    subtitle: template.subtitle,
    body: template.body,
    buttonText: template.buttonText,
    buttonUrl: template.buttonUrl,
    footer: template.footer,
    variables: template.variables,
  }, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString)
    setCopied(true)
    toast.success('Codi copiat!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800">
        <span className="text-xs text-slate-400 font-mono">template.json</span>
        <button
          onClick={handleCopy}
          className="p-1 text-slate-400 hover:text-white"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="p-4 text-xs text-slate-300 overflow-auto max-h-[600px]">
        <code>{codeString}</code>
      </pre>
    </div>
  )
}

// ============================================
// VARIABLE TAG
// ============================================

function VariableTag({ variable }: { variable: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`{{${variable}}}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'px-2 py-1 text-xs font-mono rounded transition-colors',
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      )}
    >
      {copied ? '✓ Copiat' : `{{${variable}}}`}
    </button>
  )
}
