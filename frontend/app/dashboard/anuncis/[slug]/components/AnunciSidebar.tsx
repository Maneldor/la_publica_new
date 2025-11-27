'use client';

import { Heart, MessageCircle, Phone, Mail, Bookmark, BookmarkCheck, Share2, MapPin, Package, Eye, Calendar, Clock, Shield, Flag } from 'lucide-react';

// Props interface
export interface AnunciSidebarProps {
  anunci: {
    type: string;
    category: string;
    title: string;
    images: string[];
    description: string;
    contactPhone: string;
    contactEmail: string;
    location: string;
    shippingAvailable: boolean;
    handPickup: boolean;
    views: number;
    createdAt: string;
    expiresAt: string;
  };
  priceDisplay: string;
  typeStyle: {
    bg: string;
    color: string;
    label: string;
  };
  isGuardat: boolean;
  isLoadingGuardat: boolean;
  onContactClick: () => void;
  onPhoneClick?: () => void;
  onEmailClick?: () => void;
  onShareClick: () => void;
  onReportClick: () => void;
  onToggleGuardar: (data?: { titol: string; imatge: string; url: string; description: string }) => void;
  onSecurityTipsClick?: () => void;
  slug: string;
}

export function AnunciSidebar({
  anunci,
  priceDisplay,
  typeStyle,
  isGuardat,
  isLoadingGuardat,
  onContactClick,
  onPhoneClick,
  onEmailClick,
  onShareClick,
  onReportClick,
  onToggleGuardar,
  onSecurityTipsClick,
  slug
}: AnunciSidebarProps) {
  const handlePhoneClick = () => {
    if (onPhoneClick) {
      onPhoneClick();
    }
  };

  const handleEmailClick = () => {
    if (onEmailClick) {
      onEmailClick();
    }
  };

  const handleSecurityTipsClick = () => {
    if (onSecurityTipsClick) {
      onSecurityTipsClick();
    }
  };

  return (
    <div className="sticky top-24 space-y-6 lg:sticky lg:top-24">
      {/* Preu i badges */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '8px',
              backgroundColor: typeStyle.bg,
              color: typeStyle.color
            }}>
              {typeStyle.label}
            </div>
            <div style={{
              display: 'inline-block',
              fontSize: '14px',
              color: '#2563eb',
              backgroundColor: '#dbeafe',
              padding: '4px 8px',
              borderRadius: '6px',
              marginLeft: '8px'
            }}>
              {anunci.category}
            </div>
          </div>
        </div>

        <div style={{
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '24px',
          color: anunci.type === 'oferta' ? '#16a34a' : '#2563eb'
        }}>
          {priceDisplay}
        </div>

        {/* Botons d'acció */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onContactClick}
            style={{
              width: '100%',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <MessageCircle style={{ width: '16px', height: '16px' }} />
            <span>Contactar vendedor</span>
          </button>

          {/* Contacto directo */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <a
              href={`tel:${anunci.contactPhone}`}
              onClick={handlePhoneClick}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #10b981',
                backgroundColor: '#ecfdf5',
                color: '#10b981',
                fontWeight: '500',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Phone style={{ width: '16px', height: '16px' }} />
              <span>Trucar</span>
            </a>
            <a
              href={`mailto:${anunci.contactEmail}?subject=Interessat en: ${anunci.title}&body=Hola,%0D%0A%0D%0AEstic interessat en l'anunci "${anunci.title}".%0D%0APots donar-me més informació?%0D%0A%0D%0AGràcies!`}
              onClick={handleEmailClick}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #f59e0b',
                backgroundColor: '#fffbeb',
                color: '#f59e0b',
                fontWeight: '500',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Mail style={{ width: '16px', height: '16px' }} />
              <span>Email</span>
            </a>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onToggleGuardar({
                titol: anunci?.title || '',
                imatge: anunci?.images[0] || '',
                url: `/dashboard/anuncis/${slug}`,
                description: anunci?.description.substring(0, 100) + '...' || ''
              })}
              disabled={isLoadingGuardat}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${isGuardat ? '#3b82f6' : '#e5e7eb'}`,
                backgroundColor: isGuardat ? '#dbeafe' : '#f9fafb',
                color: isGuardat ? '#2563eb' : '#6b7280',
                fontWeight: '500',
                cursor: isLoadingGuardat ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoadingGuardat ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isGuardat ? (
                <BookmarkCheck style={{ width: '16px', height: '16px' }} />
              ) : (
                <Bookmark style={{ width: '16px', height: '16px' }} />
              )}
              <span>
                {isLoadingGuardat ? 'Carregant...' : isGuardat ? 'Guardat' : 'Guardar'}
              </span>
            </button>
            <button
              onClick={onShareClick}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                color: '#6b7280',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Share2 style={{ width: '16px', height: '16px' }} />
              <span>Compartir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ubicació i enviament */}
      <div className="bg-white rounded-lg p-6 shadow-md border space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Ubicació
          </h3>
          <p className="text-gray-600">{anunci.location}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Enviament
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <span className="mr-2">{anunci.shippingAvailable ? '☑' : '☐'}</span>
              <span className={anunci.shippingAvailable ? 'text-green-600' : 'text-gray-400'}>
                Enviament disponible
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">{anunci.handPickup ? '☑' : '☐'}</span>
              <span className={anunci.handPickup ? 'text-green-600' : 'text-gray-400'}>
                Recollida en mà
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadístiques */}
      <div className="bg-white rounded-lg p-6 shadow-md border">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Estadístiques
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            <span>{anunci.views} visites</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Publicat {anunci.createdAt}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>Caduca el {new Date(anunci.expiresAt).toLocaleDateString('ca-ES')}</span>
          </div>
        </div>
      </div>

      {/* Seguretat i reports */}
      <div className="bg-white rounded-lg p-6 shadow-md border space-y-3">
        <button
          onClick={handleSecurityTipsClick}
          className="w-full text-left text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Shield className="w-4 h-4 mr-2" />
          Consells de seguretat
        </button>
        <button
          onClick={onReportClick}
          className="w-full text-left text-sm text-red-600 hover:text-red-800 flex items-center"
        >
          <Flag className="w-4 h-4 mr-2" />
          Reportar anunci
        </button>
      </div>
    </div>
  );
}