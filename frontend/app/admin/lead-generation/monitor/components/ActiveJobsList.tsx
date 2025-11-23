'use client';

import { useState } from 'react';
import { Play, Bot, Eye, X, Activity, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ActiveJob {
  id: string;
  type: 'SCRAPING' | 'AI_PROCESSING';
  sourceName?: string;
  leadName?: string;
  operation?: string;
  status: 'RUNNING';
  startedAt: string;
  progress: number;
  currentStep: string;
  estimatedTimeRemaining: number;
}

interface ActiveJobsListProps {
  jobs: ActiveJob[];
  onCancel: (jobId: string) => void;
  onViewDetails: (jobId: string) => void;
}

export default function ActiveJobsList({
  jobs,
  onCancel,
  onViewDetails,
}: ActiveJobsListProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();

  const getRelativeTime = (startedAt: string): string => {
    const diff = Date.now() - new Date(startedAt).getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `fa ${seconds}s`;
    if (seconds < 3600) return `fa ${Math.floor(seconds / 60)}m`;
    return `fa ${Math.floor(seconds / 3600)}h`;
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Finalitzant...';
    if (seconds < 60) return `~${seconds}s`;
    if (seconds < 3600) return `~${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `~${Math.floor(seconds / 3600)}h`;
  };

  const getProgressColor = (progress: number): string => {
    if (progress <= 30) return 'from-blue-500 to-blue-600';
    if (progress <= 70) return 'from-purple-500 to-purple-600';
    return 'from-green-500 to-green-600';
  };

  const getJobIcon = (type: string) => {
    switch (type) {
      case 'SCRAPING':
        return <Play className="h-4 w-4" />;
      case 'AI_PROCESSING':
        return <Bot className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getJobLabel = (job: ActiveJob): string => {
    if (job.type === 'SCRAPING') return 'Scraping';
    if (job.type === 'AI_PROCESSING') return 'Anàlisi IA';
    return 'Processant';
  };

  const handleCancel = async (jobId: string) => {
    setCancellingId(jobId);
    try {
      await onCancel(jobId);
    } finally {
      setCancellingId(null);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Jobs Actius</h2>
          <span className="text-sm text-gray-500">(0)</span>
        </div>

        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hi ha jobs actius
          </h3>
          <p className="text-gray-600 mb-4">
            Els jobs es mostraran aquí quan s'executin
          </p>
          <div className="text-sm text-gray-500">
            💡 Els jobs s'executen automàticament segons la programació configurada
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Jobs Actius</h2>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          {jobs.length}
        </span>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getJobIcon(job.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {job.sourceName || job.leadName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{getJobLabel(job)}</span>
                    <span>•</span>
                    <span>Iniciat {getRelativeTime(job.startedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewDetails(job.id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-white transition-colors"
                  title="Veure detalls"
                >
                  <Eye className="h-3 w-3" />
                  <span className="hidden sm:inline">Detalls</span>
                </button>

                <button
                  onClick={() => handleCancel(job.id)}
                  disabled={cancellingId === job.id}
                  className="flex items-center gap-1 px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Cancel·lar job"
                >
                  <X className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {cancellingId === job.id ? 'Cancel·lant...' : 'Cancel·lar'}
                  </span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(job.progress)}%
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeRemaining(job.estimatedTimeRemaining)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <div
                  className={`bg-gradient-to-r ${getProgressColor(job.progress)} h-full rounded-full transition-all duration-700 relative`}
                  style={{ width: `${Math.min(100, Math.max(2, job.progress))}%` }}
                >
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />

                  {/* Progress bar animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
                       style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>

            {/* Current Step */}
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium">
                  {job.currentStep}
                </p>
                {job.operation && (
                  <p className="text-xs text-gray-500 mt-1">
                    Operació: {job.operation.replace('_', ' ').toLowerCase()}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Info for Long Running Jobs */}
            {Date.now() - new Date(job.startedAt).getTime() > 300000 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <span>⏰</span>
                  <span>Aquest job porta més de 5 minuts executant-se</span>
                </div>
              </div>
            )}

            {/* Warning for Stuck Progress */}
            {job.progress === 0 && Date.now() - new Date(job.startedAt).getTime() > 60000 && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <span>⚠️</span>
                  <span>El job sembla estar bloquejat (0% de progrés)</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Actualització automàtica cada 5 segons</span>
          </div>
          <div>
            💡 Pots cancel·lar jobs que no responguin
          </div>
        </div>
      </div>
    </div>
  );
}