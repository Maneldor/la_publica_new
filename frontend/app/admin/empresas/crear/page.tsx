'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Info,
  MapPin,
  Images,
  Settings,
  CheckCircle,
  Pin,
  Upload,
  X,
  Star,
  Phone,
  Mail,
  Globe,
  Shield
} from 'lucide-react';
import SimpleWizard from '@/components/wizard/SimpleWizard';
import { useCreateEmpresa, useUploadImages } from '@/hooks/useEmpresas';
import { toast } from 'sonner';
import { CompanyData, CompanyStatus, REQUIRED_FIELDS, isCompanyPublishable, getCompanyCompletionPercentage, getCategoryColor, getCategoryLabel } from '@/lib/types/company';

interface EmpresaFormData {
  // ===== DADES BÀSIQUES (Pas 1) =====
  name: string;
  cif: string;
  email: string;
  currentPlanId: string;

  // ===== DADES OBLIGATÒRIES (Pas 2) =====
  slogan: string;
  description: string;
  logo: File | null;
  coverImage: File | null;

  // ===== CONTACTE ADMINISTRATIU (Pas 3) =====
  adminContactPerson: string;
  adminPhone: string;
  adminEmail: string;
  companyPhone: string;
  companyEmail: string;

  // ===== CONTACTE PÚBLIC (Pas 4) =====
  publicPhone: string;
  publicEmail: string;
  contactPerson: string;
  whatsappNumber: string;
  website: string;
  address: string;
  workingHours: string;

  // ===== INFORMACIÓ AMPLIADA (Pas 5) =====
  sector: string;
  size: 'startup' | 'pequeña' | 'mediana' | 'grande' | 'multinacional';
  yearEstablished: string;
  employeeCount: string;
  location: string;
  services: string[];
  specializations: string[];
  collaborationType: string;
  averageBudget: string;

  // ===== BRANDING I XARXES (Pas 6) =====
  gallery: File[];
  brandColors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  socialMediaLinkedIn: string;
  socialMediaFacebook: string;
  socialMediaInstagram: string;
  socialMediaTwitter: string;
  certifications: string[];

  // ===== CONFIGURACIÓ ADMIN (Pas 7) =====
  isActive: boolean;
  status: CompanyStatus;
  isDraft: boolean;
}

export default function CrearEmpresaAdminPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks para el backend
  const createEmpresaMutation = useCreateEmpresa();
  const uploadImagesMutation = useUploadImages();

  const [formData, setFormData] = useState<EmpresaFormData>({
    // Pas 1 - Dades bàsiques
    name: '',
    cif: '',
    email: '',
    currentPlanId: '',

    // Pas 2 - Dades obligatòries
    slogan: '',
    description: '',
    logo: null,
    coverImage: null,

    // Pas 3 - Contacte administratiu
    adminContactPerson: '',
    adminPhone: '',
    adminEmail: '',
    companyPhone: '',
    companyEmail: '',

    // Pas 4 - Contacte públic
    publicPhone: '',
    publicEmail: '',
    contactPerson: '',
    whatsappNumber: '',
    website: '',
    address: '',
    workingHours: '',

    // Pas 5 - Informació ampliada
    sector: '',
    size: 'pequeña',
    yearEstablished: '',
    employeeCount: '',
    location: '',
    services: [],
    specializations: [],
    collaborationType: '',
    averageBudget: '',

    // Pas 6 - Branding i xarxes
    gallery: [],
    brandColors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#ff0000',
      background: '#ffffff'
    },
    socialMediaLinkedIn: '',
    socialMediaFacebook: '',
    socialMediaInstagram: '',
    socialMediaTwitter: '',
    certifications: [],

    // Pas 7 - Admin
    isActive: true,
    status: CompanyStatus.PENDING,
    isDraft: false,
  });

  const steps = [
    {
      id: 1,
      title: 'Dades Bàsiques',
      icon: <Info className="w-5 h-5" />,
      category: 'basic',
      description: 'Nom, CIF, Email, Pla'
    },
    {
      id: 2,
      title: 'Dades Obligatòries',
      icon: <Star className="w-5 h-5" />,
      category: 'required',
      description: 'Eslògan, Descripció, Logo, Portada'
    },
    {
      id: 3,
      title: 'Contacte Admin',
      icon: <Settings className="w-5 h-5" />,
      category: 'basic',
      description: 'Dades privades per gestió interna'
    },
    {
      id: 4,
      title: 'Contacte Públic',
      icon: <Phone className="w-5 h-5" />,
      category: 'optional',
      description: 'Informació visible als empleats'
    },
    {
      id: 5,
      title: 'Informació Ampliada',
      icon: <ShoppingBag className="w-5 h-5" />,
      category: 'optional',
      description: 'Sector, empleats, serveis'
    },
    {
      id: 6,
      title: 'Branding i Xarxes',
      icon: <Images className="w-5 h-5" />,
      category: 'optional',
      description: 'Galeria, xarxes socials, certificacions'
    },
    {
      id: 7,
      title: 'Configuració Admin',
      icon: <Settings className="w-5 h-5" />,
      category: 'basic',
      description: 'Estat i opcions d\'administrador'
    }
  ];

  const updateField = (field: keyof EmpresaFormData, value: any) => {
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

  const addImage = (file: File) => {
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, file]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const addArrayItem = (field: keyof EmpresaFormData, value: string) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        updateField(field, [...currentArray, value.trim()]);
      }
    }
  };

  const removeArrayItem = (field: keyof EmpresaFormData, index: number) => {
    const currentArray = formData[field] as string[];
    updateField(field, currentArray.filter((_, i) => i !== index));
  };

  // Calcular completitud del perfil
  const completionPercentage = getCompanyCompletionPercentage(formData as any);
  const isPublishable = isCompanyPublishable(formData as any);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // Pas 1: Dades Bàsiques
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'El nom de l\'empresa és obligatori';
      if (formData.name.length < 3) newErrors.name = 'El nom ha de tenir mínim 3 caràcters';
      if (!formData.cif.trim()) newErrors.cif = 'El CIF és obligatori';
      if (!formData.email.trim()) newErrors.email = 'L\'email corporatiu és obligatori';
      if (!formData.currentPlanId) newErrors.currentPlanId = 'Has de seleccionar un pla';
    }

    // Pas 2: Dades Obligatòries
    if (step === 2) {
      if (!formData.slogan.trim()) newErrors.slogan = 'L\'eslògan és obligatori';
      if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria';
      if (formData.description.length < 50) newErrors.description = 'La descripció ha de tenir mínim 50 caràcters';
      if (!formData.logo) newErrors.logo = 'El logo és obligatori';
      if (!formData.coverImage) newErrors.coverImage = 'La imatge de portada és obligatòria';
    }

    // Pas 3: Contacte Admin (tots obligatoris)
    if (step === 3) {
      if (!formData.adminContactPerson.trim()) newErrors.adminContactPerson = 'Persona de contacte admin és obligatòria';
      if (!formData.adminPhone.trim()) newErrors.adminPhone = 'Telèfon admin és obligatori';
      if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Email admin és obligatori';
    }

    // Pas 4, 5, 6: Opcionals, no validació
    // Pas 7: Admin (no validació especial)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      console.log('🚀 Iniciando creación de empresa...');

      // 1. Subir imágenes primero
      let logoUrl: string | undefined;
      let coverImageUrl: string | undefined;
      let galleryUrls: string[] = [];

      // Upload logo
      if (formData.logo) {
        console.log('🎨 Subiendo logo...');
        const uploadedLogos = await uploadImagesMutation.mutateAsync([formData.logo]);
        logoUrl = uploadedLogos[0];
      }

      // Upload cover image
      if (formData.coverImage) {
        console.log('🖼️ Subiendo imagen de portada...');
        const uploadedCovers = await uploadImagesMutation.mutateAsync([formData.coverImage]);
        coverImageUrl = uploadedCovers[0];
      }

      // Upload gallery images
      if (formData.gallery.length > 0) {
        console.log('🎨 Subiendo galería...');
        galleryUrls = await uploadImagesMutation.mutateAsync(formData.gallery);
      }

      // 2. Mapear datos del formulario al formato del backend
      const empresaData = {
        // ===== DADES BÀSIQUES =====
        name: formData.name,
        cif: formData.cif,
        email: formData.email,
        currentPlanId: formData.currentPlanId,
        status: formData.status,

        // ===== DADES OBLIGATÒRIES =====
        slogan: formData.slogan,
        description: formData.description,
        logo: logoUrl,
        coverImage: coverImageUrl,

        // ===== CONTACTE ADMINISTRATIU =====
        adminContactPerson: formData.adminContactPerson,
        adminPhone: formData.adminPhone,
        adminEmail: formData.adminEmail,
        companyPhone: formData.companyPhone,
        companyEmail: formData.companyEmail,

        // ===== CONTACTE PÚBLIC =====
        publicPhone: formData.publicPhone,
        publicEmail: formData.publicEmail,
        contactPerson: formData.contactPerson,
        whatsappNumber: formData.whatsappNumber,
        website: formData.website,
        address: formData.address,
        workingHours: formData.workingHours,

        // ===== INFORMACIÓ AMPLIADA =====
        sector: formData.sector,
        yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : undefined,
        employeeCount: formData.employeeCount,
        location: formData.location,
        services: formData.services,
        specializations: formData.specializations,
        collaborationType: formData.collaborationType,
        averageBudget: formData.averageBudget,

        // ===== BRANDING I XARXES =====
        gallery: galleryUrls,
        socialMediaLinkedIn: formData.socialMediaLinkedIn,
        socialMediaFacebook: formData.socialMediaFacebook,
        socialMediaInstagram: formData.socialMediaInstagram,
        socialMediaTwitter: formData.socialMediaTwitter,
        certifications: formData.certifications,

        // ===== CONFIGURACIÓ ADMIN =====
        isActive: formData.isActive,
        status: formData.status,

        // ===== METADATA =====
        isDraft: isDraft
      };

      console.log('📤 Enviando empresa al backend:', empresaData);

      // 3. Crear empresa
      await createEmpresaMutation.mutateAsync(empresaData);

      // 4. Notificar éxito
      const isPublishableNow = isCompanyPublishable(formData);
      toast.success(
        isPublishableNow ?
          '✅ Empresa creada i publicada correctament!' :
          '📝 Empresa creada com a borrador. Completa les dades obligatòries per publicar-la!'
      );

      console.log('✅ Empresa creada exitosamente');

      // 5. Redirigir
      router.push('/admin/empresas/listar');

    } catch (error) {
      console.error('❌ Error creando empresa:', error);
      toast.error('Error al crear la empresa: ' + (error as any)?.message || 'Error desconocido');
    }
  };

  const handleClose = () => {
    if (confirm('Vols sortir sense guardar els canvis?')) {
      router.push('/admin/empresas/listar');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicData formData={formData} updateField={updateField} errors={errors} />;
      case 2:
        return <Step2RequiredData formData={formData} updateField={updateField} errors={errors} />;
      case 3:
        return <Step3AdminContact formData={formData} updateField={updateField} errors={errors} />;
      case 4:
        return <Step4PublicContact formData={formData} updateField={updateField} errors={errors} />;
      case 5:
        return <Step5ExtendedInfo formData={formData} updateField={updateField} errors={errors} />;
      case 6:
        return <Step6BrandingAndSocial formData={formData} updateField={updateField} errors={errors} addImage={addImage} removeImage={removeImage} />;
      case 7:
        return <Step7AdminSettings formData={formData} updateField={updateField} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <SimpleWizard
      title={`Crear Nova Empresa (Admin) | ${completionPercentage}% completat | ${isPublishable ? '✅ Publicable' : '⚠️ Dades obligatòries pendents'}`}
      steps={steps}
      currentStep={currentStep}
      onClose={handleClose}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={currentStep === 7 ? () => handleSubmit(false) : undefined}
      isLoading={createEmpresaMutation.isPending || uploadImagesMutation.isPending}
      submitText={isPublishable ? "Crear i Publicar Empresa" : "Crear Empresa (Borrador)"}
      loadingText="Creant empresa..."
      showModal={true}
    >
      <div className="space-y-4">
        {/* Indicador de categoria del pas actual */}
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${
          getCategoryColor(steps[currentStep - 1]?.category) === 'red' ? 'bg-red-50 border-red-200 text-red-700' :
          getCategoryColor(steps[currentStep - 1]?.category) === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700' :
          'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            getCategoryColor(steps[currentStep - 1]?.category) === 'red' ? 'bg-red-500' :
            getCategoryColor(steps[currentStep - 1]?.category) === 'blue' ? 'bg-blue-500' :
            'bg-amber-500'
          }`}></div>
          <span className="font-medium">
            {getCategoryLabel(steps[currentStep - 1]?.category)}
          </span>
          <span className="text-sm opacity-75">
            - {steps[currentStep - 1]?.description}
          </span>
        </div>

        {renderStep()}
      </div>
    </SimpleWizard>
  );
}

// Pas 1: Dades Bàsiques (només Admin)
function Step1BasicData({ formData, updateField, errors }: any) {
  const plans = [
    { id: 'plan-pioneres', name: 'Pioneres', tier: 'PIONERES' },
    { id: 'plan-standard', name: 'Estàndard', tier: 'STANDARD' },
    { id: 'plan-strategic', name: 'Estratègic', tier: 'STRATEGIC' },
    { id: 'plan-enterprise', name: 'Enterprise', tier: 'ENTERPRISE' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              📋 <strong>Dades Bàsiques d'Administrador</strong> - Informació fonamental que només pot gestionar l'admin
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'empresa *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: TechSolutions BCN"
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
            <p className="text-sm text-gray-500 text-right">{formData.name.length}/100</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CIF *
          </label>
          <input
            type="text"
            name="cif"
            value={formData.cif}
            onChange={(e) => updateField('cif', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.cif ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: B12345678"
            maxLength={9}
          />
          {errors.cif && (
            <p className="mt-1 text-sm text-red-600">{errors.cif}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email corporatiu *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="contacte@empresa.cat"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pla contractat *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.currentPlanId === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateField('currentPlanId', plan.id)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="currentPlanId"
                  value={plan.id}
                  checked={formData.currentPlanId === plan.id}
                  onChange={() => updateField('currentPlanId', plan.id)}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-500">{plan.tier}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.currentPlanId && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPlanId}</p>
        )}
      </div>
    </div>
  );
}

// Pas 2: Dades Obligatòries
function Step2RequiredData({ formData, updateField, errors }: any) {
  const handleFileUpload = (field: 'logo' | 'coverImage', file: File | null) => {
    updateField(field, file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">
              ⭐ <strong>Dades Obligatòries</strong> - Aquests camps són necessaris per poder publicar l'empresa
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Eslògan de l'empresa *
        </label>
        <input
          type="text"
          name="slogan"
          value={formData.slogan}
          onChange={(e) => updateField('slogan', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
            errors.slogan ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: Transformació digital per al sector públic"
          maxLength={150}
        />
        <div className="flex justify-between mt-1">
          {errors.slogan && (
            <p className="text-sm text-red-600">{errors.slogan}</p>
          )}
          <p className="text-sm text-gray-500 text-right">{formData.slogan.length}/150</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripció de l'empresa *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descriu els serveis i activitats de l'empresa..."
          maxLength={1000}
        />
        <div className="flex justify-between mt-1">
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
          <p className="text-sm text-gray-500 text-right">{formData.description.length}/1000</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo de l'empresa *
          </label>
          <div className="flex items-center gap-4">
            {formData.logo && (
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={URL.createObjectURL(formData.logo)}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('logo', e.target.files?.[0] || null)}
                className="hidden"
                id="logo-input"
              />
              <label
                htmlFor="logo-input"
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer border border-red-300"
              >
                {formData.logo ? 'Canviar logo' : 'Seleccionar logo'}
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Recomanat: 150x150px, JPG o PNG
              </p>
              {errors.logo && (
                <p className="text-sm text-red-600 mt-1">{errors.logo}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imatge de portada *
          </label>
          <div className="flex items-center gap-4">
            {formData.coverImage && (
              <div className="w-32 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={URL.createObjectURL(formData.coverImage)}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('coverImage', e.target.files?.[0] || null)}
                className="hidden"
                id="cover-input"
              />
              <label
                htmlFor="cover-input"
                className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer border border-red-300"
              >
                {formData.coverImage ? 'Canviar portada' : 'Seleccionar portada'}
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Recomanat: 1200x400px, JPG o PNG
              </p>
              {errors.coverImage && (
                <p className="text-sm text-red-600 mt-1">{errors.coverImage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pas 3: Contacte Administratiu
function Step3AdminContact({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              🔒 <strong>Contacte Administratiu</strong> - Informació privada per a gestió interna, facturació i suport
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Persona de contacte admin *
          </label>
          <input
            type="text"
            name="adminContactPerson"
            value={formData.adminContactPerson}
            onChange={(e) => updateField('adminContactPerson', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.adminContactPerson ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nom i cognoms"
          />
          {errors.adminContactPerson && (
            <p className="mt-1 text-sm text-red-600">{errors.adminContactPerson}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telèfon admin *
          </label>
          <input
            type="tel"
            name="adminPhone"
            value={formData.adminPhone}
            onChange={(e) => updateField('adminPhone', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.adminPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+34 933 456 789"
          />
          {errors.adminPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.adminPhone}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email admin *
        </label>
        <input
          type="email"
          name="adminEmail"
          value={formData.adminEmail}
          onChange={(e) => updateField('adminEmail', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.adminEmail ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="admin@empresa.cat"
        />
        {errors.adminEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.adminEmail}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telèfon empresa (opcional)
          </label>
          <input
            type="tel"
            name="companyPhone"
            value={formData.companyPhone}
            onChange={(e) => updateField('companyPhone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+34 933 000 000"
          />
          <p className="text-sm text-gray-500 mt-1">
            Diferent del telèfon públic si cal
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email empresa (opcional)
          </label>
          <input
            type="email"
            name="companyEmail"
            value={formData.companyEmail}
            onChange={(e) => updateField('companyEmail', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="info@empresa.cat"
          />
          <p className="text-sm text-gray-500 mt-1">
            Diferent del email públic si cal
          </p>
        </div>
      </div>
    </div>
  );
}

// Pas 4: Contacte Públic
function Step4PublicContact({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              📞 <strong>Contacte Públic</strong> - Informació visible per als empleats públics del directori
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Persona de contacte pública
          </label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => updateField('contactPerson', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Nom del responsable comercial"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telèfon públic
          </label>
          <input
            type="tel"
            name="publicPhone"
            value={formData.publicPhone}
            onChange={(e) => updateField('publicPhone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="+34 933 456 789"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email públic
          </label>
          <input
            type="email"
            name="publicEmail"
            value={formData.publicEmail}
            onChange={(e) => updateField('publicEmail', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="comercial@empresa.cat"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp
          </label>
          <input
            type="tel"
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={(e) => updateField('whatsappNumber', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="+34 600 000 000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pàgina web
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={(e) => updateField('website', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="https://www.empresa.cat"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horari d'atenció
          </label>
          <input
            type="text"
            name="workingHours"
            value={formData.workingHours}
            onChange={(e) => updateField('workingHours', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Dilluns a Divendres: 9:00-18:00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adreça
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Carrer de la Pau, 123, 08001 Barcelona"
        />
      </div>
    </div>
  );
}

// Pas 5: Informació Ampliada
function Step5ExtendedInfo({ formData, updateField, errors }: any) {
  const sectors = [
    'Tecnologia',
    'Consultoria Legal',
    'Serveis',
    'Construcció',
    'Transport',
    'Seguretat',
    'Formació',
    'Energies Renovables',
    'Consultoria Ambiental',
    'Reciclatge',
    'Telecomunicacions',
    'Consultoria Financera',
    'Recursos Humans',
    'Marketing Digital',
    'Disseny Gràfic',
    'Altres'
  ];

  const employeeCounts = [
    '1-10',
    '10-50',
    '50-200',
    '200-500',
    '500+'
  ];

  const collaborationTypes = [
    'Serveis puntuals',
    'Col·laboració continuada',
    'Projectes a llarg termini',
    'Consultoria',
    'Outsourcing',
    'Híbrid'
  ];

  const budgetRanges = [
    'Menys de 1.000€',
    '1.000€ - 5.000€',
    '5.000€ - 15.000€',
    '15.000€ - 50.000€',
    'Més de 50.000€'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 50}, (_, i) => currentYear - i);

  const addService = (service: string) => {
    if (service.trim() && !formData.services.includes(service.trim())) {
      updateField('services', [...formData.services, service.trim()]);
    }
  };

  const removeService = (index: number) => {
    updateField('services', formData.services.filter((_: string, i: number) => i !== index));
  };

  const addSpecialization = (specialization: string) => {
    if (specialization.trim() && !formData.specializations.includes(specialization.trim())) {
      updateField('specializations', [...formData.specializations, specialization.trim()]);
    }
  };

  const removeSpecialization = (index: number) => {
    updateField('specializations', formData.specializations.filter((_: string, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              📋 <strong>Informació Ampliada</strong> - Dades per millorar el perfil de l'empresa
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sector
          </label>
          <select
            name="sector"
            value={formData.sector}
            onChange={(e) => updateField('sector', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Selecciona un sector</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mida de l'empresa
          </label>
          <select
            name="size"
            value={formData.size}
            onChange={(e) => updateField('size', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="startup">Startup</option>
            <option value="pequeña">Petita (1-10 empleats)</option>
            <option value="mediana">Mitjana (10-50 empleats)</option>
            <option value="grande">Gran (50+ empleats)</option>
            <option value="multinacional">Multinacional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre d'empleats
          </label>
          <select
            name="employeeCount"
            value={formData.employeeCount}
            onChange={(e) => updateField('employeeCount', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Selecciona el rang</option>
            {employeeCounts.map(count => (
              <option key={count} value={count}>{count} empleats</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Any de fundació
          </label>
          <select
            name="yearEstablished"
            value={formData.yearEstablished}
            onChange={(e) => updateField('yearEstablished', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Selecciona l'any</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localització
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Barcelona, Catalunya"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipus de col·laboració
          </label>
          <select
            name="collaborationType"
            value={formData.collaborationType}
            onChange={(e) => updateField('collaborationType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Selecciona el tipus</option>
            {collaborationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pressupost mitjà
          </label>
          <select
            name="averageBudget"
            value={formData.averageBudget}
            onChange={(e) => updateField('averageBudget', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Selecciona el rang</option>
            {budgetRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Serveis */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Serveis principals
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Afegeix un servei..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addService((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                if (input) {
                  addService(input.value);
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Afegir
            </button>
          </div>

          {formData.services.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.services.map((service: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Especialitzacions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Especialitzacions
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Afegeix una especialització..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSpecialization((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                if (input) {
                  addSpecialization(input.value);
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Afegir
            </button>
          </div>

          {formData.specializations.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.specializations.map((spec: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(index)}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== STEP 6: BRANDING I XARXES SOCIALS =====
function Step6BrandingAndSocial({ formData, updateField, errors, addImage, removeImage }: any) {
  return (
    <div className="space-y-6">
      {/* Colors corporatius */}
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Colors Corporatius</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Primari</label>
            <input
              type="color"
              value={formData.brandColors?.primary || '#000000'}
              onChange={(e) => updateField('brandColors.primary', e.target.value)}
              className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Secundari</label>
            <input
              type="color"
              value={formData.brandColors?.secondary || '#666666'}
              onChange={(e) => updateField('brandColors.secondary', e.target.value)}
              className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Accent</label>
            <input
              type="color"
              value={formData.brandColors?.accent || '#ff0000'}
              onChange={(e) => updateField('brandColors.accent', e.target.value)}
              className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fons</label>
            <input
              type="color"
              value={formData.brandColors?.background || '#ffffff'}
              onChange={(e) => updateField('brandColors.background', e.target.value)}
              className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Galeria d'imatges */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Galeria d'Imatges
          <span className="text-amber-600 ml-1">⚠️ Suggerit</span>
        </label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {formData.gallery?.map((image: string, index: number) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Galeria ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => removeImage('gallery', index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Upload className="w-4 h-4" />
          <span>Afegir Imatges</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                Array.from(e.target.files).forEach(file => addImage('gallery', file));
              }
            }}
            className="hidden"
          />
        </label>
      </div>

      {/* Xarxes socials */}
      <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">Xarxes Socials</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="url"
              value={formData.socialMediaLinkedIn || ''}
              onChange={(e) => updateField('socialMediaLinkedIn', e.target.value)}
              placeholder="https://linkedin.com/company/..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
            <input
              type="url"
              value={formData.socialMediaFacebook || ''}
              onChange={(e) => updateField('socialMediaFacebook', e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
            <input
              type="url"
              value={formData.socialMediaInstagram || ''}
              onChange={(e) => updateField('socialMediaInstagram', e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X</label>
            <input
              type="url"
              value={formData.socialMediaTwitter || ''}
              onChange={(e) => updateField('socialMediaTwitter', e.target.value)}
              placeholder="https://twitter.com/..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== STEP 7: CONFIGURACIÓ ADMIN =====
function Step7AdminSettings({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      {/* Informació administrativa */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Configuració Administrativa</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estat de l'Empresa
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.status || 'PENDING'}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="PENDING">Pendent</option>
              <option value="APPROVED">Aprovada</option>
              <option value="PUBLISHED">Publicada</option>
              <option value="REJECTED">Rebutjada</option>
              <option value="SUSPENDED">Suspesa</option>
              <option value="INACTIVE">Inactiva</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={formData.isActive || false}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Empresa Activa
            </label>
          </div>
        </div>
      </div>

      {/* Resumen final */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resum de l'Empresa</h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Nom:</span>
            <span className="text-gray-900">{formData.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">CIF:</span>
            <span className="text-gray-900">{formData.cif}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Email:</span>
            <span className="text-gray-900">{formData.email}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Pla:</span>
            <span className="text-gray-900">{formData.currentPlanId || 'No assignat'}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Estat:</span>
            <span className="text-gray-900">{formData.status || 'PENDING'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
