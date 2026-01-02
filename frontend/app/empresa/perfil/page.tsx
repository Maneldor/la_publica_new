'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Edit,
  Star,
  CheckCircle,
  Camera,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Loader2,
  AlertCircle,
  Eye,
  LucideIcon
} from 'lucide-react'
import { getCategoryLabel } from '@/lib/constants/categories'

interface CompanyProfile {
  id: string
  name: string
  cif: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  description: string
  slogan: string
  sector: string
  size: string
  foundingYear: number | null
  logo: string | null
  coverImage: string | null
  socialLinks: {
    linkedin?: string
    twitter?: string
    instagram?: string
    facebook?: string
  }
  tags: string[]
  configuration: any
  status: string
  isActive: boolean
  isVerified: boolean
  currentPlan: {
    id: string
    name: string
    tier: string
  } | null
  hasPendingChanges: boolean
}

export default function PerfilEmpresaPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          <p className="text-slate-500">Carregant perfil...</p>
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
        </div>
      </div>
    )
  }

  const sectorLabel = getCategoryLabel(profile.sector) || profile.sector || 'No especificat'
  const planTier = profile.currentPlan?.tier || 'FREE'
  const isPremium = ['PREMIUM', 'ENTERPRISE'].includes(planTier)

  return (
    <div className="space-y-6">
      {/* Header de pàgina */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
          <Building2 className="h-6 w-6 text-slate-600" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Perfil d'Empresa</h1>
          <p className="text-slate-500">Gestiona la informació pública de la teva empresa</p>
        </div>
      </div>

      {/* Avís de canvis pendents */}
      {profile.hasPendingChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-900">Tens canvis pendents de revisió</p>
            <p className="text-sm text-amber-700 mt-1">
              Els canvis que has sol·licitat estan sent revisats pel nostre equip.
            </p>
          </div>
        </div>
      )}

      {/* Contingut principal - 2 columnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna esquerra (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card principal empresa */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* Banner */}
            <div className="h-32 relative">
              {profile.coverImage ? (
                <Image
                  src={profile.coverImage}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600" />
              )}
              <Link
                href="/empresa/perfil/editar"
                className="absolute bottom-2 right-2 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
              >
                <Camera className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>

            {/* Info empresa */}
            <div className="h-32 px-6 py-4 relative">
              {/* Logo a l'esquerra (posició absoluta) - 50% portada, 50% info */}
              <div className="absolute left-[30px] -top-[50px] w-[100px] h-[100px] bg-white border-4 border-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                {profile.logo ? (
                  <Image
                    src={profile.logo}
                    alt={profile.name}
                    width={100}
                    height={100}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-slate-400" strokeWidth={1.5} />
                )}
              </div>

              {/* Contingut centrat */}
              <div className="h-full flex flex-col items-center justify-center text-center">
                {/* Nom i badges */}
                <div className="flex items-center justify-center gap-3 mb-1 flex-wrap">
                  <h2 className="text-2xl font-semibold text-slate-900">{profile.name}</h2>
                  {isPremium && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      <Star className="h-3 w-3" fill="currentColor" />
                      {planTier}
                    </span>
                  )}
                  {profile.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      <CheckCircle className="h-3 w-3" />
                      Verificada
                    </span>
                  )}
                </div>

                {/* Eslògan */}
                {profile.slogan && (
                  <p className="text-slate-600 italic text-sm">"{profile.slogan}"</p>
                )}

                {/* Sector */}
                <p className="text-slate-500 text-sm">Sector: {sectorLabel}</p>

                {/* Any de fundació i mida */}
                {(profile.foundingYear || profile.size) && (
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                    {profile.foundingYear && (
                      <span>Fundada el {profile.foundingYear}</span>
                    )}
                    {profile.size && (
                      <span>• {profile.size}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sobre nosaltres */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Sobre nosaltres</h3>
            {profile.description ? (
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {profile.description}
              </p>
            ) : (
              <p className="text-slate-400 italic">No hi ha descripció disponible</p>
            )}
          </div>

          {/* Informació de contacte */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Informació de contacte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(profile.address || profile.city) && (
                <ContactItem
                  icon={MapPin}
                  label="Ubicació"
                  value={[profile.address, profile.city].filter(Boolean).join(', ') || 'No especificada'}
                />
              )}
              {profile.email && (
                <ContactItem icon={Mail} label="Email" value={profile.email} />
              )}
              {profile.phone && (
                <ContactItem icon={Phone} label="Telèfon" value={profile.phone} />
              )}
              {profile.website && (
                <ContactItem icon={Globe} label="Web" value={profile.website} isLink />
              )}
            </div>
            {!profile.email && !profile.phone && !profile.website && !profile.address && (
              <p className="text-slate-400 italic">No hi ha informació de contacte disponible</p>
            )}
          </div>

          {/* Xarxes socials */}
          {(profile.socialLinks?.linkedin || profile.socialLinks?.twitter ||
            profile.socialLinks?.instagram || profile.socialLinks?.facebook) && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Xarxes socials</h3>
              <div className="flex items-center gap-3">
                {profile.socialLinks?.facebook && (
                  <SocialButton icon={Facebook} href={profile.socialLinks.facebook} />
                )}
                {profile.socialLinks?.instagram && (
                  <SocialButton icon={Instagram} href={profile.socialLinks.instagram} />
                )}
                {profile.socialLinks?.linkedin && (
                  <SocialButton icon={Linkedin} href={profile.socialLinks.linkedin} />
                )}
                {profile.socialLinks?.twitter && (
                  <SocialButton icon={Twitter} href={profile.socialLinks.twitter} />
                )}
              </div>
            </div>
          )}

          {/* Tags/Serveis */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Serveis i especialitats</h3>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna dreta (1/3) */}
        <div className="space-y-6">

          {/* Accions - PRIMER per ser més visible */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Accions</h3>
            <div className="space-y-2">
              <Link
                href="/empresa/perfil/editar"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" strokeWidth={1.5} />
                Editar informació
              </Link>

              <Link
                href="/empresa/perfil/preview"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" strokeWidth={1.5} />
                Veure com empleat públic
              </Link>
            </div>
          </div>

          {/* Estadístiques del perfil */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Estadístiques del perfil</h3>
            <div className="space-y-4">
              <MiniStat label="Visualitzacions del perfil" value="--" />
              <MiniStat label="Ofertes publicades" value="--" />
              <MiniStat label="Clics a la web" value="--" />
              <MiniStat label="Contactes rebuts" value="--" />
            </div>
            <p className="text-xs text-slate-400 mt-4 italic">
              Estadístiques disponibles properament
            </p>
          </div>

          {/* Completitud del perfil */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Completitud del perfil</h3>
            <ProfileCompleteness profile={profile} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Components auxiliars

function ContactItem({
  icon: Icon,
  label,
  value,
  isLink = false
}: {
  icon: LucideIcon
  label: string
  value: string
  isLink?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 rounded-lg">
        <Icon className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        {isLink ? (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-slate-900">{value}</p>
        )}
      </div>
    </div>
  )
}

function SocialButton({ icon: Icon, href }: { icon: LucideIcon; href: string }) {
  const fullUrl = href.startsWith('http') ? href : `https://${href}`
  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
    >
      <Icon className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
    </a>
  )
}

function MiniStat({
  label,
  value,
  change
}: {
  label: string
  value: string
  change?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-slate-900">{value}</span>
        {change && (
          <span className="text-xs text-green-600">{change}</span>
        )}
      </div>
    </div>
  )
}

function ProfileCompleteness({ profile }: { profile: CompanyProfile }) {
  const fields = [
    { name: 'Nom', completed: !!profile.name },
    { name: 'Descripció', completed: !!profile.description },
    { name: 'Logo', completed: !!profile.logo },
    { name: 'Portada', completed: !!profile.coverImage },
    { name: 'Email', completed: !!profile.email },
    { name: 'Telèfon', completed: !!profile.phone },
    { name: 'Web', completed: !!profile.website },
    { name: 'Adreça', completed: !!profile.address },
    { name: 'Sector', completed: !!profile.sector },
    { name: 'Xarxes socials', completed: !!(profile.socialLinks?.linkedin || profile.socialLinks?.twitter || profile.socialLinks?.instagram || profile.socialLinks?.facebook) },
  ]

  const completedCount = fields.filter(f => f.completed).length
  const percentage = Math.round((completedCount / fields.length) * 100)
  const missingFields = fields.filter(f => !f.completed)

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">{percentage}% completat</span>
        <span className="text-sm font-medium text-blue-600">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage === 100 ? 'bg-green-600' : 'bg-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {missingFields.length > 0 && (
        <p className="text-xs text-slate-500 mt-3">
          Falta: {missingFields.map(f => f.name).join(', ')}
        </p>
      )}
    </>
  )
}
