'use client'

import { useState, useEffect } from 'react'
import {
  Layout,
  Monitor,
  Smartphone,
  Tablet,
  PanelLeft,
  ArrowUpFromLine,
  Maximize2,
  Save,
  RotateCcw,
  Check,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
export interface LayoutToken {
  name: string
  value: string
  cssVariable: string
  description?: string
  category: 'sidebar' | 'header' | 'container' | 'breakpoint' | 'grid'
}

interface LayoutEditorProps {
  tokens: LayoutToken[]
  onSave: (tokens: LayoutToken[]) => Promise<void>
  onReset: () => void
}

// Default layout tokens
export const defaultLayoutTokens: LayoutToken[] = [
  // Sidebar
  { name: 'sidebar-width', value: '280px', cssVariable: '--sidebar-width', description: 'Amplada del sidebar expandit', category: 'sidebar' },
  { name: 'sidebar-collapsed-width', value: '64px', cssVariable: '--sidebar-collapsed-width', description: 'Amplada del sidebar col·lapsat', category: 'sidebar' },
  { name: 'sidebar-background', value: '#1E293B', cssVariable: '--sidebar-background', description: 'Color de fons del sidebar', category: 'sidebar' },
  { name: 'sidebar-text', value: '#E2E8F0', cssVariable: '--sidebar-text', description: 'Color del text del sidebar', category: 'sidebar' },
  { name: 'sidebar-active-background', value: '#334155', cssVariable: '--sidebar-active-background', description: 'Fons de l\'element actiu', category: 'sidebar' },

  // Header
  { name: 'header-height', value: '64px', cssVariable: '--header-height', description: 'Alçada de la capçalera', category: 'header' },
  { name: 'header-background', value: '#FFFFFF', cssVariable: '--header-background', description: 'Color de fons de la capçalera', category: 'header' },
  { name: 'header-border', value: '#E2E8F0', cssVariable: '--header-border', description: 'Color de la vora inferior', category: 'header' },
  { name: 'header-shadow', value: '0 1px 3px 0 rgb(0 0 0 / 0.1)', cssVariable: '--header-shadow', description: 'Ombra de la capçalera', category: 'header' },

  // Container
  { name: 'container-max-width', value: '1280px', cssVariable: '--container-max-width', description: 'Amplada màxima del contenidor', category: 'container' },
  { name: 'container-padding', value: '1.5rem', cssVariable: '--container-padding', description: 'Padding horitzontal del contenidor', category: 'container' },
  { name: 'container-padding-mobile', value: '1rem', cssVariable: '--container-padding-mobile', description: 'Padding en mòbil', category: 'container' },

  // Breakpoints
  { name: 'breakpoint-sm', value: '640px', cssVariable: '--breakpoint-sm', description: 'Breakpoint petit (mòbil)', category: 'breakpoint' },
  { name: 'breakpoint-md', value: '768px', cssVariable: '--breakpoint-md', description: 'Breakpoint mitjà (tablet)', category: 'breakpoint' },
  { name: 'breakpoint-lg', value: '1024px', cssVariable: '--breakpoint-lg', description: 'Breakpoint gran (desktop)', category: 'breakpoint' },
  { name: 'breakpoint-xl', value: '1280px', cssVariable: '--breakpoint-xl', description: 'Breakpoint extra gran', category: 'breakpoint' },
  { name: 'breakpoint-2xl', value: '1536px', cssVariable: '--breakpoint-2xl', description: 'Breakpoint 2XL', category: 'breakpoint' },

  // Grid
  { name: 'grid-columns', value: '12', cssVariable: '--grid-columns', description: 'Nombre de columnes del grid', category: 'grid' },
  { name: 'grid-gap', value: '1.5rem', cssVariable: '--grid-gap', description: 'Espai entre columnes', category: 'grid' },
  { name: 'grid-gap-mobile', value: '1rem', cssVariable: '--grid-gap-mobile', description: 'Espai entre columnes en mòbil', category: 'grid' },
]

export function LayoutEditor({ tokens, onSave, onReset }: LayoutEditorProps) {
  const [editedTokens, setEditedTokens] = useState<LayoutToken[]>(tokens)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<LayoutToken['category']>('sidebar')

  useEffect(() => {
    setEditedTokens(tokens)
    setHasChanges(false)
  }, [tokens])

  const updateToken = (name: string, value: string) => {
    setEditedTokens(prev => prev.map(t =>
      t.name === name ? { ...t, value } : t
    ))
    setHasChanges(true)
    // Apply live preview
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
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setEditedTokens(tokens)
    setHasChanges(false)
    // Reset live preview
    tokens.forEach(t => {
      document.documentElement.style.setProperty(t.cssVariable, t.value)
    })
    onReset()
  }

  const categories: { id: LayoutToken['category']; label: string; icon: typeof Layout }[] = [
    { id: 'sidebar', label: 'Sidebar', icon: PanelLeft },
    { id: 'header', label: 'Header', icon: ArrowUpFromLine },
    { id: 'container', label: 'Container', icon: Maximize2 },
    { id: 'breakpoint', label: 'Breakpoints', icon: Monitor },
    { id: 'grid', label: 'Grid', icon: Layout },
  ]

  const filteredTokens = editedTokens.filter(t => t.category === activeCategory)

  const renderTokenInput = (token: LayoutToken) => {
    const isColor = token.name.includes('background') || token.name.includes('text') || token.name.includes('border')
    const isNumber = token.name.includes('columns')

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

    if (isNumber) {
      return (
        <input
          type="number"
          value={parseInt(token.value) || 12}
          onChange={(e) => updateToken(token.name, e.target.value)}
          min={1}
          max={24}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      )
    }

    // Size value (px, rem, etc.)
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={token.value}
          onChange={(e) => updateToken(token.name, e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: 280px, 1.5rem"
        />
        <select
          value={token.value.includes('px') ? 'px' : token.value.includes('rem') ? 'rem' : 'custom'}
          onChange={(e) => {
            const numValue = parseFloat(token.value) || 0
            if (e.target.value === 'px') {
              updateToken(token.name, `${numValue}px`)
            } else if (e.target.value === 'rem') {
              updateToken(token.name, `${numValue}rem`)
            }
          }}
          className="px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="px">px</option>
          <option value="rem">rem</option>
          <option value="custom">custom</option>
        </select>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              )}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Token List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTokens.map((token) => (
          <div key={token.name} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-900 capitalize">
                {token.name.replace(/-/g, ' ')}
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
      <div className="p-4 bg-white rounded-xl border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Vista Prèvia</h4>
        <LayoutPreview tokens={editedTokens} activeCategory={activeCategory} />
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
                ? 'bg-blue-600 text-white hover:bg-blue-700'
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

// Layout Preview Component
function LayoutPreview({ tokens, activeCategory }: { tokens: LayoutToken[]; activeCategory: LayoutToken['category'] }) {
  const getTokenValue = (name: string) => tokens.find(t => t.name === name)?.value || ''

  if (activeCategory === 'sidebar') {
    return (
      <div className="flex h-48 rounded-lg overflow-hidden border border-slate-200">
        <div
          className="flex flex-col items-center py-4"
          style={{
            width: getTokenValue('sidebar-width'),
            backgroundColor: getTokenValue('sidebar-background'),
            color: getTokenValue('sidebar-text'),
            minWidth: '60px',
            maxWidth: '300px'
          }}
        >
          <div className="w-8 h-8 bg-blue-500 rounded-lg mb-4" />
          <div className="space-y-2 px-2 w-full">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-8 rounded px-2 flex items-center text-xs"
                style={{
                  backgroundColor: i === 1 ? getTokenValue('sidebar-active-background') : 'transparent'
                }}
              >
                Menu {i}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 bg-slate-100 p-4">
          <div className="h-full bg-white rounded-lg border border-slate-200 p-3">
            <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-48 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (activeCategory === 'header') {
    return (
      <div className="rounded-lg overflow-hidden border border-slate-200">
        <div
          className="flex items-center justify-between px-6"
          style={{
            height: getTokenValue('header-height'),
            backgroundColor: getTokenValue('header-background'),
            borderBottom: `1px solid ${getTokenValue('header-border')}`,
            boxShadow: getTokenValue('header-shadow'),
            minHeight: '40px',
            maxHeight: '100px'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-slate-200 rounded" />
            <div className="w-8 h-8 bg-slate-200 rounded-full" />
          </div>
        </div>
        <div className="h-32 bg-slate-100 p-4">
          <div className="h-full bg-white rounded-lg border border-slate-200" />
        </div>
      </div>
    )
  }

  if (activeCategory === 'container') {
    return (
      <div className="bg-slate-200 p-4 rounded-lg">
        <div
          className="mx-auto bg-white rounded-lg border border-slate-300 h-32"
          style={{
            maxWidth: getTokenValue('container-max-width'),
            padding: getTokenValue('container-padding')
          }}
        >
          <div className="h-full bg-slate-50 rounded border border-dashed border-slate-300 flex items-center justify-center text-sm text-slate-500">
            max-width: {getTokenValue('container-max-width')}
          </div>
        </div>
      </div>
    )
  }

  if (activeCategory === 'breakpoint') {
    const breakpoints = [
      { name: 'sm', icon: Smartphone },
      { name: 'md', icon: Tablet },
      { name: 'lg', icon: Monitor },
      { name: 'xl', icon: Monitor },
      { name: '2xl', icon: Monitor },
    ]
    return (
      <div className="space-y-3">
        {breakpoints.map(bp => {
          const value = getTokenValue(`breakpoint-${bp.name}`)
          const Icon = bp.icon
          return (
            <div key={bp.name} className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700 w-12">{bp.name}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(parseInt(value) / 1536) * 100}%` }}
                />
              </div>
              <span className="text-sm text-slate-500 w-16">{value}</span>
            </div>
          )
        })}
      </div>
    )
  }

  if (activeCategory === 'grid') {
    const columns = parseInt(getTokenValue('grid-columns')) || 12
    const gap = getTokenValue('grid-gap')
    return (
      <div className="p-4 bg-slate-100 rounded-lg">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gap
          }}
        >
          {Array.from({ length: columns }, (_, i) => (
            <div
              key={i}
              className="h-16 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-xs text-blue-600 font-medium"
            >
              {i + 1}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500 mt-3">
          {columns} columnes amb gap de {gap}
        </p>
      </div>
    )
  }

  return null
}

// Selector de Layout Elements
export function LayoutElementSelector({
  elements,
  selectedElement,
  onSelect
}: {
  elements: { id: string; name: string; description: string }[]
  selectedElement?: string
  onSelect: (element: { id: string; name: string }) => void
}) {
  return (
    <div className="space-y-2">
      {elements.map((el) => (
        <button
          key={el.id}
          onClick={() => onSelect(el)}
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
            selectedElement === el.id
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-white border border-slate-200 hover:bg-slate-50'
          )}
        >
          <div>
            <p className="font-medium text-slate-900 text-sm">{el.name}</p>
            <p className="text-xs text-slate-500">{el.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
