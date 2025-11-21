'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ContactFormModalProps {
  offer: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ offer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    acceptsMarketing: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validació bàsica
    const newErrors: Record<string, string> = {};
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Nom massa curt (mínim 2 caràcters)';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invàlid';
    }
    if (formData.phone && formData.phone.length < 9) {
      newErrors.phone = 'Telèfon invàlid (mínim 9 dígits)';
    }
    if (formData.message && formData.message.length > 1000) {
      newErrors.message = 'Missatge massa llarg (màxim 1000 caràcters)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`/api/ofertas/${offer.id}/redeem/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userAgent: navigator.userAgent,
          referrer: window.location.href
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Sol·licitud enviada correctament!\n\n${offer.company.name} es posarà en contacte amb tu aviat.`);
        onSuccess();
      } else {
        if (data.details && Array.isArray(data.details)) {
          // Error de validació amb detalls específics
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            if (err.path && err.path[0]) {
              fieldErrors[err.path[0]] = err.message;
            }
          });
          setErrors(fieldErrors);
        } else if (data.error) {
          // Error general
          alert(`❌ ${data.error}`);
        } else {
          alert('❌ Error enviant la sol·licitud');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de connexió. Torna-ho a provar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sol·licitar informació</h3>
            <p className="text-sm text-gray-600 truncate">{offer.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Tancar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              Omple el formulari i <strong>{offer.company.name}</strong> es posarà en contacte amb tu per completar la sol·licitud de l'oferta.
            </p>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="El teu nom complet"
              required
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="el.teu@email.cat"
              required
              maxLength={254}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telèfon (opcional)
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="666 777 888"
              maxLength={20}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Missatge (opcional)
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Afegeix qualsevol informació addicional sobre el teu interès en aquesta oferta..."
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.message && (
                <p className="text-sm text-red-600">{errors.message}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.message.length}/1000 caràcters
              </p>
            </div>
          </div>

          {/* Marketing checkbox */}
          <div>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptsMarketing}
                onChange={(e) => setFormData({ ...formData, acceptsMarketing: e.target.checked })}
                className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                Accepto rebre comunicacions comercials de <strong>{offer.company.name}</strong> sobre ofertes similars (opcional)
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enviant...
                </>
              ) : (
                'Enviar sol·licitud'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;