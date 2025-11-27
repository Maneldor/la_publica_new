'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Save
} from 'lucide-react';

import WizardSteps from './FormacioWizardSteps';

const {
  Step1TipusCurs,
  Step2Informacio,
  Step3Contingut,
  Step4Instructor,
  Step5Preus,
  Step6Certificat,
  Step7Review
} = WizardSteps;

type CourseType = 'micro' | 'basic' | 'complet' | 'premium';
type ModalityType = 'online' | 'presencial' | 'hibrid';
type CertificateType = 'none' | 'digital' | 'digital_fisic' | 'oficial';

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'exercise';
  duration: number;
  content: string;
  videoUrl: string;
  isPreview: boolean;
  order: number;
}

interface Instructor {
  id?: string;
  name: string;
  institution?: string;
  email?: string;
  bio?: string;
}

interface WizardFormData {
  // Step 1: Tipo de curso
  courseType: CourseType;

  // Step 2: Información básica
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string;
  tags: string;
  coverImage: string;

  // Step 3A: Contenido IA (para micro cursos)
  aiPrompt: string;
  aiLessons: number;
  aiDuration: number;
  aiFormats: string[];

  // Step 3B: Contenido manual
  modules: Module[];

  // Step 4: Instructor
  hasInstructor: boolean;
  selectedInstructor: Instructor | null;

  // Step 5: Precios y modalidad
  pricingType: 'gratuit' | 'pagament';
  price: number;
  memberPrice: number;
  memberDiscount: number;
  modalities: ModalityType[];
  address: string;
  capacity: number;
  hasSchedule: boolean;
  startDate: string;
  endDate: string;
  schedule: string;
  availableSlots: number;

  // Step 6: Certificado y extras
  hasCertificate: boolean;
  certificateType: CertificateType;
  certificateTemplate: string;
  hasDownloadables: boolean;
  hasProjects: boolean;
  hasExercises: boolean;
  hasForum: boolean;
  telegramGroup: string;
  hasGuarantee: boolean;

  // Step 7: Publicación
  publishType: 'immediate' | 'scheduled' | 'draft';
  publishDate: string;
  visibility: 'public' | 'members' | 'private';
  badges: string[];
}

interface FormacioWizardProps {
  onClose: () => void;
}

export const FormacioWizard: React.FC<FormacioWizardProps> = ({ onClose }) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<{lessons: Lesson[], totalDuration: number} | null>(null);

  const [formData, setFormData] = useState<WizardFormData>({
    // Step 1: Tipo de curso
    courseType: 'micro',

    // Step 2: Información básica
    title: '',
    subtitle: '',
    description: '',
    category: '',
    level: 'Principiant',
    language: 'Català',
    tags: '',
    coverImage: '',

    // Step 3A: Contenido IA
    aiPrompt: '',
    aiLessons: 3,
    aiDuration: 30,
    aiFormats: ['text', 'videos', 'quiz'],

    // Step 3B: Contenido manual
    modules: [],

    // Step 4: Instructor
    hasInstructor: false,
    selectedInstructor: null,

    // Step 5: Precios y modalidad
    pricingType: 'gratuit',
    price: 0,
    memberPrice: 0,
    memberDiscount: 0,
    modalities: ['online'],
    address: '',
    capacity: 25,
    hasSchedule: false,
    startDate: '',
    endDate: '',
    schedule: '',
    availableSlots: 25,

    // Step 6: Certificado y extras
    hasCertificate: false,
    certificateType: 'none',
    certificateTemplate: 'template-1',
    hasDownloadables: false,
    hasProjects: false,
    hasExercises: false,
    hasForum: false,
    telegramGroup: '',
    hasGuarantee: false,

    // Step 7: Publicación
    publishType: 'immediate',
    publishDate: '',
    visibility: 'public',
    badges: []
  });

  // Configuraciones de tipos de curso
  const courseTypeConfig = {
    micro: {
      name: 'MICRO-CURS',
      subtitle: 'Curs ràpid generat amb IA',
      features: ['1-3 lliçons', '15-30 minuts', 'Sense instructor', 'Gratuït', 'Ideal per: Pills formatives'],
      steps: [1, 2, 3, 7] // Solo ciertos pasos
    },
    basic: {
      name: 'CURS BÀSIC',
      subtitle: 'Curs estructurat estàndard',
      features: ['5-10 lliçons', '2-5 hores', 'Instructor opcional', 'Gratuït o de pagament', 'Ideal per: Formació contínua'],
      steps: [1, 2, 3, 4, 5, 7]
    },
    complet: {
      name: 'CURS COMPLET',
      subtitle: 'Curs professional amb totes les funcionalitats',
      features: ['20-50 lliçons', '10-30 hores', 'Amb instructor obligatori', 'Pagament', 'Mòduls, projectes, certificat', 'Ideal per: Formació especialitzada'],
      steps: [1, 2, 3, 4, 5, 6, 7]
    },
    premium: {
      name: 'CURS PREMIUM',
      subtitle: 'Curs avançat amb seguiment personalitzat',
      features: ['50+ lliçons', '30+ hores', 'Instructor + tutors', 'Pagament + mentoria', 'Certificat oficial reconegut', 'Ideal per: Especializacions'],
      steps: [1, 2, 3, 4, 5, 6, 7]
    }
  };

  const steps = [
    { id: 1, title: 'Tipus de Curs', icon: '📚' },
    { id: 2, title: 'Informació', icon: '📝' },
    { id: 3, title: 'Contingut', icon: '📋' },
    { id: 4, title: 'Instructor', icon: '👨‍🏫' },
    { id: 5, title: 'Preus', icon: '💰' },
    { id: 6, title: 'Certificat', icon: '🎓' },
    { id: 7, title: 'Revisió', icon: '👁️' }
  ];

  const updateField = <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => {
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.courseType) newErrors.courseType = 'Selecciona un tipus de curs';
        break;

      case 2:
        if (!formData.title.trim()) newErrors.title = 'El títol és obligatori';
        if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria';
        if (!formData.category) newErrors.category = 'La categoria és obligatòria';
        break;

      case 3:
        if (formData.courseType === 'micro') {
          if (!formData.aiPrompt.trim() && !aiGeneratedContent) {
            newErrors.aiPrompt = 'Cal generar contingut amb IA o afegir un prompt';
          }
        } else {
          if (formData.modules.length === 0) {
            newErrors.modules = 'Cal afegir almenys un mòdul';
          }
        }
        break;

      case 4:
        if (formData.hasInstructor && !formData.selectedInstructor) {
          newErrors.selectedInstructor = 'Cal seleccionar un instructor';
        }
        break;

      case 5:
        if (formData.pricingType === 'pagament' && formData.price <= 0) {
          newErrors.price = 'Cal especificar un preu vàlid';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const allowedSteps = courseTypeConfig[formData.courseType].steps;
      const currentIndex = allowedSteps.indexOf(currentStep);
      if (currentIndex < allowedSteps.length - 1) {
        setCurrentStep(allowedSteps[currentIndex + 1]);
      }
    }
  };

  const handlePrevious = () => {
    const allowedSteps = courseTypeConfig[formData.courseType].steps;
    const currentIndex = allowedSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(allowedSteps[currentIndex - 1]);
    }
  };

  const handleSave = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      // Convertir datos del formulario al formato de curso
      const courseData = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        aiGeneratedContent,
        // Compatibilidad legacy
        instructor: formData.selectedInstructor?.name || '',
        institution: formData.selectedInstructor?.institution || '',
        duration: formData.courseType === 'micro' ? formData.aiDuration / 60 : calculateTotalDuration(),
        mode: formData.modalities[0] || 'online',
        price: formData.price,
        status: formData.publishType === 'draft' ? 'DRAFT' : 'PUBLISHED'
      };

      // Guardar en localStorage (reemplazar con llamada a API)
      const courses = JSON.parse(localStorage.getItem('courses') || '[]');
      courses.push(courseData);
      localStorage.setItem('courses', JSON.stringify(courses));

      router.push('/admin/formacio/listar');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error al crear el curs');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalDuration = () => {
    return formData.modules.reduce((total, module) => {
      return total + module.lessons.reduce((moduleTotal, lesson) => {
        return moduleTotal + lesson.duration;
      }, 0);
    }, 0);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1TipusCurs formData={formData} updateField={updateField} errors={errors} courseTypeConfig={courseTypeConfig} />;
      case 2:
        return <Step2Informacio formData={formData} updateField={updateField} errors={errors} />;
      case 3:
        return <Step3Contingut formData={formData} updateField={updateField} errors={errors} aiGenerating={aiGenerating} setAiGenerating={setAiGenerating} aiGeneratedContent={aiGeneratedContent} setAiGeneratedContent={setAiGeneratedContent} calculateTotalDuration={calculateTotalDuration} />;
      case 4:
        return <Step4Instructor formData={formData} updateField={updateField} errors={errors} />;
      case 5:
        return <Step5Preus formData={formData} updateField={updateField} errors={errors} />;
      case 6:
        return <Step6Certificat formData={formData} updateField={updateField} errors={errors} />;
      case 7:
        return <Step7Review formData={formData} updateField={updateField} courseTypeConfig={courseTypeConfig} calculateTotalDuration={calculateTotalDuration} aiGeneratedContent={aiGeneratedContent} errors={errors} />;
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
            <h1 className="text-2xl font-bold">Crear Nou Curs de Formació</h1>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const allowedSteps = courseTypeConfig[formData.courseType].steps;
              const isStepAllowed = allowedSteps.includes(step.id);
              const isActive = currentStep === step.id;
              const isCompleted = allowedSteps.indexOf(currentStep) > allowedSteps.indexOf(step.id);
              const isLast = index === steps.length - 1;

              if (!isStepAllowed) return null;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 ${
                      isActive || isCompleted ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-white text-green-600' :
                      isCompleted ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                  </div>
                  {!isLast && allowedSteps.includes(steps[index + 1]?.id) && (
                    <div className={`h-1 w-8 md:w-16 mx-2 ${
                      isCompleted ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              );
            })}
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
              disabled={courseTypeConfig[formData.courseType].steps.indexOf(currentStep) === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="text-sm text-gray-600">
              Pas {courseTypeConfig[formData.courseType].steps.indexOf(currentStep) + 1} de {courseTypeConfig[formData.courseType].steps.length}
            </div>

            <div className="flex gap-3">
              {currentStep === 7 ? (
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
                      Crear Curs
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Següent
                  <ArrowRight className="w-4 h-4" />
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

export default FormacioWizard;