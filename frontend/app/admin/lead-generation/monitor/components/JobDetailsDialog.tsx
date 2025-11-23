'use client';

import { useState, useEffect } from 'react';
import { X, Info, FileText, Users, Settings, Download, Copy, Play, CheckCircle, XCircle, AlertTriangle, Bot, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface JobDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
}

interface JobDetails {
  id: string;
  type: 'SCRAPING' | 'AI_PROCESSING';
  sourceName?: string;
  leadName?: string;
  operation?: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  leadsFound?: number;
  leadsCreated?: number;
  leadsFailed?: number;
  aiCost?: number;
  errorMessage?: string;
  config: any;
  aiProvider?: {
    name: string;
    model: string;
    requests: number;
    avgLatency: number;
  };
  performance?: {
    speed: number;
    avgTimePerLead: number;
  };
  logs: LogEntry[];
  generatedLeads?: GeneratedLead[];
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'progress' | 'ai';
  message: string;
}

interface GeneratedLead {
  id: string;
  name: string;
  score: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function JobDetailsDialog({ open, onClose, jobId }: JobDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && jobId) {
      fetchJobDetails();
    }
  }, [open, jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data based on jobId
      const mockDetails: JobDetails = {
        id: jobId,
        type: jobId.includes('job-1') ? 'SCRAPING' : jobId.includes('job-2') ? 'AI_PROCESSING' : 'SCRAPING',
        sourceName: jobId.includes('job-1') ? 'Restaurants Barcelona' :
                   jobId.includes('job-101') ? 'Gimnasos Catalunya' :
                   jobId.includes('job-102') ? 'Comerços Girona' : 'Test Source',
        leadName: jobId.includes('job-2') ? 'Gimnàs Fitness Plus' :
                 jobId.includes('job-103') ? 'Restaurant El Català' : undefined,
        operation: jobId.includes('job-2') || jobId.includes('job-103') ? 'LEAD_ANALYSIS' : undefined,
        status: jobId.includes('job-1') || jobId.includes('job-2') ? 'RUNNING' :
               jobId.includes('job-102') || jobId.includes('job-105') ? 'FAILED' : 'COMPLETED',
        startedAt: jobId.includes('job-1') ? new Date(Date.now() - 120000).toISOString() :
                  jobId.includes('job-2') ? new Date(Date.now() - 45000).toISOString() :
                  '2024-11-22T08:00:00Z',
        completedAt: jobId.includes('job-1') || jobId.includes('job-2') ? undefined : '2024-11-22T08:03:45Z',
        duration: jobId.includes('job-1') || jobId.includes('job-2') ? undefined : 225,
        leadsFound: jobId.includes('SCRAPING') || jobId.includes('job-101') ? 15 : undefined,
        leadsCreated: jobId.includes('job-101') ? 15 : jobId.includes('job-104') ? 25 : undefined,
        leadsFailed: jobId.includes('job-102') ? 0 : jobId.includes('job-105') ? 5 : 0,
        aiCost: jobId.includes('job-101') ? 0.12 : jobId.includes('job-103') ? 0.02 : 0.18,
        errorMessage: jobId.includes('job-102') ? 'Rate limit exceeded on Google Maps API' : undefined,
        config: {
          source: {
            name: jobId.includes('job-101') ? 'Gimnasos Catalunya' : 'Test Source',
            type: 'GOOGLE_MAPS',
            query: 'restaurant',
            location: 'Barcelona, Spain',
            radius: 5,
            maxResults: 50
          },
          aiProvider: {
            name: 'Claude (Anthropic)',
            model: 'claude-sonnet-4-20250514',
            temperature: 0.3
          },
          aiTasks: {
            analysis: true,
            scoring: true,
            pitchGeneration: true
          }
        },
        aiProvider: {
          name: 'Claude (Anthropic)',
          model: 'claude-sonnet-4-20250514',
          requests: 15,
          avgLatency: 1.8,
        },
        performance: {
          speed: 4,
          avgTimePerLead: 15,
        },
        logs: [
          {
            timestamp: '2024-11-22T08:00:00Z',
            level: 'info',
            message: 'Job iniciat'
          },
          {
            timestamp: '2024-11-22T08:00:02Z',
            level: 'success',
            message: 'Configuració validada'
          },
          {
            timestamp: '2024-11-22T08:00:05Z',
            level: 'progress',
            message: 'Executant scraper...'
          },
          {
            timestamp: '2024-11-22T08:00:30Z',
            level: 'success',
            message: 'Scraping completat: 15 empreses trobades'
          },
          {
            timestamp: '2024-11-22T08:00:32Z',
            level: 'ai',
            message: 'Processant amb Claude...'
          },
          {
            timestamp: '2024-11-22T08:00:35Z',
            level: 'success',
            message: 'Lead 1/15 processat (score: 85)'
          },
          {
            timestamp: '2024-11-22T08:00:48Z',
            level: 'success',
            message: 'Lead 2/15 processat (score: 72)'
          },
          {
            timestamp: '2024-11-22T08:01:02Z',
            level: 'success',
            message: 'Lead 3/15 processat (score: 68)'
          },
          {
            timestamp: '2024-11-22T08:03:40Z',
            level: 'success',
            message: 'Tots els leads processats'
          },
          {
            timestamp: '2024-11-22T08:03:45Z',
            level: 'success',
            message: 'Job completat exitosament'
          },
        ],
        generatedLeads: jobId.includes('SCRAPING') ? [
          {
            id: 'lead-1',
            name: 'Restaurant El Català',
            score: 85,
            status: 'approved'
          },
          {
            id: 'lead-2',
            name: 'Pizzeria Roma',
            score: 72,
            status: 'pending'
          },
          {
            id: 'lead-3',
            name: 'Café Central',
            score: 68,
            status: 'pending'
          }
        ] : undefined
      };

      setJobDetails(mockDetails);
    } catch (error) {
      toast({
        title: 'Error carregant detalls',
        description: 'No s\'han pogut carregar els detalls del job',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'progress':
        return <Clock className="h-4 w-4 text-purple-500" />;
      case 'ai':
        return <Bot className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogPrefix = (level: string) => {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'progress': return '🔄';
      case 'ai': return '🤖';
      default: return 'ℹ️';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ca-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const handleExportLogs = () => {
    if (!jobDetails) return;

    const logsText = jobDetails.logs
      .map(log => `[${formatTimestamp(log.timestamp)}] ${getLogPrefix(log.level)} ${log.message}`)
      .join('\n');

    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-${jobDetails.id}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Logs exportats',
      description: 'Els logs s\'han descarregat correctament',
    });
  };

  const handleCopyConfig = () => {
    if (!jobDetails) return;

    navigator.clipboard.writeText(JSON.stringify(jobDetails.config, null, 2));
    toast({
      title: 'Configuració copiada',
      description: 'La configuració s\'ha copiat al portapapers',
    });
  };

  const handleRunWithSameConfig = () => {
    toast({
      title: 'Executant job...',
      description: 'S\'ha creat un nou job amb la mateixa configuració',
    });
    onClose();
  };

  const handleViewInReviewQueue = () => {
    toast({
      title: 'Redirigint...',
      description: 'Obrint la cua de revisió d\'IA',
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalls del Job - {jobDetails?.sourceName || jobDetails?.leadName || jobId}
            </h2>
            {jobDetails && (
              <p className="text-sm text-gray-600 mt-1">
                {jobDetails.type === 'SCRAPING' ? '🔄 Scraping' : '🤖 Processament IA'} •
                ID: {jobDetails.id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregant detalls del job...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'general', label: 'Informació General', icon: Info },
                  { id: 'logs', label: 'Logs', icon: FileText },
                  ...(jobDetails?.type === 'SCRAPING' ? [{ id: 'leads', label: 'Leads Generats', icon: Users }] : []),
                  { id: 'config', label: 'Configuració', icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'general' && jobDetails && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-4 flex items-center gap-2">
                      📋 Detalls del Job
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="space-y-2">
                          <div><span className="text-blue-700 font-medium">Tipus:</span> {jobDetails.type === 'SCRAPING' ? '🔄 Scraping' : '🤖 Processament IA'}</div>
                          <div><span className="text-blue-700 font-medium">Font:</span> {jobDetails.sourceName || jobDetails.leadName}</div>
                          <div><span className="text-blue-700 font-medium">Estat:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              jobDetails.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              jobDetails.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                              jobDetails.status === 'RUNNING' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {jobDetails.status === 'COMPLETED' ? '✅ Completat' :
                               jobDetails.status === 'FAILED' ? '❌ Error' :
                               jobDetails.status === 'RUNNING' ? '🔄 Executant' :
                               '🚫 Cancel·lat'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2">
                          <div><span className="text-blue-700 font-medium">Iniciat:</span> {new Date(jobDetails.startedAt).toLocaleString('ca-ES')}</div>
                          {jobDetails.completedAt && (
                            <div><span className="text-blue-700 font-medium">Finalitzat:</span> {new Date(jobDetails.completedAt).toLocaleString('ca-ES')}</div>
                          )}
                          {jobDetails.duration && (
                            <div><span className="text-blue-700 font-medium">Durada:</span> {formatDuration(jobDetails.duration)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {jobDetails.type === 'SCRAPING' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-medium text-green-800 mb-4 flex items-center gap-2">
                        📊 Resultats
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div><span className="text-green-700 font-medium">Leads trobats:</span> {jobDetails.leadsFound || 0}</div>
                          <div><span className="text-green-700 font-medium">Leads creats:</span> {jobDetails.leadsCreated || 0}</div>
                          <div><span className="text-green-700 font-medium">Errors:</span> {jobDetails.leadsFailed || 0}</div>
                          <div><span className="text-green-700 font-medium">Taxa d'èxit:</span> {jobDetails.leadsFound ? Math.round((jobDetails.leadsCreated || 0) / jobDetails.leadsFound * 100) : 0}%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {jobDetails.aiProvider && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="font-medium text-purple-800 mb-4 flex items-center gap-2">
                        🤖 Processament IA
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div><span className="text-purple-700 font-medium">Provider:</span> {jobDetails.aiProvider.name}</div>
                          <div><span className="text-purple-700 font-medium">Model:</span> <code className="bg-purple-100 px-1 rounded text-xs">{jobDetails.aiProvider.model}</code></div>
                          <div><span className="text-purple-700 font-medium">Requests:</span> {jobDetails.aiProvider.requests}</div>
                          <div><span className="text-purple-700 font-medium">Latència mitjana:</span> {jobDetails.aiProvider.avgLatency}s</div>
                        </div>
                        <div className="space-y-2">
                          <div><span className="text-purple-700 font-medium">Cost total:</span> <span className="font-mono">${jobDetails.aiCost?.toFixed(2)}</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {jobDetails.performance && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-medium text-yellow-800 mb-4 flex items-center gap-2">
                        📈 Rendiment
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div><span className="text-yellow-700 font-medium">Velocitat:</span> {jobDetails.performance.speed} leads/min</div>
                          <div><span className="text-yellow-700 font-medium">Temps per lead:</span> {jobDetails.performance.avgTimePerLead}s (promig)</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {jobDetails.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                        ❌ Error
                      </h3>
                      <p className="text-sm text-red-700 bg-red-100 p-3 rounded border">
                        {jobDetails.errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'logs' && jobDetails && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Timeline de logs</h3>
                    <button
                      onClick={handleExportLogs}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" />
                      Exportar Logs
                    </button>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
                    {jobDetails.logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-3 mb-2">
                        <span className="text-gray-400 text-xs mt-1 min-w-16">
                          [{formatTimestamp(log.timestamp)}]
                        </span>
                        <div className="flex items-center gap-2 flex-1">
                          <span>{getLogPrefix(log.level)}</span>
                          <span className={`${
                            log.level === 'error' ? 'text-red-400' :
                            log.level === 'warning' ? 'text-yellow-400' :
                            log.level === 'success' ? 'text-green-400' :
                            log.level === 'ai' ? 'text-purple-400' :
                            'text-gray-300'
                          }`}>
                            {log.message}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'leads' && jobDetails?.generatedLeads && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      Leads generats ({jobDetails.generatedLeads.length})
                    </h3>
                    <button
                      onClick={handleViewInReviewQueue}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Users className="h-4 w-4" />
                      Veure al Review Queue
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estat</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acció</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {jobDetails.generatedLeads.map((lead) => (
                          <tr key={lead.id}>
                            <td className="px-4 py-4">
                              <div className="font-medium text-gray-900">{lead.name}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`font-medium ${
                                lead.score >= 80 ? 'text-green-600' :
                                lead.score >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {lead.score}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lead.status === 'approved' ? 'bg-green-100 text-green-700' :
                                lead.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {lead.status === 'approved' ? '✅ Aprovat' :
                                 lead.status === 'rejected' ? '❌ Rebutjat' :
                                 '⏳ Pendent'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <button className="text-sm text-blue-600 hover:text-blue-700">
                                Veure
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'config' && jobDetails && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Configuració utilitzada</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyConfig}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4" />
                        Copiar JSON
                      </button>
                      <button
                        onClick={handleRunWithSameConfig}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4" />
                        Executar amb aquesta Config
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300">
                      {JSON.stringify(jobDetails.config, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-6">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Tancar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}