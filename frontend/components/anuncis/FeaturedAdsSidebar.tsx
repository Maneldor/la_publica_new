'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ExternalLink } from 'lucide-react'

interface FeaturedAd {
  id: string
  title: string
  shortDescription?: string
  images: string[]
  level: 'STANDARD' | 'BASIC'
  ctaUrl?: string
  targetBlank: boolean
  company?: {
    name: string
    logo?: string
  }
  publisherName?: string
  publisherLogo?: string
}

interface FeaturedAdsSidebarProps {
  className?: string
  maxItems?: number
}

export function FeaturedAdsSidebar({
  className = '',
  maxItems = 5
}: FeaturedAdsSidebarProps) {
  const [ads, setAds] = useState<FeaturedAd[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/featured-ads?type=sidebar&impressions=true')
        const data = await res.json()
        setAds((data.ads || []).slice(0, maxItems))
      } catch (error) {
        console.error('Error carregant sidebar:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAds()
  }, [maxItems])

  const handleClick = async (adId: string) => {
    try {
      await fetch(`/api/featured-ads/${adId}/click`, { method: 'POST' })
    } catch (error) {
      console.error('Error registrant clic:', error)
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (ads.length === 0) {
    return (
      <div className={`${className}`}>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          <Star className="w-4 h-4 text-yellow-500" />
          Destacats
        </h3>
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-dashed border-gray-300 rounded-xl text-center">
          <Star className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Espai per anuncis destacats</p>
          <p className="text-xs text-gray-400 mt-1">Contacta'ns per promocionar aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
        <Star className="w-4 h-4 text-yellow-500" />
        Destacats
      </h3>

      {ads.map((ad) => {
        const publisherName = ad.company?.name || ad.publisherName
        const publisherLogo = ad.company?.logo || ad.publisherLogo
        const isStandard = ad.level === 'STANDARD'

        const CardWrapper = ad.ctaUrl ? Link : 'div'
        const cardProps = ad.ctaUrl
          ? {
              href: ad.ctaUrl,
              target: ad.targetBlank ? '_blank' : undefined,
              onClick: () => handleClick(ad.id)
            }
          : {}

        return (
          <CardWrapper
            key={ad.id}
            {...(cardProps as any)}
            className={`block p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
              isStandard
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex gap-3">
              {/* Imatge o Logo */}
              <div className="flex-shrink-0">
                {ad.images[0] ? (
                  <Image
                    src={ad.images[0]}
                    alt={ad.title}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                  />
                ) : publisherLogo ? (
                  <Image
                    src={publisherLogo}
                    alt={publisherName || ''}
                    width={64}
                    height={64}
                    className="rounded-lg object-contain bg-white p-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Contingut */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                    {ad.title}
                  </h4>
                  {isStandard && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded">
                      DESTACAT
                    </span>
                  )}
                </div>
                {publisherName && (
                  <p className="text-xs text-gray-500 mt-0.5">{publisherName}</p>
                )}
                {ad.shortDescription && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {ad.shortDescription}
                  </p>
                )}
              </div>
            </div>

            {ad.targetBlank && ad.ctaUrl && (
              <div className="flex justify-end mt-2">
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </div>
            )}
          </CardWrapper>
        )
      })}
    </div>
  )
}
