'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, Star, Image as ImageIcon, AlertCircle, Camera } from 'lucide-react';
import { AnunciFormData } from '../../hooks/useCreateAnunci';

interface Step5ImagesProps {
  formData: AnunciFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AnunciFormData, value: any) => void;
}

export const Step5Images = ({ formData, errors, updateField }: Step5ImagesProps) => {
  const [dragActive, setDragActive] = useState<'cover' | 'gallery' | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const MAX_GALLERY_IMAGES = 6;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Format no vàlid (${file.name}). Només JPG, PNG i WebP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Arxiu massa gran (${file.name}). Màxim 5MB.`;
    }
    return null;
  };

  const handleCoverImage = (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      const error = validateFile(file);

      if (error) {
        setUploadErrors([error]);
        return;
      }

      setUploadErrors([]);
      updateField('coverImage', file);
    }
  };

  const handleGalleryImages = (files: FileList) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    Array.from(files).forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
        return;
      }

      if (formData.galleryImages.length + validFiles.length >= MAX_GALLERY_IMAGES) {
        newErrors.push(`Màxim ${MAX_GALLERY_IMAGES} imatges a la galeria.`);
        return;
      }

      validFiles.push(file);
    });

    setUploadErrors(newErrors);

    if (validFiles.length > 0) {
      const newGalleryImages = [...formData.galleryImages, ...validFiles];
      updateField('galleryImages', newGalleryImages);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent, zone: 'cover' | 'gallery') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(zone);
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, zone: 'cover' | 'gallery') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (zone === 'cover') {
        handleCoverImage(e.dataTransfer.files);
      } else {
        handleGalleryImages(e.dataTransfer.files);
      }
    }
  }, [formData.galleryImages]);

  const removeCoverImage = () => {
    updateField('coverImage', null);
  };

  const removeGalleryImage = (index: number) => {
    const newGalleryImages = formData.galleryImages.filter((_, i) => i !== index);
    updateField('galleryImages', newGalleryImages);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Imatges del producte
        </h2>
        <p className="text-gray-600">
          Afegeix una imatge de portada i opcionalment més imatges per la galeria
        </p>
      </div>

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Error en pujar imatges:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {uploadErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <h3 className="text-lg font-semibold text-gray-900">
            Imatge de portada
          </h3>
          <span className="text-sm text-red-600 font-medium">*Obligatòria</span>
        </div>

        <p className="text-sm text-gray-600">
          Aquesta imatge apareixerà a les targetes del llistat i a la portada de la pàgina individual
        </p>

        {!formData.coverImage ? (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
              ${dragActive === 'cover'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            onDragEnter={(e) => handleDrag(e, 'cover')}
            onDragLeave={(e) => handleDrag(e, 'cover')}
            onDragOver={(e) => handleDrag(e, 'cover')}
            onDrop={(e) => handleDrop(e, 'cover')}
            onClick={() => coverInputRef.current?.click()}
          >
            <input
              ref={coverInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={(e) => e.target.files && handleCoverImage(e.target.files)}
              className="hidden"
            />

            <div className={dragActive === 'cover' ? 'text-blue-600' : 'text-gray-500'}>
              <Camera className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">
                {dragActive === 'cover' ? 'Deixa anar la imatge aquí' : 'Afegir imatge de portada'}
              </p>
              <p className="text-sm">
                Arrossega i deixa anar o fes clic per seleccionar
              </p>
              <p className="text-xs mt-2 text-gray-400">
                JPG, PNG, WebP • Màxim 5MB
              </p>
            </div>
          </div>
        ) : (
          <div className="relative bg-white border-2 border-yellow-400 rounded-lg overflow-hidden ring-2 ring-yellow-200">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <img
                src={URL.createObjectURL(formData.coverImage)}
                alt="Imatge de portada"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Portada
            </div>

            <button
              onClick={removeCoverImage}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
              title="Eliminar imatge de portada"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-2 bg-white">
              <p className="text-xs text-gray-600 truncate">
                {formData.coverImage.name}
              </p>
              <p className="text-xs text-gray-400">
                {(formData.coverImage.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
        )}

        {/* Cover Image Error */}
        {errors.coverImage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.coverImage}
            </p>
          </div>
        )}
      </div>

      {/* Gallery Images Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Galeria d'imatges
          </h3>
          <span className="text-sm text-gray-500">Opcional</span>
        </div>

        <p className="text-sm text-gray-600">
          Imatges addicionals que apareixeran a la galeria de la pàgina individual (màxim {MAX_GALLERY_IMAGES})
        </p>

        {formData.galleryImages.length < MAX_GALLERY_IMAGES && (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
              ${dragActive === 'gallery'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            onDragEnter={(e) => handleDrag(e, 'gallery')}
            onDragLeave={(e) => handleDrag(e, 'gallery')}
            onDragOver={(e) => handleDrag(e, 'gallery')}
            onDrop={(e) => handleDrop(e, 'gallery')}
            onClick={() => galleryInputRef.current?.click()}
          >
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(',')}
              onChange={(e) => e.target.files && handleGalleryImages(e.target.files)}
              className="hidden"
            />

            <div className={dragActive === 'gallery' ? 'text-blue-600' : 'text-gray-500'}>
              <Upload className="mx-auto h-8 w-8 mb-3" />
              <p className="text-base font-medium mb-1">
                {dragActive === 'gallery' ? 'Deixa anar les imatges aquí' : 'Afegir a la galeria'}
              </p>
              <p className="text-sm">
                Selecciona múltiples imatges
              </p>
              <p className="text-xs mt-1 text-gray-400">
                JPG, PNG, WebP • Màxim 5MB per imatge
              </p>
            </div>
          </div>
        )}

        {/* Gallery Images Grid */}
        {formData.galleryImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-gray-900">
                Galeria ({formData.galleryImages.length}/{MAX_GALLERY_IMAGES})
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.galleryImages.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="relative group bg-white border-2 border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Galeria ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    {index + 1}
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => removeGalleryImage(index)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                      title="Eliminar de la galeria"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-600 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          📸 Sobre les imatges:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Imatge de portada:</strong> Apareix a les targetes del llistat i com a imatge principal</li>
          <li>• <strong>Galeria:</strong> Imatges addicionals per mostrar més detalls del producte</li>
          <li>• Usa bona il·luminació natural sempre que sigui possible</li>
          <li>• Mostra el producte des de diferents angles per generar confiança</li>
          <li>• Evita imatges borroses o de baixa qualitat</li>
        </ul>
      </div>
    </div>
  );
};