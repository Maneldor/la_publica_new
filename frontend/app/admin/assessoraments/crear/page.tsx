'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ModalityConfig {
  tipus: 'presencial' | 'online' | 'telefonica' | 'email';
  activa: boolean;
  config?: {
    durada?: number;
    places_disponibles?: number;
    preu_sessio?: number;
    horaris_disponibles?: string[];
    instruccions?: string;
  };
}

const CATEGORIES = [
  'Contractació Pública',
  'Tributació',
  'Digitalització',
  'Recursos Humans',
  'Sostenibilitat',
  'Protecció de Dades',
  'Finances Públiques',
  'Procediments Administratius',
  'Urbanisme i Territori',
  'Desenvolupament Professional'
];

const MODALITAT_OPTIONS = [
  { value: 'presencial', label: 'Presencial', icon: '🏢' },
  { value: 'online', label: 'Online', icon: '💻' },
  { value: 'telefonica', label: 'Telefònica', icon: '📞' },
  { value: 'email', label: 'Email', icon: '✉️' }
];

export default function CrearAssessoramentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    titol: '',
    subtitol: '',
    categoria: '',
    imagen: '',
    badges: [] as string[],
    empresa_id: '',
    expert_nom: '',
    expert_carrec: '',
    expert_experiencia: '',
    expert_clients: '',
    expert_formacio: '',
    expert_colegiada: '',
    expert_frase: '',
    expert_linkedin: '',
    descripcio: '',
    que_inclou: [] as string[],
    dirigit_a: [] as string[],
    per_que_gratuit: '',
    status: 'esborrany' as 'esborrany' | 'publicat' | 'inactiu'
  });

  const [newBadge, setNewBadge] = useState('');
  const [newInclude, setNewInclude] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return '';

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const imageFormData = new FormData();
      imageFormData.append('image', imageFile);

      const response = await fetch('http://localhost:5000/api/v1/cloudinary/assessoraments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: imageFormData
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.url;
      } else {
        alert('Error al pujar la imatge');
        return '';
      }
    } catch {
      alert('Error de connexió');
      return '';
    } finally {
      setUploadingImage(false);
    }
  };

  const [modalitats, setModalitats] = useState<ModalityConfig[]>([
    { tipus: 'presencial', activa: false, config: { durada: 60, places_disponibles: 10, preu_sessio: 0 } },
    { tipus: 'online', activa: false, config: { durada: 45, places_disponibles: 15, preu_sessio: 0 } },
    { tipus: 'telefonica', activa: false, config: { durada: 30, places_disponibles: 20, preu_sessio: 0 } },
    { tipus: 'email', activa: false, config: { durada: 0, places_disponibles: 50, preu_sessio: 0 } }
  ]);

  const addBadge = () => {
    if (newBadge.trim() && !formData.badges.includes(newBadge.trim())) {
      setFormData({
        ...formData,
        badges: [...formData.badges, newBadge.trim()]
      });
      setNewBadge('');
    }
  };

  const removeBadge = (badge: string) => {
    setFormData({
      ...formData,
      badges: formData.badges.filter(b => b !== badge)
    });
  };

  const addInclude = () => {
    if (newInclude.trim() && !formData.que_inclou.includes(newInclude.trim())) {
      setFormData({
        ...formData,
        que_inclou: [...formData.que_inclou, newInclude.trim()]
      });
      setNewInclude('');
    }
  };

  const removeInclude = (item: string) => {
    setFormData({
      ...formData,
      que_inclou: formData.que_inclou.filter(i => i !== item)
    });
  };

  const addTargetAudience = () => {
    if (newTargetAudience.trim() && !formData.dirigit_a.includes(newTargetAudience.trim())) {
      setFormData({
        ...formData,
        dirigit_a: [...formData.dirigit_a, newTargetAudience.trim()]
      });
      setNewTargetAudience('');
    }
  };

  const removeTargetAudience = (item: string) => {
    setFormData({
      ...formData,
      dirigit_a: formData.dirigit_a.filter(i => i !== item)
    });
  };

  const handleModalityToggle = (tipus: string) => {
    setModalitats(prev =>
      prev.map(m =>
        m.tipus === tipus
          ? { ...m, activa: !m.activa }
          : m
      )
    );
  };

  const handleModalityConfigChange = (tipus: string, field: string, value: string | number) => {
    setModalitats(prev =>
      prev.map(m =>
        m.tipus === tipus
          ? { ...m, config: { ...m.config, [field]: value } }
          : m
      )
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addQualification = () => {
    // if (newQualification.trim() && !formData.expert_qualificacions.includes(newQualification.trim())) {
    //   setFormData({
    //     ...formData,
    //     expert_qualificacions: [...formData.expert_qualificacions, newQualification.trim()]
    //   });
    //   setNewQualification('');
    // }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeQualification = (qualification: string) => {
    // setFormData({
    //   ...formData,
    //   expert_qualificacions: formData.expert_qualificacions.filter(q => q !== qualification)
    // });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // 1. Subir imagen si existe
      let imageUrl = formData.imagen;
      if (imageFile) {
        const uploadedUrl = await handleImageUpload();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // 2. Generar slug del títol
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

      // 3. Preparar datos del assessorament
      const assessoramentData = {
        ...formData,
        imagen: imageUrl,
        slug,
        modalitats: modalitats.filter(m => m.activa),
        valoracio: 0,
        total_valoracions: 0,
        consultes_realitzades: 0,
        stats: {
          views: 0,
          bookings: 0,
          completions: 0,
          ratio_conversio: 0
        }
      };

      const response = await fetch('http://localhost:5000/api/v1/assessoraments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assessoramentData)
      });

      if (response.ok) {
        alert('Assessorament creat exitosament');
        router.push('/admin/assessoraments/listar');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear l&apos;assessorament');
      }
    } catch {
      alert('Error de connexió');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Crear Assessorament</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informació Bàsica */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informació Bàsica</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Títol de l&apos;Assessorament *
              </label>
              <input
                type="text"
                required
                value={formData.titol}
                onChange={(e) => setFormData({ ...formData, titol: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Assessorament Legal en Contractació Pública"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítol
              </label>
              <input
                type="text"
                value={formData.subtitol}
                onChange={(e) => setFormData({ ...formData, subtitol: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripció breu complementària"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona una categoria</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen de l&apos;Assessorament
              </label>
              <div className="flex items-center gap-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {uploadingImage && (
                    <p className="text-sm text-gray-500 mt-1">Pujant imatge...</p>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O introdueix una URL:
                </label>
                <input
                  type="url"
                  value={formData.imagen}
                  onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/imagen.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Badges
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBadge())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: GRATUÏT, Verificat, Legal"
                />
                <button
                  type="button"
                  onClick={addBadge}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Afegir
                </button>
              </div>
              {formData.badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.badges.map((badge, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                      {badge}
                      <button
                        type="button"
                        onClick={() => removeBadge(badge)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripció *
              </label>
              <textarea
                required
                value={formData.descripcio}
                onChange={(e) => setFormData({ ...formData, descripcio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripció detallada de l&apos;assessorament..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estat *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'esborrany' | 'publicat' | 'inactiu' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="esborrany">Esborrany</option>
                <option value="publicat">Publicat</option>
                <option value="inactiu">Inactiu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expert Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informació de l&apos;Expert</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l&apos;Expert *
                </label>
                <input
                  type="text"
                  required
                  value={formData.expert_nom}
                  onChange={(e) => setFormData({ ...formData, expert_nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dr. Maria Garcia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Càrrec *
                </label>
                <input
                  type="text"
                  required
                  value={formData.expert_carrec}
                  onChange={(e) => setFormData({ ...formData, expert_carrec: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Advocada especialista en Contractació Pública i Dret Administratiu"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiència *
                </label>
                <input
                  type="text"
                  required
                  value={formData.expert_experiencia}
                  onChange={(e) => setFormData({ ...formData, expert_experiencia: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15 anys d&apos;experiència"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clients
                </label>
                <input
                  type="text"
                  value={formData.expert_clients}
                  onChange={(e) => setFormData({ ...formData, expert_clients: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Assessora de +50 ajuntaments"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formació
                </label>
                <input
                  type="text"
                  value={formData.expert_formacio}
                  onChange={(e) => setFormData({ ...formData, expert_formacio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Formadora en contractació pública"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Col·legiada
                </label>
                <input
                  type="text"
                  value={formData.expert_colegiada}
                  onChange={(e) => setFormData({ ...formData, expert_colegiada: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Col·legiada núm. 12345"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frase Personalitzada
              </label>
              <textarea
                value={formData.expert_frase}
                onChange={(e) => setFormData({ ...formData, expert_frase: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="El meu objectiu és ajudar-te a entendre la normativa..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.expert_linkedin}
                onChange={(e) => setFormData({ ...formData, expert_linkedin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/expert-name"
              />
            </div>
          </div>
        </div>

        {/* Modalitats de Consulta */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Modalitats de Consulta</h2>

          <div className="space-y-4">
            {MODALITAT_OPTIONS.map((option) => {
              const modalitat = modalitats.find(m => m.tipus === option.value);
              const isActive = modalitat?.activa || false;

              return (
                <div key={option.value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleModalityToggle(option.value)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-lg">{option.icon}</span>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </label>
                  </div>

                  {isActive && (
                    <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                      {option.value !== 'email' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Durada (minuts)
                          </label>
                          <input
                            type="number"
                            min="15"
                            max="180"
                            value={modalitat?.config?.durada || 60}
                            onChange={(e) => handleModalityConfigChange(option.value, 'durada', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Places disponibles
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={modalitat?.config?.places_disponibles || 10}
                          onChange={(e) => handleModalityConfigChange(option.value, 'places_disponibles', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instruccions especials
                        </label>
                        <input
                          type="text"
                          value={modalitat?.config?.instruccions || ''}
                          onChange={(e) => handleModalityConfigChange(option.value, 'instruccions', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={
                            option.value === 'presencial' ? 'Adreça del lloc' :
                            option.value === 'online' ? 'Link de la reunió' :
                            option.value === 'telefonica' ? 'Número de contacte' :
                            'Adreça de correu'
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Què inclou */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Què inclou l&apos;assessorament</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Elements que inclou
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newInclude}
                  onChange={(e) => setNewInclude(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Sessió d&apos;1 hora amb expert jurídic especialitzat"
                />
                <button
                  type="button"
                  onClick={addInclude}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Afegir
                </button>
              </div>
              {formData.que_inclou.length > 0 && (
                <div className="space-y-2">
                  {formData.que_inclou.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <span className="text-sm text-green-800">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeInclude(item)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dirigit a */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirigit a</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Públic objectiu
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTargetAudience}
                  onChange={(e) => setNewTargetAudience(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetAudience())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Funcionaris responsables de contractació"
                />
                <button
                  type="button"
                  onClick={addTargetAudience}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Afegir
                </button>
              </div>
              {formData.dirigit_a.length > 0 && (
                <div className="space-y-2">
                  {formData.dirigit_a.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                      <span className="text-sm text-purple-800">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeTargetAudience(item)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Per què és gratuït */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Per què és gratuït</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explicació del model gratuït
              </label>
              <textarea
                value={formData.per_que_gratuit}
                onChange={(e) => setFormData({ ...formData, per_que_gratuit: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Explica per què l&apos;empresa ofereix aquesta consulta de forma gratuïta..."
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Creant...' : 'Crear Assessorament'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel·lar
          </button>
        </div>
      </form>
    </div>
  );
}