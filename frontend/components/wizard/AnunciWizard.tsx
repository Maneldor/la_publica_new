'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateAnuncio, useUpdateAnuncio } from '@/hooks/useAnuncios';
import { toast } from 'sonner';
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
  Phone,
  Mail,
  User,
  Clock
} from 'lucide-react';
import SimpleWizard from '@/components/wizard/SimpleWizard';

interface AnuncioFormData {
  // Step 1 - Información básica
  title: string;
  description: string;
  category: string;
  type: 'oferta' | 'demanda';

  // Step 2 - Detalles
  price: number | null;
  priceType: 'fix' | 'negociable';
  condition: 'nou' | 'usat' | 'com_nou';
  specifications: Record<string, string>;

  // Step 3 - Ubicación
  province: string;
  city: string;
  postalCode: string;
  pickupAvailable: boolean;
  shippingAvailable: boolean;
  shippingIncluded: boolean;

  // Step 4 - Contacte
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactSchedule: string;

  // Step 5 - Imágenes
  images: File[];
  mainImageIndex: number;

  // Step 6 - Configuración Admin
  isFeatured: boolean;
  isPinned: boolean;
  priority: 'normal' | 'high' | 'urgent';
  moderationStatus: 'approved' | 'pending';
}

interface AnunciWizardProps {
  mode: 'create' | 'edit';
  initialData?: any; // Dades de l'anunci existent per editar
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function AnunciWizard({ mode, initialData, onSuccess, onClose }: AnunciWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks per crear o actualitzar
  const createAnuncioMutation = useCreateAnuncio();
  const updateAnuncioMutation = useUpdateAnuncio();

  const [formData, setFormData] = useState<AnuncioFormData>(() => {
    if (mode === 'edit' && initialData) {
      // Convertir dades existents al format del formulari
      const marketplace = initialData.configuration?.marketplace || {};
      const contact = marketplace.contact || {};
      const location = marketplace.location || {};

      return {
        // Step 1
        title: initialData.title || '',
        description: initialData.content || '',
        category: marketplace.category || '',
        type: marketplace.adType || 'oferta',

        // Step 2
        price: marketplace.price || null,
        priceType: marketplace.priceType || 'fix',
        condition: marketplace.condition || 'usat',
        specifications: {},

        // Step 3
        province: location.province || '',
        city: location.city || '',
        postalCode: location.postalCode || '',
        pickupAvailable: marketplace.delivery?.pickup || true,
        shippingAvailable: marketplace.delivery?.shipping || false,
        shippingIncluded: marketplace.delivery?.shippingIncluded || false,

        // Step 4 - Contacte
        contactName: contact.name || '',
        contactPhone: contact.phone || '',
        contactEmail: contact.email || '',
        contactSchedule: contact.preferredSchedule || '',

        // Step 5
        images: [],
        mainImageIndex: 0,

        // Step 6 - Admin
        isFeatured: marketplace.admin?.featured || false,
        isPinned: marketplace.admin?.pinned || false,
        priority: marketplace.admin?.priority || 'normal',
        moderationStatus: marketplace.admin?.moderationStatus || 'approved',
      };
    }

    // Valors per defecte per crear
    return {
      // Step 1
      title: '',
      description: '',
      category: '',
      type: 'oferta',

      // Step 2
      price: null,
      priceType: 'fix',
      condition: 'usat',
      specifications: {},

      // Step 3
      province: '',
      city: '',
      postalCode: '',
      pickupAvailable: true,
      shippingAvailable: false,
      shippingIncluded: false,

      // Step 4 - Contacte
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      contactSchedule: '',

      // Step 5
      images: [],
      mainImageIndex: 0,

      // Step 6 - Admin
      isFeatured: false,
      isPinned: false,
      priority: 'normal',
      moderationStatus: 'approved',
    };
  });

  const steps = [
    { id: 1, title: 'Informació', icon: <Info className="w-5 h-5" /> },
    { id: 2, title: 'Detalls', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 3, title: 'Ubicació', icon: <MapPin className="w-5 h-5" /> },
    { id: 4, title: 'Contacte', icon: <Phone className="w-5 h-5" /> },
    { id: 5, title: 'Imatges', icon: <Images className="w-5 h-5" /> },
    { id: 6, title: 'Admin', icon: <Settings className="w-5 h-5" /> },
    { id: 7, title: 'Revisió', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const updateField = (field: keyof AnuncioFormData, value: any) => {
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
      images: prev.images.filter((_, i) => i !== index),
      mainImageIndex: prev.mainImageIndex >= index ? Math.max(0, prev.mainImageIndex - 1) : prev.mainImageIndex
    }));
  };

  const setMainImage = (index: number) => {
    setFormData(prev => ({ ...prev, mainImageIndex: index }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'El títol és obligatori';
      if (formData.title.length < 10) newErrors.title = 'El títol ha de tenir mínim 10 caràcters';
      if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria';
      if (formData.description.length < 50) newErrors.description = 'La descripció ha de tenir mínim 50 caràcters';
      if (!formData.category) newErrors.category = 'La categoria és obligatòria';
    }

    if (step === 2) {
      if (formData.price !== null && formData.price <= 0) {
        newErrors.price = 'El preu ha de ser major que 0';
      }
    }

    if (step === 3) {
      if (!formData.province) newErrors.province = 'La província és obligatòria';
      if (!formData.city.trim()) newErrors.city = 'La població és obligatòria';
      if (!formData.pickupAvailable && !formData.shippingAvailable && !formData.shippingIncluded) {
        newErrors.delivery = "Has de seleccionar almenys una opció d'entrega";
      }
    }

    if (step === 4) {
      // Validació opcional de l'email només si s'ha introduït
      if (formData.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = "L'email no té un format vàlid";
      }
    }

    if (step === 5) {
      if (formData.images.length === 0) {
        newErrors.images = 'Has d\'afegir almenys una imatge del producte';
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
    setIsLoading(true);

    try {
      // Mapear los datos del formulario marketplace al formato de announcement
      const apiData = {
        title: formData.title,
        content: `${formData.description}\n\n**Detalles:**\n- Tipo: ${formData.type === 'oferta' ? 'Oferta' : 'Demanda'}\n- Categoría: ${formData.category}${formData.price ? `\n- Precio: ${formData.price}€ (${formData.priceType})` : ''}\n- Estado: ${formData.condition === 'nou' ? 'Nuevo' : formData.condition === 'com_nou' ? 'Como nuevo' : 'Usado'}\n- Ubicación: ${formData.city}, ${formData.province}${formData.postalCode ? ` (${formData.postalCode})` : ''}`,
        type: formData.type === 'oferta' ? 'general' : 'urgente', // Mapear oferta->general, demanda->urgente
        priority: formData.priority === 'urgent' ? 'critica' : formData.priority === 'high' ? 'alta' : 'media',
        scope: 'global',
        targets: [],
        startDate: isDraft ? undefined : new Date(),
        expiresAt: undefined,
        configuration: {
          marketplace: {
            category: formData.category,
            adType: formData.type,
            price: formData.price,
            priceType: formData.priceType,
            condition: formData.condition,
            location: {
              province: formData.province,
              city: formData.city,
              postalCode: formData.postalCode
            },
            delivery: {
              pickup: formData.pickupAvailable,
              shipping: formData.shippingAvailable,
              shippingIncluded: formData.shippingIncluded
            },
            contact: {
              name: formData.contactName,
              phone: formData.contactPhone,
              email: formData.contactEmail,
              preferredSchedule: formData.contactSchedule
            },
            admin: {
              featured: formData.isFeatured,
              pinned: formData.isPinned,
              priority: formData.priority,
              moderationStatus: formData.moderationStatus
            }
          }
        }
      };

      console.log('📤 Datos mapeados para enviar:', JSON.stringify(apiData, null, 2));

      const mutation = mode === 'edit' ? updateAnuncioMutation : createAnuncioMutation;
      const mutationData = mode === 'edit' ? { id: initialData.id, ...apiData } : apiData;

      mutation.mutate(mutationData, {
        onSuccess: () => {
          const message = mode === 'edit'
            ? (isDraft ? 'Anunci actualitzat com a borrador!' : 'Anunci actualitzat correctament!')
            : (isDraft ? 'Anunci guardat com a borrador!' : 'Anunci publicat correctament!');

          toast.success(message);

          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/admin/anuncios/listar');
          }
        },
        onError: (error: any) => {
          console.error('❌ Error en mutación:', error);
          toast.error(error.message || 'Error al processar l\'anunci');
          setIsLoading(false);
        }
      });

    } catch (error) {
      console.error('❌ Error al preparar datos:', error);
      toast.error('Error al preparar l\'anunci');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (confirm('Vols sortir sense guardar els canvis?')) {
      if (onClose) {
        onClose();
      } else {
        router.push('/admin/anuncios/listar');
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} updateField={updateField} errors={errors} />;
      case 2:
        return <Step2Details formData={formData} updateField={updateField} errors={errors} />;
      case 3:
        return <Step3Location formData={formData} updateField={updateField} errors={errors} />;
      case 4:
        return <Step4Contact formData={formData} updateField={updateField} errors={errors} />;
      case 5:
        return <Step5Images formData={formData} addImage={addImage} removeImage={removeImage} setMainImage={setMainImage} errors={errors} />;
      case 6:
        return <Step6AdminSettings formData={formData} updateField={updateField} errors={errors} />;
      case 7:
        return <Step7Review formData={formData} onSaveDraft={() => handleSubmit(true)} onPublish={() => handleSubmit(false)} isLoading={isLoading || createAnuncioMutation.isPending || updateAnuncioMutation.isPending} mode={mode} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (mode === 'edit') {
      return `Editar Anunci: ${initialData?.title || 'Sense títol'}`;
    }
    return 'Crear Nou Anunci (Admin)';
  };

  return (
    <SimpleWizard
      title={getTitle()}
      steps={steps}
      currentStep={currentStep}
      onClose={handleClose}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={undefined}
      isLoading={isLoading}
      submitText={mode === 'edit' ? "Actualitzar Anunci" : "Crear Anunci"}
      loadingText={mode === 'edit' ? "Actualitzant..." : "Creant..."}
      showModal={true}
    >
      {renderStep()}
    </SimpleWizard>
  );
}

// Components dels passos (copiats dels originals amb millores)

// Step 1: Información básica
function Step1BasicInfo({ formData, updateField, errors }: any) {
  const categories = [
    'Tecnologia',
    'Vehicles',
    'Immobiliària',
    'Moda i Bellesa',
    'Casa i Jardí',
    'Esports i Oci',
    'Música i Cinema',
    'Llibres i Educació',
    'Feina',
    'Serveis',
    'Animals',
    'Altres'
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipus d'anunci *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('type', 'oferta')}
            className={`p-4 border rounded-lg transition-colors ${
              formData.type === 'oferta'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
              <span className="font-medium">Oferta</span>
              <p className="text-sm text-gray-600">Venc alguna cosa</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => updateField('type', 'demanda')}
            className={`p-4 border rounded-lg transition-colors ${
              formData.type === 'demanda'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2" />
              <span className="font-medium">Demanda</span>
              <p className="text-sm text-gray-600">Busco alguna cosa</p>
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Títol de l'anunci *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: iPhone 14 Pro Max 256GB com nou"
          maxLength={100}
        />
        <div className="flex justify-between mt-1">
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}
          <p className="text-sm text-gray-500 text-right">{formData.title.length}/100</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripció *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descriu el producte o servei amb detall..."
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
          Categoria *
        </label>
        <select
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Selecciona una categoria</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>
    </div>
  );
}

// Step 2: Detalles
function Step2Details({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preu
        </label>
        <div className="flex gap-4">
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => updateField('price', e.target.value ? parseFloat(e.target.value) : null)}
            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: 599"
            min="0"
            step="0.01"
          />
          <select
            value={formData.priceType}
            onChange={(e) => updateField('priceType', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="fix">Preu fix</option>
            <option value="negociable">Negociable</option>
          </select>
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estat del producte *
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'nou', label: 'Nou', desc: 'Sense usar' },
            { value: 'com_nou', label: 'Com nou', desc: 'Poc ús' },
            { value: 'usat', label: 'Usat', desc: 'Ús normal' }
          ].map(condition => (
            <button
              key={condition.value}
              type="button"
              onClick={() => updateField('condition', condition.value)}
              className={`p-4 border rounded-lg transition-colors text-center ${
                formData.condition === condition.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{condition.label}</div>
              <div className="text-sm text-gray-600">{condition.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Ubicación
function Step3Location({ formData, updateField, errors }: any) {
  const provinces = [
    'Barcelona', 'Girona', 'Lleida', 'Tarragona', 'Madrid', 'Valencia', 'Sevilla', 'Bilbao'
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Província *
          </label>
          <select
            value={formData.province}
            onChange={(e) => updateField('province', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.province ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecciona província</option>
            {provinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
          {errors.province && (
            <p className="mt-1 text-sm text-red-600">{errors.province}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Població *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateField('city', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Barcelona"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Codi postal
        </label>
        <input
          type="text"
          value={formData.postalCode}
          onChange={(e) => updateField('postalCode', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: 08001"
          maxLength={5}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Opcions d'entrega *
        </label>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pickup"
              checked={formData.pickupAvailable}
              onChange={(e) => updateField('pickupAvailable', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="pickup" className="ml-2 text-sm text-gray-700">
              Recollida en persona
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="shipping"
              checked={formData.shippingAvailable}
              onChange={(e) => updateField('shippingAvailable', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="shipping" className="ml-2 text-sm text-gray-700">
              Enviament (cost a càrrec del comprador)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="shippingIncluded"
              checked={formData.shippingIncluded}
              onChange={(e) => updateField('shippingIncluded', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="shippingIncluded" className="ml-2 text-sm text-gray-700">
              Enviament gratuït inclòs
            </label>
          </div>
        </div>
        {errors.delivery && (
          <p className="mt-2 text-sm text-red-600">{errors.delivery}</p>
        )}
      </div>
    </div>
  );
}

// Step 4: Contacte
function Step4Contact({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="text-sm text-blue-700">
          📞 Informació de contacte per als interessats en l'anunci
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Aquests camps són opcionals. Els usuaris podran contactar-te via missatge intern si no els omples.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-1" />
          Nom complet de contacte
        </label>
        <input
          type="text"
          value={formData.contactName}
          onChange={(e) => updateField('contactName', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.contactName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: Joan Garcia"
        />
        {errors.contactName && (
          <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4 inline mr-1" />
          Telèfon de contacte
        </label>
        <input
          type="tel"
          value={formData.contactPhone}
          onChange={(e) => updateField('contactPhone', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.contactPhone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: 666 123 456"
        />
        {errors.contactPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="w-4 h-4 inline mr-1" />
          Email de contacte
        </label>
        <input
          type="email"
          value={formData.contactEmail}
          onChange={(e) => updateField('contactEmail', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.contactEmail ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: joan.garcia@example.com"
        />
        {errors.contactEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Horari de contacte preferit (opcional)
        </label>
        <textarea
          value={formData.contactSchedule}
          onChange={(e) => updateField('contactSchedule', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Disponible de dilluns a divendres de 9h a 18h. Caps de setmana només matins."
        />
        <p className="mt-1 text-sm text-gray-500">
          Indica quan prefereixes que et contactin els interessats (opcional)
        </p>
      </div>
    </div>
  );
}

// Step 5: Imágenes
function Step5Images({ formData, addImage, removeImage, setMainImage, errors }: any) {
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

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imatges del producte *
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
            Pots afegir fins a 8 imatges (JPG, PNG, màx 5MB cada una)
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
            Imatges afegides ({formData.images.length}/8)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.images.map((image: File, index: number) => (
              <div key={index} className="relative group">
                <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                  index === formData.mainImageIndex ? 'border-blue-500' : 'border-gray-200'
                }`}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === formData.mainImageIndex && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Principal
                    </div>
                  )}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {index !== formData.mainImageIndex && (
                  <button
                    onClick={() => setMainImage(index)}
                    className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Fer principal
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 6: Configuración Admin
function Step6AdminSettings({ formData, updateField, errors }: any) {
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
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => updateField('isFeatured', e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
            ⭐ Anunci destacat (apareix a la part superior)
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
              Anunci anclat (sempre visible a la part superior)
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prioritat de l'anunci
        </label>
        <select
          value={formData.priority}
          onChange={(e) => updateField('priority', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="normal">🔵 Normal</option>
          <option value="high">🟡 Alta prioritat</option>
          <option value="urgent">🔴 Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estat de moderació
        </label>
        <select
          value={formData.moderationStatus}
          onChange={(e) => updateField('moderationStatus', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="approved">✅ Aprovat</option>
          <option value="pending">⏳ Pendent de revisió</option>
        </select>
      </div>
    </div>
  );
}

// Step 7: Review
function Step7Review({ formData, onSaveDraft, onPublish, isLoading, mode }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p className="text-sm text-blue-700">
          {mode === 'edit'
            ? 'Revisa les modificacions abans d\'actualitzar l\'anunci'
            : 'Revisa la informació abans de publicar l\'anunci'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900">Informació bàsica</h3>
          <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm"><span className="font-medium">Tipus:</span> {formData.type === 'oferta' ? 'Oferta' : 'Demanda'}</p>
            <p className="text-sm"><span className="font-medium">Títol:</span> {formData.title}</p>
            <p className="text-sm"><span className="font-medium">Categoria:</span> {formData.category}</p>
            <p className="text-sm"><span className="font-medium">Descripció:</span> {formData.description}</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900">Detalls</h3>
          <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-medium">Preu:</span> {
                formData.price
                  ? `${formData.price}€ (${formData.priceType})`
                  : 'No especificat'
              }
            </p>
            <p className="text-sm"><span className="font-medium">Estat:</span> {
              formData.condition === 'nou' ? 'Nou' :
              formData.condition === 'com_nou' ? 'Com nou' : 'Usat'
            }</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900">Ubicació</h3>
          <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm"><span className="font-medium">Província:</span> {formData.province}</p>
            <p className="text-sm"><span className="font-medium">Població:</span> {formData.city}</p>
            {formData.postalCode && (
              <p className="text-sm"><span className="font-medium">Codi postal:</span> {formData.postalCode}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900">Dades de contacte</h3>
          <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm"><span className="font-medium">Nom:</span> {formData.contactName}</p>
            <p className="text-sm"><span className="font-medium">Telèfon:</span> {formData.contactPhone}</p>
            <p className="text-sm"><span className="font-medium">Email:</span> {formData.contactEmail}</p>
            {formData.contactSchedule && (
              <p className="text-sm"><span className="font-medium">Horari:</span> {formData.contactSchedule}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900">Configuració d'administrador</h3>
          <div className="mt-2 bg-purple-50 p-4 rounded-lg space-y-2">
            <p className="text-sm"><span className="font-medium">Destacat:</span> {formData.isFeatured ? 'Sí' : 'No'}</p>
            <p className="text-sm"><span className="font-medium">Anclat:</span> {formData.isPinned ? 'Sí' : 'No'}</p>
            <p className="text-sm"><span className="font-medium">Prioritat:</span> {
              formData.priority === 'normal' ? 'Normal' :
              formData.priority === 'high' ? 'Alta' : 'Urgent'
            }</p>
            <p className="text-sm"><span className="font-medium">Moderació:</span> {
              formData.moderationStatus === 'approved' ? 'Aprovat' : 'Pendent'
            }</p>
          </div>
        </div>

        {formData.images.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900">Imatges ({formData.images.length})</h3>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {formData.images.slice(0, 4).map((image: File, index: number) => (
                <img
                  key={index}
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          onClick={onSaveDraft}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Guardant...
            </>
          ) : (
            <>
              📄 Guardar com a borrador
            </>
          )}
        </button>

        <button
          onClick={onPublish}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {mode === 'edit' ? 'Actualitzant...' : 'Publicant...'}
            </>
          ) : (
            <>
              {mode === 'edit' ? '✏️ Actualitzar anunci' : '🚀 Publicar anunci'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}