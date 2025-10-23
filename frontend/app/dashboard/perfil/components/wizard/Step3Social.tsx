'use client';

import { Twitter, Linkedin, Instagram } from 'lucide-react';
import { ProfileFormData } from '../../hooks/useProfileWizard';

interface Step3Props {
  formData: ProfileFormData;
  errors: Record<string, string>;
  updateField: (field: keyof ProfileFormData, value: any) => void;
}

export const Step3Social = ({ formData, errors, updateField }: Step3Props) => {
  const updateSocialNetwork = (platform: keyof ProfileFormData['socialNetworks'], value: string) => {
    updateField('socialNetworks', {
      ...formData.socialNetworks,
      [platform]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Xarxes Socials
        </h2>
        <p className="text-gray-600">
          Connecta les teves xarxes socials per facilitar que altres usuaris et trobin i contactin
        </p>
      </div>

      {/* Social Networks */}
      <div className="space-y-6">
        {/* Twitter */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Twitter className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Twitter / X</h3>
              <p className="text-sm text-gray-600">Connecta el teu compte de Twitter</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'usuari (sense @)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                @
              </span>
              <input
                type="text"
                value={formData.socialNetworks.twitter || ''}
                onChange={(e) => updateSocialNetwork('twitter', e.target.value.replace('@', ''))}
                placeholder="jordi_garcia"
                className={`
                  w-full pl-8 pr-4 py-3 rounded-lg border
                  ${errors.twitter ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all
                `}
              />
            </div>
            {errors.twitter && (
              <p className="text-sm text-red-600 mt-1">{errors.twitter}</p>
            )}
            {formData.socialNetworks.twitter && (
              <p className="text-sm text-blue-600 mt-1">
                📱 Perfil: https://twitter.com/{formData.socialNetworks.twitter}
              </p>
            )}
          </div>
        </div>

        {/* LinkedIn */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Linkedin className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">LinkedIn</h3>
              <p className="text-sm text-gray-600">Connecta el teu perfil professional</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'usuari o URL completa
            </label>
            <input
              type="text"
              value={formData.socialNetworks.linkedin || ''}
              onChange={(e) => updateSocialNetwork('linkedin', e.target.value)}
              placeholder="jordi-garcia-martinez o https://linkedin.com/in/jordi-garcia-martinez"
              className={`
                w-full px-4 py-3 rounded-lg border
                ${errors.linkedin ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all
              `}
            />
            {errors.linkedin && (
              <p className="text-sm text-red-600 mt-1">{errors.linkedin}</p>
            )}
            {formData.socialNetworks.linkedin && (
              <p className="text-sm text-blue-600 mt-1">
                💼 Perfil: {formData.socialNetworks.linkedin.startsWith('http')
                  ? formData.socialNetworks.linkedin
                  : `https://linkedin.com/in/${formData.socialNetworks.linkedin}`}
              </p>
            )}
          </div>
        </div>

        {/* Instagram */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Instagram className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Instagram</h3>
              <p className="text-sm text-gray-600">Connecta el teu compte d'Instagram</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'usuari (sense @)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                @
              </span>
              <input
                type="text"
                value={formData.socialNetworks.instagram || ''}
                onChange={(e) => updateSocialNetwork('instagram', e.target.value.replace('@', ''))}
                placeholder="jordigarcia_public"
                className={`
                  w-full pl-8 pr-4 py-3 rounded-lg border
                  ${errors.instagram ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all
                `}
              />
            </div>
            {errors.instagram && (
              <p className="text-sm text-red-600 mt-1">{errors.instagram}</p>
            )}
            {formData.socialNetworks.instagram && (
              <p className="text-sm text-pink-600 mt-1">
                📸 Perfil: https://instagram.com/{formData.socialNetworks.instagram}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">
          🔒 Nota sobre Privacitat:
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Les xarxes socials que afegeixis seran visibles per altres usuaris de La Pública</li>
          <li>• Assegura't que els teus perfils siguin públics o professionals</li>
          <li>• Pots deixar qualsevol camp buit si no vols compartir aquesta informació</li>
          <li>• Sempre pots modificar o eliminar aquesta informació més tard</li>
        </ul>
      </div>

      {/* Benefits Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          🌟 Beneficis de connectar les xarxes socials:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Facilita que altres professionals et trobin i contactin</li>
          <li>• Augmenta la credibilitat del teu perfil</li>
          <li>• Permet mostrar la teva experiència i projectes</li>
          <li>• Crea oportunitats de networking professional</li>
        </ul>
      </div>

      {/* Preview Section */}
      {(formData.socialNetworks.twitter || formData.socialNetworks.linkedin || formData.socialNetworks.instagram) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            👀 Vista prèvia de les teves xarxes:
          </h4>
          <div className="flex flex-wrap gap-3">
            {formData.socialNetworks.twitter && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <Twitter className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">@{formData.socialNetworks.twitter}</span>
              </div>
            )}
            {formData.socialNetworks.linkedin && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <Linkedin className="w-4 h-4 text-blue-700" />
                <span className="text-sm text-gray-700">
                  {formData.socialNetworks.linkedin.startsWith('http')
                    ? 'LinkedIn Profile'
                    : formData.socialNetworks.linkedin}
                </span>
              </div>
            )}
            {formData.socialNetworks.instagram && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span className="text-sm text-gray-700">@{formData.socialNetworks.instagram}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};