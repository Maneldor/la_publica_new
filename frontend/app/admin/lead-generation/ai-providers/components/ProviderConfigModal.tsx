 'use client';
 
import { useState, useEffect } from 'react';
 import { X, Eye, EyeOff, TestTube } from 'lucide-react';
 import { useToast } from '@/components/ui/use-toast';
 import {
   AIProvider,
   CreateAIProviderData,
   UpdateAIProviderData,
 } from '@/lib/api/aiProviders';
 
 type CapabilityKey = keyof NonNullable<AIProvider['capabilities']>;

const DEFAULT_CAPABILITIES: Record<CapabilityKey, boolean> = {
  leadAnalysis: true,
  scoring: true,
  pitchGeneration: true,
  dataEnrichment: true,
  classification: true,
  validation: true,
};

const createCapabilityState = (): Record<CapabilityKey, boolean> => ({ ...DEFAULT_CAPABILITIES });
 
 interface ProviderConfigModalProps {
   open: boolean;
   onClose: () => void;
   provider: AIProvider | null; // null = create new
   onSave: (data: CreateAIProviderData | UpdateAIProviderData) => Promise<void> | void;
 }

interface FormData {
  type: AIProvider['type'];
  name: string;
  displayName: string;
  apiKey: string;
  model: string;
  isActive: boolean;
  isDefault: boolean;
  temperature: number;
  maxTokens: number;
  timeout: number;
  baseURL: string;
  capabilities: Record<CapabilityKey, boolean>;
}

export default function ProviderConfigModal({
  open,
  onClose,
  provider,
  onSave,
}: ProviderConfigModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    type: 'CLAUDE',
    name: '',
    displayName: '',
    apiKey: '',
    model: '',
    isActive: true,
    isDefault: false,
    temperature: 0.3,
    maxTokens: 2048,
    timeout: 60000,
    baseURL: '',
    capabilities: createCapabilityState(),
  });

  // Provider type options
  const providerTypes = [
    { value: 'CLAUDE', label: 'Claude (Anthropic)' },
    { value: 'OPENAI', label: 'GPT (OpenAI)' },
    { value: 'GEMINI', label: 'Gemini (Google)' },
    { value: 'AZURE_OPENAI', label: 'Azure OpenAI' },
    { value: 'COHERE', label: 'Cohere' },
    { value: 'CUSTOM', label: 'Custom Provider' },
  ];

  // Model options based on provider type
  const getModelOptions = (type: AIProvider['type']): string[] => {
    const options = {
      'CLAUDE': [
        'claude-sonnet-4-20250514',
        'claude-haiku-4-20250514',
        'claude-3-5-sonnet-20241022',
      ],
      'OPENAI': [
        'gpt-4-turbo-preview',
        'gpt-4',
        'gpt-3.5-turbo',
      ],
      'GEMINI': [
        'gemini-pro',
        'gemini-pro-vision',
      ],
      'AZURE_OPENAI': [
        'gpt-4',
        'gpt-35-turbo',
      ],
      'COHERE': [
        'command',
        'command-light',
      ],
      'CUSTOM': [],
    };
    return options[type as keyof typeof options] || [];
  };

  // Initialize form data when provider changes
  useEffect(() => {
    if (provider) {
      setFormData({
        type: provider.type,
        name: provider.name,
        displayName: provider.displayName,
        apiKey: provider.config.apiKey || '',
        model: provider.config.model || '',
        isActive: provider.isActive,
        isDefault: provider.isDefault,
        temperature: provider.config.temperature ?? 0.3,
        maxTokens: provider.config.maxTokens ?? 2048,
        timeout: provider.config.timeout ?? 60000,
        baseURL: provider.config.baseURL || provider.config.endpoint || '',
        capabilities: {
          ...createCapabilityState(),
          ...provider.capabilities,
        } as Record<CapabilityKey, boolean>,
      });
    } else {
      // Reset form for new provider
      setFormData({
        type: 'CLAUDE',
        name: '',
        displayName: '',
        apiKey: '',
        model: '',
        isActive: true,
        isDefault: false,
        temperature: 0.3,
        maxTokens: 2048,
        timeout: 60000,
        baseURL: '',
        capabilities: createCapabilityState(),
      });
    }
  }, [provider]);

  // Update model when type changes
  useEffect(() => {
    const modelOptions = getModelOptions(formData.type);
    if (modelOptions.length > 0 && !modelOptions.includes(formData.model)) {
      setFormData(prev => ({ ...prev, model: modelOptions[0] }));
    }
  }, [formData.type]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCapabilityChange = (capability: CapabilityKey, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: enabled,
      },
    }));
  };

  const formatCapabilityLabel = (capability: string) =>
    capability.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.name.trim()) errors.push('El nom identificador és obligatori');
    if (!formData.displayName.trim()) errors.push('El nom per mostrar és obligatori');
    if (!formData.apiKey.trim()) errors.push('L\'API key és obligatòria');
    if (!formData.model.trim()) errors.push('El model és obligatori');
    if (formData.temperature < 0 || formData.temperature > 1) {
      errors.push('La temperature ha d\'estar entre 0 i 1');
    }
    if (formData.maxTokens <= 0) errors.push('Els max tokens han de ser positius');
    if (formData.timeout <= 0) errors.push('El timeout ha de ser positiu');

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

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    setIsTestingConnection(true);
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock random success/failure
      const success = Math.random() > 0.3;

      if (success) {
        toast({
          title: 'Connexió exitosa!',
          description: 'El provider respon correctament',
        });
      } else {
        toast({
          title: 'Error de connexió',
          description: 'No s\'ha pogut connectar amb el provider',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error durant el test de connexió',
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const buildCapabilities = () => ({
    leadAnalysis: formData.capabilities.leadAnalysis ?? false,
    scoring: formData.capabilities.scoring ?? false,
    pitchGeneration: formData.capabilities.pitchGeneration ?? false,
    dataEnrichment: formData.capabilities.dataEnrichment ?? false,
    classification: formData.capabilities.classification ?? false,
    validation: formData.capabilities.validation ?? false,
  });

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (provider) {
        const payload: UpdateAIProviderData = {
          displayName: formData.displayName,
          config: {
            apiKey: formData.apiKey || undefined,
            model: formData.model || undefined,
            temperature: formData.temperature,
            maxTokens: formData.maxTokens,
            endpoint: formData.baseURL || undefined,
            timeout: formData.timeout,
          },
          capabilities: buildCapabilities(),
          isActive: formData.isActive,
          isDefault: formData.isDefault,
        };
        await onSave(payload);
      } else {
        const payload: CreateAIProviderData = {
          name: formData.name.trim(),
          displayName: formData.displayName.trim(),
          type: formData.type,
          config: {
            apiKey: formData.apiKey,
            model: formData.model,
            temperature: formData.temperature,
            maxTokens: formData.maxTokens,
            endpoint: formData.baseURL || undefined,
            timeout: formData.timeout,
          },
          capabilities: buildCapabilities(),
          isActive: formData.isActive,
          isDefault: formData.isDefault,
        };
        await onSave(payload);
      }

      toast({
        title: provider ? 'Provider actualitzat' : 'Provider creat',
        description: `${formData.displayName} s'ha ${provider ? 'actualitzat' : 'creat'} correctament`,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: `No s'ha pogut ${provider ? 'actualitzar' : 'crear'} el provider`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {provider ? `Editar ${provider.displayName}` : 'Afegir Nou Provider'}
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
              { id: 'basic', label: 'Configuració Bàsica' },
              { id: 'advanced', label: 'Paràmetres Avançats' },
              { id: 'capabilities', label: 'Capacitats' },
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
              {/* Provider Type */}
              {!provider && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipus de Provider
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as AIProvider['type'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {providerTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom identificador
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="claude-production"
                  readOnly={!!provider}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom per mostrar
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Claude Sonnet 4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    placeholder={formData.type === 'CLAUDE' ? 'sk-ant-...' : 'sk-...'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                {getModelOptions(formData.type).length > 0 ? (
                  <select
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {getModelOptions(formData.type).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="model-name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                )}
              </div>

              {/* Status */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Provider actiu
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                    Fer provider per defecte
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {formData.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservador (0.0)</span>
                  <span>Creatiu (1.0)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={formData.maxTokens}
                  onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                  min="1"
                  max="8192"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout (milliseconds)
                </label>
                <input
                  type="number"
                  value={formData.timeout}
                  onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                  min="5000"
                  max="300000"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Base URL (for custom providers) */}
              {formData.type === 'CUSTOM' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={formData.baseURL}
                    onChange={(e) => handleInputChange('baseURL', e.target.value)}
                    placeholder="https://api.custom-ai.com/v1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'capabilities' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Selecciona les capacitats que aquest provider ofereix:
              </p>

              {Object.entries(formData.capabilities).map(([capability, enabled]) => (
                <div key={capability} className="flex items-center">
                  <input
                    type="checkbox"
                    id={capability}
                    checked={Boolean(enabled)}
                    onChange={(e) => handleCapabilityChange(capability as CapabilityKey, e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor={capability} className="ml-2 block text-sm text-gray-700 capitalize">
                    {formatCapabilityLabel(capability)}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSaving || isTestingConnection}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel·lar
          </button>

          <button
            onClick={handleTestConnection}
            disabled={isSaving || isTestingConnection}
            className="flex items-center gap-2 px-4 py-2 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {isTestingConnection ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Provant...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4" />
                Provar Connexió
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving || isTestingConnection}
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
  );
}