'use client'

import { useState, useEffect } from 'react'
import { MousePointer, RotateCcw, Save, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonStyle {
  name: string
  background: string
  color: string
  border: string
  hoverBackground: string
  activeBackground: string
  borderRadius?: string
  padding?: string
  fontSize?: string
  fontWeight?: string
}

interface ButtonEditorProps {
  style: ButtonStyle
  onChange: (style: ButtonStyle) => void
  onSave?: () => void
  onReset?: () => void
}

export function ButtonEditor({ style, onChange, onSave, onReset }: ButtonEditorProps) {
  const [localStyle, setLocalStyle] = useState(style)
  const [previewState, setPreviewState] = useState<'default' | 'hover' | 'active'>('default')

  useEffect(() => {
    setLocalStyle(style)
  }, [style])

  const handleChange = (field: keyof ButtonStyle, value: string) => {
    const updated = { ...localStyle, [field]: value }
    setLocalStyle(updated)
    onChange(updated)
  }

  const getPreviewStyle = () => {
    const base = {
      backgroundColor: localStyle.background,
      color: localStyle.color,
      border: localStyle.border || 'none',
      borderRadius: localStyle.borderRadius || '0.5rem',
      padding: localStyle.padding || '0.625rem 1.25rem',
      fontSize: localStyle.fontSize || '0.875rem',
      fontWeight: localStyle.fontWeight || '500',
    }

    if (previewState === 'hover') {
      return { ...base, backgroundColor: localStyle.hoverBackground }
    }
    if (previewState === 'active') {
      return { ...base, backgroundColor: localStyle.activeBackground }
    }
    return base
  }

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">Preview</p>
        <div className="flex flex-wrap gap-4">
          <button
            style={getPreviewStyle()}
            onMouseEnter={() => setPreviewState('hover')}
            onMouseLeave={() => setPreviewState('default')}
            onMouseDown={() => setPreviewState('active')}
            onMouseUp={() => setPreviewState('hover')}
            className="transition-all"
          >
            Botó {localStyle.name}
          </button>
          <button
            style={{ ...getPreviewStyle(), opacity: 0.5, cursor: 'not-allowed' }}
            disabled
          >
            Disabled
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          {(['default', 'hover', 'active'] as const).map((state) => (
            <button
              key={state}
              onClick={() => setPreviewState(state)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded transition-colors',
                previewState === state
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              )}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Button Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Variant</label>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
          <MousePointer className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-900">{localStyle.name}</span>
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Background</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localStyle.background}
              onChange={(e) => handleChange('background', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-slate-300"
            />
            <input
              type="text"
              value={localStyle.background}
              onChange={(e) => handleChange('background', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Color text</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localStyle.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-slate-300"
            />
            <input
              type="text"
              value={localStyle.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Hover & Active */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hover Background</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localStyle.hoverBackground}
              onChange={(e) => handleChange('hoverBackground', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-slate-300"
            />
            <input
              type="text"
              value={localStyle.hoverBackground}
              onChange={(e) => handleChange('hoverBackground', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Active Background</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={localStyle.activeBackground}
              onChange={(e) => handleChange('activeBackground', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-slate-300"
            />
            <input
              type="text"
              value={localStyle.activeBackground}
              onChange={(e) => handleChange('activeBackground', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Border */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Border</label>
        <input
          type="text"
          value={localStyle.border}
          onChange={(e) => handleChange('border', e.target.value)}
          placeholder="1px solid #E2E8F0"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
        />
      </div>

      {/* Border Radius & Padding */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Border Radius</label>
          <input
            type="text"
            value={localStyle.borderRadius || '0.5rem'}
            onChange={(e) => handleChange('borderRadius', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Padding</label>
          <input
            type="text"
            value={localStyle.padding || '0.625rem 1.25rem'}
            onChange={(e) => handleChange('padding', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Font Size</label>
          <input
            type="text"
            value={localStyle.fontSize || '0.875rem'}
            onChange={(e) => handleChange('fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Font Weight</label>
          <div className="relative">
            <select
              value={localStyle.fontWeight || '500'}
              onChange={(e) => handleChange('fontWeight', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm appearance-none pr-10"
            >
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="700">Bold (700)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar
          </button>
        )}
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ml-auto"
          >
            <Save className="h-4 w-4" />
            Guardar
          </button>
        )}
      </div>
    </div>
  )
}

// Button variants grid
interface ButtonVariantsProps {
  variants: ButtonStyle[]
  selectedVariant?: string
  onSelect: (variant: ButtonStyle) => void
}

export function ButtonVariants({ variants, selectedVariant, onSelect }: ButtonVariantsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {variants.map((variant) => (
        <button
          key={variant.name}
          onClick={() => onSelect(variant)}
          className={cn(
            'p-4 rounded-xl border-2 text-left transition-all',
            selectedVariant === variant.name
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          )}
        >
          <div className="mb-3">
            <span
              style={{
                backgroundColor: variant.background,
                color: variant.color,
                border: variant.border || 'none',
                borderRadius: variant.borderRadius || '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: variant.fontWeight || '500',
              }}
              className="inline-block"
            >
              {variant.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">{variant.background}</p>
        </button>
      ))}
    </div>
  )
}
