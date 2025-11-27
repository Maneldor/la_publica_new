'use client';

import { useState } from 'react';
import {
  MapPin,
  Globe,
  Zap,
  Settings,
  Bot,
  Play,
  TestTube,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { LeadSource } from '@/lib/api/leadSources';

type LeadSourceType = LeadSource['type'];
type ScheduleFrequency = NonNullable<
  LeadSource['frequency'] | (LeadSource['schedule'] extends { frequency: infer F } ? F : never)
>;

interface SourceCardProps {
  source: LeadSource;
  onEdit: (source: LeadSource) => void;
  onToggleActive: (id: string, active: boolean) => Promise<void> | void;
  onDelete: (id: string) => void;
  onExecuteNow: (id: string) => void;
  onTest: (source: LeadSource) => void;
}

export default function SourceCard({
  source,
  onEdit,
  onToggleActive,
  onDelete,
  onExecuteNow,
  onTest,
}: SourceCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const { toast } = useToast();

  const frequencyValue = (source.frequency ||
    source.schedule?.frequency ||
    'MANUAL') as ScheduleFrequency;
  const lastRun = source.lastRun ?? source.lastRunAt ?? null;
  const nextRun = source.nextRun ?? source.nextRunAt ?? null;
  const leadsGenerated = source.leadsGenerated ?? source.totalLeads ?? 0;
  const leadsApproved = source.leadsApproved ?? source.successfulRuns ?? 0;
  const failedRuns = source.failedRuns ?? 0;
  const computedSuccessRate =
    source.successRate ??
    (leadsGenerated > 0
      ? (leadsApproved / leadsGenerated) * 100
      : (source.successfulRuns + failedRuns > 0
          ? (source.successfulRuns / (source.successfulRuns + failedRuns)) * 100
          : 0));

  // Get source type styling
  const getTypeConfig = (type: LeadSourceType) => {
    const configs = {
      'GOOGLE_MAPS': {
        icon: MapPin,
        color: 'text-blue-600 bg-blue-100',
        label: 'Google Maps',
      },
      'WEB_SCRAPING': {
        icon: Globe,
        color: 'text-purple-600 bg-purple-100',
        label: 'Web Scraping',
      },
      'API_INTEGRATION': {
        icon: Zap,
        color: 'text-green-600 bg-green-100',
        label: 'Integració API',
      },
      'LINKEDIN': {
        icon: Globe, // We'd use a LinkedIn icon if available
        color: 'text-blue-600 bg-blue-100',
        label: 'LinkedIn',
      },
      'CSV_IMPORT': {
        icon: Settings,
        color: 'text-orange-600 bg-orange-100',
        label: 'Importació CSV',
      },
      'CUSTOM': {
        icon: Settings,
        color: 'text-gray-600 bg-gray-100',
        label: 'Personalitzat',
      },
      'API': {
        icon: Zap,
        color: 'text-green-600 bg-green-100',
        label: 'API',
      },
      'MANUAL': {
        icon: Settings,
         color: 'text-gray-600 bg-gray-100',
         label: 'Manual',
      },
    };
    return configs[type] || configs.CUSTOM;
  };

  // Get frequency badge config
  const getFrequencyConfig = (frequency: ScheduleFrequency) => {
    const configs = {
      'MANUAL': { color: 'bg-gray-100 text-gray-700', label: 'Manual' },
      'HOURLY': { color: 'bg-blue-100 text-blue-700', label: 'Cada hora' },
      'DAILY': { color: 'bg-green-100 text-green-700', label: 'Diari' },
      'WEEKLY': { color: 'bg-purple-100 text-purple-700', label: 'Setmanal' },
      'MONTHLY': { color: 'bg-orange-100 text-orange-700', label: 'Mensual' },
    };
    return configs[frequency] || configs.MANUAL;
  };

  // Get success rate color
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return null;

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `fa ${diffMins}min`;
    if (diffHours < 24) return `fa ${diffHours}h`;
    if (diffDays < 30) return `fa ${diffDays} dies`;
    return date.toLocaleDateString();
  };

  // Format future time
  const formatFutureTime = (dateStr: string | null) => {
    if (!dateStr) return null;

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return 'Ara';
    if (diffMins < 60) return `en ${diffMins}min`;
    if (diffHours < 24) return `en ${diffHours}h`;
    if (diffDays < 30) return `en ${diffDays} dies`;
    return date.toLocaleDateString();
  };

  // Get config preview
  const getConfigPreview = () => {
    const config = source.config || {};
    switch (source.type) {
      case 'GOOGLE_MAPS':
        return [
          { key: 'Query', value: config.query || 'N/A' },
          { key: 'Ubicació', value: config.location || 'N/A' },
          { key: 'Radi', value: config.radius ? `${config.radius}km` : 'N/A' },
          { key: 'Max resultats', value: config.maxResults || 'N/A' },
        ];
      case 'WEB_SCRAPING':
        return [
          { key: 'URL', value: config.url || 'N/A' },
          { key: 'Container', value: config.selectors?.container || 'N/A' },
          { key: 'Max resultats', value: config.maxResults || 'N/A' },
        ];
      default:
        return [
          { key: 'Configuració', value: 'Personalitzada' },
        ];
    }
  };

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      await onToggleActive(source.id, !source.isActive);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = () => {
    onDelete(source.id);
  };

  const handleExecuteNow = () => {
    if (!source.isActive) {
      toast({
        title: "Font inactiva",
        description: "Activa la font abans d'executar-la",
        variant: "destructive",
      });
      return;
    }
    onExecuteNow(source.id);
  };

  const typeConfig = getTypeConfig(source.type);
  const TypeIcon = typeConfig.icon;
  const frequencyConfig = getFrequencyConfig(frequencyValue);
  const configPreview = getConfigPreview();

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${
      !source.isActive ? 'opacity-60' : ''
    }`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeConfig.color}`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{source.name}</h3>
              <p className="text-sm text-gray-500">🔄 {typeConfig.label}</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggleActive}
            disabled={isToggling}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              source.isActive ? 'bg-green-500' : 'bg-gray-300'
            } ${isToggling ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                source.isActive ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Description */}
        {source.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {source.description}
          </p>
        )}

        {/* Performance */}
        {leadsGenerated > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              📊 Rendiment
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Leads generats:</span>
                <span className="font-medium">{leadsGenerated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aprovats:</span>
                <span className={`font-medium ${getSuccessRateColor(computedSuccessRate)}`}>
                  {leadsApproved} ({computedSuccessRate.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {leadsGenerated === 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Encara no s'ha executat</span>
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            ⏰ Programació
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Freqüència:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${frequencyConfig.color}`}>
                {frequencyConfig.label}
              </span>
            </div>

            {lastRun && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Última execució:</span>
                <span className="font-medium">{formatRelativeTime(lastRun)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pròxima execució:</span>
              <span className="font-medium">
                {nextRun ? formatFutureTime(nextRun) : 'Manual'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Provider */}
        {source.aiProvider && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              🤖 IA
            </h4>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">{source.aiProvider.displayName}</span>
            </div>
          </div>
        )}

        {/* Config Preview */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            ⚙️ Config
          </h4>
          <div className="space-y-1 text-sm">
            {configPreview.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">• {item.key}:</span>
                <span className="font-medium font-mono text-xs truncate ml-2 max-w-32">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={handleExecuteNow}
            disabled={!source.isActive}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-3 w-3" />
            <span className="hidden md:inline">Executar</span>
          </button>

          <button
            onClick={() => onTest(source)}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
          >
            <TestTube className="h-3 w-3" />
            <span className="hidden md:inline">Test</span>
          </button>

          <button
            onClick={() => onEdit(source)}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Edit className="h-3 w-3" />
            <span className="hidden md:inline">Editar</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            <span className="sr-only md:not-sr-only">Eliminar</span>
          </button>
        </div>

        {/* Status Indicators */}
        {!source.isActive && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <XCircle className="h-4 w-4" />
              <span>Font desactivada</span>
            </div>
          </div>
        )}

        {source.isActive && computedSuccessRate > 0 && computedSuccessRate < 50 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <XCircle className="h-4 w-4" />
              <span>Taxa d'èxit baixa ({computedSuccessRate.toFixed(1)}%)</span>
            </div>
          </div>
        )}

        {source.isActive && computedSuccessRate >= 70 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Bon rendiment ({computedSuccessRate.toFixed(1)}% èxit)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}