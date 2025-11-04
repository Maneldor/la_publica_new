'use client';

import { useState } from 'react';

export interface AnunciFormData {
  // Step 1
  title: string;
  description: string;
  category: string;
  type: 'oferta' | 'demanda';

  // Step 2
  price: number | null;
  priceType: 'fix' | 'negociable';
  condition: 'nou' | 'usat' | 'com_nou';
  specifications: Record<string, string>;

  // Step 3
  province: string;
  city: string;
  postalCode: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  shippingIncluded: boolean;

  // Step 4 - Contacte
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactSchedule: string;

  // Step 5 - Imágenes
  coverImage: File | null;     // Imagen de portada (obligatoria)
  galleryImages: File[];       // Galería de imágenes adicionales (opcional)
}

const initialFormData: AnunciFormData = {
  title: '',
  description: '',
  category: '',
  type: 'oferta',
  price: null,
  priceType: 'fix',
  condition: 'usat',
  specifications: {},
  province: '',
  city: '',
  postalCode: '',
  pickupAvailable: true,
  shippingAvailable: false,
  shippingIncluded: false,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  contactSchedule: '',
  coverImage: null,
  galleryImages: [],
};

export const useCreateAnunci = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AnunciFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof AnunciFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'El títol és obligatori';
      if (formData.title.length < 10) newErrors.title = 'El títol ha de tenir mínim 10 caràcters';
      if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria';
      if (formData.description.length < 50) newErrors.description = 'La descripció ha de tenir mínim 50 caràcters';
      if (!formData.category) newErrors.category = 'La categoria és obligatòria';
    }

    if (step === 2) {
      // Precio es opcional, pero si se introduce debe ser > 0
      if (formData.price !== null && formData.price <= 0) {
        newErrors.price = 'El preu ha de ser major que 0';
      }
      // No hay más validaciones obligatorias en Step 2
    }

    if (step === 3) {
      if (!formData.province) newErrors.province = 'La província és obligatòria';
      if (!formData.city.trim()) newErrors.city = 'La població és obligatòria';

      // Al menos una opción de entrega debe estar seleccionada
      if (!formData.pickupAvailable && !formData.shippingAvailable && !formData.shippingIncluded) {
        newErrors.delivery = "Has de seleccionar almenys una opció d'entrega";
      }
    }

    if (step === 4) {
      // Validació opcional de l'email només si s'ha introduït
      if (formData.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = "L'email no té un format vàlid";
      }
    }

    if (step === 5) {
      if (!formData.coverImage) {
        newErrors.coverImage = 'Has d\'afegir una imatge de portada';
      }
    }

    // Más validaciones para otros steps después

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return {
    currentStep,
    formData,
    errors,
    updateField,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
  };
};