'use client'

import { useState, useEffect } from 'react'
import { Type, RotateCcw, Save, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TypographyToken } from '@/lib/design-system/defaults'

interface TypographyEditorProps {
  token: TypographyToken
  onChange: (token: TypographyToken) => void
  onSave?: () => void
  onReset?: () => void
}

const fontFamilies = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
]

const fontWeights = [
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' },
]

export function TypographyEditor({ token, onChange, onSave, onReset }: TypographyEditorProps) {
  const [localToken, setLocalToken] = useState(token)

  useEffect(() => {
    setLocalToken(token)
  }, [token])

  const handleChange = (field: keyof TypographyToken, value: string) => {
    const updated = { ...localToken, [field]: value }
    setLocalToken(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">Preview</p>
        <p
          style={{
            fontFamily: localToken.fontFamily,
            fontSize: localToken.fontSize,
            fontWeight: localToken.fontWeight,
            lineHeight: localToken.lineHeight,
            letterSpacing: localToken.letterSpacing || 'normal',
          }}
          className="text-slate-900"
        >
          La Pública - El teu espai per connectar
        </p>
      </div>

      {/* Token Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Token</label>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
          <Type className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-900">{localToken.name}</span>
          {localToken.cssVariable && (
            <code className="ml-auto text-xs text-slate-500 font-mono">
              {localToken.cssVariable}
            </code>
          )}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Font Family</label>
        <div className="relative">
          <select
            value={localToken.fontFamily}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
          >
            {fontFamilies.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mida</label>
          <input
            type="text"
            value={localToken.fontSize}
            onChange={(e) => handleChange('fontSize', e.target.value)}
            placeholder="1rem"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pes</label>
          <div className="relative">
            <select
              value={localToken.fontWeight}
              onChange={(e) => handleChange('fontWeight', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
            >
              {fontWeights.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Line Height & Letter Spacing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Line Height</label>
          <input
            type="text"
            value={localToken.lineHeight}
            onChange={(e) => handleChange('lineHeight', e.target.value)}
            placeholder="1.5"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Letter Spacing</label>
          <input
            type="text"
            value={localToken.letterSpacing || ''}
            onChange={(e) => handleChange('letterSpacing', e.target.value)}
            placeholder="normal"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Generated CSS */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">CSS generat</label>
        <pre className="p-3 bg-slate-900 text-green-400 rounded-lg text-xs font-mono overflow-x-auto">
{`font-family: ${localToken.fontFamily};
font-size: ${localToken.fontSize};
font-weight: ${localToken.fontWeight};
line-height: ${localToken.lineHeight};${localToken.letterSpacing ? `\nletter-spacing: ${localToken.letterSpacing};` : ''}`}
        </pre>
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

// Typography scale preview
interface TypographyScaleProps {
  tokens: TypographyToken[]
  selectedToken?: string
  onSelect: (token: TypographyToken) => void
}

export function TypographyScale({ tokens, selectedToken, onSelect }: TypographyScaleProps) {
  return (
    <div className="space-y-3">
      {tokens.map((token) => (
        <button
          key={token.name}
          onClick={() => onSelect(token)}
          className={cn(
            'w-full p-4 rounded-xl border-2 text-left transition-all',
            selectedToken === token.name
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase">{token.name}</span>
            <span className="text-xs text-slate-400 font-mono">
              {token.fontSize} / {token.fontWeight}
            </span>
          </div>
          <p
            style={{
              fontFamily: token.fontFamily,
              fontSize: token.fontSize,
              fontWeight: token.fontWeight,
              lineHeight: token.lineHeight,
            }}
            className="text-slate-900 truncate"
          >
            La Pública connecta empreses i empleats públics
          </p>
        </button>
      ))}
    </div>
  )
}
