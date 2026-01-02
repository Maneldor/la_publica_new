'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  CreditCard,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { CompanyCardPreview } from '@/components/gestio/empreses/preview/CompanyCardPreview'
import { CompanySinglePreview } from '@/components/gestio/empreses/preview/CompanySinglePreview'

interface CompanyProfile {
  id: string
  name: string
  logo: string | null
  coverImage: string | null
  sector: string | null
  slogan: string | null
  description: string | null
  address: string | null
  city: string | null
  email: string
  phone: string | null
  website: string | null
  tags: string[]
  socialLinks: {
    linkedin?: string
    twitter?: string
    instagram?: string
    facebook?: string
  }
  foundingYear: number | null
  size: string | null
  isVerified: boolean
  currentPlan: {
    id: string
    name: string
    planType: string
  } | null
}

export default function PreviewPerfilPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'card' | 'full'>('card')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/empresa/perfil')
        const data = await response.json()

        if (data.success) {
          setProfile(data.data)
        } else {
          setError(data.error || 'Error carregant el perfil')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Error de connexió')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-slate-500">Carregant previsualització...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-slate-900 font-medium">Error carregant el perfil</p>
          <p className="text-slate-500">{error}</p>
          <Link
            href="/empresa/perfil"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tornar al perfil
          </Link>
        </div>
      </div>
    )
  }

  // Adapt profile data to preview component format
  const previewData = {
    name: profile.name,
    logo: profile.logo,
    coverImage: profile.coverImage,
    sector: profile.sector,
    slogan: profile.slogan,
    description: profile.description,
    address: profile.address ? `${profile.address}${profile.city ? `, ${profile.city}` : ''}` : null,
    email: profile.email,
    phone: profile.phone,
    website: profile.website,
    services: profile.tags,
    socialMedia: profile.socialLinks,
    foundingYear: profile.foundingYear,
    size: profile.size,
    isVerified: profile.isVerified,
    currentPlan: profile.currentPlan ? {
      nombre: profile.currentPlan.name,
      nombreCorto: profile.currentPlan.name
    } : null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/empresa/perfil"
            className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Previsualització del perfil</h1>
            <p className="text-slate-500">Així és com els empleats públics veuen la teva empresa</p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Eye className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-blue-900">Mode de previsualització</p>
          <p className="text-sm text-blue-700 mt-1">
            Aquesta vista mostra com els empleats públics veuran el teu perfil d'empresa a la plataforma.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Tab buttons */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'card'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Vista Targeta
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'full'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-4 w-4" />
            Vista Completa
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'card' ? (
            <div>
              <p className="text-sm text-slate-500 text-center mb-6">
                Així es veu la teva empresa al llistat d'empreses del dashboard
              </p>
              <CompanyCardPreview company={previewData} />
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 text-center mb-6">
                Així es veu la pàgina completa de la teva empresa
              </p>
              <CompanySinglePreview company={previewData} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex justify-center gap-4">
        <Link
          href="/empresa/perfil"
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Tornar al perfil
        </Link>
        <Link
          href="/empresa/perfil/editar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Editar perfil
        </Link>
      </div>
    </div>
  )
}
