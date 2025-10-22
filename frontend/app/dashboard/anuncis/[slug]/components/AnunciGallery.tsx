'use client';

import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';

// Props interface para AnunciGallery
export interface AnunciGalleryProps {
  images: string[];
  title: string;
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onThumbnailClick: (index: number) => void;
  onOpenLightbox: () => void;
}

export function AnunciGallery({
  images,
  title,
  currentIndex,
  onPrevious,
  onNext,
  onThumbnailClick,
  onOpenLightbox
}: AnunciGalleryProps) {
  // No renderizar si no hay imágenes
  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No hi ha imatges disponibles</p>
      </div>
    );
  }

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className="w-full">
      {/* Imagen Principal */}
      <div className="relative w-full h-96 rounded-lg overflow-hidden mb-6 group">
        <img
          src={currentImage}
          alt={title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={onOpenLightbox}
        />

        {/* Badge contador */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Botones navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Botón expandir */}
        <button
          onClick={onOpenLightbox}
          className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-70"
          aria-label="Veure a pantalla completa"
        >
          <Expand className="w-5 h-5" />
        </button>

        {/* Overlay hover para indicar click */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all cursor-pointer" />
      </div>

      {/* Grid de Thumbnails */}
      {images.length > 1 && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onThumbnailClick(index)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  index === currentIndex
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                aria-label={`Veure imagen ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Botón Ver galería completa */}
          <div className="flex justify-center">
            <button
              onClick={onOpenLightbox}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              <Expand className="w-4 h-4" />
              <span>Veure galeria completa</span>
            </button>
          </div>
        </div>
      )}

      {/* Indicador de una sola imagen */}
      {images.length === 1 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={onOpenLightbox}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            <Expand className="w-4 h-4" />
            <span>Veure a pantalla completa</span>
          </button>
        </div>
      )}
    </div>
  );
}