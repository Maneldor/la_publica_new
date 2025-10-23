'use client';

import { useState } from 'react';
import {
  Upload,
  X,
  Plus,
  Info,
  User,
  Settings,
  FileText,
  HelpCircle,
  Image,
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  Video,
  Building2,
  Eye,
  Tag,
  Calendar,
  ShoppingBag
} from 'lucide-react';

const CATEGORIES = [
  'legal',
  'fiscal',
  'salut',
  'tecnologia',
  'immobiliari'
];

const MODALITAT_OPTIONS = [
  { value: 'presencial', label: 'Presencial', icon: '🏢' },
  { value: 'online', label: 'Online', icon: '💻' },
  { value: 'telefonica', label: 'Telefònica', icon: '📞' },
  { value: 'email', label: 'Email', icon: '✉️' }
];

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
  titol: string;
  subtitol: string;
  categoria: string;
  empresa_id: string;
  descripcio: string;
  status: 'esborrany' | 'publicat' | 'inactiu';
  expert_nom: string;
  expert_carrec: string;
  expert_experiencia: string;
  expert_clients: string;
  expert_formacio: string;
  expert_colegiada: string;
  expert_frase: string;
  expert_linkedin: string;
  modalitats: ModalityConfig[];
  que_inclou: string[];
  dirigit_a: string[];
  per_que_gratuit: string;
  imagen: string;
  badges: string[];
}

interface StepProps {
  formData: WizardFormData;
  updateField: (field: keyof WizardFormData, value: any) => void;
  addArrayItem?: (field: 'que_inclou' | 'dirigit_a' | 'badges', value: string) => void;
  removeArrayItem?: (field: 'que_inclou' | 'dirigit_a' | 'badges', value: string) => void;
  companies?: Company[];
  errors: Record<string, string>;
}

// Step 1: Basic Information
export const Step1Basic: React.FC<StepProps> = ({ formData, updateField, companies, errors }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Info className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Informació Bàsica</h2>
          <p className="text-gray-600">Proporciona la informació general de l'assessorament</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Títol de l'Assessorament *
          </label>
          <input
            type="text"
            value={formData.titol}
            onChange={(e) => updateField('titol', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.titol ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ex: Assessorament Legal en Contractació Pública"
          />
          {errors.titol && <p className="mt-1 text-sm text-red-600">{errors.titol}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtítol (opcional)
          </label>
          <input
            type="text"
            value={formData.subtitol}
            onChange={(e) => updateField('subtitol', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Primera consulta gratuïta de 60 minuts"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => updateField('categoria', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.categoria ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una categoria</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.categoria && <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Empresa *
            </label>
            <select
              value={formData.empresa_id}
              onChange={(e) => updateField('empresa_id', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.empresa_id ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona una empresa</option>
              {companies?.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
            {errors.empresa_id && <p className="mt-1 text-sm text-red-600">{errors.empresa_id}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripció *
          </label>
          <textarea
            value={formData.descripcio}
            onChange={(e) => updateField('descripcio', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.descripcio ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Descripció detallada de l'assessorament..."
          />
          {errors.descripcio && <p className="mt-1 text-sm text-red-600">{errors.descripcio}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estat
          </label>
          <select
            value={formData.status}
            onChange={(e) => updateField('status', e.target.value as 'esborrany' | 'publicat' | 'inactiu')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="esborrany">Esborrany</option>
            <option value="publicat">Publicat</option>
            <option value="inactiu">Inactiu</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Step 2: Expert Information
export const Step2Expert: React.FC<StepProps> = ({ formData, updateField, errors }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <User className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Informació de l'Expert</h2>
          <p className="text-gray-600">Detalls del professional que ofereix l'assessorament</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'Expert *
            </label>
            <input
              type="text"
              value={formData.expert_nom}
              onChange={(e) => updateField('expert_nom', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expert_nom ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Dr. Maria Garcia"
            />
            {errors.expert_nom && <p className="mt-1 text-sm text-red-600">{errors.expert_nom}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Càrrec *
            </label>
            <input
              type="text"
              value={formData.expert_carrec}
              onChange={(e) => updateField('expert_carrec', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expert_carrec ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Advocada especialista en Contractació Pública"
            />
            {errors.expert_carrec && <p className="mt-1 text-sm text-red-600">{errors.expert_carrec}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experiència *
            </label>
            <input
              type="text"
              value={formData.expert_experiencia}
              onChange={(e) => updateField('expert_experiencia', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.expert_experiencia ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="15 anys d'experiència"
            />
            {errors.expert_experiencia && <p className="mt-1 text-sm text-red-600">{errors.expert_experiencia}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clients
            </label>
            <input
              type="text"
              value={formData.expert_clients}
              onChange={(e) => updateField('expert_clients', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onChange={(e) => updateField('expert_formacio', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              onChange={(e) => updateField('expert_colegiada', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            onChange={(e) => updateField('expert_frase', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            onChange={(e) => updateField('expert_linkedin', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://linkedin.com/in/expert-name"
          />
        </div>
      </div>
    </div>
  );
};

// Step 3: Modalitats
export const Step3Modalitats: React.FC<StepProps> = ({ formData, updateField, errors }) => {
  const handleModalityToggle = (tipus: string) => {
    const newModalitats = formData.modalitats.map(m =>
      m.tipus === tipus ? { ...m, activa: !m.activa } : m
    );
    updateField('modalitats', newModalitats);
  };

  const handleModalityConfigChange = (tipus: string, field: string, value: string | number) => {
    const newModalitats = formData.modalitats.map(m =>
      m.tipus === tipus
        ? { ...m, config: { ...m.config, [field]: value } }
        : m
    );
    updateField('modalitats', newModalitats);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Settings className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Modalitats de Consulta</h2>
          <p className="text-gray-600">Selecciona com els usuaris poden accedir a l'assessorament</p>
        </div>
      </div>

      {errors.modalitats && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.modalitats}</p>
        </div>
      )}

      <div className="space-y-4">
        {MODALITAT_OPTIONS.map((option) => {
          const modalitat = formData.modalitats.find(m => m.tipus === option.value);
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
  );
};

// Step 4: Contingut
export const Step4Contingut: React.FC<StepProps> = ({ formData, updateField, addArrayItem, removeArrayItem, errors }) => {
  const [newInclude, setNewInclude] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('');

  const handleAddInclude = () => {
    if (addArrayItem && newInclude.trim()) {
      addArrayItem('que_inclou', newInclude);
      setNewInclude('');
    }
  };

  const handleAddTargetAudience = () => {
    if (addArrayItem && newTargetAudience.trim()) {
      addArrayItem('dirigit_a', newTargetAudience);
      setNewTargetAudience('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-lg">
          <FileText className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Contingut de l'Assessorament</h2>
          <p className="text-gray-600">Defineix què inclou i a qui va dirigit</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Què inclou */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Què inclou l'assessorament *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newInclude}
              onChange={(e) => setNewInclude(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInclude())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Sessió d'1 hora amb expert jurídic especialitzat"
            />
            <button
              type="button"
              onClick={handleAddInclude}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.que_inclou && <p className="text-sm text-red-600 mb-2">{errors.que_inclou}</p>}
          {formData.que_inclou.length > 0 && (
            <div className="space-y-2">
              {formData.que_inclou.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <span className="text-sm text-green-800">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem && removeArrayItem('que_inclou', item)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dirigit a */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirigit a *
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTargetAudience}
              onChange={(e) => setNewTargetAudience(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTargetAudience())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Funcionaris responsables de contractació"
            />
            <button
              type="button"
              onClick={handleAddTargetAudience}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {errors.dirigit_a && <p className="text-sm text-red-600 mb-2">{errors.dirigit_a}</p>}
          {formData.dirigit_a.length > 0 && (
            <div className="space-y-2">
              {formData.dirigit_a.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                  <span className="text-sm text-purple-800">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem && removeArrayItem('dirigit_a', item)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Step 5: Model Gratuït
export const Step5Gratuit: React.FC<StepProps> = ({ formData, updateField, errors }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-100 rounded-lg">
          <HelpCircle className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Per què és Gratuït?</h2>
          <p className="text-gray-600">Explica als usuaris el model d'assessorament gratuït</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Explicació del model gratuït *
        </label>
        <textarea
          value={formData.per_que_gratuit}
          onChange={(e) => updateField('per_que_gratuit', e.target.value)}
          rows={6}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.per_que_gratuit ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Explica per què l'empresa ofereix aquesta consulta de forma gratuïta, com funciona el servei, quines expectatives han de tenir els usuaris, etc."
        />
        {errors.per_que_gratuit && <p className="mt-1 text-sm text-red-600">{errors.per_que_gratuit}</p>}

        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Consells per a una bona explicació:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Explica clarament que és una consulta gratuïta sense compromís</li>
            <li>• Menciona com funciona el procés després de la consulta</li>
            <li>• Destaca els beneficis per als usuaris</li>
            <li>• Indica si hi ha possibilitat de serveis de pagament posteriors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Step 6: Imatge i Final
export const Step6Imatge: React.FC<StepProps> = ({ formData, updateField, addArrayItem, removeArrayItem, errors }) => {
  const [newBadge, setNewBadge] = useState('');

  const handleAddBadge = () => {
    if (addArrayItem && newBadge.trim()) {
      addArrayItem('badges', newBadge);
      setNewBadge('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-pink-100 rounded-lg">
          <Image className="w-6 h-6 text-pink-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Imatge i Tocs Finals</h2>
          <p className="text-gray-600">Afegeix una imatge i badges per completar l'assessorament</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Imatge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imatge de l'Assessorament
          </label>
          <input
            type="url"
            value={formData.imagen}
            onChange={(e) => updateField('imagen', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/imagen.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">
            Introdueix la URL d'una imatge representativa de l'assessorament
          </p>
        </div>

        {/* Badges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Badges (etiquetes)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBadge())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: GRATUÏT, Verificat, Legal"
            />
            <button
              type="button"
              onClick={handleAddBadge}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {formData.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.badges.map((badge, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                  {badge}
                  <button
                    type="button"
                    onClick={() => removeArrayItem && removeArrayItem('badges', badge)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Resum final */}
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resum de l'Assessorament</h3>
          <div className="space-y-3 text-sm">
            <div><strong>Títol:</strong> {formData.titol || 'No definit'}</div>
            <div><strong>Categoria:</strong> {formData.categoria || 'No definida'}</div>
            <div><strong>Expert:</strong> {formData.expert_nom || 'No definit'}</div>
            <div><strong>Modalitats actives:</strong> {formData.modalitats.filter(m => m.activa).map(m => m.tipus).join(', ') || 'Cap'}</div>
            <div><strong>Elements que inclou:</strong> {formData.que_inclou.length}</div>
            <div><strong>Públic objectiu:</strong> {formData.dirigit_a.length}</div>
            <div><strong>Estat:</strong> {formData.status}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 7: Review
export const Step7Review: React.FC<StepProps> = ({ formData, updateField, companies }) => {
  const getCompanyName = (id: string) => {
    const company = companies?.find(c => c.id.toString() === id);
    return company?.name || 'No seleccionada';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-lg">
          <Eye className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Revisió Final</h2>
          <p className="text-gray-600">Revisa tota la informació abans de crear l'assessorament</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informació Bàsica */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Informació Bàsica
          </h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Títol:</span> {formData.titol || 'No definit'}</div>
            <div><span className="font-medium">Subtítol:</span> {formData.subtitol || 'No definit'}</div>
            <div><span className="font-medium">Categoria:</span> {formData.categoria || 'No definida'}</div>
            <div><span className="font-medium">Empresa:</span> {getCompanyName(formData.empresa_id)}</div>
            <div><span className="font-medium">Descripció:</span> {formData.descripcio ? formData.descripcio.substring(0, 100) + '...' : 'No definida'}</div>
          </div>
        </div>

        {/* Expert */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Expert
          </h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Nom:</span> {formData.expert_nom || 'No definit'}</div>
            <div><span className="font-medium">Càrrec:</span> {formData.expert_carrec || 'No definit'}</div>
            <div><span className="font-medium">Experiència:</span> {formData.expert_experiencia || 'No definida'}</div>
            <div><span className="font-medium">Clients:</span> {formData.expert_clients || 'No definit'}</div>
          </div>
        </div>

        {/* Modalitats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Modalitats Actives
          </h3>
          <div className="space-y-2 text-sm">
            {formData.modalitats.filter(m => m.activa).map(modalitat => (
              <div key={modalitat.tipus} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="capitalize">{modalitat.tipus}</span>
                {modalitat.config?.durada && modalitat.config.durada > 0 && (
                  <span className="text-gray-500">({modalitat.config.durada} min)</span>
                )}
              </div>
            ))}
            {formData.modalitats.filter(m => m.activa).length === 0 && (
              <div className="text-gray-500">Cap modalitat seleccionada</div>
            )}
          </div>
        </div>

        {/* Contingut */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Contingut
          </h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Què inclou:</span> {formData.que_inclou.length} elements</div>
            <div><span className="font-medium">Dirigit a:</span> {formData.dirigit_a.length} grups</div>
            <div><span className="font-medium">Model gratuït:</span> {formData.per_que_gratuit ? 'Definit' : 'No definit'}</div>
          </div>
        </div>

        {/* Imatge i badges */}
        <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Imatge i Badges
          </h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Imatge:</span> {formData.imagen || 'No definida'}</div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Badges:</span>
              {formData.badges.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {formData.badges.map((badge, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500">Cap badge afegit</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estat final */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estat de l'assessorament
        </label>
        <select
          value={formData.status}
          onChange={(e) => updateField('status', e.target.value as 'esborrany' | 'publicat' | 'inactiu')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="esborrany">Esborrany - No visible pels usuaris</option>
          <option value="publicat">Publicat - Visible i accessible</option>
          <option value="inactiu">Inactiu - No disponible</option>
        </select>
      </div>
    </div>
  );
};

export default {
  Step1Basic,
  Step2Expert,
  Step3Modalitats,
  Step4Contingut,
  Step5Gratuit,
  Step6Imatge,
  Step7Review
};