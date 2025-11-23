'use client';

import { useState, useMemo } from 'react';
import { History, Eye, Search, Filter, ChevronLeft, ChevronRight, Play, Bot, CheckCircle, XCircle, Ban } from 'lucide-react';

interface JobHistoryItem {
  id: string;
  type: 'SCRAPING' | 'AI_PROCESSING';
  sourceName?: string;
  leadName?: string;
  operation?: string;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt: string;
  duration: number;
  leadsFound?: number;
  leadsCreated?: number;
  leadsFailed?: number;
  aiCost?: number;
  errorMessage?: string;
}

interface JobHistoryTableProps {
  jobs: JobHistoryItem[];
  loading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onViewDetails: (jobId: string) => void;
}

type StatusFilter = 'all' | 'completed' | 'failed' | 'cancelled';
type TypeFilter = 'all' | 'scraping' | 'ai';
type DateFilter = 'today' | 'week' | 'month' | 'all';

export default function JobHistoryTable({
  jobs,
  loading,
  pagination,
  onPageChange,
  onViewDetails,
}: JobHistoryTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ca-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getDurationColor = (duration: number): string => {
    if (duration < 60) return 'text-green-600';
    if (duration < 300) return 'text-blue-600';
    return 'text-orange-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="h-3 w-3" />
            Completat
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <XCircle className="h-3 w-3" />
            Error
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <Ban className="h-3 w-3" />
            Cancel·lat
          </span>
        );
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SCRAPING':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'AI_PROCESSING':
        return <Bot className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Status filter
      if (statusFilter !== 'all') {
        const statusMap: { [key in StatusFilter]: string[] } = {
          all: [],
          completed: ['COMPLETED'],
          failed: ['FAILED'],
          cancelled: ['CANCELLED'],
        };
        if (!statusMap[statusFilter].includes(job.status)) return false;
      }

      // Type filter
      if (typeFilter !== 'all') {
        const typeMap: { [key in TypeFilter]: string[] } = {
          all: [],
          scraping: ['SCRAPING'],
          ai: ['AI_PROCESSING'],
        };
        if (!typeMap[typeFilter].includes(job.type)) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        const jobDate = new Date(job.startedAt);

        switch (dateFilter) {
          case 'today':
            if (jobDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (jobDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (jobDate < monthAgo) return false;
            break;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchText = `${job.sourceName || ''} ${job.leadName || ''} ${job.operation || ''}`.toLowerCase();
        if (!searchText.includes(query)) return false;
      }

      return true;
    });
  }, [jobs, statusFilter, typeFilter, dateFilter, searchQuery]);

  const hasActiveFilters = statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'today' || searchQuery.trim();

  if (jobs.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Històric de Jobs</h2>
        </div>

        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <History className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hi ha jobs en l'històric
          </h3>
          <p className="text-gray-600">
            Els jobs executats apareixeran aquí quan es completin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Històric de Jobs</h2>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
          {filteredJobs.length}
        </span>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tots els estats</option>
            <option value="completed">Completats</option>
            <option value="failed">Errors</option>
            <option value="cancelled">Cancel·lats</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tots els tipus</option>
            <option value="scraping">Scraping</option>
            <option value="ai">IA</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Avui</option>
            <option value="week">Última setmana</option>
            <option value="month">Últim mes</option>
            <option value="all">Tots</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar per font o lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Filtres actius - {filteredJobs.length} de {jobs.length} jobs
            </span>
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setDateFilter('today');
                setSearchQuery('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Netejar filtres
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4 p-4 border-b">
                <div className="rounded-full bg-gray-200 h-8 w-8"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No s'han trobat jobs
            </h3>
            <p className="text-gray-600 mb-4">
              Prova canviar els filtres o el rang de dates
            </p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipus
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Font/Lead
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inici
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durada
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost IA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(job.type)}
                      <span className="text-sm font-medium">
                        {job.type === 'SCRAPING' ? '🔄' : '🤖'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {job.sourceName || job.leadName}
                    </div>
                    {job.operation && (
                      <div className="text-xs text-gray-500">
                        {job.operation.replace('_', ' ').toLowerCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(job.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(job.startedAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getDurationColor(job.duration)}`}>
                      {formatDuration(job.duration)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {job.type === 'SCRAPING' && (
                      <div>
                        <span className={`font-medium ${
                          (job.leadsFailed || 0) > 0 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {job.leadsCreated || 0}/{job.leadsFound || 0}
                        </span>
                        {(job.leadsFailed || 0) > 0 && (
                          <div className="text-xs text-red-600">
                            {job.leadsFailed} errors
                          </div>
                        )}
                      </div>
                    )}
                    {job.type === 'AI_PROCESSING' && (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.aiCost ? (
                      <span className="font-medium">${job.aiCost.toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewDetails(job.id)}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      <span className="hidden sm:inline">Veure</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredJobs.length > 0 && pagination.total > pagination.pageSize && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-700">
            Mostrant {Math.min(pagination.pageSize, filteredJobs.length)} de {filteredJobs.length} jobs
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            <span className="px-3 py-2 text-sm text-gray-700">
              Pàgina {pagination.page}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Següent
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}