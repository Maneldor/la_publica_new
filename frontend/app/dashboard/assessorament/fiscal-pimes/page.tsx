'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Star, Heart, Share2, Flag, Building2, Video, Phone, Mail } from 'lucide-react';
import { useGuardats } from '@/hooks/useGuardats';
import BookingModal from '@/components/assessorament/BookingModal';
import { assessoramentsMock } from '@/data/assessoraments-mock';

export default function AssessoramentFiscalPimes() {
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('descripcio');

  // Obtener datos del assessorament fiscal
  const assessorament = assessoramentsMock.find(a => a.slug === 'assessorament-fiscal-pimes')!;

  // Hook de guardats
  const usuariId = 'jordi-garcia';
  const { isGuardat, isLoading: isLoadingGuardat, handleToggleGuardar } = useGuardats('assessorament', 'assessorament-fiscal-pimes', usuariId);

  const modalitatsActives = assessorament.modalitats.filter(m => m.activa);

  const getModalityIcon = (tipus: string) => {
    switch (tipus) {
      case 'presencial': return Building2;
      case 'online': return Video;
      case 'telefonica': return Phone;
      case 'email': return Mail;
      default: return Building2;
    }
  };

  const getModalityLabel = (tipus: string) => {
    switch (tipus) {
      case 'presencial': return 'Presencial';
      case 'online': return 'Online';
      case 'telefonica': return 'Telefònica';
      case 'email': return 'Correu electrònic';
      default: return tipus;
    }
  };

  const handleBooking = () => {
    setShowBookingModal(true);
  };

  const handleSaveAssessorament = async () => {
    await handleToggleGuardar({
      titol: assessorament.titol,
      imatge: assessorament.imagen,
      url: `/dashboard/assessorament/fiscal-pimes`,
      description: assessorament.subtitol
    });
  };

  const renderStars = (rating: number, size: string = '16') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              fill: star <= rating ? '#fbbf24' : 'none',
              color: star <= rating ? '#fbbf24' : '#d1d5db'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
            <button
              onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', textDecoration: 'none' }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
              Assessoraments
            </button>
            <span>{'>'}</span>
            <span>fiscal</span>
            <span>{'>'}</span>
            <span style={{ color: '#111827', fontWeight: '500' }}>
              Assessorament Fiscal per PIMES
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
        {/* Hero Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
            <div>
              {/* Imagen destacada */}
              <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#059669',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: 'white'
              }}>
                💰
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {assessorament.badges.map((badge, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: badge === 'GRATUÏT' ? '#10b981' : '#059669',
                      color: 'white',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Título */}
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                {assessorament.titol}
              </h1>
              <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '24px' }}>
                {assessorament.subtitol}
              </p>

              {/* Modalitats disponibles */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                  📍 Modalitats disponibles:
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {modalitatsActives.map((modalitat) => {
                    const Icon = getModalityIcon(modalitat.tipus);
                    return (
                      <div
                        key={modalitat.tipus}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #bbf7d0',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#059669'
                        }}
                      >
                        <Icon style={{ width: '16px', height: '16px', color: '#059669' }} />
                        {getModalityLabel(modalitat.tipus)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Valoracions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {renderStars(assessorament.valoracio, '20')}
                  <span style={{ fontWeight: '600', fontSize: '18px' }}>{assessorament.valoracio}</span>
                  <span style={{ color: '#6b7280' }}>({assessorament.total_valoracions} valoracions)</span>
                </div>
                <span style={{ color: '#6b7280' }}>•</span>
                <span style={{ color: '#6b7280' }}>
                  👥 {assessorament.consultes_realitzades} consultes realitzades
                </span>
              </div>

              {/* Empresa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#ecfdf5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  💼
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '16px' }}>{assessorament.empresa.nom}</p>
                  <Link
                    href={`/dashboard/empreses/empresa-fiscal-cat`}
                    style={{ color: '#059669', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Veure empresa →
                  </Link>
                </div>
              </div>

              {/* Botó principal */}
              <button
                onClick={handleBooking}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginRight: '16px'
                }}
              >
                📅 Reservar consulta gratuïta
              </button>

              {/* Accions secundàries */}
              <div style={{ display: 'inline-flex', gap: '12px' }}>
                <button
                  onClick={handleSaveAssessorament}
                  disabled={isLoadingGuardat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: isGuardat ? '#dc2626' : '#374151'
                  }}
                >
                  <Heart style={{
                    width: '16px',
                    height: '16px',
                    fill: isGuardat ? '#dc2626' : 'none'
                  }} />
                  {isGuardat ? 'Guardat' : 'Guardar'}
                </button>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <Share2 style={{ width: '16px', height: '16px' }} />
                  Compartir
                </button>
              </div>
            </div>

            {/* Sidebar Resum */}
            <div style={{ position: 'sticky', top: '24px', height: 'fit-content' }}>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  📋 Resum
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: '600', color: '#059669', fontSize: '16px' }}>
                    💰 Gratuït
                  </p>
                  <p style={{ fontSize: '14px', color: '#374151' }}>
                    Primera consulta sense cost
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>⏱️ Durada: 45 minuts</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>📍 Modalitats:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {modalitatsActives.map((modalitat) => (
                      <span key={modalitat.tipus} style={{ fontSize: '14px', color: '#374151' }}>
                        ✓ {getModalityLabel(modalitat.tipus)}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>🕐 Disponibilitat:</p>
                  <p style={{ fontSize: '14px', color: '#374151' }}>
                    Dl-Dv: 9:00 - 17:00<br />
                    (Online/Tel fins 19:00)
                  </p>
                </div>

                <button
                  onClick={handleBooking}
                  style={{
                    width: '100%',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📅 Reservar consulta
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contingut detallat */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            📊 Assessorament Fiscal Especialitzat
          </h2>
          <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '24px' }}>
            Primera consulta gratuïta amb {assessorament.expert.nom}
          </p>
          <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6' }}>
            {assessorament.descripcio}
          </p>

          <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#059669' }}>
              ✨ Què inclou la consulta
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', textAlign: 'left' }}>
              {assessorament.que_inclou.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: '#059669', fontWeight: '600' }}>✓</span>
                  <span style={{ color: '#374151', fontSize: '14px' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reserva */}
      <BookingModal
        assessorament={assessorament}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
}