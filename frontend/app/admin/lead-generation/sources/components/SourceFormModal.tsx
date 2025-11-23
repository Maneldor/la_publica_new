'use client';

import { useState, useEffect } from 'react';
import { X, TestTube } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ScheduleConfig from './ScheduleConfig';
import SourceTestDialog from './SourceTestDialog';

// Types
type LeadSourceType =
  | 'GOOGLE_MAPS'
  | 'WEB_SCRAPING'
  | 'API_INTEGRATION'
  | 'LINKEDIN'
  | 'CSV_IMPORT'
  | 'CUSTOM';

type ScheduleFrequency =
  | 'MANUAL'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY';

interface LeadSource {
  id: string;
  name: string;
  description: string | null;
  type: LeadSourceType;
  isActive: boolean;
  config: any;
  frequency: ScheduleFrequency;
  lastRun: string | null;
  nextRun: string | null;
  aiProviderId: string | null;
  aiProvider: {
    name: string;
    displayName: string;
  } | null;
  leadsGenerated: number;
  leadsApproved: number;
  successRate: number;
  createdAt: string;
  updatedAt?: string;
}

interface SourceFormModalProps {
  open: boolean;
  onClose: () => void;
  source: LeadSource | null; // null = create new
  onSave: () => void;
}

interface FormData {
  name: string;
  description: string;
  type: LeadSourceType;
  isActive: boolean;
  aiProviderId: string;
  frequency: ScheduleFrequency;
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  config: {
    // Google Maps
    query?: string;
    location?: string;
    radius?: number;
    maxResults?: number;
    // Web Scraping
    url?: string;
    selectors?: string;
    // Custom
    custom?: boolean;
  };
  aiTasks: {
    analysis: boolean;
    scoring: boolean;
    pitch_generation: boolean;
    data_extraction: boolean;
    classification: boolean;
    validation: boolean;
  };
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}

export default function SourceFormModal({
  open,
  onClose,
  source,
  onSave,
}: SourceFormModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const { toast } = useToast();

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'GOOGLE_MAPS',
    isActive: true,
    aiProviderId: '',
    frequency: 'WEEKLY',
    time: '08:00',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    config: {
      maxResults: 50,
      radius: 5,
    },
    aiTasks: {
      analysis: true,
      scoring: true,
      pitch_generation: true,
      data_extraction: true,
      classification: true,
      validation: true,
    },
    analysisDepth: 'detailed',
  });

  // Mock AI providers
  const mockProviders = [
    { id: 'claude-1', name: 'claude', displayName: 'Claude (Anthropic)', isDefault: true },
    { id: 'openai-1', name: 'openai', displayName: 'GPT-4 (OpenAI)', isDefault: false },
    { id: 'gemini-1', name: 'gemini', displayName: 'Gemini Pro (Google)', isDefault: false },
  ];

  // Source type options
  const sourceTypes = [
    { value: 'GOOGLE_MAPS', label: 'Google Maps / Places' },
    { value: 'WEB_SCRAPING', label: 'Web Scraping (Genèric)' },
    { value: 'API_INTEGRATION', label: 'Integració API' },
    { value: 'LINKEDIN', label: 'LinkedIn' },
    { value: 'CSV_IMPORT', label: 'Importació CSV' },
    { value: 'CUSTOM', label: 'Personalitzat' },
  ];

  // Initialize form data when source changes
  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name,
        description: source.description || '',
        type: source.type,
        isActive: source.isActive,
        aiProviderId: source.aiProviderId || '',
        frequency: source.frequency,
        time: '08:00', // Default, would come from source
        dayOfWeek: 1,
        dayOfMonth: 1,
        config: source.config || {},
        aiTasks: {
          analysis: true,
          scoring: true,
          pitch_generation: true,
          data_extraction: true,
          classification: true,
          validation: true,
        },
        analysisDepth: 'detailed',
      });
    } else {
      // Reset form for new source
      setFormData({
        name: '',
        description: '',
        type: 'GOOGLE_MAPS',
        isActive: true,
        aiProviderId: mockProviders.find(p => p.isDefault)?.id || '',
        frequency: 'WEEKLY',
        time: '08:00',
        dayOfWeek: 1,
        dayOfMonth: 1,
        config: {
          maxResults: 50,
          radius: 5,
        },
        aiTasks: {
          analysis: true,
          scoring: true,
          pitch_generation: true,
          data_extraction: true,
          classification: true,
          validation: true,
        },
        analysisDepth: 'detailed',
      });
    }
  }, [source]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
  };

  const handleTaskChange = (task: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      aiTasks: {
        ...prev.aiTasks,
        [task]: enabled,
      },
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push('El nom és obligatori');
    if (!formData.type) errors.push('El tipus és obligatori');
    if (!formData.aiProviderId) errors.push('L\'AI Provider és obligatori');
    if (!formData.frequency) errors.push('La freqüència és obligatòria');

    // Type-specific validations
    switch (formData.type) {
      case 'GOOGLE_MAPS':
        if (!formData.config.query?.trim()) errors.push('La query és obligatòria');
        if (!formData.config.location?.trim()) errors.push('La ubicació és obligatòria');
        if (formData.config.maxResults <= 0) errors.push('El màxim de resultats ha de ser positiu');
        break;
      case 'WEB_SCRAPING':
        if (!formData.config.url?.trim()) errors.push('La URL és obligatòria');
        if (!formData.config.selectors?.trim()) errors.push('Els selectors són obligatoris');
        break;
    }

    if (errors.length > 0) {
      toast({
        title: 'Errors de validació',
        description: errors.join(', '),
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleTestConfiguration = () => {
    if (!validateForm()) return;

    setTestDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: source ? 'Font actualitzada' : 'Font creada',
        description: `${formData.name} s'ha ${source ? 'actualitzat' : 'creat'} correctament`,
      });

      onSave();
    } catch (error) {
      toast({
        title: 'Error',
        description: `No s'ha pogut ${source ? 'actualitzar' : 'crear'} la font`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {source ? `Editar ${source.name}` : 'Crear Nova Font de Scraping'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex">
              {[
                { id: 'basic', label: 'Informació Bàsica' },
                { id: 'config', label: 'Configuració de Scraping' },
                { id: 'schedule', label: 'Programació' },
                { id: 'ai', label: 'Tasques d\'IA' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la font *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Restaurants Barcelona"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripció
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descriu què fa aquesta font..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Type */}
                {!source && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipus de font *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {sourceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* AI Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Provider *
                  </label>
                  <select
                    value={formData.aiProviderId}
                    onChange={(e) => handleInputChange('aiProviderId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Selecciona un provider...</option>
                    {mockProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.displayName} {provider.isDefault && '(Per defecte)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Font activa
                  </label>
                  <p className="ml-2 text-xs text-gray-500">
                    Les fonts inactives no s'executaran automàticament
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-4">
                {formData.type === 'GOOGLE_MAPS' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Query de cerca *
                      </label>
                      <input
                        type="text"
                        value={formData.config.query || ''}
                        onChange={(e) => handleConfigChange('query', e.target.value)}
                        placeholder="restaurant, gimnàs, cafeteria..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Paraules clau per cercar a Google Maps
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicació *
                      </label>
                      <input
                        type="text"
                        value={formData.config.location || ''}
                        onChange={(e) => handleConfigChange('location', e.target.value)}
                        placeholder="Barcelona, Spain"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Ciutat, província o regió
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Radi (km)
                      </label>
                      <input
                        type="number"
                        value={formData.config.radius || 5}
                        onChange={(e) => handleConfigChange('radius', parseInt(e.target.value))}
                        min="1"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Màxim de resultats
                      </label>
                      <input
                        type="number"
                        value={formData.config.maxResults || 50}
                        onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
                        min="1"
                        max="200"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </>
                )}

                {formData.type === 'WEB_SCRAPING' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL del website *
                      </label>
                      <input
                        type="url"
                        value={formData.config.url || ''}
                        onChange={(e) => handleConfigChange('url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selectors CSS *
                      </label>
                      <textarea
                        value={formData.config.selectors || ''}
                        onChange={(e) => handleConfigChange('selectors', e.target.value)}
                        placeholder={`{
  "container": ".empresa-card",
  "name": ".empresa-nom",
  "email": ".empresa-email",
  "phone": ".empresa-telefon",
  "address": ".empresa-adreça"
}`}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Selectors CSS per extreure dades (format JSON)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Màxim de resultats
                      </label>
                      <input
                        type="number"
                        value={formData.config.maxResults || 100}
                        onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
                        min="1"
                        max="500"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </>
                )}

                {formData.type === 'CUSTOM' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuració personalitzada
                    </label>
                    <textarea
                      value={JSON.stringify(formData.config, null, 2)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          setFormData(prev => ({ ...prev, config }));
                        } catch (error) {
                          // Invalid JSON, ignore
                        }
                      }}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <ScheduleConfig
                  frequency={formData.frequency}
                  onFrequencyChange={(freq) => handleInputChange('frequency', freq)}
                  time={formData.time}
                  onTimeChange={(time) => handleInputChange('time', time)}
                  dayOfWeek={formData.dayOfWeek}
                  onDayOfWeekChange={(day) => handleInputChange('dayOfWeek', day)}
                  dayOfMonth={formData.dayOfMonth}
                  onDayOfMonthChange={(day) => handleInputChange('dayOfMonth', day)}
                />
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Operacions d'IA a executar
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="analysis"
                        checked={formData.aiTasks.analysis}
                        onChange={(e) => handleTaskChange('analysis', e.target.checked)}
                        disabled
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="analysis" className="ml-2 block text-sm text-gray-700">
                        Anàlisi completa del lead
                        <span className="text-xs text-gray-500 ml-2">(sempre actiu)</span>
                      </label>
                    </div>

                    {Object.entries({
                      scoring: 'Scoring de qualitat',
                      pitch_generation: 'Generació de pitch personalitzat',
                      data_extraction: 'Extracció de dades addicionals',
                      classification: 'Classificació per categoria',
                      validation: 'Validació de dades',
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={key}
                          checked={formData.aiTasks[key as keyof typeof formData.aiTasks]}
                          onChange={(e) => handleTaskChange(key, e.target.checked)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor={key} className="ml-2 block text-sm text-gray-700">
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profunditat d'anàlisi
                  </label>
                  <select
                    value={formData.analysisDepth}
                    onChange={(e) => handleInputChange('analysisDepth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="basic">Anàlisi bàsica</option>
                    <option value="detailed">Anàlisi detallada</option>
                    <option value="comprehensive">Anàlisi exhaustiva</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel·lar
            </button>

            <button
              onClick={handleTestConfiguration}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <TestTube className="h-4 w-4" />
              Provar Configuració
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Desant...
                </>
              ) : (
                'Desar'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Test Dialog */}
      <SourceTestDialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        source={formData as any}
      />
    </>
  );
}