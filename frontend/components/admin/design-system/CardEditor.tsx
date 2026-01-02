'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, RotateCcw, Save, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription, CardHoverContent } from '@/components/ui/card'
import toast from 'react-hot-toast'

// ============================================
// TYPES
// ============================================

export interface CardTokenData {
  name: string
  value: string
  cssVariable: string
  description: string
}

interface CardEditorProps {
  tokens: CardTokenData[]
  onSave: (tokens: Array<{ name: string; value: string }>) => Promise<void>
  onReset?: () => Promise<void>
}

// ============================================
// PREDEFINED OPTIONS
// ============================================

const RADIUS_OPTIONS = [
  { value: '0', label: 'Cap (0)' },
  { value: '0.25rem', label: 'Petit (4px)' },
  { value: '0.375rem', label: 'Mitjà (6px)' },
  { value: '0.5rem', label: 'Gran (8px)' },
  { value: '0.75rem', label: 'Molt gran (12px)' },
  { value: '1rem', label: 'XL (16px)' },
  { value: '1.5rem', label: '2XL (24px)' },
]

const PADDING_OPTIONS = [
  { value: '0.5rem', label: 'Petit (8px)' },
  { value: '0.75rem', label: 'Compacte (12px)' },
  { value: '1rem', label: 'Mitjà (16px)' },
  { value: '1.25rem', label: 'Gran (20px)' },
  { value: '1.5rem', label: 'Molt gran (24px)' },
  { value: '2rem', label: 'XL (32px)' },
]

const SHADOW_OPTIONS = [
  { value: 'none', label: 'Cap' },
  { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', label: 'Subtil (sm)' },
  { value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', label: 'Normal (default)' },
  { value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', label: 'Mitjana (md)' },
  { value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', label: 'Gran (lg)' },
  { value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', label: 'Molt gran (xl)' },
]

// ============================================
// CARD EDITOR COMPONENT
// ============================================

export function CardEditor({ tokens: initialTokens, onSave, onReset }: CardEditorProps) {
  const [tokens, setTokens] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // Initialize tokens from props
  useEffect(() => {
    const tokenMap: Record<string, string> = {}
    initialTokens.forEach(t => {
      tokenMap[t.name] = t.value
    })
    setTokens(tokenMap)
  }, [initialTokens])

  const updateToken = (name: string, value: string) => {
    setTokens(prev => ({ ...prev, [name]: value }))
    setHasChanges(true)
    // Live preview - update CSS variable
    document.documentElement.style.setProperty(`--${name}`, value)
  }

  const getToken = (name: string): string => {
    return tokens[name] || ''
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const tokensToSave = Object.entries(tokens).map(([name, value]) => ({ name, value }))
      await onSave(tokensToSave)
      setHasChanges(false)
      toast.success('Canvis guardats correctament!')
    } catch (error) {
      toast.error('Error guardant els canvis')
    }
    setIsSaving(false)
  }

  const handleReset = async () => {
    if (!confirm('Vols restaurar tots els valors per defecte?')) return
    if (onReset) {
      await onReset()
      toast.success('Valors restaurats')
    }
  }

  const copyToClipboard = async (text: string, name: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(name)
    toast.success('Copiat!')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Preview Panel */}
      <div className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
            Preview en Viu
          </h4>

          {/* Default Card */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Default</CardTitle>
                <CardDescription>Aquesta és la descripció de la card</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Contingut de la card amb els estils del Design System aplicats.
                </p>
              </CardContent>
            </Card>

            <Card variant="highlighted">
              <CardHeader noDivider>
                <CardTitle>Card Destacada</CardTitle>
                <CardDescription>Variant highlighted</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Card amb estil destacat.
                </p>
              </CardContent>
            </Card>

            <Card variant="interactive">
              <CardHeader noDivider>
                <CardTitle>Card Interactiva</CardTitle>
                <CardDescription>Passa el ratolí per sobre</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Card amb efecte hover.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="space-y-6">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
            Editor de Tokens
          </h4>

          <div className="space-y-5">
            {/* Background Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Color de fons
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getToken('card-background') || '#ffffff'}
                  onChange={(e) => updateToken('card-background', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={getToken('card-background') || '#ffffff'}
                  onChange={(e) => updateToken('card-background', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(`var(--card-background)`, 'card-background')}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                  title="Copiar variable CSS"
                >
                  {copied === 'card-background' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Border Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Color de vora
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getToken('card-border-color') || '#e5e7eb'}
                  onChange={(e) => updateToken('card-border-color', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={getToken('card-border-color') || '#e5e7eb'}
                  onChange={(e) => updateToken('card-border-color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Border Radius
              </label>
              <select
                value={getToken('card-border-radius') || '0.75rem'}
                onChange={(e) => updateToken('card-border-radius', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {RADIUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Shadow */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Ombra
              </label>
              <select
                value={getToken('card-shadow') || 'none'}
                onChange={(e) => updateToken('card-shadow', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SHADOW_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Content Padding */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Padding del contingut
              </label>
              <select
                value={getToken('card-content-padding') || '1.25rem'}
                onChange={(e) => updateToken('card-content-padding', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PADDING_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Title Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Color del títol
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getToken('card-title-color') || '#111827'}
                  onChange={(e) => updateToken('card-title-color', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={getToken('card-title-color') || '#111827'}
                  onChange={(e) => updateToken('card-title-color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Color de descripció
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getToken('card-description-color') || '#6b7280'}
                  onChange={(e) => updateToken('card-description-color', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={getToken('card-description-color') || '#6b7280'}
                  onChange={(e) => updateToken('card-description-color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Highlighted Border */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Border destacat (highlighted)
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={getToken('card-highlighted-border-color') || '#3b82f6'}
                  onChange={(e) => updateToken('card-highlighted-border-color', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border border-slate-300"
                />
                <input
                  type="text"
                  value={getToken('card-highlighted-border-color') || '#3b82f6'}
                  onChange={(e) => updateToken('card-highlighted-border-color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
            {onReset && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ml-auto',
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Guardant...' : 'Guardar canvis'}
            </button>
          </div>

          {hasChanges && (
            <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Tens canvis sense guardar
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardEditor
