'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  Info,
  Settings,
  CheckCircle,
  FileText,
  Shield,
  Pin,
  Upload,
  X
} from 'lucide-react';
import SimpleWizard from '@/components/wizard/SimpleWizard';

interface ForumFormData {
  // Step 1 - Información básica
  title: string;
  description: string;
  category: string;
  coverImage: File | null;
  coverImageUrl: string;

  // Step 2 - Configuración
  isPublic: boolean;
  allowAnonymous: boolean;
  isPinned: boolean;
  allowAttachments: boolean;
  maxParticipants: string;

  // Step 3 - Reglas y moderación
  rules: string[];
  moderators: string[];
  autoCloseAfterDays: string;
  requireApproval: boolean;
}

export default function CrearForoPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ForumFormData>({
    // Step 1
    title: '',
    description: '',
    category: '',
    coverImage: null,
    coverImageUrl: '',

    // Step 2
    isPublic: true,
    allowAnonymous: false,
    isPinned: false,
    allowAttachments: true,
    maxParticipants: '',

    // Step 3
    rules: [],
    moderators: [],
    autoCloseAfterDays: '',
    requireApproval: false,
  });

  const steps = [
    { id: 1, title: 'Informació', icon: <FileText className="w-5 h-5" /> },
    { id: 2, title: 'Configuració', icon: <Settings className="w-5 h-5" /> },
    { id: 3, title: 'Moderació', icon: <Shield className="w-5 h-5" /> },
    { id: 4, title: 'Revisió', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const updateField = (field: keyof ForumFormData, value: any) => {
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

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        coverImage: file,
        coverImageUrl: imageUrl
      }));
    }
  };

  const removeImage = () => {
    if (formData.coverImageUrl) {
      URL.revokeObjectURL(formData.coverImageUrl);
    }
    setFormData(prev => ({
      ...prev,
      coverImage: null,
      coverImageUrl: ''
    }));
  };

  const addArrayItem = (field: 'rules' | 'moderators', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'rules' | 'moderators', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'El títol és obligatori';
      if (!formData.description.trim()) newErrors.description = 'La descripció és obligatòria';
      if (!formData.category) newErrors.category = 'La categoria és obligatòria';
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
      // Preparar los datos del foro
      const forumData = {
        ...formData,
        status: isDraft ? 'draft' : 'published',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        author: 'Administrador', // TODO: obtener del usuario logueado
        authorAvatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff',
        commentsCount: 0,
        votesUp: 0,
        votesDown: 0,
        isFollowing: false,
        hasAttachments: formData.coverImage !== null,
        attachments: []
      };

      // Guardar en localStorage temporalmente (después se puede cambiar por API)
      const existingForums = JSON.parse(localStorage.getItem('createdForums') || '[]');
      const newForum = {
        ...forumData,
        id: Date.now(), // ID temporal
        tags: [formData.category] // Usar categoría como tag
      };

      existingForums.push(newForum);
      localStorage.setItem('createdForums', JSON.stringify(existingForums));

      alert(isDraft ? '✅ Fòrum guardat com a borrador!' : '✅ Fòrum publicat correctament!');
      router.push('/admin/foros/listar');
    } catch {
      alert('Error al processar el fòrum');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (confirm('Vols sortir sense guardar els canvis?')) {
      router.push('/admin/foros/listar');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} updateField={updateField} handleImageUpload={handleImageUpload} removeImage={removeImage} errors={errors} />;
      case 2:
        return <Step2Configuration formData={formData} updateField={updateField} errors={errors} />;
      case 3:
        return <Step3Moderation formData={formData} updateField={updateField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} errors={errors} />;
      case 4:
        return <Step4Review formData={formData} onSaveDraft={() => handleSubmit(true)} onPublish={() => handleSubmit(false)} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <SimpleWizard
      title="Crear Nou Fòrum"
      steps={steps}
      currentStep={currentStep}
      onClose={handleClose}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={undefined}
      isLoading={isLoading}
      submitText="Crear Fòrum"
      loadingText="Creant..."
      showModal={true}
    >
      {renderStep()}
    </SimpleWizard>
  );
}

// Step 1: Información básica
function Step1BasicInfo({ formData, updateField, handleImageUpload, removeImage, errors }: any) {
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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
  };

  const categories = [
    'General',
    'Laboral',
    'Formació',
    'Beneficis',
    'Normativa',
    'Tecnologia',
    'Salut i Benestar',
    'Economia',
    'Mobilitat',
    'Habitatge',
    'Altres'
  ];

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imatge de portada
        </label>
        <div
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {formData.coverImageUrl ? (
            <div className="relative">
              <img
                src={formData.coverImageUrl}
                alt="Vista previa"
                className="h-32 w-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="cover-image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Puja una imatge</span>
                  <input
                    id="cover-image"
                    name="cover-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </label>
                <p className="pl-1">o arrossega i deixa anar</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF fins a 10MB</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Títol del Fòrum *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ex: Debat sobre conciliació laboral"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripció *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descriu el tema i objectiu del fòrum..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
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

// Step 2: Configuración
function Step2Configuration({ formData, updateField, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Opcions generals</h3>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => updateField('isPublic', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
            Fòrum públic (visible per a tots els usuaris)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowAnonymous"
            checked={formData.allowAnonymous}
            onChange={(e) => updateField('allowAnonymous', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="allowAnonymous" className="ml-2 text-sm text-gray-700">
            Permetre participació anònima
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPinned"
            checked={formData.isPinned}
            onChange={(e) => updateField('isPinned', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPinned" className="ml-2 text-sm text-gray-700">
            <span className="flex items-center gap-2">
              <Pin className="w-4 h-4" />
              Anclar fòrum (sempre visible a la part superior)
            </span>
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowAttachments"
            checked={formData.allowAttachments}
            onChange={(e) => updateField('allowAttachments', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="allowAttachments" className="ml-2 text-sm text-gray-700">
            Permetre fitxers adjunts
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Màxim de participants (deixa en blanc per il·limitat)
        </label>
        <input
          type="number"
          value={formData.maxParticipants}
          onChange={(e) => updateField('maxParticipants', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ex: 100"
          min="0"
        />
      </div>
    </div>
  );
}

// Step 3: Moderación
function Step3Moderation({ formData, updateField, addArrayItem, removeArrayItem, errors }: any) {
  const [newRule, setNewRule] = useState('');
  const [newModerator, setNewModerator] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Regles del fòrum</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addArrayItem('rules', newRule);
                setNewRule('');
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Afegeix una regla..."
          />
          <button
            type="button"
            onClick={() => {
              addArrayItem('rules', newRule);
              setNewRule('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Afegir
          </button>
        </div>
        <div className="space-y-2">
          {formData.rules.map((rule: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
              <span className="text-sm">{index + 1}. {rule}</span>
              <button
                type="button"
                onClick={() => removeArrayItem('rules', index)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Moderadors</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="email"
            value={newModerator}
            onChange={(e) => setNewModerator(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addArrayItem('moderators', newModerator);
                setNewModerator('');
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Email del moderador..."
          />
          <button
            type="button"
            onClick={() => {
              addArrayItem('moderators', newModerator);
              setNewModerator('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Afegir
          </button>
        </div>
        <div className="space-y-2">
          {formData.moderators.map((mod: string, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
              <span className="text-sm">{mod}</span>
              <button
                type="button"
                onClick={() => removeArrayItem('moderators', index)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tancar automàticament després de (dies)
        </label>
        <input
          type="number"
          value={formData.autoCloseAfterDays}
          onChange={(e) => updateField('autoCloseAfterDays', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Deixa en blanc per no tancar automàticament"
          min="0"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="requireApproval"
          checked={formData.requireApproval}
          onChange={(e) => updateField('requireApproval', e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="requireApproval" className="ml-2 text-sm text-gray-700">
          Requerir aprovació per publicar missatges
        </label>
      </div>
    </div>
  );
}

// Step 4: Review
function Step4Review({ formData, onSaveDraft, onPublish, isLoading }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p className="text-sm text-blue-700">
          Revisa la informació abans de crear el fòrum
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900">Informació bàsica</h3>
          <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm"><span className="font-medium">Títol:</span> {formData.title}</p>
            <p className="text-sm"><span className="font-medium">Categoria:</span> {formData.category}</p>
            <p className="text-sm"><span className="font-medium">Descripció:</span> {formData.description}</p>
            {formData.coverImageUrl && (
              <div>
                <p className="text-sm font-medium mb-2">Imatge de portada:</p>
                <img
                  src={formData.coverImageUrl}
                  alt="Portada del fòrum"
                  className="h-20 w-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900">Configuració</h3>
          <div className="mt-2 bg-gray-50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-medium">Visibilitat:</span> {formData.isPublic ? 'Públic' : 'Privat'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Participació anònima:</span> {formData.allowAnonymous ? 'Sí' : 'No'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Fòrum anclat:</span> {formData.isPinned ? 'Sí' : 'No'}
            </p>
            <p className="text-sm">
              <span className="font-medium">Fitxers adjunts:</span> {formData.allowAttachments ? 'Permesos' : 'No permesos'}
            </p>
            {formData.maxParticipants && (
              <p className="text-sm">
                <span className="font-medium">Màxim participants:</span> {formData.maxParticipants}
              </p>
            )}
          </div>
        </div>

        {formData.rules.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900">Regles</h3>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-1">
                {formData.rules.map((rule: string, index: number) => (
                  <li key={index} className="text-sm">{rule}</li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {formData.moderators.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900">Moderadors</h3>
            <div className="mt-2 bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-1">
                {formData.moderators.map((mod: string, index: number) => (
                  <li key={index} className="text-sm">• {mod}</li>
                ))}
              </ul>
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
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Publicant...
            </>
          ) : (
            <>
              🚀 Publicar fòrum
            </>
          )}
        </button>
      </div>
    </div>
  );
}