'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Tipos para el sistema modular de cursos
type CourseType = 'micro' | 'basic' | 'complet' | 'premium';
type ContentType = 'ai' | 'manual';
type InstructorType = 'none' | 'existing' | 'new';
type PricingType = 'gratuit' | 'pagament';
type ModalityType = 'online' | 'presencial' | 'hibrid';
type CertificateType = 'none' | 'digital' | 'digital_fisic' | 'oficial';

interface CourseFormData {
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
  instructorType: InstructorType;
  selectedInstructor: any;

  // Step 5: Precios y modalidad
  pricingType: PricingType;
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

export default function CrearCursoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<any>(null);

  const [formData, setFormData] = useState<CourseFormData>({
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
    instructorType: 'none',
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

  const totalSteps = 7;

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

  // Categorías disponibles
  const categories = [
    'Tecnologia',
    'Disseny',
    'Màrqueting Digital',
    'Gestió i Lideratge',
    'Idiomes',
    'Ofimàtica',
    'Ciberseguretat',
    'Comunicació',
    'Recursos Humans',
    'Comptabilitat i Finances',
    'Desenvolupament Personal',
    'Administració Pública'
  ];

  // Funciones de navegación de pasos
  const nextStep = () => {
    const allowedSteps = courseTypeConfig[formData.courseType].steps;
    const currentIndex = allowedSteps.indexOf(currentStep);
    if (currentIndex < allowedSteps.length - 1) {
      setCurrentStep(allowedSteps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const allowedSteps = courseTypeConfig[formData.courseType].steps;
    const currentIndex = allowedSteps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(allowedSteps[currentIndex - 1]);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.courseType !== '';
      case 2:
        return formData.title && formData.description && formData.category;
      case 3:
        if (formData.courseType === 'micro') {
          return formData.aiPrompt || aiGeneratedContent;
        }
        return formData.modules.length > 0;
      case 4:
        return !formData.hasInstructor || formData.selectedInstructor;
      case 5:
        return formData.pricingType === 'gratuit' || formData.price > 0;
      default:
        return true;
    }
  };

  // Generación de contenido con IA
  const generateAIContent = async () => {
    setAiGenerating(true);
    try {
      // Simula generación con IA - reemplazar con llamada real a API de IA
      await new Promise(resolve => setTimeout(resolve, 3000));

      const generatedContent = {
        lessons: [
          {
            id: '1',
            title: `Introducció a ${formData.title}`,
            duration: Math.floor(formData.aiDuration * 0.4),
            type: 'text',
            content: `Contingut generat per IA sobre ${formData.aiPrompt}...`,
            hasInfographic: formData.aiFormats.includes('infografies')
          },
          {
            id: '2',
            title: 'Principis fonamentals',
            duration: Math.floor(formData.aiDuration * 0.4),
            type: 'video',
            content: 'Vídeo explicatiu generat...',
            videoUrl: 'https://youtube.com/watch?v=example'
          },
          {
            id: '3',
            title: 'Aplicació pràctica',
            duration: Math.floor(formData.aiDuration * 0.2),
            type: 'quiz',
            content: 'Quiz de 5 preguntes...'
          }
        ].slice(0, formData.aiLessons),
        totalDuration: formData.aiDuration
      };

      setAiGeneratedContent(generatedContent);
    } catch (error) {
      console.error('Error generating AI content:', error);
      alert('Error al generar contingut amb IA');
    } finally {
      setAiGenerating(false);
    }
  };

  const regenerateAIContent = () => {
    setAiGeneratedContent(null);
    generateAIContent();
  };

  const handleSubmit = async () => {
    setLoading(true);

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

      alert('Curs creat correctament!');
      router.push('/admin/formacio/listar');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Error al crear el curs');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDuration = () => {
    return formData.modules.reduce((total, module) => {
      return total + module.lessons.reduce((moduleTotal, lesson) => {
        return moduleTotal + lesson.duration;
      }, 0);
    }, 0);
  };

  const handleSaveAsDraft = () => {
    setFormData(prev => ({ ...prev, publishType: 'draft' }));
    handleSubmit();
  };

  const handlePublish = () => {
    setFormData(prev => ({ ...prev, publishType: 'immediate' }));
    handleSubmit();
  };

  // Funciones para manejo de imágenes
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('image/')) {
      handleImageFile(files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imatge és massa gran. Mida màxima: 10MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Només es permeten arxius d\'imatge');
      return;
    }

    // Crear URL temporal para vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData({...formData, coverImage: result});
    };
    reader.readAsDataURL(file);

    // En un caso real, aquí subirías el archivo al servidor
    // y obtendrías una URL permanente
  };

  const generateRandomImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop&crop=center&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop&crop=center&q=80',
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop&crop=center&q=80',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop&crop=center&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop&crop=center&q=80'
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setFormData({...formData, coverImage: randomImage});
  };

  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Mòdul ${formData.modules.length + 1}`,
      order: formData.modules.length + 1,
      lessons: []
    };
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: `Lliçó ${formData.modules.find(m => m.id === moduleId)?.lessons.length + 1 || 1}`,
      type: 'video',
      duration: 45,
      content: '',
      videoUrl: '',
      isPreview: false,
      order: formData.modules.find(m => m.id === moduleId)?.lessons.length + 1 || 1
    };

    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      )
    }));
  };

  // Renderizar contenido de cada paso
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return formData.courseType === 'micro' ? renderStep3A() : renderStep3B();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      default:
        return null;
    }
  };

  // STEP 1: Selección de tipo de curso
  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">STEP 1: Tipus de curs</h2>
      <p className="text-gray-600 mb-6">Selecciona el tipus de curs a crear:</p>

      <div className="space-y-4">
        {Object.entries(courseTypeConfig).map(([type, config]) => (
          <label key={type} className="block">
            <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              formData.courseType === type
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="courseType"
                  value={type}
                  checked={formData.courseType === type}
                  onChange={(e) => setFormData({...formData, courseType: e.target.value as CourseType})}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{config.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{config.subtitle}</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {config.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  // STEP 2: Información básica
  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">STEP 2: Informació bàsica del curs</h2>

      <div className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Títol del curs *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Protecció de Dades i RGPD"
          />
        </div>

        {/* Subtítulo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtítol / Descripció curta
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Aprèn els fonaments del RGPD..."
          />
        </div>

        {/* Descripción completa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripció completa *
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripció completa del curs, què aprendran els estudiants..."
          />
        </div>

        {/* Categoría y Nivel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una categoria</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivell *
            </label>
            <select
              required
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Principiant">Principiant</option>
              <option value="Intermedi">Intermedi</option>
              <option value="Avançat">Avançat</option>
            </select>
          </div>
        </div>

        {/* Idioma y Modalidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma *
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Català">Català</option>
              <option value="Castellà">Castellà</option>
              <option value="Anglès">Anglès</option>
              <option value="Francès">Francès</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modalitat principal *
            </label>
            <select
              value={formData.modalities[0] || 'online'}
              onChange={(e) => setFormData({...formData, modalities: [e.target.value as ModalityType]})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="online">En línia</option>
              <option value="presencial">Presencial</option>
              <option value="hibrid">Híbrid</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetes (separades per comes)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="RGPD, protecció dades, privacitat, LOPD"
          />
          <p className="text-sm text-gray-500 mt-1">
            Les etiquetes ajuden els estudiants a trobar el teu curs
          </p>
        </div>

        {/* Imagen de portada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imatge de portada
          </label>
          <div className="space-y-3">
            {/* URL input */}
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://exemple.com/imatge.jpg"
            />

            {/* Drag and drop area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('imageInput')?.click()}
            >
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="space-y-2">
                <div className="text-4xl">📸</div>
                <p className="text-gray-600">
                  <span className="font-medium">Clica per seleccionar</span> o arrossega una imatge aquí
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF fins a 10MB
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => document.getElementById('imageInput')?.click()}
              >
                📁 Seleccionar arxiu
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                onClick={() => {
                  const url = prompt('Introdueix la URL de la imatge:');
                  if (url) setFormData({...formData, coverImage: url});
                }}
              >
                🔗 Afegir URL
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={generateRandomImage}
              >
                🤖 Generar automàticament
              </button>
            </div>

            {/* Image preview */}
            {formData.coverImage && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Vista prèvia:</p>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, coverImage: ''})}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    ✕ Eliminar
                  </button>
                </div>
                <img
                  src={formData.coverImage}
                  alt="Preview"
                  className="w-full max-w-md h-40 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // STEP 3A: Contenido generado con IA (solo micro-cursos)
  const renderStep3A = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">STEP 3A: Generar contingut amb IA</h2>
      <p className="text-gray-600 mb-6">🤖 Deixa que la IA creï el contingut del curs</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descriu el contingut que vols:
          </label>
          <textarea
            rows={3}
            value={formData.aiPrompt}
            onChange={(e) => setFormData({...formData, aiPrompt: e.target.value})}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Vull un curs sobre els fonaments bàsics del RGPD per a funcionaris públics que comencen. Ha d'incloure: conceptes clau, obligacions, drets..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de lliçons:
            </label>
            <select
              value={formData.aiLessons}
              onChange={(e) => setFormData({...formData, aiLessons: parseInt(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durada aproximada:
            </label>
            <select
              value={formData.aiDuration}
              onChange={(e) => setFormData({...formData, aiDuration: parseInt(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format de lliçons:
          </label>
          <div className="space-y-2">
            {[
              { id: 'text', label: 'Text (articles)' },
              { id: 'videos', label: 'Vídeos (links YouTube)' },
              { id: 'infografies', label: 'Infografies' },
              { id: 'quiz', label: 'Quiz final' }
            ].map((format) => (
              <label key={format.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.aiFormats.includes(format.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({...formData, aiFormats: [...formData.aiFormats, format.id]});
                    } else {
                      setFormData({...formData, aiFormats: formData.aiFormats.filter(f => f !== format.id)});
                    }
                  }}
                  className="mr-2"
                />
                {format.label}
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={generateAIContent}
            disabled={aiGenerating || !formData.aiPrompt}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiGenerating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generant contingut...
              </div>
            ) : (
              '🤖 Generar curs amb IA'
            )}
          </button>
        </div>

        {aiGeneratedContent && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">VISTA PRÈVIA DEL CONTINGUT GENERAT:</h4>

            <div className="space-y-2">
              {aiGeneratedContent.lessons.map((lesson: any, index: number) => (
                <div key={lesson.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="font-medium">Lliçó {index + 1}: {lesson.title}</span>
                    <span className="text-sm text-gray-500 ml-2">({lesson.duration} min)</span>
                  </div>
                  <span className="text-xs text-gray-500">{lesson.type}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={regenerateAIContent}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Regenerar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Editar manualment
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Acceptar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // STEP 3B: Estructura manual del curso
  const renderStep3B = () => {
    const updateModuleTitle = (moduleId: string, title: string) => {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId ? { ...module, title } : module
        )
      }));
    };

    const deleteModule = (moduleId: string) => {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.filter(module => module.id !== moduleId)
      }));
    };

    const updateLessonType = (moduleId: string, lessonId: string, type: string) => {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.map(lesson =>
                  lesson.id === lessonId ? { ...lesson, type: type as any } : lesson
                )
              }
            : module
        )
      }));
    };

    const updateLessonTitle = (moduleId: string, lessonId: string, title: string) => {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.map(lesson =>
                  lesson.id === lessonId ? { ...lesson, title } : lesson
                )
              }
            : module
        )
      }));
    };

    const updateLessonDuration = (moduleId: string, lessonId: string, duration: number) => {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.map(lesson =>
                  lesson.id === lessonId ? { ...lesson, duration } : lesson
                )
              }
            : module
        )
      }));
    };

    const deleteLesson = (moduleId: string, lessonId: string) => {
      setFormData(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? {
                ...module,
                lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
              }
            : module
        )
      }));
    };

    const generateAIStructure = async () => {
      if (!formData.title || !formData.category) {
        alert('Primer completa el títol i la categoria del curs al pas anterior.');
        return;
      }

      const aiModules = [
        {
          id: `module-${Date.now()}-1`,
          title: `Introducció a ${formData.title}`,
          order: 1,
          lessons: [
            {
              id: `lesson-${Date.now()}-1`,
              title: 'Conceptes bàsics',
              type: 'video' as const,
              duration: 30,
              content: '',
              videoUrl: '',
              isPreview: true,
              order: 1
            },
            {
              id: `lesson-${Date.now()}-2`,
              title: 'Objectius del curs',
              type: 'text' as const,
              duration: 15,
              content: '',
              videoUrl: '',
              isPreview: false,
              order: 2
            }
          ]
        },
        {
          id: `module-${Date.now()}-2`,
          title: 'Desenvolupament pràctic',
          order: 2,
          lessons: [
            {
              id: `lesson-${Date.now()}-3`,
              title: 'Cas pràctic 1',
              type: 'exercise' as const,
              duration: 45,
              content: '',
              videoUrl: '',
              isPreview: false,
              order: 1
            },
            {
              id: `lesson-${Date.now()}-4`,
              title: 'Avaluació final',
              type: 'quiz' as const,
              duration: 20,
              content: '',
              videoUrl: '',
              isPreview: false,
              order: 2
            }
          ]
        }
      ];

      setFormData(prev => ({ ...prev, modules: aiModules }));
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">STEP 3B: Estructura del curs</h2>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Mòduls i lliçons:</h3>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={generateAIStructure}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🤖 Generar amb IA
              </button>
              <button
                type="button"
                onClick={addModule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Afegir mòdul
              </button>
            </div>
          </div>

          {formData.modules.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-lg mb-2">📚 No hi ha mòduls creats encara</p>
              <p className="text-sm mb-4">Comença creant el primer mòdul del teu curs</p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={addModule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear primer mòdul
                </button>
                <button
                  type="button"
                  onClick={generateAIStructure}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Generar amb IA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-lg">
                  {/* Header del módulo */}
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-lg">📁</span>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                          className="flex-1 text-lg font-medium bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                          placeholder="Títol del mòdul"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => addLesson(module.id)}
                          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          + Lliçó
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteModule(module.id)}
                          className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lecciones del módulo */}
                  <div className="p-4">
                    {module.lessons.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p className="mb-2">Aquest mòdul no té lliçons encara</p>
                        <button
                          type="button"
                          onClick={() => addLesson(module.id)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          + Afegir primera lliçó
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-400">{lessonIndex + 1}.</span>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLessonTitle(module.id, lesson.id, e.target.value)}
                                className="md:col-span-2 px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Títol de la lliçó"
                              />

                              <select
                                value={lesson.type}
                                onChange={(e) => updateLessonType(module.id, lesson.id, e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="video">📹 Vídeo</option>
                                <option value="text">📄 Text/Article</option>
                                <option value="quiz">❓ Quiz</option>
                                <option value="exercise">💪 Exercici</option>
                              </select>

                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={lesson.duration}
                                  onChange={(e) => updateLessonDuration(module.id, lesson.id, parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  min="1"
                                />
                                <span className="text-xs text-gray-500">min</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteLesson(module.id, lesson.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Eliminar lliçó"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Resumen total */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📊 Resum del curs:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Mòduls:</span>
                    <span className="ml-1 font-medium">{formData.modules.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Lliçons:</span>
                    <span className="ml-1 font-medium">
                      {formData.modules.reduce((total, m) => total + m.lessons.length, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Durada total:</span>
                    <span className="ml-1 font-medium">
                      {Math.floor(calculateTotalDuration() / 60)}h {calculateTotalDuration() % 60}min
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Vídeos:</span>
                    <span className="ml-1 font-medium">
                      {formData.modules.reduce((total, m) =>
                        total + m.lessons.filter(l => l.type === 'video').length, 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // STEP 4: Instructor (solo para cursos básicos/completos/premium)
  const renderStep4 = () => {
    const [searchInstructor, setSearchInstructor] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newInstructor, setNewInstructor] = useState({
      name: '',
      expertise: '',
      bio: '',
      email: '',
      rating: 5.0
    });

    // Lista de instructores disponibles (simulado)
    const availableInstructors = [
      {
        id: 'inst1',
        name: 'Laura Martínez',
        expertise: 'Especialista en Ofimàtica i Productivitat',
        bio: 'Expert en Microsoft Office amb més de 10 anys d\'experiència en formació empresarial.',
        rating: 4.7,
        courses: 15,
        students: 892,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=80&h=80&fit=crop&crop=face'
      },
      {
        id: 'inst2',
        name: 'Marc González',
        expertise: 'Senior Frontend Developer',
        bio: 'Desenvolupador frontend amb més de 8 anys d\'experiència en React i tecnologies web modernes.',
        rating: 4.9,
        courses: 12,
        students: 2847,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
      },
      {
        id: 'inst3',
        name: 'Dr. Albert Soler',
        expertise: 'Expert en Ciberseguretat i Consultor Internacional',
        bio: 'Doctor en Informàtica amb especialització en ciberseguretat. Consultor per a empreses Fortune 500.',
        rating: 4.9,
        courses: 8,
        students: 1247,
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face'
      }
    ];

    const filteredInstructors = availableInstructors.filter(instructor =>
      instructor.name.toLowerCase().includes(searchInstructor.toLowerCase()) ||
      instructor.expertise.toLowerCase().includes(searchInstructor.toLowerCase())
    );

    const selectInstructor = (instructor: any) => {
      setFormData({...formData, selectedInstructor: instructor});
    };

    const createNewInstructor = () => {
      if (!newInstructor.name || !newInstructor.expertise) {
        alert('Emplena almenys el nom i l\'especialitat de l\'instructor');
        return;
      }

      const instructor = {
        id: `inst_${Date.now()}`,
        ...newInstructor,
        courses: 0,
        students: 0,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
      };

      setFormData({...formData, selectedInstructor: instructor});
      setShowCreateForm(false);
      setNewInstructor({ name: '', expertise: '', bio: '', email: '', rating: 5.0 });
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">STEP 4: Instructor del curs</h2>

        <div className="space-y-6">
          {/* Selección de si tiene instructor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Aquest curs té instructor? *
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="hasInstructor"
                  checked={formData.hasInstructor}
                  onChange={() => setFormData({...formData, hasInstructor: true, instructorType: 'existing'})}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">👨‍🏫 Sí, amb instructor real</div>
                  <div className="text-sm text-gray-500">Un expert guiarà els estudiants</div>
                </div>
              </label>
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="hasInstructor"
                  checked={!formData.hasInstructor}
                  onChange={() => setFormData({...formData, hasInstructor: false, instructorType: 'none', selectedInstructor: null})}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">📚 No, curs auto-gestionat</div>
                  <div className="text-sm text-gray-500">Els estudiants avancen al seu ritme</div>
                </div>
              </label>
            </div>
          </div>

          {/* Si tiene instructor */}
          {formData.hasInstructor && (
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800">Selecciona o crea un instructor</h3>

              {/* Buscador de instructores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar instructor existent:
                </label>
                <input
                  type="text"
                  value={searchInstructor}
                  onChange={(e) => setSearchInstructor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom o especialitat de l'instructor..."
                />
              </div>

              {/* Lista de instructores */}
              {searchInstructor && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Instructors disponibles:</h4>
                  {filteredInstructors.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No s'han trobat instructors amb aquest criteri</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredInstructors.map((instructor) => (
                        <div
                          key={instructor.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.selectedInstructor?.id === instructor.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => selectInstructor(instructor)}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={instructor.avatar}
                              alt={instructor.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{instructor.name}</h5>
                              <p className="text-sm text-gray-600">{instructor.expertise}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>⭐ {instructor.rating}</span>
                                <span>📚 {instructor.courses} cursos</span>
                                <span>👥 {instructor.students} estudiants</span>
                              </div>
                            </div>
                            {formData.selectedInstructor?.id === instructor.id && (
                              <span className="text-blue-600 font-medium">✓ Seleccionat</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Crear nuevo instructor */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-700">O crear nou instructor:</h4>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {showCreateForm ? 'Cancel·lar' : '+ Crear nou'}
                  </button>
                </div>

                {showCreateForm && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          value={newInstructor.name}
                          onChange={(e) => setNewInstructor({...newInstructor, name: e.target.value})}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Nom i cognoms de l'instructor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={newInstructor.email}
                          onChange={(e) => setNewInstructor({...newInstructor, email: e.target.value})}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="email@exemple.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialitat *
                      </label>
                      <input
                        type="text"
                        value={newInstructor.expertise}
                        onChange={(e) => setNewInstructor({...newInstructor, expertise: e.target.value})}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Ex: Expert en Ciberseguretat"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Biografia
                      </label>
                      <textarea
                        value={newInstructor.bio}
                        onChange={(e) => setNewInstructor({...newInstructor, bio: e.target.value})}
                        rows={3}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Experiència professional i formació de l'instructor..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={createNewInstructor}
                      className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Crear instructor
                    </button>
                  </div>
                )}
              </div>

              {/* Instructor seleccionado */}
              {formData.selectedInstructor && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">✓ Instructor seleccionat:</h4>
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.selectedInstructor.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'}
                      alt={formData.selectedInstructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{formData.selectedInstructor.name}</h5>
                      <p className="text-sm text-gray-600">{formData.selectedInstructor.expertise}</p>
                      {formData.selectedInstructor.bio && (
                        <p className="text-sm text-gray-500 mt-1">{formData.selectedInstructor.bio}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>⭐ {formData.selectedInstructor.rating || 5.0}</span>
                        <span>📚 {formData.selectedInstructor.courses || 0} cursos</span>
                        <span>👥 {formData.selectedInstructor.students || 0} estudiants</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, selectedInstructor: null})}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Canviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // STEP 5: Precio y modalidad
  const renderStep5 = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">STEP 5: Preu i modalitat</h2>

      <div className="space-y-6">
        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preu del curs:
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="pricingType"
                checked={formData.pricingType === 'gratuit'}
                onChange={() => setFormData({...formData, pricingType: 'gratuit', price: 0})}
                className="mr-2"
              />
              Gratuït
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="pricingType"
                checked={formData.pricingType === 'pagament'}
                onChange={() => setFormData({...formData, pricingType: 'pagament'})}
                className="mr-2"
              />
              De pagament
            </label>
          </div>

          {formData.pricingType === 'pagament' && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <h3 className="font-medium">─── SI ÉS DE PAGAMENT: ───</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preu:
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="border rounded-lg px-3 py-2 w-24"
                    min="0"
                    step="0.01"
                  />
                  <span className="ml-2">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preu per membres La Pública:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="memberPricing"
                      checked={formData.memberDiscount === 0}
                      onChange={() => setFormData({...formData, memberDiscount: 0, memberPrice: formData.price})}
                      className="mr-2"
                    />
                    Mateix preu
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="memberPricing"
                      checked={formData.memberDiscount === 100}
                      onChange={() => setFormData({...formData, memberDiscount: 100, memberPrice: 0})}
                      className="mr-2"
                    />
                    Descompte: 100% (Gratuït)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="memberPricing"
                      checked={formData.memberDiscount === 50}
                      onChange={() => setFormData({...formData, memberDiscount: 50, memberPrice: formData.price * 0.5})}
                      className="mr-2"
                    />
                    Descompte: 50% ({(formData.price * 0.5).toFixed(2)}€)
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modalidad */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Modalitat:
          </label>
          <div className="space-y-2">
            {[
              { id: 'online', label: 'Online (sempre disponible)' },
              { id: 'presencial', label: 'Presencial' },
              { id: 'hibrid', label: 'Híbrid (presencial + online)' }
            ].map((modality) => (
              <label key={modality.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.modalities.includes(modality.id as ModalityType)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({...formData, modalities: [...formData.modalities, modality.id as ModalityType]});
                    } else {
                      setFormData({...formData, modalities: formData.modalities.filter(m => m !== modality.id)});
                    }
                  }}
                  className="mr-2"
                />
                {modality.label}
              </label>
            ))}
          </div>

          {(formData.modalities.includes('presencial') || formData.modalities.includes('hibrid')) && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adreça:
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Carrer, número, ciutat..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aforament:
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  className="border rounded-lg px-3 py-2 w-24"
                  min="1"
                />
                <span className="ml-2 text-sm text-gray-500">places</span>
              </div>
            </div>
          )}
        </div>

        {/* Fechas programadas */}
        <div className="border-t pt-6">
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={formData.hasSchedule}
              onChange={(e) => setFormData({...formData, hasSchedule: e.target.checked})}
              className="mr-2"
            />
            <span className="font-medium">Aquest curs té sessions programades</span>
          </label>

          {formData.hasSchedule && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">─── SI TÉ SESSIONS PROGRAMADES: ───</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data inici:
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data fi:
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horari:
                </label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Dimarts 18:00-20:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Places disponibles:
                </label>
                <input
                  type="number"
                  value={formData.availableSlots}
                  onChange={(e) => setFormData({...formData, availableSlots: parseInt(e.target.value)})}
                  className="border rounded-lg px-3 py-2 w-24"
                  min="1"
                  max={formData.capacity}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // STEP 6: Certificado y extras (solo cursos completos/premium)
  const renderStep6 = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">STEP 6: Certificat i recursos addicionals</h2>

      <div className="space-y-6">
        {/* Certificado */}
        <div>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={formData.hasCertificate}
              onChange={(e) => setFormData({...formData, hasCertificate: e.target.checked})}
              className="mr-2"
            />
            <span className="font-medium">Emetre certificat al finalitzar</span>
          </label>

          {formData.hasCertificate && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipus de certificat:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="certificateType"
                      value="digital"
                      checked={formData.certificateType === 'digital'}
                      onChange={(e) => setFormData({...formData, certificateType: e.target.value as CertificateType})}
                      className="mr-2"
                    />
                    Certificat digital (gratuït)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="certificateType"
                      value="digital_fisic"
                      checked={formData.certificateType === 'digital_fisic'}
                      onChange={(e) => setFormData({...formData, certificateType: e.target.value as CertificateType})}
                      className="mr-2"
                    />
                    Certificat digital + físic (15€)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="certificateType"
                      value="oficial"
                      checked={formData.certificateType === 'oficial'}
                      onChange={(e) => setFormData({...formData, certificateType: e.target.value as CertificateType})}
                      className="mr-2"
                    />
                    Certificat oficial reconegut (50€)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plantilla de certificat:
                </label>
                <div className="flex gap-3">
                  <select
                    value={formData.certificateTemplate}
                    onChange={(e) => setFormData({...formData, certificateTemplate: e.target.value})}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="template-1">Plantilla 1</option>
                    <option value="template-2">Plantilla 2</option>
                    <option value="template-3">Plantilla 3</option>
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Vista prèvia
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recursos adicionales */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Recursos addicionals:</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'hasDownloadables', label: 'Materials descarregables' },
              { id: 'hasProjects', label: 'Projectes pràctics' },
              { id: 'hasExercises', label: 'Exercicis autocorregibles' },
              { id: 'hasForum', label: 'Fòrum d\'estudiants' }
            ].map((resource) => (
              <label key={resource.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData[resource.id as keyof CourseFormData] as boolean}
                  onChange={(e) => setFormData({...formData, [resource.id]: e.target.checked})}
                  className="mr-2"
                />
                {resource.label}
              </label>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grup de Telegram (opcional):
            </label>
            <input
              type="text"
              value={formData.telegramGroup}
              onChange={(e) => setFormData({...formData, telegramGroup: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="@nom_del_grup"
            />
          </div>
        </div>

        {/* Garantía */}
        <div className="border-t pt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.hasGuarantee}
              onChange={(e) => setFormData({...formData, hasGuarantee: e.target.checked})}
              className="mr-2"
            />
            <span className="font-medium">30 dies de garantia (devolució diners)</span>
          </label>
        </div>
      </div>
    </div>
  );

  // STEP 7: Revisión y publicación
  const renderStep7 = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">STEP 7: Revisió final</h2>

      <div className="space-y-6">
        {/* Resumen del curso */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3">RESUM DEL CURS:</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>📚 Tipus: {courseTypeConfig[formData.courseType].name}</div>
            <div>📖 Títol: {formData.title}</div>
            <div>📂 Categoria: {formData.category}</div>
            <div>📊 Nivell: {formData.level}</div>
            <div>⏱️ Durada: {formData.courseType === 'micro' ? `${formData.aiDuration} min` : `${Math.floor(calculateTotalDuration() / 60)} hores`}</div>
            <div>📝 Lliçons: {formData.courseType === 'micro' ? formData.aiLessons : formData.modules.reduce((total, m) => total + m.lessons.length, 0)}</div>
            <div>👨‍🏫 Instructor: {formData.hasInstructor ? formData.selectedInstructor?.name || 'Per assignar' : 'Auto-gestionat'}</div>
            <div>💰 Preu: {formData.pricingType === 'gratuit' ? 'Gratuït' : `${formData.price}€`}</div>
            <div>📍 Modalitat: {formData.modalities.join(', ')}</div>
            <div>🎓 Certificat: {formData.hasCertificate ? 'Sí' : 'No'}</div>
            {formData.hasSchedule && (
              <>
                <div>📅 Inici: {formData.startDate}</div>
                <div>👥 Places: {formData.availableSlots}</div>
              </>
            )}
          </div>
        </div>

        {/* Estado de publicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Estat de publicació:
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="publishType"
                value="immediate"
                checked={formData.publishType === 'immediate'}
                onChange={(e) => setFormData({...formData, publishType: e.target.value as any})}
                className="mr-2"
              />
              Publicar immediatament
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="publishType"
                value="scheduled"
                checked={formData.publishType === 'scheduled'}
                onChange={(e) => setFormData({...formData, publishType: e.target.value as any})}
                className="mr-2"
              />
              Programar publicació
            </label>
            {formData.publishType === 'scheduled' && (
              <div className="ml-6 mt-2">
                <input
                  type="datetime-local"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
              </div>
            )}
            <label className="flex items-center">
              <input
                type="radio"
                name="publishType"
                value="draft"
                checked={formData.publishType === 'draft'}
                onChange={(e) => setFormData({...formData, publishType: e.target.value as any})}
                className="mr-2"
              />
              Desar com esborrany
            </label>
          </div>
        </div>

        {/* Visibilidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Visibilitat:
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={(e) => setFormData({...formData, visibility: e.target.value as any})}
                className="mr-2"
              />
              Públic (visible per tothom)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="members"
                checked={formData.visibility === 'members'}
                onChange={(e) => setFormData({...formData, visibility: e.target.value as any})}
                className="mr-2"
              />
              Només membres verificats
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={formData.visibility === 'private'}
                onChange={(e) => setFormData({...formData, visibility: e.target.value as any})}
                className="mr-2"
              />
              Privat (només amb link)
            </label>
          </div>
        </div>

        {/* Badges destacados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Badges destacats:
          </label>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'recomanat', label: 'Recomanat' },
              { id: 'nou', label: 'Nou' },
              { id: 'tendencia', label: 'Tendència' },
              { id: 'bestseller', label: 'Bestseller' }
            ].map((badge) => (
              <label key={badge.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.badges.includes(badge.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({...formData, badges: [...formData.badges, badge.id]});
                    } else {
                      setFormData({...formData, badges: formData.badges.filter(b => b !== badge.id)});
                    }
                  }}
                  className="mr-2"
                />
                {badge.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/formacio/listar"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← Tornar a la llista
        </Link>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Crear Nou Curs</h1>
          <span className="text-sm text-gray-500">Pas {currentStep} de {totalSteps}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(courseTypeConfig[formData.courseType].steps.indexOf(currentStep) + 1) / courseTypeConfig[formData.courseType].steps.length * 100}%` }}
          />
        </div>

        <div className="mt-2 text-sm text-gray-600">
          Tipo de curs: <span className="font-medium">{courseTypeConfig[formData.courseType].name}</span>
        </div>
      </div>

      {/* Contenido del paso */}
      {renderStepContent()}

      {/* Navegación */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={courseTypeConfig[formData.courseType].steps.indexOf(currentStep) === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Enrere
          </button>

          <div className="flex gap-3">
            {currentStep === 7 ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  Desar esborrany
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading || !canGoNext()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Publicant...' : 'Publicar curs →'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canGoNext()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Següent →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}