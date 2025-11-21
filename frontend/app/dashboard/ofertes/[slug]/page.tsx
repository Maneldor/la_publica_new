'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { PageTemplate } from '@/components/ui/PageTemplate';
import { useGuardats } from '@/hooks/useGuardats';
import RedeemButton from '@/app/components/ofertes/RedeemButton';
import {
  Heart,
  Share2,
  Download,
  QrCode,
  Star,
  Clock,
  Users,
  Eye,
  ShoppingCart,
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

// Interfaces que coinciden exactamente con las respuestas de nuestras APIs
interface Company {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  plan: string;
  verified: boolean;
  rating: number;
  reviews: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

interface Offer {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  images: string[];
  price: number;
  originalPrice: number | null;
  discountPercentage: number;
  currency: string;
  priceType: string;
  category: Category;
  company: Company;
  location: string | null;
  remote: boolean;
  featured: boolean;
  featuredUntil: Date | null;
  expiresAt: Date | null;
  publishedAt: Date;
  contactMethod: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactForm: string | null;
  externalUrl: string | null;
  redemptionType: 'COUPON' | 'ONLINE' | 'VIP_ACCOUNT' | 'CONTACT_FORM'; // 🆕 Agregar redemptionType
  requirements: string | null;
  benefits: string | null;
  duration: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  tags: string[];
  stats: {
    views: number;
    saves: number;
    couponsGenerated: number;
    couponsUsed: number;
    conversionRate: number;
    totalEvents: number;
  };
  isFavorite: boolean;
  hasActiveCoupon: boolean;
  activeCoupon: {
    id: string;
    code: string;
    expiresAt: Date;
    qrCodeUrl: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Coupon {
  id: string;
  code: string;
  qrCodeData: string | null;
  expiresAt: Date;
  generatedAt: Date;
  offer: {
    id: string;
    title: string;
    company: string;
  };
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
  const { data: session } = useSession();

  // Estados principales
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Estados de UI
  const [showModal, setShowModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  // Form data para generar cupón
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    organization: '',
    phone: '',
    quantity: 1,
    comments: '',
    acceptConditions: false,
    acceptPrivacy: false
  });

  // Hook para gestionar favoritos
  const { isGuardat, isLoading: isLoadingGuardat, handleToggleGuardar } = useGuardats(
    'oferta',
    params.slug,
    session?.user?.id || ''
  );

  // Cargar datos de la oferta
  useEffect(() => {
    const loadOffer = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/ofertas/detail/${params.slug}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Oferta no trobada' : 'Error al carregar l\'oferta');
        }

        const data = await response.json();
        setOffer(data.offer);

        // Si el usuario está logueado, verificar si tiene un cupón activo
        if (session?.user && data.offer) {
          checkActiveCoupon(data.offer.id);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconegut');
        console.error('Error loading offer:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOffer();
  }, [params.slug, session?.user]);

  // Verificar cupón activo
  const checkActiveCoupon = async (offerId: string) => {
    try {
      const response = await fetch(`/api/ofertas/${offerId}/coupon`);
      if (response.ok) {
        const data = await response.json();
        if (data.coupon) {
          setActiveCoupon(data.coupon);
        }
      }
    } catch (err) {
      console.error('Error checking active coupon:', err);
    }
  };

  // Generar cupón
  const handleGenerateCoupon = async () => {
    if (!offer || !session?.user) return;

    try {
      setCouponLoading(true);

      const response = await fetch(`/api/ofertas/${offer.id}/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el cupó');
      }

      const data = await response.json();
      setActiveCoupon(data.coupon);
      setShowModal(false);
      setShowCouponModal(true);

    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al generar el cupó');
    } finally {
      setCouponLoading(false);
    }
  };

  // Calcular precios y descuentos
  const getDiscountPercentage = () => {
    return offer?.discountPercentage || 0;
  };

  const getDiscountAmount = () => {
    if (!offer?.originalPrice || offer.originalPrice <= offer.price) return 0;
    return offer.originalPrice - offer.price;
  };

  const getTotalSavings = () => {
    return getDiscountAmount() * formData.quantity;
  };

  const getTotalPrice = () => {
    return offer ? offer.price * formData.quantity : 0;
  };

  // Compartir oferta
  const handleShare = () => {
    if (navigator.share && offer) {
      navigator.share({
        title: offer.title,
        text: `Mira aquesta oferta: ${offer.title}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      setShowShareModal(true);
    }
  };

  // Descargar QR del cupón
  const downloadQR = () => {
    if (!activeCoupon?.qrCodeData) return;

    const link = document.createElement('a');
    link.download = `cupon-${activeCoupon.code}.png`;
    link.href = activeCoupon.qrCodeData;
    link.click();
  };

  // Loading state
  if (loading) {
    return (
      <PageTemplate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-lg h-96"></div>
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-200 rounded-lg h-20 w-20"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </PageTemplate>
    );
  }

  // Error state
  if (error || !offer) {
    return (
      <PageTemplate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Oferta no trobada'}
          </h1>
          <p className="text-gray-600 mb-6">
            Ho sentim, no hem pogut carregar aquesta oferta.
          </p>
          <button
            onClick={() => router.push('/dashboard/ofertes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tornar a ofertes
          </button>
        </div>
      </PageTemplate>
    );
  }

  const discountPercentage = getDiscountPercentage();

  return (
    <PageTemplate>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <button
                onClick={() => router.push('/dashboard/ofertes')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Ofertes
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <button
                onClick={() => router.push(`/dashboard/ofertes?category=${offer.category.slug}`)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                {offer.category.name}
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 text-sm truncate max-w-xs">
              {offer.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de Imágenes */}
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
              <Image
                src={offer.images[currentImageIndex] || '/placeholder-offer.jpg'}
                alt={offer.title}
                width={600}
                height={400}
                className="w-full h-96 object-cover"
                onClick={() => setShowLightbox(true)}
                priority
              />

              {offer.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev =>
                      prev === 0 ? offer.images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev =>
                      prev === offer.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {offer.featured && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    ⭐ DESTACADA
                  </span>
                )}
                {offer.exclusive && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    👑 EXCLUSIVA
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleToggleGuardar()}
                  disabled={isLoadingGuardat}
                  className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                    isGuardat
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-700 hover:bg-white'
                  }`}
                  title={isGuardat ? 'Eliminar de guardats' : 'Guardar oferta'}
                >
                  <Heart className={`h-5 w-5 ${isGuardat ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="bg-white/90 text-gray-700 hover:bg-white p-2 rounded-full backdrop-blur-sm transition-colors"
                  title="Compartir oferta"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {offer.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {offer.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${offer.title} - imagen ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información de la Oferta */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {offer.title}
              </h1>

              {/* Company Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={offer.company.logo || '/placeholder-company.jpg'}
                      alt={offer.company.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{offer.company.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span>{offer.company.rating.toFixed(1)}</span>
                      </div>
                      <span>•</span>
                      <span>{offer.company.reviews} valoracions</span>
                      {offer.company.verified && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verificada
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{offer.stats.views} visualitzacions</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>{offer.stats.saves} guardades</span>
                </div>
                {offer.company.reviews > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    <span>{offer.company.rating.toFixed(1)} ({offer.company.reviews})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  {offer.originalPrice && offer.originalPrice > offer.price ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl font-bold text-green-600">
                          {offer.price.toFixed(2)}€
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {offer.originalPrice.toFixed(2)}€
                        </span>
                      </div>
                      <div className="text-green-600 font-semibold mt-1">
                        Estalvis {getDiscountAmount().toFixed(2)}€ per unitat
                      </div>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      {offer.price.toFixed(2)}€
                    </span>
                  )}
                </div>

                {discountPercentage > 0 && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-lg font-bold">
                    -{discountPercentage}%
                  </div>
                )}
              </div>

              {/* Disponibilidad basada en estadísticas */}
              {offer.stats.couponsGenerated > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Conversió</span>
                    <span className="font-semibold">
                      {offer.stats.couponsUsed} de {offer.stats.couponsGenerated} cupons utilitzats
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${offer.stats.conversionRate}%`
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Taxa de conversió: {offer.stats.conversionRate}%
                  </div>
                </div>
              )}

              {/* Caducidad */}
              {offer.expiresAt && (
                <div className="flex items-center text-sm text-orange-600 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    Vàlida fins: {new Date(offer.expiresAt).toLocaleDateString('ca-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Badge Tipo de Redención */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Tipus de redempció:</span>
              {offer.redemptionType === 'COUPON' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  Cupó QR
                </span>
              )}
              {offer.redemptionType === 'ONLINE' && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Enllaç extern
                </span>
              )}
              {offer.redemptionType === 'VIP_ACCOUNT' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3" />
                  Moneder digital
                </span>
              )}
              {offer.redemptionType === 'CONTACT_FORM' && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Formulari contacte
                </span>
              )}
            </div>

            {/* Botón Principal */}
            <div className="space-y-4">
              {offer.hasActiveCoupon && offer.activeCoupon ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center text-green-700 font-semibold mb-1">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Tens un cupó actiu
                        </div>
                        <div className="text-sm text-green-600">
                          Codi: {offer.activeCoupon.code}
                        </div>
                        <div className="text-xs text-green-600">
                          Caduca: {new Date(offer.activeCoupon.expiresAt).toLocaleDateString('ca-ES')}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveCoupon({
                            id: offer.activeCoupon!.id,
                            code: offer.activeCoupon!.code,
                            qrCodeData: offer.activeCoupon!.qrCodeUrl,
                            expiresAt: offer.activeCoupon!.expiresAt,
                            generatedAt: new Date(), // Placeholder
                            offer: {
                              id: offer.id,
                              title: offer.title,
                              company: offer.company.name
                            }
                          });
                          setShowCouponModal(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        Veure cupó
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {session?.user ? (
                    <>
                      {/* Botón original para COUPON */}
                      {offer.redemptionType === 'COUPON' && (
                        <button
                          onClick={() => setShowModal(true)}
                          disabled={couponLoading}
                          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {couponLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Generant cupó...
                            </div>
                          ) : (
                            <>
                              <QrCode className="inline h-5 w-5 mr-2" />
                              Generar cupó
                            </>
                          )}
                        </button>
                      )}

                      {/* Nuevo botón dinámico para otros tipos */}
                      <RedeemButton
                        offer={offer}
                        onRedeemSuccess={() => {
                          // Opcional: refetch de la oferta, analytics, etc.
                          console.log('Redempció exitosa!');
                        }}
                      />
                    </>
                  ) : (
                    <button
                      onClick={() => router.push('/auth/signin')}
                      className="w-full bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      Inicia sessió per aprofitar l'oferta
                    </button>
                  )}
                </>
              )}

              {/* Info adicional según tipo de redención */}
              <div className="mt-4 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                {offer.redemptionType === 'COUPON' && (
                  <p>💡 Genera un cupó únic amb codi QR per utilitzar a la botiga física o online</p>
                )}
                {offer.redemptionType === 'ONLINE' && offer.externalUrl && (
                  <p>💡 Seràs redirigit a <strong>{new URL(offer.externalUrl).hostname}</strong> per completar la compra amb descompte</p>
                )}
                {offer.redemptionType === 'VIP_ACCOUNT' && (
                  <p>💡 El descompte s'afegirà al teu moneder digital per usar quan vulguis en futures compres</p>
                )}
                {offer.redemptionType === 'CONTACT_FORM' && (
                  <p>💡 L'empresa <strong>{offer.company.name}</strong> es posarà en contacte amb tu per gestionar l'oferta</p>
                )}
              </div>

              {/* Info adicional */}
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div className="text-gray-600">
                  <span className="font-semibold">Categoria:</span> {offer.category.name}
                </div>
                <div className="text-gray-600">
                  <span className="font-semibold">Modalitat:</span> {offer.remote ? 'Remot' : 'Presencial'}
                </div>
                {offer.location && (
                  <div className="text-gray-600 col-span-2">
                    <span className="font-semibold">Ubicació:</span> {offer.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información Detallada */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Descripción */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descripció de l'oferta</h2>
              <div className="prose max-w-none text-gray-700">
                {offer.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Requisitos */}
            {offer.requirements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📋 Requisitos
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="prose max-w-none text-gray-700 text-sm">
                    {offer.requirements.split('\n').map((req, index) => (
                      <p key={index} className="mb-2">
                        {req}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Beneficios */}
            {offer.benefits && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ✨ Beneficis inclosos
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="prose max-w-none text-gray-700 text-sm">
                    {offer.benefits.split('\n').map((benefit, index) => (
                      <p key={index} className="mb-2">
                        • {benefit}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Duración */}
            {offer.duration && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ⏰ Durada
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-gray-700 text-sm">{offer.duration}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Información de la empresa */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden bg-gray-100 mb-4">
                  <Image
                    src={offer.company.logo || '/placeholder-company.jpg'}
                    alt={offer.company.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {offer.company.name}
                </h3>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>{offer.company.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{offer.company.reviews} valoracions</span>
                </div>
                {offer.company.verified && (
                  <div className="flex items-center justify-center text-sm text-green-600 font-medium mt-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Empresa verificada
                  </div>
                )}
              </div>

              {offer.company.description && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {offer.company.description}
                  </p>
                </div>
              )}

              {/* Información adicional */}
              <div className="space-y-3 text-sm">
                {offer.contactEmail && (
                  <a
                    href={`mailto:${offer.contactEmail}`}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contactar per email
                  </a>
                )}
                {offer.contactPhone && (
                  <a
                    href={`tel:${offer.contactPhone}`}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Trucar
                  </a>
                )}
                {offer.externalUrl && (
                  <a
                    href={offer.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Veure més detalls
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>

              {offer.contactMethod && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-xs text-gray-500 text-center">
                    Mètode de contacte preferit: {offer.contactMethod}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Solicitar Oferta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Generar cupó per: {offer.title}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleGenerateCoupon();
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organització *
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="Ex: Ajuntament de Barcelona"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telèfon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantitat
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentaris
                    </label>
                    <textarea
                      value={formData.comments}
                      onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Informació adicional..."
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Preu per unitat:</span>
                        <div className="font-semibold">{offer.price.toFixed(2)}€</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantitat:</span>
                        <div className="font-semibold">{formData.quantity}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <div className="font-bold text-lg">{getTotalPrice().toFixed(2)}€</div>
                      </div>
                      {getTotalSavings() > 0 && (
                        <div>
                          <span className="text-gray-600">Estalvis:</span>
                          <div className="font-bold text-green-600">{getTotalSavings().toFixed(2)}€</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.acceptConditions}
                        onChange={(e) => setFormData(prev => ({ ...prev, acceptConditions: e.target.checked }))}
                        className="mt-1"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        Accepto els termes i condicions de l'oferta *
                      </span>
                    </label>
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.acceptPrivacy}
                        onChange={(e) => setFormData(prev => ({ ...prev, acceptPrivacy: e.target.checked }))}
                        className="mt-1"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        Accepto la política de privacitat *
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel·lar
                  </button>
                  <button
                    type="submit"
                    disabled={couponLoading || !formData.acceptConditions || !formData.acceptPrivacy}
                    className="flex-1 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {couponLoading ? 'Generant...' : 'Generar cupó'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cupón Generado */}
      {showCouponModal && activeCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  🎉 Cupó generat correctament!
                </h2>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Cupón Visual */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6">
                {/* Header del cupón */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={offer.company.logo || '/placeholder-company.jpg'}
                        alt={offer.company.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900">
                        {offer.company.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Cupó ID: {activeCoupon.code}
                      </div>
                    </div>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                      -{discountPercentage}%
                    </div>
                  )}
                </div>

                {/* Título de la oferta */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  {offer.title}
                </h3>

                {/* Precios */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Preu Original</div>
                    {offer.originalPrice ? (
                      <div className="text-lg font-semibold text-gray-500 line-through">
                        {offer.originalPrice.toFixed(2)}€
                      </div>
                    ) : (
                      <div className="text-lg font-semibold text-gray-900">
                        {offer.price.toFixed(2)}€
                      </div>
                    )}
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-700 mb-1">Preu amb Descompte</div>
                    <div className="text-xl font-bold text-green-600">
                      {offer.price.toFixed(2)}€
                    </div>
                  </div>
                  <div className="text-center bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-700 mb-1">Estalvi</div>
                    <div className="text-lg font-bold text-blue-600">
                      {getDiscountAmount().toFixed(2)}€
                    </div>
                  </div>
                </div>

                {/* QR Code y código */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold mb-3">Codi QR</h4>
                    {activeCoupon.qrCodeData ? (
                      <div className="flex flex-col items-center">
                        <Image
                          src={activeCoupon.qrCodeData}
                          alt={`QR Code per al cupó ${activeCoupon.code}`}
                          width={200}
                          height={200}
                          className="border border-gray-200 rounded-lg"
                        />
                        <button
                          onClick={downloadQR}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Descarregar QR
                        </button>
                      </div>
                    ) : (
                      <div className="w-48 h-48 mx-auto bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                        <QrCode className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h4 className="text-lg font-semibold mb-3">Codi del Cupó</h4>
                    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-xl tracking-wider mb-3">
                      {activeCoupon.code}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeCoupon.code);
                        alert('Codi copiat al portapapers');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Copiar codi
                    </button>
                  </div>
                </div>

                {/* Información del usuario */}
                <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nom:</span>
                      <div className="font-semibold">{formData.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <div className="font-semibold">{formData.email}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Organització:</span>
                      <div className="font-semibold">{formData.organization}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Vàlid fins:</span>
                      <div className="font-semibold text-red-600">
                        {new Date(activeCoupon.expiresAt).toLocaleDateString('ca-ES')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instrucciones basadas en contacto */}
                <div className="border-t border-dashed border-gray-300 pt-4">
                  <h4 className="font-semibold mb-2">📋 Com utilitzar aquest cupó</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Presenta aquest codi a l'empresa: {offer.company.name}</div>
                    {offer.contactEmail && (
                      <div>• Envia el codi per email a: {offer.contactEmail}</div>
                    )}
                    {offer.contactPhone && (
                      <div>• Truca i menciona el codi: {offer.contactPhone}</div>
                    )}
                    {offer.externalUrl && (
                      <div>• Visita el lloc web i introdueix el codi</div>
                    )}
                    <div>• El cupó és vàlid fins: {new Date(activeCoupon.expiresAt).toLocaleDateString('ca-ES')}</div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🖨️ Imprimir cupó
                </button>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tancar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Compartir */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Compartir oferta</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Enllaç copiat al portapapers');
                  setShowShareModal(false);
                }}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                📋 Copiar enllaç
              </button>

              <a
                href={`mailto:?subject=${encodeURIComponent(offer.title)}&body=${encodeURIComponent(`Mira aquesta oferta: ${offer.title} - ${window.location.href}`)}`}
                className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✉️ Enviar per email
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Mira aquesta oferta: ${offer.title} - ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                💬 Compartir a WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-full p-4">
            <div className="relative">
              <Image
                src={offer.images[currentImageIndex]}
                alt={`${offer.title} - imagen ${currentImageIndex + 1}`}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
              >
                <X className="h-6 w-6" />
              </button>

              {offer.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev =>
                      prev === 0 ? offer.images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev =>
                      prev === offer.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-2"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}