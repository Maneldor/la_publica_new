'use client';

import { useState, useEffect } from 'react';
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

export default function CrearOfertaPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [empreses, setEmpreses] = useState<Empresa[]>([]);

    useEffect(() => {
        setEmpreses(getEmpreses());
        setCategories(getCategoriesAsOptions());
    }, []);

    const handleSave = async (formData: OfferFormData, status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => {
        // Simular delay network
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newOferta = {
            id: Date.now(),
            ...formData,
            status: status.toLowerCase(),
            createdAt: new Date().toISOString(),
            company: {
                id: formData.companyId,
                name: formData.companyName,
                verified: empreses.find(e => e.id === formData.companyId)?.verified || false,
            },
            // List View Compatibility
            offerPrice: formData.price,
            category: categories.find((c: any) => c.value === formData.categoryId)?.label || formData.categoryId,
            validFrom: formData.publishedAt,
            validUntil: formData.expiresAt,
            imageUrls: formData.images,
            isFree: Number(formData.price) === 0,
            discount: Number(formData.discountPercentage) || 0,
            discountType: 'percentage',
            views: 0,
            isPinned: false
        };

        const stored = localStorage.getItem('createdOfertas');
        const existing = stored ? JSON.parse(stored) : [];
        localStorage.setItem('createdOfertas', JSON.stringify([...existing, newOferta]));

        router.push('/gestio/ofertes');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <SharedOfferWizard
                onSave={handleSave}
                enableCompanySelection={true}
                categories={categories}
                empreses={empreses}
            />
        </div>
    );
}
