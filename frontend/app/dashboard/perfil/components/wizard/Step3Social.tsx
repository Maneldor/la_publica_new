'use client';

import { useState, useEffect } from 'react';
import { Twitter, Linkedin, Instagram, Plus, X } from 'lucide-react';

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  username?: string;
}

interface Step3Props {
  data: {
    socialLinks: SocialLink[];
  };
  addSocialLink: (link: Omit<SocialLink, 'id'>) => Promise<SocialLink | null>;
  deleteSocialLink: (id: string) => Promise<boolean>;
  isSaving: boolean;
}

export const Step3Social = ({ data, addSocialLink, deleteSocialLink, isSaving }: Step3Props) => {
  const [socialInputs, setSocialInputs] = useState({
    twitter: '',
    linkedin: '',
    instagram: ''
  });

  // Cargar datos existentes
  useEffect(() => {
    if (data.socialLinks) {
      const inputs = { twitter: '', linkedin: '', instagram: '' };
      data.socialLinks.forEach(link => {
        if (link.platform === 'Twitter' && link.username) {
          inputs.twitter = link.username;
        } else if (link.platform === 'LinkedIn' && (link.username || link.url)) {
          inputs.linkedin = link.username || link.url;
        } else if (link.platform === 'Instagram' && link.username) {
          inputs.instagram = link.username;
        }
      });
      setSocialInputs(inputs);
    }
  }, [data.socialLinks]);

  const handleSocialChange = (platform: string, value: string) => {
    setSocialInputs(prev => ({ ...prev, [platform]: value }));
  };

  const handleSocialSave = async (platform: string) => {
    const value = socialInputs[platform as keyof typeof socialInputs];
    if (!value.trim()) return;

    // Eliminar link existente si existe
    const existing = data.socialLinks.find(link => 
      link.platform.toLowerCase() === platform.toLowerCase()
    );
    if (existing?.id) {
      await deleteSocialLink(existing.id);
    }

    // Crear nuevo link
    let url = '';
    let username = value;

    if (platform === 'twitter') {
      url = `https://twitter.com/${value}`;
      username = value;
    } else if (platform === 'linkedin') {
      if (value.startsWith('http')) {
        url = value;
        username = value.split('/').pop() || value;
      } else {
        url = `https://linkedin.com/in/${value}`;
        username = value;
      }
    } else if (platform === 'instagram') {
      url = `https://instagram.com/${value}`;
      username = value;
    }

    await addSocialLink({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      url,
      username
    });
  };

  const handleSocialRemove = async (platform: string) => {
    const existing = data.socialLinks.find(link => 
      link.platform.toLowerCase() === platform.toLowerCase()
    );
    if (existing?.id) {
      await deleteSocialLink(existing.id);
      setSocialInputs(prev => ({ ...prev, [platform]: '' }));
    }
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
                value={socialInputs.twitter}
                onChange={(e) => handleSocialChange('twitter', e.target.value.replace('@', ''))}
                onBlur={() => handleSocialSave('twitter')}
                placeholder="jordi_garcia"
                className="w-full pl-8 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
              {socialInputs.twitter && (
                <button
                  onClick={() => handleSocialRemove('twitter')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {socialInputs.twitter && (
              <p className="text-sm text-blue-600 mt-1">
                📱 Perfil: https://twitter.com/{socialInputs.twitter}
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
            <div className="relative">
              <input
                type="text"
                value={socialInputs.linkedin}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                onBlur={() => handleSocialSave('linkedin')}
                placeholder="jordi-garcia-martinez o https://linkedin.com/in/jordi-garcia-martinez"
                className="w-full px-4 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
              {socialInputs.linkedin && (
                <button
                  onClick={() => handleSocialRemove('linkedin')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {socialInputs.linkedin && (
              <p className="text-sm text-blue-600 mt-1">
                💼 Perfil: {socialInputs.linkedin.startsWith('http')
                  ? socialInputs.linkedin
                  : `https://linkedin.com/in/${socialInputs.linkedin}`}
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
                value={socialInputs.instagram}
                onChange={(e) => handleSocialChange('instagram', e.target.value.replace('@', ''))}
                onBlur={() => handleSocialSave('instagram')}
                placeholder="jordigarcia_public"
                className="w-full pl-8 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
              {socialInputs.instagram && (
                <button
                  onClick={() => handleSocialRemove('instagram')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {socialInputs.instagram && (
              <p className="text-sm text-pink-600 mt-1">
                📸 Perfil: https://instagram.com/{socialInputs.instagram}
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
      {data.socialLinks && data.socialLinks.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            👀 Vista prèvia de les teves xarxes:
          </h4>
          <div className="flex flex-wrap gap-3">
            {data.socialLinks.map((link) => {
              const getPlatformIcon = () => {
                switch (link.platform) {
                  case 'Twitter': return <Twitter className="w-4 h-4 text-blue-600" />;
                  case 'LinkedIn': return <Linkedin className="w-4 h-4 text-blue-700" />;
                  case 'Instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
                  default: return <Plus className="w-4 h-4 text-gray-600" />;
                }
              };
              
              return (
                <div key={link.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                  {getPlatformIcon()}
                  <span className="text-sm text-gray-700">
                    {link.platform === 'LinkedIn' && link.url.startsWith('http')
                      ? 'LinkedIn Profile'
                      : link.username || link.url}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};