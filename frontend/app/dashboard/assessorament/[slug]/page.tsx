'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Star, MapPin, Clock, Users, Heart, Share2, Flag, Eye, Calendar, Phone, Video, Mail, Building2 } from 'lucide-react';
import { useGuardats } from '@/hooks/useGuardats';
import BookingModal from '@/components/assessorament/BookingModal';

// Mock data - en producció vindria de l'API
const assessoramentMock = {
  id: 'assessorament-1',
  slug: 'assessorament-legal-contractacio-publica',
  titol: 'Assessorament Legal en Contractació Pública',
  subtitol: 'Primera consulta gratuïta de 60 minuts',
  categoria: 'legal',
  imagen: '/images/advisory/legal-contractacio.jpg',
  badges: ['Legal', 'GRATUÏT', 'Verificat'],
  valoracio: 4.8,
  total_valoracions: 23,
  consultes_realitzades: 87,

  empresa: {
    id: 'empresa-puig',
    nom: 'Consultoria Puig & Associats',
    logo: '/images/companies/puig-logo.jpg',
    valoracio: 4.2,
    total_valoracions: 156,
    verificada: true,
    ubicacio: 'Barcelona',
    web: 'www.cpuig.cat',
    email: 'info@cpuig.cat',
    telefon: '+34 93 456 78 90'
  },

  modalitats: [
    {
      tipus: 'presencial',
      activa: true,
      config: {
        adreca: 'Carrer de la Llei, 45, 08001 Barcelona',
        horari: 'Dilluns - Divendres: 9:00 - 18:00',
        duracio_min: 60,
        com_arribar: 'Metro L3 Liceu / L4 Jaume I',
        parking: 'Pàrquing públic a 100m'
      }
    },
    {
      tipus: 'online',
      activa: true,
      config: {
        plataforma: 'Zoom/Meet/Teams',
        horari: 'Dilluns - Divendres: 9:00 - 20:00',
        duracio_min: 60,
        requisits: 'Ordinador + càmera + micròfon'
      }
    },
    {
      tipus: 'telefonica',
      activa: true,
      config: {
        telefon: '+34 93 456 78 90',
        horari: 'Dilluns - Divendres: 9:00 - 20:00',
        duracio_min: 45
      }
    },
    {
      tipus: 'email',
      activa: true,
      config: {
        email: 'info@cpuig.cat',
        temps_resposta: '24-48 hores',
        accepta_adjunts: true,
        max_size_mb: 5
      }
    }
  ],

  expert: {
    nom: 'Maria Puig Fernández',
    carrec: 'Advocada especialista en Contractació Pública i Dret Administratiu',
    foto: '/images/experts/maria-puig.jpg',
    experiencia: '15 anys d\'experiència',
    clients: 'Assessora de +50 ajuntaments',
    formacio: 'Formadora en contractació pública',
    colegiada: 'Col·legiada núm. 12345',
    frase: 'El meu objectiu és ajudar-te a entendre la normativa i aplicar-la correctament en el teu dia a dia',
    linkedin: 'https://linkedin.com/in/maria-puig'
  },

  descripcio: `Oferim una primera consulta gratuïta d'1 hora amb un dels nostres experts en contractació pública. Podràs exposar el teu cas, dubtes o necessitats i rebràs orientació professional personalitzada.

Aquest servei està dissenyat específicament per empleats públics membres de La Pública que necessitin assessorament legal en temes de contractació.`,

  que_inclou: [
    'Sessió d\'1 hora amb expert jurídic especialitzat',
    'Anàlisi inicial del teu cas o necessitat',
    'Orientació sobre els passos a seguir',
    'Resolució de dubtes generals',
    'Recomanacions personalitzades',
    'Document resum de la reunió (per email)',
    'Pressupost sense compromís (si escau)'
  ],

  proces: [
    {
      num: '1',
      titol: 'Reserva la teva consulta',
      descripcio: 'Omple el formulari i selecciona dia i hora'
    },
    {
      num: '2',
      titol: 'Confirmació',
      descripcio: 'Rebràs un email amb data, hora i dades de contacte'
    },
    {
      num: '3',
      titol: 'Primera consulta gratuïta',
      descripcio: 'Reunió d\'1 hora amb l\'expert (presencial/online)'
    },
    {
      num: '4',
      titol: 'Seguiment',
      descripcio: 'Rebràs un resum i pressupost sense compromís'
    },
    {
      num: '5',
      titol: 'Tu decideixes',
      descripcio: 'Si t\'interessa, contractes els serveis. Si no, cap problema ni cost'
    }
  ],

  dirigit_a: [
    'Funcionaris responsables de contractació',
    'Tècnics que tramiten expedients',
    'Secretaris d\'ajuntament',
    'Personal nou que necessita orientació',
    'Qualsevol empleat públic amb dubtes legals sobre contractació'
  ],

  per_que_gratuit: `Consultoria Puig & Associats ofereix aquesta primera consulta sense cost com a forma de donar-se a conèixer i demostrar la qualitat del seu servei.

És una oportunitat per a tu de conèixer l'empresa i els seus professionals, avaluar si el servei s'ajusta a les teves necessitats i rebre orientació professional sense risc.

Després de la consulta, si estàs satisfet i necessites més assessorament, podràs contractar els serveis de l'empresa amb total llibertat. No hi ha cap compromís de contractació.`,

  despres_consulta: {
    rebras: [
      'Email amb resum de la reunió',
      'Pressupost personalitzat (si has sol·licitat serveis addicionals)',
      'Seguiment telefònic (opcional)'
    ],
    si_continues: [
      'Podràs contractar els serveis que necessitis',
      'Preu especial per a membres de La Pública',
      'Continuïtat amb el mateix professional'
    ],
    si_no_interessa: [
      'Cap compromís ni cost',
      'Ja has rebut orientació valuosa gratuïtament',
      'Pots valorar el servei per ajudar altres companys'
    ],
    serveis_contractables: [
      'Assessorament jurídic puntual (per hores)',
      'Assessorament continuïtat (quota mensual)',
      'Formació in-company',
      'Revisió de documentació',
      'Representació en procediments'
    ]
  },

  valoracions: [
    {
      id: 'val-1',
      usuari: {
        nom: 'Joan Martí',
        organisme: 'Ajuntament de Vic',
        avatar: '/images/avatars/joan-marti.jpg'
      },
      valoracio: 5,
      data: 'fa 2 setmanes',
      comentari: 'Consulta molt útil. La Maria em va aclarir tots els dubtes sobre el nou procediment. Molt professional i propera. Després vaig contractar el servei.',
      utils: 12
    },
    {
      id: 'val-2',
      usuari: {
        nom: 'Laura Gil',
        organisme: 'Diputació de Barcelona',
        avatar: '/images/avatars/laura-gil.jpg'
      },
      valoracio: 4,
      data: 'fa 1 mes',
      comentari: 'Bon assessorament inicial. Tot i que no vaig contractar més serveis, la primera consulta em va servir molt.',
      utils: 5
    }
  ],

  stats: {
    vistes: 456,
    consultes_realitzades: 87,
    valoracio_mitjana: 4.8,
    contractacions_despres: 45,
    ratio_conversio: 52
  }
};

const getModalityIcon = (tipus: string) => {
  switch (tipus) {
    case 'presencial': return Building2;
    case 'online': return Video;
    case 'telefonica': return Phone;
    case 'email': return Mail;
    default: return MapPin;
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

export default function AssessoramentSingle() {
  const params = useParams();
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('descripcio');

  // Hook de guardats
  const usuariId = 'jordi-garcia'; // En producció vindria del context d'usuari
  const { isGuardat, isLoading: isLoadingGuardat, handleToggleGuardar } = useGuardats('assessorament', params.slug as string, usuariId);

  const assessorament = assessoramentMock; // En producció: useEffect per carregar dades

  const modalitatsActives = assessorament.modalitats.filter(m => m.activa);

  const handleBooking = () => {
    setShowBookingModal(true);
  };

  const handleSaveAssessorament = async () => {
    await handleToggleGuardar({
      titol: assessorament.titol,
      imatge: assessorament.imagen,
      url: `/dashboard/assessorament/${params.slug}`,
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
            <span>{assessorament.categoria}</span>
            <span>{'>'}</span>
            <span style={{ color: '#111827', fontWeight: '500' }}>
              {assessorament.titol.substring(0, 30)}...
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
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                📸 Imatge d'assessorament legal
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {assessorament.badges.map((badge, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: badge === 'GRATUÏT' ? '#10b981' : '#3b82f6',
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
                          backgroundColor: '#f3f4f6',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <Icon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
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
                  👥 {assessorament.consultes_realitzades} funcionaris ja ho han provat
                </span>
              </div>

              {/* Empresa */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  🏢
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '16px' }}>{assessorament.empresa.nom}</p>
                  <Link
                    href={`/dashboard/empreses/empresa-puig`}
                    style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}
                  >
                    Veure empresa →
                  </Link>
                </div>
              </div>

              {/* Botó principal */}
              <button
                onClick={handleBooking}
                style={{
                  backgroundColor: '#10b981',
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
                backgroundColor: '#f8f9fa',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  📋 Resum
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: '600', color: '#10b981', fontSize: '16px' }}>
                    💰 Gratuït
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Primera consulta sense cost
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>⏱️ Durada:</p>
                  <ul style={{ fontSize: '14px', color: '#6b7280', paddingLeft: '16px', margin: 0 }}>
                    <li>Presencial/Online: 60 min</li>
                    <li>Telefònica: 30-45 min</li>
                    <li>Email: resposta 24-48h</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>📍 Modalitats:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {modalitatsActives.map((modalitat) => (
                      <span key={modalitat.tipus} style={{ fontSize: '14px', color: '#6b7280' }}>
                        ✓ {getModalityLabel(modalitat.tipus)}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '8px' }}>🕐 Disponibilitat:</p>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Dl-Dv: 9:00 - 18:00<br />
                    (Online fins 20:00)
                  </p>
                </div>

                <button
                  onClick={handleBooking}
                  style={{
                    width: '100%',
                    backgroundColor: '#10b981',
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

        {/* Contingut principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          {/* Contingut principal */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px' }}>
            {/* Navegació de tabs */}
            <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '32px' }}>
                {[
                  { id: 'descripcio', label: 'Descripció' },
                  { id: 'modalitats', label: 'Modalitats' },
                  { id: 'proces', label: 'Com funciona' },
                  { id: 'expert', label: 'L\'expert' },
                  { id: 'valoracions', label: 'Valoracions' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    style={{
                      padding: '12px 0',
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderBottom: selectedTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                      color: selectedTab === tab.id ? '#3b82f6' : '#6b7280',
                      fontWeight: selectedTab === tab.id ? '600' : '400',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contingut segons tab */}
            {selectedTab === 'descripcio' && (
              <div>
                {/* En què consisteix */}
                <section style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
                    📝 En què consisteix aquest assessorament
                  </h3>
                  <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151', marginBottom: '16px' }}>
                    {assessorament.descripcio}
                  </p>
                </section>

                {/* Què inclou */}
                <section style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
                    ✨ Què inclou la consulta gratuïta
                  </h3>
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '24px'
                  }}>
                    {assessorament.que_inclou.map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ color: '#10b981', fontWeight: '600' }}>✓</span>
                        <span style={{ color: '#374151' }}>{item}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '6px' }}>
                      <p style={{ fontWeight: '600', color: '#059669', marginBottom: '4px' }}>
                        🎁 Tot això sense cost ni compromís per a tu
                      </p>
                    </div>
                  </div>
                </section>

                {/* A qui va dirigit */}
                <section style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
                    🎯 A qui va dirigit
                  </h3>
                  <p style={{ marginBottom: '16px', color: '#374151' }}>
                    Aquest assessorament és ideal per a:
                  </p>
                  <ul style={{ paddingLeft: '0', listStyle: 'none' }}>
                    {assessorament.dirigit_a.map((item, index) => (
                      <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ color: '#3b82f6' }}>👤</span>
                        <span style={{ color: '#374151' }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '6px'
                  }}>
                    <p style={{ fontWeight: '600', color: '#92400e' }}>
                      ⚠️ Requisit: Ser membre verificat de La Pública
                    </p>
                  </div>
                </section>

                {/* Per què és gratuït */}
                <section>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
                    💡 Per què és gratuït?
                  </h3>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '24px'
                  }}>
                    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151', marginBottom: '16px' }}>
                      {assessorament.per_que_gratuit}
                    </p>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#dbeafe',
                      borderRadius: '6px',
                      marginTop: '16px'
                    }}>
                      <p style={{ fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                        ❗ No hi ha cap compromís de contractació
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {selectedTab === 'modalitats' && (
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>
                  📍 Com pots rebre l'assessorament
                </h3>
                <p style={{ marginBottom: '24px', color: '#6b7280' }}>
                  Tria la modalitat que més t'agradi:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {modalitatsActives.map((modalitat) => {
                    const Icon = getModalityIcon(modalitat.tipus);
                    return (
                      <div
                        key={modalitat.tipus}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          padding: '24px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <Icon style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                          <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                            {getModalityLabel(modalitat.tipus)}
                          </h4>
                        </div>

                        {modalitat.tipus === 'presencial' && (
                          <div>
                            <p style={{ color: '#374151', marginBottom: '12px' }}>
                              Visita a la nostra oficina de Barcelona
                            </p>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              <p>📍 {modalitat.config.adreca}</p>
                              <p>🕐 {modalitat.config.horari}</p>
                              <p>🚇 {modalitat.config.com_arribar}</p>
                              <p>🅿️ {modalitat.config.parking}</p>
                            </div>
                            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                              <p style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
                                Ideal si tens documentació física, prefereixes tracte personal o estàs a Barcelona
                              </p>
                            </div>
                          </div>
                        )}

                        {modalitat.tipus === 'online' && (
                          <div>
                            <p style={{ color: '#374151', marginBottom: '12px' }}>
                              Reunió per {modalitat.config.plataforma}
                            </p>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              <p>🕐 {modalitat.config.horari}</p>
                              <p>🌐 Link enviat per email</p>
                              <p>💻 Necessites: {modalitat.config.requisits}</p>
                            </div>
                            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px' }}>
                              <p style={{ fontSize: '14px', color: '#0369a1', fontWeight: '500' }}>
                                Ideal si no estàs a Barcelona, vols estalviar desplaçaments, prefereixes horaris flexibles o pots compartir pantalla
                              </p>
                            </div>
                          </div>
                        )}

                        {modalitat.tipus === 'telefonica' && (
                          <div>
                            <p style={{ color: '#374151', marginBottom: '12px' }}>
                              Trucada directa amb l'expert
                            </p>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              <p>🕐 {modalitat.config.horari}</p>
                              <p>📞 Et truquem nosaltres a l'hora acordada</p>
                              <p>⏱️ Durada: {modalitat.config.duracio_min} minuts</p>
                            </div>
                            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fefce8', borderRadius: '6px' }}>
                              <p style={{ fontSize: '14px', color: '#a16207', fontWeight: '500' }}>
                                Ideal si necessites consulta ràpida, no tens càmera/ordinador, prefereixes més privacitat o consulta senzilla
                              </p>
                            </div>
                          </div>
                        )}

                        {modalitat.tipus === 'email' && (
                          <div>
                            <p style={{ color: '#374151', marginBottom: '12px' }}>
                              Consulta per escrit amb resposta detallada
                            </p>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              <p>⏱️ Resposta en {modalitat.config.temps_resposta}</p>
                              <p>📧 {modalitat.config.email}</p>
                              <p>📎 Pots adjuntar documents</p>
                            </div>
                            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px' }}>
                              <p style={{ fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>
                                ⚠️ No inclou reunió, només resposta email
                              </p>
                            </div>
                            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                              <p style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                                Ideal si no necessites urgència, vols tenir resposta per escrit, consulta puntual específica o tens horaris complicats
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe'
                }}>
                  <p style={{ fontSize: '14px', color: '#1e40af', textAlign: 'center' }}>
                    ℹ️ Pots triar la modalitat en el formulari de reserva
                  </p>
                </div>
              </div>
            )}

            {selectedTab === 'proces' && (
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>
                  🎯 Com funciona
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {assessorament.proces.map((pas, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: '20px',
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        {pas.num}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                          {pas.titol}
                        </h4>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>
                          {pas.descripcio}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Després de la consulta */}
                <section style={{ marginTop: '40px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>
                    🔮 Què passa després de la consulta gratuïta?
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px'
                    }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#059669' }}>
                        📧 Rebràs:
                      </h4>
                      <ul style={{ fontSize: '14px', color: '#374151', paddingLeft: '16px' }}>
                        {assessorament.despres_consulta.rebras.map((item, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{
                      padding: '20px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px'
                    }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#2563eb' }}>
                        ✅ Si decideixes continuar:
                      </h4>
                      <ul style={{ fontSize: '14px', color: '#374151', paddingLeft: '16px' }}>
                        {assessorament.despres_consulta.si_continues.map((item, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{
                    padding: '20px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
                      🤝 Si no t'interessa:
                    </h4>
                    <ul style={{ fontSize: '14px', color: '#374151', paddingLeft: '16px' }}>
                      {assessorament.despres_consulta.si_no_interessa.map((item, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{
                    padding: '20px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                      💼 Serveis que pots contractar després:
                    </h4>
                    <ul style={{ fontSize: '14px', color: '#6b7280', paddingLeft: '16px' }}>
                      {assessorament.despres_consulta.serveis_contractables.map((item, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
            )}

            {selectedTab === 'expert' && (
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>
                  👨‍💼 El teu assessor
                </h3>

                <div style={{
                  display: 'flex',
                  gap: '24px',
                  padding: '24px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    width: '150px',
                    height: '150px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#6b7280',
                    flexShrink: 0
                  }}>
                    📸 Foto expert
                  </div>

                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                      {assessorament.expert.nom}
                    </h4>
                    <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '16px' }}>
                      {assessorament.expert.carrec}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '14px', color: '#374151' }}>• {assessorament.expert.experiencia}</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>• {assessorament.expert.clients}</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>• {assessorament.expert.formacio}</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>• {assessorament.expert.colegiada}</span>
                    </div>

                    <blockquote style={{
                      borderLeft: '4px solid #3b82f6',
                      paddingLeft: '16px',
                      fontStyle: 'italic',
                      color: '#374151',
                      marginBottom: '16px'
                    }}>
                      "{assessorament.expert.frase}"
                    </blockquote>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}>
                        Veure perfil complet →
                      </button>
                      <button style={{
                        padding: '8px 16px',
                        backgroundColor: '#0077b5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}>
                        LinkedIn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'valoracions' && (
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#111827' }}>
                  ⭐ Valoracions ({assessorament.total_valoracions})
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  {renderStars(assessorament.valoracio, '24')}
                  <span style={{ fontSize: '24px', fontWeight: '600' }}>{assessorament.valoracio}</span>
                  <span style={{ fontSize: '18px', color: '#6b7280' }}>/ 5</span>
                  <span style={{ color: '#6b7280' }}>
                    Valoració mitjana de {assessorament.total_valoracions} opinions
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {assessorament.valoracions.map((valoracio) => (
                    <div
                      key={valoracio.id}
                      style={{
                        padding: '20px',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px'
                        }}>
                          👤
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                              <p style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>
                                {valoracio.usuari.nom}
                              </p>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                {valoracio.usuari.organisme}
                              </p>
                            </div>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              {valoracio.data}
                            </span>
                          </div>
                          <div style={{ marginBottom: '12px' }}>
                            {renderStars(valoracio.valoracio, '16')}
                          </div>
                        </div>
                      </div>
                      <p style={{ color: '#374151', lineHeight: '1.5', marginBottom: '12px' }}>
                        {valoracio.comentari}
                      </p>
                      <button style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        👍 {valoracio.utils} Útil
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '24px',
                  padding: '20px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '16px' }}>
                    ℹ️ Només pots valorar si has assistit a la consulta
                  </p>
                  <button style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Escriure valoració
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar dret */}
          <div style={{ position: 'sticky', top: '24px', height: 'fit-content' }}>
            {/* Empresa */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                🏢 Empresa
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  🏢
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '16px' }}>{assessorament.empresa.nom}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                    {renderStars(assessorament.empresa.valoracio, '14')}
                    <span>{assessorament.empresa.valoracio} ({assessorament.empresa.total_valoracions} valoracions)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10b981' }}>
                    ✓ Verificada • 📍 {assessorament.empresa.ubicacio}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Veure perfil complet
                </button>
                <button style={{
                  width: '100%',
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  Més assessoraments d'aquesta empresa
                </button>
              </div>
            </div>

            {/* Contacte */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                📞 Contacte directe
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                <span>📧 {assessorament.empresa.email}</span>
                <span>📞 {assessorament.empresa.telefon}</span>
                <span>🌐 {assessorament.empresa.web}</span>
              </div>
              <button style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                💬 Enviar missatge
              </button>
            </div>

            {/* Accions */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                💾 Accions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleSaveAssessorament}
                  disabled={isLoadingGuardat}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: isGuardat ? '#dc2626' : 'white',
                    color: isGuardat ? 'white' : '#374151',
                    border: `1px solid ${isGuardat ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Heart style={{
                    width: '16px',
                    height: '16px',
                    fill: isGuardat ? 'white' : 'none'
                  }} />
                  {isGuardat ? 'Guardat' : 'Guardar assessorament'}
                </button>
                <button style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Share2 style={{ width: '16px', height: '16px' }} />
                  Compartir
                </button>
                <button style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: 'white',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Flag style={{ width: '16px', height: '16px' }} />
                  Reportar
                </button>
              </div>
            </div>

            {/* Estadístiques */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                📊 Estadístiques
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                <span>👁️ {assessorament.stats.vistes} vistes</span>
                <span>📅 {assessorament.stats.consultes_realitzades} consultes realitzades</span>
                <span>⭐ {assessorament.stats.valoracio_mitjana} valoració mitjana</span>
                <span>💼 {assessorament.stats.contractacions_despres} contractacions després</span>
                <span>📈 {assessorament.stats.ratio_conversio}% ratio de conversió</span>
              </div>
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