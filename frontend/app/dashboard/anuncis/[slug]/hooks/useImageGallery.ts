import { useState, useCallback, useEffect, useMemo } from 'react';

// Props del hook
export interface UseImageGalleryProps {
  images: string[];
  initialIndex?: number;
}

// Return type del hook
export interface UseImageGalleryReturn {
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  handlePreviousImage: () => void;
  handleNextImage: () => void;
  handleThumbnailClick: (index: number) => void;
  isFirstImage: boolean;
  isLastImage: boolean;
}

export function useImageGallery({
  images,
  initialIndex = 0
}: UseImageGalleryProps): UseImageGalleryReturn {
  // Validar y normalizar el índice inicial
  const validInitialIndex = useMemo(() => {
    if (images.length === 0) return 0;
    if (initialIndex < 0) return 0;
    if (initialIndex >= images.length) return images.length - 1;
    return initialIndex;
  }, [images.length, initialIndex]);

  const [currentImageIndex, setCurrentImageIndex] = useState(validInitialIndex);

  // Resetear índice si cambia el array de imágenes
  useEffect(() => {
    if (images.length === 0) {
      setCurrentImageIndex(0);
    } else if (currentImageIndex >= images.length) {
      setCurrentImageIndex(images.length - 1);
    }
  }, [images.length, currentImageIndex]);

  // Función para validar y establecer índice
  const safeSetIndex = useCallback((index: number) => {
    if (images.length === 0) return;
    if (index < 0 || index >= images.length) return;
    setCurrentImageIndex(index);
  }, [images.length]);

  // Navegación a imagen anterior (circular)
  const handlePreviousImage = useCallback(() => {
    if (images.length === 0) return;
    setCurrentImageIndex(prev =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, [images.length]);

  // Navegación a imagen siguiente (circular)
  const handleNextImage = useCallback(() => {
    if (images.length === 0) return;
    setCurrentImageIndex(prev =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }, [images.length]);

  // Click en thumbnail específico
  const handleThumbnailClick = useCallback((index: number) => {
    safeSetIndex(index);
  }, [safeSetIndex]);

  // Estados derivados para optimización
  const isFirstImage = useMemo(() =>
    currentImageIndex === 0,
    [currentImageIndex]
  );

  const isLastImage = useMemo(() =>
    currentImageIndex === images.length - 1,
    [currentImageIndex, images.length]
  );

  return {
    currentImageIndex,
    setCurrentImageIndex: safeSetIndex,
    handlePreviousImage,
    handleNextImage,
    handleThumbnailClick,
    isFirstImage,
    isLastImage
  };
}