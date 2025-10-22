'use client';

import { useState } from 'react';
import { MessageCircle, Facebook, Twitter, Mail, Link, Check } from 'lucide-react';
import { BaseModal } from './BaseModal';

// Props interface
export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  anunci: {
    title: string;
    slug: string;
  };
  shareUrl: string;
}

// Interface para opciones de compartir
interface ShareOption {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  action: () => void;
}

export function ShareModal({
  isOpen,
  onClose,
  anunci,
  shareUrl
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Generar texto para compartir
  const shareText = `🏷️ ${anunci.title}\n\nVes l'anunci complet a La Pública:`;

  // Función para copiar al portapapeles
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      // Reset del estado después de 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Error copiant l\'enllaç:', error);
    }
  };

  // Configuración de opciones sociales
  const shareOptions: ShareOption[] = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      textColor: 'text-green-700',
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      textColor: 'text-blue-700',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100',
      textColor: 'text-gray-700',
      action: () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      textColor: 'text-purple-700',
      action: () => {
        const subject = encodeURIComponent(`Anunci: ${anunci.title}`);
        const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
        const url = `mailto:?subject=${subject}&body=${body}`;
        window.open(url);
      }
    }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Compartir anunci"
      size="md"
    >
      <div className="space-y-6">
        {/* Grid de opciones sociales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shareOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.name}
                onClick={option.action}
                className={`flex items-center gap-3 p-4 rounded-lg border border-gray-200 transition-all duration-200 ${option.bgColor} ${option.hoverColor} hover:border-gray-300 hover:shadow-sm`}
              >
                <IconComponent className={`w-6 h-6 ${option.textColor}`} />
                <span className={`font-medium ${option.textColor}`}>
                  {option.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">o</span>
          </div>
        </div>

        {/* Sección copiar enlace */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Enllaç de l'anunci:
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiat!
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          </div>

          {copied && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Enllaç copiat al portapapers
            </p>
          )}
        </div>

        {/* Botón cerrar */}
        <div className="pt-4">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Tancar
          </button>
        </div>
      </div>
    </BaseModal>
  );
}