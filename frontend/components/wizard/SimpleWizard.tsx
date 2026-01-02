'use client';

import { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface WizardStep {
  id: number;
  title: string;
  icon: ReactNode;
}

interface SimpleWizardProps {
  title: string;
  steps: WizardStep[];
  currentStep: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  submitText?: string;
  loadingText?: string;
  children: ReactNode; // El contenido del paso actual
  showModal?: boolean; // Si mostrar como modal o no
  maxWidth?: string; // Ancho máximo del wizard
  hasChanges?: boolean; // Si hay cambios para enviar (para mostrar/ocultar botón submit)
  closeText?: string; // Texto del botón cerrar
}

export default function SimpleWizard({
  title,
  steps,
  currentStep,
  onClose,
  onNext,
  onPrevious,
  onSubmit,
  isLoading = false,
  submitText = 'Publicar',
  loadingText = 'Guardant...',
  children,
  showModal = true,
  maxWidth = 'max-w-5xl',
  hasChanges = true, // Por defecto true para compatibilidad
  closeText = 'Tancar'
}: SimpleWizardProps) {
  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  const content = (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{title}</h1>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Progress Steps - En dos filas si hay más de 5 pasos */}
        {steps.length > 5 ? (
          <div className="space-y-3">
            {/* Primera fila */}
            <div className="flex items-center justify-center gap-2">
              {steps.slice(0, Math.ceil(steps.length / 2)).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 ${
                      currentStep >= step.id ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      currentStep === step.id ? 'bg-white text-green-600' :
                      currentStep > step.id ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {currentStep > step.id ? '✓' : step.icon}
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                  </div>
                  {index < Math.ceil(steps.length / 2) - 1 && (
                    <div className={`h-0.5 w-6 mx-1.5 ${
                      currentStep > step.id ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            {/* Segunda fila */}
            <div className="flex items-center justify-center gap-2">
              {steps.slice(Math.ceil(steps.length / 2)).map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 ${
                      currentStep >= step.id ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      currentStep === step.id ? 'bg-white text-green-600' :
                      currentStep > step.id ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {currentStep > step.id ? '✓' : step.icon}
                    </div>
                    <span className="text-xs font-medium">{step.title}</span>
                  </div>
                  {index < steps.slice(Math.ceil(steps.length / 2)).length - 1 && (
                    <div className={`h-0.5 w-6 mx-1.5 ${
                      currentStep > step.id ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= step.id ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep === step.id ? 'bg-white text-green-600' :
                    currentStep > step.id ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                  }`}>
                    {currentStep > step.id ? '✓' : step.icon}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-8 md:w-16 mx-2 ${
                    currentStep > step.id ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
        {children}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevious}
            disabled={isFirstStep}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Pas {currentStep} de {steps.length}
            </span>
          </div>

          {isLastStep ? (
            hasChanges && onSubmit ? (
              <button
                onClick={onSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {loadingText}
                  </>
                ) : (
                  <>
                    {submitText}
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                {closeText}
              </button>
            )
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Següent
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  // Si showModal es true, mostrar como modal
  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-hidden`}>
          {content}
        </div>
      </div>
    );
  }

  // Si no, mostrar directamente el contenido
  return (
    <div className={`bg-white rounded-xl shadow-lg w-full ${maxWidth} overflow-hidden`}>
      {content}
    </div>
  );
}

// Componente auxiliar para el ícono de check
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);