'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogCardPreview, BlogSinglePreview } from '@/components/BlogPreview';

interface GeneratedContent {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  imageKeywords: string[];
  metaDescription: string;
}

interface ImageResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
  source: string;
}

const CATEGORIES = [
  'Actualidad',
  'Legislación',
  'Conciliación',
  'Formación',
  'Tecnología',
  'Salud Laboral',
  'Opinión',
  'Recursos',
  'Convocatorias',
  'Carrera Profesional'
];

const TAGS_SUGERIDOS = [
  'Oposiciones',
  'Teletrabajo',
  'Promoción',
  'Derechos',
  'Sindicatos',
  'Retribuciones',
  'Jornada',
  'Vacaciones',
  'Permisos',
  'Formación',
  'Digital',
  'Transparencia',
  'Función Pública',
  'Administración Local',
  'Administración Autonómica',
  'Administración General del Estado'
];

export default function CrearBlogPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'manual' | 'ia'>('manual');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'informative'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [pinned, setPinned] = useState(false); // NUEVO: Estado para anclar posts

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/v1/cloudinary/blog', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFeaturedImage(data.data.url);
        setImageFile(file);
      } else {
        alert('Error al subir la imagen');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleGenerateWithIA = async () => {
    if (!topic.trim()) {
      alert('Por favor, ingresa un tema para el post');
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/ai/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic, tone, length, language: 'es' })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.data);
        searchImages(data.data.imageKeywords);
      } else {
        const error = await response.json();
        alert(error.error || 'Error al generar el contenido');
      }
    } catch {
      alert('Error de conexión con el servicio de IA');
    } finally {
      setGenerating(false);
    }
  };

  const searchImages = async (keywords: string[]) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/ai/search-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ keywords, limit: 9 })
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.data);
      }
    } catch {
      console.error('Error buscando imágenes');
    }
  };

  // NUEVO: Validación de contenido inapropiado
  const validateContent = async (contentToValidate: {
    title: string;
    excerpt: string;
    content: string;
  }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/content/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contentToValidate)
      });

      if (response.ok) {
        const validation = await response.json();
        return validation;
      }
      return { isValid: true }; // Si falla la validación, permitir continuar
    } catch {
      console.error('Error validando contenido');
      return { isValid: true }; // Si falla la validación, permitir continuar
    }
  };

  const handlePublish = async () => {
    let postData;

    if (mode === 'ia' && generatedContent) {
      // NUEVO: Validar contenido generado por IA
      const validation = await validateContent({
        title: generatedContent.title,
        excerpt: generatedContent.excerpt,
        content: generatedContent.content
      });

      if (!validation.isValid) {
        alert(`Contenido inapropiado detectado: ${validation.message || 'El contenido contiene palabras no permitidas'}`);
        return;
      }

      postData = {
        title: generatedContent.title,
        slug: generatedContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: generatedContent.excerpt,
        content: generatedContent.content,
        status,
        pinned, // NUEVO: Incluir estado de anclado
        category: category || 'Actualidad',
        tags: generatedContent.tags.join(','),
        featuredImage: selectedImage?.url || '',
      };
    } else {
      if (!title.trim() || !content.trim()) {
        alert('Título y contenido son obligatorios');
        return;
      }

      // NUEVO: Validar contenido manual
      const validation = await validateContent({
        title,
        excerpt,
        content
      });

      if (!validation.isValid) {
        alert(`Contenido inapropiado detectado: ${validation.message || 'El contenido contiene palabras no permitidas'}`);
        return;
      }

      postData = {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt,
        content,
        status,
        pinned, // NUEVO: Incluir estado de anclado
        category: category || 'Actualidad',
        tags: selectedTags.join(','),
        featuredImage,
      };
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        alert('Post creado exitosamente');
        router.push('/admin/blog/listar');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al publicar el post');
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Post de Blog</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Modo de creación</label>
        <div className="flex gap-4">
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setMode('ia')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'ia' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Con IA
          </button>
        </div>
      </div>

      {mode === 'manual' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Título del post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Destacada</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              {featuredImage ? (
                <div className="space-y-4">
                  <img src={featuredImage} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  <button
                    onClick={() => setFeaturedImage('')}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Eliminar imagen
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-600">Arrastra una imagen aquí o</p>
                  <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                    Seleccionar archivo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {uploadingImage && <p className="text-sm text-gray-500">Subiendo...</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Extracto</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Breve descripción del post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contenido *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder="Escribe el contenido en HTML o texto plano..."
            />
          </div>

          {/* NUEVO: Estado de publicación y opción de anclar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
          </div>

          {/* NUEVO: Opción de anclar post */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="pinned"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="pinned" className="flex-1 cursor-pointer">
              <div className="font-medium text-gray-900">📌 Anclar este post</div>
              <div className="text-sm text-gray-600">
                Los posts anclados aparecerán siempre al principio del blog
              </div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {TAGS_SUGERIDOS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Añadir tag personalizado"
              />
              <button
                onClick={addCustomTag}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Añadir
              </button>
            </div>
            {selectedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                    {tag}
                    <button onClick={() => toggleTag(tag)} className="text-blue-600 hover:text-blue-800">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handlePublish}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Crear Post'}
            </button>
          </div>
        </div>
      )}

      {mode === 'ia' && !generatedContent && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Sobre qué tema quieres escribir? *
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ej: Beneficios de la conciliación laboral en la administración pública"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tono</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as 'professional' | 'casual' | 'informative')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="professional">Profesional</option>
                <option value="casual">Casual</option>
                <option value="informative">Informativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitud</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as 'short' | 'medium' | 'long')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="short">Corto (300-500 palabras)</option>
                <option value="medium">Medio (800-1200 palabras)</option>
                <option value="long">Largo (1500-2000 palabras)</option>
              </select>
            </div>
          </div>

          {/* NUEVO: Estado y opción de anclar para modo IA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
          </div>

          {/* NUEVO: Opción de anclar post en modo IA */}
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <input
              type="checkbox"
              id="pinned-ia"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="pinned-ia" className="flex-1 cursor-pointer">
              <div className="font-medium text-gray-900">📌 Anclar este post</div>
              <div className="text-sm text-gray-600">
                Los posts anclados aparecerán siempre al principio del blog
              </div>
            </label>
          </div>

          <button
            onClick={handleGenerateWithIA}
            disabled={generating}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            {generating ? 'Generando contenido...' : 'Generar Post con IA'}
          </button>
        </div>
      )}

      {mode === 'ia' && generatedContent && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{generatedContent.title}</h2>
            <p className="text-gray-600 mb-4 italic">{generatedContent.excerpt}</p>
            <div
              className="prose max-w-none mb-4"
              dangerouslySetInnerHTML={{ __html: generatedContent.content }}
            />
            <div className="flex flex-wrap gap-2">
              {generatedContent.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {images.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Selecciona una imagen destacada</h3>
              <div className="grid grid-cols-3 gap-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                      selectedImage?.id === img.id ? 'border-purple-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img.thumbnailUrl} alt="" className="w-full h-48 object-cover" />
                    <p className="text-xs text-gray-500 p-2">Por {img.photographer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setGeneratedContent(null);
                setImages([]);
                setSelectedImage(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Regenerar
            </button>
            <button
              onClick={handlePublish}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Publicando...' : 'Publicar Post'}
            </button>
          </div>
        </div>
      )}

      {((mode === 'manual' && (title || content)) || (mode === 'ia' && generatedContent)) && (
        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900">Vista Previa</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BlogCardPreview
              title={mode === 'manual' ? title : generatedContent?.title || ''}
              excerpt={mode === 'manual' ? excerpt : generatedContent?.excerpt || ''}
              featuredImage={mode === 'manual' ? featuredImage : selectedImage?.url || ''}
              tags={mode === 'manual' ? selectedTags : generatedContent?.tags || []}
            />

            <BlogSinglePreview
              title={mode === 'manual' ? title : generatedContent?.title || ''}
              content={mode === 'manual' ? content : generatedContent?.content || ''}
              featuredImage={mode === 'manual' ? featuredImage : selectedImage?.url || ''}
              tags={mode === 'manual' ? selectedTags : generatedContent?.tags || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}