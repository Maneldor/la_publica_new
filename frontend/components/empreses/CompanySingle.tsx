'use client'

import Link from 'next/link'
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Clock,
  Star,
  BadgeCheck,
  Award,
  Briefcase,
  Users,
  Calendar,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ImageIcon,
  ArrowLeft
} from 'lucide-react'

export interface CompanySingleData {
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
  tags?: string[]
  specializations?: string[]
  certifications?: any
  gallery?: string[]
  socialMedia?: { linkedin?: string; twitter?: string; facebook?: string; instagram?: string } | null
  foundingYear?: number | null
  employeeCount?: number | null
  size?: string | null
  isVerified?: boolean
  currentPlan?: { nombre?: string; nombreCorto?: string; name?: string } | null
}

interface CompanySingleProps {
  company: CompanySingleData
  isPreview?: boolean
  backUrl?: string
}

export function CompanySingle({ company, isPreview = false, backUrl }: CompanySingleProps) {
  const planName = company.currentPlan?.nombreCorto || company.currentPlan?.nombre || company.currentPlan?.name || null
  const socialMedia = company.socialMedia || {}
  const services = company.services || company.tags || []

  return (
    <div className="bg-slate-50 min-h-full">
      {/* Hero Section */}
      <div className="relative">
        {/* Cover Image */}
        <div
          className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative"
          style={company.coverImage ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${company.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : undefined}
        >
          {/* Logo */}
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="h-10 w-10 text-slate-400" />
              )}
            </div>
          </div>
        </div>

        {/* Company Info Header */}
        <div className="pt-16 pb-6 px-6 bg-white border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
                {company.isVerified && (
                  <span className="text-green-500" title="Empresa verificada">
                    <BadgeCheck className="h-6 w-6" />
                  </span>
                )}
              </div>

              <p className="text-slate-600 mb-3">{company.sector || 'Sense sector'}</p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {planName && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                    {planName}
                  </span>
                )}
                {company.isVerified && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verificada
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 text-slate-200"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <span className="text-slate-500">0 valoracions</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium ${isPreview ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                disabled={isPreview}
              >
                Contactar
              </button>
              <button
                className={`px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium ${isPreview ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                disabled={isPreview}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Slogan */}
            {company.slogan && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-800 italic text-lg">"{company.slogan}"</p>
              </div>
            )}

            {/* About */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-500" />
                Sobre nosaltres
              </h2>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                {company.description || 'Sense descripció disponible.'}
              </p>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-slate-500" />
                  Serveis
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((service, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-slate-700"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      {service}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations */}
            {company.specializations && company.specializations.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-slate-500" />
                  Especialitzacions
                </h2>
                <div className="flex flex-wrap gap-2">
                  {company.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {company.gallery && company.gallery.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-slate-500" />
                  Galeria
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {company.gallery.slice(0, 6).map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-video rounded-lg overflow-hidden bg-slate-100"
                    >
                      <img
                        src={img}
                        alt={`Galeria ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offers placeholder */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-slate-500" />
                Ofertes actives
              </h2>
              <div className="text-center py-8 text-slate-500">
                <Star className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p>No hi ha ofertes publicades</p>
              </div>
            </div>

            {/* Reviews placeholder */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-slate-500" />
                Valoracions
              </h2>
              <div className="text-center py-8 text-slate-500">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p>Encara no hi ha valoracions</p>
              </div>
            </div>
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-4">
            {/* Contact Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Contacte</h3>
              <div className="space-y-3">
                {(company.contactEmail || company.email) && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">{company.contactEmail || company.email}</span>
                  </div>
                )}
                {(company.contactPhone || company.phone) && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">{company.contactPhone || company.phone}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm ${isPreview ? 'text-blue-600' : 'text-blue-600 hover:underline'}`}
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-start gap-3 text-slate-600">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                    <span className="text-sm">{company.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours */}
            {company.workingHours && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Horari
                </h3>
                <p className="text-sm text-slate-600 whitespace-pre-line">
                  {company.workingHours}
                </p>
              </div>
            )}

            {/* Company Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Informació</h3>
              <div className="space-y-3">
                {company.foundingYear && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Any fundació
                    </span>
                    <span className="text-slate-900 font-medium">{company.foundingYear}</span>
                  </div>
                )}
                {(company.employeeCount || company.size) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Empleats
                    </span>
                    <span className="text-slate-900 font-medium">
                      {company.employeeCount || company.size}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            {(socialMedia.linkedin || socialMedia.twitter || socialMedia.facebook || socialMedia.instagram) && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Xarxes socials</h3>
                <div className="flex gap-3">
                  {socialMedia.linkedin && (
                    <a
                      href={socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <Linkedin className="h-5 w-5 text-blue-700" />
                    </a>
                  )}
                  {socialMedia.twitter && (
                    <a
                      href={socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center hover:bg-sky-200 transition-colors"
                    >
                      <Twitter className="h-5 w-5 text-sky-500" />
                    </a>
                  )}
                  {socialMedia.facebook && (
                    <a
                      href={socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </a>
                  )}
                  {socialMedia.instagram && (
                    <a
                      href={socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-pink-600" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Certifications */}
            {company.certifications && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-500" />
                  Certificacions
                </h3>
                <div className="space-y-2">
                  {Array.isArray(company.certifications) ? (
                    company.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <BadgeCheck className="h-4 w-4 text-green-500" />
                        {typeof cert === 'string' ? cert : cert.name || cert}
                      </div>
                    ))
                  ) : typeof company.certifications === 'object' ? (
                    Object.entries(company.certifications).map(([key, value], idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <BadgeCheck className="h-4 w-4 text-green-500" />
                        {String(value)}
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Sense certificacions</span>
                  )}
                </div>
              </div>
            )}

            {/* Back button */}
            {backUrl && (
              <Link
                href={backUrl}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Tornar
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
