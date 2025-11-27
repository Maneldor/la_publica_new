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
  X
} from 'lucide-react';
import SimpleWizard from '@/components/wizard/SimpleWizard';
import { useCreateEmpresa, useUploadImages } from '@/hooks/useEmpresas';
import { toast } from 'sonner';

interface EmpresaFormData {
  // Step 1 - Información básica
  name: string;
  description: string;
  category: string;
  slogan: string;

  // Step 2 - Contacto
  email: string;
  phone: string;
  website: string;
  address: string;

  // Step 3 - Detalles
  employeeRange: string;
  foundedYear: string;
  services: string[];

  // Step 4 - Imágenes
  images: File[];
  logo: File | null;

  // Step 5 - Configuración Admin
  isVerified: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  status: 'active' | 'pending' | 'suspended';
}

export default function CrearEmpresaAdminPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks para el backend
  const createEmpresaMutation = useCreateEmpresa();
  const uploadImagesMutation = useUploadImages();

  const [formData, setFormData] = useState<EmpresaFormData>({
    // Step 1
    name: '',
    description: '',
    category: '',
    slogan: '',

    // Step 2
    email: '',
    phone: '',
    website: '',
    address: '',

    // Step 3
    employeeRange: '',
    foundedYear: '',
    services: [],

    // Step 4
    images: [],
    logo: null,

    // Step 5 - Admin
    isVerified: false,
    isFeatured: false,
    isPinned: false,
    status: 'pending',
  });

  const steps = [
    { id: 1, title: 'Informació', icon: <Info className="w-5 h-5" /> },
    { id: 2, title: 'Contacte', icon: <MapPin className="w-5 h-5" /> },
    { id: 3, title: 'Detalls', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 4, title: 'Imatges', icon: <Images className="w-5 h-5" /> },
    { id: 5, title: 'Admin', icon: <Settings className="w-5 h-5" /> }
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
      images: [...prev.images, file]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'El nom de l\'empresa és obligatori';
      if (formData.name.length < 3) newErrors.name = 'El nom ha de tenir mínim 3 caràcters';
      if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria';
      if (formData.description.length < 50) newErrors.description = 'La descripció ha de tenir mínim 50 caràcters';
      if (!formData.category) newErrors.category = 'La categoria és obligatòria';
    }

    if (step === 2) {
      if (!formData.email.trim()) newErrors.email = 'L\'email és obligatori';
      if (!formData.address.trim()) newErrors.address = 'L\'adreça és obligatòria';
    }

    if (step === 3) {
      if (!formData.employeeRange) newErrors.employeeRange = 'El rang d\'empleats és obligatori';
      if (!formData.foundedYear) newErrors.foundedYear = 'L\'any de fundació és obligatori';
    }

    if (step === 4) {
      if (formData.images.length === 0) {
        newErrors.images = 'Has d\'afegir almenys una imatge de l\'empresa';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
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

      const imageUrls: string[] = formData.images.length > 0
        ? await uploadImagesMutation.mutateAsync(formData.images)
        : [];

      if (formData.logo) {
        console.log('🎨 Subiendo logo...');
        const uploadedLogos = await uploadImagesMutation.mutateAsync([formData.logo]);
        logoUrl = uploadedLogos[0];
      }

      // 2. Mapear datos del formulario al formato del backend
      const employeeRange = formData.employeeRange;
      let employeeCount: number | undefined;

      // Convertir rango de empleados a número (tomar el valor medio)
      if (employeeRange === '1-10') employeeCount = 5;
      else if (employeeRange === '11-25') employeeCount = 18;
      else if (employeeRange === '26-50') employeeCount = 38;
      else if (employeeRange === '51-100') employeeCount = 75;
      else if (employeeRange === '101-250') employeeCount = 175;
      else if (employeeRange === '251-500') employeeCount = 375;
      else if (employeeRange === '500+') employeeCount = 750;

      // Determinar tamaño de empresa
      let size: 'startup' | 'pequeña' | 'mediana' | 'grande' | 'multinacional' = 'pequeña';
      if (employeeCount) {
        if (employeeCount <= 10) size = 'startup';
        else if (employeeCount <= 50) size = 'pequeña';
        else if (employeeCount <= 250) size = 'mediana';
        else if (employeeCount <= 1000) size = 'grande';
        else size = 'multinacional';
      }

      const empresaData = {
        name: formData.name,
        description: formData.description,
        sector: formData.category, // El backend usa "sector" pero el form usa "category"
        size: size,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: {
          street: formData.address,
          city: 'Barcelona', // Por ahora hardcodeado
          province: 'Barcelona',
          postalCode: '08001',
          country: 'España'
        },
        foundingYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        employeeCount: employeeCount,
        configuration: {
          slogan: formData.slogan,
          services: formData.services,
          images: imageUrls,
          logoUrl: logoUrl,
          isVerified: formData.isVerified,
          isFeatured: formData.isFeatured,
          isPinned: formData.isPinned,
          status: isDraft ? 'pending' : formData.status
        }
      };

      console.log('📤 Enviando empresa al backend:', empresaData);

      // 3. Crear empresa
      await createEmpresaMutation.mutateAsync(empresaData);

      // 4. Notificar éxito
      toast.success(
        isDraft ?
          '✅ Empresa guardada como borrador!' :
          '✅ Empresa creada y publicada correctamente!'
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
        return <Step1BasicInfo formData={formData} updateField={updateField} errors={errors} />;
      case 2:
        return <Step2Contact formData={formData} updateField={updateField} errors={errors} />;
      case 3:
        return <Step3Details formData={formData} updateField={updateField} errors={errors} />;
      case 4:
        return <Step4Images formData={formData} addImage={addImage} removeImage={removeImage} updateField={updateField} errors={errors} />;
      case 5:
        return <Step5AdminSettings formData={formData} updateField={updateField} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <SimpleWizard
      title="Crear Nova Empresa (Admin)"
      steps={steps}
      currentStep={currentStep}
      onClose={handleClose}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={currentStep === 5 ? () => handleSubmit(false) : undefined}
      isLoading={createEmpresaMutation.isPending || uploadImagesMutation.isPending}
      submitText="Crear Empresa"
      loadingText="Creant empresa..."
      showModal={true}
    >
      {renderStep()}
    </SimpleWizard>
  );
}

// Step 1: Información básica
function Step1BasicInfo({ formData, updateField, errors }: any) {
  const categories = [
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

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'empresa *
        </label>
        <input
          type="text"
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
          Descripció de l'empresa *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sector *
        </label>
        <select
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Selecciona un sector</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Eslògan (opcional)
        </label>
        <input
          type="text"
          value={formData.slogan}
          onChange={(e) => updateField('slogan', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Transformació digital per al sector públic"
          maxLength={150}
        />
        <p className="text-sm text-gray-500 text-right mt-1">{formData.slogan.length}/150</p>
      </div>
    </div>
  );
}

// Step 2: Contacte
function Step2Contact({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de contacte *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="info@empresa.cat"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telèfon de contacte
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+34 933 456 789"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pàgina web
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://www.empresa.cat"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Adreça *
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => updateField('address', e.target.value)}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Carrer de la Pau, 123, 08001 Barcelona"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>
    </div>
  );
}

// Step 3: Detalls
function Step3Details({ formData, updateField, errors }: any) {
  const employeeRanges = [
    '1-10',
    '11-25',
    '26-50',
    '51-100',
    '101-250',
    '251-500',
    '500+'
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rang d'empleats *
          </label>
          <select
            value={formData.employeeRange}
            onChange={(e) => updateField('employeeRange', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.employeeRange ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona el rang</option>
            {employeeRanges.map(range => (
              <option key={range} value={range}>{range} empleats</option>
            ))}
          </select>
          {errors.employeeRange && (
            <p className="mt-1 text-sm text-red-600">{errors.employeeRange}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Any de fundació *
          </label>
          <select
            value={formData.foundedYear}
            onChange={(e) => updateField('foundedYear', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.foundedYear ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona l'any</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.foundedYear && (
            <p className="mt-1 text-sm text-red-600">{errors.foundedYear}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Serveis principals
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Afegeix un servei..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Afegir
            </button>
          </div>

          {formData.services.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.services.map((service: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-blue-600 hover:text-blue-800"
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

// Step 4: Imágenes
function Step4Images({ formData, addImage, removeImage, updateField, errors }: any) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        addImage(file);
      }
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        addImage(file);
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      updateField('logo', file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo de l'empresa
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
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-input"
            />
            <label
              htmlFor="logo-input"
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              {formData.logo ? 'Canviar logo' : 'Seleccionar logo'}
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Recomanat: 150x150px, JPG o PNG
            </p>
          </div>
        </div>
      </div>

      {/* General images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imatges de l'empresa *
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Arrossega les imatges aquí o fes clic per seleccionar
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Oficines, equip, instal·lacions... (màx 6 imatges, JPG/PNG, 5MB cada una)
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Seleccionar imatges
          </label>
        </div>
        {errors.images && (
          <p className="mt-2 text-sm text-red-600">{errors.images}</p>
        )}
      </div>

      {formData.images.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Imatges afegides ({formData.images.length}/6)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image: File, index: number) => (
              <div key={index} className="relative group">
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 5: Configuración Admin
function Step5AdminSettings({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-purple-700">
              👑 <strong>Configuració d'administrador</strong> - Aquests ajustos només són disponibles per als administradors
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Opcions destacades</h3>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isVerified"
            checked={formData.isVerified}
            onChange={(e) => updateField('isVerified', e.target.checked)}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="isVerified" className="ml-2 text-sm text-gray-700">
            ✅ Empresa verificada (mostrar com a verificada)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => updateField('isFeatured', e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
            ⭐ Empresa destacada (apareix a la part superior)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPinned"
            checked={formData.isPinned}
            onChange={(e) => updateField('isPinned', e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <Pin className="w-4 h-4" />
              Empresa fixada (sempre visible a la part superior)
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estat de l'empresa
        </label>
        <select
          value={formData.status}
          onChange={(e) => updateField('status', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="active">🟢 Activa</option>
          <option value="pending">🟡 Pendent de revisió</option>
          <option value="suspended">🔴 Suspesa</option>
        </select>
      </div>

    </div>
  );
}

