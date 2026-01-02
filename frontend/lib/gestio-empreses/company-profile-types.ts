// lib/gestio-empreses/company-profile-types.ts
// Tipus per al perfil d'empresa

export interface CompanyProfileData {
  id: string
  name: string
  cif: string | null
  email: string
  phone: string | null
  website: string | null
  sector: string | null
  description: string | null
  employeeCount: number | null
  foundingYear: number | null
  address: string | null
  status: string
  stage: string | null

  // Pla
  currentPlanId: string | null
  currentPlan: {
    id: string
    name: string
    nombreCorto: string
  } | null

  // Camps perfil empresa (Gestor)
  slogan: string | null
  logo: string | null
  coverImage: string | null

  // Contacte Admin
  adminContactPerson: string | null
  adminPhone: string | null
  adminEmail: string | null

  // Contacte públic
  contactEmail: string | null
  contactPhone: string | null
  contactPerson: string | null
  whatsappNumber: string | null
  workingHours: string | null

  // Info ampliada
  size: string | null
  services: string[]
  specializations: string[]
  collaborationType: string | null
  averageBudget: string | null

  // Branding
  gallery: string[]
  brandColors: { primary?: string; secondary?: string } | null
  socialMedia: { linkedin?: string; facebook?: string; twitter?: string; instagram?: string } | null
  certifications: string[] | null

  // Completitud
  profileCompleteness: number
  profileCompletedAt: Date | null

  // Gestor
  accountManagerId: string | null
  accountManager: { id: string; name: string | null } | null

  createdAt: Date
  updatedAt: Date
}

export interface UpdateCompanyProfileInput {
  // Obligatoris
  slogan?: string
  logo?: string
  coverImage?: string
  adminContactPerson?: string
  adminPhone?: string
  adminEmail?: string

  // Opcionals
  description?: string
  contactEmail?: string
  contactPhone?: string
  contactPerson?: string
  whatsappNumber?: string
  workingHours?: string
  size?: string
  foundingYear?: number
  services?: string[]
  specializations?: string[]
  collaborationType?: string
  averageBudget?: string
  gallery?: string[]
  brandColors?: { primary?: string; secondary?: string }
  socialMedia?: { linkedin?: string; facebook?: string; twitter?: string; instagram?: string }
  certifications?: string[]
}
