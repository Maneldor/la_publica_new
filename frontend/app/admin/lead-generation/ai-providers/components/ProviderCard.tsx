'use client';

import { useState } from 'react';
import {
  Bot,
  Star,
  Settings,
  TestTube,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AIProvider } from '@/lib/api/aiProviders';

interface ProviderCardProps {
  provider: AIProvider;
  onEdit: (provider: AIProvider) => void;
  onToggleActive: (id: string, active: boolean) => Promise<void> | void;
  onSetDefault: (id: string) => void;
  onTestConnection: (provider: AIProvider) => void;
}

export default function ProviderCard({
  provider,
  onEdit,
  onToggleActive,
  onSetDefault,
  onTestConnection,
}: ProviderCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const { toast } = useToast();

  // Get provider-specific styling
  const getProviderColor = (type: string) => {
    const colors = {
      'CLAUDE': 'text-purple-600 bg-purple-100',
      'OPENAI': 'text-green-600 bg-green-100',
      'GEMINI': 'text-blue-600 bg-blue-100',
      'AZURE_OPENAI': 'text-cyan-600 bg-cyan-100',
      'COHERE': 'text-orange-600 bg-orange-100',
      'CUSTOM': 'text-gray-600 bg-gray-100',
    };
    return colors[type as keyof typeof colors] || colors.CUSTOM;
  };

  // Calculate success rate
  const successRate = provider.totalRequests > 0
    ? (provider.successfulRequests / provider.totalRequests) * 100
    : 0;

  // Get success rate color
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleToggleActive = async () => {
    if (provider.isDefault && provider.isActive) {
      toast({
        title: "No es pot desactivar",
        description: "No pots desactivar el provider per defecte. Primer assigna un altre provider com a defecte.",
        variant: "destructive",
      });
      return;
    }

    setIsToggling(true);
    try {
      await onToggleActive(provider.id, !provider.isActive);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSetDefault = () => {
    if (!provider.isActive) {
      toast({
        title: "Provider inactiu",
        description: "Primer activa el provider abans de fer-lo per defecte",
        variant: "destructive",
      });
      return;
    }
    onSetDefault(provider.id);
  };

  const maskApiKey = (key?: string) => {
    if (!key) return '***';
    if (key.length <= 8) return '***';
    return key.substring(0, 8) + '***';
  };

  const formatCapabilityLabel = (capability: string) =>
    capability.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${
      provider.isDefault ? 'ring-2 ring-purple-200 bg-purple-50/30' : ''
    }`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getProviderColor(provider.type)}`}>
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{provider.displayName}</h3>
              <p className="text-sm text-gray-500">{provider.type}</p>
            </div>
          </div>

          {provider.isDefault && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              <Star className="h-3 w-3 fill-current" />
              Per defecte
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              provider.isActive ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className={`text-sm font-medium ${
              provider.isActive ? 'text-green-700' : 'text-red-700'
            }`}>
              {provider.isActive ? 'Actiu' : 'Inactiu'}
            </span>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggleActive}
            disabled={isToggling}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              provider.isActive ? 'bg-green-500' : 'bg-gray-300'
            } ${isToggling ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                provider.isActive ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Statistics */}
        {provider.totalRequests > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              📊 Estadístiques
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total requests:</span>
                <span className="font-medium">{provider.totalRequests.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success rate:</span>
                <span className={`font-medium ${getSuccessRateColor(successRate)}`}>
                  {successRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg latency:</span>
                <span className="font-medium">
                  {provider.averageLatency ? `${provider.averageLatency}ms` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total cost:</span>
                <span className="font-medium">${provider.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {provider.totalRequests === 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Sense dades d'ús encara</span>
            </div>
          </div>
        )}

        {/* Configuration */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            ⚙️ Configuració
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium font-mono text-xs">
                {provider.config.model || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Temperature:</span>
              <span className="font-medium">
                {provider.config.temperature ?? 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">API Key:</span>
              <span className="font-medium font-mono text-xs">
                {maskApiKey(provider.config.apiKey)}
              </span>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Capacitats
          </h4>
          <div className="flex flex-wrap gap-1">
            {Object.entries(provider.capabilities || {}).map(([key, enabled]) => (
              <span
                key={key}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  enabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {formatCapabilityLabel(key)}
              </span>
            ))}
            {!provider.capabilities && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                Sense dades
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onTestConnection(provider)}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
          >
            <TestTube className="h-3 w-3" />
            Test
          </button>

          <button
            onClick={() => onEdit(provider)}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-3 w-3" />
            Editar
          </button>

          {!provider.isDefault && provider.isActive && (
            <button
              onClick={handleSetDefault}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-purple-300 text-purple-700 rounded-md hover:bg-purple-50 transition-colors"
            >
              <Star className="h-3 w-3" />
              Defecte
            </button>
          )}
        </div>

        {/* Error States */}
        {provider.isActive && provider.totalRequests > 0 && successRate < 80 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Taxa d'èxit baixa ({successRate.toFixed(1)}%)</span>
            </div>
          </div>
        )}

        {!provider.isActive && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <XCircle className="h-4 w-4" />
              <span>Provider desactivat</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}