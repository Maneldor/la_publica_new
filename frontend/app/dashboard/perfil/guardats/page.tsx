'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '@/components/ui/PageTemplate';
import { useGuardatsList } from '@/hooks/useGuardats';
import { getTipusEmoji, getTipusLabel, getGuardatsStats } from '@/lib/guardats';
import {
  Bookmark,
  Filter,
  ChevronDown,
  Heart,
  Eye,
  Calendar,
  Building,
  Users,
  MessageSquare,
  FileText,
  Gift,
  ChevronRight,
  Trash2
} from 'lucide-react';

interface GuardatItem {
  id: string;
  tipus: 'blog' | 'oferta' | 'forum' | 'anunci' | 'empresa' | 'grup';
  itemId: string;
  dataGuardat: string;
  metadata: {
    titol: string;
    imatge?: string;
    url: string;
    description?: string;
    price?: number;
    company?: string;
    location?: string;
    status?: string;
  };
}

export default function GuardatsPage() {
  const router = useRouter();
  const usuariId = 'jordi-garcia'; // En una app real, obtener del contexto de auth

  const [activeFilter, setActiveFilter] = useState('tots');
  const [sortBy, setSortBy] = useState('recents');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Hook para obtener todos los guardats
  const { guardats, isLoading, error, refetch } = useGuardatsList(usuariId);

  // Mock data mientras no tenemos API
  const [mockGuardats] = useState<GuardatItem[]>([
    // OFERTES
    {
      id: '1',
      tipus: 'oferta',
      itemId: '1',
      dataGuardat: '2024-10-15',
      metadata: {
        titol: 'Descuento 25% en Portàtils Professionals',
        imatge: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop',
        url: '/dashboard/ofertes/1',
        description: 'Oferta exclusiva per a membres',
        price: 900,
        company: 'TechSolutions BCN',
        status: 'activa'
      }
    },
    {
      id: '2',
      tipus: 'oferta',
      itemId: '2',
      dataGuardat: '2024-10-14',
      metadata: {
        titol: 'Monitors 24" Full HD',
        imatge: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=200&fit=crop',
        url: '/dashboard/ofertes/2',
        price: 150,
        company: 'DisplayTech',
        status: 'activa'
      }
    },
    // BLOGS
    {
      id: '3',
      tipus: 'blog',
      itemId: '1',
      dataGuardat: '2024-10-13',
      metadata: {
        titol: 'Digitalització de l\'Administració Pública',
        imatge: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
        url: '/dashboard/blogs/1',
        description: 'Estratègies per modernitzar els processos administratius'
      }
    },
    {
      id: '4',
      tipus: 'blog',
      itemId: '2',
      dataGuardat: '2024-10-12',
      metadata: {
        titol: 'Innovació en Serveis Públics',
        imatge: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop',
        url: '/dashboard/blogs/2',
        description: 'Com implementar noves tecnologies al servei públic'
      }
    },
    // FORUMS
    {
      id: '5',
      tipus: 'forum',
      itemId: '1',
      dataGuardat: '2024-10-11',
      metadata: {
        titol: 'Experiències amb transformació digital',
        url: '/dashboard/forums/1',
        description: 'Debat sobre els reptes i èxits en la digitalització'
      }
    },
    // EMPRESES
    {
      id: '6',
      tipus: 'empresa',
      itemId: '1',
      dataGuardat: '2024-10-10',
      metadata: {
        titol: 'TechSolutions BCN',
        imatge: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
        url: '/dashboard/empreses/1',
        description: 'Especialistes en transformació digital',
        location: 'Barcelona'
      }
    },
    // GRUPS
    {
      id: '7',
      tipus: 'grup',
      itemId: '1',
      dataGuardat: '2024-10-09',
      metadata: {
        titol: 'Innovació en Administració',
        url: '/dashboard/grups/1',
        description: '247 membres actius'
      }
    },
    // ANUNCIS
    {
      id: '8',
      tipus: 'anunci',
      itemId: '1',
      dataGuardat: '2024-10-08',
      metadata: {
        titol: 'Busco col·laboració per projecte smart city',
        url: '/dashboard/anuncis/1',
        description: 'Projecte innovador per millorar serveis urbans'
      }
    }
  ]);

  // Usar mock data mientras no tengamos API
  const finalGuardats = guardats.length > 0 ? guardats : mockGuardats;

  // Calcular estadísticas
  const stats = getGuardatsStats(finalGuardats);

  // Filtrar guardats
  const filteredGuardats = finalGuardats.filter(item =>
    activeFilter === 'tots' || item.tipus === activeFilter
  );

  // Ordenar guardats
  const sortedGuardats = [...filteredGuardats].sort((a, b) => {
    switch (sortBy) {
      case 'antics':
        return new Date(a.dataGuardat).getTime() - new Date(b.dataGuardat).getTime();
      case 'alfabetic':
        return a.metadata.titol.localeCompare(b.metadata.titol);
      case 'recents':
      default:
        return new Date(b.dataGuardat).getTime() - new Date(a.dataGuardat).getTime();
    }
  });

  // Agrupar por tipo para las secciones
  const groupedGuardats = {
    ofertes: finalGuardats.filter(g => g.tipus === 'oferta').slice(0, 4),
    blogs: finalGuardats.filter(g => g.tipus === 'blog').slice(0, 4),
    forums: finalGuardats.filter(g => g.tipus === 'forum').slice(0, 4),
    anuncis: finalGuardats.filter(g => g.tipus === 'anunci').slice(0, 4),
    empreses: finalGuardats.filter(g => g.tipus === 'empresa').slice(0, 4),
    grups: finalGuardats.filter(g => g.tipus === 'grup').slice(0, 4),
  };

  const handleEliminarGuardat = (item: GuardatItem) => {
    if (confirm(`Estàs segur que vols eliminar "${item.metadata.titol}" dels guardats?`)) {
      // TODO: Implementar eliminación real
      console.log('Eliminar guardat:', item.id);
      refetch();
    }
  };

  const statsData = [
    { label: 'Total Guardats', value: stats.total.toString(), trend: 'Tots els continguts' },
    { label: 'Ofertes', value: stats.ofertes.toString(), trend: '🎁 Guardades' },
    { label: 'Blogs', value: stats.blogs.toString(), trend: '📝 Articles' },
    { label: 'Forums', value: stats.forums.toString(), trend: '💬 Temes' }
  ];

  return (
    <PageTemplate
      title="Guardats i Favorits"
      subtitle="Tots els continguts que has guardat"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Resum estadístiques */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          border: '1px solid #f0f0f0'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Resum
          </h2>

          <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
            Total guardats: **{stats.total}**
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#0369a1' }}>📝 {stats.blogs}</div>
              <div style={{ fontSize: '12px', color: '#0369a1' }}>Blogs</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#166534' }}>🎁 {stats.ofertes}</div>
              <div style={{ fontSize: '12px', color: '#166534' }}>Ofertes</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fdf4ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#86198f' }}>💬 {stats.forums}</div>
              <div style={{ fontSize: '12px', color: '#86198f' }}>Forums</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#c2410c' }}>📢 {stats.anuncis}</div>
              <div style={{ fontSize: '12px', color: '#c2410c' }}>Anuncis</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#eef2ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#4338ca' }}>🏢 {stats.empreses}</div>
              <div style={{ fontSize: '12px', color: '#4338ca' }}>Empreses</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fdf2f8', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#be185d' }}>👥 {stats.grups}</div>
              <div style={{ fontSize: '12px', color: '#be185d' }}>Grups</div>
            </div>
          </div>
        </div>

        {/* Filtres i ordenació */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>

            {/* Filtres pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { id: 'tots', label: 'Tots', count: stats.total },
                { id: 'blog', label: 'Blogs', count: stats.blogs },
                { id: 'oferta', label: 'Ofertes', count: stats.ofertes },
                { id: 'forum', label: 'Forums', count: stats.forums },
                { id: 'anunci', label: 'Anuncis', count: stats.anuncis },
                { id: 'empresa', label: 'Empreses', count: stats.empreses },
                { id: 'grup', label: 'Grups', count: stats.grups },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '20px',
                    border: '1px solid #d1d5db',
                    backgroundColor: activeFilter === filter.id ? '#3b82f6' : 'white',
                    color: activeFilter === filter.id ? 'white' : '#374151',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: activeFilter === filter.id ? '600' : '400'
                  }}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Ordenació */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Ordenar: {sortBy === 'recents' ? 'Més recents' : sortBy === 'antics' ? 'Més antics' : 'Alfabètic'}
                <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>

              {showSortDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  minWidth: '160px'
                }}>
                  {[
                    { id: 'recents', label: 'Més recents' },
                    { id: 'antics', label: 'Més antics' },
                    { id: 'alfabetic', label: 'Alfabètic' }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setShowSortDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: sortBy === option.id ? '#f3f4f6' : 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contingut principal */}
        {activeFilter === 'tots' ? (
          // Vista per seccions
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Ofertes guardades */}
            {groupedGuardats.ofertes.length > 0 && (
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    🎁 OFERTES GUARDADES ({stats.ofertes})
                  </h3>
                  {stats.ofertes > 4 && (
                    <button
                      onClick={() => setActiveFilter('oferta')}
                      style={{
                        color: '#3b82f6',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Veure totes <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {groupedGuardats.ofertes.map(item => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => router.push(item.metadata.url)}
                    >
                      {item.metadata.imatge && (
                        <img
                          src={item.metadata.imatge}
                          alt={item.metadata.titol}
                          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                          {item.metadata.titol}
                        </h4>
                        {item.metadata.price && (
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' }}>
                            {item.metadata.price}€
                          </div>
                        )}
                        {item.metadata.company && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                            {item.metadata.company}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          Guardat: {new Date(item.dataGuardat).toLocaleDateString('ca-ES')}
                        </div>
                      </div>

                      {/* Botó eliminar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminarGuardat(item);
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '6px',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                        title="Eliminar de guardats"
                      >
                        <Heart style={{ width: '16px', height: '16px', fill: '#ef4444' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Blogs guardats */}
            {groupedGuardats.blogs.length > 0 && (
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    📝 BLOGS GUARDATS ({stats.blogs})
                  </h3>
                  {stats.blogs > 4 && (
                    <button
                      onClick={() => setActiveFilter('blog')}
                      style={{
                        color: '#3b82f6',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Veure tots <ChevronRight style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {groupedGuardats.blogs.map(item => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => router.push(item.metadata.url)}
                    >
                      {item.metadata.imatge && (
                        <img
                          src={item.metadata.imatge}
                          alt={item.metadata.titol}
                          style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                          {item.metadata.titol}
                        </h4>
                        {item.metadata.description && (
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                            {item.metadata.description}
                          </p>
                        )}
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          Guardat: {new Date(item.dataGuardat).toLocaleDateString('ca-ES')}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminarGuardat(item);
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '6px',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#3b82f6'
                        }}
                        title="Eliminar de guardats"
                      >
                        <Bookmark style={{ width: '16px', height: '16px', fill: '#3b82f6' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Altres seccions seguiran el mateix patró... */}

          </div>
        ) : (
          // Vista filtrada
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 20px 0' }}>
              {getTipusEmoji(activeFilter)} {getTipusLabel(activeFilter)} ({filteredGuardats.length})
            </h3>

            {filteredGuardats.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {sortedGuardats.map(item => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => router.push(item.metadata.url)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{getTipusEmoji(item.tipus)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminarGuardat(item);
                        }}
                        style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                        title="Eliminar de guardats"
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                      {item.metadata.titol}
                    </h4>

                    {item.metadata.description && (
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {item.metadata.description}
                      </p>
                    )}

                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      Guardat: {new Date(item.dataGuardat).toLocaleDateString('ca-ES')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{getTipusEmoji(activeFilter)}</div>
                <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0' }}>
                  No tens cap {getTipusLabel(activeFilter).toLowerCase()} guardat
                </p>
                <p style={{ fontSize: '14px', margin: '0 0 16px 0' }}>
                  Explora continguts i guarda els que t'interessin
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => router.push('/dashboard/ofertes')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Explorar ofertes
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/blogs')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Explorar blogs
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/forums')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Explorar forums
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </PageTemplate>
  );
}