'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OfferWizard from '@/app/components/empresa/OfferWizard';
import {
  Step1Info,
  Step2Preus,
  Step3Dates,
  Step4Imatges,
  Step5Contingut,
  Step6Condicions,
  Step7Contacte,
  Step8Publicacio
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
    priceType: 'FIXED',
    currency: 'EUR',
    publishedAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    duration: '',
    images: [],
    benefits: '',
    requirements: '',
    conditions: '',
    internalNotes: '',
    contactMethod: 'EMAIL',
    contactEmail: '',
    contactPhone: '',
    externalUrl: '',
    location: '',
    remote: false,
    featured: false,
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
      id: 'preus',
      title: 'Preus',
      description: 'Configura els descomptes i preus',
      component: <Step2Preus formData={formData} onChange={setFormData} />
    },
    {
      id: 'dates',
      title: 'Dates',
      description: 'Defineix les dates de validesa',
      component: <Step3Dates formData={formData} onChange={setFormData} />
    },
    {
      id: 'imatges',
      title: 'Imatges',
      description: 'Afegeix imatges de l\'oferta',
      component: <Step4Imatges formData={formData} onChange={setFormData} />
    },
    {
      id: 'contingut',
      title: 'Contingut',
      description: 'Descripció detallada i beneficis',
      component: <Step5Contingut formData={formData} onChange={setFormData} />,
      isValid: !!formData.description
    },
    {
      id: 'condicions',
      title: 'Condicions',
      description: 'Requisits i condicions d\'ús',
      component: <Step6Condicions formData={formData} onChange={setFormData} />
    },
    {
      id: 'contacte',
      title: 'Contacte',
      description: 'Informació de contacte i ubicació',
      component: <Step7Contacte formData={formData} onChange={setFormData} />
    },
    {
      id: 'publicacio',
      title: 'Publicació',
      description: 'Revisió final i opcions de publicació',
      component: <Step8Publicacio formData={formData} onChange={setFormData} />
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

      const offerData = {
        ...formData,
        slug,
        status,
        submittedAt: status === 'PENDING' ? new Date().toISOString() : null
      };

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