'use client'

import { useState, useEffect } from 'react'
import { Pipette, Copy, Check, RotateCcw, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ColorToken } from '@/lib/design-system/defaults'
import toast from 'react-hot-toast'

interface ColorEditorProps {
  color: ColorToken
  onChange: (color: ColorToken) => void
  onSave?: () => void
  onReset?: () => void
}

export function ColorEditor({ color, onChange, onSave, onReset }: ColorEditorProps) {
  const [copied, setCopied] = useState(false)
  const [localColor, setLocalColor] = useState(color)

  useEffect(() => {
    setLocalColor(color)
  }, [color])

  const handleColorChange = (value: string) => {
    const updated = { ...localColor, value }
    setLocalColor(updated)
    onChange(updated)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copiat al clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate contrast color for text
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  return (
    <div className="space-y-6">
      {/* Color Preview */}
      <div className="flex items-start gap-6">
        <div className="relative group">
          <div
            className="w-32 h-32 rounded-xl shadow-lg border border-slate-200 cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: localColor.value }}
          >
            <span
              className="absolute bottom-2 left-2 text-xs font-mono font-medium"
              style={{ color: getContrastColor(localColor.value) }}
            >
              {localColor.value}
            </span>
          </div>
          <input
            type="color"
            value={localColor.value}
            onChange={(e) => handleColorChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Selecciona color"
          />
          <div className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-full shadow-md border border-slate-200">
            <Pipette className="h-4 w-4 text-slate-600" />
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
            <input
              type="text"
              value={localColor.name}
              readOnly
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
            />
          </div>

          {/* Hex Value */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor HEX</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localColor.value}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => copyToClipboard(localColor.value)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Copiar"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* CSS Variable */}
          {localColor.cssVariable && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Variable CSS</label>
              <div className="flex gap-2">
                <code className="flex-1 px-3 py-2 bg-slate-900 text-green-400 rounded-lg text-sm font-mono">
                  var({localColor.cssVariable})
                </code>
                <button
                  onClick={() => copyToClipboard(`var(${localColor.cssVariable})`)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Copiar"
                >
                  <Copy className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {localColor.description && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripció</label>
          <p className="text-sm text-slate-600">{localColor.description}</p>
        </div>
      )}

      {/* Color Variants Preview */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Variants automàtiques</label>
        <div className="flex gap-2">
          {[10, 20, 30, 40, 50].map((opacity) => (
            <div
              key={opacity}
              className="flex-1 h-10 rounded-lg border border-slate-200 flex items-center justify-center"
              style={{ backgroundColor: `${localColor.value}${Math.round(opacity * 2.55).toString(16).padStart(2, '0')}` }}
            >
              <span className="text-xs font-medium text-slate-700">{opacity}%</span>
            </div>
          ))}
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

// Color palette grid component
interface ColorPaletteProps {
  colors: ColorToken[]
  selectedColor?: string
  onSelect: (color: ColorToken) => void
}

export function ColorPalette({ colors, selectedColor, onSelect }: ColorPaletteProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {colors.map((color) => (
        <button
          key={color.name}
          onClick={() => onSelect(color)}
          className={cn(
            'group relative p-3 rounded-xl border-2 transition-all hover:scale-105',
            selectedColor === color.name
              ? 'border-blue-500 ring-2 ring-blue-200'
              : 'border-slate-200 hover:border-slate-300'
          )}
        >
          <div
            className="h-16 rounded-lg mb-2 shadow-sm"
            style={{ backgroundColor: color.value }}
          />
          <p className="text-sm font-medium text-slate-900 truncate">{color.name}</p>
          <p className="text-xs text-slate-500 font-mono">{color.value}</p>
          {selectedColor === color.name && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
