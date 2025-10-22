'use client';

import { useState } from 'react';

interface Link {
  id: number;
  name: string;
  slogan: string;
  logo: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  isHighlighted: boolean;
  isFavorite: boolean;
  totalVisits: number;
  createdAt: string;
}

interface LinkCardProps {
  link: Link;
  viewMode: 'grid' | 'list';
}

export function LinkCard({ link, viewMode }: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleVisitWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(link.website, '_blank', 'noopener,noreferrer');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(link.isFavorite ? 'Eliminar de favorits:' : 'Afegir a favorits:', link.name);
  };


  if (viewMode === 'list') {
    return (
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
          boxShadow: isHovered ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
          cursor: 'default',
          transition: 'all 0.2s ease-in-out',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          marginBottom: '16px',
          position: 'relative'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge destacado */}
        {link.isHighlighted && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            DESTACAT
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          {/* Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            backgroundImage: `url(${link.logo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
            border: '1px solid #f0f0f0'
          }} />

          {/* Contenido */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  margin: '0 0 4px 0',
                  lineHeight: '1.3'
                }}>
                  {link.name}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#3b82f6',
                  margin: '0 0 8px 0',
                  fontStyle: 'italic'
                }}>
                  {link.slogan}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    {link.category}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#8e8e93'
                  }}>
                    {link.totalVisits} visites
                  </span>
                </div>
              </div>

              {/* Botón favorito */}
              <button
                onClick={handleToggleFavorite}
                style={{
                  padding: '4px',
                  backgroundColor: link.isFavorite ? '#ef4444' : 'transparent',
                  color: link.isFavorite ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                ♥
              </button>
            </div>

            <p style={{
              fontSize: '13px',
              color: '#6c757d',
              margin: '0 0 12px 0',
              lineHeight: '1.4',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {link.description}
            </p>

            {/* Footer: Contacto y botón */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <span style={{
                  fontSize: '12px',
                  color: '#6c757d'
                }}>
                  Tel: {link.phone}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#6c757d'
                }}>
                  {link.email}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: '#8e8e93'
                }}>
                  {link.createdAt}
                </span>
              </div>

              <button
                onClick={handleVisitWebsite}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Accedir a la web
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista Grid - simplificada
  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        boxShadow: isHovered ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        cursor: 'default',
        transition: 'all 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        height: '320px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge destacado */}
      {link.isHighlighted && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: '600',
          zIndex: 1
        }}>
          DESTACAT
        </div>
      )}

      {/* Botón favorito */}
      <button
        onClick={handleToggleFavorite}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '6px',
          backgroundColor: link.isFavorite ? '#ef4444' : 'rgba(255,255,255,0.9)',
          color: link.isFavorite ? 'white' : '#6b7280',
          border: 'none',
          borderRadius: '50%',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          zIndex: 1,
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ♥
      </button>

      {/* Logo principal */}
      <div style={{
        height: '120px',
        backgroundImage: `url(${link.logo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        flexShrink: 0
      }}>
        {/* Categoría */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          {link.category}
        </div>
      </div>

      {/* Contenido */}
      <div style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Nombre */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#2c3e50',
          margin: '0 0 6px 0',
          lineHeight: '1.3',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {link.name}
        </h3>

        {/* Slogan */}
        <p style={{
          fontSize: '12px',
          color: '#3b82f6',
          margin: '0 0 12px 0',
          fontStyle: 'italic',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          flex: 1
        }}>
          {link.slogan}
        </p>

        {/* Contacto y botón */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: 'auto'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6c757d'
          }}>
            <div>Tel: {link.phone}</div>
            <div>{link.email}</div>
          </div>

          <button
            onClick={handleVisitWebsite}
            style={{
              padding: '8px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            Accedir a la web
          </button>
        </div>
      </div>
    </div>
  );
}