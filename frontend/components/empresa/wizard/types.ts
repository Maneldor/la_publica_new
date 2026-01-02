export interface EmpresaFormData {
  // Step 1: Branding
  logo: string | null;
  coverImage: string | null;
  brandColor: string;

  // Step 2: Informacio basica
  name: string;
  cif: string;
  sector: string;
  description: string;
  founded: string;
  size: string;

  // Step 3: Contacte
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;

  // Step 4: Xarxes socials
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;

  // Step 5: Serveis
  services: string[];
  specializations: string[];

  // Step 6: Certificacions
  certifications: Certification[];

  // Step 7: Equip
  teamMembers: TeamMember[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  documentUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  image?: string;
  linkedin?: string;
}

export interface EmpresaWizardProps {
  formData: EmpresaFormData;
  errors: Record<string, string>;
  updateField: (field: keyof EmpresaFormData, value: any) => void;
}

export interface CertificationStepProps extends EmpresaWizardProps {
  addCertification: () => void;
  updateCertification: (id: string, field: keyof Certification, value: string) => void;
  removeCertification: (id: string) => void;
}

export interface TeamStepProps extends EmpresaWizardProps {
  addTeamMember: () => void;
  updateTeamMember: (id: string, field: keyof TeamMember, value: string) => void;
  removeTeamMember: (id: string) => void;
}

export const initialEmpresaFormData: EmpresaFormData = {
  logo: null,
  coverImage: null,
  brandColor: '#3B82F6',
  name: '',
  cif: '',
  sector: '',
  description: '',
  founded: '',
  size: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  postalCode: '',
  province: '',
  linkedin: '',
  twitter: '',
  instagram: '',
  facebook: '',
  services: [],
  specializations: [],
  certifications: [],
  teamMembers: [],
};

export const SECTORS = [
  { value: '', label: 'Selecciona un sector' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'salut', label: 'Salut' },
  { value: 'educacio', label: 'Educacio' },
  { value: 'construccio', label: 'Construccio' },
  { value: 'alimentacio', label: 'Alimentacio' },
  { value: 'serveis', label: 'Serveis' },
  { value: 'comerc', label: 'Comerc' },
  { value: 'turisme', label: 'Turisme' },
  { value: 'transport', label: 'Transport i Logistica' },
  { value: 'finances', label: 'Finances i Assegurances' },
  { value: 'agricultura', label: 'Agricultura' },
  { value: 'energia', label: 'Energia' },
  { value: 'comunicacio', label: 'Comunicacio i Mitjans' },
  { value: 'industria', label: 'Industria' },
  { value: 'altres', label: 'Altres' },
];

export const COMPANY_SIZES = [
  { value: '', label: 'Selecciona mida' },
  { value: '1-10', label: '1-10 empleats' },
  { value: '11-50', label: '11-50 empleats' },
  { value: '51-200', label: '51-200 empleats' },
  { value: '201-500', label: '201-500 empleats' },
  { value: '500+', label: 'Mes de 500 empleats' },
];

export const PROVINCES = [
  { value: '', label: 'Selecciona provincia' },
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'girona', label: 'Girona' },
  { value: 'lleida', label: 'Lleida' },
  { value: 'tarragona', label: 'Tarragona' },
];
