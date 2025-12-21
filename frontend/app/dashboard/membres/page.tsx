'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { MembersSearchFilters } from '../../../components/ui/MembersSearchFilters';
import { MembersTabs } from '../../../components/ui/MembersTabs';
import { ViewToggle } from '../../../components/ui/ViewToggle';
import { MembersGrid } from './components/MembersGrid';
import { Loader2 } from 'lucide-react';

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

interface Stats {
  label: string;
  value: string;
  trend: string;
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
  const [stats, setStats] = useState<Stats[]>([
    { label: 'Total Membres', value: '-', trend: '' },
    { label: 'Nous Avui', value: '-', trend: '' },
    { label: 'Actius Aquest Mes', value: '-', trend: '' },
    { label: 'En Línia Ara', value: '-', trend: '' }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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

  // Carregar estadístiques
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/members/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          // Actualitzar comptadors dels tabs amb les dades reals
          if (data.myStats) {
            setTabCounts(prev => ({
              ...prev,
              friends: data.myStats.connections
            }));
          }
        }
      } catch (error) {
        console.error('Error carregant estadístiques:', error);
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
        // Actualitzar comptadors
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

  // Accions de connexió
  const handleConnect = async (memberId: string) => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: memberId })
      });

      const data = await res.json();

      if (res.ok) {
        // Actualitzar l'estat del membre localment
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
      console.error('Error enviant sol·licitud:', error);
      alert('Error enviant sol·licitud de connexió');
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
      console.error('Error acceptant connexió:', error);
      alert('Error acceptant connexió');
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
      console.error('Error rebutjant connexió:', error);
      alert('Error rebutjant connexió');
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
      console.error('Error cancel·lant sol·licitud:', error);
      alert('Error cancel·lant sol·licitud');
    }
  };

  // Callbacks per als components
  const connectionActions = {
    onConnect: handleConnect,
    onAccept: handleAccept,
    onReject: handleReject,
    onDisconnect: handleDisconnect,
    onCancel: handleCancel
  };

  return (
    <PageTemplate
      title="Membres"
      subtitle="Connecta amb altres professionals del sector públic"
      statsData={stats}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Búsqueda y filtros */}
        <MembersSearchFilters
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          totalResults={pagination.total}
        />

        {/* Tabs de navegación */}
        <MembersTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          counts={tabCounts}
        />

        {/* Header con toggle de vista */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#2c3e50',
            margin: 0
          }}>
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregant...
              </span>
            ) : (
              `${pagination.total} membre${pagination.total !== 1 ? 's' : ''} trobat${pagination.total !== 1 ? 's' : ''}`
            )}
          </h2>

          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
        </div>

        {/* Grid/Lista de miembros */}
        {isLoading && members.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p style={{ color: '#6c757d' }}>Carregant membres...</p>
            </div>
          </div>
        ) : (
          <MembersGrid
            members={members}
            viewMode={viewMode}
            connectionActions={connectionActions}
          />
        )}

        {/* Paginació */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '24px'
          }}>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              style={{
                padding: '8px 16px',
                backgroundColor: pagination.page === 1 ? '#e5e7eb' : '#3b82f6',
                color: pagination.page === 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Anterior
            </button>
            <span style={{
              padding: '8px 16px',
              color: '#6c757d'
            }}>
              Pàgina {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              style={{
                padding: '8px 16px',
                backgroundColor: pagination.page >= pagination.totalPages ? '#e5e7eb' : '#3b82f6',
                color: pagination.page >= pagination.totalPages ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Següent
            </button>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
