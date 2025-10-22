'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuardats } from '@/hooks/useGuardats';
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

  // Datos de prueba
  useEffect(() => {
    const mockAnunci = getMockAnunci(params.slug);
    setAnunci(mockAnunci);
    setIsFavorited(mockAnunci.isFavorite);
  }, [params.slug]);

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
        {!anunci && (
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
