'use client';

import { useState, useRef } from 'react';
import { Image, Upload, Palette, X } from 'lucide-react';
import { EmpresaWizardProps } from '../types';

const BRAND_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

export const Step1Branding = ({ formData, errors, updateField }: EmpresaWizardProps) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'coverImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Nomes es permeten imatges');
      return;
    }

    // Validar tamano (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imatge no pot superar 5MB');
      return;
    }

    setUploading(type === 'logo' ? 'logo' : 'cover');

    try {
      // Crear preview local
      const reader = new FileReader();
      reader.onload = (event) => {
        updateField(type, event.target?.result as string);
        setUploading(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(null);
    }
  };

  const removeImage = (type: 'logo' | 'coverImage') => {
    updateField(type, null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Identitat Visual</h2>
        <p className="text-gray-600">
          Configura el logo i els colors de la teva empresa
        </p>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Image className="w-4 h-4 inline mr-2" />
          Logo de l'empresa
        </label>

        <div className="flex items-start gap-6">
          {/* Preview */}
          <div
            className={`w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${
              formData.logo ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            {formData.logo ? (
              <div className="relative w-full h-full group">
                <img
                  src={formData.logo}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-2"
                />
                <button
                  onClick={() => removeImage('logo')}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-500">Sense logo</span>
              </div>
            )}
          </div>

          {/* Upload button */}
          <div className="flex-1">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'logo')}
              className="hidden"
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploading === 'logo'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading === 'logo' ? 'Pujant...' : 'Pujar logo'}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Format recomanat: PNG o SVG amb fons transparent. Max 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Image className="w-4 h-4 inline mr-2" />
          Imatge de portada
        </label>

        <div
          className={`relative w-full h-48 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${
            formData.coverImage ? 'border-green-500' : 'border-gray-300 bg-gray-50'
          }`}
        >
          {formData.coverImage ? (
            <div className="relative w-full h-full group">
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Canviar
                </button>
                <button
                  onClick={() => removeImage('coverImage')}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading === 'cover'}
              className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Upload className="w-8 h-8" />
              <span>{uploading === 'cover' ? 'Pujant...' : 'Pujar imatge de portada'}</span>
              <span className="text-xs">Recomanat: 1200x400px. Max 5MB.</span>
            </button>
          )}
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, 'coverImage')}
          className="hidden"
        />
      </div>

      {/* Brand Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Palette className="w-4 h-4 inline mr-2" />
          Color corporatiu
        </label>

        <div className="flex flex-wrap gap-3">
          {BRAND_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateField('brandColor', color)}
              className={`w-10 h-10 rounded-lg transition-all ${
                formData.brandColor === color
                  ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}

          {/* Custom color input */}
          <div className="relative">
            <input
              type="color"
              value={formData.brandColor || '#3B82F6'}
              onChange={(e) => updateField('brandColor', e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 text-gray-900"
              title="Color personalitzat"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Aquest color s'utilitzara per destacar elements del teu perfil
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Vista previa</h3>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover */}
          <div
            className="h-24 relative"
            style={{
              backgroundColor: formData.coverImage ? undefined : formData.brandColor,
              backgroundImage: formData.coverImage ? `url(${formData.coverImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Logo overlay */}
            <div className="absolute -bottom-8 left-6">
              <div
                className="w-16 h-16 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden"
                style={{ borderColor: formData.brandColor, borderWidth: 2 }}
              >
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-2xl font-bold" style={{ color: formData.brandColor }}>
                    {formData.name?.[0] || 'E'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="pt-12 pb-4 px-6">
            <h4 className="font-semibold text-gray-900">
              {formData.name || 'Nom de l\'empresa'}
            </h4>
            <p className="text-sm text-gray-500">{formData.sector || 'Sector'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
