'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '../../../components/ui/PageTemplate';
import { UniversalCard } from '../../../components/ui/UniversalCard';
import { Author, BlogPost, BlogCategory, PopularTag } from './types/blogTypes';
import { sampleAuthors, sampleBlogs, blogCategories, popularTags, statsData } from './data/blogData';
import { useBlogFilters } from './hooks/useBlogFilters';
import { useResponsive } from './hooks/useResponsive';


export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPost[]>(sampleBlogs);
  const [authors] = useState<Author[]>(sampleAuthors);
  const [categories] = useState<BlogCategory[]>(blogCategories);
  const [loading, setLoading] = useState(false);

  // Estados UI locales
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Hooks personalizados
  const {
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
    filteredBlogs,
    tabCounts,
    getAuthorById
  } = useBlogFilters(blogs, authors, categories);

  const { isMobile, screenSize } = useResponsive();

  // Formatear tiempo
  const formatTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `fa ${minutes} min`;
    } else if (hours < 24) {
      return `fa ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (days < 7) {
      return `fa ${days} dia${days > 1 ? 's' : ''}`;
    } else {
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('ca-ES', { month: 'short' });
      const year = dateObj.getFullYear();
      const showYear = year !== now.getFullYear();
      return showYear ? `${day} ${month} ${year}` : `${day} ${month}`;
    }
  };


  // Manejar acciones

  const handleBlogClick = (slug: string) => {
    router.push(`/dashboard/blogs/${slug}`);
  };

  const handleLikeBlog = (blogId: number) => {
    setBlogs(prev => prev.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          isLiked: !blog.isLiked,
          likes: blog.isLiked ? blog.likes - 1 : blog.likes + 1
        };
      }
      return blog;
    }));
  };

  const handleSaveBlog = (blogId: number) => {
    setBlogs(prev => prev.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          isSaved: !blog.isSaved
        };
      }
      return blog;
    }));
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };



  return (
    <PageTemplate
      title="Blogs"
      subtitle="Descobreix articles i reflexions de la comunitat"
      statsData={statsData}
    >
      <div style={{
        padding: '0 24px 24px 24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header principal */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '2px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
        }}>
          {/* Tabs y botón crear */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              padding: '4px'
            }}>
              {[
                { key: 'all', label: 'Tots', count: tabCounts.all },
                { key: 'mine', label: 'Els Meus', count: tabCounts.mine },
                { key: 'following', label: 'Seguits', count: tabCounts.following },
                { key: 'popular', label: 'Populars', count: tabCounts.popular }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
                    color: activeTab === tab.key ? '#2c3e50' : '#6c757d',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: activeTab === tab.key ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                  <span style={{
                    backgroundColor: activeTab === tab.key ? '#3b82f6' : '#e9ecef',
                    color: activeTab === tab.key ? 'white' : '#6c757d',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

          </div>

          {/* Vista toggle y contador */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#6c757d'
            }}>
              {filteredBlogs.length} blog{filteredBlogs.length !== 1 ? 's' : ''} trobat{filteredBlogs.length !== 1 ? 's' : ''}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              padding: '4px'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
                  color: viewMode === 'grid' ? '#2c3e50' : '#6c757d',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
                title="Vista en graella"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                  color: viewMode === 'list' ? '#2c3e50' : '#6c757d',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
                title="Vista en llista"
              >
                ≡
              </button>
            </div>
          </div>
        </div>

        <div style={{
          width: '100%'
        }}>
          {/* Contenido principal */}
          <div style={{ width: '100%' }}>
            {/* Barra de filtros */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              {/* Búsqueda */}
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="🔍 Buscar blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Filtros en grid responsive */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                {/* Categoría */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">📂 Totes les categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>

                {/* Autor */}
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">👤 Tots els autors</option>
                  {authors.map(author => (
                    <option key={author.id} value={author.id.toString()}>
                      {author.name} ({author.blogCount})
                    </option>
                  ))}
                </select>

                {/* Data */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">📅 Tot el temps</option>
                  <option value="today">Avui</option>
                  <option value="week">Aquesta setmana</option>
                  <option value="month">Aquest mes</option>
                  <option value="year">Aquest any</option>
                </select>

                {/* Ordenació */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="recent">📊 Més recents</option>
                  <option value="oldest">Més antics</option>
                  <option value="popular">Més populars</option>
                  <option value="comments">Més comentats</option>
                  <option value="likes">Més valorats</option>
                </select>
              </div>

              {/* Tags seleccionados */}
              {selectedTags.length > 0 && (
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    alignSelf: 'center'
                  }}>
                    🏷️ Etiquetes:
                  </span>
                  {selectedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      #{tag} ✕
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Blogs Grid/List */}
            {viewMode === 'grid' ? (
              // Vista Grid
              <div style={{
                display: 'grid',
                gridTemplateColumns:
                  screenSize === 'desktop' ? 'repeat(4, 1fr)' :
                  screenSize === 'tablet-large' ? 'repeat(3, 1fr)' :
                  screenSize === 'tablet' ? 'repeat(2, 1fr)' : '1fr',
                gap: '24px'
              }}>
                {filteredBlogs.map((blog) => {
                  const author = blog.author;
                  return (
                    <div
                      key={blog.id}
                      onClick={() => handleBlogClick(blog.slug)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        height: 'fit-content'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.border = '2px solid #3b82f6';
                        e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(59, 130, 246, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.border = '2px solid #e5e7eb';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)';
                      }}
                    >
                      {/* Imagen cover */}
                      <div style={{
                        position: 'relative',
                        aspectRatio: '16/9',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        {/* Badge categoría */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: blog.categoryColor,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {blog.category}
                        </div>
                        {/* Botones acción */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          display: 'flex',
                          gap: '6px'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikeBlog(blog.id);
                            }}
                            style={{
                              backgroundColor: blog.isLiked ? '#ef4444' : 'rgba(255,255,255,0.9)',
                              color: blog.isLiked ? 'white' : '#6c757d',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ❤️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveBlog(blog.id);
                            }}
                            style={{
                              backgroundColor: blog.isSaved ? '#3b82f6' : 'rgba(255,255,255,0.9)',
                              color: blog.isSaved ? 'white' : '#6c757d',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            🔖
                          </button>
                        </div>
                      </div>

                      {/* Contenido card */}
                      <div style={{ padding: '20px' }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#2c3e50',
                          marginBottom: '8px',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {blog.title}
                        </h3>

                        <p style={{
                          fontSize: '14px',
                          color: '#6c757d',
                          lineHeight: '1.6',
                          marginBottom: '16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {blog.excerpt}
                        </p>

                        {/* Info autor */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          <img
                            src={author?.avatar}
                            alt={author?.name}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#2c3e50'
                          }}>
                            {author?.name}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            color: '#6c757d'
                          }}>
                            • {formatTime(blog.publishedAt)} • {blog.readTime} min
                          </span>
                        </div>

                        {/* Stats */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '12px',
                          color: '#6c757d'
                        }}>
                          <span>👁️ {blog.views}</span>
                          <span>💬 {blog.comments}</span>
                          <span>❤️ {blog.likes}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Vista List
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {filteredBlogs.map((blog) => {
                  const author = blog.author;
                  return (
                    <div
                      key={blog.id}
                      onClick={() => handleBlogClick(blog.slug)}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '2px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        transform: 'translateY(0)',
                        display: 'flex',
                        gap: '16px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.border = '2px solid #3b82f6';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(59, 130, 246, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.border = '2px solid #e5e7eb';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)';
                      }}
                    >
                      {/* Imagen */}
                      <div style={{
                        width: '150px',
                        height: '100px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '6px',
                          left: '6px',
                          backgroundColor: blog.categoryColor,
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {blog.category}
                        </div>
                      </div>

                      {/* Contenido */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#2c3e50',
                          marginBottom: '6px',
                          lineHeight: '1.4'
                        }}>
                          {blog.title}
                        </h3>

                        <p style={{
                          fontSize: '14px',
                          color: '#6c757d',
                          lineHeight: '1.5',
                          marginBottom: '12px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {blog.excerpt}
                        </p>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <img
                              src={author?.avatar}
                              alt={author?.name}
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                            <span style={{
                              fontSize: '12px',
                              color: '#2c3e50',
                              fontWeight: '500'
                            }}>
                              {author?.name}
                            </span>
                            <span style={{
                              fontSize: '12px',
                              color: '#6c757d'
                            }}>
                              • {formatTime(blog.publishedAt)}
                            </span>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '12px',
                            color: '#6c757d'
                          }}>
                            <span>👁️ {blog.views}</span>
                            <span>💬 {blog.comments}</span>
                            <span>❤️ {blog.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mensaje si no hay resultados */}
            {filteredBlogs.length === 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '8px'
                }}>
                  No s'han trobat blogs
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  marginBottom: '20px'
                }}>
                  Prova a ajustar els filtres o cerca altres termes
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedTags([]);
                    setSelectedAuthor('all');
                    setDateFilter('all');
                  }}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Esborrar filtres
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </PageTemplate>
  );
}