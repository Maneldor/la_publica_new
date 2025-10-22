'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, Star, StarOff, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { AnunciFormData } from '../../hooks/useCreateAnunci';

interface Step4Props {
  formData: AnunciFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AnunciFormData, value: any) => void;
}

export const Step4Images = ({ formData, errors, updateField }: Step4Props) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 8;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const validateFiles = (files: FileList): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file, index) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`Arxiu ${index + 1}: Format no vàlid. Només JPG, PNG i WebP.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`Arxiu ${index + 1}: Massa gran. Màxim 5MB.`);
        return;
      }

      if (formData.images.length + validFiles.length >= MAX_IMAGES) {
        errors.push(`Màxim ${MAX_IMAGES} imatges permeses.`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  };

  const handleFiles = (files: FileList) => {
    const { validFiles, errors } = validateFiles(files);
    setUploadErrors(errors);

    if (validFiles.length > 0) {
      const newImages = [...formData.images, ...validFiles];
      updateField('images', newImages);

      // Si es la primera imagen, la marcamos como principal
      if (formData.images.length === 0 && validFiles.length > 0) {
        updateField('mainImageIndex', 0);
      }
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [formData.images]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateField('images', newImages);

    // Ajustar el índice de la imagen principal
    if (formData.mainImageIndex === index) {
      updateField('mainImageIndex', 0);
    } else if (formData.mainImageIndex > index) {
      updateField('mainImageIndex', formData.mainImageIndex - 1);
    }
  };

  const setMainImage = (index: number) => {
    updateField('mainImageIndex', index);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Imatges
        </h2>
        <p className="text-gray-600">
          Afegeix fins a {MAX_IMAGES} imatges del teu producte
        </p>
      </div>

      {/* Upload Zone */}
      <div className="space-y-4">
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${dragActive
              ? 'border-blue-500 bg-blue-50'
              : formData.images.length >= MAX_IMAGES
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${formData.images.length >= MAX_IMAGES ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={formData.images.length < MAX_IMAGES ? openFileDialog : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />

          {formData.images.length >= MAX_IMAGES ? (
            <div className="text-gray-500">
              <ImageIcon className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Màxim d'imatges assolit</p>
              <p className="text-sm">Has afegit {MAX_IMAGES} imatges (màxim permès)</p>
            </div>
          ) : (
            <div className={dragActive ? 'text-blue-600' : 'text-gray-500'}>
              <Upload className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-2">
                {dragActive ? 'Deixa anar les imatges aquí' : 'Afegeix imatges'}
              </p>
              <p className="text-sm">
                Arrossega i deixa anar o fes clic per seleccionar
              </p>
              <p className="text-xs mt-2 text-gray-400">
                JPG, PNG, WebP • Màxim 5MB per imatge • Màxim {MAX_IMAGES} imatges
              </p>
            </div>
          )}
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

        {/* Form Error */}
        {errors.images && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errors.images}
            </p>
          </div>
        )}
      </div>

      {/* Images Grid */}
      {formData.images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Imatges seleccionades ({formData.images.length}/{MAX_IMAGES})
            </h3>
            {formData.images.length > 1 && (
              <p className="text-sm text-gray-600">
                Fes clic a l'estrella per marcar la imatge principal
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={`
                  relative group bg-white border-2 rounded-lg overflow-hidden
                  ${index === formData.mainImageIndex
                    ? 'border-yellow-400 ring-2 ring-yellow-200'
                    : 'border-gray-200'
                  }
                `}
              >
                {/* Image Preview */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Main Image Badge */}
                {index === formData.mainImageIndex && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
                    Principal
                  </div>
                )}

                {/* Hover Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {/* Star for main image */}
                    <button
                      onClick={() => setMainImage(index)}
                      className={`
                        p-2 rounded-full transition-all
                        ${index === formData.mainImageIndex
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-white text-gray-700 hover:bg-yellow-100'
                        }
                      `}
                      title={index === formData.mainImageIndex ? 'Imatge principal' : 'Marcar com a principal'}
                    >
                      {index === formData.mainImageIndex ? (
                        <Star className="w-4 h-4 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* Remove button */}
                    <button
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                      title="Eliminar imatge"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File Info */}
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

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          📸 Consells per a bones imatges:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Usa bona il·luminació natural sempre que sigui possible</li>
          <li>• Mostra el producte des de diferents angles</li>
          <li>• Inclou imatges de detalls o defectes si n'hi ha</li>
          <li>• La primera imatge es mostrarà com a principal en les cerques</li>
          <li>• Evita imatges borroses o de baixa qualitat</li>
        </ul>
      </div>
    </div>
  );
};