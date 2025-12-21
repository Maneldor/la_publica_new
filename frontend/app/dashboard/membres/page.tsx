'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatsGrid } from '@/components/ui/StatsGrid';
import { TYPOGRAPHY } from '@/lib/design-system';
import { MembersGrid } from './components/MembersGrid';
import {
  Users,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Loader2,
  UserPlus,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export interface Member {
  id: string;
  username: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  department: string;
  location: string;
  administration: 'LOCAL' | 'AUTONOMICA' | 'CENTRAL';
  avatar: string;
  coverImage: string;
  coverColor?: string;
  isOnline: boolean;
  lastActive: string;
  mutualConnections: number;
  isConnected: boolean;
  connectionStatus: 'none' | 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
  connectionId?: string | null;
  isIncoming?: boolean;
  expiresAt?: string | null;
  bio: string;
}

interface Filters {
  department: string;
  location: string;
  role: string;
  status: string;
}

export default function MembresPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState([
    { label: 'Total Membres', value: '-', trend: '', icon: <Users className="w-5 h-5" />, color: 'indigo' as const },
    { label: 'Nous Avui', value: '-', trend: '', icon: <UserPlus className="w-5 h-5" />, color: 'green' as const },
    { label: 'Actius Aquest Mes', value: '-', trend: '', icon: <Activity className="w-5 h-5" />, color: 'blue' as const },
    { label: 'En Linia Ara', value: '-', trend: '', icon: <Clock className="w-5 h-5" />, color: 'amber' as const }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    department: '',
    location: '',
    role: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    active: 0,
    new: 0,
    friends: 0
  });

  // Carregar estadistiques
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/members/stats');
        if (res.ok) {
          const data = await res.json();
          setStats([
            { label: 'Total Membres', value: data.stats[0]?.value || '0', trend: data.stats[0]?.trend || '', icon: <Users className="w-5 h-5" />, color: 'indigo' as const },
            { label: 'Nous Avui', value: data.stats[1]?.value || '0', trend: data.stats[1]?.trend || '', icon: <UserPlus className="w-5 h-5" />, color: 'green' as const },
            { label: 'Actius Aquest Mes', value: data.stats[2]?.value || '0', trend: data.stats[2]?.trend || '', icon: <Activity className="w-5 h-5" />, color: 'blue' as const },
            { label: 'En Linia Ara', value: data.stats[3]?.value || '0', trend: data.stats[3]?.trend || '', icon: <Clock className="w-5 h-5" />, color: 'amber' as const }
          ]);
          if (data.myStats) {
            setTabCounts(prev => ({
              ...prev,
              friends: data.myStats.connections
            }));
          }
        }
      } catch (error) {
        console.error('Error carregant estadistiques:', error);
      }
    };
    loadStats();
  }, []);

  // Carregar membres
  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        tab: activeTab === 'friends' ? 'connections' : activeTab,
        page: pagination.page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filters.department && { department: filters.department }),
        ...(filters.location && { location: filters.location }),
      });

      const res = await fetch(`/api/members?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasMore: data.pagination.hasMore
        }));
        setTabCounts(prev => ({
          ...prev,
          all: activeTab === 'all' ? data.pagination.total : prev.all,
          active: activeTab === 'active' ? data.pagination.total : prev.active,
          new: activeTab === 'new' ? data.pagination.total : prev.new,
        }));
      }
    } catch (error) {
      console.error('Error carregant membres:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchTerm, filters, pagination.page]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Accions de connexio
  const handleConnect = async (memberId: string) => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: memberId })
      });

      const data = await res.json();

      if (res.ok) {
        setMembers(prev => prev.map(m =>
          m.id === memberId
            ? {
                ...m,
                connectionStatus: 'pending' as const,
                connectionId: data.connection.id,
                isIncoming: false
              }
            : m
        ));
      } else {
        console.error('Error:', data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error enviant sollicitud:', error);
      alert('Error enviant sollicitud de connexio');
    }
  };

  const handleAccept = async (connectionId: string, memberId: string) => {
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      });

      if (res.ok) {
        setMembers(prev => prev.map(m =>
          m.id === memberId
            ? { ...m, connectionStatus: 'accepted' as const, isConnected: true }
            : m
        ));
      }
    } catch (error) {
      console.error('Error acceptant connexio:', error);
      alert('Error acceptant connexio');
    }
  };

  const handleReject = async (connectionId: string, memberId: string) => {
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });

      if (res.ok) {
        setMembers(prev => prev.map(m =>
          m.id === memberId
            ? { ...m, connectionStatus: 'none' as const, connectionId: null }
            : m
        ));
      }
    } catch (error) {
      console.error('Error rebutjant connexio:', error);
      alert('Error rebutjant connexio');
    }
  };

  const handleDisconnect = async (connectionId: string, memberId: string) => {
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMembers(prev => prev.map(m =>
          m.id === memberId
            ? { ...m, connectionStatus: 'none' as const, isConnected: false, connectionId: null }
            : m
        ));
      }
    } catch (error) {
      console.error('Error desconnectant:', error);
      alert('Error desconnectant');
    }
  };

  const handleCancel = async (connectionId: string, memberId: string) => {
    try {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMembers(prev => prev.map(m =>
          m.id === memberId
            ? { ...m, connectionStatus: 'none' as const, connectionId: null }
            : m
        ));
      }
    } catch (error) {
      console.error('Error cancellant sollicitud:', error);
      alert('Error cancellant sollicitud');
    }
  };

  const connectionActions = {
    onConnect: handleConnect,
    onAccept: handleAccept,
    onReject: handleReject,
    onDisconnect: handleDisconnect,
    onCancel: handleCancel
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ department: '', location: '', role: '', status: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const tabs = [
    { id: 'all', label: 'Tots', count: tabCounts.all, description: 'Tots els membres de la plataforma' },
    { id: 'active', label: 'Actius', count: tabCounts.active, description: 'Membres actius recentment' },
    { id: 'new', label: 'Nous', count: tabCounts.new, description: 'Membres nous aquesta setmana' },
    { id: 'friends', label: 'Connexions', count: tabCounts.friends, description: 'Les teves connexions' }
  ];

  return (
    <PageLayout
      title="Membres"
      subtitle="Connecta amb altres professionals del sector public"
      icon={<Users className="w-6 h-6" />}
    >
      {/* Stats Grid */}
      <StatsGrid stats={stats} columns={4} />

      {/* Barra de cerca i filtres */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-4">
          {/* Cercador */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar membres per nom, carrec o departament..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Boto Filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </button>

          {/* Comptador */}
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {pagination.total} membres
          </span>
        </div>

        {/* Panel de filtres expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Filtre per departament */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Departament</label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tots els departaments</option>
                  <option value="tecnologia">Tecnologia</option>
                  <option value="recursos_humans">Recursos Humans</option>
                  <option value="finances">Finances</option>
                  <option value="operacions">Operacions</option>
                  <option value="legal">Legal</option>
                </select>
              </div>

              {/* Filtre per ubicacio */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Ubicacio</label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Totes les ubicacions</option>
                  <option value="barcelona">Barcelona</option>
                  <option value="girona">Girona</option>
                  <option value="lleida">Lleida</option>
                  <option value="tarragona">Tarragona</option>
                  <option value="remot">Remot</option>
                </select>
              </div>

              {/* Filtre per rol */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Rol</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tots els rols</option>
                  <option value="manager">Manager</option>
                  <option value="senior">Senior</option>
                  <option value="junior">Junior</option>
                  <option value="intern">Intern</option>
                </select>
              </div>

              {/* Filtre per estat */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Estat</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tots els estats</option>
                  <option value="online">En linia</option>
                  <option value="active">Actiu</option>
                  <option value="inactive">Inactiu</option>
                </select>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Netejar filtres
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Descripcio del tab */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <p className={TYPOGRAPHY.small}>
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Header amb toggle de vista */}
      <div className="flex items-center justify-between">
        <h2 className={TYPOGRAPHY.sectionTitle}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregant...
            </span>
          ) : (
            `${pagination.total} membre${pagination.total !== 1 ? 's' : ''} trobat${pagination.total !== 1 ? 's' : ''}`
          )}
        </h2>

        {/* Toggle vista */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid/Lista de membres */}
      {isLoading && members.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-gray-500">Carregant membres...</p>
          </div>
        </div>
      ) : (
        <MembersGrid
          members={members}
          viewMode={viewMode}
          connectionActions={connectionActions}
        />
      )}

      {/* Paginacio */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pagination.page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Pagina {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page >= pagination.totalPages}
            className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pagination.page >= pagination.totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            Seguent
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </PageLayout>
  );
}
