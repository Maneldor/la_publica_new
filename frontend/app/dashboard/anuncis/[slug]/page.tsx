'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuardats } from '@/hooks/useGuardats';
import { useAnuncio } from '@/hooks/useAnuncios';
import { Heart } from 'lucide-react';
import { Anunci, getMockAnunci, relatedAds } from './data/anunciDetailData';
import { useImageGallery } from './hooks/useImageGallery';
import { AnunciGallery } from './components/AnunciGallery';
import { LightboxModal } from './components/modals/LightboxModal';
import { ContactModal } from './components/modals/ContactModal';
import { ShareModal } from './components/modals/ShareModal';
import { ReportModal } from './components/modals/ReportModal';
import { AnunciSidebar } from './components/AnunciSidebar';
import { AnunciContent } from './components/AnunciContent';


export default function AnunciSinglePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [anunci, setAnunci] = useState<Anunci | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Intentar obtener el anuncio real del backend
  const { data: backendAnuncio, isLoading: isLoadingAnuncio, error } = useAnuncio(params.slug);

  // Hook para gestionar guardats
  const usuariId = 'jordi-garcia'; // En producción, obtener del contexto de auth
  const { isGuardat, isLoading: isLoadingGuardat, handleToggleGuardar } = useGuardats(
    'anunci',
    params.slug,
    usuariId
  );

  // Cargar estado inicial de favoritos
  useEffect(() => {
    if (anunci?.id) {
      const favorites = JSON.parse(localStorage.getItem('lapublica_favorites') || '[]');
      setIsFavorited(favorites.includes(anunci.id));
    }
  }, [anunci?.id]);

  // Cargar anuncio del backend o fallback a mock
  useEffect(() => {
    if (backendAnuncio) {
      // Convertir anuncio del backend al formato de detalle
      const marketplace = backendAnuncio.configuration?.marketplace;

      const convertedAnuncio: Anunci = {
        id: backendAnuncio.id,
        slug: params.slug,
        title: backendAnuncio.title,
        description: backendAnuncio.content,
        type: marketplace?.adType || 'oferta',
        category: marketplace?.category || 'general',
        price: marketplace?.price || 0,
        priceType: marketplace?.priceType === 'fix' ? 'fix' : marketplace?.priceType === 'negociable' ? 'negociable' : 'gratuït',
        location: marketplace?.location ? `${marketplace.location.city}, ${marketplace.location.province}` : 'La Pública',
        images: [
          marketplace?.coverImage || marketplace?.images?.[0] || 'https://via.placeholder.com/800x600?text=Sense+imatge',
          ...(marketplace?.galleryImages || marketplace?.images?.slice(1) || [])
        ].filter(Boolean),
        author: backendAnuncio.author?.email || 'Usuari',
        authorAvatar: backendAnuncio.author?.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        authorDepartment: backendAnuncio.community?.nombre || 'Comunitat',
        authorRating: 5.0,
        authorReviews: 0,
        authorMemberSince: 'Membre',
        authorVerified: true,
        authorSalesCompleted: 0,
        authorActiveAds: 1,
        authorResponseTime: '1 hora',
        contactPhone: marketplace?.contact?.phone || '900 123 456',
        contactEmail: marketplace?.contact?.email || backendAnuncio.author?.email || 'contacte@lapublica.cat',
        status: 'actiu' as const,
        createdAt: new Date(backendAnuncio.createdAt).toLocaleDateString('ca'),
        expiresAt: backendAnuncio.expiresAt ? new Date(backendAnuncio.expiresAt).toLocaleDateString('ca') : 'Sense caducitat',
        views: backendAnuncio.views || 0,
        favorites: backendAnuncio.reactions || 0,
        isFavorite: false,
        specifications: {
          'Estat': marketplace?.condition === 'nou' ? 'Nou' : marketplace?.condition === 'usat' ? 'Usat' : 'Com nou',
          'Categoria': marketplace?.category || 'General',
          'Ubicació': marketplace?.location ? `${marketplace.location.city}, ${marketplace.location.province}` : 'La Pública',
          'Codi Postal': marketplace?.location?.postalCode || '',
          'Recollida': marketplace?.delivery?.pickup ? 'Disponible' : 'No disponible',
          'Enviament': marketplace?.delivery?.shipping ? 'Disponible' : 'No disponible',
          'Enviament inclòs': marketplace?.delivery?.shippingIncluded ? 'Sí' : 'No'
        },
        shippingAvailable: marketplace?.delivery?.shipping || false,
        handPickup: marketplace?.delivery?.pickup || false
      };

      console.log('🔍 Anunci carregat del backend:', convertedAnuncio);
      console.log('📸 Imatges - Portada:', !!marketplace?.coverImage, 'Galería:', marketplace?.galleryImages?.length || 0, 'Legacy:', marketplace?.images?.length || 0);

      setAnunci(convertedAnuncio);
      setIsFavorited(false);
    } else if (error || (!isLoadingAnuncio && !backendAnuncio)) {
      // Si no es encuentra en el backend, usar datos mock como fallback
      console.log('⚠️ Anunci no trobat al backend, usant mock data');
      const mockAnunci = getMockAnunci(params.slug);
      setAnunci(mockAnunci);
      setIsFavorited(mockAnunci.isFavorite);
    }
  }, [backendAnuncio, error, isLoadingAnuncio, params.slug]);

  // Hook para manejo de galería
  const {
    currentImageIndex,
    handlePreviousImage,
    handleNextImage,
    handleThumbnailClick
  } = useImageGallery({ images: anunci?.images || [] });

  const handleToggleFavorite = () => {
    if (!anunci?.id) return;

    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);

    // Simular guardado en localStorage
    const favorites = JSON.parse(localStorage.getItem('lapublica_favorites') || '[]');
    if (newFavoriteState) {
      if (!favorites.includes(anunci.id)) {
        favorites.push(anunci.id);
      }
    } else {
      const index = favorites.indexOf(anunci.id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    localStorage.setItem('lapublica_favorites', JSON.stringify(favorites));

    // Mostrar feedback
    console.log(newFavoriteState ? 'Afegit a favorits' : 'Eliminat de favorits');
  };


  const getPriceDisplay = () => {
    if (!anunci) return '';
    if (anunci.priceType === 'gratuït') return 'Gratuït';
    const price = anunci.price.toLocaleString('ca-ES');
    const suffix = anunci.priceType === 'negociable' ? ' (Negociable)' : '';
    return `${price}€${suffix}`;
  };

  const getTypeStyle = () => {
    if (!anunci) return { bg: '#f0f0f0', color: '#666', label: '' };
    return anunci.type === 'oferta'
      ? { bg: '#dcfce7', color: '#16a34a', label: 'OFERTA' }
      : { bg: '#dbeafe', color: '#2563eb', label: 'DEMANDA' };
  };



  const typeStyle = getTypeStyle();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {(isLoadingAnuncio || !anunci) && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregant anunci...</p>
          </div>
        )}

        {anunci && (
          <>
            {/* Galería */}
            <AnunciGallery
              images={anunci.images}
              title={anunci.title}
              currentIndex={currentImageIndex}
              onPrevious={handlePreviousImage}
              onNext={handleNextImage}
              onThumbnailClick={handleThumbnailClick}
              onOpenLightbox={() => setShowLightbox(true)}
            />

            {/* Grid: Content + Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Contenido Principal (2/3) */}
              <div className="lg:col-span-2">
                <AnunciContent
                  anunci={anunci}
                  relatedAds={relatedAds}
                  onAuthorClick={() => router.push(`/dashboard/perfil/${anunci.author.toLowerCase().replace(' ', '_')}`)}
                  onAuthorProfileClick={() => router.push(`/dashboard/perfil/${anunci.author.toLowerCase().replace(' ', '_')}`)}
                  onAuthorAdsClick={() => router.push(`/dashboard/anuncis?author=${anunci.author.toLowerCase().replace(' ', '_')}`)}
                  onRelatedAdClick={(slug) => router.push(`/dashboard/anuncis/${slug}`)}
                />
              </div>

              {/* Sidebar (1/3) */}
              <div className="lg:col-span-1">
                <AnunciSidebar
                  anunci={anunci}
                  priceDisplay={getPriceDisplay()}
                  typeStyle={typeStyle}
                  isGuardat={isGuardat}
                  isLoadingGuardat={isLoadingGuardat}
                  onContactClick={() => setShowContactModal(true)}
                  onPhoneClick={() => window.open(`tel:${anunci.author.phone}`, '_self')}
                  onEmailClick={() => window.open(`mailto:${anunci.author.email}`, '_self')}
                  onShareClick={() => setShowShareModal(true)}
                  onReportClick={() => setShowReportModal(true)}
                  onToggleGuardar={handleToggleGuardar}
                  onSecurityTipsClick={() => console.log('Security tips')}
                  slug={params.slug}
                />
              </div>
            </div>

            {/* Modales */}
            <LightboxModal
              isOpen={showLightbox}
              onClose={() => setShowLightbox(false)}
              images={anunci.images}
              currentIndex={currentImageIndex}
              title={anunci.title}
              onPrevious={handlePreviousImage}
              onNext={handleNextImage}
              onThumbnailClick={handleThumbnailClick}
            />

            <ContactModal
              isOpen={showContactModal}
              onClose={() => setShowContactModal(false)}
              anunci={{
                title: anunci.title,
                author: anunci.author
              }}
              priceDisplay={getPriceDisplay()}
              onSubmit={(data) => {
                console.log('Missatge de contacte enviat:', data);
                setShowContactModal(false);
              }}
            />

            <ShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              anunci={{
                title: anunci.title,
                slug: params.slug
              }}
              shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/anuncis/${params.slug}`}
            />

            <ReportModal
              isOpen={showReportModal}
              onClose={() => setShowReportModal(false)}
              anunci={{
                title: anunci.title,
                id: anunci.id
              }}
              onSubmit={(data) => {
                console.log('Report enviat:', data);
                setShowReportModal(false);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
