'use client'

import { useEffect, useState } from 'react'
import { Gift, ExternalLink, Calendar as CalendarIcon, Tag, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TYPOGRAPHY } from '@/lib/design-system'

interface Offer {
  id: string
  title: string
  description: string
  discount?: number
  price?: number
  originalPrice?: number
  expiresAt: string
  company: {
    name: string
    logo?: string
  }
  category: {
    name: string
  }
}

export function FeaturedOffers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('/api/dashboard/avui')
        if (res.ok) {
          const data = await res.json()
          setOffers(data.offers || [])
        }
      } catch (error) {
        console.error('Error fetching offers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'Expira avui'
    if (diffDays === 1) return 'Expira demà'
    if (diffDays < 7) return `Expira en ${diffDays} dies`
    
    return date.toLocaleDateString('ca-ES', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle
          icon={<Gift className="w-5 h-5 text-pink-500" />}
          action={
            <Link
              href="/dashboard/ofertes"
              className={`${TYPOGRAPHY.link} flex items-center gap-1`}
            >
              Veure totes
              <ChevronRight className="w-4 h-4" />
            </Link>
          }
        >
          Ofertes destacades
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-100 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : offers.length > 0 ? (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div 
              key={offer.id}
              className="border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-pink-200 transition-all cursor-pointer group"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {offer.company.logo ? (
                    <img 
                      src={offer.company.logo} 
                      alt={offer.company.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Gift className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                        {offer.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {offer.description}
                      </p>
                    </div>
                    
                    {offer.discount && (
                      <div className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-bold flex-shrink-0">
                        -{offer.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 font-medium">{offer.company.name}</span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Tag className="w-3 h-3" />
                        <span className="text-xs">{offer.category.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-gray-400">
                      <CalendarIcon className="w-3 h-3" />
                      <span className="text-xs">
                        {formatExpiryDate(offer.expiresAt)}
                      </span>
                    </div>
                  </div>
                  
                  {(offer.price || offer.originalPrice) && (
                    <div className="flex items-center gap-2 mt-2">
                      {offer.price && (
                        <span className="text-lg font-bold text-pink-600">
                          {offer.price}€
                        </span>
                      )}
                      {offer.originalPrice && offer.originalPrice !== offer.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {offer.originalPrice}€
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className={TYPOGRAPHY.body}>No hi ha ofertes disponibles</p>
            <p className={`${TYPOGRAPHY.small} mt-1`}>Les millors ofertes apareixeran aquí</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}