'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SharedOfferWizard from '@/components/shared/offers/SharedOfferWizard';
import { OfferFormData } from '@/components/shared/offers/types';
import { getCategoriesAsOptions } from '@/lib/constants/categories';

interface Empresa {
    id: string
    name: string
    verified: boolean
    rating: number
    reviews: number
}

const getEmpreses = (): Empresa[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('createdEmpresas')
    if (stored) {
        try {
            return JSON.parse(stored)
        } catch (e) { console.error(e) }
    }
    return [
        { id: '1', name: 'TechSolutions BCN', verified: true, rating: 4.2, reviews: 24 },
        { id: '2', name: 'EcoServeis Catalunya', verified: true, rating: 4.9, reviews: 31 },
        { id: '3', name: 'Consultoria Puig & Associats', verified: true, rating: 4.6, reviews: 18 },
    ]
}

export default function EditarOfertaPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [initialData, setInitialData] = useState<OfferFormData | null>(null)
    const [categories, setCategories] = useState<any[]>([]);
    const [empreses, setEmpreses] = useState<Empresa[]>([])

    useEffect(() => {
        setEmpreses(getEmpreses());
        setCategories(getCategoriesAsOptions());
        loadOffer()
    }, [params.id, router])

    const loadOffer = () => {
        try {
            const stored = localStorage.getItem('createdOfertas')
            if (stored) {
                const offers = JSON.parse(stored)
                const offer = offers.find((o: any) => o.id.toString() === params.id)

                if (offer) {
                    setInitialData({
                        id: offer.id,
                        title: offer.title,
                        description: offer.description,
                        categoryId: offer.categoryId || offer.category, // Handle mismatch
                        companyId: offer.company?.id?.toString() || '',
                        companyName: offer.company?.name || '',

                        // New fields mapping
                        originalPrice: offer.originalPrice,
                        price: offer.offerPrice || offer.price,
                        discountPercentage: offer.discount,
                        priceType: offer.priceType || 'FIXED',

                        publishedAt: offer.validFrom || offer.publishedAt,
                        expiresAt: offer.validUntil || offer.expiresAt,

                        images: offer.images || [],

                        redemptionType: offer.redemptionType || 'COUPON',
                        externalUrl: offer.externalUrl || offer.directLink,

                        featured: offer.featured || false,
                        priority: offer.priority || 0,
                        status: (offer.status || 'DRAFT').toUpperCase() as any,

                        // Other fields
                        shortDescription: offer.shortDescription || '',
                        benefits: offer.benefits || '',
                        requirements: offer.requirements || '',
                        conditions: offer.conditions || '',
                        contactMethod: offer.contactMethod || 'EMAIL',
                        contactEmail: offer.contactEmail || '',
                        contactPhone: offer.contactPhone || '',
                        location: offer.location || '',
                        remote: offer.remote || false,
                        tags: offer.tags || [],
                    })
                } else {
                    alert('Oferta no trobada')
                    router.push('/gestio/ofertes')
                }
            }
        } catch (e) {
            console.error(e)
            alert('Error carregant oferta')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (formData: OfferFormData, status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const stored = localStorage.getItem('createdOfertas')
        const existing = stored ? JSON.parse(stored) : []

        const updatedOffers = existing.map((o: any) => {
            if (o.id.toString() === params.id) {
                return {
                    ...o,
                    ...formData,
                    id: o.id,
                    createdAt: o.createdAt,
                    views: o.views,
                    company: {
                        id: formData.companyId,
                        name: formData.companyName,
                        verified: empreses.find(e => e.id === formData.companyId)?.verified || false,
                    },
                    // Backwards compatibility for list view
                    offerPrice: formData.price,
                    category: categories.find((c: any) => c.value === formData.categoryId)?.label || formData.categoryId,
                    validFrom: formData.publishedAt,
                    validUntil: formData.expiresAt,
                    status: status.toLowerCase(),
                }
            }
            return o
        })

        localStorage.setItem('createdOfertas', JSON.stringify(updatedOffers))
        router.push('/gestio/ofertes')
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Carregant dades...</div>

    if (!initialData) return null

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <SharedOfferWizard
                initialData={initialData}
                onSave={handleSave}
                enableCompanySelection={true}
                categories={categories}
                empreses={empreses}
            />
        </div>
    )
}
