'use client'

import { useState, useEffect } from 'react'
import {
  Type,
  Save,
  RotateCcw,
  Loader2,
  Copy,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

// ============================================
// TYPES
// ============================================

export interface FontFamilyToken {
  name: string
  value: string
  cssVariable: string
  description?: string
}

export interface FontSizeToken {
  name: string
  value: string
  cssVariable: string
  description?: string
  lineHeight?: string
}

export interface FontWeightToken {
  name: string
  value: string
  cssVariable: string
  description?: string
}

export interface HeadingToken {
  name: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing?: string
  cssVariable: string
}

// ============================================
// DEFAULT TOKENS
// ============================================

export const defaultFontFamilyTokens: FontFamilyToken[] = [
  { name: 'font-sans', value: 'Inter, system-ui, -apple-system, sans-serif', cssVariable: '--font-sans', description: 'Font principal per a text' },
  { name: 'font-serif', value: 'Georgia, Cambria, "Times New Roman", serif', cssVariable: '--font-serif', description: 'Font per a text editorial' },
  { name: 'font-mono', value: 'JetBrains Mono, Menlo, Monaco, monospace', cssVariable: '--font-mono', description: 'Font per a codi' },
  { name: 'font-heading', value: 'Inter, system-ui, sans-serif', cssVariable: '--font-heading', description: 'Font per a títols' },
]

export const defaultFontSizeTokens: FontSizeToken[] = [
  { name: 'text-xs', value: '0.75rem', cssVariable: '--text-xs', description: '12px', lineHeight: '1rem' },
  { name: 'text-sm', value: '0.875rem', cssVariable: '--text-sm', description: '14px', lineHeight: '1.25rem' },
  { name: 'text-base', value: '1rem', cssVariable: '--text-base', description: '16px', lineHeight: '1.5rem' },
  { name: 'text-lg', value: '1.125rem', cssVariable: '--text-lg', description: '18px', lineHeight: '1.75rem' },
  { name: 'text-xl', value: '1.25rem', cssVariable: '--text-xl', description: '20px', lineHeight: '1.75rem' },
  { name: 'text-2xl', value: '1.5rem', cssVariable: '--text-2xl', description: '24px', lineHeight: '2rem' },
  { name: 'text-3xl', value: '1.875rem', cssVariable: '--text-3xl', description: '30px', lineHeight: '2.25rem' },
  { name: 'text-4xl', value: '2.25rem', cssVariable: '--text-4xl', description: '36px', lineHeight: '2.5rem' },
  { name: 'text-5xl', value: '3rem', cssVariable: '--text-5xl', description: '48px', lineHeight: '1' },
  { name: 'text-6xl', value: '3.75rem', cssVariable: '--text-6xl', description: '60px', lineHeight: '1' },
]

export const defaultFontWeightTokens: FontWeightToken[] = [
  { name: 'font-thin', value: '100', cssVariable: '--font-thin', description: 'Thin' },
  { name: 'font-extralight', value: '200', cssVariable: '--font-extralight', description: 'Extra Light' },
  { name: 'font-light', value: '300', cssVariable: '--font-light', description: 'Light' },
  { name: 'font-normal', value: '400', cssVariable: '--font-normal', description: 'Normal (Regular)' },
  { name: 'font-medium', value: '500', cssVariable: '--font-medium', description: 'Medium' },
  { name: 'font-semibold', value: '600', cssVariable: '--font-semibold', description: 'Semibold' },
  { name: 'font-bold', value: '700', cssVariable: '--font-bold', description: 'Bold' },
  { name: 'font-extrabold', value: '800', cssVariable: '--font-extrabold', description: 'Extra Bold' },
  { name: 'font-black', value: '900', cssVariable: '--font-black', description: 'Black' },
]

export const defaultHeadingTokens: HeadingToken[] = [
  { name: 'h1', fontSize: '2.25rem', fontWeight: '700', lineHeight: '2.5rem', letterSpacing: '-0.025em', cssVariable: '--heading-h1' },
  { name: 'h2', fontSize: '1.875rem', fontWeight: '600', lineHeight: '2.25rem', letterSpacing: '-0.025em', cssVariable: '--heading-h2' },
  { name: 'h3', fontSize: '1.5rem', fontWeight: '600', lineHeight: '2rem', letterSpacing: '0', cssVariable: '--heading-h3' },
  { name: 'h4', fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.75rem', letterSpacing: '0', cssVariable: '--heading-h4' },
  { name: 'h5', fontSize: '1.125rem', fontWeight: '600', lineHeight: '1.5rem', letterSpacing: '0', cssVariable: '--heading-h5' },
  { name: 'h6', fontSize: '1rem', fontWeight: '600', lineHeight: '1.5rem', letterSpacing: '0', cssVariable: '--heading-h6' },
]

// ============================================
// FONT FAMILY EDITOR
// ============================================

interface FontFamilyEditorProps {
  tokens: FontFamilyToken[]
  onSave: (tokens: FontFamilyToken[]) => Promise<void>
  onReset: () => void
}

const FONT_OPTIONS = [
  'Inter, system-ui, sans-serif',
  'Roboto, system-ui, sans-serif',
  'Open Sans, system-ui, sans-serif',
  'Lato, system-ui, sans-serif',
  'Poppins, system-ui, sans-serif',
  'Montserrat, system-ui, sans-serif',
  'Nunito, system-ui, sans-serif',
  'Source Sans Pro, system-ui, sans-serif',
  'Georgia, Cambria, serif',
  'Playfair Display, Georgia, serif',
  'Merriweather, Georgia, serif',
  'JetBrains Mono, monospace',
  'Fira Code, monospace',
  'Source Code Pro, monospace',
]

export function FontFamilyEditor({ tokens, onSave, onReset }: FontFamilyEditorProps) {
  const [editedTokens, setEditedTokens] = useState<FontFamilyToken[]>(tokens)
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
      toast.success('Fonts guardades correctament')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Famílies Tipogràfiques</h3>
          <p className="text-sm text-slate-500">Defineix les fonts del sistema</p>
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
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Font List */}
      <div className="space-y-4">
        {editedTokens.map((token) => (
          <div
            key={token.name}
            className="p-4 bg-white border border-slate-200 rounded-xl"
          >
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div
                className="w-32 h-20 flex items-center justify-center bg-slate-50 rounded-lg text-2xl"
                style={{ fontFamily: token.value }}
              >
                Aa
              </div>

              {/* Editor */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{token.name}</span>
                  <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {token.cssVariable}
                  </code>
                </div>
                {token.description && (
                  <p className="text-sm text-slate-500">{token.description}</p>
                )}
                <select
                  value={token.value}
                  onChange={(e) => updateToken(token.name, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font.split(',')[0]}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={token.value}
                  onChange={(e) => updateToken(token.name, e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Font family stack..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Vista prèvia</h4>
        <div className="space-y-4">
          {editedTokens.map((token) => (
            <div key={token.name} className="flex items-center gap-4">
              <span className="text-sm text-slate-500 w-24">{token.name}:</span>
              <p
                className="text-lg text-slate-900"
                style={{ fontFamily: token.value }}
              >
                La Pública connecta professionals i empreses per crear valor públic.
              </p>
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
// HEADINGS EDITOR
// ============================================

interface HeadingsEditorProps {
  tokens: HeadingToken[]
  onSave: (tokens: HeadingToken[]) => Promise<void>
  onReset: () => void
}

export function HeadingsEditor({ tokens, onSave, onReset }: HeadingsEditorProps) {
  const [editedTokens, setEditedTokens] = useState<HeadingToken[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setEditedTokens(tokens)
    setHasChanges(false)
  }, [tokens])

  const updateToken = (name: string, field: keyof HeadingToken, value: string) => {
    setEditedTokens(prev => prev.map(t =>
      t.name === name ? { ...t, [field]: value } : t
    ))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedTokens)
      setHasChanges(false)
      toast.success('Títols guardats correctament')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Escala de Títols</h3>
          <p className="text-sm text-slate-500">Defineix els estils per a H1-H6</p>
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
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Headings List */}
      <div className="space-y-4">
        {editedTokens.map((token) => (
          <div
            key={token.name}
            className="p-4 bg-white border border-slate-200 rounded-xl"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Preview */}
              <div className="col-span-4">
                <p
                  className="text-slate-900 truncate"
                  style={{
                    fontSize: token.fontSize,
                    fontWeight: token.fontWeight,
                    lineHeight: token.lineHeight,
                    letterSpacing: token.letterSpacing || '0'
                  }}
                >
                  {token.name.toUpperCase()} - Títol
                </p>
              </div>

              {/* Controls */}
              <div className="col-span-8 grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Mida</label>
                  <input
                    type="text"
                    value={token.fontSize}
                    onChange={(e) => updateToken(token.name, 'fontSize', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Pes</label>
                  <select
                    value={token.fontWeight}
                    onChange={(e) => updateToken(token.name, 'fontWeight', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="400">400 (Normal)</option>
                    <option value="500">500 (Medium)</option>
                    <option value="600">600 (Semibold)</option>
                    <option value="700">700 (Bold)</option>
                    <option value="800">800 (Extrabold)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Line Height</label>
                  <input
                    type="text"
                    value={token.lineHeight}
                    onChange={(e) => updateToken(token.name, 'lineHeight', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Letter Spacing</label>
                  <input
                    type="text"
                    value={token.letterSpacing || '0'}
                    onChange={(e) => updateToken(token.name, 'letterSpacing', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Preview */}
      <div className="p-6 bg-white rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Vista prèvia completa</h4>
        <div className="space-y-4">
          {editedTokens.map((token) => (
            <div key={token.name}>
              <span
                className="text-slate-900"
                style={{
                  fontSize: token.fontSize,
                  fontWeight: token.fontWeight,
                  lineHeight: token.lineHeight,
                  letterSpacing: token.letterSpacing || '0'
                }}
              >
                {token.name.toUpperCase()}: La Pública - Plataforma de professionals públics
              </span>
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
// FONT SIZE EDITOR
// ============================================

interface FontSizeEditorProps {
  tokens: FontSizeToken[]
  onSave: (tokens: FontSizeToken[]) => Promise<void>
  onReset: () => void
}

export function FontSizeEditor({ tokens, onSave, onReset }: FontSizeEditorProps) {
  const [editedTokens, setEditedTokens] = useState<FontSizeToken[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setEditedTokens(tokens)
    setHasChanges(false)
  }, [tokens])

  const updateToken = (name: string, field: 'value' | 'lineHeight', value: string) => {
    setEditedTokens(prev => prev.map(t =>
      t.name === name ? { ...t, [field]: value } : t
    ))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedTokens)
      setHasChanges(false)
      toast.success('Mides guardades correctament')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Escala de Mides</h3>
          <p className="text-sm text-slate-500">Defineix les mides de font del cos de text</p>
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
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Size Scale */}
      <div className="space-y-3">
        {editedTokens.map((token) => (
          <div
            key={token.name}
            className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg"
          >
            {/* Preview */}
            <div className="w-20 flex items-center justify-center">
              <span
                className="text-slate-900"
                style={{ fontSize: token.value }}
              >
                Aa
              </span>
            </div>

            {/* Name */}
            <span className="w-24 text-sm font-medium text-slate-900">
              {token.name.replace('text-', '')}
            </span>

            {/* Size Input */}
            <div className="flex-1">
              <input
                type="text"
                value={token.value}
                onChange={(e) => updateToken(token.name, 'value', e.target.value)}
                className="w-full px-2 py-1 text-sm font-mono border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Line Height */}
            <div className="w-24">
              <input
                type="text"
                value={token.lineHeight || ''}
                onChange={(e) => updateToken(token.name, 'lineHeight', e.target.value)}
                placeholder="Line height"
                className="w-full px-2 py-1 text-sm font-mono border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Description */}
            <span className="text-sm text-slate-500 w-16">
              {token.description}
            </span>
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
// FONT WEIGHT EDITOR
// ============================================

interface FontWeightEditorProps {
  tokens: FontWeightToken[]
  onSave: (tokens: FontWeightToken[]) => Promise<void>
  onReset: () => void
}

export function FontWeightEditor({ tokens, onSave, onReset }: FontWeightEditorProps) {
  const [editedTokens, setEditedTokens] = useState<FontWeightToken[]>(tokens)
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
      toast.success('Pesos guardats correctament')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Pesos Tipogràfics</h3>
          <p className="text-sm text-slate-500">Defineix els pesos de font disponibles</p>
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
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* Weight Grid */}
      <div className="grid grid-cols-3 gap-4">
        {editedTokens.map((token) => (
          <div
            key={token.name}
            className="p-4 bg-white border border-slate-200 rounded-xl text-center"
          >
            {/* Preview */}
            <p
              className="text-2xl text-slate-900 mb-3"
              style={{ fontWeight: parseInt(token.value) }}
            >
              Aa
            </p>

            {/* Name */}
            <p className="text-sm font-medium text-slate-900 mb-1">
              {token.name.replace('font-', '')}
            </p>

            {/* Weight selector */}
            <select
              value={token.value}
              onChange={(e) => updateToken(token.name, e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
            >
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
              <option value="600">600</option>
              <option value="700">700</option>
              <option value="800">800</option>
              <option value="900">900</option>
            </select>
          </div>
        ))}
      </div>

      {/* Visual Scale */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Escala visual</h4>
        <div className="space-y-2">
          {editedTokens.map((token) => (
            <div key={token.name} className="flex items-center gap-4">
              <span className="w-24 text-sm text-slate-500">{token.description}:</span>
              <p
                className="text-slate-900"
                style={{ fontWeight: parseInt(token.value) }}
              >
                La Pública - {token.value}
              </p>
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
// UI TEXT EDITOR
// ============================================

interface UITextToken {
  name: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing?: string
  textTransform?: string
  cssVariable: string
  description?: string
}

export const defaultUITextTokens: UITextToken[] = [
  { name: 'label', fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.25rem', cssVariable: '--text-label', description: 'Labels de formularis' },
  { name: 'button', fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.25rem', cssVariable: '--text-button', description: 'Text de botons' },
  { name: 'caption', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1rem', cssVariable: '--text-caption', description: 'Textos petits i captions' },
  { name: 'overline', fontSize: '0.75rem', fontWeight: '600', lineHeight: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase', cssVariable: '--text-overline', description: 'Text sobre títols' },
  { name: 'input', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5rem', cssVariable: '--text-input', description: 'Text dins inputs' },
  { name: 'helper', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1rem', cssVariable: '--text-helper', description: 'Text d\'ajuda' },
]

interface UITextEditorProps {
  tokens: UITextToken[]
  onSave: (tokens: UITextToken[]) => Promise<void>
  onReset: () => void
}

export function UITextEditor({ tokens, onSave, onReset }: UITextEditorProps) {
  const [editedTokens, setEditedTokens] = useState<UITextToken[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setEditedTokens(tokens)
    setHasChanges(false)
  }, [tokens])

  const updateToken = (name: string, field: keyof UITextToken, value: string) => {
    setEditedTokens(prev => prev.map(t =>
      t.name === name ? { ...t, [field]: value } : t
    ))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedTokens)
      setHasChanges(false)
      toast.success('UI Text guardat correctament')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">UI Text</h3>
          <p className="text-sm text-slate-500">Estils per a elements d'interfície</p>
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
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
      </div>

      {/* UI Text List */}
      <div className="space-y-4">
        {editedTokens.map((token) => (
          <div
            key={token.name}
            className="p-4 bg-white border border-slate-200 rounded-xl"
          >
            <div className="grid grid-cols-12 gap-4 items-start">
              {/* Preview */}
              <div className="col-span-3 p-3 bg-slate-50 rounded-lg">
                <span
                  className="text-slate-900"
                  style={{
                    fontSize: token.fontSize,
                    fontWeight: token.fontWeight,
                    lineHeight: token.lineHeight,
                    letterSpacing: token.letterSpacing || 'normal',
                    textTransform: token.textTransform as any || 'none'
                  }}
                >
                  {token.name === 'overline' ? 'OVERLINE TEXT' : `${token.name} text`}
                </span>
              </div>

              {/* Controls */}
              <div className="col-span-9 grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nom</label>
                  <span className="text-sm font-medium text-slate-900">{token.name}</span>
                  <p className="text-xs text-slate-500 mt-1">{token.description}</p>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Mida</label>
                  <input
                    type="text"
                    value={token.fontSize}
                    onChange={(e) => updateToken(token.name, 'fontSize', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Pes</label>
                  <select
                    value={token.fontWeight}
                    onChange={(e) => updateToken(token.name, 'fontWeight', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="400">400</option>
                    <option value="500">500</option>
                    <option value="600">600</option>
                    <option value="700">700</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Letter Spacing</label>
                  <input
                    type="text"
                    value={token.letterSpacing || ''}
                    onChange={(e) => updateToken(token.name, 'letterSpacing', e.target.value)}
                    placeholder="normal"
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-amber-500"
                  />
                </div>
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
