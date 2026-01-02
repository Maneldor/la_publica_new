'use client'

import { useState, useEffect } from 'react'
import {
  Mail,
  Palette,
  Type,
  Square,
  Save,
  RotateCcw,
  Loader2,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface EmailToken {
  name: string
  value: string
  cssVariable: string
  description?: string
  category: 'header' | 'body' | 'footer' | 'button'
}

interface EmailEditorProps {
  tokens: EmailToken[]
  onSave: (tokens: EmailToken[]) => Promise<void>
  onReset: () => void
}

// Default email tokens
export const defaultEmailTokens: EmailToken[] = [
  // Header
  { name: 'email-header-background', value: '#1E3A5F', cssVariable: '--email-header-background', description: 'Color de fons de la capçalera', category: 'header' },
  { name: 'email-header-text', value: '#FFFFFF', cssVariable: '--email-header-text', description: 'Color del text de la capçalera', category: 'header' },
  { name: 'email-header-padding', value: '32px', cssVariable: '--email-header-padding', description: 'Padding de la capçalera', category: 'header' },
  { name: 'email-logo-height', value: '48px', cssVariable: '--email-logo-height', description: 'Alçada del logo', category: 'header' },

  // Body
  { name: 'email-body-background', value: '#FFFFFF', cssVariable: '--email-body-background', description: 'Color de fons del cos', category: 'body' },
  { name: 'email-body-text', value: '#334155', cssVariable: '--email-body-text', description: 'Color del text principal', category: 'body' },
  { name: 'email-body-padding', value: '40px', cssVariable: '--email-body-padding', description: 'Padding del cos', category: 'body' },
  { name: 'email-font-family', value: 'Arial, sans-serif', cssVariable: '--email-font-family', description: 'Font de l\'email', category: 'body' },
  { name: 'email-font-size', value: '16px', cssVariable: '--email-font-size', description: 'Mida de la font', category: 'body' },
  { name: 'email-line-height', value: '1.6', cssVariable: '--email-line-height', description: 'Interlineat', category: 'body' },
  { name: 'email-link-color', value: '#1E3A5F', cssVariable: '--email-link-color', description: 'Color dels enllaços', category: 'body' },

  // Footer
  { name: 'email-footer-background', value: '#F8FAFC', cssVariable: '--email-footer-background', description: 'Color de fons del peu', category: 'footer' },
  { name: 'email-footer-text', value: '#64748B', cssVariable: '--email-footer-text', description: 'Color del text del peu', category: 'footer' },
  { name: 'email-footer-padding', value: '24px', cssVariable: '--email-footer-padding', description: 'Padding del peu', category: 'footer' },
  { name: 'email-footer-font-size', value: '12px', cssVariable: '--email-footer-font-size', description: 'Mida de font del peu', category: 'footer' },

  // Button
  { name: 'email-button-background', value: '#1E3A5F', cssVariable: '--email-button-background', description: 'Color de fons del botó', category: 'button' },
  { name: 'email-button-text', value: '#FFFFFF', cssVariable: '--email-button-text', description: 'Color del text del botó', category: 'button' },
  { name: 'email-button-padding', value: '14px 28px', cssVariable: '--email-button-padding', description: 'Padding del botó', category: 'button' },
  { name: 'email-button-radius', value: '8px', cssVariable: '--email-button-radius', description: 'Border radius del botó', category: 'button' },
  { name: 'email-button-font-size', value: '14px', cssVariable: '--email-button-font-size', description: 'Mida de font del botó', category: 'button' },
  { name: 'email-button-font-weight', value: '600', cssVariable: '--email-button-font-weight', description: 'Pes de la font del botó', category: 'button' },
]

export function EmailEditor({ tokens, onSave, onReset }: EmailEditorProps) {
  const [editedTokens, setEditedTokens] = useState<EmailToken[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<EmailToken['category']>('header')
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    setEditedTokens(tokens)
    setHasChanges(false)
  }, [tokens])

  const updateToken = (name: string, value: string) => {
    setEditedTokens(prev => prev.map(t =>
      t.name === name ? { ...t, value } : t
    ))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedTokens)
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setEditedTokens(tokens)
    setHasChanges(false)
    onReset()
  }

  const getTokenValue = (name: string) => editedTokens.find(t => t.name === name)?.value || ''

  const categories: { id: EmailToken['category']; label: string; icon: typeof Mail }[] = [
    { id: 'header', label: 'Capçalera', icon: Square },
    { id: 'body', label: 'Cos', icon: Type },
    { id: 'footer', label: 'Peu', icon: Square },
    { id: 'button', label: 'Botons', icon: Square },
  ]

  const filteredTokens = editedTokens.filter(t => t.category === activeCategory)

  const renderTokenInput = (token: EmailToken) => {
    const isColor = token.name.includes('background') || token.name.includes('text') || token.name.includes('color')

    if (isColor) {
      return (
        <div className="flex gap-2">
          <input
            type="color"
            value={token.value.startsWith('#') ? token.value : '#ffffff'}
            onChange={(e) => updateToken(token.name, e.target.value)}
            className="w-12 h-10 rounded cursor-pointer border border-slate-300"
          />
          <input
            type="text"
            value={token.value}
            onChange={(e) => updateToken(token.name, e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )
    }

    if (token.name.includes('font-family')) {
      return (
        <select
          value={token.value}
          onChange={(e) => updateToken(token.name, e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="Arial, sans-serif">Arial</option>
          <option value="Helvetica, sans-serif">Helvetica</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="Tahoma, sans-serif">Tahoma</option>
        </select>
      )
    }

    if (token.name.includes('font-weight')) {
      return (
        <select
          value={token.value}
          onChange={(e) => updateToken(token.name, e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="400">Regular (400)</option>
          <option value="500">Medium (500)</option>
          <option value="600">Semibold (600)</option>
          <option value="700">Bold (700)</option>
        </select>
      )
    }

    return (
      <input
        type="text"
        value={token.value}
        onChange={(e) => updateToken(token.name, e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500"
        placeholder="Ex: 16px, 1.5rem"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            )
          })}
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            showPreview ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
          )}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      <div className={cn('grid gap-6', showPreview ? 'grid-cols-2' : 'grid-cols-1')}>
        {/* Token List */}
        <div className="space-y-4">
          {filteredTokens.map((token) => (
            <div key={token.name} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-900 capitalize">
                  {token.name.replace(/email-/g, '').replace(/-/g, ' ')}
                </label>
                <code className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                  {token.cssVariable}
                </code>
              </div>
              {token.description && (
                <p className="text-xs text-slate-500 mb-2">{token.description}</p>
              )}
              {renderTokenInput(token)}
            </div>
          ))}
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="sticky top-4">
            <div className="bg-slate-200 p-4 rounded-xl">
              <p className="text-xs text-slate-500 mb-3 text-center">Vista prèvia de l'email</p>
              <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden shadow-lg" style={{ fontFamily: getTokenValue('email-font-family') }}>
                {/* Email Header */}
                <div
                  className="text-center"
                  style={{
                    backgroundColor: getTokenValue('email-header-background'),
                    color: getTokenValue('email-header-text'),
                    padding: getTokenValue('email-header-padding')
                  }}
                >
                  <div
                    className="mx-auto bg-white rounded-lg flex items-center justify-center mb-3"
                    style={{ width: getTokenValue('email-logo-height'), height: getTokenValue('email-logo-height') }}
                  >
                    <span className="text-blue-600 font-bold">LP</span>
                  </div>
                  <h2 className="text-lg font-bold">Benvingut a La Pública</h2>
                </div>

                {/* Email Body */}
                <div
                  style={{
                    backgroundColor: getTokenValue('email-body-background'),
                    color: getTokenValue('email-body-text'),
                    padding: getTokenValue('email-body-padding'),
                    fontSize: getTokenValue('email-font-size'),
                    lineHeight: getTokenValue('email-line-height')
                  }}
                >
                  <p className="mb-4">
                    Hola <strong>Joan</strong>,
                  </p>
                  <p className="mb-4">
                    Gràcies per registrar-te. Estem encantats de donar-te la benvinguda a la nostra comunitat.
                  </p>
                  <div className="text-center my-6">
                    <button
                      className="inline-block"
                      style={{
                        backgroundColor: getTokenValue('email-button-background'),
                        color: getTokenValue('email-button-text'),
                        padding: getTokenValue('email-button-padding'),
                        borderRadius: getTokenValue('email-button-radius'),
                        fontSize: getTokenValue('email-button-font-size'),
                        fontWeight: getTokenValue('email-button-font-weight'),
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Verificar compte
                    </button>
                  </div>
                  <p className="text-sm">
                    Si tens cap dubte, <a href="#" style={{ color: getTokenValue('email-link-color') }}>contacta'ns</a>.
                  </p>
                </div>

                {/* Email Footer */}
                <div
                  className="text-center"
                  style={{
                    backgroundColor: getTokenValue('email-footer-background'),
                    color: getTokenValue('email-footer-text'),
                    padding: getTokenValue('email-footer-padding'),
                    fontSize: getTokenValue('email-footer-font-size')
                  }}
                >
                  <p>La Pública - Connectant professionals públics</p>
                  <p className="mt-2">Barcelona, Catalunya</p>
                </div>
              </div>
            </div>
          </div>
        )}
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              hasChanges
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
