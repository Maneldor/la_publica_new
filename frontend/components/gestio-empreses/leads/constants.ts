// components/gestio-empreses/leads/constants.ts

export const SECTORS = [
  { value: '', label: 'Selecciona un sector...' },
  { value: 'TECHNOLOGY', label: 'Tecnologia' },
  { value: 'HEALTHCARE', label: 'Salut' },
  { value: 'FINANCE', label: 'Finances' },
  { value: 'RETAIL', label: 'Comerç' },
  { value: 'MANUFACTURING', label: 'Indústria' },
  { value: 'EDUCATION', label: 'Educació' },
  { value: 'HOSPITALITY', label: 'Hostaleria' },
  { value: 'CONSTRUCTION', label: 'Construcció' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'ENERGY', label: 'Energia' },
  { value: 'AGRICULTURE', label: 'Agricultura' },
  { value: 'REAL_ESTATE', label: 'Immobiliària' },
  { value: 'CONSULTING', label: 'Consultoria' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'MARKETING', label: 'Màrqueting' },
  { value: 'MEDIA', label: 'Mitjans' },
  { value: 'NONPROFIT', label: 'ONG' },
  { value: 'PUBLIC', label: 'Sector públic' },
  { value: 'OTHER', label: 'Altres' },
]

export const SOURCES = [
  { value: '', label: 'Selecciona la font...' },
  { value: 'WEBSITE', label: 'Formulari web' },
  { value: 'REFERRAL', label: 'Referit' },
  { value: 'COLD_CALL', label: 'Trucada freda' },
  { value: 'COLD_EMAIL', label: 'Email fred' },
  { value: 'EVENT', label: 'Esdeveniment' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'SOCIAL_MEDIA', label: 'Xarxes socials' },
  { value: 'PARTNER', label: 'Partner' },
  { value: 'ADVERTISING', label: 'Publicitat' },
  { value: 'AI_GENERATED', label: 'Generat per IA' },
  { value: 'OTHER', label: 'Altres' },
]

export const PRIORITIES = [
  { value: 'HIGH', label: 'Alta' },
  { value: 'MEDIUM', label: 'Mitjana' },
  { value: 'LOW', label: 'Baixa' },
]

export const EMPLOYEE_RANGES = [
  { value: '', label: 'Selecciona...' },
  { value: '1-10', label: '1-10 empleats' },
  { value: '11-25', label: '11-25 empleats' },
  { value: '26-50', label: '26-50 empleats' },
  { value: '51-100', label: '51-100 empleats' },
  { value: '101-250', label: '101-250 empleats' },
  { value: '251-500', label: '251-500 empleats' },
  { value: '500+', label: 'Més de 500' },
]