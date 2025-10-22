'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Anunci {
  id: number;
  title: string;
  description: string;
  type: 'oferta' | 'demanda';
  category: string;
  price: number;
  priceType: 'fix' | 'negociable' | 'gratuït';
  location: string;
  images: string[];
  author: string;
  authorAvatar: string;
  authorDepartment: string;
  contactPhone: string;
  contactEmail: string;
  status: 'actiu' | 'reservat' | 'tancat' | 'caducat';
  createdAt: string;
  expiresAt: string;
  views: number;
  favorites: number;
  isFavorite: boolean;
}

interface AnunciCardProps {
  anunci: Anunci;
  viewMode: 'grid' | 'list';
}

export function AnunciCard({ anunci, viewMode }: AnunciCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleViewAnunci = () => {
    router.push(`/dashboard/anuncis/${anunci.id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(anunci.isFavorite ? 'Eliminar de favorits:' : 'Afegir a favorits:', anunci.title);
  };

  const getPriceDisplay = () => {
    if (anunci.priceType === 'gratuït') return 'Gratuït';
    const price = anunci.price.toLocaleString('ca-ES');
    const suffix = anunci.priceType === 'negociable' ? ' (Negociable)' : '';
    return `${price}€${suffix}`;
  };

  const getStatusColor = () => {
    switch (anunci.status) {
      case 'actiu': return '#10b981';
      case 'reservat': return '#f59e0b';
      case 'tancat': return '#6b7280';
      case 'caducat': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeStyle = () => {
    return anunci.type === 'oferta'
      ? { bg: '#dcfce7', color: '#16a34a', label: 'OFERTA' }
      : { bg: '#dbeafe', color: '#2563eb', label: 'DEMANDA' };
  };

  if (viewMode === 'list') {
    const typeStyle = getTypeStyle();

    return (
      <div
        onClick={handleViewAnunci}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
          boxShadow: isHovered ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          marginBottom: '16px',
          position: 'relative'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge de tipus */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: typeStyle.bg,
          color: typeStyle.color,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          {typeStyle.label}
        </div>

        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          {/* Imatge */}
          <div style={{
            width: '120px',
            height: '80px',
            borderRadius: '8px',
            backgroundImage: `url(${anunci.images[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0
          }} />

          {/* Contingut */}
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
                  {anunci.title}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#3b82f6',
                    fontWeight: '500'
                  }}>
                    {anunci.category}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#8e8e93'
                  }}>
                    {anunci.location}
                  </span>
                </div>
              </div>

              {/* Preu */}
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#16a34a'
              }}>
                {getPriceDisplay()}
              </div>
            </div>

            <p style={{
              fontSize: '13px',
              color: '#6c757d',
              margin: '0 0 12px 0',
              lineHeight: '1.4',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical' as const,
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
              maxHeight: '2.8em'
            }}>
              {anunci.description}
            </p>

            {/* Autor i estadístiques */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundImage: `url(${anunci.authorAvatar})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <span style={{
                  fontSize: '12px',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>
                  {anunci.author} · {anunci.authorDepartment}
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '11px',
                color: '#8e8e93'
              }}>
                <span>{anunci.views} visites</span>
                <span>{anunci.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista Grid
  const typeStyle = getTypeStyle();

  return (
    <div
      onClick={handleViewAnunci}
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        boxShadow: isHovered ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        height: '380px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge de tipus */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        backgroundColor: typeStyle.bg,
        color: typeStyle.color,
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        zIndex: 1
      }}>
        {typeStyle.label}
      </div>

      {/* Botó favorit */}
      <button
        onClick={handleToggleFavorite}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '6px',
          backgroundColor: anunci.isFavorite ? '#ef4444' : 'rgba(255,255,255,0.9)',
          color: anunci.isFavorite ? 'white' : '#6b7280',
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

      {/* Imatge principal */}
      <div style={{
        height: '160px',
        backgroundImage: `url(${anunci.images[0]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        flexShrink: 0
      }}>
        {/* Comptador d'imatges */}
        {anunci.images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500'
          }}>
            📷 {anunci.images.length}
          </div>
        )}
      </div>

      {/* Contingut */}
      <div style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Categoria i ubicació */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#3b82f6',
            fontWeight: '500'
          }}>
            {anunci.category}
          </span>
          <span style={{
            fontSize: '11px',
            color: '#8e8e93'
          }}>
            📍 {anunci.location}
          </span>
        </div>

        {/* Títol */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#2c3e50',
          margin: '0 0 8px 0',
          lineHeight: '1.3',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical' as const,
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          maxHeight: '2.6em'
        }}>
          {anunci.title}
        </h3>

        {/* Preu */}
        <div style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#16a34a',
          marginBottom: '8px'
        }}>
          {getPriceDisplay()}
        </div>

        {/* Descripció */}
        <p style={{
          fontSize: '13px',
          color: '#6c757d',
          lineHeight: '1.4',
          margin: '0 0 12px 0',
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical' as const,
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          maxHeight: '2.8em'
        }}>
          {anunci.description}
        </p>

        {/* Peu: Autor i estat */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundImage: `url(${anunci.authorAvatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
            <span style={{
              fontSize: '11px',
              color: '#6c757d',
              fontWeight: '500'
            }}>
              {anunci.author}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              fontSize: '10px',
              color: '#8e8e93'
            }}>
              {anunci.views} visites
            </span>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getStatusColor()
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}