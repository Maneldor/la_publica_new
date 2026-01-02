'use client'

import { useState, useEffect } from 'react'
import {
  PanelTop,
  Save,
  RotateCcw,
  Loader2,
  Search,
  User,
  Bell,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface HeaderStyleToken {
  name: string
  value: string
  cssVariable: string
  description?: string
  variant: 'main' | 'admin' | 'empresa' | 'breadcrumb'
}

interface HeaderStyleEditorProps {
  tokens: HeaderStyleToken[]
  onSave: (tokens: HeaderStyleToken[]) => Promise<void>
  onReset: () => void
}

// Default header style tokens
export const defaultHeaderStyleTokens: HeaderStyleToken[] = [
  // Main Header (Public)
  { name: 'header-main-background', value: '#0F172A', cssVariable: '--header-main-background', description: 'Fons del header públic', variant: 'main' },
  { name: 'header-main-text', value: '#FFFFFF', cssVariable: '--header-main-text', description: 'Color del text', variant: 'main' },
  { name: 'header-main-link', value: '#94A3B8', cssVariable: '--header-main-link', description: 'Color dels enllaços', variant: 'main' },
  { name: 'header-main-link-hover', value: '#FFFFFF', cssVariable: '--header-main-link-hover', description: 'Color dels enllaços hover', variant: 'main' },
  { name: 'header-main-button-bg', value: '#3B82F6', cssVariable: '--header-main-button-bg', description: 'Fons del botó CTA', variant: 'main' },
  { name: 'header-main-button-text', value: '#FFFFFF', cssVariable: '--header-main-button-text', description: 'Text del botó CTA', variant: 'main' },

  // Admin Header
  { name: 'header-admin-background', value: '#FFFFFF', cssVariable: '--header-admin-background', description: 'Fons del header admin', variant: 'admin' },
  { name: 'header-admin-border', value: '#E2E8F0', cssVariable: '--header-admin-border', description: 'Color de la vora', variant: 'admin' },
  { name: 'header-admin-text', value: '#0F172A', cssVariable: '--header-admin-text', description: 'Color del text', variant: 'admin' },
  { name: 'header-admin-icon', value: '#64748B', cssVariable: '--header-admin-icon', description: 'Color de les icones', variant: 'admin' },

  // Empresa Header
  { name: 'header-empresa-background', value: '#FFFFFF', cssVariable: '--header-empresa-background', description: 'Fons del header empresa', variant: 'empresa' },
  { name: 'header-empresa-border', value: '#E2E8F0', cssVariable: '--header-empresa-border', description: 'Color de la vora', variant: 'empresa' },
  { name: 'header-empresa-text', value: '#0F172A', cssVariable: '--header-empresa-text', description: 'Color del text', variant: 'empresa' },
  { name: 'header-empresa-accent', value: '#1E3A5F', cssVariable: '--header-empresa-accent', description: 'Color d\'accent', variant: 'empresa' },

  // Breadcrumb
  { name: 'breadcrumb-text', value: '#64748B', cssVariable: '--breadcrumb-text', description: 'Color del text', variant: 'breadcrumb' },
  { name: 'breadcrumb-active', value: '#0F172A', cssVariable: '--breadcrumb-active', description: 'Color de l\'element actiu', variant: 'breadcrumb' },
  { name: 'breadcrumb-separator', value: '#CBD5E1', cssVariable: '--breadcrumb-separator', description: 'Color del separador', variant: 'breadcrumb' },
]

export function HeaderStyleEditor({ tokens, onSave, onReset }: HeaderStyleEditorProps) {
  const [editedTokens, setEditedTokens] = useState<HeaderStyleToken[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeVariant, setActiveVariant] = useState<HeaderStyleToken['variant']>('main')

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

  const variants: { id: HeaderStyleToken['variant']; label: string }[] = [
    { id: 'main', label: 'Header Principal' },
    { id: 'admin', label: 'Header Admin' },
    { id: 'empresa', label: 'Header Empresa' },
    { id: 'breadcrumb', label: 'Breadcrumbs' },
  ]

  const filteredTokens = editedTokens.filter(t => t.variant === activeVariant)

  return (
    <div className="space-y-6">
      {/* Variant Tabs */}
      <div className="flex gap-2 flex-wrap">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveVariant(v.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeVariant === v.id
                ? 'bg-pink-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Token List */}
        <div className="space-y-4">
          {filteredTokens.map((token) => (
            <div key={token.name} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-900 capitalize">
                  {token.name.replace(/header-(main|admin|empresa)-|breadcrumb-/g, '').replace(/-/g, ' ')}
                </label>
                <code className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                  {token.cssVariable}
                </code>
              </div>
              {token.description && (
                <p className="text-xs text-slate-500 mb-2">{token.description}</p>
              )}
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
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live Preview */}
        <div className="sticky top-4">
          <div className="bg-slate-200 p-4 rounded-xl">
            <p className="text-xs text-slate-500 mb-3 text-center">Vista prèvia</p>

            {activeVariant === 'main' && (
              <div
                className="rounded-lg overflow-hidden"
                style={{ backgroundColor: getTokenValue('header-main-background') }}
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">LP</span>
                    </div>
                    <nav className="flex items-center gap-6">
                      <a style={{ color: getTokenValue('header-main-text') }} className="text-sm font-medium">Inici</a>
                      <a style={{ color: getTokenValue('header-main-link') }} className="text-sm hover:opacity-80">Empreses</a>
                      <a style={{ color: getTokenValue('header-main-link') }} className="text-sm hover:opacity-80">Ofertes</a>
                    </nav>
                  </div>
                  <div className="flex items-center gap-3">
                    <button style={{ color: getTokenValue('header-main-link') }} className="text-sm">
                      Iniciar sessió
                    </button>
                    <button
                      className="px-4 py-2 text-sm rounded-lg font-medium"
                      style={{
                        backgroundColor: getTokenValue('header-main-button-bg'),
                        color: getTokenValue('header-main-button-text')
                      }}
                    >
                      Registrar-se
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeVariant === 'admin' && (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  backgroundColor: getTokenValue('header-admin-background'),
                  borderBottom: `1px solid ${getTokenValue('header-admin-border')}`
                }}
              >
                <div className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Menu className="h-5 w-5" style={{ color: getTokenValue('header-admin-icon') }} />
                    <span className="font-medium" style={{ color: getTokenValue('header-admin-text') }}>
                      Panel d'Administració
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Search className="h-5 w-5" style={{ color: getTokenValue('header-admin-icon') }} />
                    <Bell className="h-5 w-5" style={{ color: getTokenValue('header-admin-icon') }} />
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" style={{ color: getTokenValue('header-admin-icon') }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeVariant === 'empresa' && (
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  backgroundColor: getTokenValue('header-empresa-background'),
                  borderBottom: `1px solid ${getTokenValue('header-empresa-border')}`
                }}
              >
                <div className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: getTokenValue('header-empresa-accent') + '20' }}
                    >
                      <span style={{ color: getTokenValue('header-empresa-accent') }} className="font-bold">E</span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: getTokenValue('header-empresa-text') }}>
                        Empresa Demo
                      </p>
                      <p className="text-xs" style={{ color: getTokenValue('header-empresa-accent') }}>
                        Dashboard
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" style={{ color: getTokenValue('header-empresa-text') + '80' }} />
                    <div className="w-8 h-8 bg-slate-200 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {activeVariant === 'breadcrumb' && (
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span style={{ color: getTokenValue('breadcrumb-text') }}>Inici</span>
                  <span style={{ color: getTokenValue('breadcrumb-separator') }}>/</span>
                  <span style={{ color: getTokenValue('breadcrumb-text') }}>Empreses</span>
                  <span style={{ color: getTokenValue('breadcrumb-separator') }}>/</span>
                  <span style={{ color: getTokenValue('breadcrumb-active') }} className="font-medium">Detall</span>
                </div>
              </div>
            )}
          </div>
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
                ? 'bg-pink-600 text-white hover:bg-pink-700'
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
