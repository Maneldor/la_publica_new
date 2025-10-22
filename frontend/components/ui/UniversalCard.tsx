/*
 * ⚠️  CORE ARCHITECTURE - DO NOT MODIFY ⚠️
 *
 * Universal Card Component - Flexible 3-zone card system for consistent UI.
 *
 * CRITICAL STRUCTURE:
 * - Top Zone: Visual area (gradient, image, icon, solid color)
 * - Middle Zone: Content area (title, description, metadata, stats)
 * - Bottom Zone: Action area (buttons, secondary stats)
 *
 * PROTECTED ELEMENTS:
 * - Three-zone architecture and props interface
 * - Height configurations: compact (60px), default (320px)
 * - Width controls and overflow management
 * - Responsive variants: default, compact, horizontal
 * - Consistent styling and spacing system
 *
 * ⚠️  MODIFICATION GUIDELINES:
 * - DO NOT change height values without testing all implementations
 * - DO NOT modify the three-zone structure
 * - DO NOT alter overflow and width control logic
 * - Only add new variants or props if explicitly needed
 * - Test with both statistics cards and content cards after changes
 * - Ensure consistent behavior across all dashboard pages
 *
 * CURRENT USAGE:
 * - Statistics cards (compact variant, 60px height)
 * - Blog content cards (default variant, 320px height)
 * - All dashboard pages via PageTemplate component
 *
 * Last modified: 2025-10-07 | Version: 1.0 | Status: PROTECTED
 */

'use client';

import { ReactNode } from 'react';

// Tipos para las diferentes configuraciones de tarjeta
export interface UniversalCardProps {
  // ZONA SUPERIOR - Imagen/Visual
  topZone?: {
    type?: 'gradient' | 'solid' | 'image' | 'icon';
    value?: string; // URL para imagen, color para solid, gradiente para gradient
    height?: number;
    icon?: string; // Para cuando es tipo icon
    badge?: {
      text: string;
      color?: string;
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    };
  };

  // ZONA MEDIA - Datos/Contenido
  middleZone?: {
    title?: string;
    subtitle?: string;
    description?: string;
    content?: ReactNode; // Contenido personalizado que anula otros elementos

    // Metadatos opcionales
    metadata?: {
      avatar?: {
        src?: string;
        text?: string;
        size?: 'sm' | 'md' | 'lg';
      };
      author?: string;
      date?: string;
    };

    // Estadísticas opcionales
    stats?: Array<{
      icon?: string;
      label: string;
      value: string | number;
      trend?: string;
    }>;
  };

  // ZONA INFERIOR - Acción/Botón
  bottomZone?: {
    primaryAction?: {
      text: string;
      onClick?: () => void;
      style?: 'button' | 'link';
    };
    secondaryAction?: {
      text: string;
      onClick?: () => void;
    };
    stats?: Array<{
      icon?: string;
      value: string | number;
    }>;
  };

  // Configuración general
  variant?: 'default' | 'compact' | 'horizontal';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function UniversalCard({
  topZone,
  middleZone,
  bottomZone,
  variant = 'default',
  padding = 'md',
  onClick,
  className = ''
}: UniversalCardProps) {

  // Estilos base de la tarjeta
  const baseCardStyles = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: variant === 'horizontal' ? 'flex' : 'flex',
    flexDirection: variant === 'horizontal' ? 'row' as const : 'column' as const,
    height: '100%',
    width: '100%',
    maxWidth: variant === 'compact' ? '320px' : '100%',  // Limitar ancho para tarjetas compactas
    minHeight: variant === 'compact' ? '40px' : (middleZone?.content ? 'auto' : '320px') // Auto si hay contenido personalizado
  };

  const paddingMap = {
    none: '0',
    sm: '12px',
    md: '16px',
    lg: '20px'
  };

  // ZONA SUPERIOR - Renderizado
  const renderTopZone = () => {
    if (!topZone) return null;

    const height = topZone.height || (variant === 'compact' ? 40 : 120);

    const backgroundStyle: React.CSSProperties = {};
    let content = null;

    // Configurar el fondo según el tipo
    if (topZone.type === 'gradient') {
      backgroundStyle.background = topZone.value || 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    } else if (topZone.type === 'solid') {
      backgroundStyle.backgroundColor = topZone.value || '#3b82f6';
    } else if (topZone.type === 'image') {
      backgroundStyle.backgroundImage = `url(${topZone.value})`;
      backgroundStyle.backgroundSize = 'cover';
      backgroundStyle.backgroundPosition = 'center';
    } else if (topZone.type === 'icon') {
      backgroundStyle.backgroundColor = '#f3f4f6';
      content = (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          {topZone.icon || '📊'}
        </div>
      );
    }

    return (
      <div style={{
        height: variant === 'horizontal' ? '100%' : `${height}px`,
        width: variant === 'horizontal' ? `${height}px` : '100%',
        maxWidth: '100%',  // Evitar que se desborde
        position: 'relative',
        flexShrink: 0,
        ...backgroundStyle
      }}>
        {content}

        {/* Badge opcional */}
        {topZone.badge && (
          <div style={{
            position: 'absolute',
            ...(topZone.badge.position === 'top-left' && { top: '12px', left: '12px' }),
            ...(topZone.badge.position === 'top-right' && { top: '12px', right: '12px' }),
            ...(topZone.badge.position === 'bottom-left' && { bottom: '12px', left: '12px' }),
            ...(topZone.badge.position === 'bottom-right' && { bottom: '12px', right: '12px' }),
            backgroundColor: topZone.badge.color || '#3b82f6',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {topZone.badge.text}
          </div>
        )}
      </div>
    );
  };

  // ZONA MEDIA - Renderizado
  const renderMiddleZone = () => {
    if (!middleZone) return null;

    const renderAvatar = () => {
      if (!middleZone.metadata?.avatar) return null;

      const sizeMap = { sm: 24, md: 32, lg: 40 };
      const size = sizeMap[middleZone.metadata.avatar.size || 'md'];

      return (
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: middleZone.metadata.avatar.src ? 'transparent' : '#3b82f6',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size === 24 ? '10px' : size === 40 ? '14px' : '12px',
          fontWeight: '600',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {middleZone.metadata.avatar.src ? (
            <img
              src={middleZone.metadata.avatar.src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            middleZone.metadata.avatar.text || '?'
          )}
        </div>
      );
    };

    return (
      <div style={{
        padding: paddingMap[padding],
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',  // Evitar desbordamiento horizontal
        overflow: 'hidden', // Ocultar cualquier contenido que se desborde
        boxSizing: 'border-box'
      }}>
        {/* Contenido personalizado - anula todo lo demás */}
        {middleZone.content ? (
          middleZone.content
        ) : (
          <>
            {/* Título y descripción */}
            {(middleZone.title || middleZone.subtitle || middleZone.description) && (
          <>
            {middleZone.title && (
              <h3 style={{
                fontSize: variant === 'compact' ? '14px' : '16px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '8px',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {middleZone.title}
              </h3>
            )}

            {middleZone.subtitle && (
              <p style={{
                fontSize: '12px',
                color: '#6c757d',
                marginBottom: '4px'
              }}>
                {middleZone.subtitle}
              </p>
            )}

            {middleZone.description && (
              <p style={{
                fontSize: '14px',
                color: '#6c757d',
                lineHeight: '1.5',
                marginBottom: '12px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {middleZone.description}
              </p>
            )}
          </>
        )}

        {/* Metadatos (Avatar, Author, Date) */}
        {middleZone.metadata && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: 'auto',
            paddingTop: '8px'
          }}>
            {renderAvatar()}
            {(middleZone.metadata.author || middleZone.metadata.date) && (
              <div>
                {middleZone.metadata.author && (
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#2c3e50' }}>
                    {middleZone.metadata.author}
                  </div>
                )}
                {middleZone.metadata.date && (
                  <div style={{ fontSize: '10px', color: '#6c757d' }}>
                    {middleZone.metadata.date}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Estadísticas en zona media (para tarjetas compactas) */}
        {variant === 'compact' && middleZone.stats && middleZone.stats[0] && (
          <div style={{
            marginTop: 'auto',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6c757d',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {middleZone.stats[0].label}
              </h3>
              {middleZone.stats[0].trend && (
                <span style={{
                  fontSize: '12px',
                  color: '#28a745',
                  fontWeight: '600',
                  marginLeft: '8px',
                  flexShrink: 0
                }}>
                  {middleZone.stats[0].trend}
                </span>
              )}
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#2c3e50'
            }}>
              {middleZone.stats[0].value}
            </div>
          </div>
        )}
          </>
        )}
      </div>
    );
  };

  // ZONA INFERIOR - Renderizado
  const renderBottomZone = () => {
    if (!bottomZone) return null;

    return (
      <div style={{
        padding: `0 ${paddingMap[padding]} ${paddingMap[padding]}`,
        borderTop: '1px solid #e9ecef',
        marginTop: 'auto',
        width: '100%',
        maxWidth: '100%',  // Evitar desbordamiento
        boxSizing: 'border-box' // Incluir padding en el ancho total
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px'
        }}>
          {/* Stats en zona inferior */}
          {bottomZone.stats && (
            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '12px',
              color: '#6c757d'
            }}>
              {bottomZone.stats.map((stat, index) => (
                <span key={index}>
                  {stat.icon && <span>{stat.icon} </span>}
                  {stat.value}
                </span>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            {bottomZone.secondaryAction && (
              <button style={{
                fontSize: '12px',
                color: '#6c757d',
                fontWeight: '500',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                padding: '4px 8px'
              }} onClick={(e) => {
                e.stopPropagation();
                bottomZone.secondaryAction?.onClick?.();
              }}>
                {bottomZone.secondaryAction.text}
              </button>
            )}

            {bottomZone.primaryAction && (
              <button style={{
                fontSize: '12px',
                color: '#3b82f6',
                fontWeight: '500',
                border: bottomZone.primaryAction.style === 'button' ? '1px solid #3b82f6' : 'none',
                backgroundColor: bottomZone.primaryAction.style === 'button' ? '#3b82f6' : 'transparent',
                color: bottomZone.primaryAction.style === 'button' ? 'white' : '#3b82f6',
                borderRadius: '6px',
                padding: bottomZone.primaryAction.style === 'button' ? '6px 12px' : '4px 8px',
                cursor: 'pointer'
              }} onClick={(e) => {
                e.stopPropagation();
                bottomZone.primaryAction?.onClick?.();
              }}>
                {bottomZone.primaryAction.text}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={baseCardStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }
      }}
    >
      {renderTopZone()}
      {renderMiddleZone()}
      {renderBottomZone()}
    </div>
  );
}