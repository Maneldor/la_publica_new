'use client'

import {
  Building2,
  MapPin,
  Star,
  Users,
  CheckCircle,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Heart,
  Share2,
  ChevronRight,
  Briefcase,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockCompanyData } from '@/lib/design-system/mock-data'

interface CompanyCardPreviewProps {
  variant?: 'card' | 'single' | 'preview'
  company?: typeof mockCompanyData
}

export function CompanyCardPreview({
  variant = 'card',
  company = mockCompanyData
}: CompanyCardPreviewProps) {
  if (variant === 'single') {
    return <CompanySinglePreview company={company} />
  }

  if (variant === 'preview') {
    return <CompanyModalPreview company={company} />
  }

  // Default: Card variant
  return (
    <div className="space-y-6">
      <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
        Targeta d'Empresa (CompanyCard)
      </h4>

      <div className="grid grid-cols-2 gap-6">
        {/* Variant 1: With Cover */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <div className="h-28 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
            <span
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: company.plan.color + '20', color: company.plan.color }}
            >
              {company.plan.name}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center -mt-10 shadow-md">
                <Building2 className="h-7 w-7 text-slate-600" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold text-slate-900">{company.name}</h5>
                  {company.isVerified && (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {company.city}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">
              {company.slogan}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {company.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">{company.rating}</span>
                <span className="text-xs text-slate-500">({company.reviewsCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <Heart className="h-4 w-4 text-slate-400" />
                </button>
                <button className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                  Veure <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Variant 2: Compact */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="font-semibold text-slate-900 truncate">{company.name}</h5>
                {company.isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-500">{company.sector}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {company.city}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {company.employeeCount}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: company.plan.color + '20', color: company.plan.color }}
              >
                {company.plan.name}
              </span>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium">{company.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Variant 3: List Item */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="font-medium text-slate-900">{company.name}</h5>
                {company.isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: company.plan.color + '20', color: company.plan.color }}
                >
                  {company.plan.name}
                </span>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {company.city}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {company.sector}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {company.rating}
                </span>
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CompanySinglePreview({ company }: { company: typeof mockCompanyData }) {
  return (
    <div className="space-y-6">
      <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
        Pagina d'Empresa (CompanySingle)
      </h4>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Header */}
        <div className="px-6 -mt-12 relative">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
              <Building2 className="h-12 w-12 text-slate-600" />
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{company.name}</h2>
                {company.isVerified && (
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                )}
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: company.plan.color + '20', color: company.plan.color }}
                >
                  {company.plan.name}
                </span>
              </div>
              <p className="text-slate-600 mt-1">{company.slogan}</p>
            </div>
            <div className="flex items-center gap-2 pb-4">
              <button className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Heart className="h-5 w-5 text-slate-600" />
              </button>
              <button className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Share2 className="h-5 w-5 text-slate-600" />
              </button>
              <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Contactar
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <MapPin className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Ubicacio</p>
              <p className="text-sm font-medium text-slate-900">{company.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Empleats</p>
              <p className="text-sm font-medium text-slate-900">{company.employeeCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Calendar className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Fundada</p>
              <p className="text-sm font-medium text-slate-900">{company.foundedYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Valoracio</p>
              <p className="text-sm font-medium text-slate-900">{company.rating} ({company.reviewsCount})</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-4 border-t border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-2">Sobre nosaltres</h3>
          <p className="text-slate-600">{company.description}</p>
        </div>

        {/* Services */}
        <div className="px-6 py-4 border-t border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-3">Serveis</h3>
          <div className="flex flex-wrap gap-2">
            {company.services.map((service) => (
              <span
                key={service}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-900 mb-3">Contacte</h3>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
              <Phone className="h-4 w-4" /> {company.phone}
            </a>
            <a href="#" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
              <Mail className="h-4 w-4" /> {company.email}
            </a>
            <a href="#" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600">
              <Globe className="h-4 w-4" /> {company.website}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompanyModalPreview({ company }: { company: typeof mockCompanyData }) {
  return (
    <div className="space-y-6">
      <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
        Preview Modal (CompanyPreview)
      </h4>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-w-lg mx-auto">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
          <button className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/30 rounded-full">
            <ExternalLink className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 -mt-10">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 bg-white rounded-xl border-4 border-white shadow-md flex items-center justify-center">
              <Building2 className="h-10 w-10 text-slate-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">{company.name}</h3>
                {company.isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-slate-500">{company.sector}</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-4">{company.slogan}</p>

          <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {company.city}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> {company.rating}
            </span>
          </div>

          <div className="flex gap-2 mt-5">
            <button className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Veure perfil complet
            </button>
            <button className="p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Heart className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
