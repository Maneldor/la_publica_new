'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: number;
  name: string;
  logo: string;
  plan: string;
}

interface Assessment {
  id: number;
  slug?: string;
  title: string;
  description: string;
  company: Company;
  type: string;
  category: string;
  duration: number;
  mode: 'presencial' | 'online' | 'hibrid';
  images: string[];
  availableSlots: number;
  isHighlighted: boolean;
  isFavorite: boolean;
  totalBooked: number;
  rating: number;
  createdAt: string;
  requirements: string;
}

interface AssessmentCardProps {
  assessment: Assessment;
  viewMode: 'grid' | 'list';
}

export function AssessmentCard({ assessment, viewMode }: AssessmentCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleViewAssessment = () => {
    // Usar slug si está disponible, si no, usar id
    const identifier = assessment.slug || assessment.id;
    router.push(`/dashboard/assessorament/${identifier}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(assessment.isFavorite ? 'Eliminar de favorits:' : 'Afegir a favorits:', assessment.title);
  };

  const getModeIcon = () => {
    switch (assessment.mode) {
      case 'presencial': return '🏢';
      case 'online': return '💻';
      case 'hibrid': return '🔄';
      default: return '📋';
    }
  };

  const getModeText = () => {
    switch (assessment.mode) {
      case 'presencial': return 'Presencial';
      case 'online': return 'Online';
      case 'hibrid': return 'Híbrid';
      default: return assessment.mode;
    }
  };

  const getPlanBadgeColor = () => {
    switch (assessment.company.plan) {
      case 'Premium': return { bg: '#f59e0b', color: 'white' };
      case 'Estàndard': return { bg: '#10b981', color: 'white' };
      case 'Bàsic': return { bg: '#6b7280', color: 'white' };
      default: return { bg: '#6b7280', color: 'white' };
    }
  };

  if (viewMode === 'list') {
    const planBadge = getPlanBadgeColor();

    return (
      <div
        onClick={handleViewAssessment}
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
        {/* Badge destacado */}
        {assessment.isHighlighted && (
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
          {/* Imagen */}
          <div style={{
            width: '120px',
            height: '80px',
            borderRadius: '8px',
            backgroundImage: `url(${assessment.images[0]})`,
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
                  {assessment.title}
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
                    {assessment.type}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#8e8e93'
                  }}>
                    {getModeIcon()} {getModeText()}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#f59e0b'
                  }}>
                    {assessment.duration} min
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: assessment.availableSlots > 0 ? '#10b981' : '#ef4444'
                  }}>
                    {assessment.availableSlots > 0 ? `${assessment.availableSlots} places` : 'Complet'}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '14px',
                  color: '#f59e0b',
                  fontWeight: '600'
                }}>
                  ⭐ {assessment.rating}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#8e8e93'
                }}>
                  ({assessment.totalBooked} consultes)
                </div>
              </div>
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
              {assessment.description}
            </p>

            {/* Footer: Empresa y acciones */}
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
                  backgroundImage: `url(${assessment.company.logo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <span style={{
                  fontSize: '12px',
                  color: '#6c757d',
                  fontWeight: '500'
                }}>
                  {assessment.company.name}
                </span>
                <span style={{
                  fontSize: '10px',
                  backgroundColor: planBadge.bg,
                  color: planBadge.color,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  {assessment.company.plan}
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <button
                  onClick={handleToggleFavorite}
                  style={{
                    padding: '4px',
                    backgroundColor: assessment.isFavorite ? '#ef4444' : 'transparent',
                    color: assessment.isFavorite ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ♥
                </button>
                <span style={{
                  fontSize: '11px',
                  color: '#8e8e93'
                }}>
                  {assessment.createdAt}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista Grid - simplificada
  const planBadge = getPlanBadgeColor();

  return (
    <div
      onClick={handleViewAssessment}
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        boxShadow: isHovered ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        cursor: 'pointer',
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
      {assessment.isHighlighted && (
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
          backgroundColor: assessment.isFavorite ? '#ef4444' : 'rgba(255,255,255,0.9)',
          color: assessment.isFavorite ? 'white' : '#6b7280',
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

      {/* Imagen principal */}
      <div style={{
        height: '120px',
        backgroundImage: `url(${assessment.images[0]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        flexShrink: 0
      }}>
        {/* Disponibilidad */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          backgroundColor: assessment.availableSlots > 0 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          {assessment.availableSlots > 0 ? `${assessment.availableSlots} places` : 'Complet'}
        </div>
      </div>

      {/* Contenido */}
      <div style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Tipo */}
        <span style={{
          fontSize: '12px',
          color: '#3b82f6',
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          {assessment.type}
        </span>

        {/* Título */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#2c3e50',
          margin: '0 0 12px 0',
          lineHeight: '1.3',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          flex: 1
        }}>
          {assessment.title}
        </h3>

        {/* Info básica */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          fontSize: '12px',
          color: '#8e8e93'
        }}>
          <span>{getModeIcon()} {getModeText()}</span>
          <span>•</span>
          <span>{assessment.duration} min</span>
          <span>•</span>
          <span style={{ color: '#f59e0b' }}>⭐ {assessment.rating}</span>
        </div>

        {/* Footer: Solo empresa */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: 'auto'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundImage: `url(${assessment.company.logo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
          <span style={{
            fontSize: '12px',
            color: '#6c757d',
            fontWeight: '500'
          }}>
            {assessment.company.name}
          </span>
        </div>
      </div>
    </div>
  );
}