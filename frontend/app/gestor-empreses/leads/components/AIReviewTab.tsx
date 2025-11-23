'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Bot, TrendingUp, Star, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import AILeadCard from './AILeadCard';

// API Response types
interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface StatsData {
  pending: number;
  approved: number;
  rejected: number;
  avgScore: number;
  highQuality: number;
  totalGenerated: number;
}

interface Lead {
  id: string;
  companyName: string;
  city: string;
  sector: string;
  aiScore: number;
  aiInsights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
  suggestedPitch: string;
  targetAudience: string;
  estimatedSize: string;
  phone?: string;
  email?: string;
  website?: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface Filters {
  search: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  minScore: number[];
  sortBy: 'score' | 'date' | 'name';
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AIReviewTab() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    reviewStatus: 'pending',
    minScore: [0],
    sortBy: 'score'
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<StatsData>({
    pending: 0,
    approved: 0,
    rejected: 0,
    avgScore: 0,
    highQuality: 0,
    totalGenerated: 0,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { toast } = useToast();

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // API Functions
  const fetchAILeads = useCallback(async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        search: debouncedSearch,
        reviewStatus: filters.reviewStatus,
        minScore: filters.minScore[0].toString(),
        sortBy: filters.sortBy,
        limit: '50',
        offset: '0',
      });

      const response = await fetch(`/api/leads/ai-review?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<Lead[]> & { pagination: PaginationInfo } = await response.json();

      if (result.success) {
        setLeads(result.data);
        setPagination(result.pagination);
      } else {
        throw new Error(result.error || 'Failed to fetch leads');
      }

    } catch (error) {
      console.error('Error fetching AI leads:', error);
      toast({
        title: "Error",
        description: "No s'han pogut carregar els leads generats per IA",
        variant: "destructive",
      });
      setLeads([]); // Clear in case of error
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filters.reviewStatus, filters.minScore, filters.sortBy, toast]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/leads/ai-review/stats');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<StatsData> = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't show toast here, it's secondary
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchAILeads();
  }, [fetchAILeads]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Action handlers
  const handleApprove = async (leadId: string, assignTo?: string) => {
    setActionLoading(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignTo: assignTo || null,
          notes: 'Aprovat des de la cua de revisió IA',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<any> = await response.json();

      if (result.success) {
        // Optimistic update
        setLeads(leads.filter(l => l.id !== leadId));

        // Success toast
        toast({
          title: "✅ Lead aprovat",
          description: "El lead ha estat aprovat i està disponible al pipeline",
        });

        // Refresh stats
        fetchStats();
      } else {
        throw new Error(result.error || 'Failed to approve lead');
      }

    } catch (error) {
      console.error('Error approving lead:', error);
      toast({
        title: "Error",
        description: "No s'ha pogut aprovar el lead. Torna-ho a intentar.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (leadId: string, reason: string) => {
    if (!reason || reason.trim().length === 0) {
      toast({
        title: "Error",
        description: "Has de proporcionar una raó per rebutjar el lead",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<any> = await response.json();

      if (result.success) {
        // Optimistic update
        setLeads(leads.filter(l => l.id !== leadId));

        // Success toast
        toast({
          title: "❌ Lead rebutjat",
          description: "El lead ha estat rebutjat i arxivat",
        });

        // Refresh stats
        fetchStats();
      } else {
        throw new Error(result.error || 'Failed to reject lead');
      }

    } catch (error) {
      console.error('Error rejecting lead:', error);
      toast({
        title: "Error",
        description: "No s'ha pogut rebutjar el lead. Torna-ho a intentar.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async (leadId: string, updates: any) => {
    setActionLoading(leadId);
    try {
      const response = await fetch(`/api/leads/${leadId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse<any> = await response.json();

      if (result.success) {
        // Update local state
        setLeads(leads.map(l =>
          l.id === leadId ? { ...l, ...updates } : l
        ));

        toast({
          title: "✅ Lead actualitzat",
          description: "Els canvis s'han desat correctament",
        });

        return true;
      } else {
        throw new Error(result.error || 'Failed to update lead');
      }

    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar el lead",
        variant: "destructive",
      });
      return false;
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pendientes de revisión */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">
                  Pendents de revisió
                </p>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    <span className="text-lg text-purple-600">--</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-purple-900">
                    {stats.pending}
                  </p>
                )}
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Bot className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score mitjà */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Score mitjà
                </p>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-lg text-blue-600">--</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-blue-900">
                    {stats.avgScore}/100
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alta qualitat */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">
                  Alta qualitat (≥80)
                </p>
                {statsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                    <span className="text-lg text-green-600">--</span>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-green-900">
                    {stats.highQuality}
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros específicos de IA */}
      <Card className="border border-gray-200">
        <CardContent className="p-6 space-y-4">
          {/* Fila 1 - Filtros principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Buscar per empresa, sector, ciutat..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Review Status */}
            <select
              className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filters.reviewStatus}
              onChange={(e) => setFilters({ ...filters, reviewStatus: e.target.value as any })}
            >
              <option value="pending">Pendents</option>
              <option value="approved">Aprovats</option>
              <option value="rejected">Rebutjats</option>
            </select>

            {/* Ordenar por */}
            <select
              className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
            >
              <option value="score">Score (més alt)</option>
              <option value="date">Data (més recent)</option>
              <option value="name">Nom (A-Z)</option>
            </select>
          </div>

          {/* Fila 2 - Score slider */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Score mínim: {filters.minScore[0]}
            </label>
            <div className="px-2">
              <Slider
                value={filters.minScore}
                onValueChange={(value) => setFilters({ ...filters, minScore: value })}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de leads */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregant leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="py-12">
              <div className="text-center">
                <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hi ha leads pendents de revisió
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {debouncedSearch || filters.minScore[0] > 0
                    ? 'Prova a ajustar els filtres de cerca.'
                    : 'Els nous leads generats per la IA apareixeran aquí.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrant {leads.length} de {pagination.total} leads
                {filters.reviewStatus === 'pending' ? ' pendents' :
                 filters.reviewStatus === 'approved' ? ' aprovats' : ' rebutjats'}
                {pagination.hasMore && (
                  <span className="text-blue-600"> • Mostra més resultats disponibles</span>
                )}
              </p>
            </div>

            <div className="space-y-4">
              {leads.map((lead) => (
                <AILeadCard
                  key={lead.id}
                  lead={lead}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onEdit={handleEdit}
                  isLoading={actionLoading === lead.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}