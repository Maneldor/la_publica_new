'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SharedOfferWizard from '@/components/shared/offers/SharedOfferWizard';
import { OfferFormData } from '@/components/shared/offers/types';
import { getCategoriesAsOptions } from '@/lib/constants/categories';

export default function CrearOfertaPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    setCategories(getCategoriesAsOptions());
  }, []);

  const handleSave = async (data: OfferFormData, status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => {
    try {
      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Date.now();

      // Map form data to API expected format
      // Note: OfferFormData matches the structure mostly, but we ensure explicit mapping just in case
      const offerData = {
        title: data.title,
        categoryId: data.categoryId,
        description: data.description,
        shortDescription: data.shortDescription,

        // Price mapping
        price: data.price,
        originalPrice: data.originalPrice,
        currency: data.currency || 'EUR',
        priceType: data.priceType || 'FIXED',

        // Images mapping
        images: data.images,

        // URL mapping
        externalUrl: data.externalUrl,

        // Redemption type
        redemptionType: data.redemptionType,

        // Dates
        publishedAt: data.publishedAt,
        expiresAt: data.expiresAt,
        duration: data.duration,

        // Other fields
        benefits: data.benefits,
        requirements: data.requirements,
        conditions: data.conditions,
        location: data.location,
        remote: data.remote || false,
        featured: data.featured || false,
        priority: data.priority || 0,
        tags: data.tags || [],

        // Contact
        contactMethod: data.contactMethod || 'EMAIL',
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,

        // Internal
        internalNotes: data.internalNotes,

        // Status and timestamps
        slug,
        status,
        submittedAt: status === 'PENDING' ? new Date().toISOString() : null
      };

      console.log('📤 Sending offer data to API:', JSON.stringify(offerData, null, 2));

      const response = await fetch('/api/empresa/ofertas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear oferta');
      }

      // Show success message based on status
      if (status === 'DRAFT') {
        alert('✅ Oferta guardada com a esborrany');
      } else if (status === 'PENDING') {
        alert('📨 Oferta enviada per revisió. L\'administrador la revisarà aviat.');
      } else if (status === 'PUBLISHED') {
        alert('🎉 Oferta publicada correctament!');
      }

      router.push('/empresa/ofertas');
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <SharedOfferWizard
          onSave={handleSave}
          enableCompanySelection={false}
          categories={categories}
        />
      </div>
    </div>
  );
}