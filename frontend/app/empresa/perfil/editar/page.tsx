'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Image,
  Info,
  Phone,
  Share2,
  Briefcase,
  Award,
  Users,
  CheckCircle,
  Loader2,
  Send,
  AlertTriangle,
  Clock
} from 'lucide-react';
import SimpleWizard from '@/components/wizard/SimpleWizard';
import {
  Step1Branding,
  Step2BasicInfo,
  Step3Contact,
  Step4Social,
  Step5Services,
  Step6Certifications,
  Step7Team,
  Step8Review,
} from '@/components/empresa/wizard/steps';
import {
  EmpresaFormData,
  Certification,
  TeamMember,
  initialEmpresaFormData,
} from '@/components/empresa/wizard/types';

// Mapeo de sectores legacy (de leads) a categorías centralizadas
const SECTOR_MAPPING: Record<string, string> = {
  'TECHNOLOGY': 'tecnologia',
  'SERVICES': 'serveis',
  'RETAIL': 'llar', // Comerç -> más cercano a llar
  'MANUFACTURING': 'serveis', // Indústria
  'CONSTRUCTION': 'llar',
  'HOSPITALITY': 'gastronomia',
  'HEALTH': 'salut',
  'EDUCATION': 'educacio',
  'FINANCE': 'serveis',
  'LOGISTICS': 'automocio',
  'MARKETING': 'serveis',
  'CONSULTING': 'serveis',
  'OTHER': 'serveis',
  // También mapear versiones en catalán del lead/nou
  'Tecnologia': 'tecnologia',
  'Serveis': 'serveis',
  'Comerç': 'llar',
  'Indústria': 'serveis',
  'Construcció': 'llar',
  'Hostaleria': 'gastronomia',
  'Salut': 'salut',
  'Educació': 'educacio',
  'Finances': 'serveis',
  'Immobiliari': 'llar',
  'Transport': 'automocio',
  'Agricultura': 'sostenibilitat',
  'Energia': 'sostenibilitat',
  'Altres': 'serveis',
};

// Función para normalizar el sector
const normalizeSector = (sector: string | null | undefined): string => {
  if (!sector) return '';
  // Si ya es un valor de categoría válido, retornarlo
  const validCategories = ['tecnologia', 'viatges', 'gastronomia', 'salut', 'esport', 'moda', 'llar', 'automocio', 'educacio', 'serveis', 'cultura', 'familia', 'mascotes', 'sostenibilitat', 'marques'];
  if (validCategories.includes(sector.toLowerCase())) {
    return sector.toLowerCase();
  }
  // Si es un valor legacy, mapearlo
  return SECTOR_MAPPING[sector] || sector;
};

export default function EditarPerfilEmpresaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EmpresaFormData>(initialEmpresaFormData);
  const [originalData, setOriginalData] = useState<EmpresaFormData>(initialEmpresaFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [pendingChangesInfo, setPendingChangesInfo] = useState<any>(null);

  // Cargar datos de la empresa actual
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const response = await fetch('/api/empresa/perfil');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const companyData: EmpresaFormData = {
              ...initialEmpresaFormData,
              logo: data.data.logo || null,
              coverImage: data.data.coverImage || null,
              brandColor: data.data.configuration?.brandColor || '#3B82F6',
              name: data.data.name || '',
              cif: data.data.cif || '',
              sector: normalizeSector(data.data.sector),
              description: data.data.description || '',
              founded: data.data.foundingYear?.toString() || '',
              size: data.data.size || '',
              email: data.data.email || '',
              phone: data.data.phone || '',
              website: data.data.website || '',
              address: data.data.address || '',
              city: data.data.city || '',
              postalCode: data.data.configuration?.postalCode || '',
              province: data.data.configuration?.province || '',
              linkedin: data.data.socialLinks?.linkedin || '',
              twitter: data.data.socialLinks?.twitter || '',
              instagram: data.data.socialLinks?.instagram || '',
              facebook: data.data.socialLinks?.facebook || '',
              services: data.data.tags || [],
              specializations: data.data.configuration?.specializations || [],
              certifications: Array.isArray(data.data.certifications) ? data.data.certifications : [],
              teamMembers: data.data.configuration?.teamMembers || [],
            };

            console.log('FormData sector:', companyData.sector);

            setFormData(companyData);
            setOriginalData(companyData);

            // Verificar si hi ha canvis pendents
            if (data.data.hasPendingChanges) {
              setHasPendingChanges(true);
              setPendingChangesInfo(data.data.pendingChanges);
            }
          }
        }
      } catch (error) {
        console.error('Error carregant dades:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadCompanyData();
  }, []);

  const updateField = (field: keyof EmpresaFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 8));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 2: // Basic Info
        if (!formData.name?.trim()) newErrors.name = 'El nom es obligatori';
        if (!formData.cif?.trim()) newErrors.cif = 'El CIF es obligatori';
        if (!formData.sector?.trim()) newErrors.sector = 'El sector es obligatori';
        break;
      case 3: // Contact
        if (!formData.email?.trim()) {
          newErrors.email = "L'email es obligatori";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Format d'email invalid";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Team Member functions
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: '',
      role: '',
      email: '',
    };
    updateField('teamMembers', [...(formData.teamMembers || []), newMember]);
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    const updated = (formData.teamMembers || []).map((member) =>
      member.id === id ? { ...member, [field]: value } : member
    );
    updateField('teamMembers', updated);
  };

  const removeTeamMember = (id: string) => {
    updateField(
      'teamMembers',
      (formData.teamMembers || []).filter((m) => m.id !== id)
    );
  };

  // Certification functions
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      year: '',
    };
    updateField('certifications', [...(formData.certifications || []), newCert]);
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    const updated = (formData.certifications || []).map((cert) =>
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    updateField('certifications', updated);
  };

  const removeCertification = (id: string) => {
    updateField(
      'certifications',
      (formData.certifications || []).filter((c) => c.id !== id)
    );
  };

  // Detectar cambios
  const getChangedFields = (): Record<string, any> => {
    const changes: Record<string, any> = {};

    Object.keys(formData).forEach((key) => {
      const currentValue = (formData as any)[key];
      const originalValue = (originalData as any)[key];

      // Comparar valores (stringify para comparar objetos/arrays)
      if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
        changes[key] = currentValue;
      }
    });

    return changes;
  };

  const steps = [
    { id: 1, title: 'Branding', icon: <Image className="w-5 h-5" /> },
    { id: 2, title: 'Informacio', icon: <Info className="w-5 h-5" /> },
    { id: 3, title: 'Contacte', icon: <Phone className="w-5 h-5" /> },
    { id: 4, title: 'Xarxes', icon: <Share2 className="w-5 h-5" /> },
    { id: 5, title: 'Serveis', icon: <Briefcase className="w-5 h-5" /> },
    { id: 6, title: 'Certificacions', icon: <Award className="w-5 h-5" /> },
    { id: 7, title: 'Equip', icon: <Users className="w-5 h-5" /> },
    { id: 8, title: 'Revisio', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    const changes = getChangedFields();

    if (Object.keys(changes).length === 0) {
      alert('No hi ha canvis per enviar');
      return;
    }

    setIsLoading(true);
    try {
      // Preparar datos para la API
      const payload = {
        changes: {
          ...changes,
          // Convertir campos especificos
          socialLinks: {
            linkedin: formData.linkedin,
            twitter: formData.twitter,
            instagram: formData.instagram,
            facebook: formData.facebook,
          },
          configuration: {
            brandColor: formData.brandColor,
            postalCode: formData.postalCode,
            province: formData.province,
            specializations: formData.specializations,
            teamMembers: formData.teamMembers,
          },
          foundingYear: formData.founded ? parseInt(formData.founded) : null,
        },
        description: 'Sol·licitud de canvis de perfil des del wizard',
      };

      const response = await fetch('/api/empresa/perfil/cambios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(
          'Sol·licitud enviada correctament!\n\n' +
          'Els canvis seran revisats pel nostre equip comercial.\n' +
          'Rebras una notificacio quan siguin aprovats.'
        );
        router.push('/empresa/perfil');
      } else {
        alert(result.error || 'Error al enviar la sol·licitud');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de connexio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    const changes = getChangedFields();
    if (Object.keys(changes).length > 0) {
      if (!confirm('Tens canvis sense enviar. Vols sortir igualment?')) {
        return;
      }
    }
    router.push('/empresa/perfil');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Branding
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 2:
        return (
          <Step2BasicInfo
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 3:
        return (
          <Step3Contact
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 4:
        return (
          <Step4Social
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 5:
        return (
          <Step5Services
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 6:
        return (
          <Step6Certifications
            formData={formData}
            errors={errors}
            updateField={updateField}
            addCertification={addCertification}
            updateCertification={updateCertification}
            removeCertification={removeCertification}
          />
        );
      case 7:
        return (
          <Step7Team
            formData={formData}
            errors={errors}
            updateField={updateField}
            addTeamMember={addTeamMember}
            updateTeamMember={updateTeamMember}
            removeTeamMember={removeTeamMember}
          />
        );
      case 8:
        return (
          <div className="space-y-6">
            {/* Banner de aviso */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Els canvis requereixen aprovacio</p>
                <p className="text-sm text-amber-700 mt-1">
                  Un cop enviats, els canvis seran revisats pel nostre equip comercial abans de ser publicats.
                  Rebras una notificacio quan estiguin aprovats.
                </p>
              </div>
            </div>

            {/* Mostrar si hay cambios pendientes previos */}
            {hasPendingChanges && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">Tens canvis pendents de revisio</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Ja tens una sol·licitud de canvis en espera. Els nous canvis s'afegiran a la mateixa sol·licitud.
                  </p>
                </div>
              </div>
            )}

            <Step8Review
              formData={formData}
              errors={errors}
              onSaveDraft={() => {}}
              onPublish={handleSubmit}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Carregant dades...</p>
        </div>
      </div>
    );
  }

  // Detectar si hay cambios
  const hasFormChanges = Object.keys(getChangedFields()).length > 0;

  return (
    <SimpleWizard
      title="Editar Perfil d'Empresa"
      steps={steps}
      currentStep={currentStep}
      onClose={handleClose}
      onNext={nextStep}
      onPrevious={prevStep}
      onSubmit={currentStep === 8 ? handleSubmit : undefined}
      isLoading={isLoading}
      submitText="Enviar per revisio"
      loadingText="Enviant..."
      showModal={true}
      maxWidth="max-w-6xl"
      hasChanges={hasFormChanges}
      closeText="Tancar sense canvis"
    >
      {renderStep()}
    </SimpleWizard>
  );
}
