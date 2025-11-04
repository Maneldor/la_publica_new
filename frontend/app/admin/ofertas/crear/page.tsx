'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Info,
  Building2,
  Euro,
  Calendar,
  Images,
  FileText,
  Link as LinkIcon,
  Settings,
  Target,
  Upload,
  X,
  Plus,
  Minus
} from 'lucide-react';
import SimpleWizard from '@/components/wizard/SimpleWizard';

interface Company {
  id: number;
  name: string;
  logo: string;
  rating: number;
  reviews: number;
  verified: boolean;
  memberSince: number;
}

interface OfferFormData {
  // Step 1 - Información básica
  title: string;
  description: string;
  category: string;
  subcategory: string;

  // Step 2 - Empresa
  company: Company;

  // Step 3 - Precios y descuentos
  originalPrice: number;
  offerPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  isFree: boolean;

  // Step 4 - Fechas y límites
  validFrom: string;
  validUntil: string;
  maxUsage: number;
  minQuantity: number;
  maxQuantity: number;

  // Step 5 - Imágenes
  images: File[];

  // Step 6 - Contenido detallado
  includes: string[];
  instructions: string[];
  badges: string[];

  // Step 7 - Condiciones
  conditions: {
    validity: string;
    usageLimit: string;
    requirements: string[];
    exclusions: string[];
    returns: string;
  };

  // Step 8 - Enlaces y códigos
  promoCode: string;
  directLink: string;

  // Step 9 - Configuración y publicación
  featured: boolean;
  exclusive: boolean;
  publishTo: {
    grupos: boolean;
    ofertas: boolean;
    empresas: boolean;
  };
}

export default function CrearOfertaAdminPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OfferFormData>({
    // Step 1
    title: '',
    description: '',
    category: '',
    subcategory: '',

    // Step 2
    company: {
      id: 0,
      name: '',
      logo: '',
      rating: 0,
      reviews: 0,
      verified: false,
      memberSince: new Date().getFullYear()
    },

    // Step 3
    originalPrice: 0,
    offerPrice: 0,
    discount: 0,
    discountType: 'percentage',
    isFree: false,

    // Step 4
    validFrom: '',
    validUntil: '',
    maxUsage: 0,
    minQuantity: 1,
    maxQuantity: 10,

    // Step 5
    images: [],

    // Step 6
    includes: [],
    instructions: [],
    badges: [],

    // Step 7
    conditions: {
      validity: '',
      usageLimit: '',
      requirements: [],
      exclusions: [],
      returns: ''
    },

    // Step 8
    promoCode: '',
    directLink: '',

    // Step 9
    featured: false,
    exclusive: false,
    publishTo: {
      grupos: false,
      ofertas: true,
      empresas: false
    }
  });

  const steps = [
    { id: 1, title: 'Informació', icon: <Info className="w-5 h-5" /> },
    { id: 2, title: 'Empresa', icon: <Building2 className="w-5 h-5" /> },
    { id: 3, title: 'Preus', icon: <Euro className="w-5 h-5" /> },
    { id: 4, title: 'Dates', icon: <Calendar className="w-5 h-5" /> },
    { id: 5, title: 'Imatges', icon: <Images className="w-5 h-5" /> },
    { id: 6, title: 'Contingut', icon: <FileText className="w-5 h-5" /> },
    { id: 7, title: 'Condicions', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 8, title: 'Enllaços', icon: <LinkIcon className="w-5 h-5" /> },
    { id: 9, title: 'Publicació', icon: <Target className="w-5 h-5" /> }
  ];

  const updateField = (field: keyof OfferFormData | string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof OfferFormData],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });

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

  const addToArray = (arrayField: keyof OfferFormData, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [arrayField]: [...(prev[arrayField] as string[]), value.trim()]
      }));
    }
  };

  const removeFromArray = (arrayField: keyof OfferFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayField]: (prev[arrayField] as string[]).filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'El títol és obligatori';
      if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria';
      if (!formData.category) newErrors.category = 'La categoria és obligatòria';
    }

    if (step === 2) {
      if (!formData.company.name.trim()) newErrors['company.name'] = 'El nom de l\'empresa és obligatori';
    }

    if (step === 3) {
      if (!formData.isFree && formData.originalPrice <= 0) {
        newErrors.originalPrice = 'El preu original ha de ser major que 0';
      }
      if (!formData.isFree && formData.offerPrice <= 0) {
        newErrors.offerPrice = 'El preu de l\'oferta ha de ser major que 0';
      }
    }

    if (step === 4) {
      if (!formData.validFrom) newErrors.validFrom = 'La data d\'inici és obligatòria';
      if (!formData.validUntil) newErrors.validUntil = 'La data de final és obligatòria';
    }

    if (step === 5) {
      if (formData.images.length === 0) {
        newErrors.images = 'Has d\'afegir almenys una imatge';
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
      const offerData = {
        ...formData,
        id: Date.now(),
        usageCount: 0,
        views: 0,
        saves: 0,
        rating: 0,
        reviewCount: 0,
        publishedAt: new Date().toISOString(),
        status: isDraft ? 'draft' : 'published',
        imageUrls: formData.images.map(img => URL.createObjectURL(img))
      };

      // Guardar según donde se publique
      if (formData.publishTo.ofertas) {
        const existingOfertas = JSON.parse(localStorage.getItem('createdOfertas') || '[]');
        existingOfertas.push(offerData);
        localStorage.setItem('createdOfertas', JSON.stringify(existingOfertas));
      }

      if (formData.publishTo.grupos) {
        const existingGrupos = JSON.parse(localStorage.getItem('createdGruposOfertas') || '[]');
        existingGrupos.push(offerData);
        localStorage.setItem('createdGruposOfertas', JSON.stringify(existingGrupos));
      }

      if (formData.publishTo.empresas) {
        const existingEmpresas = JSON.parse(localStorage.getItem('createdEmpresasOfertas') || '[]');
        existingEmpresas.push(offerData);
        localStorage.setItem('createdEmpresasOfertas', JSON.stringify(existingEmpresas));
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Oferta creada:', offerData);
      alert('✅ Oferta creada correctament!');
      router.push('/admin/ofertas/listar');
    } catch {
      alert('Error al crear l\'oferta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (confirm('Vols sortir sense guardar els canvis?')) {
      router.push('/admin/ofertas/listar');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} updateField={updateField} errors={errors} />;
      case 2:
        return <Step2Company formData={formData} updateField={updateField} errors={errors} />;
      case 3:
        return <Step3Pricing formData={formData} updateField={updateField} errors={errors} />;
      case 4:
        return <Step4Dates formData={formData} updateField={updateField} errors={errors} />;
      case 5:
        return <Step5Images formData={formData} addImage={addImage} removeImage={removeImage} errors={errors} />;
      case 6:
        return <Step6Content formData={formData} updateField={updateField} addToArray={addToArray} removeFromArray={removeFromArray} errors={errors} />;
      case 7:
        return <Step7Conditions formData={formData} updateField={updateField} addToArray={addToArray} removeFromArray={removeFromArray} errors={errors} />;
      case 8:
        return <Step8Links formData={formData} updateField={updateField} errors={errors} />;
      case 9:
        return <Step9Publication formData={formData} updateField={updateField} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <SimpleWizard
      title="Crear Nova Oferta Completa (Admin)"
      steps={steps}
      currentStep={currentStep}
      onClose={handleClose}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={currentStep === 9 ? () => handleSubmit(false) : undefined}
      isLoading={isLoading}
      submitText="Crear Oferta"
      loadingText="Creant..."
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
    'Mobilitat',
    'Sostenibilitat',
    'Formació',
    'Consultoria',
    'Construcció',
    'Serveis',
    'Subministraments',
    'Altres'
  ];

  const subcategoriesByCategory: Record<string, string[]> = {
    'Tecnologia': ['Ordinadors', 'Software', 'Equipament de xarxa', 'Impressores', 'Mobil i tablets'],
    'Mobilitat': ['Vehicles elèctrics', 'Transport públic', 'Bicicletes', 'Infraestructura'],
    'Sostenibilitat': ['Energia renovable', 'Gestió de residus', 'Eficiència energètica'],
    'Formació': ['Cursos online', 'Formació presencial', 'Certificacions'],
    'Consultoria': ['Legal', 'Tècnica', 'Estratègica', 'Digitalització'],
    'Construcció': ['Obra pública', 'Manteniment', 'Materials', 'Projectes'],
    'Serveis': ['Neteja', 'Seguretat', 'Catering', 'Manteniment'],
    'Subministraments': ['Material d\'oficina', 'Uniformes', 'Mobiliari'],
    'Altres': ['Altres']
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Títol de l'oferta *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: Descuento 25% en Portàtils Professionals"
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
          Descripció detallada *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descriu l'oferta amb detall, beneficis, característiques..."
          maxLength={2000}
        />
        <div className="flex justify-between mt-1">
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
          <p className="text-sm text-gray-500 text-right">{formData.description.length}/2000</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria *
          </label>
          <select
            value={formData.category}
            onChange={(e) => {
              updateField('category', e.target.value);
              updateField('subcategory', ''); // Reset subcategory
            }}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategoria
          </label>
          <select
            value={formData.subcategory}
            onChange={(e) => updateField('subcategory', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!formData.category}
          >
            <option value="">Selecciona una subcategoria</option>
            {formData.category && subcategoriesByCategory[formData.category]?.map(subcat => (
              <option key={subcat} value={subcat}>{subcat}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// Step 2: Empresa
function Step2Company({ formData, updateField, errors }: any) {
  // En una app real, esto vendría de una API de empresas verificadas
  const availableCompanies = [
    { id: 1, name: 'TechSolutions BCN', verified: true, rating: 4.2, reviews: 24 },
    { id: 2, name: 'EcoServeis Catalunya', verified: true, rating: 4.9, reviews: 31 },
    { id: 3, name: 'Consultoria Puig & Associats', verified: true, rating: 4.6, reviews: 18 }
  ];

  const selectCompany = (company: any) => {
    updateField('company', {
      ...company,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=3b82f6&color=fff`,
      memberSince: 2015
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona l'empresa que ofereix aquest descompte *
        </label>
        <div className="space-y-3">
          {availableCompanies.map(company => (
            <div
              key={company.id}
              onClick={() => selectCompany(company)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.company.id === company.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{company.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {company.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✓ Verificada
                      </span>
                    )}
                    <span className="text-sm text-gray-600">
                      ⭐ {company.rating} ({company.reviews} valoracions)
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  🏢
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors['company.name'] && (
          <p className="mt-1 text-sm text-red-600">{errors['company.name']}</p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Empresa seleccionada:</h4>
        {formData.company.name ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
              {formData.company.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{formData.company.name}</p>
              <p className="text-sm text-gray-600">
                ⭐ {formData.company.rating} • {formData.company.reviews} valoracions
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Cap empresa seleccionada</p>
        )}
      </div>
    </div>
  );
}

// Step 3: Precios
function Step3Pricing({ formData, updateField, errors }: any) {
  const calculateDiscount = () => {
    if (formData.originalPrice > 0 && formData.offerPrice > 0) {
      if (formData.discountType === 'percentage') {
        const discount = ((formData.originalPrice - formData.offerPrice) / formData.originalPrice) * 100;
        updateField('discount', Math.round(discount));
      } else {
        updateField('discount', formData.originalPrice - formData.offerPrice);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          id="isFree"
          checked={formData.isFree}
          onChange={(e) => updateField('isFree', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
          🎁 Aquesta oferta és gratuïta
        </label>
      </div>

      {!formData.isFree && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preu original (€) *
            </label>
            <input
              type="number"
              value={formData.originalPrice || ''}
              onChange={(e) => {
                updateField('originalPrice', parseFloat(e.target.value) || 0);
                setTimeout(calculateDiscount, 100);
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.originalPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1200"
              min="0"
              step="0.01"
            />
            {errors.originalPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preu amb descompte (€) *
            </label>
            <input
              type="number"
              value={formData.offerPrice || ''}
              onChange={(e) => {
                updateField('offerPrice', parseFloat(e.target.value) || 0);
                setTimeout(calculateDiscount, 100);
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.offerPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="900"
              min="0"
              step="0.01"
            />
            {errors.offerPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.offerPrice}</p>
            )}
          </div>
        </div>
      )}

      {!formData.isFree && formData.originalPrice > 0 && formData.offerPrice > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Resum del descompte:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700">Estalvi:</span>
              <span className="font-bold ml-2">
                {formData.discountType === 'percentage'
                  ? `${formData.discount}%`
                  : `${formData.discount}€`}
              </span>
            </div>
            <div>
              <span className="text-green-700">Estalvi total:</span>
              <span className="font-bold ml-2">
                {(formData.originalPrice - formData.offerPrice).toFixed(2)}€
              </span>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipus de descompte
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('discountType', 'percentage')}
            className={`p-3 border rounded-lg text-center transition-colors ${
              formData.discountType === 'percentage'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-medium">Percentatge</div>
            <div className="text-sm text-gray-600">Ex: 25% de descompte</div>
          </button>
          <button
            type="button"
            onClick={() => updateField('discountType', 'fixed')}
            className={`p-3 border rounded-lg text-center transition-colors ${
              formData.discountType === 'fixed'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-medium">Import fix</div>
            <div className="text-sm text-gray-600">Ex: 300€ de descompte</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 4: Dates i límits
function Step4Dates({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data d'inici *
          </label>
          <input
            type="date"
            value={formData.validFrom}
            onChange={(e) => updateField('validFrom', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.validFrom ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.validFrom && (
            <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de finalització *
          </label>
          <input
            type="date"
            value={formData.validUntil}
            onChange={(e) => updateField('validUntil', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.validUntil ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.validUntil && (
            <p className="mt-1 text-sm text-red-600">{errors.validUntil}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Màxim d'usos totals
          </label>
          <input
            type="number"
            value={formData.maxUsage || ''}
            onChange={(e) => updateField('maxUsage', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="50"
            min="0"
          />
          <p className="text-sm text-gray-500 mt-1">
            Deixa en 0 per il·limitat
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantitat mínima
          </label>
          <input
            type="number"
            value={formData.minQuantity || ''}
            onChange={(e) => updateField('minQuantity', parseInt(e.target.value) || 1)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantitat màxima
          </label>
          <input
            type="number"
            value={formData.maxQuantity || ''}
            onChange={(e) => updateField('maxQuantity', parseInt(e.target.value) || 10)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="10"
            min="1"
          />
        </div>
      </div>
    </div>
  );
}

// Step 5: Imágenes
function Step5Images({ formData, addImage, removeImage, errors }: any) {
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
          Imatges de l'oferta *
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
            Afegeix imatges del producte o servei (JPG, PNG, màx 5MB cada una)
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
            Imatges afegides ({formData.images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

// Step 6: Contingut detallat
function Step6Content({ formData, updateField, addToArray, removeFromArray, errors }: any) {
  const [newInclude, setNewInclude] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newBadge, setNewBadge] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Què inclou l'oferta
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newInclude}
            onChange={(e) => setNewInclude(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Garantia de 3 anys"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('includes', newInclude);
                setNewInclude('');
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              addToArray('includes', newInclude);
              setNewInclude('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {formData.includes.map((item: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">✓ {item}</span>
              <button
                type="button"
                onClick={() => removeFromArray('includes', index)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instruccions per aprofitar l'oferta
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newInstruction}
            onChange={(e) => setNewInstruction(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Fes clic al botó 'Aprofitar oferta'"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('instructions', newInstruction);
                setNewInstruction('');
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              addToArray('instructions', newInstruction);
              setNewInstruction('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {formData.instructions.map((item: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">{index + 1}. {item}</span>
              <button
                type="button"
                onClick={() => removeFromArray('instructions', index)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Distintius (badges)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newBadge}
            onChange={(e) => setNewBadge(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: DESTACADA, EXCLUSIVA MEMBRES"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToArray('badges', newBadge);
                setNewBadge('');
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              addToArray('badges', newBadge);
              setNewBadge('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.badges.map((badge: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {badge}
              <button
                type="button"
                onClick={() => removeFromArray('badges', index)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 7: Condicions
function Step7Conditions({ formData, updateField, addToArray, removeFromArray, errors }: any) {
  const [newRequirement, setNewRequirement] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const currentRequirements = formData.conditions.requirements || [];
      updateField('conditions.requirements', [...currentRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    const currentRequirements = formData.conditions.requirements || [];
    updateField('conditions.requirements', currentRequirements.filter((_: string, i: number) => i !== index));
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      const currentExclusions = formData.conditions.exclusions || [];
      updateField('conditions.exclusions', [...currentExclusions, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    const currentExclusions = formData.conditions.exclusions || [];
    updateField('conditions.exclusions', currentExclusions.filter((_: string, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Validesa de l'oferta
        </label>
        <input
          type="text"
          value={formData.conditions.validity}
          onChange={(e) => updateField('conditions.validity', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Oferta vàlida del 15 octubre al 31 desembre 2025"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Límit d'ús
        </label>
        <input
          type="text"
          value={formData.conditions.usageLimit}
          onChange={(e) => updateField('conditions.usageLimit', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Màxim 50 unitats disponibles"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requisits
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Només per a membres verificats"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addRequirement();
              }
            }}
          />
          <button
            type="button"
            onClick={addRequirement}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {(formData.conditions.requirements || []).map((req: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">• {req}</span>
              <button
                type="button"
                onClick={() => removeRequirement(index)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exclusions
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newExclusion}
            onChange={(e) => setNewExclusion(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: No acumulable amb altres ofertes"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addExclusion();
              }
            }}
          />
          <button
            type="button"
            onClick={addExclusion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {(formData.conditions.exclusions || []).map((exc: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">• {exc}</span>
              <button
                type="button"
                onClick={() => removeExclusion(index)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Política de devolucions
        </label>
        <input
          type="text"
          value={formData.conditions.returns}
          onChange={(e) => updateField('conditions.returns', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: Dret de devolució fins a 30 dies"
        />
      </div>
    </div>
  );
}

// Step 8: Enllaços i codis
function Step8Links({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Codi promocional
        </label>
        <input
          type="text"
          value={formData.promoCode}
          onChange={(e) => updateField('promoCode', e.target.value.toUpperCase())}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: TECH25PUBLICA"
          maxLength={20}
        />
        <p className="text-sm text-gray-500 mt-1">
          Codi que els usuaris podran utilitzar per aplicar el descompte
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enllaç directe
        </label>
        <input
          type="url"
          value={formData.directLink}
          onChange={(e) => updateField('directLink', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://empresa.cat/ofertes-lapublica?token=ABC123"
        />
        <p className="text-sm text-gray-500 mt-1">
          Enllaç directe on els usuaris poden aprofitar l'oferta
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Consell</h4>
        <p className="text-sm text-blue-800">
          Si tens un codi promocional, els usuaris el podran copiar directament.
          Si tens un enllaç directe, podran accedir directament a la pàgina de l'oferta.
          Pots utilitzar ambdós o només un d'ells.
        </p>
      </div>
    </div>
  );
}

// Step 9: Publicació
function Step9Publication({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuració de l'oferta</h3>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
              ⭐ Oferta destacada (apareix a la part superior)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="exclusive"
              checked={formData.exclusive}
              onChange={(e) => updateField('exclusive', e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="exclusive" className="ml-2 text-sm text-gray-700">
              💎 Oferta exclusiva per a membres
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">On vols publicar aquesta oferta?</h3>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="publishOfertas"
              checked={formData.publishTo.ofertas}
              onChange={(e) => updateField('publishTo.ofertas', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="publishOfertas" className="ml-2 text-sm text-gray-700">
              📋 Dashboard d'ofertes per a empleats públics
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="publishGrupos"
              checked={formData.publishTo.grupos}
              onChange={(e) => updateField('publishTo.grupos', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="publishGrupos" className="ml-2 text-sm text-gray-700">
              👥 Grups específics
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="publishEmpresas"
              checked={formData.publishTo.empresas}
              onChange={(e) => updateField('publishTo.empresas', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="publishEmpresas" className="ml-2 text-sm text-gray-700">
              🏢 Secció d'ofertes per a empreses col·laboradores
            </label>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Has de seleccionar almenys un destí per publicar l'oferta
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Resum de l'oferta:</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><span className="font-medium">Títol:</span> {formData.title}</p>
          <p><span className="font-medium">Empresa:</span> {formData.company.name}</p>
          <p><span className="font-medium">Categoria:</span> {formData.category}</p>
          {!formData.isFree && (
            <p><span className="font-medium">Preu:</span> {formData.offerPrice}€ (era {formData.originalPrice}€)</p>
          )}
          <p><span className="font-medium">Vàlid fins:</span> {formData.validUntil}</p>
          <p><span className="font-medium">Imatges:</span> {formData.images.length}</p>
        </div>
      </div>
    </div>
  );
}