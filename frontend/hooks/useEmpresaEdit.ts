'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface EmpresaEditData {
  // Datos básicos
  name: string;
  email: string;
  sector: string;
  size: string;
  subscriptionPlan: string;

  // Información de contacto
  phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
  };

  // Detalles de la empresa
  description: string;
  foundedYear: number;
  employeeCount: number;
  cif: string;
  slogan: string;
  services: string[];

  // Estado y configuración
  isVerified: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  isActive: boolean;
  status: 'active' | 'pending' | 'suspended';
}

export const useEmpresaEdit = (empresaId: string) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar datos de empresa
  const loadEmpresa = async (): Promise<EmpresaEditData | null> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${empresaId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }

      const data = await response.json();

      return {
        name: data.name || '',
        email: data.email || '',
        sector: data.sector || '',
        size: data.size || '',
        subscriptionPlan: data.subscriptionPlan || '',
        phone: data.phone || '',
        website: data.website || '',
        address: data.address || {
          street: '',
          city: '',
          postalCode: '',
          province: '',
          country: 'España'
        },
        description: data.description || '',
        foundedYear: data.foundedYear || new Date().getFullYear(),
        employeeCount: data.employeeCount || 1,
        cif: data.cif || '',
        slogan: data.slogan || '',
        services: data.services || [],
        isVerified: data.isVerified || false,
        isFeatured: data.isFeatured || false,
        isPinned: data.isPinned || false,
        isActive: data.isActive !== false,
        status: data.status || 'active'
      };

    } catch (error) {
      console.error('Error loading empresa:', error);
      toast.error('Error al carregar les dades de l\'empresa');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Guardar cambios
  const saveEmpresa = async (formData: EmpresaEditData): Promise<boolean> => {
    try {
      setSaving(true);

      const response = await fetch(`/api/companies/${empresaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar empresa');
      }

      toast.success('Empresa actualitzada correctament');
      return true;

    } catch (error) {
      console.error('Error saving empresa:', error);
      toast.error('Error al actualitzar l\'empresa');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Cambiar plan de suscripción
  const changePlan = async (newPlan: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/companies/${empresaId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscriptionPlan: newPlan })
      });

      if (!response.ok) {
        throw new Error('Error al cambiar plan');
      }

      toast.success(`Pla canviat a ${newPlan} correctament`);
      return true;

    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Error al canviar el pla');
      return false;
    }
  };

  // Navegar de vuelta al listado
  const navigateToList = () => {
    router.push('/admin/empresas/listar');
  };

  // Validar campos obligatorios por paso
  const validateStep = (step: number, formData: EmpresaEditData): Record<string, string> => {
    const errors: Record<string, string> = {};

    switch(step) {
      case 1: // Datos básicos
        if (!formData.name) errors.name = 'El nom és obligatori';
        if (!formData.email) errors.email = 'L\'email és obligatori';
        if (!formData.sector) errors.sector = 'El sector és obligatori';
        break;

      case 2: // Contacto
        if (!formData.address.street) errors['address.street'] = 'L\'adreça és obligatòria';
        if (!formData.address.city) errors['address.city'] = 'La ciutat és obligatòria';
        break;

      case 3: // Perfil completo
        if (!formData.description) errors.description = 'La descripció és obligatòria';
        break;

      case 4: // Plan - no hay validación específica
        break;

      case 5: // Admin - no hay validación específica
        break;
    }

    return errors;
  };

  return {
    loading,
    saving,
    loadEmpresa,
    saveEmpresa,
    changePlan,
    navigateToList,
    validateStep
  };
};

// Hook para gestionar el formulario de edición
export const useEmpresaForm = (initialData: EmpresaEditData) => {
  const [formData, setFormData] = useState<EmpresaEditData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Actualizar campo del formulario
  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        // Para campos anidados como address.street
        const [parent, child] = field.split('.');
        const parentValue = prev[parent as keyof EmpresaEditData];
        return {
          ...prev,
          [parent]: {
            ...(parentValue && typeof parentValue === 'object' ? parentValue : {}),
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Establecer errores de validación
  const setValidationErrors = (newErrors: Record<string, string>) => {
    setErrors(newErrors);
  };

  // Limpiar todos los errores
  const clearErrors = () => {
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    setValidationErrors,
    clearErrors,
    setFormData
  };
};

export default useEmpresaEdit;