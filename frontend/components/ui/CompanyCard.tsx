'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: number;
  name: string;
  description: string;
  sector: string;
  location: string;
  logo: string;
  coverImage: string;
  collaborationType: string;
  status: 'Activa' | 'Verificada' | 'Premium';
  contactEmail: string;
  contactPhone: string;
  website: string;
  rating: number;
  reviewsCount: number;
  certifications: string[];
  isHighlighted: boolean;
  yearEstablished: number;
  employeeCount: string;
}

interface CompanyCardProps {
  company: Company;
  viewMode: 'grid' | 'list';
}

export function CompanyCard({ company, viewMode }: CompanyCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleViewCompany = () => {
    router.push(`/dashboard/empreses/${company.id}`);
  };

  const getStatusColor = () => {
    switch (company.status) {
      case 'Premium': return '#f59e0b';
      case 'Verificada': return '#10b981';
      case 'Activa': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBg = () => {
    switch (company.status) {
      case 'Premium': return '#fef3c7';
      case 'Verificada': return '#dcfce7';
      case 'Activa': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span
          key={i}
          style={{ color: 'var(--CompanyCard-rating-color, #fbbf24)' }}
        >
          ★
        </span>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <span
          key="half"
          style={{ color: 'var(--CompanyCard-rating-color, #fbbf24)' }}
        >
          ☆
        </span>
      );
    }
    while (stars.length < 5) {
      stars.push(<span key={stars.length} style={{ color: '#e5e7eb' }}>☆</span>);
    }
    return stars;
  };

  // ==================== VISTA LIST ====================
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleViewCompany}
        style={{
          backgroundColor: 'var(--CompanyCard-background, #ffffff)',
          borderRadius: 'var(--CompanyCard-border-radius, 12px)',
          padding: 'var(--CompanyCard-padding, 20px)',
          border: `2px solid ${isHovered ? 'var(--CompanyCard-hover-border-color, #3b82f6)' : 'var(--CompanyCard-border-color, #e5e7eb)'}`,
          boxShadow: isHovered
            ? 'var(--CompanyCard-hover-shadow, 0 8px 16px -4px rgba(59, 130, 246, 0.2))'
            : 'var(--CompanyCard-shadow, 0 4px 6px -1px rgba(59, 130, 246, 0.1))',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          marginBottom: '16px',
          position: 'relative'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge de estat */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: getStatusBg(),
          color: getStatusColor(),
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          {company.status}
        </div>

        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          {/* Logo */}
          <div style={{
            width: 'var(--CompanyCard-logo-size, 80px)',
            height: 'var(--CompanyCard-logo-size, 80px)',
            borderRadius: '8px',
            backgroundImage: `url(${company.logo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
            border: '1px solid #f0f0f0'
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
                  color: 'var(--CompanyCard-title-color, #2c3e50)',
                  margin: '0 0 4px 0',
                  lineHeight: '1.3'
                }}>
                  {company.name}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--CompanyCard-sector-color, #3b82f6)',
                    fontWeight: '500'
                  }}>
                    {company.sector}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--CompanyCard-text-color, #8e8e93)'
                  }}>
                    {company.location}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--CompanyCard-text-color, #6b7280)'
                  }}>
                    {company.collaborationType}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{ display: 'flex' }}>
                  {renderStars(company.rating)}
                </div>
                <span style={{
                  fontSize: '12px',
                  color: 'var(--CompanyCard-text-color, #6b7280)',
                  marginLeft: '4px'
                }}>
                  ({company.reviewsCount})
                </span>
              </div>
            </div>

            <p style={{
              fontSize: '13px',
              color: 'var(--CompanyCard-description-color, #6c757d)',
              margin: '0 0 12px 0',
              lineHeight: '1.4',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {company.description}
            </p>

            {/* Peu: Certificacions i contacte */}
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
                {company.certifications.slice(0, 2).map((cert) => (
                  <span key={cert} style={{
                    fontSize: '10px',
                    color: 'var(--CompanyCard-badge-color, #6b7280)',
                    backgroundColor: 'var(--CompanyCard-badge-background, #f3f4f6)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {cert}
                  </span>
                ))}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '11px',
                color: 'var(--CompanyCard-text-color, #8e8e93)'
              }}>
                <span>Est. {company.yearEstablished}</span>
                <span>{company.employeeCount} empleats</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== VISTA GRID ====================
  return (
    <div
      onClick={handleViewCompany}
      style={{
        backgroundColor: 'var(--CompanyCard-background, #ffffff)',
        borderRadius: 'var(--CompanyCard-border-radius, 16px)',
        overflow: 'hidden',
        border: `2px solid ${isHovered ? 'var(--CompanyCard-hover-border-color, #3b82f6)' : 'var(--CompanyCard-border-color, #e5e7eb)'}`,
        boxShadow: isHovered
          ? 'var(--CompanyCard-hover-shadow, 0 8px 16px -4px rgba(59, 130, 246, 0.2))'
          : 'var(--CompanyCard-shadow, 0 4px 6px -1px rgba(59, 130, 246, 0.1))',
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
      {/* Badge de estat */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        backgroundColor: getStatusBg(),
        color: getStatusColor(),
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        zIndex: 1
      }}>
        {company.status}
      </div>

      {/* Badge destacat */}
      {company.isHighlighted && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'var(--CompanyCard-highlight-background, #ef4444)',
          color: 'var(--CompanyCard-highlight-color, white)',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontWeight: '600',
          zIndex: 1
        }}>
          DESTACADA
        </div>
      )}

      {/* Imatge de portada */}
      <div style={{
        height: 'var(--CompanyCard-cover-height, 120px)',
        backgroundImage: `url(${company.coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        flexShrink: 0
      }}>
        {/* Logo sobreposat */}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '16px',
          width: 'var(--CompanyCard-logo-size-grid, 40px)',
          height: 'var(--CompanyCard-logo-size-grid, 40px)',
          borderRadius: '8px',
          backgroundImage: `url(${company.logo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }} />
      </div>

      {/* Contingut */}
      <div style={{
        padding: 'var(--CompanyCard-content-padding, 28px 16px 16px 16px)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sector i ubicació */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            color: 'var(--CompanyCard-sector-color, #3b82f6)',
            fontWeight: '500'
          }}>
            {company.sector}
          </span>
          <span style={{
            fontSize: '11px',
            color: 'var(--CompanyCard-text-color, #8e8e93)'
          }}>
            {company.location}
          </span>
        </div>

        {/* Nom de l'empresa */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--CompanyCard-title-color, #2c3e50)',
          margin: '0 0 4px 0',
          lineHeight: '1.3',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {company.name}
        </h3>

        {/* Tipus de col·laboració */}
        <div style={{
          fontSize: '11px',
          color: 'var(--CompanyCard-text-color, #6b7280)',
          marginBottom: '8px'
        }}>
          {company.collaborationType}
        </div>

        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex' }}>
            {renderStars(company.rating)}
          </div>
          <span style={{
            fontSize: '11px',
            color: 'var(--CompanyCard-text-color, #6b7280)',
            marginLeft: '4px'
          }}>
            ({company.reviewsCount})
          </span>
        </div>

        {/* Descripció */}
        <p style={{
          fontSize: '12px',
          color: 'var(--CompanyCard-description-color, #6c757d)',
          lineHeight: '1.4',
          margin: '0 0 12px 0',
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {company.description}
        </p>

        {/* Peu: Certificacions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            gap: '4px'
          }}>
            {company.certifications.slice(0, 2).map((cert) => (
              <span key={cert} style={{
                fontSize: '9px',
                color: 'var(--CompanyCard-badge-color, #6b7280)',
                backgroundColor: 'var(--CompanyCard-badge-background, #f3f4f6)',
                padding: '2px 4px',
                borderRadius: '3px'
              }}>
                {cert}
              </span>
            ))}
          </div>

          <div style={{
            fontSize: '10px',
            color: 'var(--CompanyCard-text-color, #8e8e93)'
          }}>
            Est. {company.yearEstablished}
          </div>
        </div>
      </div>
    </div>
  );
}
