// =============================================================================
// TYPES I INTERFÍCIES PER EMPRESA AMB NOVA ESTRUCTURA
// =============================================================================

export interface CompanyData {
  // ===== DADES BÀSIQUES (Només Admin) =====
  id: string;
  name: string;
  cif: string;
  email: string;
  currentPlanId?: string;
  status: CompanyStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // ===== DADES OBLIGATÒRIES =====
  slogan?: string; // Eslògan de l'empresa (OBLIGATORI)
  description?: string; // Descripció (OBLIGATORI)
  logo?: string; // Logo corporatiu (OBLIGATORI)
  coverImage?: string; // Imatge de portada (OBLIGATORI)

  // ===== CONTACTE ADMINISTRATIU (Privat - No públic) =====
  adminContactPerson?: string; // Persona contacte admin
  adminPhone?: string; // Telèfon contacte admin
  adminEmail?: string; // Email contacte admin
  companyPhone?: string; // Telèfon empresa (diferent del públic)
  companyEmail?: string; // Email empresa (diferent del públic)

  // ===== CONTACTE PÚBLIC =====
  phone?: string; // Telèfon actual (mantenim compatibilitat)
  address?: string; // Adreça actual (mantenim compatibilitat)
  website?: string; // Web actual (mantenim compatibilitat)
  publicPhone?: string; // Telèfon públic
  publicEmail?: string; // Email públic
  contactPerson?: string; // Persona de contacte pública
  whatsappNumber?: string; // Número WhatsApp
  workingHours?: string; // Horari d'atenció

  // ===== INFORMACIÓ AMPLIADA =====
  sector?: string; // Sector d'activitat
  yearEstablished?: number; // Any de fundació
  employeeCount?: string; // Nombre d'empleats
  location?: string; // Localització

  // ===== BRANDING I VISUAL =====
  gallery?: string[]; // Galeria d'imatges
  brandColors?: BrandColors; // Colors corporatius

  // ===== SERVEIS I CAPACITATS =====
  services?: string[]; // Serveis oferits
  specializations?: string[]; // Especialitzacions
  collaborationType?: string; // Tipus de col·laboració
  averageBudget?: string; // Pressupost mitjà

  // ===== XARXES SOCIALS =====
  socialMediaLinkedIn?: string; // LinkedIn
  socialMediaFacebook?: string; // Facebook
  socialMediaInstagram?: string; // Instagram
  socialMediaTwitter?: string; // Twitter/X

  // ===== CERTIFICACIONS =====
  certifications?: Certification[]; // Certificacions

  // ===== DADES DE RENDIMENT =====
  projectsCompleted?: number; // Projectes completats
  activeClients?: number; // Clients actius
  rating?: number; // Valoració (1-5)
  reviewsCount?: number; // Nombre de ressenyes

  // ===== EQUIP =====
  teamMembersData?: TeamMember[]; // Membres de l'equip
  keyPersonnel?: KeyPersonnel[]; // Personal clau

  // ===== RELACIONS =====
  currentPlan?: {
    id: string;
    name: string;
    tier: string;
    badge?: string;
    badgeColor?: string;
  };
  owner?: {
    id: string;
    email: string;
    name?: string;
    password?: string; // Només per admin i empresa PENDING
  };
  subscription?: {
    status: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
}

// =============================================================================
// INTERFÍCIES AUXILIARS
// =============================================================================

export interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  image?: string;
  bio?: string;
}

export interface KeyPersonnel {
  id: string;
  name: string;
  position: string;
  department?: string;
  email?: string;
  phone?: string;
  image?: string;
}

// =============================================================================
// ENUMS I CONSTANTS
// =============================================================================

export enum CompanyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED', // Empresa aprovada però perfil incomplet
  PUBLISHED = 'PUBLISHED', // Empresa publicada amb perfil complet
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE'
}

export const EMPLOYEE_COUNT_OPTIONS = [
  '1-10',
  '10-50',
  '50-200',
  '200-500',
  '500+'
] as const;

export const COLLABORATION_TYPE_OPTIONS = [
  'Serveis puntuals',
  'Col·laboració continuada',
  'Projectes a llarg termini',
  'Consultoria',
  'Outsourcing',
  'Híbrid'
] as const;

export const AVERAGE_BUDGET_OPTIONS = [
  'Menys de 1.000€',
  '1.000€ - 5.000€',
  '5.000€ - 15.000€',
  '15.000€ - 50.000€',
  'Més de 50.000€'
] as const;

// =============================================================================
// VALIDATORS DE CAMPS OBLIGATORIS
// =============================================================================

export const REQUIRED_FIELDS = [
  'slogan',
  'description',
  'logo',
  'coverImage'
] as const;

export const isCompanyPublishable = (company: Partial<CompanyData>): boolean => {
  const hasRequiredFields = REQUIRED_FIELDS.every(field =>
    company[field] && company[field]?.toString().trim() !== ''
  );

  const hasValidDescription = company.description &&
    company.description.length >= 50;

  return hasRequiredFields && hasValidDescription;
};

export const getCompanyCompletionPercentage = (company: Partial<CompanyData>): number => {
  const allFields = [
    // Obligatoris (pesen més)
    ...REQUIRED_FIELDS.map(field => ({ field, weight: 3 })),

    // Recomanats (pesen menys)
    { field: 'contactPerson', weight: 2 },
    { field: 'publicPhone', weight: 2 },
    { field: 'website', weight: 2 },
    { field: 'address', weight: 2 },
    { field: 'sector', weight: 2 },
    { field: 'services', weight: 2 },

    // Opcionals (pesen poc)
    { field: 'yearEstablished', weight: 1 },
    { field: 'employeeCount', weight: 1 },
    { field: 'socialMediaLinkedIn', weight: 1 },
    { field: 'certifications', weight: 1 }
  ];

  const totalWeight = allFields.reduce((sum, { weight }) => sum + weight, 0);
  const completedWeight = allFields.reduce((sum, { field, weight }) => {
    const value = company[field as keyof CompanyData];
    const isCompleted = value && (
      Array.isArray(value) ? value.length > 0 :
      value.toString().trim() !== ''
    );
    return isCompleted ? sum + weight : sum;
  }, 0);

  return Math.round((completedWeight / totalWeight) * 100);
};

// =============================================================================
// UTILITATS PER CATEGORITZACIÓ
// =============================================================================

export const getFieldCategory = (fieldName: string): 'basic' | 'required' | 'optional' => {
  if (['name', 'cif', 'email', 'currentPlanId', 'status'].includes(fieldName)) {
    return 'basic';
  }
  if (REQUIRED_FIELDS.includes(fieldName as any)) {
    return 'required';
  }
  return 'optional';
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'basic': return 'blue';
    case 'required': return 'red';
    case 'optional': return 'amber';
    default: return 'gray';
  }
};

export const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'basic': return 'Dades Bàsiques';
    case 'required': return 'Dades Obligatòries';
    case 'optional': return 'Dades Suggerides';
    default: return 'Altres';
  }
};