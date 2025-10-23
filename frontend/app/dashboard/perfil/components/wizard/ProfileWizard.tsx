'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useProfileWizard } from '../../hooks/useProfileWizard';
import { ProgressIndicator } from './ProgressIndicator';
import { Step1Basic } from './Step1Basic';
import { Step2Personal } from './Step2Personal';
import { Step3Social } from './Step3Social';
import { Step4Education } from './Step4Education';
import { Step5Experience } from './Step5Experience';
import { Step6Skills } from './Step6Skills';
import { Step7Languages } from './Step7Languages';
import { Step8Review } from './Step8Review';

interface ProfileWizardProps {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

export const ProfileWizard = ({ onClose, onSave, initialData }: ProfileWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const {
    formData,
    errors,
    updateField,
    addEducation,
    updateEducation,
    removeEducation,
    addExperience,
    updateExperience,
    removeExperience,
    addLanguage,
    updateLanguage,
    removeLanguage,
    validateStep,
    resetForm
  } = useProfileWizard(initialData);

  const steps = [
    { id: 1, title: 'Imatges i Bàsic', description: 'Fotos i informació principal' },
    { id: 2, title: 'Informació Personal', description: 'Bio, ubicació i detalls personals' },
    { id: 3, title: 'Xarxes Socials', description: 'Perfils de Twitter, LinkedIn i Instagram' },
    { id: 4, title: 'Formació', description: 'Estudis i certificacions acadèmiques' },
    { id: 5, title: 'Experiència', description: 'Trajectòria professional' },
    { id: 6, title: 'Habilitats', description: 'Competències i interessos' },
    { id: 7, title: 'Idiomes', description: 'Llengües i nivells de competència' },
    { id: 8, title: 'Revisió', description: 'Revisió final i guardar' }
  ];

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!validateStep(8)) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      // Here you could show an error message
    } finally {
      setIsSaving(false);
    }
  };

  const renderCurrentStep = () => {
    const commonProps = {
      formData,
      errors,
      updateField
    };

    switch (currentStep) {
      case 1:
        return <Step1Basic {...commonProps} />;
      case 2:
        return <Step2Personal {...commonProps} />;
      case 3:
        return <Step3Social {...commonProps} />;
      case 4:
        return (
          <Step4Education
            {...commonProps}
            addEducation={addEducation}
            updateEducation={updateEducation}
            removeEducation={removeEducation}
          />
        );
      case 5:
        return (
          <Step5Experience
            {...commonProps}
            addExperience={addExperience}
            updateExperience={updateExperience}
            removeExperience={removeExperience}
          />
        );
      case 6:
        return <Step6Skills {...commonProps} />;
      case 7:
        return (
          <Step7Languages
            {...commonProps}
            addLanguage={addLanguage}
            updateLanguage={updateLanguage}
            removeLanguage={removeLanguage}
          />
        );
      case 8:
        return (
          <Step8Review
            formData={formData}
            errors={errors}
            onSave={handleSave}
            isSaving={isSaving}
          />
        );
      default:
        return <Step1Basic {...commonProps} />;
    }
  };

  const isStepValid = validateStep(currentStep);
  const isLastStep = currentStep === steps.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Configurar Perfil</h1>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-xl font-bold"
            >
              ✕
            </button>
          </div>

          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-280px)]">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>

              {!isLastStep && (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Següent
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600">
              Pas {currentStep} de {steps.length}
            </div>
          </div>

          {/* Validation Errors */}
          {!isStepValid && Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-1">
                Cal completar els camps obligatoris abans de continuar:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};