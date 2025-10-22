'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '@/components/ui/PageTemplate';
import { useGuardats } from '@/hooks/useGuardats';
import { Star } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  type: string;
  sector: string;
  location: string;
  logo: string;
  coverImage: string;
  description: string;
  services: string[];
  certifications: {
    name: string;
    icon: string;
    year: string;
  }[];
  sectors: string[];
  team: {
    name: string;
    position: string;
    avatar: string;
  }[];
  founded: number;
  employees: string;
  rating: number;
  reviews: number;
  website: string;
  email: string;
  phone: string;
  address: string;
  schedule: {
    weekdays: string;
    weekend: string;
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  isVerified: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  projectsCompleted: number;
  activeClients: number;
  averageBudget: string;
}

interface Review {
  id: number;
  author: string;
  organization: string;
  avatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  response?: {
    content: string;
    date: string;
  };
}

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  image: string;
}

export default function CompanySinglePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sobre');
  const [isSaved, setIsSaved] = useState(false);

  // Hook para gestionar guardats
  const usuariId = 'jordi-garcia'; // En producción, obtener del contexto de auth
  const { isGuardat, isLoading: isLoadingGuardat, handleToggleGuardar } = useGuardats(
    'empresa',
    params.slug,
    usuariId
  );
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: 'Estic interessat en els vostres serveis...',
    services: [] as string[],
    acceptPolicy: false
  });

  // Mock data - en una aplicación real vendría de la API
  const company: Company = {
    id: 1,
    name: 'TechSolutions BCN',
    type: 'Partner tecnològic',
    sector: 'Tecnologia',
    location: 'Barcelona',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=300&fit=crop',
    description: `TechSolutions BCN és una empresa especialitzada en transformació digital per al sector públic. Amb més de 10 anys d'experiència, desenvolupem solucions tecnològiques innovadores que ajuden les administracions a optimitzar els seus processos i millorar l'atenció ciutadana.

    Som experts en desenvolupament de plataformes web, aplicacions mòbils, sistemes de gestió documental i business intelligence. El nostre equip de 30 professionals treballa amb les últimes tecnologies per oferir solucions escalables i segures.

    La nostra missió és acompanyar les organitzacions públiques en la seva transformació digital, proporcionant eines que facilitin la gestió interna i millorin els serveis oferts als ciutadans.`,
    services: [
      'Consultoria en transformació digital',
      'Desenvolupament de plataformes web',
      'Apps mòbils per administracions públiques',
      'Sistemes de gestió documental',
      'Business Intelligence i analítica de dades',
      'Ciberseguretat i compliment normatiu',
      'Formació i capacitació d\'equips'
    ],
    certifications: [
      { name: 'ISO 9001:2015', icon: '🏆', year: '2018' },
      { name: 'ISO 27001:2013', icon: '🔒', year: '2019' },
      { name: 'Esquema Nacional de Seguretat', icon: '🛡️', year: '2020' }
    ],
    sectors: ['Administració Local', 'Diputacions', 'Generalitat', 'Educació', 'Salut', 'Justícia'],
    team: [
      { name: 'Joan Martí', position: 'CEO i Fundador', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
      { name: 'Maria Puig', position: 'CTO', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b593?w=100&h=100&fit=crop&crop=face' },
      { name: 'Laura Gil', position: 'Directora Comercial', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
      { name: 'Pere Font', position: 'Cap de Projectes', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }
    ],
    founded: 2015,
    employees: '25-50',
    rating: 4.2,
    reviews: 24,
    website: 'www.techsolutions.cat',
    email: 'info@techsolutions.cat',
    phone: '+34 93 123 45 67',
    address: 'Carrer de la Tecnologia, 123\n08001 Barcelona, Catalunya',
    schedule: {
      weekdays: 'Dilluns - Divendres: 9:00 - 18:00',
      weekend: 'Cap de setmana: Tancat'
    },
    socialMedia: {
      linkedin: 'https://linkedin.com/company/techsolutions-bcn',
      twitter: 'https://twitter.com/techsolutionsbcn',
      facebook: 'https://facebook.com/techsolutionsbcn'
    },
    isVerified: true,
    isPremium: true,
    isFeatured: true,
    projectsCompleted: 150,
    activeClients: 45,
    averageBudget: '50.000€ - 200.000€'
  };

  const reviews: Review[] = [
    {
      id: 1,
      author: 'Maria González',
      organization: 'Ajuntament de Girona',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b593?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      title: 'Excel·lent servei',
      content: 'Excel·lent servei i molt professionals. Van complir amb tots els terminis i el resultat va superar les nostres expectatives. Recomanem totalment els seus serveis.',
      date: 'fa 2 setmanes',
      helpful: 12,
      response: {
        content: 'Moltes gràcies Maria! Ha estat un plaer treballar amb vosaltres. Esperem poder col·laborar en futurs projectes.',
        date: 'fa 2 setmanes'
      }
    },
    {
      id: 2,
      author: 'Joan Martí',
      organization: 'Diputació de Barcelona',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      rating: 4,
      title: 'Bona experiència',
      content: 'Bona experiència en general. Algunes petites incidències al principi però es van resoldre ràpidament. El resultat final és molt satisfactori.',
      date: 'fa 1 mes',
      helpful: 5
    },
    {
      id: 3,
      author: 'Laura Pérez',
      organization: 'Generalitat de Catalunya',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      title: 'Molt recomanable',
      content: 'Equip molt professional i compromès. La plataforma que van desenvolupar ha millorat significativament els nostres processos interns.',
      date: 'fa 1 mes',
      helpful: 8
    }
  ];

  const offers: Offer[] = [
    {
      id: 1,
      title: 'Auditoria de Ciberseguretat',
      description: '25% de descompte en auditories de seguretat per a nous clients',
      discount: '25%',
      validUntil: '31 de desembre',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Desenvolupament Web',
      description: 'Paquets especials per a administracions locals',
      discount: '15%',
      validUntil: '15 de gener',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Formació Digital',
      description: 'Cursos de digitalització per a funcionaris',
      discount: '30%',
      validUntil: '28 de febrer',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop'
    }
  ];

  const galleryImages = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop'
  ];

  const similarCompanies = [
    { id: 2, name: 'Consultoria Tech', logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop', rating: 4.5, reviews: 12 },
    { id: 3, name: 'Digital Solutions', logo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=50&h=50&fit=crop', rating: 4.3, reviews: 18 },
    { id: 4, name: 'InnovaPublic', logo: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=50&h=50&fit=crop', rating: 4.7, reviews: 9 }
  ];

  const statsData = [
    { label: 'Valoració', value: `${company.rating}/5`, trend: '⭐' },
    { label: 'Ressenyes', value: company.reviews.toString(), trend: '+3' },
    { label: 'Projectes', value: `${company.projectsCompleted}+`, trend: '+12' },
    { label: 'Clients actius', value: company.activeClients.toString(), trend: '+5' }
  ];

  // Cargar estado inicial de favoritos
  useEffect(() => {
    const savedCompanies = JSON.parse(localStorage.getItem('lapublica_saved_companies') || '[]');
    setIsSaved(savedCompanies.includes(company.id));
  }, [company.id]);

  const handleSaveCompany = () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    const savedCompanies = JSON.parse(localStorage.getItem('lapublica_saved_companies') || '[]');
    if (newSavedState) {
      if (!savedCompanies.includes(company.id)) {
        savedCompanies.push(company.id);
      }
    } else {
      const index = savedCompanies.indexOf(company.id);
      if (index > -1) {
        savedCompanies.splice(index, 1);
      }
    }
    localStorage.setItem('lapublica_saved_companies', JSON.stringify(savedCompanies));
  };

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/dashboard/empreses/${params.slug}`;
    const text = `🏢 ${company.name}\n${company.type} • ${company.location}\n⭐ ${company.rating}/5 (${company.reviews} valoracions)\n\nConeix aquesta empresa a La Pública:`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'linkedin':
        window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Enllaç copiat al portapapers!');
        break;
    }
    setShowShareModal(false);
  };

  const handleContactSubmit = () => {
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim() || !contactForm.acceptPolicy) {
      return;
    }

    console.log('Enviant missatge:', contactForm);
    setShowContactModal(false);
    alert('Missatge enviat correctament!');

    // Reset form
    setContactForm({
      name: '',
      email: '',
      company: '',
      phone: '',
      message: 'Estic interessat en els vostres serveis...',
      services: [],
      acceptPolicy: false
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < rating ? '#fbbf24' : '#d1d5db' }}>⭐</span>
    ));
  };

  if (!company) {
    return (
      <PageTemplate
        title="Empresa"
        subtitle="Informació de l'empresa col·laboradora"
        statsData={statsData}
      >
        <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</div>
            <h2 style={{ color: '#6b7280', margin: 0 }}>Empresa no trobada</h2>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Empresa"
      subtitle="Informació de l'empresa col·laboradora"
      statsData={statsData}
    >
      <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6c757d' }}>
            <button
              onClick={() => router.back()}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span>←</span>
              <span>Tornar</span>
            </button>
            <span>•</span>
            <button
              onClick={() => router.push('/dashboard/empreses')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' }}
            >
              Empreses i Col·laboradors
            </button>
            <span>•</span>
            <span style={{ color: '#3b82f6' }}>{company.sector}</span>
            <span>•</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.name}</span>
          </div>
        </div>

        {/* Hero / Capçalera */}
        <div style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          {/* Imagen de portada */}
          <div style={{
            height: '300px',
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${company.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            {/* Logo */}
            <div style={{
              position: 'absolute',
              bottom: '-60px',
              left: '32px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '4px solid white',
              backgroundImage: `url(${company.logo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }} />
          </div>

          {/* Información básica */}
          <div style={{ padding: '80px 32px 32px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <span style={{ color: '#10b981', fontSize: '24px' }} title="Empresa verificada">✓</span>
                  )}
                </div>

                <p style={{ fontSize: '18px', color: '#6b7280', margin: '0 0 8px 0' }}>
                  {company.type}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
                    <span>📍</span>
                    <span>{company.location}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
                    <span>🏷️</span>
                    <span>{company.sector}</span>
                  </span>
                </div>

                {/* Valoración */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {renderStars(Math.floor(company.rating))}
                  </div>
                  <span style={{ fontWeight: '600', color: '#111827' }}>{company.rating}</span>
                  <span style={{ color: '#6b7280' }}>({company.reviews} valoracions)</span>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {company.isFeatured && (
                    <span style={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      DESTACADA
                    </span>
                  )}
                  {company.isVerified && (
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      VERIFICADA
                    </span>
                  )}
                  {company.isPremium && (
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      PREMIUM
                    </span>
                  )}
                </div>
              </div>

              {/* Botons d'acció */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowContactModal(true)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>💬</span>
                  <span>Contactar</span>
                </button>

                <a
                  href={`https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: 'white',
                    color: '#374151',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🌐</span>
                  <span>Web</span>
                </a>

                <button
                  onClick={() => handleToggleGuardar({
                    titol: company.name,
                    imatge: company.logo,
                    url: `/dashboard/empreses/${params.slug}`,
                    description: company.type,
                    location: company.location
                  })}
                  disabled={isLoadingGuardat}
                  style={{
                    backgroundColor: isGuardat ? '#fef3c7' : 'white',
                    color: isGuardat ? '#d97706' : '#374151',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: `1px solid ${isGuardat ? '#fbbf24' : '#d1d5db'}`,
                    fontWeight: '600',
                    cursor: isLoadingGuardat ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isLoadingGuardat ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <Star
                    style={{
                      width: '16px',
                      height: '16px',
                      fill: isGuardat ? '#d97706' : 'none',
                      stroke: isGuardat ? '#d97706' : '#374151'
                    }}
                  />
                  <span>
                    {isLoadingGuardat ? 'Carregant...' : isGuardat ? 'Seguint' : 'Seguir empresa'}
                  </span>
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  style={{
                    backgroundColor: 'white',
                    color: '#374151',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🔗</span>
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de navegació */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {[
              { id: 'sobre', label: 'Sobre nosaltres', icon: '📄' },
              { id: 'ofertes', label: 'Ofertes', icon: '🎁' },
              { id: 'galeria', label: 'Galeria', icon: '📸' },
              { id: 'ressenyes', label: 'Ressenyes', icon: '💬' },
              { id: 'contacte', label: 'Contacte', icon: '📞' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '16px 24px',
                  border: 'none',
                  background: 'none',
                  color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Layout principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>

          {/* Contingut principal */}
          <div>
            {activeTab === 'sobre' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Descripció */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📝</span>
                    <span>Sobre nosaltres</span>
                  </h2>
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.7',
                    color: '#374151',
                    whiteSpace: 'pre-line'
                  }}>
                    {company.description}
                  </div>
                </div>

                {/* Serveis */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>🛠️</span>
                    <span>Serveis</span>
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {company.services.map((service, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                      }}>
                        <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
                        <span style={{ color: '#374151' }}>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificacions */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>🏆</span>
                    <span>Certificacions</span>
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {company.certifications.map((cert, index) => (
                      <div key={index} style={{
                        textAlign: 'center',
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{cert.icon}</div>
                        <div style={{ fontWeight: '600', color: '#111827' }}>{cert.name}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>Des de {cert.year}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sectors */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>🎯</span>
                    <span>Sectors</span>
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {company.sectors.map((sector, index) => (
                      <span key={index} style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Equip */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>👥</span>
                    <span>Equip</span>
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {company.team.map((member, index) => (
                      <div key={index} style={{
                        textAlign: 'center',
                        padding: '16px'
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundImage: `url(${member.avatar})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          margin: '0 auto 12px'
                        }} />
                        <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {member.position}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    textAlign: 'center',
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    + 25 professionals més
                  </div>
                </div>

                {/* Dades clau */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📊</span>
                    <span>Dades de l'empresa</span>
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>Any de fundació:</div>
                      <div style={{ color: '#6b7280' }}>{company.founded}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>Nombre d'empleats:</div>
                      <div style={{ color: '#6b7280' }}>{company.employees}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>Projectes completats:</div>
                      <div style={{ color: '#6b7280' }}>{company.projectsCompleted}+</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>Clients actius:</div>
                      <div style={{ color: '#6b7280' }}>{company.activeClients}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>Pressupost mitjà:</div>
                      <div style={{ color: '#6b7280' }}>{company.averageBudget}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ofertes' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🎁</span>
                  <span>Ofertes exclusives per a membres</span>
                </h2>

                {offers.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {offers.map((offer) => (
                      <div key={offer.id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}>
                        <img
                          src={offer.image}
                          alt={offer.title}
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                        <div style={{ padding: '16px' }}>
                          <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                            {offer.title}
                          </h3>
                          <p style={{ color: '#6b7280', marginBottom: '12px' }}>
                            {offer.description}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}>
                              -{offer.discount} OFF
                            </span>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              Fins {offer.validUntil}
                            </span>
                          </div>
                          <button style={{
                            width: '100%',
                            marginTop: '12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer'
                          }}>
                            Veure detall
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
                    <p style={{ color: '#6b7280' }}>Aquesta empresa encara no té ofertes actives</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'galeria' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📸</span>
                  <span>Galeria d'imatges</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {galleryImages.map((image, index) => (
                    <div key={index} style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}>
                      <img
                        src={image}
                        alt={`Galeria ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ressenyes' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>💬</span>
                  <span>Ressenyes i valoracions</span>
                </h2>

                {/* Resumen de valoraciones */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '700' }}>{company.rating}</span>
                    <span style={{ fontSize: '18px' }}>/</span>
                    <span style={{ fontSize: '18px' }}>5</span>
                    <div style={{ display: 'flex' }}>
                      {renderStars(Math.floor(company.rating))}
                    </div>
                  </div>
                  <p style={{ color: '#6b7280', margin: 0 }}>
                    Basada en {company.reviews} ressenyes
                  </p>
                </div>

                {/* Lista de reseñas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {reviews.map((review) => (
                    <div key={review.id} style={{
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <img
                          src={review.avatar}
                          alt={review.author}
                          style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{review.author}</div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{review.organization}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', marginBottom: '4px' }}>
                            {renderStars(review.rating)}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>{review.date}</div>
                        </div>
                      </div>

                      <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                        {review.title}
                      </h4>

                      <p style={{ color: '#374151', marginBottom: '12px', lineHeight: '1.6' }}>
                        {review.content}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px' }}>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>👍</span>
                          <span>{review.helpful}</span>
                        </button>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer'
                        }}>
                          Útil
                        </button>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer'
                        }}>
                          Respondre
                        </button>
                      </div>

                      {review.response && (
                        <div style={{
                          marginTop: '16px',
                          paddingLeft: '20px',
                          borderLeft: '3px solid #e5e7eb'
                        }}>
                          <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                            Resposta de {company.name}:
                          </div>
                          <p style={{ color: '#374151', marginBottom: '8px' }}>
                            {review.response.content}
                          </p>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {review.response.date}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Escriure una ressenya
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'contacte' && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📞</span>
                  <span>Informació de contacte</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  {/* Información de contacto */}
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                        Dades de contacte
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📍</span>
                          <div>
                            <div style={{ fontWeight: '500' }}>Adreça:</div>
                            <div style={{ color: '#6b7280', whiteSpace: 'pre-line' }}>{company.address}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📞</span>
                          <div>
                            <div style={{ fontWeight: '500' }}>Telèfon:</div>
                            <a href={`tel:${company.phone}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                              {company.phone}
                            </a>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📧</span>
                          <div>
                            <div style={{ fontWeight: '500' }}>Email:</div>
                            <a href={`mailto:${company.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
                              {company.email}
                            </a>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🌐</span>
                          <div>
                            <div style={{ fontWeight: '500' }}>Web:</div>
                            <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                              {company.website}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                        Horari d'atenció
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🕐</span>
                          <span>{company.schedule.weekdays}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🕐</span>
                          <span>{company.schedule.weekend}</span>
                        </div>
                        <div style={{
                          backgroundColor: '#dcfce7',
                          color: '#16a34a',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          marginTop: '8px',
                          display: 'inline-block'
                        }}>
                          🟢 Obert ara
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Formulario de contacto */}
                  <div>
                    <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                      Formulari de contacte
                    </h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleContactSubmit(); }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                            Nom: *
                          </label>
                          <input
                            type="text"
                            value={contactForm.name}
                            onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px'
                            }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                            Email: *
                          </label>
                          <input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px'
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                          Empresa/Organització:
                        </label>
                        <input
                          type="text"
                          value={contactForm.company}
                          onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                          Telèfon (opcional):
                        </label>
                        <input
                          type="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                          Missatge: *
                        </label>
                        <textarea
                          value={contactForm.message}
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          rows={4}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            resize: 'vertical'
                          }}
                          required
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={contactForm.acceptPolicy}
                            onChange={(e) => setContactForm({...contactForm, acceptPolicy: e.target.checked})}
                            required
                          />
                          <span style={{ fontSize: '14px' }}>Accepto la política de privacitat</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '12px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Enviar missatge →
                      </button>
                    </form>
                  </div>
                </div>

                {/* Mapa */}
                <div style={{ marginTop: '32px' }}>
                  <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                    Ubicació
                  </h3>
                  <div style={{
                    height: '400px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}>
                    🗺️ Mapa de Google Maps (integració pendent)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Informació bàsica */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>ℹ️</span>
                <span>Informació bàsica</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>📂 Sector:</span>
                  <span style={{ fontWeight: '500' }}>{company.sector}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>📍 Ubicació:</span>
                  <span style={{ fontWeight: '500' }}>{company.location}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>👥 Empleats:</span>
                  <span style={{ fontWeight: '500' }}>{company.employees}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>📅 Fundada:</span>
                  <span style={{ fontWeight: '500' }}>{company.founded}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>🌐 Web:</span>
                  <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                    {company.website}
                  </a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>📧 Email:</span>
                  <a href={`mailto:${company.email}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                    Contactar
                  </a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>📞 Telèfon:</span>
                  <a href={`tel:${company.phone}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                    Trucar
                  </a>
                </div>
              </div>
            </div>

            {/* Horari */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🕐</span>
                <span>Horari</span>
              </h3>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>{company.schedule.weekdays}</div>
                <div style={{ marginBottom: '16px' }}>{company.schedule.weekend}</div>
                <div style={{
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  🟢 Obert ara
                </div>
              </div>
            </div>

            {/* Xarxes socials */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🌐</span>
                <span>Xarxes socials</span>
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {company.socialMedia.linkedin && (
                  <a href={company.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#0077b5',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none'
                  }}>
                    in
                  </a>
                )}
                {company.socialMedia.twitter && (
                  <a href={company.socialMedia.twitter} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#1da1f2',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none'
                  }}>
                    𝕏
                  </a>
                )}
                {company.socialMedia.facebook && (
                  <a href={company.socialMedia.facebook} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#4267b2',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none'
                  }}>
                    f
                  </a>
                )}
              </div>
            </div>

            {/* Mini mapa */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📍</span>
                <span>Ubicació</span>
              </h3>
              <div style={{
                height: '150px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                cursor: 'pointer'
              }} onClick={() => setActiveTab('contacte')}>
                🗺️ Mini mapa
              </div>
            </div>

            {/* Empreses similars */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🏢</span>
                <span>Empreses similars</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {similarCompanies.map((similarCompany) => (
                  <div
                    key={similarCompany.id}
                    onClick={() => router.push(`/dashboard/empreses/${similarCompany.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <img
                      src={similarCompany.logo}
                      alt={similarCompany.name}
                      style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{similarCompany.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                        <span>⭐</span>
                        <span>{similarCompany.rating}</span>
                        <span>({similarCompany.reviews})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/dashboard/empreses')}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '8px',
                  background: 'none',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Veure més →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Contactar */}
      {showContactModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Contactar amb {company.name}
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleContactSubmit(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    El teu nom: *
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Email: *
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Empresa/Organització:
                </label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Telèfon:
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Missatge: *
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Serveis d'interès:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Consultoria', 'Desenvolupament', 'Formació', 'Ciberseguretat', 'Altres'].map((service) => (
                    <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={contactForm.services.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setContactForm({...contactForm, services: [...contactForm.services, service]});
                          } else {
                            setContactForm({...contactForm, services: contactForm.services.filter(s => s !== service)});
                          }
                        }}
                      />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={contactForm.acceptPolicy}
                    onChange={(e) => setContactForm({...contactForm, acceptPolicy: e.target.checked})}
                    required
                  />
                  <span style={{ fontSize: '14px' }}>Accepto la política de privacitat</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Enviar missatge →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Compartir */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Compartir empresa
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button
                onClick={() => handleShare('twitter')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>🐦</span>
                <span style={{ fontSize: '14px' }}>Twitter</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>📘</span>
                <span style={{ fontSize: '14px' }}>Facebook</span>
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>💼</span>
                <span style={{ fontSize: '14px' }}>LinkedIn</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>📋</span>
                <span style={{ fontSize: '14px' }}>Copiar enllaç</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}