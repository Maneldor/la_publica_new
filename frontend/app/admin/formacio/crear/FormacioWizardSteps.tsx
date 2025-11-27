'use client';

import { Tag, Info, FileText, User, ShoppingBag, Calendar, Eye } from 'lucide-react';

type CourseType = 'micro' | 'basic' | 'complet' | 'premium';
type ModalityType = 'online' | 'presencial' | 'hibrid';
type CertificateType = 'none' | 'digital' | 'digital_fisic' | 'oficial';

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

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Instructor {
  id?: string;
  name: string;
  institution?: string;
  email?: string;
  bio?: string;
}

interface WizardFormData {
  courseType: CourseType;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string;
  tags: string;
  coverImage: string;
  aiPrompt: string;
  aiLessons: number;
  aiDuration: number;
  aiFormats: string[];
  modules: Module[];
  hasInstructor: boolean;
  selectedInstructor: Instructor | null;
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
  hasCertificate: boolean;
  certificateType: CertificateType;
  certificateTemplate: string;
  hasDownloadables: boolean;
  hasProjects: boolean;
  hasExercises: boolean;
  hasForum: boolean;
  telegramGroup: string;
  hasGuarantee: boolean;
  publishType: 'immediate' | 'scheduled' | 'draft';
  publishDate: string;
  visibility: 'public' | 'members' | 'private';
  badges: string[];
}

interface StepProps {
  formData: WizardFormData;
  updateField: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
  errors: Record<string, string>;
  courseTypeConfig?: unknown;
  aiGenerating?: boolean;
  setAiGenerating?: (value: boolean) => void;
  aiGeneratedContent?: { lessons: Lesson[]; totalDuration: number } | null;
  setAiGeneratedContent?: (value: { lessons: Lesson[]; totalDuration: number } | null) => void;
  calculateTotalDuration?: () => number;
}

const CATEGORIES = [
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

// Step 1: Tipus de Curs
export const Step1TipusCurs: React.FC<StepProps> = ({ formData, updateField, errors, courseTypeConfig }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Tag className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tipus de Curs</h2>
          <p className="text-gray-600">Selecciona el tipus de curs que vols crear</p>
        </div>
      </div>

      {errors.courseType && <p className="text-sm text-red-600 mb-4">{errors.courseType}</p>}

      <div className="space-y-4">
        {Object.entries(courseTypeConfig as Record<string, { name: string; subtitle: string; features: string[] }>).map(([type, config]) => (
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
                  onChange={(e) => updateField('courseType', e.target.value as CourseType)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{config.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{config.subtitle}</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    {config.features.map((feature: string, index: number) => (
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
};

// Step 2: Informació Bàsica
export const Step2Informacio: React.FC<StepProps> = ({ formData, updateField, errors }) => {
  const handleImageFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('La imatge és massa gran. Mida màxima: 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Només es permeten arxius d\'imatge');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateField('coverImage', result);
    };
    reader.readAsDataURL(file);
  };

  const generateRandomImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop'
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    updateField('coverImage', randomImage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <Info className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Informació Bàsica</h2>
          <p className="text-gray-600">Proporciona la informació general del curs</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Títol del curs *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ex: Protecció de Dades i RGPD"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Subtítulo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtítol
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => updateField('subtitle', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Aprèn els fonaments del RGPD..."
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripció completa *
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Descripció completa del curs, què aprendran els estudiants..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Categoría y Nivel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una categoria</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivell
            </label>
            <select
              value={formData.level}
              onChange={(e) => updateField('level', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Principiant">Principiant</option>
              <option value="Intermedi">Intermedi</option>
              <option value="Avançat">Avançat</option>
            </select>
          </div>
        </div>

        {/* Idioma y Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma
            </label>
            <select
              value={formData.language}
              onChange={(e) => updateField('language', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Català">Català</option>
              <option value="Castellà">Castellà</option>
              <option value="Anglès">Anglès</option>
              <option value="Francès">Francès</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetes
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => updateField('tags', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="RGPD, protecció dades, privacitat"
            />
          </div>
        </div>

        {/* Imagen de portada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imatge de portada
          </label>
          <div className="space-y-3">
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => updateField('coverImage', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://exemple.com/imatge.jpg"
            />

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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={generateRandomImage}
              >
                🤖 Generar automàticament
              </button>
            </div>

            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
              className="hidden"
            />

            {formData.coverImage && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Vista prèvia:</p>
                  <button
                    type="button"
                    onClick={() => updateField('coverImage', '')}
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
};

// Step 3: Contingut
export const Step3Contingut: React.FC<StepProps> = ({
  formData,
  updateField,
  errors,
  aiGenerating,
  setAiGenerating,
  aiGeneratedContent,
  setAiGeneratedContent,
  calculateTotalDuration
}) => {
  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Mòdul ${formData.modules.length + 1}`,
      order: formData.modules.length + 1,
      lessons: []
    };
    updateField('modules', [...formData.modules, newModule]);
  };

  const addLesson = (moduleId: string) => {
    const targetModule = formData.modules.find(m => m.id === moduleId);
    const lessonCount = targetModule?.lessons.length || 0;
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: `Lliçó ${lessonCount + 1}`,
      type: 'video',
      duration: 45,
      content: '',
      videoUrl: '',
      isPreview: false,
      order: lessonCount + 1
    };

    const updatedModules = formData.modules.map(existingModule =>
      existingModule.id === moduleId
        ? { ...existingModule, lessons: [...existingModule.lessons, newLesson] }
        : existingModule
    );
    updateField('modules', updatedModules);
  };

  const generateAIContent = async () => {
    setAiGenerating(true);
    try {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <FileText className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Contingut del Curs</h2>
          <p className="text-gray-600">
            {formData.courseType === 'micro'
              ? 'Genera contingut amb IA per al micro-curs'
              : 'Estructura els mòduls i lliçons del curs'
            }
          </p>
        </div>
      </div>

      {formData.courseType === 'micro' ? (
        // Contenido IA para micro-cursos
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descriu el contingut que vols:
            </label>
            <textarea
              rows={3}
              value={formData.aiPrompt}
              onChange={(e) => updateField('aiPrompt', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${
                errors.aiPrompt ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Vull un curs sobre els fonaments bàsics del RGPD per a funcionaris públics..."
            />
            {errors.aiPrompt && <p className="mt-1 text-sm text-red-600">{errors.aiPrompt}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de lliçons:
              </label>
              <select
                value={formData.aiLessons}
                onChange={(e) => updateField('aiLessons', parseInt(e.target.value))}
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
                onChange={(e) => updateField('aiDuration', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
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
              <h4 className="font-medium text-gray-900 mb-3">Vista prèvia del contingut generat:</h4>
              <div className="space-y-2">
                {aiGeneratedContent.lessons.map((lesson: Lesson, index: number) => (
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
            </div>
          )}
        </div>
      ) : (
        // Estructura manual para otros tipos de cursos
        <div className="space-y-6">
          {errors.modules && <p className="text-sm text-red-600 mb-4">{errors.modules}</p>}

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Mòduls i lliçons:</h3>
            <button
              type="button"
              onClick={addModule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Afegir mòdul
            </button>
          </div>

          {formData.modules.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-lg mb-2">📚 No hi ha mòduls creats encara</p>
              <button
                type="button"
                onClick={addModule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear primer mòdul
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.modules.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-lg">📁</span>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => {
                            const updatedModules = formData.modules.map(m =>
                              m.id === module.id ? { ...m, title: e.target.value } : m
                            );
                            updateField('modules', updatedModules);
                          }}
                          className="flex-1 text-lg font-medium bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                          placeholder="Títol del mòdul"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => addLesson(module.id)}
                        className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        + Lliçó
                      </button>
                    </div>
                  </div>

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
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => {
                                  const updatedModules = formData.modules.map(m =>
                                    m.id === module.id
                                      ? {
                                          ...m,
                                          lessons: m.lessons.map(l =>
                                            l.id === lesson.id ? { ...l, title: e.target.value } : l
                                          )
                                        }
                                      : m
                                  );
                                  updateField('modules', updatedModules);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                                placeholder="Títol de la lliçó"
                              />
                              <select
                                value={lesson.type}
                                onChange={(e) => {
                                  const updatedModules = formData.modules.map(m =>
                                    m.id === module.id
                                      ? {
                                          ...m,
                                          lessons: m.lessons.map(l =>
                                            l.id === lesson.id ? { ...l, type: e.target.value as any } : l
                                          )
                                        }
                                      : m
                                  );
                                  updateField('modules', updatedModules);
                                }}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="video">📹 Vídeo</option>
                                <option value="text">📄 Text</option>
                                <option value="quiz">❓ Quiz</option>
                                <option value="exercise">💪 Exercici</option>
                              </select>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={lesson.duration}
                                  onChange={(e) => {
                                    const updatedModules = formData.modules.map(m =>
                                      m.id === module.id
                                        ? {
                                            ...m,
                                            lessons: m.lessons.map(l =>
                                              l.id === lesson.id ? { ...l, duration: parseInt(e.target.value) || 0 } : l
                                            )
                                          }
                                        : m
                                    );
                                    updateField('modules', updatedModules);
                                  }}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                  min="1"
                                />
                                <span className="text-xs text-gray-500">min</span>
                              </div>
                            </div>
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
      )}
    </div>
  );
};

// Step 4: Instructor
export const Step4Instructor: React.FC<StepProps> = ({ formData, updateField, errors }) => {
  const availableInstructors = [
    {
      id: 'inst1',
      name: 'Laura Martínez',
      expertise: 'Especialista en Ofimàtica i Productivitat',
      bio: 'Expert en Microsoft Office amb més de 10 anys d\'experiència.',
      rating: 4.7,
      courses: 15,
      students: 892,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=80&h=80&fit=crop'
    },
    {
      id: 'inst2',
      name: 'Marc González',
      expertise: 'Senior Frontend Developer',
      bio: 'Desenvolupador frontend amb més de 8 anys d\'experiència.',
      rating: 4.9,
      courses: 12,
      students: 2847,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-lg">
          <User className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Instructor del Curs</h2>
          <p className="text-gray-600">Selecciona si el curs tindrà instructor</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Aquest curs té instructor?
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="hasInstructor"
                checked={formData.hasInstructor}
                onChange={() => updateField('hasInstructor', true)}
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
                onChange={() => updateField('hasInstructor', false)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">📚 No, curs auto-gestionat</div>
                <div className="text-sm text-gray-500">Els estudiants avancen al seu ritme</div>
              </div>
            </label>
          </div>
        </div>

        {formData.hasInstructor && (
          <div className="space-y-4">
            {errors.selectedInstructor && <p className="text-sm text-red-600">{errors.selectedInstructor}</p>}

            <h3 className="text-lg font-medium text-gray-800">Instructors disponibles:</h3>
            <div className="space-y-2">
              {availableInstructors.map((instructor) => (
                <div
                  key={instructor.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.selectedInstructor?.id === instructor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateField('selectedInstructor', instructor)}
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
          </div>
        )}
      </div>
    </div>
  );
};

// Step 5: Preus i Modalitat
export const Step5Preus: React.FC<StepProps> = ({ formData, updateField, errors }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-100 rounded-lg">
          <ShoppingBag className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Preus i Modalitat</h2>
          <p className="text-gray-600">Configura el preu i la modalitat del curs</p>
        </div>
      </div>

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
                onChange={() => updateField('pricingType', 'gratuit')}
                className="mr-2"
              />
              Gratuït
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="pricingType"
                checked={formData.pricingType === 'pagament'}
                onChange={() => updateField('pricingType', 'pagament')}
                className="mr-2"
              />
              De pagament
            </label>
          </div>

          {formData.pricingType === 'pagament' && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preu:
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                    className={`border rounded-lg px-3 py-2 w-24 ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="0"
                    step="0.01"
                  />
                  <span className="ml-2">€</span>
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Descompte per membres:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="memberDiscount"
                      checked={formData.memberDiscount === 0}
                      onChange={() => {
                        updateField('memberDiscount', 0);
                        updateField('memberPrice', formData.price);
                      }}
                      className="mr-2"
                    />
                    Mateix preu
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="memberDiscount"
                      checked={formData.memberDiscount === 50}
                      onChange={() => {
                        updateField('memberDiscount', 50);
                        updateField('memberPrice', formData.price * 0.5);
                      }}
                      className="mr-2"
                    />
                    50% de descompte ({(formData.price * 0.5).toFixed(2)}€)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="memberDiscount"
                      checked={formData.memberDiscount === 100}
                      onChange={() => {
                        updateField('memberDiscount', 100);
                        updateField('memberPrice', 0);
                      }}
                      className="mr-2"
                    />
                    100% de descompte (Gratuït)
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
                      updateField('modalities', [...formData.modalities, modality.id as ModalityType]);
                    } else {
                      updateField('modalities', formData.modalities.filter(m => m !== modality.id));
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
                  onChange={(e) => updateField('address', e.target.value)}
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
                  onChange={(e) => updateField('capacity', parseInt(e.target.value) || 25)}
                  className="border rounded-lg px-3 py-2 w-24"
                  min="1"
                />
                <span className="ml-2 text-sm text-gray-500">places</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Step 6: Certificat i Extras
export const Step6Certificat: React.FC<StepProps> = ({ formData, updateField }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-lg">
          <Calendar className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Certificat i Recursos</h2>
          <p className="text-gray-600">Configura el certificat i recursos addicionals</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Certificado */}
        <div>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={formData.hasCertificate}
              onChange={(e) => updateField('hasCertificate', e.target.checked)}
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
                      onChange={(e) => updateField('certificateType', e.target.value as CertificateType)}
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
                      onChange={(e) => updateField('certificateType', e.target.value as CertificateType)}
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
                      onChange={(e) => updateField('certificateType', e.target.value as CertificateType)}
                      className="mr-2"
                    />
                    Certificat oficial reconegut (50€)
                  </label>
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
                  checked={formData[resource.id as keyof WizardFormData] as boolean}
                  onChange={(e) => updateField(resource.id as keyof WizardFormData, e.target.checked)}
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
              onChange={(e) => updateField('telegramGroup', e.target.value)}
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
              onChange={(e) => updateField('hasGuarantee', e.target.checked)}
              className="mr-2"
            />
            <span className="font-medium">30 dies de garantia (devolució diners)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Step 7: Revisió Final
export const Step7Review: React.FC<StepProps> = ({ formData, updateField, courseTypeConfig, calculateTotalDuration }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <Eye className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Revisió Final</h2>
          <p className="text-gray-600">Revisa tota la informació abans de crear el curs</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Resumen del curso */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-3">Resum del curs:</h3>
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
                onChange={(e) => updateField('publishType', e.target.value as 'immediate' | 'scheduled' | 'draft')}
                className="mr-2"
              />
              Publicar immediatament
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="publishType"
                value="draft"
                checked={formData.publishType === 'draft'}
                onChange={(e) => updateField('publishType', e.target.value as 'immediate' | 'scheduled' | 'draft')}
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
                onChange={(e) => updateField('visibility', e.target.value as 'public' | 'members' | 'private')}
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
                onChange={(e) => updateField('visibility', e.target.value as 'public' | 'members' | 'private')}
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
                onChange={(e) => updateField('visibility', e.target.value as 'public' | 'members' | 'private')}
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
                      updateField('badges', [...formData.badges, badge.id]);
                    } else {
                      updateField('badges', formData.badges.filter(b => b !== badge.id));
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
};

const FormacioWizardSteps = {
  Step1TipusCurs,
  Step2Informacio,
  Step3Contingut,
  Step4Instructor,
  Step5Preus,
  Step6Certificat,
  Step7Review
};

export default FormacioWizardSteps;