'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  institution: string;
  logo: string;
  featuredImage?: string;
  instructorAvatar?: string;
  category: string;
  duration: number;
  level: string;
  mode: 'online' | 'presencial' | 'hibrid';
  price: number;
  originalPrice: number;
  startDate: string;
  endDate: string;
  availableSlots: number;
  totalSlots: number;
  isHighlighted: boolean;
  isFavorite: boolean;
  enrolled: number;
  rating: number;
  createdAt: string;
}

interface CourseCardProps {
  course: Course;
  viewMode: 'grid' | 'list';
}

export function CourseCard({ course, viewMode }: CourseCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleViewCourse = () => {
    router.push(`/dashboard/formacio/${course.id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(course.isFavorite ? 'Eliminar de favorits:' : 'Afegir a favorits:', course.title);
  };

  const handleEnroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Inscriure&apos;s a:', course.title);
  };

  const getModeIcon = () => {
    switch (course.mode) {
      case 'online':
        return '💻';
      case 'presencial':
        return '🏢';
      case 'hibrid':
        return '🔄';
      default:
        return '📚';
    }
  };

  const getModeText = () => {
    switch (course.mode) {
      case 'online':
        return 'En línia';
      case 'presencial':
        return 'Presencial';
      case 'hibrid':
        return 'Híbrid';
      default:
        return course.mode;
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--CourseCard-background, #ffffff)',
          border: `2px solid ${isHovered ? 'var(--CourseCard-hover-border-color, #3b82f6)' : 'var(--CourseCard-border-color, #e5e7eb)'}`,
          borderRadius: 'var(--CourseCard-border-radius-list, 12px)',
          marginBottom: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered
            ? 'var(--CourseCard-hover-shadow, 0 8px 16px -4px rgba(59, 130, 246, 0.2))'
            : 'var(--CourseCard-shadow, 0 4px 6px -1px rgba(59, 130, 246, 0.1))'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleViewCourse}
      >
        {/* Imagen solo si existe */}
        {course.featuredImage && (
          <div style={{
            width: 'var(--CourseCard-image-width-list, 140px)',
            height: 'var(--CourseCard-image-height-list, 100px)',
            backgroundImage: `url(${course.featuredImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0
          }} />
        )}

        {/* Content */}
        <div style={{
          flex: 1,
          padding: 'var(--CourseCard-padding, 16px 20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Header */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--CourseCard-title-color, #2c3e50)',
                margin: 0,
                lineHeight: '1.3'
              }}>
                {course.title}
              </h3>
              <button
                onClick={handleToggleFavorite}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginLeft: '12px'
                }}
              >
                {course.isFavorite ? '❤️' : '🤍'}
              </button>
            </div>

            <p style={{
              fontSize: '14px',
              color: 'var(--CourseCard-description-color, #6c757d)',
              margin: '0 0 12px 0',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {course.description}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <span style={{
                backgroundColor: 'var(--CourseCard-category-background, #f0f7ff)',
                color: 'var(--CourseCard-category-color, #3b82f6)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {course.category}
              </span>
              <span style={{
                fontSize: '12px',
                color: 'var(--CourseCard-meta-color, #6c757d)'
              }}>
                {getModeIcon()} {getModeText()}
              </span>
              <span style={{
                fontSize: '12px',
                color: 'var(--CourseCard-meta-color, #6c757d)'
              }}>
                ⏱️ {course.duration}h
              </span>
              <span style={{
                fontSize: '12px',
                color: 'var(--CourseCard-rating-color, #f59e0b)'
              }}>
                ⭐ {course.rating}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--CourseCard-price-color, #2c3e50)'
              }}>
                {course.price}€
                {course.originalPrice > course.price && (
                  <span style={{
                    fontSize: '14px',
                    color: 'var(--CourseCard-original-price-color, #9ca3af)',
                    textDecoration: 'line-through',
                    marginLeft: '8px',
                    fontWeight: '400'
                  }}>
                    {course.originalPrice}€
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--CourseCard-slots-color, #10b981)'
              }}>
                {course.availableSlots} places disponibles
              </div>
            </div>

            <button
              onClick={handleEnroll}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--CourseCard-enroll-button-background, #3b82f6)',
                color: 'var(--CourseCard-enroll-button-color, white)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--CourseCard-enroll-button-hover-background, #2563eb)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--CourseCard-enroll-button-background, #3b82f6)'}
            >
              Inscriure&apos;s
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      style={{
        backgroundColor: 'var(--CourseCard-background, #ffffff)',
        border: `2px solid ${isHovered ? 'var(--CourseCard-hover-border-color, #3b82f6)' : 'var(--CourseCard-border-color, #e5e7eb)'}`,
        borderRadius: 'var(--CourseCard-border-radius, 12px)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered
          ? 'var(--CourseCard-hover-shadow, 0 8px 16px -4px rgba(59, 130, 246, 0.2))'
          : 'var(--CourseCard-shadow, 0 4px 6px -1px rgba(59, 130, 246, 0.1))',
        height: '420px',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewCourse}
    >
      {/* Imagen de cabecera */}
      {course.featuredImage && (
        <div style={{
          height: 'var(--CourseCard-cover-height, 140px)',
          backgroundImage: `url(${course.featuredImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}>
          {/* Botón favorito */}
          <button
            onClick={handleToggleFavorite}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {course.isFavorite ? '❤️' : '🤍'}
          </button>

          {/* Badge de categoría */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            backgroundColor: 'var(--CourseCard-category-badge-background, rgba(59, 130, 246, 0.9))',
            color: 'var(--CourseCard-category-badge-color, white)',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '500'
          }}>
            {course.category}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div style={{
        padding: 'var(--CourseCard-content-padding, 16px)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Título */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--CourseCard-title-color, #2c3e50)',
          margin: '0 0 8px 0',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {course.title}
        </h3>

        {/* Descripción */}
        <p style={{
          fontSize: '13px',
          color: 'var(--CourseCard-description-color, #6c757d)',
          margin: '0 0 12px 0',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {course.description}
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          fontSize: '11px',
          color: 'var(--CourseCard-meta-color, #6c757d)',
          flexWrap: 'wrap'
        }}>
          <span>{getModeIcon()} {getModeText()}</span>
          <span>⏱️ {course.duration}h</span>
          <span style={{ color: 'var(--CourseCard-rating-color, #f59e0b)' }}>⭐ {course.rating}</span>
        </div>

        {/* Instructor */}
        <div style={{
          fontSize: '12px',
          color: 'var(--CourseCard-instructor-color, #6c757d)',
          marginBottom: '12px'
        }}>
          👨‍🏫 {course.instructor}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--CourseCard-price-color, #2c3e50)'
            }}>
              {course.price}€
              {course.originalPrice > course.price && (
                <span style={{
                  fontSize: '12px',
                  color: 'var(--CourseCard-original-price-color, #9ca3af)',
                  textDecoration: 'line-through',
                  marginLeft: '6px',
                  fontWeight: '400'
                }}>
                  {course.originalPrice}€
                </span>
              )}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--CourseCard-slots-color, #10b981)'
            }}>
              {course.availableSlots} places
            </div>
          </div>

          <button
            onClick={handleEnroll}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--CourseCard-enroll-button-background, #3b82f6)',
              color: 'var(--CourseCard-enroll-button-color, white)',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--CourseCard-enroll-button-hover-background, #2563eb)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--CourseCard-enroll-button-background, #3b82f6)'}
          >
            Inscriure&apos;s
          </button>
        </div>
      </div>
    </div>
  );
}
