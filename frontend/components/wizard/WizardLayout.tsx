'use client';

import { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface WizardStep {
  title: string;
  description?: string;
  icon: ReactNode;
  component: ReactNode;
}

interface WizardLayoutProps {
  steps: WizardStep[];
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onClose: () => void;
  canGoNext: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
  title: string;
  submitText?: string;
  loadingText?: string;
  children?: ReactNode;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
  steps,
  currentStep,
  onNext,
  onPrevious,
  onSubmit,
  onClose,
  canGoNext,
  isLastStep,
  isLoading = false,
  title,
  submitText = "Crear",
  loadingText = "Creant...",
  children
}) => {
  const currentStepIndex = currentStep - 1;
  const totalSteps = steps.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
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

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= index + 1 ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep === index + 1 ? 'bg-white text-green-600' :
                    currentStep > index + 1 ? 'bg-green-500 text-white' : 'bg-white/20 text-white'
                  }`}>
                    {currentStep > index + 1 ? '✓' : step.icon}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-8 md:w-16 mx-2 ${
                    currentStep > index + 1 ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
          {children || (steps[currentStepIndex]?.component)}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onPrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="text-sm text-gray-600">
              Pas {currentStep} de {totalSteps}
            </div>

            <div className="flex gap-3">
              {isLastStep ? (
                <button
                  onClick={onSubmit}
                  disabled={isLoading || !canGoNext}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {loadingText}
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      {submitText}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  Següent
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;