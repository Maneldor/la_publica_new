'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

interface FeaturedAd {
  id: string
  title: string
  shortDescription?: string
  description: string
  images: string[]
  ctaText?: string
  ctaUrl?: string
  targetBlank: boolean
  company?: {
    name: string
    logo?: string
  }
  publisherName?: string
  publisherLogo?: string
}

interface FeaturedAdsSliderProps {
  className?: string
  autoRotateInterval?: number
}

export function FeaturedAdsSlider({
  className = '',
  autoRotateInterval = 5000
}: FeaturedAdsSliderProps) {
  const [ads, setAds] = useState<FeaturedAd[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/featured-ads?type=slider&impressions=true')
        const data = await res.json()
        setAds(data.ads || [])
      } catch (error) {
        console.error('Error carregant slider:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAds()
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length)
    }, autoRotateInterval)

    return () => clearInterval(interval)
  }, [ads.length, isPaused, autoRotateInterval])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length)
  }, [ads.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ads.length)
  }, [ads.length])

  const handleClick = async (adId: string) => {
    try {
      await fetch(`/api/featured-ads/${adId}/click`, { method: 'POST' })
    } catch (error) {
      console.error('Error registrant clic:', error)
    }
  }

  if (isLoading) {
    return (
      <div className={`relative h-64 md:h-80 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl animate-pulse ${className}`} />
    )
  }

  if (ads.length === 0) {
    return null
  }

  const currentAd = ads[currentIndex]
  const publisherName = currentAd.company?.name || currentAd.publisherName
  const publisherLogo = currentAd.company?.logo || currentAd.publisherLogo

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Contingut del slide */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-purple-600 to-indigo-600">
        {/* Imatge de fons */}
        {currentAd.images[0] && (
          <Image
            src={currentAd.images[0]}
            alt={currentAd.title}
            fill
            className="object-cover opacity-30"
            priority
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/60" />

        {/* Contingut */}
        <div className="relative h-full flex items-center px-8 md:px-12">
          <div className="max-w-2xl">
            {/* Badge Publisher */}
            <div className="flex items-center gap-2 mb-4">
              {publisherLogo && (
                <Image
                  src={publisherLogo}
                  alt={publisherName || ''}
                  width={32}
                  height={32}
                  className="rounded-full bg-white p-0.5"
                />
              )}
              <span className="text-white/80 text-sm font-medium">
                {publisherName || 'Anunci destacat'}
              </span>
              <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                PREMIUM
              </span>
            </div>

            {/* Títol i descripció */}
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              {currentAd.title}
            </h2>
            <p className="text-white/90 text-base md:text-lg mb-6 line-clamp-2">
              {currentAd.shortDescription || currentAd.description}
            </p>

            {/* CTA */}
            {currentAd.ctaUrl && (
              <Link
                href={currentAd.ctaUrl}
                target={currentAd.targetBlank ? '_blank' : undefined}
                onClick={() => handleClick(currentAd.id)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors"
              >
                {currentAd.ctaText || 'Veure oferta'}
                {currentAd.targetBlank && <ExternalLink className="w-4 h-4" />}
              </Link>
            )}
          </div>
        </div>

        {/* Controls de navegació */}
        {ads.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              aria-label="Següent"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Indicadors */}
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Anar a slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
