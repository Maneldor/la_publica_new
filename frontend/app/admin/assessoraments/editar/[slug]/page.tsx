'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { assessoramentsMock } from '@/data/assessoraments-mock';

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

export default function EditarAssessoramentPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [assessorament, setAssessorament] = useState<any>(null);

  const [formData, setFormData] = useState({
    titol: '',
    subtitol: '',
    categoria: '',
    empresa_id: '',
    expert_nom: '',
    expert_especialitat: '',
    expert_experiencia: '',
    expert_bio: '',
    expert_qualificacions: [] as string[],
    descripcio: '',
    metodologia: '',
    recursos_necessaris: '',
    resultats_esperats: '',
    status: 'esborrany' as 'esborrany' | 'publicat' | 'inactiu'
  });

  const [modalitats, setModalitats] = useState<ModalityConfig[]>([
    { tipus: 'presencial', activa: false, config: { durada: 60, places_disponibles: 10, preu_sessio: 0 } },
    { tipus: 'online', activa: false, config: { durada: 45, places_disponibles: 15, preu_sessio: 0 } },
    { tipus: 'telefonica', activa: false, config: { durada: 30, places_disponibles: 20, preu_sessio: 0 } },
    { tipus: 'email', activa: false, config: { durada: 0, places_disponibles: 50, preu_sessio: 0 } }
  ]);

  const [newQualification, setNewQualification] = useState('');

  useEffect(() => {
    // Simular carga de datos del assessorament
    const currentAssessorament = assessoramentsMock.find(a => a.slug === params.slug);
    if (currentAssessorament) {
      setAssessorament(currentAssessorament);

      // Cargar datos en el formulario
      setFormData({
        titol: currentAssessorament.titol,
        subtitol: currentAssessorament.subtitol || '',
        categoria: currentAssessorament.categoria,
        empresa_id: currentAssessorament.empresa?.id?.toString() || '',
        expert_nom: currentAssessorament.expert?.nom || '',
        expert_especialitat: currentAssessorament.expert?.especialitat || '',
        expert_experiencia: currentAssessorament.expert?.experiencia || '',
        expert_bio: currentAssessorament.expert?.bio || '',
        expert_qualificacions: currentAssessorament.expert?.qualificacions || [],
        descripcio: currentAssessorament.descripcio,
        metodologia: currentAssessorament.metodologia || '',
        recursos_necessaris: currentAssessorament.recursos_necessaris || '',
        resultats_esperats: currentAssessorament.resultats_esperats || '',
        status: (currentAssessorament as any).status || 'publicat'
      });

      // Cargar modalitats
      const loadedModalitats = modalitats.map(m => {
        const existingModalitat = currentAssessorament.modalitats?.find(cm => cm.tipus === m.tipus);
        if (existingModalitat) {
          return {
            ...m,
            activa: existingModalitat.activa,
            config: existingModalitat.config || m.config
          };
        }
        return m;
      });
      setModalitats(loadedModalitats);
    }
  }, [params.slug]);

  const handleModalityToggle = (tipus: string) => {
    setModalitats(prev =>
      prev.map(m =>
        m.tipus === tipus
          ? { ...m, activa: !m.activa }
          : m
      )
    );
  };

  const handleModalityConfigChange = (tipus: string, field: string, value: any) => {
    setModalitats(prev =>
      prev.map(m =>
        m.tipus === tipus
          ? { ...m, config: { ...m.config, [field]: value } }
          : m
      )
    );
  };

  const addQualification = () => {
    if (newQualification.trim() && !formData.expert_qualificacions.includes(newQualification.trim())) {
      setFormData({
        ...formData,
        expert_qualificacions: [...formData.expert_qualificacions, newQualification.trim()]
      });
      setNewQualification('');
    }
  };

  const removeQualification = (qualification: string) => {
    setFormData({
      ...formData,
      expert_qualificacions: formData.expert_qualificacions.filter(q => q !== qualification)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Generar slug del títol
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
        ...formData,
        slug,
        modalitats: modalitats.filter(m => m.activa),
        valoracio: assessorament?.valoracio || 0,
        total_valoracions: assessorament?.total_valoracions || 0,
        consultes_realitzades: assessorament?.consultes_realitzades || 0,
        stats: assessorament?.stats || {
          views: 0,
          bookings: 0,
          completions: 0,
          ratio_conversio: 0
        }
      };

      const response = await fetch(`http://localhost:5000/api/v1/assessoraments/${assessorament.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assessoramentData)
      });

      if (response.ok) {
        alert('Assessorament actualitzat exitosament');
        router.push('/admin/assessoraments/listar');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al actualitzar l\'assessorament');
      }
    } catch (err) {
      alert('Error de connexió');
    } finally {
      setLoading(false);
    }
  };

  if (!assessorament) {
    return (
      <div className="p-6">
        <p>Carregant assessorament...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Assessorament</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>ID: {assessorament.id}</span>
          <span>•</span>
          <span>Slug: {assessorament.slug}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informació Bàsica */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informació Bàsica</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Títol de l'Assessorament *
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
                Descripció *
              </label>
              <textarea
                required
                value={formData.descripcio}
                onChange={(e) => setFormData({ ...formData, descripcio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripció detallada de l'assessorament..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estat *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informació de l'Expert</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'Expert *
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
                  Especialitat *
                </label>
                <input
                  type="text"
                  required
                  value={formData.expert_especialitat}
                  onChange={(e) => setFormData({ ...formData, expert_especialitat: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Advocada especialista en Dret Administratiu"
                />
              </div>
            </div>

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
                placeholder="15 anys d'experiència en contractació pública"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografia
              </label>
              <textarea
                value={formData.expert_bio}
                onChange={(e) => setFormData({ ...formData, expert_bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Biografia professional de l'expert..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualificacions
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Llicenciat en Dret"
                />
                <button
                  type="button"
                  onClick={addQualification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Afegir
                </button>
              </div>
              {formData.expert_qualificacions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.expert_qualificacions.map((qual, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                      {qual}
                      <button
                        type="button"
                        onClick={() => removeQualification(qual)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
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

        {/* Contingut Detallat */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contingut Detallat</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodologia
              </label>
              <textarea
                value={formData.metodologia}
                onChange={(e) => setFormData({ ...formData, metodologia: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Explica com es desenvoluparà l'assessorament..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recursos Necessaris
              </label>
              <textarea
                value={formData.recursos_necessaris}
                onChange={(e) => setFormData({ ...formData, recursos_necessaris: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Documentació o materials que ha d'aportar l'usuari..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultats Esperats
              </label>
              <textarea
                value={formData.resultats_esperats}
                onChange={(e) => setFormData({ ...formData, resultats_esperats: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Què obtindrà l'usuari després de l'assessorament..."
              />
            </div>
          </div>
        </div>

        {/* Estadístiques (només lectura) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadístiques</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Valoració</p>
              <p className="text-2xl font-bold text-yellow-600">⭐ {assessorament.valoracio}</p>
              <p className="text-xs text-gray-500">({assessorament.total_valoracions} valoracions)</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Consultes</p>
              <p className="text-2xl font-bold text-blue-600">{assessorament.consultes_realitzades}</p>
              <p className="text-xs text-gray-500">realitzades</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Visualitzacions</p>
              <p className="text-2xl font-bold text-green-600">{assessorament.stats?.views || 0}</p>
              <p className="text-xs text-gray-500">vistes totals</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Conversió</p>
              <p className="text-2xl font-bold text-purple-600">{assessorament.stats?.ratio_conversio || 0}%</p>
              <p className="text-xs text-gray-500">taxa d'èxit</p>
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
            {loading ? 'Actualitzant...' : 'Actualitzar Assessorament'}
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