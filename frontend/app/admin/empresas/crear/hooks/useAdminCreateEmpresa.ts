'use client';

import { useState } from 'react';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  photo: File | null;
  photoUrl?: string;
}

export interface Certification {
  id: string;
  name: string;
  code: string;
  year: string;
  icon: string;
}

export interface SocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
}

export interface AdminEmpresaFormData {
  // Step 1 - Imágenes y Branding
  coverImage: File | null;
  coverImageUrl?: string;
  logo: File | null;
  logoUrl?: string;
  name: string;
  slogan: string;

  // Step 2 - Información Básica
  description: string;
  category: string;
  sector: string;
  services: string[];

  // Step 3 - Contacto y Ubicación
  email: string;
  phone: string;
  website: string;
  address: string;
  coordinates?: { lat: number; lng: number };

  // Step 4 - Información Profesional
  employeeRange: string;
  foundedYear: string;
  schedule: Record<string, string>; // { "monday": "9:00-18:00", "saturday": "Tancat" }

  // Step 5 - Certificaciones y Sectores
  certifications: Certification[];
  publicSectors: string[];

  // Step 6 - Equipo y Redes Sociales
  teamMembers: TeamMember[];
  socialMedia: SocialMedia;
  relatedCompanies: string[];

  // Step 7 - Configuración Admin
  isVerified: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  status: 'active' | 'pending' | 'suspended';

  // Additional fields
  mainImageIndex: number;
}

const initialFormData: AdminEmpresaFormData = {
  // Step 1
  coverImage: null,
  logo: null,
  name: '',
  slogan: '',

  // Step 2
  description: '',
  category: '',
  sector: '',
  services: [],

  // Step 3
  email: '',
  phone: '',
  website: '',
  address: '',

  // Step 4
  employeeRange: '',
  foundedYear: '',
  schedule: {
    monday: '9:00-18:00',
    tuesday: '9:00-18:00',
    wednesday: '9:00-18:00',
    thursday: '9:00-18:00',
    friday: '9:00-18:00',
    saturday: 'Tancat',
    sunday: 'Tancat'
  },

  // Step 5
  certifications: [],
  publicSectors: [],

  // Step 6
  teamMembers: [],
  socialMedia: {},
  relatedCompanies: [],

  // Step 7
  isVerified: false,
  isFeatured: false,
  isPremium: false,
  status: 'pending',

  // Additional
  mainImageIndex: 0,
};

export const useAdminCreateEmpresa = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AdminEmpresaFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof AdminEmpresaFormData, value: any) => {
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

  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: '',
      position: '',
      photo: null,
    };
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember]
    }));
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: any) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    }));
  };

  const removeTeamMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== id)
    }));
  };

  const addCertification = () => {
    const newCertification: Certification = {
      id: Date.now().toString(),
      name: '',
      code: '',
      year: '',
      icon: '📜',
    };
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: any) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'El nom de l\'empresa és obligatori';
      if (formData.name.length < 2) newErrors.name = 'El nom ha de tenir mínim 2 caràcters';
      if (!formData.slogan.trim()) newErrors.slogan = 'El slogan és obligatori';
    }

    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria';
      if (formData.description.length < 100) newErrors.description = 'La descripció ha de tenir mínim 100 caràcters';
      if (!formData.category) newErrors.category = 'La categoria és obligatòria';
      if (formData.services.length === 0) newErrors.services = 'Has de seleccionar almenys un servei';
    }

    if (step === 3) {
      if (!formData.email.trim()) newErrors.email = 'L\'email és obligatori';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Format d\'email invàlid';
      }
      if (!formData.phone.trim()) newErrors.phone = 'El telèfon és obligatori';
      if (!formData.address.trim()) newErrors.address = 'L\'adreça és obligatòria';
    }

    if (step === 4) {
      if (!formData.employeeRange) newErrors.employeeRange = 'El nombre d\'empleats és obligatori';
      if (!formData.foundedYear) newErrors.foundedYear = 'L\'any de fundació és obligatori';
    }

    if (step === 5) {
      if (formData.publicSectors.length === 0) {
        newErrors.publicSectors = 'Has de seleccionar almenys un sector públic';
      }
    }

    if (step === 6) {
      // Team members are optional, but if added they need basic info
      formData.teamMembers.forEach((member, index) => {
        if (member.name && !member.position) {
          newErrors[`teamMember_${index}_position`] = 'El càrrec és obligatori si especifiques el nom';
        }
        if (member.position && !member.name) {
          newErrors[`teamMember_${index}_name`] = 'El nom és obligatori si especifiques el càrrec';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 8)); // 8 steps total
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
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    addCertification,
    updateCertification,
    removeCertification,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
  };
};