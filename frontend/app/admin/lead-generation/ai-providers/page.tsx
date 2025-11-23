'use client';

import { useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAIProviders } from '@/hooks/useAIProviders';
import { AIProvider, CreateAIProviderData, UpdateAIProviderData } from '@/lib/api/aiProviders';
import ProviderCard from './components/ProviderCard';
import ProviderConfigModal from './components/ProviderConfigModal';
import TestConnectionDialog from './components/TestConnectionDialog';

export default function AIProvidersPage() {
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testProvider, setTestProvider] = useState<AIProvider | null>(null);

  const { toast } = useToast();

  const {
    providers,
    loading,
    error,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    testProvider: testProviderAPI,
    toggleProvider,
  } = useAIProviders();

  const handleRefresh = async () => {
    try {
      await fetchProviders();
      toast({
        title: "Actualitzat",
        description: "Els providers s'han actualitzat correctament",
      });
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleToggleActive = async (providerId: string, isActive: boolean) => {
    try {
      // Check if trying to deactivate the default provider
      const provider = providers.find(p => p.id === providerId);
      if (provider?.isDefault && !isActive) {
        toast({
          title: "Error",
          description: "No pots desactivar el provider per defecte. Primer assigna un altre provider com a defecte.",
          variant: "destructive",
        });
        return;
      }

      await toggleProvider(providerId);
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleSetDefault = async (providerId: string) => {
    try {
      const provider = providers.find(p => p.id === providerId);
      if (!provider?.isActive) {
        toast({
          title: "Error",
          description: "No pots fer un provider inactiu com a defecte",
          variant: "destructive",
        });
        return;
      }

      await updateProvider(providerId, { isDefault: true });
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleEdit = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setConfigModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedProvider(null);
    setConfigModalOpen(true);
  };

  const handleTestConnection = async (provider: AIProvider) => {
    try {
      await testProviderAPI(provider.id);
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleSaveProvider = async (data: CreateAIProviderData | UpdateAIProviderData) => {
    try {
      if (selectedProvider) {
        await updateProvider(selectedProvider.id, data as UpdateAIProviderData);
      } else {
        await createProvider(data as CreateAIProviderData);
      }
      setConfigModalOpen(false);
      setSelectedProvider(null);
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Providers
            </h1>
            <p className="text-gray-600">
              Configura els proveïdors d'intel·ligència artificial per a la generació de leads
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualitzar
            </button>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Afegir Provider
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Providers Actius
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {providers.filter(p => p.isActive).length} / {providers.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Requests Total
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {providers.reduce((sum, p) => sum + p.totalRequests, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Cost Total
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${providers.reduce((sum, p) => sum + p.totalCost, 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <RefreshCw className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-red-600 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Providers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              onSetDefault={handleSetDefault}
              onTestConnection={handleTestConnection}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ProviderConfigModal
        open={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onSave={handleSaveProvider}
      />

    </div>
  );
}