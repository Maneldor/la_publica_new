'use client';

import { useState } from 'react';

export interface Education {
  id: string;
  title: string;
  institution: string;
  specialization: string;
  startYear: string;
  endYear: string;
}

export interface Experience {
  id: string;
  position: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string; // "Present" if current
}

export interface Language {
  id: string;
  name: string;
  level: string; // "Natiu", "Avançat (C1)", "Intermedi (B2)", etc.
}

export interface SocialNetworks {
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

export interface ProfileFormData {
  // Step 1 - Imatges i Bàsic
  coverImage: File | null;
  coverImageUrl?: string;
  profileImage: File | null;
  profileImageUrl?: string;
  fullName: string;
  username: string;
  profileType: string; // "Local", "Autonòmica", "Central"
  registrationDate: string; // Automàtic, només mostrar

  // Step 2 - Informació Personal
  bio: string;
  birthDate: string;
  location: string; // "Barcelona, Catalunya"
  currentJob: string; // "Tècnic en Transformació Digital a Ajuntament de Barcelona"
  personalWebsite: string;

  // Step 3 - Xarxes Socials
  socialNetworks: SocialNetworks;

  // Step 4 - Formació Acadèmica
  education: Education[];

  // Step 5 - Experiència Professional
  experience: Experience[];

  // Step 6 - Habilitats i Interessos
  skills: string[]; // Tags azules
  interests: string[]; // Tags verdes

  // Step 7 - Idiomes
  languages: Language[];
}

const initialFormData: ProfileFormData = {
  // Step 1
  coverImage: null,
  profileImage: null,
  fullName: '',
  username: '',
  profileType: 'Local',
  registrationDate: new Date().toISOString().split('T')[0],

  // Step 2
  bio: '',
  birthDate: '',
  location: '',
  currentJob: '',
  personalWebsite: '',

  // Step 3
  socialNetworks: {},

  // Step 4
  education: [],

  // Step 5
  experience: [],

  // Step 6
  skills: [],
  interests: [],

  // Step 7
  languages: [],
};

export const useProfileWizard = (initialData?: Partial<ProfileFormData>) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileFormData>(() => ({
    ...initialFormData,
    ...initialData
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof ProfileFormData, value: any) => {
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

  // Education methods
  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      title: '',
      institution: '',
      specialization: '',
      startYear: '',
      endYear: '',
    };
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Experience methods
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      position: '',
      company: '',
      description: '',
      startDate: '',
      endDate: '',
    };
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  // Language methods
  const addLanguage = () => {
    const newLanguage: Language = {
      id: Date.now().toString(),
      name: '',
      level: '',
    };
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, newLanguage]
    }));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const removeLanguage = (id: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  // Skills and interests methods
  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'El nom complet és obligatori';
      if (formData.fullName.length < 3) newErrors.fullName = 'El nom ha de tenir mínim 3 caràcters';
      if (!formData.username.trim()) newErrors.username = 'El nom d\'usuari és obligatori';
      if (formData.username.length < 3) newErrors.username = 'El nom d\'usuari ha de tenir mínim 3 caràcters';
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'El nom d\'usuari només pot contenir lletres, números i guions baixos';
      }
    }

    if (step === 2) {
      if (!formData.bio.trim()) newErrors.bio = 'La descripció és obligatòria';
      if (formData.bio.length < 50) newErrors.bio = 'La descripció ha de tenir mínim 50 caràcters';
      if (!formData.location.trim()) newErrors.location = 'La ubicació és obligatòria';
      if (!formData.currentJob.trim()) newErrors.currentJob = 'El treball actual és obligatori';

      if (formData.personalWebsite && !formData.personalWebsite.startsWith('http')) {
        newErrors.personalWebsite = 'El lloc web ha de començar amb http:// o https://';
      }
    }

    if (step === 3) {
      // Social networks validation is optional but format checks
      const { twitter, linkedin, instagram } = formData.socialNetworks;

      if (twitter && twitter.startsWith('@')) {
        newErrors.twitter = 'No incloguis el símbol @ al nom d\'usuari de Twitter';
      }

      if (instagram && instagram.startsWith('@')) {
        newErrors.instagram = 'No incloguis el símbol @ al nom d\'usuari d\'Instagram';
      }
    }

    if (step === 4) {
      // Education validation - at least basic info if any education is added
      formData.education.forEach((edu, index) => {
        if (edu.title && !edu.institution) {
          newErrors[`education_${index}_institution`] = 'La institució és obligatòria';
        }
        if (edu.institution && !edu.title) {
          newErrors[`education_${index}_title`] = 'El títol és obligatori';
        }
        if (edu.startYear && edu.endYear && edu.startYear > edu.endYear) {
          newErrors[`education_${index}_years`] = 'L\'any d\'inici ha de ser anterior a l\'any de fi';
        }
      });
    }

    if (step === 5) {
      // Experience validation - at least basic info if any experience is added
      formData.experience.forEach((exp, index) => {
        if (exp.position && !exp.company) {
          newErrors[`experience_${index}_company`] = 'L\'organització és obligatòria';
        }
        if (exp.company && !exp.position) {
          newErrors[`experience_${index}_position`] = 'El càrrec és obligatori';
        }
      });
    }

    if (step === 7) {
      // Language validation
      formData.languages.forEach((lang, index) => {
        if (lang.name && !lang.level) {
          newErrors[`language_${index}_level`] = 'El nivell és obligatori';
        }
        if (lang.level && !lang.name) {
          newErrors[`language_${index}_name`] = 'L\'idioma és obligatori';
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

  // Load existing profile data
  const loadProfileData = (profileData: Partial<ProfileFormData>) => {
    setFormData(prev => ({ ...prev, ...profileData }));
  };

  return {
    currentStep,
    formData,
    errors,
    updateField,
    addEducation,
    updateEducation,
    removeEducation,
    addExperience,
    updateExperience,
    removeExperience,
    addLanguage,
    updateLanguage,
    removeLanguage,
    addSkill,
    removeSkill,
    addInterest,
    removeInterest,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    loadProfileData,
  };
};