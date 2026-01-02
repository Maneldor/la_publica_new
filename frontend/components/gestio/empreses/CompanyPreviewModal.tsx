'use client'

import { useState } from 'react'
import { X, CreditCard, FileText, Check, Loader2 } from 'lucide-react'
import { CompanyCardPreview } from './preview/CompanyCardPreview'
import { CompanySinglePreview } from './preview/CompanySinglePreview'

interface CompanyPreviewData {
  id?: string
  name: string
  logo?: string | null
  coverImage?: string | null
  sector?: string | null
  slogan?: string | null
  description?: string | null
  address?: string | null
  email?: string
  phone?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
  website?: string | null
  whatsappNumber?: string | null
  workingHours?: string | null
  services?: string[]
  specializations?: string[]
  certifications?: any
  gallery?: string[]
  socialMedia?: { linkedin?: string; twitter?: string; facebook?: string; instagram?: string } | null
  foundingYear?: number | null
  employeeCount?: number | null
  size?: string | null
  isVerified?: boolean
  currentPlan?: { nombre?: string; nombreCorto?: string } | null
}

interface CompanyPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  company: CompanyPreviewData
  onPublish: () => Promise<void>
  isPublishing?: boolean
}

export function CompanyPreviewModal({
  isOpen,
  onClose,
  company,
  onPublish,
  isPublishing = false
}: CompanyPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'card' | 'full'>('card')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] mx-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Vista Prèvia - {company.name}
            </h2>
            <p className="text-sm text-slate-500">
              Previsualitza com es veurà l'empresa un cop publicada
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'card'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Tarjeta
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'full'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-4 w-4" />
            Pàgina completa
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'card' ? (
            <CompanyCardPreview company={company} />
          ) : (
            <CompanySinglePreview company={company} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Tancar
          </button>
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publicant...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Publicar Empresa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
