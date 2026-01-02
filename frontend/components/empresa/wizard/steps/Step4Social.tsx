'use client';

import { Linkedin, Twitter, Instagram, Facebook, Link2 } from 'lucide-react';
import { EmpresaWizardProps } from '../types';

export const Step4Social = ({ formData, errors, updateField }: EmpresaWizardProps) => {
  const socialNetworks = [
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      placeholder: 'https://linkedin.com/company/empresa',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
    },
    {
      key: 'twitter',
      label: 'X (Twitter)',
      icon: Twitter,
      placeholder: 'https://x.com/empresa',
      color: 'text-gray-900',
      bgColor: 'bg-gray-50',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      placeholder: 'https://instagram.com/empresa',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      placeholder: 'https://facebook.com/empresa',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Xarxes Socials</h2>
        <p className="text-gray-600">
          Connecta les teves xarxes socials per augmentar la visibilitat
        </p>
      </div>

      {/* Social Networks */}
      <div className="space-y-4">
        {socialNetworks.map(({ key, label, icon: Icon, placeholder, color, bgColor }) => (
          <div key={key} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type="url"
                value={(formData as any)[key] || ''}
                onChange={(e) => updateField(key as keyof typeof formData, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Vista previa</h3>
        <div className="flex flex-wrap gap-3">
          {socialNetworks.map(({ key, icon: Icon, color, bgColor }) => {
            const value = (formData as any)[key];
            return (
              <div
                key={key}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  value ? `${bgColor} ${color}` : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Els icones de les xarxes configurades es mostraran al teu perfil
        </p>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Link2 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">
              Per que afegir xarxes socials?
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>- Augmenta la confianca dels usuaris</li>
              <li>- Facilita el contacte amb potencials clients</li>
              <li>- Millora la visibilitat del teu perfil</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
