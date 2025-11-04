'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
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

import WizardSteps from './AssessoramentWizardSteps';

const {
  Step1Basic,
  Step2Expert,
  Step3Modalitats,
  Step4Contingut,
  Step5Gratuit,
  Step6Imatge,
  Step7Review
} = WizardSteps;

interface Company {
  id: number;
  name: string;
}

interface ModalityConfig {
  tipus: 'presencial' | 'online' | 'telefonica' | 'email';
  activa: boolean;
  config?: {
    durada?: number;
    places_disponibles?: number;
    instruccions?: string;
  };
}

interface WizardFormData {
  // Step 1 - Información básica
  titol: string;
  subtitol: string;
  categoria: string;
  empresa_id: string;
  descripcio: string;

  // Step 2 - Expert
  expert_nom: string;
  expert_carrec: string;
  expert_experiencia: string;
  expert_clients: string;
  expert_formacio: string;
  expert_colegiada: string;
  expert_frase: string;
  expert_linkedin: string;

  // Step 3 - Modalitats
  modalitats: ModalityConfig[];

  // Step 4 - Contingut
  que_inclou: string[];
  dirigit_a: string[];

  // Step 5 - Model gratuït
  per_que_gratuit: string;

  // Step 6 - Imatge i badges
  imagen: string;
  badges: string[];

  // Final
  status: 'esborrany' | 'publicat' | 'inactiu';
}

interface OfferWizardProps {
  onClose: () => void;
}

export const AssessoramentWizard: React.FC<OfferWizardProps> = ({ onClose }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<WizardFormData>({
    titol: '',
    subtitol: '',
    categoria: '',
    empresa_id: '',
    descripcio: '',
    expert_nom: '',
    expert_carrec: '',
    expert_experiencia: '',
    expert_clients: '',
    expert_formacio: '',
    expert_colegiada: '',
    expert_frase: '',
    expert_linkedin: '',
    modalitats: [
      { tipus: 'presencial', activa: false, config: { durada: 60, places_disponibles: 10 } },
      { tipus: 'online', activa: false, config: { durada: 45, places_disponibles: 15 } },
      { tipus: 'telefonica', activa: false, config: { durada: 30, places_disponibles: 20 } },
      { tipus: 'email', activa: false, config: { durada: 0, places_disponibles: 50 } }
    ],
    que_inclou: [],
    dirigit_a: [],
    per_que_gratuit: '',
    imagen: '',
    badges: [],
    status: 'esborrany'
  });

  const steps = [
    { id: 1, title: 'Informació Bàsica', icon: '📝' },
    { id: 2, title: 'Expert', icon: '👨‍💼' },
    { id: 3, title: 'Modalitats', icon: '📞' },
    { id: 4, title: 'Contingut', icon: '📋' },
    { id: 5, title: 'Model Gratuït', icon: '💡' },
    { id: 6, title: 'Imatge', icon: '🖼️' },
    { id: 7, title: 'Revisió', icon: '👁️' }
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      // Cargar empresas desde localStorage
      const createdEmpresas = JSON.parse(localStorage.getItem('createdEmpresas') || '[]');

      // Convertir al formato esperado para companies
      const companiesFromEmpresas = createdEmpresas
        .filter((empresa: any) => empresa.status === 'published' && empresa.isVerified)
        .map((empresa: any) => ({
          id: empresa.id,
          name: empresa.name
        }));

      // Empresas de ejemplo
      const sampleCompanies = [
        { id: 1, name: 'TechSolutions BCN' },
        { id: 2, name: 'Consultoria Puig & Associats' },
        { id: 3, name: 'EcoServeis Catalunya' },
        { id: 4, name: 'Infraestructures Mediterrània' },
        { id: 5, name: 'DataAnalytics Pro' },
        { id: 6, name: 'Mobilitat Urbana SL' },
        { id: 7, name: 'Seguretat Integral Catalunya' },
        { id: 8, name: 'Formació Professional Plus' }
      ];

      // Combinar empresas creadas con empresas de ejemplo
      const allCompanies = [...companiesFromEmpresas, ...sampleCompanies];
      setCompanies(allCompanies);
    } catch (err) {
      console.error('Error loading companies:', err);
      setCompanies([]);
    }
  };

  const updateField = (field: keyof WizardFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addArrayItem = (field: 'que_inclou' | 'dirigit_a' | 'badges', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      updateField(field, [...formData[field], value.trim()]);
    }
  };

  const removeArrayItem = (field: 'que_inclou' | 'dirigit_a' | 'badges', value: string) => {
    updateField(field, formData[field].filter(item => item !== value));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.titol.trim()) newErrors.titol = 'El títol és obligatori';
        if (!formData.categoria) newErrors.categoria = 'La categoria és obligatòria';
        if (!formData.empresa_id) newErrors.empresa_id = 'L\'empresa és obligatòria';
        if (!formData.descripcio.trim()) newErrors.descripcio = 'La descripció és obligatòria';
        break;

      case 2:
        if (!formData.expert_nom.trim()) newErrors.expert_nom = 'El nom de l\'expert és obligatori';
        if (!formData.expert_carrec.trim()) newErrors.expert_carrec = 'El càrrec és obligatori';
        if (!formData.expert_experiencia.trim()) newErrors.expert_experiencia = 'L\'experiència és obligatòria';
        break;

      case 3:
        const hasActiveModality = formData.modalitats.some(m => m.activa);
        if (!hasActiveModality) newErrors.modalitats = 'Has de seleccionar almenys una modalitat de consulta';
        break;

      case 4:
        if (formData.que_inclou.length === 0) newErrors.que_inclou = 'Has d\'afegir almenys un element a "Què inclou"';
        if (formData.dirigit_a.length === 0) newErrors.dirigit_a = 'Has d\'afegir almenys un element a "Dirigit a"';
        break;

      case 5:
        if (!formData.per_que_gratuit.trim()) newErrors.per_que_gratuit = 'L\'explicació del model gratuït és obligatòria';
        break;
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

  const handleSave = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      // Generate slug
      const slug = formData.titol.toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const assessoramentData = {
        id: Date.now(),
        ...formData,
        slug,
        modalitats: formData.modalitats.filter(m => m.activa),
        valoracio: 0,
        total_valoracions: 0,
        consultes_realitzades: 0,
        stats: {
          views: 0,
          bookings: 0,
          completions: 0,
          ratio_conversio: 0
        },
        createdAt: new Date().toISOString(),
        empresa: companies.find(c => c.id.toString() === formData.empresa_id) || { id: 1, nom: 'Empresa' }
      };

      // Guardar en localStorage
      const existingAssessoraments = JSON.parse(localStorage.getItem('createdAssessoraments') || '[]');
      const updatedAssessoraments = [...existingAssessoraments, assessoramentData];
      localStorage.setItem('createdAssessoraments', JSON.stringify(updatedAssessoraments));

      router.push('/admin/assessoraments/listar');
    } catch (error) {
      console.error('Error al guardar assessorament:', error);
      alert('Error al crear l\'assessorament');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Basic formData={formData} updateField={updateField} companies={companies} errors={errors} />;
      case 2:
        return <Step2Expert formData={formData} updateField={updateField} errors={errors} />;
      case 3:
        return <Step3Modalitats formData={formData} updateField={updateField} errors={errors} />;
      case 4:
        return <Step4Contingut formData={formData} updateField={updateField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} errors={errors} />;
      case 5:
        return <Step5Gratuit formData={formData} updateField={updateField} errors={errors} />;
      case 6:
        return <Step6Imatge formData={formData} updateField={updateField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} errors={errors} />;
      case 7:
        return <Step7Review formData={formData} updateField={updateField} companies={companies} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Crear Nou Assessorament</h1>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= step.id ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep === step.id ? 'bg-white text-green-600' :
                    currentStep > step.id ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                  }`}>
                    {currentStep > step.id ? '✓' : step.icon}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-8 md:w-16 mx-2 ${
                    currentStep > step.id ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="text-sm text-gray-600">
              Pas {currentStep} de {steps.length}
            </div>

            <div className="flex gap-3">
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Següent
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creant...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Crear Assessorament
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default AssessoramentWizard;