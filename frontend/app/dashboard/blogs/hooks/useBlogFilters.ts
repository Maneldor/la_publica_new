import { useState, useMemo } from 'react';
import { BlogPost, Author, BlogCategory } from '../types/blogTypes';

export function useBlogFilters(blogs: BlogPost[], authors: Author[], categories: BlogCategory[]) {
  // Estados de filtros
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'following' | 'popular'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'popular' | 'comments' | 'likes'>('recent');

  // Obtener autor por ID
  const getAuthorById = (id: number) => authors.find(a => a.id === id);

  // Filtrar y ordenar blogs
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter(blog => {
        // Filtro por tab activo
        if (activeTab === 'mine') return blog.author.id === 1; // Usuario actual
        if (activeTab === 'following') return [1, 2].includes(blog.author.id); // Autores seguidos
        if (activeTab === 'popular') return blog.featured || blog.views > 1000;

        return true;
      })
      .filter(blog => {
        // Filtro por búsqueda
        if (searchTerm) {
          return blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return true;
      })
      .filter(blog => {
        // Filtro por categoría
        if (selectedCategory !== 'all') {
          const category = categories.find(c => c.id === selectedCategory);
          return category && blog.category === category.name;
        }
        return true;
      })
      .filter(blog => {
        // Filtro por tags
        if (selectedTags.length > 0) {
          return selectedTags.some(tag => blog.tags.includes(tag));
        }
        return true;
      })
      .filter(blog => {
        // Filtro por autor
        if (selectedAuthor !== 'all') {
          return blog.author.id === parseInt(selectedAuthor);
        }
        return true;
      })
      .filter(blog => {
        // Filtro por fecha
        const now = new Date();
        const blogDate = new Date(blog.publishedAt);

        switch (dateFilter) {
          case 'today':
            return blogDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return blogDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return blogDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            return blogDate >= yearAgo;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          case 'oldest':
            return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
          case 'popular':
            return b.views - a.views;
          case 'comments':
            return b.comments - a.comments;
          case 'likes':
            return b.likes - a.likes;
          default:
            return 0;
        }
      });
  }, [blogs, authors, categories, activeTab, searchTerm, selectedCategory, selectedTags, selectedAuthor, dateFilter, sortBy]);

  // Estadísticas de pestañas
  const tabCounts = useMemo(() => ({
    all: blogs.length,
    mine: blogs.filter(b => b.author.id === 1).length,
    following: blogs.filter(b => [1, 2].includes(b.author.id)).length,
    popular: blogs.filter(b => b.featured || b.views > 1000).length
  }), [blogs]);

  return {
    // Estados de filtros
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    selectedAuthor,
    setSelectedAuthor,
    dateFilter,
    setDateFilter,
    sortBy,
    setSortBy,

    // Datos procesados
    filteredBlogs,
    tabCounts,
    getAuthorById
  };
}