'use client'

import { useState, useEffect } from 'react'
import {
  Palette,
  Droplet,
  Square,
  Maximize2,
  Save,
  RotateCcw,
  Loader2,
  Copy,
  Check,
  Sun,
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ============================================
// TYPES
// ============================================

export interface ColorTokenEditable {
  name: string
  value: string
  cssVariable: string
  description?: string
  group: 'primary' | 'semantic' | 'neutral' | 'background' | 'text' | 'border'
}

export interface ShadowTokenEditable {
  name: string
  value: string
  cssVariable: string
  description?: string
}

export interface RadiusTokenEditable {
  name: string
  value: string
  cssVariable: string
  description?: string
}

export interface SpacingTokenEditable {
  name: string
  value: string
  cssVariable: string
  description?: string
}

export interface GradientTokenEditable {
  name: string
  value: string
  cssVariable: string
  description?: string
}

// ============================================
// DEFAULT TOKENS
// ============================================

export const defaultColorTokens: ColorTokenEditable[] = [
  // Primary
  { name: 'primary', value: '#1E3A5F', cssVariable: '--color-primary', description: 'Color principal de la marca', group: 'primary' },
  { name: 'primary-light', value: '#2E5A8F', cssVariable: '--color-primary-light', description: 'Variant clara', group: 'primary' },
  { name: 'primary-dark', value: '#0E2A4F', cssVariable: '--color-primary-dark', description: 'Variant fosca', group: 'primary' },
  { name: 'secondary', value: '#2E7D32', cssVariable: '--color-secondary', description: 'Color secundari', group: 'primary' },
  { name: 'accent', value: '#FF6B35', cssVariable: '--color-accent', description: 'Color d\'accent', group: 'primary' },

  // Semantic
  { name: 'success', value: '#10B981', cssVariable: '--color-success', description: 'Accions correctes', group: 'semantic' },
  { name: 'success-light', value: '#D1FAE5', cssVariable: '--color-success-light', description: 'Fons success', group: 'semantic' },
  { name: 'warning', value: '#F59E0B', cssVariable: '--color-warning', description: 'Avisos', group: 'semantic' },
  { name: 'warning-light', value: '#FEF3C7', cssVariable: '--color-warning-light', description: 'Fons warning', group: 'semantic' },
  { name: 'error', value: '#EF4444', cssVariable: '--color-error', description: 'Errors', group: 'semantic' },
  { name: 'error-light', value: '#FEE2E2', cssVariable: '--color-error-light', description: 'Fons error', group: 'semantic' },
  { name: 'info', value: '#3B82F6', cssVariable: '--color-info', description: 'Informació', group: 'semantic' },
  { name: 'info-light', value: '#DBEAFE', cssVariable: '--color-info-light', description: 'Fons info', group: 'semantic' },

  // Neutral
  { name: 'slate-50', value: '#F8FAFC', cssVariable: '--color-slate-50', group: 'neutral' },
  { name: 'slate-100', value: '#F1F5F9', cssVariable: '--color-slate-100', group: 'neutral' },
  { name: 'slate-200', value: '#E2E8F0', cssVariable: '--color-slate-200', group: 'neutral' },
  { name: 'slate-300', value: '#CBD5E1', cssVariable: '--color-slate-300', group: 'neutral' },
  { name: 'slate-400', value: '#94A3B8', cssVariable: '--color-slate-400', group: 'neutral' },
  { name: 'slate-500', value: '#64748B', cssVariable: '--color-slate-500', group: 'neutral' },
  { name: 'slate-600', value: '#475569', cssVariable: '--color-slate-600', group: 'neutral' },
  { name: 'slate-700', value: '#334155', cssVariable: '--color-slate-700', group: 'neutral' },
  { name: 'slate-800', value: '#1E293B', cssVariable: '--color-slate-800', group: 'neutral' },
  { name: 'slate-900', value: '#0F172A', cssVariable: '--color-slate-900', group: 'neutral' },
]

export const defaultShadowTokens: ShadowTokenEditable[] = [
  { name: 'shadow-sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', cssVariable: '--shadow-sm', description: 'Ombra petita' },
  { name: 'shadow', value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', cssVariable: '--shadow', description: 'Ombra base' },
  { name: 'shadow-md', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', cssVariable: '--shadow-md', description: 'Ombra mitjana' },
  { name: 'shadow-lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', cssVariable: '--shadow-lg', description: 'Ombra gran' },
  { name: 'shadow-xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', cssVariable: '--shadow-xl', description: 'Ombra extra gran' },
  { name: 'shadow-2xl', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)', cssVariable: '--shadow-2xl', description: 'Ombra màxima' },
  { name: 'shadow-inner', value: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)', cssVariable: '--shadow-inner', description: 'Ombra interior' },
]

export const defaultRadiusTokens: RadiusTokenEditable[] = [
  { name: 'radius-none', value: '0', cssVariable: '--radius-none', description: 'Sense cantonada' },
  { name: 'radius-sm', value: '0.125rem', cssVariable: '--radius-sm', description: '2px' },
  { name: 'radius', value: '0.25rem', cssVariable: '--radius', description: '4px' },
  { name: 'radius-md', value: '0.375rem', cssVariable: '--radius-md', description: '6px' },
  { name: 'radius-lg', value: '0.5rem', cssVariable: '--radius-lg', description: '8px' },
  { name: 'radius-xl', value: '0.75rem', cssVariable: '--radius-xl', description: '12px' },
  { name: 'radius-2xl', value: '1rem', cssVariable: '--radius-2xl', description: '16px' },
  { name: 'radius-3xl', value: '1.5rem', cssVariable: '--radius-3xl', description: '24px' },
  { name: 'radius-full', value: '9999px', cssVariable: '--radius-full', description: 'Circular' },
]

export const defaultSpacingTokens: SpacingTokenEditable[] = [
  { name: 'spacing-0', value: '0', cssVariable: '--spacing-0', description: '0px' },
  { name: 'spacing-1', value: '0.25rem', cssVariable: '--spacing-1', description: '4px' },
  { name: 'spacing-2', value: '0.5rem', cssVariable: '--spacing-2', description: '8px' },
  { name: 'spacing-3', value: '0.75rem', cssVariable: '--spacing-3', description: '12px' },
  { name: 'spacing-4', value: '1rem', cssVariable: '--spacing-4', description: '16px' },
  { name: 'spacing-5', value: '1.25rem', cssVariable: '--spacing-5', description: '20px' },
  { name: 'spacing-6', value: '1.5rem', cssVariable: '--spacing-6', description: '24px' },
  { name: 'spacing-8', value: '2rem', cssVariable: '--spacing-8', description: '32px' },
  { name: 'spacing-10', value: '2.5rem', cssVariable: '--spacing-10', description: '40px' },
  { name: 'spacing-12', value: '3rem', cssVariable: '--spacing-12', description: '48px' },
  { name: 'spacing-16', value: '4rem', cssVariable: '--spacing-16', description: '64px' },
  { name: 'spacing-20', value: '5rem', cssVariable: '--spacing-20', description: '80px' },
]

export const defaultGradientTokens: GradientTokenEditable[] = [
  { name: 'gradient-primary', value: 'linear-gradient(135deg, #1E3A5F 0%, #2E5A8F 100%)', cssVariable: '--gradient-primary', description: 'Gradient principal' },
  { name: 'gradient-secondary', value: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)', cssVariable: '--gradient-secondary', description: 'Gradient secundari' },
  { name: 'gradient-accent', value: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5B 100%)', cssVariable: '--gradient-accent', description: 'Gradient accent' },
  { name: 'gradient-dark', value: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', cssVariable: '--gradient-dark', description: 'Gradient fosc' },
  { name: 'gradient-light', value: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)', cssVariable: '--gradient-light', description: 'Gradient clar' },
]

// ============================================
// COLORS EDITOR
// ============================================

interface ColorsEditorProps {
  tokens: ColorTokenEditable[]
  group: 'primary' | 'semantic' | 'neutral'
  onSave: (tokens: ColorTokenEditable[]) => Promise<void>
  onReset: () => void
}

export function ColorsEditor({ tokens, group, onSave, onReset }: ColorsEditorProps) {
  const [editedTokens, setEditedTokens] = useState<ColorTokenEditable[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedVar, setCopiedVar] = useState<string | null>(null)

  useEffect(() => {
    setEditedTokens(tokens)
    setHasChanges(false)
  }, [tokens])

  const filteredTokens = editedTokens.filter(t => t.group === group)

  const updateToken = (name: string, value: string) => {
    setEditedTokens(prev => prev.map(t =>
      t.name === name ? { ...t, value } : t
    ))
    setHasChanges(true)
    // Live preview
    const token = tokens.find(t => t.name === name)
    if (token) {
      document.documentElement.style.setProperty(token.cssVariable, value)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedTokens)
      setHasChanges(false)
      toast.success('Colors guardats correctament')
    } finally {
      setIsSaving(false)
    }
  }

  const copyVariable = async (cssVar: string) => {
    await navigator.clipboard.writeText(`var(${cssVar})`)
    setCopiedVar(cssVar)
    toast.success('Variable copiada!')
    setTimeout(() => setCopiedVar(null), 2000)
  }

  const getGroupTitle = () => {
    switch (group) {
      case 'primary': return 'Colors Primaris'
      case 'semantic': return 'Colors Semàntics'
      case 'neutral': return 'Colors Neutres'
    }
  }

  const getGroupDescription = () => {
    switch (group) {
      case 'primary': return 'Colors principals de la marca: primary, secondary i accent'
      case 'semantic': return 'Colors amb significat: success, warning, error, info'
      case 'neutral': return 'Escala de grisos per a textos i fons'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{getGroupTitle()}</h3>
          <p className="text-sm text-slate-500">{getGroupDescription()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
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
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTokens.map((token) => (
          <div
            key={token.name}
            className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Color Preview */}
              <div
                className="w-16 h-16 rounded-lg border border-slate-200 flex-shrink-0"
                style={{ backgroundColor: token.value }}
              />

              {/* Color Info & Editor */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900 text-sm">{token.name}</span>
                  <button
                    onClick={() => copyVariable(token.cssVariable)}
                    className="p-1 hover:bg-slate-100 rounded"
                    title="Copiar variable CSS"
                  >
                    {copiedVar === token.cssVariable ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-slate-400" />
                    )}
                  </button>
                </div>
                {token.description && (
                  <p className="text-xs text-slate-500 mb-2">{token.description}</p>
                )}
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={token.value}
                    onChange={(e) => updateToken(token.name, e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={token.value}
                    onChange={(e) => updateToken(token.name, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm font-mono border border-slate-200 rounded focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Preview */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Vista prèvia</h4>
        {group === 'primary' && (
          <div className="flex flex-wrap gap-3">
            {filteredTokens.filter(t => !t.name.includes('light') && !t.name.includes('dark')).map((token) => (
              <button
                key={token.name}
                className="px-4 py-2 text-white text-sm font-medium rounded-lg"
                style={{ backgroundColor: token.value }}
              >
                {token.name}
              </button>
            ))}
          </div>
        )}
        {group === 'semantic' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['success', 'warning', 'error', 'info'].map((type) => {
              const mainToken = filteredTokens.find(t => t.name === type)
              const lightToken = filteredTokens.find(t => t.name === `${type}-light`)
              return (
                <div
                  key={type}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: lightToken?.value || '#fff',
                    borderColor: mainToken?.value
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full mb-2"
                    style={{ backgroundColor: mainToken?.value }}
                  />
                  <p className="text-sm font-medium capitalize" style={{ color: mainToken?.value }}>
                    {type}
                  </p>
                </div>
              )
            })}
          </div>
        )}
        {group === 'neutral' && (
          <div className="flex h-12 rounded-lg overflow-hidden">
            {filteredTokens.map((token) => (
              <div
                key={token.name}
                className="flex-1"
                style={{ backgroundColor: token.value }}
                title={token.name}
              />
            ))}
          </div>
        )}
      </div>

      {hasChanges && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm text-amber-800">Tens canvis sense guardar</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// SHADOWS EDITOR
// ============================================

interface ShadowsEditorProps {
  tokens: ShadowTokenEditable[]
  onSave: (tokens: ShadowTokenEditable[]) => Promise<void>
  onReset: () => void
}

export function ShadowsEditor({ tokens, onSave, onReset }: ShadowsEditorProps) {
  const [editedTokens, setEditedTokens] = useState<ShadowTokenEditable[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      toast.success('Ombres guardades correctament')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Ombres (Box Shadows)</h3>
          <p className="text-sm text-slate-500">Defineix les ombres del sistema de disseny</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
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
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Shadow List */}
      <div className="space-y-4">
        {editedTokens.map((token) => (
          <div
            key={token.name}
            className="p-4 bg-white border border-slate-200 rounded-xl"
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Preview */}
              <div className="flex items-center justify-center p-6 bg-slate-100 rounded-lg">
                <div
                  className="w-24 h-24 bg-white rounded-lg"
                  style={{ boxShadow: token.value }}
                />
              </div>

              {/* Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{token.name}</span>
                  <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {token.cssVariable}
                  </code>
                </div>
                {token.description && (
                  <p className="text-sm text-slate-500">{token.description}</p>
                )}
                <textarea
                  value={token.value}
                  onChange={(e) => updateToken(token.name, e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder="0 4px 6px -1px rgb(0 0 0 / 0.1)"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm text-amber-800">Tens canvis sense guardar</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// RADIUS EDITOR
// ============================================

interface RadiusEditorProps {
  tokens: RadiusTokenEditable[]
  onSave: (tokens: RadiusTokenEditable[]) => Promise<void>
  onReset: () => void
}

export function RadiusEditor({ tokens, onSave, onReset }: RadiusEditorProps) {
  const [editedTokens, setEditedTokens] = useState<RadiusTokenEditable[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      toast.success('Border radius guardats correctament')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Border Radius</h3>
          <p className="text-sm text-slate-500">Defineix les cantonades arrodonides del sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
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
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Radius Grid */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
        {editedTokens.map((token) => (
          <div
            key={token.name}
            className="p-4 bg-white border border-slate-200 rounded-xl text-center"
          >
            {/* Preview */}
            <div className="flex items-center justify-center mb-3">
              <div
                className="w-16 h-16 bg-violet-500"
                style={{ borderRadius: token.value }}
              />
            </div>

            {/* Info */}
            <p className="text-sm font-medium text-slate-900 mb-1">
              {token.name.replace('radius-', '')}
            </p>
            <input
              type="text"
              value={token.value}
              onChange={(e) => updateToken(token.name, e.target.value)}
              className="w-full px-2 py-1 text-xs font-mono text-center border border-slate-200 rounded focus:ring-2 focus:ring-violet-500"
            />
          </div>
        ))}
      </div>

      {/* Visual Scale */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Escala visual</h4>
        <div className="flex items-end gap-4 justify-center">
          {editedTokens.map((token) => (
            <div key={token.name} className="text-center">
              <div
                className="w-12 h-12 bg-violet-500 mb-2"
                style={{ borderRadius: token.value }}
              />
              <span className="text-xs text-slate-500">{token.name.replace('radius-', '')}</span>
            </div>
          ))}
        </div>
      </div>

      {hasChanges && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm text-amber-800">Tens canvis sense guardar</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// SPACING EDITOR
// ============================================

interface SpacingEditorProps {
  tokens: SpacingTokenEditable[]
  onSave: (tokens: SpacingTokenEditable[]) => Promise<void>
  onReset: () => void
}

export function SpacingEditor({ tokens, onSave, onReset }: SpacingEditorProps) {
  const [editedTokens, setEditedTokens] = useState<SpacingTokenEditable[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      toast.success('Espaiat guardat correctament')
    } finally {
      setIsSaving(false)
    }
  }

  const parseToPixels = (value: string): number => {
    if (value === '0') return 0
    if (value.endsWith('rem')) return parseFloat(value) * 16
    if (value.endsWith('px')) return parseFloat(value)
    return 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Espaiat (Spacing)</h3>
          <p className="text-sm text-slate-500">Defineix l'escala d'espaiat per margins i paddings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
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
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Spacing Scale */}
      <div className="space-y-3">
        {editedTokens.map((token) => {
          const pixels = parseToPixels(token.value)
          return (
            <div
              key={token.name}
              className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg"
            >
              {/* Visual bar */}
              <div className="w-32 h-6 bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all"
                  style={{ width: `${Math.min(pixels * 2, 100)}%` }}
                />
              </div>

              {/* Name */}
              <span className="w-24 text-sm font-medium text-slate-900">
                {token.name.replace('spacing-', '')}
              </span>

              {/* Input */}
              <input
                type="text"
                value={token.value}
                onChange={(e) => updateToken(token.name, e.target.value)}
                className="w-24 px-2 py-1 text-sm font-mono border border-slate-200 rounded focus:ring-2 focus:ring-violet-500"
              />

              {/* Pixel equivalent */}
              <span className="text-sm text-slate-500 w-16">
                {pixels}px
              </span>

              {/* CSS Variable */}
              <code className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                {token.cssVariable}
              </code>
            </div>
          )
        })}
      </div>

      {/* Visual Demo */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Demostració visual</h4>
        <div className="flex items-start gap-2 flex-wrap">
          {editedTokens.slice(1, 8).map((token) => (
            <div
              key={token.name}
              className="bg-violet-500"
              style={{
                width: parseToPixels(token.value) * 2,
                height: parseToPixels(token.value) * 2,
                minWidth: 8,
                minHeight: 8
              }}
              title={`${token.name}: ${token.value}`}
            />
          ))}
        </div>
      </div>

      {hasChanges && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm text-amber-800">Tens canvis sense guardar</span>
        </div>
      )}
    </div>
  )
}

// ============================================
// GRADIENTS EDITOR
// ============================================

interface GradientsEditorProps {
  tokens: GradientTokenEditable[]
  onSave: (tokens: GradientTokenEditable[]) => Promise<void>
  onReset: () => void
}

export function GradientsEditor({ tokens, onSave, onReset }: GradientsEditorProps) {
  const [editedTokens, setEditedTokens] = useState<GradientTokenEditable[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      toast.success('Gradients guardats correctament')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Gradients</h3>
          <p className="text-sm text-slate-500">Defineix els degradats del sistema de disseny</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
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
                ? 'bg-violet-600 text-white hover:bg-violet-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Gradient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editedTokens.map((token) => (
          <div
            key={token.name}
            className="p-4 bg-white border border-slate-200 rounded-xl"
          >
            {/* Preview */}
            <div
              className="h-24 rounded-lg mb-4"
              style={{ background: token.value }}
            />

            {/* Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900 text-sm">{token.name}</span>
                <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {token.cssVariable}
                </code>
              </div>
              {token.description && (
                <p className="text-xs text-slate-500">{token.description}</p>
              )}
              <textarea
                value={token.value}
                onChange={(e) => updateToken(token.name, e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 resize-none"
                placeholder="linear-gradient(135deg, #color1 0%, #color2 100%)"
              />
            </div>
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm text-amber-800">Tens canvis sense guardar</span>
        </div>
      )}
    </div>
  )
}
