'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Send } from 'lucide-react';
import { BaseModal } from './BaseModal';
import { defaultContactMessage } from '../../data/anunciDetailData';

// Props interfaces
export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  anunci: {
    title: string;
    author: {
      name: string;
      avatar: string;
    };
  };
  priceDisplay: string;
  onSubmit?: (data: ContactFormData) => void;
}

export interface ContactFormData {
  message: string;
  phone: string;
  acceptDataSharing: boolean;
}

export function ContactModal({
  isOpen,
  onClose,
  anunci,
  priceDisplay,
  onSubmit
}: ContactModalProps) {
  // Estados del formulario
  const [message, setMessage] = useState(defaultContactMessage);
  const [phone, setPhone] = useState('');
  const [acceptDataSharing, setAcceptDataSharing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpiar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      setMessage(defaultContactMessage);
      setPhone('');
      setAcceptDataSharing(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!message.trim()) {
      newErrors.message = 'El missatge és obligatori';
    } else if (message.trim().length < 10) {
      newErrors.message = 'El missatge ha de tenir almenys 10 caràcters';
    }

    if (!acceptDataSharing) {
      newErrors.acceptDataSharing = 'Has d\'acceptar compartir les teves dades per continuar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo del envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData: ContactFormData = {
        message: message.trim(),
        phone: phone.trim(),
        acceptDataSharing
      };

      // Llamar onSubmit si existe, sino simular envío
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Missatge enviat:', formData);
      }

      // Cerrar modal después del éxito
      onClose();
    } catch (error) {
      console.error('Error enviant missatge:', error);
      setErrors({ submit: 'Error enviant el missatge. Torna-ho a provar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Contactar amb el venedor"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información del anuncio */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center space-x-4">
            <img
              src={anunci.author.avatar}
              alt={anunci.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {anunci.title}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-600 text-sm flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {anunci.author.name}
                </span>
                <span className="font-bold text-blue-600">
                  {priceDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo mensaje */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Missatge <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Escriu el teu missatge aquí..."
              disabled={isSubmitting}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          {/* Campo teléfono */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Telèfon (opcional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="650 123 456"
              disabled={isSubmitting}
            />
          </div>

          {/* Checkbox consentimiento */}
          <div>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={acceptDataSharing}
                onChange={(e) => setAcceptDataSharing(e.target.checked)}
                className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  errors.acceptDataSharing ? 'border-red-500' : ''
                }`}
                disabled={isSubmitting}
              />
              <span className="text-sm text-gray-700">
                Accepto compartir les meves dades de contacte amb el venedor per a aquesta consulta.
                <span className="text-red-500 ml-1">*</span>
              </span>
            </label>
            {errors.acceptDataSharing && (
              <p className="mt-1 text-sm text-red-600 ml-7">{errors.acceptDataSharing}</p>
            )}
          </div>

          {/* Error general */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviant...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar missatge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}