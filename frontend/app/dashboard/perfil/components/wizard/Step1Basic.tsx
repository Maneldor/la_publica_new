'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon, User, AtSign, Calendar } from 'lucide-react';
import { ProfileFormData } from '../../hooks/useProfileWizard';

interface Step1Props {
  formData: ProfileFormData;
  errors: Record<string, string>;
  updateField: (field: keyof ProfileFormData, value: any) => void;
}

export const Step1Basic = ({ formData, errors, updateField }: Step1Props) => {
  const [dragActive, setDragActive] = useState(false);
  const [dragTarget, setDragTarget] = useState<'cover' | 'profile' | null>(null);

  // Handle drag events
  const handleDrag = (e: React.DragEvent, target: 'cover' | 'profile') => {
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
  const handleDrop = (e: React.DragEvent, target: 'cover' | 'profile') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDragTarget(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0], target);
    }
  };

  // Handle file input change
  const handleFiles = (file: File, target: 'cover' | 'profile') => {
    if (file && file.type.startsWith('image/')) {
      if (target === 'cover') {
        updateField('coverImage', file);
        // Create preview URL
        const url = URL.createObjectURL(file);
        updateField('coverImageUrl', url);
      } else {
        updateField('profileImage', file);
        const url = URL.createObjectURL(file);
        updateField('profileImageUrl', url);
      }
    }
  };

  const removeImage = (target: 'cover' | 'profile') => {
    if (target === 'cover') {
      if (formData.coverImageUrl) {
        URL.revokeObjectURL(formData.coverImageUrl);
      }
      updateField('coverImage', null);
      updateField('coverImageUrl', '');
    } else {
      if (formData.profileImageUrl) {
        URL.revokeObjectURL(formData.profileImageUrl);
      }
      updateField('profileImage', null);
      updateField('profileImageUrl', '');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'gener', 'febrer', 'març', 'abril', 'maig', 'juny',
      'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const getProfileTypeBadge = (type: string) => {
    const badges = {
      'Local': { color: 'bg-green-100 text-green-800', icon: '🏢' },
      'Autonòmica': { color: 'bg-purple-100 text-purple-800', icon: '🏛️' },
      'Central': { color: 'bg-blue-100 text-blue-800', icon: '🏛️' }
    };
    return badges[type as keyof typeof badges] || badges['Local'];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Imatges i Informació Bàsica
        </h2>
        <p className="text-gray-600">
          Configura les teves imatges de perfil i la informació principal que altres usuaris veuran
        </p>
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Imatge de Portada
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Imatge gran que apareixerà a la part superior del teu perfil (recomanat: 1200x300px)
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

      {/* Profile Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <User className="w-4 h-4 inline mr-2" />
          Foto de Perfil
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Imatge que apareixerà al teu avatar (recomanat: 400x400px, format quadrat)
        </p>

        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-all max-w-xs mx-auto
            ${dragActive && dragTarget === 'profile'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragEnter={(e) => handleDrag(e, 'profile')}
          onDragLeave={(e) => handleDrag(e, 'profile')}
          onDragOver={(e) => handleDrag(e, 'profile')}
          onDrop={(e) => handleDrop(e, 'profile')}
        >
          {formData.profileImageUrl ? (
            <div className="relative">
              <img
                src={formData.profileImageUrl}
                alt="Vista prèvia perfil"
                className="w-32 h-32 object-cover mx-auto rounded-full border-4 border-white shadow-lg"
              />
              <button
                onClick={() => removeImage('profile')}
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
              <p className="text-sm font-medium text-gray-900 mb-2">Foto de perfil</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFiles(e.target.files[0], 'profile')}
                className="hidden"
                id="profile-upload"
              />
              <label
                htmlFor="profile-upload"
                className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
              >
                Seleccionar
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nom Complet *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            placeholder="Ex: Jordi García Martínez"
            maxLength={100}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'}
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all
            `}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AtSign className="w-4 h-4 inline mr-2" />
            Nom d'Usuari *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              @
            </span>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="jordi_funcionari"
              maxLength={30}
              className={`
                w-full pl-8 pr-4 py-3 rounded-lg border
                ${errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all
              `}
            />
          </div>
          {errors.username && (
            <p className="text-sm text-red-600 mt-1">{errors.username}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Només lletres minúscules, números i guions baixos
          </p>
        </div>
      </div>

      {/* Profile Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipus de Perfil
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Local', 'Autonòmica', 'Central'].map((type) => {
            const isSelected = formData.profileType === type;
            const badge = getProfileTypeBadge(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => updateField('profileType', type)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{type}</div>
                    <div className="text-sm text-gray-600">
                      Administració {type.toLowerCase()}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-auto">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                        Seleccionat
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Registration Date (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Data de Registre
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
          {formatDate(formData.registrationDate)}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Data automàtica de quan et vas registrar a la plataforma
        </p>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">
          💡 Consells per a un bon perfil:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Utilitza una foto de perfil professional i clara</li>
          <li>• La imatge de portada pot reflectir la teva personalitat o treball</li>
          <li>• El nom d'usuari ha de ser fàcil de recordar i professional</li>
          <li>• Un bon perfil genera més confiança i connexions</li>
        </ul>
      </div>
    </div>
  );
};