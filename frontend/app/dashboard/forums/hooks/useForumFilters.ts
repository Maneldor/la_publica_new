import { useState, useMemo } from 'react';
import { Post, ForumFilters, TabCounts } from '../types/forumTypes';

export function useForumFilters(posts: Post[]) {
  const [activeTab, setActiveTab] = useState('tots');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ForumFilters>({
    category: '',
    tags: '',
    author: '',
    hasAttachments: false
  });

  // Filtrar posts basado en búsqueda, filtros y tab activo
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por filtros
    if (filters.category) {
      filtered = filtered.filter(post =>
        post.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.author) {
      filtered = filtered.filter(post =>
        post.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }
    if (filters.hasAttachments) {
      filtered = filtered.filter(post => post.hasAttachments);
    }

    // Filtrar por tab activo
    switch (activeTab) {
      case 'meus':
        // Simular posts del usuario actual (posts de Maria González)
        filtered = filtered.filter(post => post.author === 'Maria González');
        break;
      case 'seguits':
        // Posts que sigo
        filtered = filtered.filter(post => post.isFollowing);
        break;
      case 'populars':
        // Posts más populares (ordenar por votos)
        filtered = filtered.sort((a, b) => (b.votesUp - b.votesDown) - (a.votesUp - a.votesDown)).slice(0, 4);
        break;
      default:
        // 'tots' - mostrar todos, pero pinned primero
        filtered = filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        break;
    }

    return filtered;
  }, [posts, searchTerm, filters, activeTab]);

  // Calcular contadores para pestañas
  const tabCounts: TabCounts = useMemo(() => ({
    tots: posts.length,
    meus: posts.filter(p => p.author === 'Maria González').length,
    seguits: posts.filter(p => p.isFollowing).length,
    populars: 4
  }), [posts]);

  return {
    // Estados de filtros
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,

    // Datos procesados
    filteredPosts,
    tabCounts
  };
}