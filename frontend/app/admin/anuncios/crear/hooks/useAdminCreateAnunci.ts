'use client';

import { useState } from 'react';

export interface AdminAnunciFormData {
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

  // Step 4
  images: File[];
  mainImageIndex: number;

  // Admin-only fields
  isFeatured: boolean;
  priority: 'normal' | 'high' | 'urgent';
  moderationStatus: 'approved' | 'pending';
}

const initialFormData: AdminAnunciFormData = {
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
  images: [],
  mainImageIndex: 0,
  // Admin fields
  isFeatured: false,
  priority: 'normal',
  moderationStatus: 'approved',
};

export type UpdateAdminAnunciField = <K extends keyof AdminAnunciFormData>(
  field: K,
  value: AdminAnunciFormData[K]
) => void;

export const useAdminCreateAnunci = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AdminAnunciFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField: UpdateAdminAnunciField = (field, value) => {
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
      if (formData.images.length === 0) {
        newErrors.images = 'Has d\'afegir almenys una imatge del producte';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6)); // 6 steps for admin (includes admin settings)
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