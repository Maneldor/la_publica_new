'use client'

import { useState } from 'react'
import { Copy, Check, Plus, Minus, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ColorToken {
  name: string
  value: string
  description?: string
}

interface ColorPalettePreviewProps {
  colors: ColorToken[]
  onColorSelect?: (color: ColorToken) => void
  selectedColor?: string
  editable?: boolean
  onColorChange?: (name: string, value: string) => void
}

export function ColorPalettePreview({
  colors,
  onColorSelect,
  selectedColor,
  editable = false,
  onColorChange
}: ColorPalettePreviewProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = async (value: string, name: string) => {
    await navigator.clipboard.writeText(value)
    setCopiedColor(name)
    toast.success(`${name}: ${value} copiat`)
    setTimeout(() => setCopiedColor(null), 2000)
  }

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
      {/* Color Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {colors.map((color) => (
          <div
            key={color.name}
            onClick={() => onColorSelect?.(color)}
            className={cn(
              'group relative cursor-pointer transition-all',
              selectedColor === color.name && 'ring-2 ring-blue-500 ring-offset-2 rounded-xl'
            )}
          >
            <div
              className="aspect-square rounded-xl shadow-md transition-transform group-hover:scale-105 flex items-end justify-center p-2"
              style={{ backgroundColor: color.value }}
            >
              <span
                className="text-xs font-mono font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: getContrastColor(color.value) }}
              >
                {color.value}
              </span>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-slate-900">{color.name}</p>
              {color.description && (
                <p className="text-xs text-slate-500">{color.description}</p>
              )}
            </div>

            {/* Copy button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(color.value, color.name)
              }}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
            >
              {copiedColor === color.name ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-slate-600" />
              )}
            </button>

            {/* Edit input (if editable) */}
            {editable && selectedColor === color.name && (
              <input
                type="color"
                value={color.value}
                onChange={(e) => onColorChange?.(color.name, e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            )}
          </div>
        ))}
      </div>

      {/* Usage Examples */}
      <div className="bg-slate-50 rounded-xl p-6 space-y-4">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Exemples d'us
        </h4>

        <div className="space-y-4">
          {/* Buttons Example */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Botons</p>
            <div className="flex flex-wrap gap-2">
              {colors.slice(0, 3).map((color) => (
                <button
                  key={color.name}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: color.value,
                    color: getContrastColor(color.value),
                  }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Badges Example */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Badges</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <span
                  key={color.name}
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${color.value}20`,
                    color: color.value,
                  }}
                >
                  {color.name}
                </span>
              ))}
            </div>
          </div>

          {/* Borders Example */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Vores</p>
            <div className="flex flex-wrap gap-2">
              {colors.slice(0, 4).map((color) => (
                <div
                  key={color.name}
                  className="w-16 h-16 rounded-lg border-2 flex items-center justify-center text-xs"
                  style={{ borderColor: color.value }}
                >
                  <span className="text-slate-500">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Shades Generator */}
      {selectedColor && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h4 className="font-medium text-slate-900 mb-3">
            Escala de {selectedColor}
          </h4>
          <div className="flex gap-1">
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((opacity) => {
              const baseColor = colors.find(c => c.name === selectedColor)?.value || '#000000'
              return (
                <div
                  key={opacity}
                  className="flex-1 h-12 rounded flex items-center justify-center"
                  style={{
                    backgroundColor: baseColor,
                    opacity: opacity / 100,
                  }}
                >
                  <span className="text-[10px] font-mono text-white mix-blend-difference">
                    {opacity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
