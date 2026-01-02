'use client'

import Link from 'next/link'
import { Building2, MapPin, Star, BadgeCheck } from 'lucide-react'

export interface CompanyCardData {
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
  website?: string | null
  services?: string[]
  tags?: string[]
  isVerified?: boolean
  currentPlan?: { nombre?: string; nombreCorto?: string; name?: string } | null
}

interface CompanyCardProps {
  company: CompanyCardData
  href?: string
  showLink?: boolean
}

export function CompanyCard({ company, href, showLink = true }: CompanyCardProps) {
  const planName = company.currentPlan?.nombreCorto || company.currentPlan?.nombre || company.currentPlan?.name || null
  const services = company.services || company.tags || []

  const cardContent = (
    <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all h-[380px] flex flex-col">
      {/* Cover Image */}
      <div
        className="h-28 bg-gradient-to-r from-blue-500 to-indigo-600 relative"
        style={company.coverImage ? {
          backgroundImage: `url(${company.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        {/* Status badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {company.isVerified && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-md flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" />
              Verificada
            </span>
          )}
        </div>

        {/* Logo */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-14 h-14 rounded-xl bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 pb-5 px-4 flex-1 flex flex-col">
        {/* Sector & Location */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600">
            {company.sector || 'Sense sector'}
          </span>
          {company.address && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {company.address.split(',')[0]}
            </span>
          )}
        </div>

        {/* Company name */}
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
          {company.name}
        </h3>

        {/* Plan badge */}
        <div className="h-6 mb-1">
          {planName && (
            <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              {planName}
            </span>
          )}
        </div>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-3.5 w-3.5 text-slate-200"
                fill="currentColor"
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">(0 ressenyes)</span>
        </div>

        {/* Slogan or description */}
        <p className="text-sm text-slate-600 line-clamp-2 flex-1">
          {company.slogan || company.description || 'Sense descripció'}
        </p>

        {/* Services preview */}
        <div className="flex flex-wrap gap-1 mt-3 min-h-[24px]">
          {services.length > 0 ? (
            <>
              {services.slice(0, 2).map((service, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                >
                  {service}
                </span>
              ))}
              {services.length > 2 && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">
                  +{services.length - 2}
                </span>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )

  if (showLink && (href || company.id)) {
    return (
      <Link href={href || `/dashboard/empreses/${company.id}`} className="block w-[320px]">
        {cardContent}
      </Link>
    )
  }

  return <div className="w-[320px]">{cardContent}</div>
}
