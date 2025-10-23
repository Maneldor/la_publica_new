'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { AdminEmpresaFormData } from '../../hooks/useAdminCreateEmpresa';

interface Step1Props {
  formData: AdminEmpresaFormData;
  errors: Record<string, string>;
  updateField: (field: keyof AdminEmpresaFormData, value: any) => void;
}

export const Step1Branding = ({ formData, errors, updateField }: Step1Props) => {
  const [dragActive, setDragActive] = useState(false);
  const [dragTarget, setDragTarget] = useState<'cover' | 'logo' | null>(null);

  // Handle drag events
  const handleDrag = (e: React.DragEvent, target: 'cover' | 'logo') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
      setDragTarget(target);
    } else if (e.type === "dragleave") {
      setDragActive(false);
      setDragTarget(null);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, target: 'cover' | 'logo') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDragTarget(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0], target);
    }
  };

  // Handle file input change
  const handleFiles = (file: File, target: 'cover' | 'logo') => {
    if (file && file.type.startsWith('image/')) {
      if (target === 'cover') {
        updateField('coverImage', file);
        // Create preview URL
        const url = URL.createObjectURL(file);
        updateField('coverImageUrl', url);
      } else {
        updateField('logo', file);
        const url = URL.createObjectURL(file);
        updateField('logoUrl', url);
      }
    }
  };

  const removeImage = (target: 'cover' | 'logo') => {
    if (target === 'cover') {
      if (formData.coverImageUrl) {
        URL.revokeObjectURL(formData.coverImageUrl);
      }
      updateField('coverImage', null);
      updateField('coverImageUrl', '');
    } else {
      if (formData.logoUrl) {
        URL.revokeObjectURL(formData.logoUrl);
      }
      updateField('logo', null);
      updateField('logoUrl', '');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Imatges i Branding
        </h2>
        <p className="text-gray-600">
          Afegeix les imatges principals de la teva empresa per crear una bona primera impressió
        </p>
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Imatge de Portada
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Imatge gran que apareixerà a la part superior de la pàgina de l'empresa (recomanat: 1200x400px)
        </p>

        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${dragActive && dragTarget === 'cover'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragEnter={(e) => handleDrag(e, 'cover')}
          onDragLeave={(e) => handleDrag(e, 'cover')}
          onDragOver={(e) => handleDrag(e, 'cover')}
          onDrop={(e) => handleDrop(e, 'cover')}
        >
          {formData.coverImageUrl ? (
            <div className="relative">
              <img
                src={formData.coverImageUrl}
                alt="Vista prèvia portada"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage('cover')}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Arrossega la imatge aquí o fes clic per seleccionar
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PNG, JPG, GIF fins a 10MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0], 'cover')}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Seleccionar Arxiu
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Logo de l'Empresa
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Logo que apareixerà sobre la imatge de portada i en les targetes (recomanat: 200x200px, format quadrat)
        </p>

        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-all max-w-xs mx-auto
            ${dragActive && dragTarget === 'logo'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragEnter={(e) => handleDrag(e, 'logo')}
          onDragLeave={(e) => handleDrag(e, 'logo')}
          onDragOver={(e) => handleDrag(e, 'logo')}
          onDrop={(e) => handleDrop(e, 'logo')}
        >
          {formData.logoUrl ? (
            <div className="relative">
              <img
                src={formData.logoUrl}
                alt="Vista prèvia logo"
                className="w-32 h-32 object-contain mx-auto rounded-full border-4 border-white shadow-lg"
              />
              <button
                onClick={() => removeImage('logo')}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-2">Logo</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0], 'logo')}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
              >
                Seleccionar
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'Empresa *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Ex: Innovacions Tecnològiques Barcelona S.L."
          maxLength={100}
          className={`
            w-full px-4 py-3 rounded-lg border text-lg font-medium
            ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formData.name.length}/100
          </p>
        </div>
      </div>

      {/* Slogan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slogan / Descripció Breu *
        </label>
        <input
          type="text"
          value={formData.slogan}
          onChange={(e) => updateField('slogan', e.target.value)}
          placeholder="Ex: Partner tecnològic de confiança per a l'administració pública"
          maxLength={120}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.slogan ? 'border-red-500 bg-red-50' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.slogan && (
              <p className="text-sm text-red-600">{errors.slogan}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formData.slogan.length}/120
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          💡 Consells per a una bona primera impressió:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Utilitza imatges d'alta qualitat i professionals</li>
          <li>• El logo ha de ser llegible i reconeixible fins i tot en petites mides</li>
          <li>• El slogan ha de resumir el valor principal de l'empresa</li>
          <li>• Mantingues la consistència visual amb els colors corporatius</li>
        </ul>
      </div>
    </div>
  );
};