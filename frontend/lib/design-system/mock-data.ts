// Mock data for Design System previews

export const mockCompanyData = {
  id: 'mock-company-1',
  name: 'Tech Solutions Barcelona',
  slug: 'tech-solutions-barcelona',
  logo: '/images/placeholder-logo.png',
  coverImage: '/images/placeholder-cover.jpg',
  sector: 'TECHNOLOGY',
  slogan: 'Transformacio digital per al sector public',
  description: 'Som una empresa especialitzada en solucions tecnologiques per a l\'administracio publica. Oferim serveis de consultoria, desenvolupament i formacio.',
  city: 'Barcelona',
  province: 'Barcelona',
  address: 'Carrer Aragó, 123',
  postalCode: '08015',
  phone: '+34 93 123 45 67',
  email: 'info@techsolutions.cat',
  website: 'https://techsolutions.cat',
  rating: 4.5,
  reviewsCount: 28,
  plan: {
    name: 'Enterprise',
    tier: 'ENTERPRISE',
    color: '#F59E0B',
  },
  isVerified: true,
  isPublished: true,
  employeeCount: 50,
  foundedYear: 2015,
  socialLinks: {
    linkedin: 'https://linkedin.com/company/techsolutions',
    twitter: 'https://twitter.com/techsolutions',
  },
  tags: ['Transformacio Digital', 'Cloud', 'IA', 'Big Data'],
  services: [
    'Consultoria tecnologica',
    'Desenvolupament de software',
    'Integracio de sistemes',
    'Formacio i capacitacio',
  ],
}

export const mockOfferData = {
  id: 'mock-offer-1',
  title: '20% de descompte en serveis IT',
  description: 'Oferta especial per a empleats publics. Inclou assessorament gratuit i suport prioritari durant 3 mesos.',
  shortDescription: 'Descompte exclusiu en serveis tecnologics',
  discount: '20%',
  discountType: 'PERCENTAGE',
  discountValue: 20,
  originalPrice: 1000,
  finalPrice: 800,
  validFrom: '2025-01-01',
  validUntil: '2025-03-31',
  isActive: true,
  isFeatured: true,
  category: 'SERVICES',
  conditions: [
    'Vàlid per a nous clients',
    'Mínim 3 mesos de contracte',
    'No acumulable amb altres ofertes',
  ],
  company: {
    id: 'mock-company-1',
    name: 'Tech Solutions Barcelona',
    logo: '/images/placeholder-logo.png',
    sector: 'TECHNOLOGY',
  },
  redemptionCount: 45,
  viewCount: 230,
}

export const mockUserData = {
  id: 'mock-user-1',
  name: 'Maria Garcia',
  email: 'maria.garcia@ajuntament.cat',
  image: '/images/placeholder-avatar.png',
  role: 'USER',
  userType: 'EMPLOYEE',
  department: 'Serveis Informatics',
  administration: 'LOCAL',
  city: 'Barcelona',
}

export const mockStatsData = {
  totalCompanies: 245,
  totalOffers: 89,
  totalUsers: 1234,
  activeOffers: 67,
  newThisMonth: 12,
  conversionRate: 8.5,
}

// Sample design tokens for previews
export const sampleColorTokens = [
  { name: 'primary', value: '#1E3A5F', description: 'Color principal' },
  { name: 'primary-light', value: '#2E5A8F', description: 'Primary clar' },
  { name: 'primary-dark', value: '#0E2A4F', description: 'Primary fosc' },
  { name: 'secondary', value: '#2E7D32', description: 'Color secundari' },
  { name: 'accent', value: '#FF6B35', description: 'Color d\'accent' },
  { name: 'success', value: '#10B981', description: 'Exit' },
  { name: 'warning', value: '#F59E0B', description: 'Avis' },
  { name: 'error', value: '#EF4444', description: 'Error' },
  { name: 'info', value: '#3B82F6', description: 'Informacio' },
]

export const sampleTypographyTokens = [
  { name: 'h1', fontSize: '2.25rem', fontWeight: '700', lineHeight: '2.5rem', sample: 'Titol Principal' },
  { name: 'h2', fontSize: '1.875rem', fontWeight: '600', lineHeight: '2.25rem', sample: 'Titol Seccio' },
  { name: 'h3', fontSize: '1.5rem', fontWeight: '600', lineHeight: '2rem', sample: 'Subtitol' },
  { name: 'h4', fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.75rem', sample: 'Titol Petit' },
  { name: 'body', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5rem', sample: 'Text de cos normal amb informacio general.' },
  { name: 'body-sm', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.25rem', sample: 'Text petit per detalls.' },
  { name: 'caption', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1rem', sample: 'Text de llegenda o peu' },
]

export const sampleShadowTokens = [
  { name: 'shadow-sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  { name: 'shadow', value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
  { name: 'shadow-md', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
  { name: 'shadow-lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
  { name: 'shadow-xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
]

export const sampleRadiusTokens = [
  { name: 'radius-sm', value: '0.125rem' },
  { name: 'radius', value: '0.25rem' },
  { name: 'radius-md', value: '0.375rem' },
  { name: 'radius-lg', value: '0.5rem' },
  { name: 'radius-xl', value: '0.75rem' },
  { name: 'radius-2xl', value: '1rem' },
  { name: 'radius-full', value: '9999px' },
]

export const sampleSpacingTokens = [
  { name: '1', value: '0.25rem', px: '4px' },
  { name: '2', value: '0.5rem', px: '8px' },
  { name: '3', value: '0.75rem', px: '12px' },
  { name: '4', value: '1rem', px: '16px' },
  { name: '5', value: '1.25rem', px: '20px' },
  { name: '6', value: '1.5rem', px: '24px' },
  { name: '8', value: '2rem', px: '32px' },
  { name: '10', value: '2.5rem', px: '40px' },
  { name: '12', value: '3rem', px: '48px' },
]
