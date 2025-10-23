'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Eye,
  Upload,
  X,
  Plus,
  Info,
  Tag,
  Calendar,
  ShoppingBag,
  Image,
  CheckCircle,
  ExternalLink,
  Phone,
  Mail,
  FileText,
  QrCode,
  Ticket
} from 'lucide-react';

import WizardLayout, { WizardStep } from '../../../../components/wizard/WizardLayout';
import WizardSteps from './WizardSteps';

const {
  Step1Basic,
  Step2Pricing,
  Step3Validity,
  Step4Details,
  Step5Acquisition,
  Step6Images,
  Step7Review
} = WizardSteps;

interface Company {
  id: number;
  name: string;
}

interface WizardFormData {
  // Step 1 - Información básica
  title: string;
  companyId: string;
  category: string;
  subcategory: string;
  description: string;

  // Step 2 - Precios y descuentos
  originalPrice: string;
  discountPrice: string;
  discountPercentage: string;
  discountType: 'percentage' | 'fixed';
  stock: string;
  isFree: boolean;

  // Step 3 - Validez y límites
  validFrom: string;
  validUntil: string;
  maxUsage: string;
  minQuantity: string;
  maxQuantity: string;

  // Step 4 - Detalles
  includes: string[];
  conditions: string[];
  exclusions: string[];
  instructions: string[];
  returnPolicy: string;

  // Step 5 - Métodos de adquisición
  acquisitionModes: {
    directContact: boolean;
    externalLink: boolean;
    promoCode: boolean;
    digitalCoupon: boolean;
    internalForm: boolean;
  };
  directContactConfig: {
    phone: string;
    email: string;
    contactPerson: string;
  };
  externalLinkConfig: {
    url: string;
    description: string;
    buttonText: string;
  };
  promoCodeConfig: {
    code: string;
    instructions: string;
    usageLimit: string;
  };
  digitalCouponConfig: {
    template: string;
    qrEnabled: boolean;
    barcodeEnabled: boolean;
    terms: string;
    usageLimit: string;
    validationRequired: boolean;
  };
  internalFormConfig: {
    fields: string[];
    autoApproval: boolean;
    notifyCompany: boolean;
  };

  // Step 6 - Imágenes
  images: File[];
  imagePreviews: string[];

  // Step 7 - Revisión
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
  exclusive: boolean;
  badges: string[];
}

interface OfferWizardProps {
  onClose: () => void;
}

export const OfferWizard: React.FC<OfferWizardProps> = ({ onClose }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<WizardFormData>({
    // Step 1
    title: '',
    companyId: '',
    category: '',
    subcategory: '',
    description: '',

    // Step 2
    originalPrice: '',
    discountPrice: '',
    discountPercentage: '',
    discountType: 'percentage',
    stock: '',
    isFree: false,

    // Step 3
    validFrom: '',
    validUntil: '',
    maxUsage: '',
    minQuantity: '1',
    maxQuantity: '',

    // Step 4
    includes: [],
    conditions: [],
    exclusions: [],
    instructions: [],
    returnPolicy: '',

    // Step 5
    acquisitionModes: {
      directContact: false,
      externalLink: false,
      promoCode: false,
      digitalCoupon: false,
      internalForm: false,
    },
    directContactConfig: {
      phone: '',
      email: '',
      contactPerson: '',
    },
    externalLinkConfig: {
      url: '',
      description: '',
      buttonText: 'Anar a l\'oferta',
    },
    promoCodeConfig: {
      code: '',
      instructions: '',
      usageLimit: '',
    },
    digitalCouponConfig: {
      template: 'default',
      qrEnabled: true,
      barcodeEnabled: true,
      terms: '',
      usageLimit: '',
      validationRequired: true,
    },
    internalFormConfig: {
      fields: ['name', 'email', 'organization'],
      autoApproval: false,
      notifyCompany: true,
    },

    // Step 6
    images: [],
    imagePreviews: [],

    // Step 7
    status: 'DRAFT',
    featured: false,
    exclusive: false,
    badges: [],
  });

  const categories = [
    { value: 'tecnologia', label: 'Tecnologia', subcategories: ['Ordinadors', 'Software', 'Mòbils', 'Accessoris'] },
    { value: 'vehicles', label: 'Vehicles', subcategories: ['Cotxes', 'Motos', 'Furgonetes', 'Accessoris'] },
    { value: 'immobiliaria', label: 'Immobiliària', subcategories: ['Lloguer', 'Venda', 'Locals', 'Oficines'] },
    { value: 'formacio', label: 'Formació', subcategories: ['Cursos', 'Màsters', 'Certificacions', 'Tallers'] },
    { value: 'serveis', label: 'Serveis', subcategories: ['Consultoria', 'Assessorament', 'Manteniment', 'Neteja'] },
    { value: 'material', label: 'Material Oficina', subcategories: ['Mobiliari', 'Papereria', 'Consumibles', 'Equipament'] },
    { value: 'altres', label: 'Altres', subcategories: [] }
  ];

  const wizardSteps: WizardStep[] = [
    {
      title: 'Informació Bàsica',
      icon: <Info className="w-5 h-5" />,
      component: <Step1Basic formData={formData} updateField={updateField} errors={errors} companies={companies} categories={categories} />
    },
    {
      title: 'Preus i Descomptes',
      icon: <Tag className="w-5 h-5" />,
      component: <Step2Pricing formData={formData} updateField={updateField} errors={errors} calculateDiscount={calculateDiscount} />
    },
    {
      title: 'Validesa i Límits',
      icon: <Calendar className="w-5 h-5" />,
      component: <Step3Validity formData={formData} updateField={updateField} errors={errors} />
    },
    {
      title: 'Detalls de l\'Oferta',
      icon: <ShoppingBag className="w-5 h-5" />,
      component: <Step4Details formData={formData} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} errors={errors} updateField={updateField} />
    },
    {
      title: 'Mètodes d\'Adquisició',
      icon: <Ticket className="w-5 h-5" />,
      component: <Step5Acquisition formData={formData} updateField={updateField} errors={errors} />
    },
    {
      title: 'Imatges',
      icon: <Image className="w-5 h-5" />,
      component: <Step6Images formData={formData} handleImageUpload={handleImageUpload} removeImage={removeImage} errors={errors} />
    },
    {
      title: 'Revisió i Publicació',
      icon: <CheckCircle className="w-5 h-5" />,
      component: <Step7Review formData={formData} companies={companies} categories={categories} updateField={updateField} />
    }
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCompanies(data);
        } else if (data.data && Array.isArray(data.data)) {
          setCompanies(data.data);
        } else {
          setCompanies([]);
        }
      }
    } catch (err) {
      console.error('Error loading companies:', err);
      setCompanies([]);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      }

      // Para campos anidados
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addArrayItem = (field: keyof WizardFormData, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: keyof WizardFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const calculateDiscount = (original: string, discount: string) => {
    const orig = parseFloat(original);
    const disc = parseFloat(discount);
    if (orig && disc) {
      const percentage = ((orig - disc) / orig * 100).toFixed(0);
      updateField('discountPercentage', percentage);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: File[] = [];
      const newPreviews: string[] = [];

      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          newImages.push(file);

          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result as string);
            if (newPreviews.length === newImages.length) {
              setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages],
                imagePreviews: [...prev.imagePreviews, ...newPreviews]
              }));
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'El títol és obligatori';
        if (!formData.companyId) newErrors.companyId = 'Selecciona una empresa';
        if (!formData.category) newErrors.category = 'La categoria és obligatòria';
        if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria';
        if (formData.description.length < 100) newErrors.description = 'La descripció ha de tenir mínim 100 caràcters';
        break;

      case 2:
        if (!formData.isFree) {
          if (!formData.originalPrice) newErrors.originalPrice = 'El preu original és obligatori';
          if (!formData.discountPrice) newErrors.discountPrice = 'El preu amb descompte és obligatori';
          if (parseFloat(formData.discountPrice) >= parseFloat(formData.originalPrice)) {
            newErrors.discountPrice = 'El preu amb descompte ha de ser menor que l\'original';
          }
        }
        break;

      case 3:
        if (!formData.validFrom) newErrors.validFrom = 'La data d\'inici és obligatòria';
        if (!formData.validUntil) newErrors.validUntil = 'La data de fi és obligatòria';
        if (formData.validFrom && formData.validUntil) {
          if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
            newErrors.validUntil = 'La data de fi ha de ser posterior a la d\'inici';
          }
        }
        break;

      case 4:
        if (formData.includes.length === 0) newErrors.includes = 'Afegeix almenys un element inclòs';
        if (formData.instructions.length === 0) newErrors.instructions = 'Afegeix almenys una instrucció';
        break;

      case 5:
        const hasAcquisitionMode = Object.values(formData.acquisitionModes).some(mode => mode);
        if (!hasAcquisitionMode) {
          newErrors.acquisitionModes = 'Selecciona almenys un mètode d\'adquisició';
        }

        // Validar configuraciones específicas si están activas
        if (formData.acquisitionModes.directContact) {
          if (!formData.directContactConfig.phone && !formData.directContactConfig.email) {
            newErrors['directContactConfig.contact'] = 'Proporciona almenys un mètode de contacte';
          }
        }

        if (formData.acquisitionModes.externalLink) {
          if (!formData.externalLinkConfig.url) {
            newErrors['externalLinkConfig.url'] = 'La URL és obligatòria';
          }
        }

        if (formData.acquisitionModes.promoCode) {
          if (!formData.promoCodeConfig.code) {
            newErrors['promoCodeConfig.code'] = 'El codi promocional és obligatori';
          }
        }
        break;

      case 6:
        if (formData.images.length === 0) {
          newErrors.images = 'Afegeix almenys una imatge';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, wizardSteps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Upload images first
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          const imageFormData = new FormData();
          imageFormData.append('image', image);

          const imageResponse = await fetch('http://localhost:5000/api/v1/cloudinary/offers', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: imageFormData
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            imageUrls.push(imageData.data.url);
          }
        }
      }

      // Prepare data for submission
      const submitData = {
        title: formData.title,
        companyId: parseInt(formData.companyId),
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        originalPrice: formData.isFree ? 0 : parseFloat(formData.originalPrice),
        discountPrice: formData.isFree ? 0 : parseFloat(formData.discountPrice),
        discountPercentage: parseInt(formData.discountPercentage) || 0,
        discountType: formData.discountType,
        stock: formData.stock ? parseInt(formData.stock) : null,
        isFree: formData.isFree,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        minQuantity: parseInt(formData.minQuantity) || 1,
        maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
        includes: formData.includes,
        conditions: formData.conditions,
        exclusions: formData.exclusions,
        instructions: formData.instructions,
        returnPolicy: formData.returnPolicy,
        acquisitionModes: formData.acquisitionModes,
        directContactConfig: formData.directContactConfig,
        externalLinkConfig: formData.externalLinkConfig,
        promoCodeConfig: formData.promoCodeConfig,
        digitalCouponConfig: formData.digitalCouponConfig,
        internalFormConfig: formData.internalFormConfig,
        images: imageUrls,
        status: formData.status,
        featured: formData.featured,
        exclusive: formData.exclusive,
        badges: formData.badges
      };

      const response = await fetch('http://localhost:5000/api/v1/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        alert('Oferta creada correctament!');
        router.push('/admin/ofertas/listar');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear l\'oferta');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error de connexió');
    } finally {
      setIsLoading(false);
    }
  };

  const canGoNext = validateStep(currentStep);
  const isLastStep = currentStep === wizardSteps.length;

  return (
    <WizardLayout
      steps={wizardSteps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSave}
      onClose={onClose}
      canGoNext={canGoNext}
      isLastStep={isLastStep}
      isLoading={isLoading}
      title="Crear Nova Oferta VIP"
      submitText="Crear Oferta"
      loadingText="Creant..."
    >
      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium mb-1">
            Cal completar els camps obligatoris:
          </p>
          <ul className="text-sm text-red-700 list-disc list-inside">
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </WizardLayout>
  );
};

export default OfferWizard;