'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OfferWizard from '@/app/components/empresa/OfferWizard';
import {
  Step1Info,
  Step2RedemptionType,
  Step3Preus,
  Step4Dates,
  Step5Imatges,
  Step6Contingut,
  Step7Condicions,
  Step8Contacte,
  Step9Publicacio
} from './steps';

export default function CrearOfertaPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    shortDescription: '',
    description: '',
    discountPercentage: '',
    originalPrice: '',
    price: '',
    finalPrice: '', // For compatibility with wizard steps
    priceType: 'FIXED',
    currency: 'EUR',
    publishedAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    validUntil: '', // For compatibility with wizard steps
    duration: '',
    images: [],
    imageUrl: '', // For compatibility with wizard steps
    benefits: '',
    requirements: '',
    conditions: '',
    internalNotes: '',
    contactMethod: 'EMAIL',
    contactEmail: '',
    contactPhone: '',
    externalUrl: '',
    redemptionType: 'COUPON' as const, // 🆕 Nuevo campo
    websiteUrl: '', // For compatibility with wizard steps
    location: '',
    remote: false,
    featured: false,
    isFeatured: false, // For compatibility with wizard steps
    priority: 0,
    tags: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/ofertas/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const steps = [
    {
      id: 'info',
      title: 'Informació',
      description: 'Informació bàsica de l\'oferta',
      component: <Step1Info formData={formData} onChange={setFormData} categories={categories} />,
      isValid: !!formData.title && !!formData.categoryId
    },
    {
      id: 'redempcio',
      title: 'Tipus redempció',
      description: 'Com accediran els usuaris a l\'oferta',
      component: <Step2RedemptionType formData={formData} onChange={setFormData} />,
      isValid: (formData.redemptionType as string) === 'ONLINE' ? !!formData.externalUrl : true
    },
    {
      id: 'preus',
      title: 'Preus',
      description: 'Configura els descomptes i preus',
      component: <Step3Preus formData={formData} onChange={setFormData} />
    },
    {
      id: 'dates',
      title: 'Dates',
      description: 'Defineix les dates de validesa',
      component: <Step4Dates formData={formData} onChange={setFormData} />
    },
    {
      id: 'imatges',
      title: 'Imatges',
      description: 'Afegeix imatges de l\'oferta',
      component: <Step5Imatges formData={formData} onChange={setFormData} />
    },
    {
      id: 'contingut',
      title: 'Contingut',
      description: 'Descripció detallada i beneficis',
      component: <Step6Contingut formData={formData} onChange={setFormData} />,
      isValid: !!formData.description
    },
    {
      id: 'condicions',
      title: 'Condicions',
      description: 'Requisits i condicions d\'ús',
      component: <Step7Condicions formData={formData} onChange={setFormData} />
    },
    {
      id: 'contacte',
      title: 'Contacte',
      description: 'Informació de contacte i ubicació',
      component: <Step8Contacte formData={formData} onChange={setFormData} />
    },
    {
      id: 'publicacio',
      title: 'Publicació',
      description: 'Revisió final i opcions de publicació',
      component: <Step9Publicacio formData={formData} onChange={setFormData} />
    }
  ];

  const handleSave = async (status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => {
    try {
      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Date.now();

      // Map form data to API expected format
      const offerData = {
        title: formData.title,
        categoryId: formData.categoryId,
        description: formData.description,
        shortDescription: formData.shortDescription,

        // Price mapping
        price: formData.price || formData.finalPrice, // Map finalPrice to price
        originalPrice: formData.originalPrice,
        currency: formData.currency || 'EUR',
        priceType: formData.priceType || 'FIXED',

        // Images mapping
        images: formData.images && formData.images.length > 0
          ? formData.images
          : (formData.imageUrl ? [formData.imageUrl] : []), // Map imageUrl to images array

        // URL mapping
        externalUrl: formData.externalUrl || formData.websiteUrl, // Map websiteUrl to externalUrl

        // Redemption type
        redemptionType: formData.redemptionType || 'COUPON', // 🆕 Agregar redemptionType

        // Dates
        publishedAt: formData.publishedAt,
        expiresAt: formData.expiresAt || formData.validUntil, // Map validUntil to expiresAt

        // Other fields
        benefits: formData.benefits,
        requirements: formData.requirements,
        conditions: formData.conditions,
        duration: formData.duration,
        location: formData.location,
        remote: formData.remote || false,
        featured: formData.featured || formData.isFeatured || false, // Map isFeatured to featured
        priority: formData.priority || 0,
        tags: formData.tags || [],

        // Contact
        contactMethod: formData.contactMethod || 'EMAIL',
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,

        // Internal
        internalNotes: formData.internalNotes,

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

      const result = await response.json();

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
        <OfferWizard
          steps={steps}
          onSave={handleSave}
          formData={formData}
          onChange={setFormData}
        />
      </div>
    </div>
  );
}