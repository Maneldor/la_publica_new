'use client'

import { useState } from 'react'
import {
  Monitor,
  Tablet,
  Smartphone,
  Code,
  Copy,
  Check,
  Maximize2,
  X,
  Sun,
  Moon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ComponentPreviewProps {
  children: React.ReactNode
  title?: string
  description?: string
  code?: string
  className?: string
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile'
type Theme = 'light' | 'dark'

const viewportSizes: Record<ViewportSize, { width: string; icon: typeof Monitor }> = {
  desktop: { width: '100%', icon: Monitor },
  tablet: { width: '768px', icon: Tablet },
  mobile: { width: '375px', icon: Smartphone },
}

export function ComponentPreview({
  children,
  title,
  description,
  code,
  className
}: ComponentPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [theme, setTheme] = useState<Theme>('light')
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const copyCode = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Codi copiat')
    setTimeout(() => setCopied(false), 2000)
  }

  const previewContent = (
    <div
      className={cn(
        'transition-all duration-300 mx-auto',
        theme === 'dark' ? 'bg-slate-900' : 'bg-white'
      )}
      style={{ maxWidth: viewportSizes[viewport].width }}
    >
      <div className="p-6">
        {children}
      </div>
    </div>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-100 overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
          <div>
            {title && <h2 className="font-semibold text-slate-900">{title}</h2>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {/* Viewport Controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => {
                const Icon = viewportSizes[size].icon
                return (
                  <button
                    key={size}
                    onClick={() => setViewport(size)}
                    className={cn(
                      'p-2 rounded-md transition-colors',
                      viewport === size
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                    title={size}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                theme === 'dark'
                  ? 'bg-slate-800 text-yellow-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Close Fullscreen */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {previewContent}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {title && <span className="font-medium text-slate-900">{title}</span>}
          {description && (
            <span className="text-sm text-slate-500">{description}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => {
              const Icon = viewportSizes[size].icon
              return (
                <button
                  key={size}
                  onClick={() => setViewport(size)}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    viewport === size
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                  title={size}
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              theme === 'dark'
                ? 'bg-slate-800 text-yellow-500'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Code Toggle */}
          {code && (
            <button
              onClick={() => setShowCode(!showCode)}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                showCode
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Code className="h-4 w-4" />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div
        className={cn(
          'border-b border-slate-100 overflow-auto',
          theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
        )}
        style={{ minHeight: '200px' }}
      >
        {previewContent}
      </div>

      {/* Code Panel */}
      {showCode && code && (
        <div className="bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
            <span className="text-xs text-slate-400 uppercase tracking-wide">Codi</span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copiat
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-sm text-green-400 overflow-auto max-h-64">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

// Card preview component
interface CardPreviewProps {
  style: {
    background: string
    border: string
    borderRadius: string
    padding: string
    shadow: string
  }
  title?: string
  content?: string
}

export function CardPreview({ style, title = 'Títol de la targeta', content = 'Contingut de mostra per a la targeta.' }: CardPreviewProps) {
  return (
    <div
      style={{
        backgroundColor: style.background,
        border: style.border,
        borderRadius: style.borderRadius,
        padding: style.padding,
        boxShadow: style.shadow,
      }}
    >
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{content}</p>
    </div>
  )
}

// Shadow preview component
export function ShadowPreview({ shadows }: { shadows: { name: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {shadows.map((shadow) => (
        <div key={shadow.name} className="text-center">
          <div
            className="h-24 bg-white rounded-lg mb-2"
            style={{ boxShadow: shadow.value }}
          />
          <p className="text-sm font-medium text-slate-900">{shadow.name}</p>
          <p className="text-xs text-slate-500 font-mono truncate">{shadow.value.slice(0, 20)}...</p>
        </div>
      ))}
    </div>
  )
}

// Border radius preview component
export function RadiusPreview({ radiuses }: { radiuses: { name: string; value: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {radiuses.map((radius) => (
        <div key={radius.name} className="text-center">
          <div
            className="w-20 h-20 bg-blue-500 mb-2"
            style={{ borderRadius: radius.value }}
          />
          <p className="text-sm font-medium text-slate-900">{radius.name}</p>
          <p className="text-xs text-slate-500 font-mono">{radius.value}</p>
        </div>
      ))}
    </div>
  )
}

// Spacing preview component
export function SpacingPreview({ spacings }: { spacings: { name: string; value: string }[] }) {
  return (
    <div className="space-y-2">
      {spacings.slice(0, 10).map((spacing) => (
        <div key={spacing.name} className="flex items-center gap-4">
          <div className="w-20 text-sm text-slate-600 font-mono">{spacing.name}</div>
          <div
            className="h-6 bg-blue-200 rounded"
            style={{ width: spacing.value }}
          />
          <div className="text-sm text-slate-500">{spacing.value}</div>
        </div>
      ))}
    </div>
  )
}
