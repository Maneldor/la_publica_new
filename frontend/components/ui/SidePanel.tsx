'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'half'
}

const widthClasses = {
  sm: 'w-96',        // 384px
  md: 'w-[480px]',   // 480px
  lg: 'w-[600px]',   // 600px
  xl: 'w-[800px]',   // 800px
  '2xl': 'w-[960px]', // 960px
  half: 'w-1/2'      // 50% pantalla
}

export function SidePanel({ isOpen, onClose, title, subtitle, children, footer, width = 'lg' }: SidePanelProps) {
  // Tancar amb Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed right-0 top-2 bottom-2 ${widthClasses[width]} bg-white shadow-2xl z-50 rounded-l-xl flex flex-col overflow-hidden`}>
        {/* Header - fix */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer - fix a baix */}
        {footer && (
          <div className="flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
