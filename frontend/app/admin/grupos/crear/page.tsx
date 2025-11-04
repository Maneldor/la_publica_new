'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, FileText, Image, Shield, Tag, UserPlus, Settings } from 'lucide-react';
import WizardLayout from '@/components/wizard/WizardLayout';

interface GroupFormData {
  name: string;
  description: string;
  longDescription: string;
  category: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'SECRET';
  tags: string[];
  coverImageUrl?: string;
  avatarImageUrl?: string;
  adminId?: string;
  moderatorIds: string[];
  enablePrivateForums: boolean;
  enableGroupOffers: boolean;
}

export default function CrearGrupoPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(true);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    longDescription: '',
    category: '',
    visibility: 'PUBLIC',
    tags: [],
    moderatorIds: [],
    enablePrivateForums: false,
    enableGroupOffers: false,
  });
  const [currentTag, setCurrentTag] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [avatarImagePreview, setAvatarImagePreview] = useState<string>('');

  // Categorías predefinidas
  const predefinedCategories = [
    'Administración General',
    'Sanidad',
    'Educación',
    'Justicia',
    'Hacienda',
    'Seguridad',
    'Servicios Sociales',
    'Medio Ambiente',
    'Cultura',
    'Deportes',
    'Urbanismo',
    'Transporte',
    'Tecnología',
    'Recursos Humanos',
    'Comunicación',
  ];

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // 1. Subir imágenes si existen
      let coverImageUrl = '';
      let avatarImageUrl = '';

      if (coverImage) {
        const coverFormData = new FormData();
        coverFormData.append('image', coverImage);

        const coverResponse = await fetch('http://localhost:5000/api/v1/cloudinary/groups', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: coverFormData
        });

        if (coverResponse.ok) {
          const coverData = await coverResponse.json();
          coverImageUrl = coverData.data.url;
        }
      }

      if (avatarImage) {
        const avatarFormData = new FormData();
        avatarFormData.append('image', avatarImage);

        const avatarResponse = await fetch('http://localhost:5000/api/v1/cloudinary/groups', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: avatarFormData
        });

        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          avatarImageUrl = avatarData.data.url;
        }
      }

      // 2. Crear grupo
      const response = await fetch('http://localhost:5000/api/v1/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          coverImageUrl,
          avatarImageUrl
        })
      });

      if (response.ok) {
        alert('Grupo creado exitosamente');
        router.push('/admin/grupos/listar');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear el grupo');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.description.trim().length > 0;
      case 3:
        return formData.longDescription.trim().length > 0;
      case 4:
        return true; // Tags son opcionales
      case 5:
        return true; // Imágenes son opcionales
      case 6:
        return true; // Roles son opcionales
      case 7:
        return true; // Configuración siempre válida
      default:
        return false;
    }
  };

  const steps = [
    {
      title: 'Información básica',
      description: 'Nombre y categoría del grupo',
      icon: <Users className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Información del grupo</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Grupo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Funcionarios de Barcelona"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>

            {!showNewCategory ? (
              <div>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setShowNewCategory(true);
                      setFormData({ ...formData, category: '' });
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona una categoría</option>
                  {predefinedCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="new" className="font-semibold text-blue-600">
                    + Crear nueva categoría
                  </option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onBlur={() => {
                      if (newCategory.trim()) {
                        setFormData({ ...formData, category: newCategory });
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre de la nueva categoría"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategory.trim()) {
                        setFormData({ ...formData, category: newCategory });
                        setShowNewCategory(false);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategory('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-blue-600">
                  Introduce el nombre de la nueva categoría
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              La categoría ayuda a organizar y encontrar el grupo más fácilmente
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Descripciones',
      description: 'Descripción corta y extendida',
      icon: <FileText className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Descripciones del grupo</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción corta *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Breve descripción del grupo (máx. 200 caracteres)..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/200 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción extendida *
            </label>
            <textarea
              required
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe detalladamente el propósito del grupo, objetivos, normas, tipo de contenido que se compartirá..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta descripción aparecerá en la página principal del grupo
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Sugerencias:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Explica el propósito principal del grupo</li>
              <li>• Menciona qué tipo de profesionales pueden unirse</li>
              <li>• Describe qué tipo de contenido se compartirá</li>
              <li>• Indica las normas básicas del grupo</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Etiquetas',
      description: 'Tags para categorización',
      icon: <Tag className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Etiquetas del grupo</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Añadir etiquetas (tags)
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Escribe una etiqueta y presiona Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Añadir
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Las etiquetas ayudan a los usuarios a encontrar tu grupo más fácilmente
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Sugerencias de etiquetas:</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {['React', 'TypeScript', 'Frontend', 'Backend', 'DevOps', 'Cloud', 'Mobile', 'UX/UI', 'Agile', 'Testing'].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (!formData.tags.includes(suggestion)) {
                      setFormData({ ...formData, tags: [...formData.tags, suggestion] });
                    }
                  }}
                  className="px-2 py-1 text-xs bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Imágenes',
      description: 'Portada y avatar del grupo',
      icon: <Image className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Imágenes del grupo</h2>

          {/* Imagen de portada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen de portada (banner)
            </label>

            {coverImagePreview && (
              <div className="mb-3">
                <img
                  src={coverImagePreview}
                  alt="Cover Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
              <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2 text-sm">
                <Image className="w-4 h-4" />
                {coverImagePreview ? 'Cambiar portada' : 'Seleccionar portada'}
              </div>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Recomendado: 1200x300px
            </p>
          </div>

          {/* Avatar del grupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar del grupo
            </label>

            <div className="flex items-center gap-4">
              {avatarImagePreview ? (
                <img
                  src={avatarImagePreview}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
              )}

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarImageChange}
                  className="hidden"
                />
                <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center gap-2 text-sm">
                  <Image className="w-4 h-4" />
                  {avatarImagePreview ? 'Cambiar avatar' : 'Seleccionar avatar'}
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recomendado: imagen cuadrada, mínimo 150x150px
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Consejos:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• La portada aparecerá en la parte superior de la página del grupo</li>
              <li>• El avatar se mostrará como icono del grupo en listados</li>
              <li>• Usa imágenes de alta calidad y relevantes al tema del grupo</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Roles',
      description: 'Administrador y moderadores',
      icon: <UserPlus className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Roles del grupo</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Administrador del grupo
            </label>
            <input
              type="email"
              value={formData.adminId || ''}
              onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email del administrador (dejar vacío para ser tú mismo)"
            />
            <p className="text-xs text-gray-500 mt-1">
              El administrador tendrá control total sobre el grupo
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moderadores (opcional)
            </label>
            <textarea
              value={formData.moderatorIds.join('\n')}
              onChange={(e) => setFormData({ ...formData, moderatorIds: e.target.value.split('\n').filter(email => email.trim()) })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Emails de los moderadores (uno por línea)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Los moderadores pueden gestionar contenido y miembros
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Permisos de roles:</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div>
                <span className="font-medium">👑 Administrador:</span>
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• Control total del grupo</li>
                  <li>• Asignar/remover moderadores</li>
                  <li>• Configurar ajustes del grupo</li>
                  <li>• Eliminar el grupo</li>
                </ul>
              </div>
              <div>
                <span className="font-medium">🛡️ Moderadores:</span>
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• Aprobar/rechazar miembros</li>
                  <li>• Moderar contenido</li>
                  <li>• Fijar publicaciones</li>
                  <li>• Gestionar ofertas del grupo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Configuración',
      description: 'Privacidad y funcionalidades',
      icon: <Settings className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Configuración del grupo</h2>

          {/* Visibilidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de privacidad
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' | 'SECRET' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PUBLIC">🌐 Público</option>
              <option value="PRIVATE">🔒 Privado</option>
              <option value="SECRET">🤫 Oculto</option>
            </select>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {formData.visibility === 'PUBLIC' ? (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">🌐 Grupo Público</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Visible para todos los usuarios</li>
                    <li>• Aparece en búsquedas y listados</li>
                    <li>• Cualquiera puede unirse</li>
                    <li>• El contenido es visible públicamente</li>
                  </ul>
                </div>
              ) : formData.visibility === 'PRIVATE' ? (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">🔒 Grupo Privado</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Visible en búsquedas pero contenido protegido</li>
                    <li>• Requiere aprobación para unirse</li>
                    <li>• Solo miembros ven el contenido</li>
                    <li>• Los no miembros ven información básica</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">🤫 Grupo Oculto</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Invisible en búsquedas públicas</li>
                    <li>• Solo accesible por invitación directa</li>
                    <li>• Completamente privado y secreto</li>
                    <li>• Ideal para equipos internos o proyectos confidenciales</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Funcionalidades del grupo */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Funcionalidades del grupo</h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.enablePrivateForums}
                  onChange={(e) => setFormData({ ...formData, enablePrivateForums: e.target.checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">🏛️ Foros privados</div>
                  <div className="text-sm text-gray-600">
                    Permite crear foros de discusión exclusivos para miembros del grupo
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.enableGroupOffers}
                  onChange={(e) => setFormData({ ...formData, enableGroupOffers: e.target.checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">🎁 Ofertas exclusivas</div>
                  <div className="text-sm text-gray-600">
                    Permite publicar ofertas y descuentos exclusivos para miembros del grupo
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Resumen final */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-4">📋 Resumen del grupo</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-sm"><span className="font-medium">Nombre:</span> {formData.name || 'Sin definir'}</p>
              <p className="text-sm"><span className="font-medium">Categoría:</span> {formData.category || 'Sin categoría'}</p>
              <p className="text-sm"><span className="font-medium">Tags:</span> {formData.tags.length > 0 ? formData.tags.map(tag => `#${tag}`).join(', ') : 'Sin tags'}</p>
              <p className="text-sm"><span className="font-medium">Privacidad:</span> {
                formData.visibility === 'PUBLIC' ? '🌐 Público' :
                formData.visibility === 'PRIVATE' ? '🔒 Privado' :
                '🤫 Oculto'
              }</p>
              <p className="text-sm"><span className="font-medium">Imágenes:</span> {
                (coverImage || avatarImage) ?
                  `${coverImage ? '✓ Portada' : ''} ${avatarImage ? '✓ Avatar' : ''}` :
                  'Sin imágenes'
              }</p>
              <p className="text-sm"><span className="font-medium">Moderadores:</span> {formData.moderatorIds.length || 0}</p>
              <p className="text-sm"><span className="font-medium">Foros privados:</span> {formData.enablePrivateForums ? '✓ Habilitado' : '✗ Deshabilitado'}</p>
              <p className="text-sm"><span className="font-medium">Ofertas exclusivas:</span> {formData.enableGroupOffers ? '✓ Habilitado' : '✗ Deshabilitado'}</p>
            </div>
          </div>
        </div>
      )
    },
  ];

  if (!showWizard) {
    return null;
  }

  return (
    <WizardLayout
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      onClose={() => router.push('/admin/grupos/listar')}
      canGoNext={canGoNext()}
      isLastStep={currentStep === 7}
      isLoading={loading}
      title="Crear Nuevo Grupo"
      submitText="Crear Grupo"
      loadingText="Creando grupo..."
    />
  );
}