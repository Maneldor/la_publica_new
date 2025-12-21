'use client'

import { useState, useEffect, useCallback } from 'react'

// Types
interface UserProfile {
  bio?: string
  headline?: string
  birthDate?: string
  city?: string
  province?: string
  country?: string
  organization?: string
  department?: string
  position?: string
  yearsInPublicSector?: number
  website?: string
  publicEmail?: string
  phone?: string
  isPublic?: boolean
  showEmail?: boolean
  showPhone?: boolean
  showBirthDate?: boolean
}

interface Education {
  id?: string
  institution: string
  degree: string
  field?: string
  startDate?: string
  endDate?: string
  isCurrent: boolean
  description?: string
}

interface Experience {
  id?: string
  organization: string
  position: string
  department?: string
  location?: string
  startDate?: string
  endDate?: string
  isCurrent: boolean
  description?: string
  employmentType?: string
}

interface Skill {
  id?: string
  name: string
  category?: string
  level?: number
}

interface Language {
  id?: string
  language: string
  level: string
  certification?: string
}

interface SocialLink {
  id?: string
  platform: string
  url: string
  username?: string
}

interface UserBasic {
  id: string
  nick?: string
  firstName?: string
  lastName?: string
  secondLastName?: string
  email?: string
  administration?: string
  displayPreference?: string
  image?: string
  coverColor?: string
}

interface ProfileData {
  user: UserBasic
  profile: UserProfile
  education: Education[]
  experiences: Experience[]
  skills: Skill[]
  languages: Language[]
  socialLinks: SocialLink[]
}

interface Completeness {
  percentage: number
  level: 'low' | 'medium' | 'high'
  pending: { key: string; name: string }[]
}

export function useProfileData() {
  const [data, setData] = useState<ProfileData>({
    user: { id: '' },
    profile: {},
    education: [],
    experiences: [],
    skills: [],
    languages: [],
    socialLinks: [],
  })
  const [completeness, setCompleteness] = useState<Completeness | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos iniciales
  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const userData = await res.json()
        setData({
          user: {
            id: userData.id || '',
            nick: userData.nick,
            firstName: userData.firstName,
            lastName: userData.lastName,
            secondLastName: userData.secondLastName,
            email: userData.email,
            administration: userData.administration,
            displayPreference: userData.displayPreference,
            image: userData.image,
            coverColor: userData.coverColor,
          },
          profile: userData.profile || {},
          education: userData.education || [],
          experiences: userData.experiences || [],
          skills: userData.skills || [],
          languages: userData.languages || [],
          socialLinks: userData.socialLinks || [],
        })
      }
    } catch (error) {
      console.error('Error carregant perfil:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar completitud
  const loadCompleteness = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/completeness')
      if (res.ok) {
        const data = await res.json()
        setCompleteness(data)
      }
    } catch (error) {
      console.error('Error carregant completitud:', error)
    }
  }, [])

  useEffect(() => {
    loadProfile()
    loadCompleteness()
  }, [loadProfile, loadCompleteness])

  // ==================== PROFILE ====================
  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const updated = await res.json()
        setData(prev => ({ ...prev, profile: updated }))
        await loadCompleteness()
        return true
      }
      return false
    } catch (error) {
      console.error('Error actualitzant perfil:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // ==================== EDUCATION ====================
  const addEducation = async (education: Omit<Education, 'id'>) => {
    try {
      const res = await fetch('/api/profile/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(education),
      })
      if (res.ok) {
        const newItem = await res.json()
        setData(prev => ({ ...prev, education: [...prev.education, newItem] }))
        await loadCompleteness()
        return newItem
      }
    } catch (error) {
      console.error('Error afegint educació:', error)
    }
    return null
  }

  const updateEducation = async (id: string, updates: Partial<Education>) => {
    try {
      const res = await fetch(`/api/profile/education/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const updated = await res.json()
        setData(prev => ({
          ...prev,
          education: prev.education.map(e => e.id === id ? updated : e),
        }))
        return true
      }
    } catch (error) {
      console.error('Error actualitzant educació:', error)
    }
    return false
  }

  const deleteEducation = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/education/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData(prev => ({
          ...prev,
          education: prev.education.filter(e => e.id !== id),
        }))
        await loadCompleteness()
        return true
      }
    } catch (error) {
      console.error('Error eliminant educació:', error)
    }
    return false
  }

  // ==================== EXPERIENCE ====================
  const addExperience = async (experience: Omit<Experience, 'id'>) => {
    try {
      const res = await fetch('/api/profile/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experience),
      })
      if (res.ok) {
        const newItem = await res.json()
        setData(prev => ({ ...prev, experiences: [...prev.experiences, newItem] }))
        await loadCompleteness()
        return newItem
      }
    } catch (error) {
      console.error('Error afegint experiència:', error)
    }
    return null
  }

  const updateExperience = async (id: string, updates: Partial<Experience>) => {
    try {
      const res = await fetch(`/api/profile/experience/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const updated = await res.json()
        setData(prev => ({
          ...prev,
          experiences: prev.experiences.map(e => e.id === id ? updated : e),
        }))
        return true
      }
    } catch (error) {
      console.error('Error actualitzant experiència:', error)
    }
    return false
  }

  const deleteExperience = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/experience/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData(prev => ({
          ...prev,
          experiences: prev.experiences.filter(e => e.id !== id),
        }))
        await loadCompleteness()
        return true
      }
    } catch (error) {
      console.error('Error eliminant experiència:', error)
    }
    return false
  }

  // ==================== SKILLS ====================
  const addSkill = async (skill: Omit<Skill, 'id'>) => {
    try {
      const res = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
      })
      if (res.ok) {
        const newItem = await res.json()
        setData(prev => ({ ...prev, skills: [...prev.skills, newItem] }))
        await loadCompleteness()
        return newItem
      }
    } catch (error) {
      console.error('Error afegint habilitat:', error)
    }
    return null
  }

  const deleteSkill = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/skills/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData(prev => ({
          ...prev,
          skills: prev.skills.filter(s => s.id !== id),
        }))
        await loadCompleteness()
        return true
      }
    } catch (error) {
      console.error('Error eliminant habilitat:', error)
    }
    return false
  }

  // ==================== LANGUAGES ====================
  const addLanguage = async (language: Omit<Language, 'id'>) => {
    try {
      const res = await fetch('/api/profile/languages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(language),
      })
      if (res.ok) {
        const newItem = await res.json()
        setData(prev => ({ ...prev, languages: [...prev.languages, newItem] }))
        await loadCompleteness()
        return newItem
      }
    } catch (error) {
      console.error('Error afegint idioma:', error)
    }
    return null
  }

  const deleteLanguage = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/languages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData(prev => ({
          ...prev,
          languages: prev.languages.filter(l => l.id !== id),
        }))
        await loadCompleteness()
        return true
      }
    } catch (error) {
      console.error('Error eliminant idioma:', error)
    }
    return false
  }

  // ==================== SOCIAL LINKS ====================
  const addSocialLink = async (link: Omit<SocialLink, 'id'>) => {
    try {
      const res = await fetch('/api/profile/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link),
      })
      if (res.ok) {
        const newItem = await res.json()
        setData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, newItem] }))
        await loadCompleteness()
        return newItem
      }
    } catch (error) {
      console.error('Error afegint xarxa social:', error)
    }
    return null
  }

  const deleteSocialLink = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/social/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setData(prev => ({
          ...prev,
          socialLinks: prev.socialLinks.filter(s => s.id !== id),
        }))
        await loadCompleteness()
        return true
      }
    } catch (error) {
      console.error('Error eliminant xarxa social:', error)
    }
    return false
  }

  // ==================== VALIDACIÓN ====================
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Básico - siempre puede continuar
        return true
      case 2: // Personal - al menos bio o headline
        return !!(data.profile.bio || data.profile.headline)
      case 3: // Social - siempre puede continuar
        return true
      case 4: // Educación - siempre puede continuar
        return true
      case 5: // Experiencia - siempre puede continuar
        return true
      case 6: // Habilidades - al menos 1
        return data.skills.length > 0
      case 7: // Idiomas - al menos 1
        return data.languages.length > 0
      case 8: // Revisión - siempre puede finalizar
        return true
      default:
        return true
    }
  }

  return {
    // Estado
    data,
    completeness,
    isLoading,
    isSaving,
    errors,
    
    // Profile
    updateProfile,
    
    // Education
    addEducation,
    updateEducation,
    deleteEducation,
    
    // Experience
    addExperience,
    updateExperience,
    deleteExperience,
    
    // Skills
    addSkill,
    deleteSkill,
    
    // Languages
    addLanguage,
    deleteLanguage,
    
    // Social
    addSocialLink,
    deleteSocialLink,
    
    // Validación
    validateStep,
    
    // Utilidades
    reload: loadProfile,
    reloadCompleteness: loadCompleteness,
  }
}