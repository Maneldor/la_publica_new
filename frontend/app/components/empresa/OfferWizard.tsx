'use client';

import { useState, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Save, Send, Eye } from 'lucide-react';
import { OfferPreview } from './OfferPreview';

interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  isValid?: boolean;
}

interface OfferWizardProps {
  steps: WizardStep[];
  onSave: (status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => Promise<void>;
  formData: any;
  onChange: (data: any) => void;
  isEdit?: boolean;
  currentStatus?: string;
}

export default function OfferWizard({
  steps,
  onSave,
  formData,
  onChange,
  isEdit = false,
  currentStatus
}: OfferWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = steps[currentStep].isValid !== false;

  const handleNext = () => {
    if (canGoNext && !isLastStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async (status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => {
    setIsSaving(true);
    try {
      await onSave(status);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Main Wizard Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200">
        {/* Progress Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Oferta' : 'Crear Nova Oferta'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Pas {currentStep + 1} de {steps.length}: {steps[currentStep].title}
              </p>
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Amagar' : 'Veure'} Preview
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              {steps.map((step, index) => (
                <span
                  key={step.id}
                  className={`flex-1 text-center ${
                    index === currentStep ? 'font-semibold text-blue-600' : ''
                  }`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {steps[currentStep].description && (
            <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>
          )}
          {steps[currentStep].component}
        </div>

        {/* Navigation Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex items-center gap-3">
              {/* Save as Draft */}
              <button
                onClick={() => handleSave('DRAFT')}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar Esborrany
              </button>

              {/* Submit for Review (only if not last step or current status is DRAFT) */}
              {(currentStatus === 'DRAFT' || !isEdit) && (
                <button
                  onClick={() => handleSave('PENDING')}
                  disabled={isSaving || !canGoNext}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Enviar a Revisió
                </button>
              )}

              {/* Next or Finish */}
              {!isLastStep ? (
                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Següent
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleSave('PUBLISHED')}
                  disabled={isSaving || !canGoNext}
                  className="flex items-center gap-2 px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Guardant...' : 'Publicar Oferta'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="w-96 bg-gray-50 rounded-xl border border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="space-y-4">
            <OfferPreview formData={formData} />
          </div>
        </div>
      )}
    </div>
  );
}