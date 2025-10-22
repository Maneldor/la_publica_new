'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageTemplate } from '@/components/ui/PageTemplate';
import { useGuardats } from '@/hooks/useGuardats';
import { Heart } from 'lucide-react';

interface Offer {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  company: {
    id: number;
    name: string;
    logo: string;
    rating: number;
    reviews: number;
    verified: boolean;
    memberSince: number;
  };
  images: string[];
  originalPrice: number;
  offerPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  isFree: boolean;
  badges: string[];
  validFrom: string;
  validUntil: string;
  usageCount: number;
  maxUsage: number;
  minQuantity: number;
  maxQuantity: number;
  includes: string[];
  conditions: {
    validity: string;
    usageLimit: string;
    requirements: string[];
    exclusions: string[];
    returns: string;
  };
  instructions: string[];
  promoCode?: string;
  directLink?: string;
  views: number;
  saves: number;
  rating: number;
  reviewCount: number;
  publishedAt: string;
  featured: boolean;
  exclusive: boolean;
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
  verified: boolean;
}

export default function OfferSinglePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  // Hook para gestionar guardats
  const usuariId = 'jordi-garcia'; // En producción, obtener del contexto de auth
  const { isGuardat, isLoading: isLoadingGuardat, handleToggleGuardar } = useGuardats(
    'oferta',
    params.slug,
    usuariId
  );
  const [showModal, setShowModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    quantity: 3,
    comments: '',
    acceptConditions: false,
    acceptPrivacy: false
  });

  // Mock data - en una aplicación real vendría de la API
  const offer: Offer = {
    id: 1,
    title: 'Descuento 25% en Portàtils Professionals',
    description: `Aprofita aquesta oferta exclusiva per a membres de La Pública i aconsegueix portàtils professionals Dell OptiPlex amb un 25% de descompte.

    Ideals per a ajuntaments, diputacions i organismes públics que necessitin renovar el seu equipament tecnològic. Tots els equips són nous i inclouen garantia de 3 anys.

    Els portàtils Dell OptiPlex 7080 són perfectes per a l'ús diari en oficines i administracions. Amb un disseny robust i components de qualitat, garanteixen un rendiment excel·lent per a totes les tasques d'oficina.

    La oferta inclou enviament gratuït a tota Catalunya i servei d'instal·lació opcional per a comandes superiors a 10 unitats.`,
    category: 'Tecnologia',
    subcategory: 'Ordinadors',
    company: {
      id: 1,
      name: 'TechSolutions BCN',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop',
      rating: 4.2,
      reviews: 24,
      verified: true,
      memberSince: 2015
    },
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'
    ],
    originalPrice: 1200,
    offerPrice: 900,
    discount: 25,
    discountType: 'percentage',
    isFree: false,
    badges: ['DESTACADA', 'EXCLUSIVA MEMBRES'],
    validFrom: '2024-10-15',
    validUntil: '2025-12-31',
    usageCount: 23,
    maxUsage: 50,
    minQuantity: 3,
    maxQuantity: 27,
    includes: [
      'Portàtil Dell OptiPlex 7080',
      'Processador Intel Core i5-10500',
      '8GB RAM DDR4',
      '256GB SSD',
      'Windows 10 Pro preinstal·lat',
      'Garantia de 3 anys',
      'Suport tècnic gratuït 1r any',
      'Enviament gratuït a Catalunya',
      'Instal·lació i configuració (opcional)'
    ],
    conditions: {
      validity: 'Oferta vàlida del 15 octubre al 31 desembre 2025',
      usageLimit: 'Màxim 50 unitats disponibles. 23 utilitzades, queden 27 unitats',
      requirements: [
        'Només per a membres verificats de La Pública',
        'Compra mínima: 3 unitats',
        'Organisme públic o empresa col·laboradora'
      ],
      exclusions: [
        'No acumulable amb altres ofertes',
        'No aplicable a models anteriors'
      ],
      returns: 'Dret de devolució fins a 30 dies'
    },
    instructions: [
      'Fes clic al botó "Aprofitar oferta"',
      'Emplena el formulari amb les teves dades',
      'Indica la quantitat d\'unitats desitjades',
      'Rebràs un email amb el codi promocional',
      'Utilitza el codi a la web o contacta directament'
    ],
    promoCode: 'TECH25PUBLICA',
    directLink: 'https://techsolutions.cat/ofertes-lapublica?token=ABC123',
    views: 456,
    saves: 23,
    rating: 4.5,
    reviewCount: 12,
    publishedAt: 'fa 1 mes',
    featured: true,
    exclusive: true
  };

  const reviews: Review[] = [
    {
      id: 1,
      author: 'Maria González',
      organization: 'Ajuntament de Girona',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b593?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      title: 'Oferta excel·lent!',
      content: 'Vam comprar 10 unitats i el servei va ser impecable. El preu és molt competitiu i la qualitat dels equips és excel·lent. Recomanable 100%!',
      date: 'fa 1 setmana',
      helpful: 8,
      verified: true
    },
    {
      id: 2,
      author: 'Joan Martí',
      organization: 'Diputació de Barcelona',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      rating: 4,
      title: 'Bon preu i qualitat',
      content: 'Lliurament ràpid i bon servei al client. Els portàtils funcionen perfectament.',
      date: 'fa 2 setmanes',
      helpful: 3,
      verified: true
    },
    {
      id: 3,
      author: 'Laura Pérez',
      organization: 'Consell Comarcal',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      title: 'Molt satisfeta',
      content: 'Perfecte per a les nostres necessitats. El procés de compra va ser molt senzill.',
      date: 'fa 3 setmanes',
      helpful: 5,
      verified: true
    }
  ];

  const relatedOffers = [
    {
      id: 2,
      title: 'Monitors 24" Full HD',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=200&fit=crop',
      originalPrice: 200,
      offerPrice: 150,
      discount: 25,
      company: 'TechSolutions BCN',
      badge: '-25%'
    },
    {
      id: 3,
      title: 'Impressores multifunció',
      image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=300&h=200&fit=crop',
      originalPrice: 300,
      offerPrice: 225,
      discount: 25,
      company: 'OfficeSupply Pro',
      badge: '-25%'
    },
    {
      id: 4,
      title: 'Tauletes Surface Pro',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=200&fit=crop',
      originalPrice: 800,
      offerPrice: 650,
      discount: 19,
      company: 'TechSolutions BCN',
      badge: '-19%'
    },
    {
      id: 5,
      title: 'Ratolins ergonòmics',
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=200&fit=crop',
      originalPrice: 50,
      offerPrice: 35,
      discount: 30,
      company: 'ErgoTech',
      badge: '-30%'
    }
  ];

  const companyOffers = [
    {
      id: 6,
      title: 'Servidores Dell PowerEdge',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=200&fit=crop',
      originalPrice: 2500,
      offerPrice: 2000,
      discount: 20,
      company: 'TechSolutions BCN',
      badge: '-20%'
    },
    {
      id: 7,
      title: 'Licencias Office 365',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
      originalPrice: 100,
      offerPrice: 75,
      discount: 25,
      company: 'TechSolutions BCN',
      badge: '-25%'
    },
    {
      id: 8,
      title: 'Switches de xarxa',
      image: 'https://images.unsplash.com/photo-1606904825346-8def6b736823?w=300&h=200&fit=crop',
      originalPrice: 500,
      offerPrice: 400,
      discount: 20,
      company: 'TechSolutions BCN',
      badge: '-20%'
    },
    {
      id: 9,
      title: 'Webcams HD per videoconferència',
      image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=300&h=200&fit=crop',
      originalPrice: 80,
      offerPrice: 60,
      discount: 25,
      company: 'TechSolutions BCN',
      badge: '-25%'
    }
  ];

  const statsData = [
    { label: 'Descompte', value: `${offer.discount}%`, trend: `${offer.originalPrice - offer.offerPrice}€` },
    { label: 'Disponibles', value: `${offer.maxUsage - offer.usageCount}`, trend: `de ${offer.maxUsage}` },
    { label: 'Valoració', value: `${offer.rating}/5`, trend: `${offer.reviewCount} ressenyes` },
    { label: 'Vistes', value: offer.views.toString(), trend: '+12%' }
  ];

  // Cargar estado inicial de favoritos
  useEffect(() => {
    const savedOffers = JSON.parse(localStorage.getItem('lapublica_saved_offers') || '[]');
    setIsSaved(savedOffers.includes(offer.id));
  }, [offer.id]);

  const handleSaveOffer = () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    const savedOffers = JSON.parse(localStorage.getItem('lapublica_saved_offers') || '[]');
    if (newSavedState) {
      if (!savedOffers.includes(offer.id)) {
        savedOffers.push(offer.id);
      }
    } else {
      const index = savedOffers.indexOf(offer.id);
      if (index > -1) {
        savedOffers.splice(index, 1);
      }
    }
    localStorage.setItem('lapublica_saved_offers', JSON.stringify(savedOffers));
  };

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/dashboard/ofertes/${params.slug}`;
    const text = `🎁 ${offer.title}\n💰 ${offer.originalPrice}€ → ${offer.offerPrice}€ (-${offer.discount}%)\n🏢 ${offer.company.name}\n\nVes l'oferta a La Pública:`;

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
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Enllaç copiat al portapapers!');
        break;
    }
    setShowShareModal(false);
  };

  const calculateTotal = () => {
    return formData.quantity * offer.offerPrice;
  };

  const calculateSavings = () => {
    return formData.quantity * (offer.originalPrice - offer.offerPrice);
  };

  const generateCoupon = () => {
    const couponId = `CP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const qrData = `https://lapublica.cat/coupon/${couponId}`;
    const barcodeData = couponId.replace(/-/g, '');

    return {
      id: couponId,
      title: offer.title,
      company: offer.company.name,
      companyLogo: offer.company.logo,
      originalPrice: offer.originalPrice,
      offerPrice: offer.offerPrice,
      discount: offer.discount,
      quantity: formData.quantity,
      totalSavings: formData.quantity * (offer.originalPrice - offer.offerPrice),
      totalAmount: formData.quantity * offer.offerPrice,
      customerName: formData.name,
      customerEmail: formData.email,
      organization: formData.organization,
      validUntil: offer.validUntil,
      qrCode: qrData,
      barcode: barcodeData,
      terms: offer.conditions.requirements,
      redemptionInstructions: [
        'Presenta este cupón en formato digital o impreso',
        'Válido únicamente para la cantidad especificada',
        'No acumulable con otras ofertas',
        'Válido hasta la fecha de expiración'
      ],
      issuedAt: new Date().toLocaleDateString('es-ES'),
      status: 'active'
    };
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.organization.trim() ||
        !formData.phone.trim() || !formData.acceptConditions || !formData.acceptPrivacy) {
      alert('Por favor, completa todos los campos obligatorios y acepta las condiciones.');
      return;
    }

    console.log('Solicitud de oferta:', formData);
    setShowModal(false);

    // Generar cupón profesional
    const newCoupon = generateCoupon();
    setGeneratedCoupon(newCoupon);
    setShowCouponModal(true);

    // Reset form
    setFormData({
      name: '',
      email: '',
      organization: '',
      phone: '',
      quantity: 3,
      comments: '',
      acceptConditions: false,
      acceptPrivacy: false
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < rating ? '#fbbf24' : '#d1d5db', fontSize: '16px' }}>⭐</span>
    ));
  };

  if (!offer) {
    return (
      <PageTemplate
        title="Oferta"
        subtitle="Detalls de l'oferta"
        statsData={statsData}
      >
        <div style={{ padding: '0 24px 24px 24px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
            <h2 style={{ color: '#6b7280', margin: 0 }}>Oferta no trobada</h2>
          </div>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Oferta"
      subtitle="Detalls de l'oferta exclusiva"
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
              onClick={() => router.push('/dashboard/ofertes')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' }}
            >
              Ofertes
            </button>
            <span>•</span>
            <span style={{ color: '#3b82f6' }}>{offer.category}</span>
            <span>•</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{offer.title}</span>
          </div>
        </div>

        {/* Hero - Opció B: 2 Columnes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

            {/* Galeria d'imatges */}
            <div>
              {/* Imatge principal */}
              <div style={{
                position: 'relative',
                marginBottom: '16px',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <img
                  src={offer.images[currentImageIndex]}
                  alt={offer.title}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowLightbox(true)}
                />

                {/* Badges sobre la imatge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <span style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    -{offer.discount}%
                  </span>
                  {offer.featured && (
                    <span style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      DESTACADA
                    </span>
                  )}
                </div>

                {/* Comptador d'imatges */}
                {offer.images.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {currentImageIndex + 1} / {offer.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {offer.images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {offer.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      style={{
                        width: '80px',
                        height: '60px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: `2px solid ${index === currentImageIndex ? '#3b82f6' : '#e5e7eb'}`,
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <img
                        src={image}
                        alt={`${offer.title} ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informació de l'oferta */}
            <div>
              {/* Badges i títol */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {offer.badges.map((badge, index) => (
                    <span key={index} style={{
                      backgroundColor: badge === 'DESTACADA' ? '#dbeafe' : '#fef3c7',
                      color: badge === 'DESTACADA' ? '#1d4ed8' : '#d97706',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {badge}
                    </span>
                  ))}
                </div>

                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 12px 0',
                  lineHeight: '1.2'
                }}>
                  {offer.title}
                </h1>
              </div>

              {/* Preus */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '24px',
                    color: '#6b7280',
                    textDecoration: 'line-through'
                  }}>
                    {offer.originalPrice}€
                  </span>
                  <span style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#16a34a'
                  }}>
                    {offer.offerPrice}€
                  </span>
                </div>
                <div style={{
                  color: '#16a34a',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  Estalvia {offer.originalPrice - offer.offerPrice}€!
                </div>
              </div>

              {/* Empresa */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <img
                  src={offer.company.logo}
                  alt={offer.company.name}
                  style={{ width: '48px', height: '48px', borderRadius: '8px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', color: '#111827' }}>{offer.company.name}</span>
                    {offer.company.verified && (
                      <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {renderStars(Math.floor(offer.company.rating))}
                    </div>
                    <span>{offer.company.rating}</span>
                    <span>({offer.company.reviews})</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/empreses/${offer.company.id}`)}
                  style={{
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Veure empresa →
                </button>
              </div>

              {/* Vigència i disponibilitat */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>⏰ Vàlida fins</div>
                  <div style={{ fontWeight: '600', color: '#92400e' }}>31 desembre 2025</div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>🎯 Disponibles</div>
                  <div style={{ fontWeight: '600', color: '#166534' }}>{offer.maxUsage - offer.usageCount} de {offer.maxUsage}</div>
                </div>
              </div>

              {/* Botons d'acció */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    width: '100%',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🎯</span>
                  <span>Aprofitar oferta</span>
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleSaveOffer}
                    style={{
                      flex: 1,
                      backgroundColor: isSaved ? '#fef2f2' : 'white',
                      color: isSaved ? '#dc2626' : '#374151',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${isSaved ? '#fca5a5' : '#d1d5db'}`,
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{isSaved ? '❤️' : '🤍'}</span>
                    <span>Guardar</span>
                  </button>

                  <button
                    onClick={() => setShowShareModal(true)}
                    style={{
                      flex: 1,
                      backgroundColor: 'white',
                      color: '#374151',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
        </div>

        {/* Layout principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>

          {/* Contingut principal */}
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
                <span>Descripció</span>
              </h2>
              <div style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#374151',
                whiteSpace: 'pre-line'
              }}>
                {offer.description}
              </div>
            </div>

            {/* Què inclou */}
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
                <span>✨</span>
                <span>Què inclou aquesta oferta</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {offer.includes.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#10b981', fontSize: '18px' }}>✓</span>
                    <span style={{ color: '#374151' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Condicions */}
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
                <span>📋</span>
                <span>Condicions</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    ⏰ Vigència:
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>{offer.conditions.validity}</p>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    🎯 Límit d'usos:
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>{offer.conditions.usageLimit}</p>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    👥 Requisits:
                  </h3>
                  <ul style={{ color: '#6b7280', margin: 0, paddingLeft: '20px' }}>
                    {offer.conditions.requirements.map((req, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    ❌ Exclusions:
                  </h3>
                  <ul style={{ color: '#6b7280', margin: 0, paddingLeft: '20px' }}>
                    {offer.conditions.exclusions.map((exc, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>{exc}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    🔄 Devolucions:
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>{offer.conditions.returns}</p>
                </div>
              </div>
            </div>

            {/* Com aprofitar-la */}
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
                <span>Com aprofitar aquesta oferta</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {offer.instructions.map((instruction, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <span style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ color: '#374151' }}>{instruction}</span>
                  </div>
                ))}
              </div>

              <div style={{
                backgroundColor: '#dbeafe',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <p style={{
                  color: '#1e40af',
                  margin: 0,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>ℹ️</span>
                  <span>Si tens dubtes, pots contactar directament amb {offer.company.name} a través del formulari inferior.</span>
                </p>
              </div>
            </div>

            {/* Empresa relacionada */}
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
                <span>🏢</span>
                <span>Sobre l'empresa</span>
              </h2>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <img
                  src={offer.company.logo}
                  alt={offer.company.name}
                  style={{ width: '80px', height: '80px', borderRadius: '12px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {offer.company.name}
                    </h3>
                    {offer.company.verified && (
                      <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
                    )}
                  </div>
                  <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>Partner tecnològic</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {renderStars(Math.floor(offer.company.rating))}
                      <span style={{ marginLeft: '4px', fontWeight: '600' }}>{offer.company.rating}</span>
                      <span style={{ color: '#6b7280' }}>({offer.company.reviews} valoracions)</span>
                    </div>
                    <span style={{ color: '#6b7280' }}>• Barcelona • Tecnologia</span>
                  </div>
                </div>
              </div>

              <p style={{ color: '#374151', marginBottom: '16px', lineHeight: '1.6' }}>
                Especialistes en transformació digital per al sector públic. Més de 150 projectes completats amb ajuntaments i diputacions des de 2015.
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => router.push(`/dashboard/empreses/${offer.company.id}`)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Veure perfil complet →
                </button>
                <button
                  style={{
                    backgroundColor: 'white',
                    color: '#374151',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Contactar empresa
                </button>
              </div>
            </div>

            {/* Més ofertes d'aquesta empresa */}
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
                <span>Més ofertes de {offer.company.name}</span>
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {companyOffers.map((relatedOffer) => (
                  <div
                    key={relatedOffer.id}
                    onClick={() => router.push(`/dashboard/ofertes/${relatedOffer.id}`)}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={relatedOffer.image}
                        alt={relatedOffer.title}
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {relatedOffer.badge}
                      </span>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <h3 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px', color: '#111827' }}>
                        {relatedOffer.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#6b7280', textDecoration: 'line-through', fontSize: '14px' }}>
                          {relatedOffer.originalPrice}€
                        </span>
                        <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '16px' }}>
                          {relatedOffer.offerPrice}€
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  onClick={() => router.push(`/dashboard/ofertes?empresa=${offer.company.id}`)}
                  style={{
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Veure totes les ofertes d'aquesta empresa →
                </button>
              </div>
            </div>

            {/* Ofertes relacionades */}
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
                <span>🔗</span>
                <span>Ofertes similars que et poden interessar</span>
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {relatedOffers.map((relatedOffer) => (
                  <div
                    key={relatedOffer.id}
                    onClick={() => router.push(`/dashboard/ofertes/${relatedOffer.id}`)}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={relatedOffer.image}
                        alt={relatedOffer.title}
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {relatedOffer.badge}
                      </span>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <h3 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', color: '#111827' }}>
                        {relatedOffer.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                        {relatedOffer.company}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#6b7280', textDecoration: 'line-through', fontSize: '14px' }}>
                          {relatedOffer.originalPrice}€
                        </span>
                        <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '16px' }}>
                          {relatedOffer.offerPrice}€
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  onClick={() => router.push(`/dashboard/ofertes?categoria=${offer.category}`)}
                  style={{
                    color: '#3b82f6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Veure més ofertes de {offer.category} →
                </button>
              </div>
            </div>

            {/* Valoracions */}
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
                <span>Valoracions ({offer.reviewCount})</span>
              </h2>

              {/* Resum valoracions */}
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '700' }}>{offer.rating}</span>
                  <span>/</span>
                  <span style={{ fontSize: '18px' }}>5</span>
                  <div style={{ display: 'flex' }}>
                    {renderStars(Math.floor(offer.rating))}
                  </div>
                </div>
              </div>

              {/* Lista de valoracions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <img
                        src={review.avatar}
                        alt={review.author}
                        style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: '#111827' }}>{review.author}</span>
                          {review.verified && (
                            <span style={{ color: '#10b981', fontSize: '12px' }}>✓ Verificat</span>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>{review.organization}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', marginBottom: '4px' }}>
                          {renderStars(review.rating)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{review.date}</div>
                      </div>
                    </div>

                    <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px', fontSize: '16px' }}>
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
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Escriure una valoració
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Resum oferta */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '80px'
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
                <span>📋</span>
                <span>Resum de l'oferta</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280' }}>💰 Preu:</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#6b7280', textDecoration: 'line-through', fontSize: '14px' }}>
                      {offer.originalPrice}€
                    </span>
                    <div style={{ color: '#16a34a', fontWeight: '600', fontSize: '18px' }}>
                      {offer.offerPrice}€
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>💵 Estalvi:</span>
                  <span style={{ color: '#16a34a', fontWeight: '600' }}>
                    {offer.originalPrice - offer.offerPrice}€ ({offer.discount}%)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>⏰ Vàlida:</span>
                  <span style={{ fontWeight: '500' }}>31 desembre 2025</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>📦 Usos:</span>
                  <span style={{ fontWeight: '500' }}>{offer.usageCount}/{offer.maxUsage} utilitzades</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>🎯 Queden:</span>
                  <span style={{ fontWeight: '500', color: '#16a34a' }}>{offer.maxUsage - offer.usageCount} unitats</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}
              >
                <span>🎯</span>
                <span>Aprofitar oferta</span>
              </button>

              {/* Botón Guardar Oferta */}
              <button
                onClick={() => handleToggleGuardar({
                  titol: offer.title,
                  imatge: offer.images[0],
                  url: `/dashboard/ofertes/${params.slug}`,
                  description: offer.description.substring(0, 100) + '...',
                  price: offer.offerPrice,
                  company: offer.company.name,
                  status: 'activa'
                })}
                disabled={isLoadingGuardat}
                style={{
                  width: '100%',
                  backgroundColor: isGuardat ? '#fef2f2' : '#f9fafb',
                  color: isGuardat ? '#dc2626' : '#374151',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${isGuardat ? '#fecaca' : '#e5e7eb'}`,
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isLoadingGuardat ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isLoadingGuardat ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isLoadingGuardat) {
                    e.currentTarget.style.backgroundColor = isGuardat ? '#fee2e2' : '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoadingGuardat) {
                    e.currentTarget.style.backgroundColor = isGuardat ? '#fef2f2' : '#f9fafb';
                  }
                }}
              >
                <Heart
                  style={{
                    width: '16px',
                    height: '16px',
                    fill: isGuardat ? '#dc2626' : 'none',
                    stroke: isGuardat ? '#dc2626' : '#374151'
                  }}
                />
                <span>
                  {isLoadingGuardat ? 'Carregant...' : isGuardat ? 'Oferta guardada' : 'Guardar oferta'}
                </span>
              </button>
            </div>

            {/* Empresa */}
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
                <span>Empresa</span>
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img
                  src={offer.company.logo}
                  alt={offer.company.name}
                  style={{ width: '50px', height: '50px', borderRadius: '8px' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: '#111827' }}>{offer.company.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                    <span>⭐</span>
                    <span>{offer.company.rating}</span>
                    <span style={{ color: '#6b7280' }}>({offer.company.reviews})</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => router.push(`/dashboard/empreses/${offer.company.id}`)}
                  style={{
                    width: '100%',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Veure perfil
                </button>
                <button
                  onClick={() => router.push(`/dashboard/ofertes?empresa=${offer.company.id}`)}
                  style={{
                    width: '100%',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Més ofertes
                </button>
              </div>
            </div>

            {/* Contacte ràpid */}
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
                <span>📞</span>
                <span>Contacte ràpid</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <span>💬</span>
                  <span>Enviar missatge</span>
                </button>
                <button style={{
                  width: '100%',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <span>📧</span>
                  <span>Email directe</span>
                </button>
                <button style={{
                  width: '100%',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <span>📞</span>
                  <span>Trucar</span>
                </button>
              </div>
            </div>

            {/* Compartir */}
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
                <span>🔗</span>
                <span>Compartir oferta</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  onClick={() => handleShare('twitter')}
                  style={{
                    backgroundColor: '#1da1f2',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  style={{
                    backgroundColor: '#4267b2',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  style={{
                    backgroundColor: '#0077b5',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  style={{
                    backgroundColor: '#25d366',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Email
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  style={{
                    backgroundColor: '#374151',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Accions */}
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
                <span>❤️</span>
                <span>Accions</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleSaveOffer}
                  style={{
                    width: '100%',
                    backgroundColor: isSaved ? '#fef2f2' : '#f3f4f6',
                    color: isSaved ? '#dc2626' : '#374151',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{isSaved ? '❤️' : '🤍'}</span>
                  <span>{isSaved ? 'Guardada' : 'Guardar oferta'}</span>
                </button>
                <button style={{
                  width: '100%',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <span>🚩</span>
                  <span>Reportar</span>
                </button>
              </div>
            </div>

            {/* Estadístiques */}
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
                <span>📊</span>
                <span>Estadístiques</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>👁️ Vistes:</span>
                  <span style={{ fontWeight: '500' }}>{offer.views}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>❤️ Guardades:</span>
                  <span style={{ fontWeight: '500' }}>{offer.saves}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>🎯 Utilitzades:</span>
                  <span style={{ fontWeight: '500' }}>{offer.usageCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>📅 Publicada:</span>
                  <span style={{ fontWeight: '500' }}>{offer.publishedAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Aprofitar Oferta */}
      {showModal && (
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
            padding: '24px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                Aprofitar oferta: {offer.title}
              </h3>
              <button
                onClick={() => setShowModal(false)}
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

            <div style={{
              backgroundColor: '#dbeafe',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                Preu amb descompte: {offer.offerPrice}€/unitat
              </div>
              <div style={{ color: '#1e40af' }}>
                Estalvi: {offer.originalPrice - offer.offerPrice}€ per unitat
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                    Nom complet: *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  Organisme/Empresa: *
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  placeholder="Ajuntament de..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Telèfon: *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Quantitat d'unitats: *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="number"
                    min={offer.minQuantity}
                    max={offer.maxQuantity}
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    style={{
                      width: '100px',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px'
                    }}
                    required
                  />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    (mínim {offer.minQuantity}, màxim {offer.maxQuantity} disponibles)
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ fontWeight: '600', fontSize: '18px', marginBottom: '8px' }}>
                  Total: {calculateTotal().toLocaleString()}€
                </div>
                <div style={{ color: '#16a34a', fontWeight: '500' }}>
                  (estalvis {calculateSavings().toLocaleString()}€!)
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Comentaris addicionals:
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  placeholder="Necessitem lliurament abans de..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.acceptConditions}
                    onChange={(e) => setFormData({...formData, acceptConditions: e.target.checked})}
                    required
                  />
                  <span style={{ fontSize: '14px' }}>Accepto les condicions d'aquesta oferta</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.acceptPrivacy}
                    onChange={(e) => setFormData({...formData, acceptPrivacy: e.target.checked})}
                    required
                  />
                  <span style={{ fontSize: '14px' }}>Accepto la política de privacitat</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  Sol·licitar oferta →
                </button>
              </div>

              <div style={{
                backgroundColor: '#dbeafe',
                padding: '12px',
                borderRadius: '6px',
                marginTop: '16px'
              }}>
                <p style={{ fontSize: '14px', color: '#1e40af', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>ℹ️</span>
                  <span>Rebràs un email de confirmació amb el codi promocional i les instruccions per completar la compra.</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cupón Profesional */}
      {showCouponModal && generatedCoupon && (
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
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            padding: '0',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            {/* Header del modal */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '16px 16px 0 0',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowCouponModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  🎫
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>
                    ¡Cupón Generado!
                  </h2>
                  <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
                    Tu cupón está listo para usar
                  </p>
                </div>
              </div>
            </div>

            {/* Cupón principal */}
            <div style={{
              margin: '24px',
              border: '3px dashed #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: '#fafafa'
            }}>
              {/* Header del cupón */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderBottom: '2px dashed #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={generatedCoupon.companyLogo}
                      alt={generatedCoupon.company}
                      style={{ width: '50px', height: '50px', borderRadius: '8px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '18px', color: '#111827' }}>
                        {generatedCoupon.company}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        Cupón ID: {generatedCoupon.id}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    -{generatedCoupon.discount}%
                  </div>
                </div>

                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {generatedCoupon.title}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Precio Original</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', textDecoration: 'line-through' }}>
                      {generatedCoupon.originalPrice}€
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Precio con Descuento</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a' }}>
                      {generatedCoupon.offerPrice}€
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>Cantidad</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                      {generatedCoupon.quantity} unidades
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#ddd6fe',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', color: '#1e40af', marginBottom: '4px' }}>
                    💰 Total a pagar: <span style={{ fontSize: '20px', fontWeight: '700' }}>{generatedCoupon.totalAmount.toLocaleString()}€</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
                    ¡Ahorras {generatedCoupon.totalSavings.toLocaleString()}€!
                  </div>
                </div>
              </div>

              {/* Sección de códigos */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderBottom: '2px dashed #e5e7eb'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Código QR */}
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                      Código QR
                    </h4>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: '#f3f4f6',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      margin: '0 auto 8px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px'
                    }}>
                      📱
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Escanea para validar
                    </div>
                  </div>

                  {/* Código de Barras */}
                  <div style={{ textAlign: 'center' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                      Código de Barras
                    </h4>
                    <div style={{
                      height: '60px',
                      backgroundColor: '#f3f4f6',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      margin: '0 auto 8px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'repeating-linear-gradient(90deg, #111 0px, #111 2px, #fff 2px, #fff 4px)'
                    }}>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {generatedCoupon.barcode}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Para lectura manual
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del cliente */}
              <div style={{
                backgroundColor: 'white',
                padding: '24px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                  Datos del Cliente
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>Nombre: </span>
                    <span style={{ fontWeight: '600' }}>{generatedCoupon.customerName}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Email: </span>
                    <span style={{ fontWeight: '600' }}>{generatedCoupon.customerEmail}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Organización: </span>
                    <span style={{ fontWeight: '600' }}>{generatedCoupon.organization}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280' }}>Válido hasta: </span>
                    <span style={{ fontWeight: '600', color: '#dc2626' }}>{generatedCoupon.validUntil}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instrucciones de canje */}
            <div style={{ padding: '0 24px 16px 24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                📋 Instrucciones de Canje
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0, color: '#374151' }}>
                {generatedCoupon.redemptionInstructions.map((instruction: string, index: number) => (
                  <li key={index} style={{ marginBottom: '4px', fontSize: '14px' }}>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

            {/* Botones de acción */}
            <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🖨️ Imprimir
                </button>
                <button
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  📧 Enviar Email
                </button>
                <button
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  📱 Añadir a Wallet
                </button>
              </div>

              <button
                onClick={() => setShowCouponModal(false)}
                style={{
                  width: '100%',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  marginTop: '12px'
                }}
              >
                Cerrar
              </button>
            </div>
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
                Compartir oferta
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
                onClick={() => handleShare('whatsapp')}
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
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>💬</span>
                <span style={{ fontSize: '14px' }}>WhatsApp</span>
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
                  cursor: 'pointer',
                  gridColumn: '1 / -1'
                }}
              >
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>📋</span>
                <span style={{ fontSize: '14px' }}>Copiar enllaç</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setShowLightbox(false)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={offer.images[currentImageIndex]}
              alt={offer.title}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />

            {offer.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : offer.images.length - 1);
                  }}
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(currentImageIndex < offer.images.length - 1 ? currentImageIndex + 1 : 0);
                  }}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px'
                  }}
                >
                  →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </PageTemplate>
  );
}