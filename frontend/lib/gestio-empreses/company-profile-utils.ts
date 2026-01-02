// lib/gestio-empreses/company-profile-utils.ts
// Funcions d'utilitat per al perfil d'empresa (no server actions)

import type { CompanyProfileData } from './company-profile-types'

/**
 * Calcula el percentatge de completitud del perfil
 */
export function calculateProfileCompleteness(company: Partial<CompanyProfileData>): number {
  // Camps obligatoris (60% del total)
  const requiredFields = [
    { field: 'slogan', weight: 10 },
    { field: 'logo', weight: 10 },
    { field: 'coverImage', weight: 10 },
    { field: 'adminContactPerson', weight: 10 },
    { field: 'adminPhone', weight: 10 },
    { field: 'adminEmail', weight: 10 },
  ]

  // Camps opcionals (40% del total)
  const optionalFields = [
    { field: 'description', weight: 5 },
    { field: 'contactEmail', weight: 3 },
    { field: 'contactPhone', weight: 3 },
    { field: 'whatsappNumber', weight: 3 },
    { field: 'workingHours', weight: 3 },
    { field: 'size', weight: 3 },
    { field: 'foundingYear', weight: 3 },
    { field: 'services', weight: 5, isArray: true },
    { field: 'specializations', weight: 3, isArray: true },
    { field: 'gallery', weight: 5, isArray: true },
    { field: 'socialMedia', weight: 4, isObject: true },
  ]

  let score = 0

  // Calcular obligatoris
  for (const { field, weight } of requiredFields) {
    const value = (company as any)[field]
    if (value && value.toString().trim()) {
      score += weight
    }
  }

  // Calcular opcionals
  for (const { field, weight, isArray, isObject } of optionalFields) {
    const value = (company as any)[field]
    if (isArray) {
      if (Array.isArray(value) && value.length > 0) {
        score += weight
      }
    } else if (isObject) {
      if (value && typeof value === 'object' && Object.values(value).some(v => v)) {
        score += weight
      }
    } else if (value && value.toString().trim()) {
      score += weight
    }
  }

  return Math.min(100, Math.round(score))
}

/**
 * Retorna els camps obligatoris que falten
 */
export function getMissingRequiredFields(company: Partial<CompanyProfileData>): string[] {
  const requiredFields = [
    { field: 'slogan', label: 'Eslògan' },
    { field: 'logo', label: 'Logo' },
    { field: 'coverImage', label: 'Imatge portada' },
    { field: 'adminContactPerson', label: 'Persona contacte admin' },
    { field: 'adminPhone', label: 'Telèfon admin' },
    { field: 'adminEmail', label: 'Email admin' },
  ]

  const missing: string[] = []
  for (const { field, label } of requiredFields) {
    const value = (company as any)[field]
    if (!value || !value.toString().trim()) {
      missing.push(label)
    }
  }

  return missing
}
