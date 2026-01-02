'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import { BaseModal } from './BaseModal';
import { reportReasons } from '../../data/anunciDetailData';

// Props interfaces
export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  anunci: {
    title: string;
    id: number;
  };
  onSubmit?: (data: ReportFormData) => void;
}

export interface ReportFormData {
  reason: string;
  details: string;
}

export function ReportModal({
  isOpen,
  onClose,
  anunci,
  onSubmit
}: ReportModalProps) {
  // Estados del formulario
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpiar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDetails('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!reason) {
      newErrors.reason = 'Has de seleccionar una raó per al report';
    }

    if (reason === 'Altres' && !details.trim()) {
      newErrors.details = 'Si selecciones "Altres", has d\'especificar els detalls';
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
      const formData: ReportFormData = {
        reason,
        details: details.trim()
      };

      // Llamar onSubmit si existe, sino simular envío
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Report enviat:', formData);
      }

      // Cerrar modal después del éxito
      onClose();
    } catch (error) {
      console.error('Error enviant report:', error);
      setErrors({ submit: 'Error enviant el report. Torna-ho a provar.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determinar si es necesario mostrar el textarea
  const isDetailsRequired = reason === 'Altres';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reportar anunci"
      size="md"
    >
      <div className="space-y-6">
        {/* Mensaje informativo */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">
                Reportar aquest anunci
              </p>
              <p className="text-amber-700">
                El teu report s'enviarà a l'equip de moderació per a la seva revisió.
                Si considerem que viola les nostres normes, prendrem les mesures oportunes.
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Selector de razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Raó del report <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {reportReasons.map((reasonOption) => (
                <label
                  key={reasonOption}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-slate-50 ${
                    reason === reasonOption
                      ? 'border-info bg-info/10'
                      : errors.reason
                        ? 'border-error'
                        : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption}
                    checked={reason === reasonOption}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-4 w-4 text-info focus:ring-info border-border"
                    disabled={isSubmitting}
                  />
                  <span className="text-gray-700 text-sm">{reasonOption}</span>
                </label>
              ))}
            </div>
            {errors.reason && (
              <p className="mt-2 text-sm text-error">{errors.reason}</p>
            )}
          </div>

          {/* Campo detalles */}
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
              Detalls adicionals
              {isDetailsRequired && <span className="text-red-500 ml-1">*</span>}
              {!isDetailsRequired && <span className="text-gray-500 ml-1">(opcional)</span>}
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-info focus:border-info resize-none ${
                errors.details ? 'border-error' : 'border-border'
              }`}
              placeholder={
                isDetailsRequired
                  ? "Explica els detalls del problema..."
                  : "Informació adicional que pugui ajudar-nos a entendre el problema..."
              }
              disabled={isSubmitting}
            />
            {errors.details && (
              <p className="mt-1 text-sm text-error">{errors.details}</p>
            )}
          </div>

          {/* Error general */}
          {errors.submit && (
            <div className="bg-error/10 border border-error-light rounded-lg p-3">
              <p className="text-sm text-error">{errors.submit}</p>
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
              className="flex-1 py-3 px-4 bg-error text-white rounded-lg hover:bg-error-dark disabled:bg-error/50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviant...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}