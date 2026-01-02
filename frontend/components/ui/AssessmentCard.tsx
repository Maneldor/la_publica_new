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
      case 'Premium': return {
        bg: 'var(--AssessmentCard-plan-premium-bg, #f59e0b)',
        color: 'var(--AssessmentCard-plan-premium-color, white)'
      };
      case 'Estàndard': return {
        bg: 'var(--AssessmentCard-plan-standard-bg, #10b981)',
        color: 'var(--AssessmentCard-plan-standard-color, white)'
      };
      case 'Bàsic': return {
        bg: 'var(--AssessmentCard-plan-basic-bg, #6b7280)',
        color: 'var(--AssessmentCard-plan-basic-color, white)'
      };
      default: return {
        bg: 'var(--AssessmentCard-plan-default-bg, #6b7280)',
        color: 'var(--AssessmentCard-plan-default-color, white)'
      };
    }
  };

  if (viewMode === 'list') {
    const planBadge = getPlanBadgeColor();

    return (
      <div
        onClick={handleViewAssessment}
        style={{
          backgroundColor: 'var(--AssessmentCard-background, #ffffff)',
          borderRadius: 'var(--AssessmentCard-border-radius-list, 12px)',
          padding: 'var(--AssessmentCard-padding, 20px)',
          border: `2px solid ${isHovered ? 'var(--AssessmentCard-hover-border-color, #3b82f6)' : 'var(--AssessmentCard-border-color, #e5e7eb)'}`,
          boxShadow: isHovered
            ? 'var(--AssessmentCard-hover-shadow, 0 8px 16px -4px rgba(59, 130, 246, 0.2))'
            : 'var(--AssessmentCard-shadow, 0 4px 6px -1px rgba(59, 130, 246, 0.1))',
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
            backgroundColor: 'var(--AssessmentCard-highlighted-background, #3b82f6)',
            color: 'var(--AssessmentCard-highlighted-color, white)',
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
            width: 'var(--AssessmentCard-image-width-list, 120px)',
            height: 'var(--AssessmentCard-image-height-list, 80px)',
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
                  color: 'var(--AssessmentCard-title-color, #2c3e50)',
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
                    color: 'var(--AssessmentCard-type-color, #3b82f6)',
                    fontWeight: '500'
                  }}>
                    {assessment.type}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--AssessmentCard-meta-color, #8e8e93)'
                  }}>
                    {getModeIcon()} {getModeText()}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--AssessmentCard-duration-color, #f59e0b)'
                  }}>
                    {assessment.duration} min
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: assessment.availableSlots > 0
                      ? 'var(--AssessmentCard-slots-available-color, #10b981)'
                      : 'var(--AssessmentCard-slots-full-color, #ef4444)'
                  }}>
                    {assessment.availableSlots > 0 ? `${assessment.availableSlots} places` : 'Complet'}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--AssessmentCard-rating-color, #f59e0b)',
                  fontWeight: '600'
                }}>
                  ⭐ {assessment.rating}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--AssessmentCard-meta-color, #8e8e93)'
                }}>
                  ({assessment.totalBooked} consultes)
                </div>
              </div>
            </div>

            <p style={{
              fontSize: '13px',
              color: 'var(--AssessmentCard-description-color, #6c757d)',
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
                  width: 'var(--AssessmentCard-avatar-size, 24px)',
                  height: 'var(--AssessmentCard-avatar-size, 24px)',
                  borderRadius: '50%',
                  backgroundImage: `url(${assessment.company.logo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <span style={{
                  fontSize: '12px',
                  color: 'var(--AssessmentCard-company-color, #6c757d)',
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
                    backgroundColor: assessment.isFavorite
                      ? 'var(--AssessmentCard-favorite-active-background, #ef4444)'
                      : 'transparent',
                    color: assessment.isFavorite
                      ? 'var(--AssessmentCard-favorite-active-color, white)'
                      : 'var(--AssessmentCard-favorite-color, #6b7280)',
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
                  color: 'var(--AssessmentCard-meta-color, #8e8e93)'
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

  // Vista Grid
  const planBadge = getPlanBadgeColor();

  return (
    <div
      onClick={handleViewAssessment}
      style={{
        backgroundColor: 'var(--AssessmentCard-background, #ffffff)',
        borderRadius: 'var(--AssessmentCard-border-radius, 16px)',
        overflow: 'hidden',
        border: `2px solid ${isHovered ? 'var(--AssessmentCard-hover-border-color, #3b82f6)' : 'var(--AssessmentCard-border-color, #e5e7eb)'}`,
        boxShadow: isHovered
          ? 'var(--AssessmentCard-hover-shadow, 0 8px 16px -4px rgba(59, 130, 246, 0.2))'
          : 'var(--AssessmentCard-shadow, 0 4px 6px -1px rgba(59, 130, 246, 0.1))',
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
          backgroundColor: 'var(--AssessmentCard-highlighted-background, #3b82f6)',
          color: 'var(--AssessmentCard-highlighted-color, white)',
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
          backgroundColor: assessment.isFavorite
            ? 'var(--AssessmentCard-favorite-active-background, #ef4444)'
            : 'rgba(255,255,255,0.9)',
          color: assessment.isFavorite
            ? 'var(--AssessmentCard-favorite-active-color, white)'
            : 'var(--AssessmentCard-favorite-color, #6b7280)',
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
        height: 'var(--AssessmentCard-cover-height, 120px)',
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
          backgroundColor: assessment.availableSlots > 0
            ? 'var(--AssessmentCard-slots-badge-available-bg, rgba(16, 185, 129, 0.9))'
            : 'var(--AssessmentCard-slots-badge-full-bg, rgba(239, 68, 68, 0.9))',
          color: 'var(--AssessmentCard-slots-badge-color, white)',
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
        padding: 'var(--AssessmentCard-content-padding, 16px)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Tipo */}
        <span style={{
          fontSize: '12px',
          color: 'var(--AssessmentCard-type-color, #3b82f6)',
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          {assessment.type}
        </span>

        {/* Título */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--AssessmentCard-title-color, #2c3e50)',
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
          color: 'var(--AssessmentCard-meta-color, #8e8e93)'
        }}>
          <span>{getModeIcon()} {getModeText()}</span>
          <span>•</span>
          <span>{assessment.duration} min</span>
          <span>•</span>
          <span style={{ color: 'var(--AssessmentCard-rating-color, #f59e0b)' }}>⭐ {assessment.rating}</span>
        </div>

        {/* Footer: Solo empresa */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: 'auto'
        }}>
          <div style={{
            width: 'var(--AssessmentCard-avatar-size, 24px)',
            height: 'var(--AssessmentCard-avatar-size, 24px)',
            borderRadius: '50%',
            backgroundImage: `url(${assessment.company.logo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
          <span style={{
            fontSize: '12px',
            color: 'var(--AssessmentCard-company-color, #6c757d)',
            fontWeight: '500'
          }}>
            {assessment.company.name}
          </span>
        </div>
      </div>
    </div>
  );
}
