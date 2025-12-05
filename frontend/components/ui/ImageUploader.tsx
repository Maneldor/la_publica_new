'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  accept?: string;
}

export default function ImageUploader({
  value = '',
  onChange,
  className = '',
  placeholder = 'Arrossega una imatge aquí o clica per seleccionar',
  accept = 'image/*'
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;

    // Verificar que es una imagen
    if (!file.type.startsWith('image/')) {
      alert('Si us plau, selecciona només fitxers d\'imatge');
      return;
    }

    // Verificar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imatge és massa gran. El tamany màxim és de 5MB');
      return;
    }

    setIsUploading(true);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onChange(result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Error al llegir el fitxer');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreview(url);
    onChange(url);
  }, [onChange]);

  const handleRemove = useCallback(() => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Vista previa de la imagen */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Vista prèvia"
            className="w-32 h-32 object-cover border border-gray-200 rounded-lg"
            onError={() => {
              setPreview('');
              onChange('');
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Área de arrastrar y soltar */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-gray-600">Pujant imatge...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">{placeholder}</p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF fins a 5MB</p>
          </div>
        )}
      </div>

      {/* Campo alternativo para URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          O introdueix una URL de la imatge
        </label>
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://exemple.com/imatge.jpg"
        />
      </div>
    </div>
  );
}