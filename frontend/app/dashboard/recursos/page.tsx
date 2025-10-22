'use client';

import { useState, useMemo } from 'react';
import { PageTemplate } from '../../../components/ui/PageTemplate';

// Tipos para recursos
interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'PDF' | 'DOC' | 'LINK' | 'VIDEO' | 'XLS';
  category: string;
  url: string;
  createdAt: string;
  size?: string;
}

// Datos de ejemplo de recursos
const sampleResources: Resource[] = [
  // Documentació i Normatives
  {
    id: 1,
    title: 'Llei de Procediment Administratiu Comú',
    description: 'Text complet de la Llei 39/2015 actualitzada',
    type: 'PDF',
    category: 'Documentació i Normatives',
    url: '#',
    createdAt: 'fa 2 dies',
    size: '2.3 MB'
  },
  {
    id: 2,
    title: 'Protocol de Gestió de Dades Personals',
    description: 'Guia per al compliment del RGPD en l\'administració',
    type: 'PDF',
    category: 'Documentació i Normatives',
    url: '#',
    createdAt: 'fa 1 setmana',
    size: '1.8 MB'
  },
  {
    id: 3,
    title: 'Reglament de Contractació Pública',
    description: 'Normativa actualitzada sobre procediments de contractació',
    type: 'PDF',
    category: 'Documentació i Normatives',
    url: '#',
    createdAt: 'fa 3 dies',
    size: '3.1 MB'
  },
  {
    id: 4,
    title: 'Manual de Transparència i Bon Govern',
    description: 'Guia pràctica per a la transparència administrativa',
    type: 'DOC',
    category: 'Documentació i Normatives',
    url: '#',
    createdAt: 'fa 5 dies',
    size: '945 KB'
  },

  // Formació i Desenvolupament
  {
    id: 5,
    title: 'Curs: Atenció Ciutadana Digital',
    description: 'Formació online sobre serveis digitals al ciutadà',
    type: 'VIDEO',
    category: 'Formació i Desenvolupament',
    url: '#',
    createdAt: 'fa 2 setmanes',
    size: '180 min'
  },
  {
    id: 6,
    title: 'Webinar: Innovació en l\'Administració',
    description: 'Sessió sobre digitalització i modernització',
    type: 'VIDEO',
    category: 'Formació i Desenvolupament',
    url: '#',
    createdAt: 'fa 1 setmana',
    size: '90 min'
  },
  {
    id: 7,
    title: 'Manual de Lideratge Públic',
    description: 'Guia per al desenvolupament de competències directives',
    type: 'PDF',
    category: 'Formació i Desenvolupament',
    url: '#',
    createdAt: 'fa 4 dies',
    size: '2.7 MB'
  },

  // Eines i Aplicacions
  {
    id: 8,
    title: 'Plantilla de Memòria Justificativa',
    description: 'Model per a la redacció de memòries de projectes',
    type: 'DOC',
    category: 'Eines i Aplicacions',
    url: '#',
    createdAt: 'fa 6 dies',
    size: '156 KB'
  },
  {
    id: 9,
    title: 'Calculadora de Pressupostos',
    description: 'Eina per al càlcul de pressupostos departamentals',
    type: 'XLS',
    category: 'Eines i Aplicacions',
    url: '#',
    createdAt: 'fa 1 setmana',
    size: '234 KB'
  },
  {
    id: 10,
    title: 'Portal d\'Expedients Electrònics',
    description: 'Accés al sistema de gestió d\'expedients digitals',
    type: 'LINK',
    category: 'Eines i Aplicacions',
    url: '#',
    createdAt: 'fa 3 setmanes'
  },

  // Suport i Ajuda
  {
    id: 11,
    title: 'FAQ - Preguntes Freqüents',
    description: 'Respostes a les consultes més habituals',
    type: 'LINK',
    category: 'Suport i Ajuda',
    url: '#',
    createdAt: 'fa 2 dies'
  },
  {
    id: 12,
    title: 'Guia Ràpida de Tràmits',
    description: 'Procediments més comuns pas a pas',
    type: 'PDF',
    category: 'Suport i Ajuda',
    url: '#',
    createdAt: 'fa 1 setmana',
    size: '1.2 MB'
  },

  // Benestar i Salut
  {
    id: 13,
    title: 'Protocol de Salut Laboral',
    description: 'Mesures de prevenció i seguretat al lloc de treball',
    type: 'PDF',
    category: 'Benestar i Salut',
    url: '#',
    createdAt: 'fa 5 dies',
    size: '1.6 MB'
  },
  {
    id: 14,
    title: 'Recursos de Suport Psicològic',
    description: 'Serveis d\'atenció i benestar per a empleats',
    type: 'LINK',
    category: 'Benestar i Salut',
    url: '#',
    createdAt: 'fa 1 setmana'
  },

  // Directori
  {
    id: 15,
    title: 'Directori de Departaments',
    description: 'Organigrama i contactes de tots els departaments',
    type: 'LINK',
    category: 'Directori',
    url: '#',
    createdAt: 'fa 1 mes'
  }
];

// Definir categorías
const categories = [
  {
    id: 'documentacio',
    title: 'Documentació i Normatives',
    icon: '📚',
    description: 'Lleis, reglaments i protocols administratius',
    color: '#3b82f6'
  },
  {
    id: 'formacio',
    title: 'Formació i Desenvolupament',
    icon: '🎓',
    description: 'Cursos, webinars i materials de formació',
    color: '#10b981'
  },
  {
    id: 'eines',
    title: 'Eines i Aplicacions',
    icon: '🛠️',
    description: 'Software, plantilles i calculadores',
    color: '#f59e0b'
  },
  {
    id: 'suport',
    title: 'Suport i Ajuda',
    icon: 'ℹ️',
    description: 'FAQ, contactes i guies ràpides',
    color: '#8b5cf6'
  },
  {
    id: 'benestar',
    title: 'Benestar i Salut',
    icon: '💼',
    description: 'Protocols i recursos de salut laboral',
    color: '#ef4444'
  },
  {
    id: 'directori',
    title: 'Directori',
    icon: '📞',
    description: 'Organigrama i contactes departamentals',
    color: '#6b7280'
  }
];

export default function RecursosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type'>('name');

  const statsData = [
    { label: 'Total Recursos', value: '77', trend: '+5' },
    { label: 'Més Descarregats', value: '24', trend: '+12' },
    { label: 'Nous Aquest Mes', value: '8', trend: '+8' },
    { label: 'Categories', value: '6', trend: '→' }
  ];

  // Filtrar recursos
  const filteredResources = useMemo(() => {
    return sampleResources.filter(resource =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Obtener recursos por categoría
  const getResourcesByCategory = (categoryTitle: string) => {
    const categoryResources = filteredResources.filter(r => r.category === categoryTitle);

    // Ordenar según el criterio seleccionado
    return categoryResources.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'date':
          return b.id - a.id; // Simulamos orden por fecha con ID
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'DOC': return '📝';
      case 'XLS': return '📊';
      case 'VIDEO': return '🎥';
      case 'LINK': return '🔗';
      default: return '📄';
    }
  };

  // Obtener color según tipo de archivo
  const getFileColor = (type: string) => {
    switch (type) {
      case 'PDF': return '#ef4444';
      case 'DOC': return '#3b82f6';
      case 'XLS': return '#10b981';
      case 'VIDEO': return '#8b5cf6';
      case 'LINK': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <PageTemplate
      title="Recursos"
      subtitle="Documents, formació i eines per al teu dia a dia"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Buscador i controls */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: '2px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center'
          }}>
            {/* Buscador */}
            <div style={{
              position: 'relative',
              flex: 1
            }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6c757d',
                fontSize: '16px'
              }}>
                🔍
              </div>
              <input
                type="text"
                placeholder="Buscar recursos per títol, descripció o categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
            </div>

            {/* Selector de ordenación */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'type')}
              style={{
                padding: '12px 16px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="name">Ordenar per Nom</option>
              <option value="date">Ordenar per Data</option>
              <option value="type">Ordenar per Tipus</option>
            </select>
          </div>
        </div>

        {/* Grid de categorías */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px'
        }}>
          {categories.map((category) => {
            const categoryResources = getResourcesByCategory(category.title);
            const isExpanded = expandedCategory === category.id;

            return (
              <div
                key={category.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {/* Header de categoría */}
                <div
                  onClick={() => toggleCategory(category.id)}
                  style={{
                    padding: '20px',
                    cursor: 'pointer',
                    borderBottom: isExpanded ? '1px solid #f0f0f0' : 'none',
                    background: isExpanded ? '#f8f9fa' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '32px',
                      lineHeight: 1
                    }}>
                      {category.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#2c3e50',
                        margin: '0 0 4px 0'
                      }}>
                        {category.title}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          color: category.color,
                          fontWeight: '600'
                        }}>
                          {categoryResources.length} recursos
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#8e8e93',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}>
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#6c757d',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {category.description}
                  </p>
                </div>

                {/* Lista de recursos expandida */}
                {isExpanded && (
                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    {categoryResources.length > 0 ? (
                      categoryResources.map((resource) => (
                        <div
                          key={resource.id}
                          style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #f0f0f0',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px'
                          }}>
                            {/* Icono del archivo */}
                            <div style={{
                              fontSize: '20px',
                              padding: '8px',
                              backgroundColor: `${getFileColor(resource.type)}15`,
                              borderRadius: '8px',
                              border: `1px solid ${getFileColor(resource.type)}30`
                            }}>
                              {getFileIcon(resource.type)}
                            </div>

                            {/* Contenido */}
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#2c3e50',
                                margin: '0 0 4px 0',
                                lineHeight: '1.3'
                              }}>
                                {resource.title}
                              </h4>
                              <p style={{
                                fontSize: '12px',
                                color: '#6c757d',
                                margin: '0 0 8px 0',
                                lineHeight: '1.4'
                              }}>
                                {resource.description}
                              </p>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                              }}>
                                <span style={{
                                  fontSize: '11px',
                                  color: getFileColor(resource.type),
                                  backgroundColor: `${getFileColor(resource.type)}15`,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '600'
                                }}>
                                  {resource.type}
                                </span>
                                {resource.size && (
                                  <span style={{
                                    fontSize: '11px',
                                    color: '#8e8e93'
                                  }}>
                                    {resource.size}
                                  </span>
                                )}
                                <span style={{
                                  fontSize: '11px',
                                  color: '#8e8e93'
                                }}>
                                  {resource.createdAt}
                                </span>
                              </div>
                            </div>

                            {/* Botón de acción */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(resource.url, '_blank');
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: getFileColor(resource.type),
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                              }}
                            >
                              {resource.type === 'LINK' ? 'Obrir' : 'Descarregar'}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#8e8e93',
                        fontSize: '14px'
                      }}>
                        No s'han trobat recursos en aquesta categoria
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mensaje si no hay resultados */}
        {searchTerm && filteredResources.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#6c757d',
              marginBottom: '8px'
            }}>
              No s'han trobat recursos
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#8e8e93',
              margin: 0
            }}>
              Prova a ajustar el terme de cerca
            </p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}