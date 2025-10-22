import { useState, useMemo } from 'react';
import { Member } from '../data/sampleMembers';

interface Filters {
  department: string;
  location: string;
  role: string;
  status: string;
}

interface TabCounts {
  all: number;
  active: number;
  new: number;
  friends: number;
}

interface UseMembersReturn {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  filteredMembers: Member[];
  tabCounts: TabCounts;
}

export function useMembers(members: Member[]): UseMembersReturn {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    department: '',
    location: '',
    role: '',
    status: ''
  });

  // Filtrar miembros basado en búsqueda, filtros y tab activo
  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por filtros
    if (filters.department) {
      filtered = filtered.filter(member =>
        member.department.toLowerCase().includes(filters.department.toLowerCase())
      );
    }
    if (filters.location) {
      filtered = filtered.filter(member =>
        member.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.status) {
      if (filters.status === 'online') {
        filtered = filtered.filter(member => member.isOnline);
      }
    }

    // Filtrar por tab activo
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(member => member.isOnline || member.lastActive.includes('hora'));
        break;
      case 'new':
        // Simular miembros nuevos (últimos 2)
        filtered = filtered.slice(-2);
        break;
      case 'friends':
        filtered = filtered.filter(member => member.isConnected);
        break;
      default:
        // 'all' - no filtrar
        break;
    }

    return filtered;
  }, [members, searchTerm, filters, activeTab]);

  const tabCounts: TabCounts = {
    all: members.length,
    active: members.filter(m => m.isOnline || m.lastActive.includes('hora')).length,
    new: 2,
    friends: members.filter(m => m.isConnected).length
  };

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredMembers,
    tabCounts
  };
}