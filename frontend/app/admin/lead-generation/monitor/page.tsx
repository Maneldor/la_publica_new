'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, CheckCircle, XCircle, RefreshCw, Pause, Play, Database, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useJobs } from '@/hooks/useJobs';
import { ScrapingJob, JobStatus } from '@/lib/api/jobs';
import QueueStats from './components/QueueStats';
import ActiveJobsList from './components/ActiveJobsList';
import JobHistoryTable from './components/JobHistoryTable';
import JobDetailsDialog from './components/JobDetailsDialog';

// Helper components
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  className?: string;
}

function StatCard({ title, value, icon: Icon, className = '' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${className}`}>{value}</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
}

// Helper per format duration
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// Helper per accions disponibles
function getAvailableActions(status: JobStatus): string[] {
  switch (status) {
    case 'PENDING':
    case 'RUNNING':
      return ['cancel'];
    case 'FAILED':
    case 'CANCELLED':
      return ['retry', 'delete'];
    case 'COMPLETED':
      return ['delete'];
    default:
      return [];
  }
}

// Job Status Badge
function JobStatusBadge({ status }: { status: JobStatus }) {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    RUNNING: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}

// Priority Badge
function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    LOW: 'bg-gray-100 text-gray-700',
    NORMAL: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors] || colors.NORMAL}`}>
      {priority}
    </span>
  );
}

// Job Card Component
interface JobCardProps {
  job: ScrapingJob;
  onCancel?: () => void;
  onRetry?: () => void;
  onDelete?: () => void;
  showActions?: string[];
}

function JobCard({ job, onCancel, onRetry, onDelete, showActions = [] }: JobCardProps) {
  return (
    <div className="p-6 bg-white border rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <JobStatusBadge status={job.status} />
            <h3 className="font-semibold">{job.source.name}</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Job ID: {job.id}
          </p>
        </div>

        <div className="flex gap-2">
          {showActions.includes('cancel') && onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
            >
              Cancel
            </button>
          )}
          {showActions.includes('retry') && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
            >
              Retry
            </button>
          )}
          {showActions.includes('delete') && onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Progress bar per jobs actius */}
      {(job.status === 'RUNNING' || job.status === 'PENDING') && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Priority</p>
          <PriorityBadge priority={job.priority} />
        </div>
        <div>
          <p className="text-gray-500">Leads Generated</p>
          <p className="font-semibold">{job.leadsGenerated}</p>
        </div>
        <div>
          <p className="text-gray-500">Created</p>
          <p className="font-semibold">
            {new Date(job.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Duration</p>
          <p className="font-semibold">
            {job.startedAt && job.completedAt
              ? formatDuration(
                  new Date(job.completedAt).getTime() -
                  new Date(job.startedAt).getTime()
                )
              : '-'
            }
          </p>
        </div>
      </div>

      {/* Error message */}
      {job.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{job.error}</p>
        </div>
      )}
    </div>
  );
}

export default function MonitorPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'history'>('active');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyData, setHistoryData] = useState<any>(null);
  const { toast } = useToast();

  const {
    jobs,
    activeJobs,
    stats,
    loading,
    error,
    fetchJobs,
    fetchHistory,
    cancelJob,
    retryJob,
    deleteJob,
    cleanupOldJobs,
  } = useJobs();

  // Carregar historial quan canvia la pàgina
  useEffect(() => {
    if (selectedTab === 'history') {
      fetchHistory({
        page: historyPage,
        pageSize: 20,
        status: ['COMPLETED', 'FAILED', 'CANCELLED']
      }).then(setHistoryData).catch(() => {});
    }
  }, [selectedTab, historyPage, fetchHistory]);

  const handleRefresh = useCallback(async () => {
    try {
      await fetchJobs();
      toast({
        title: 'Actualitzat',
        description: 'Dades actualitzades correctament',
      });
    } catch (error) {
      // Error ja gestionat pel hook
    }
  }, [fetchJobs, toast]);

  const handleManualRefresh = () => {
    handleRefresh();
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast({
      title: autoRefresh ? 'Auto-refresh pausat' : 'Auto-refresh activat',
      description: autoRefresh ? 'Les dades no s\'actualitzaran automàticament' : 'Les dades s\'actualitzaran cada 5 segons',
    });
  };

  const handleCancelJob = async (jobId: string) => {
    const job = activeJobs.find(j => j.id === jobId);
    if (!job) return;

    const confirmed = confirm(`Estàs segur que vols cancel·lar el job "${job.source?.name}"?`);
    if (!confirmed) return;

    try {
      await cancelJob(jobId);
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleRetryJob = async (jobId: string) => {
    try {
      await retryJob(jobId);
    } catch (error) {
      // Error ja gestionat pel hook
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Estàs segur que vols eliminar aquest job?')) {
      try {
        await deleteJob(jobId);
      } catch (error) {
        // Error ja gestionat pel hook
      }
    }
  };

  const handleCleanup = async () => {
    if (confirm('Eliminar jobs de més de 30 dies?')) {
      try {
        const result = await cleanupOldJobs(30);
        alert(`Eliminats ${result.deletedCount} jobs antics`);
      } catch (error) {
        // Error ja gestionat pel hook
      }
    }
  };

  const handleViewJobDetails = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleCloseJobDetails = () => {
    setSelectedJobId(null);
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(handleRefresh, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, handleRefresh]);

  // Auto-pause when no active jobs
  useEffect(() => {
    if (activeJobs.length === 0 && autoRefresh) {
      // Could implement auto-pause after timeout
    }
  }, [activeJobs, autoRefresh]);

  const isSystemActive = activeJobs.length > 0;

  // Loading state
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 underline"
        >
          Recarregar pàgina
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Monitor de Jobs</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isSystemActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isSystemActive ? '🟢 Sistema Actiu' : '🔴 Sistema Pausat'}
          </div>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={handleToggleAutoRefresh}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              autoRefresh
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {autoRefresh ? (
              <>
                <Pause className="h-4 w-4" />
                Pausar Auto-refresh
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Activar Auto-refresh
              </>
            )}
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualitzar Ara
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <StatCard
            title="Total Jobs"
            value={stats.statusStats.reduce((sum, s) => sum + s.count, 0)}
            icon={Database}
          />
          <StatCard
            title="Active"
            value={activeJobs.length}
            icon={Activity}
            className="text-blue-600"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={CheckCircle}
            className="text-green-600"
          />
          <StatCard
            title="Leads Generated"
            value={stats.leadsGenerated.total}
            icon={Users}
          />
          <StatCard
            title="Avg Time"
            value={formatDuration(stats.averageExecutionTime)}
            icon={Clock}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setSelectedTab('active')}
          className={`pb-2 px-4 ${
            selectedTab === 'active'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          Active Jobs ({activeJobs.length})
        </button>
        <button
          onClick={() => setSelectedTab('all')}
          className={`pb-2 px-4 ${
            selectedTab === 'all'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          All Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={`pb-2 px-4 ${
            selectedTab === 'history'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500'
          }`}
        >
          History
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCleanup}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cleanup Old Jobs
          </button>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {selectedTab === 'active' && (
          <ActiveJobsList
            jobs={activeJobs.map(job => ({
              id: job.id,
              type: 'SCRAPING' as const,
              sourceName: job.source?.name,
              status: 'RUNNING' as const,
              startedAt: job.startedAt || job.createdAt,
              progress: job.progress,
              currentStep: `Processant ${job.source?.name || 'job'}`,
              estimatedTimeRemaining: 0
            }))}
            onCancel={handleCancelJob}
            onViewDetails={handleViewJobDetails}
          />
        )}

        {selectedTab === 'all' && (
          <div className="space-y-4">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onCancel={() => handleCancelJob(job.id)}
                onRetry={() => handleRetryJob(job.id)}
                onDelete={() => handleDeleteJob(job.id)}
                showActions={getAvailableActions(job.status)}
              />
            ))}
          </div>
        )}

        {selectedTab === 'history' && historyData && (
          <>
            <div className="space-y-4">
              {historyData.jobs.map((job: ScrapingJob) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onRetry={() => handleRetryJob(job.id)}
                  onDelete={() => handleDeleteJob(job.id)}
                  showActions={['retry', 'delete']}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {historyPage} of {historyData.pagination.totalPages}
              </span>
              <button
                onClick={() => setHistoryPage(p => p + 1)}
                disabled={historyPage >= historyData.pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Job Details Dialog */}
      <JobDetailsDialog
        open={!!selectedJobId}
        onClose={handleCloseJobDetails}
        jobId={selectedJobId || ''}
      />
    </div>
  );
}