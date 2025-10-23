'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAdminCreateAnunci } from './hooks/useAdminCreateAnunci';
import { ProgressIndicator } from './components/ProgressIndicator';
import { Step1BasicInfo } from './components/steps/Step1BasicInfo';
import { Step2Details } from './components/steps/Step2Details';
import { Step3Location } from './components/steps/Step3Location';
import { Step4Images } from './components/steps/Step4Images';
import { Step5Review } from './components/steps/Step5Review';
import { StepAdminSettings } from './components/steps/StepAdminSettings';

export default function CrearAnuncioAdminPage() {
  const router = useRouter();
  const {
    currentStep,
    formData,
    errors,
    updateField,
    nextStep,
    prevStep,
  } = useAdminCreateAnunci();

  const handlePublish = () => {
    // Aquí iría la lógica de envío al backend con datos de admin
    console.log('Publicando anuncio de admin:', formData);

    // Simular éxito
    alert('✅ Anunci d\'admin publicat correctament!');

    // Redirigir a la lista de anuncios del admin
    router.push('/admin/anuncios/listar');
  };

  const steps = [
    'Informació',
    'Detalls',
    'Ubicació',
    'Imatges',
    'Configuració Admin',
    'Revisió'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 2:
        return (
          <Step2Details
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 3:
        return (
          <Step3Location
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 4:
        return (
          <Step4Images
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 5:
        return (
          <StepAdminSettings
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 6:
        return (
          <Step5Review
            formData={formData}
            errors={errors}
            onPublish={handlePublish}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Step {currentStep} - En construcció
            </h3>
            <p className="text-gray-600">
              Aquest pas s'està desenvolupant.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Tornar
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Crear Nou Anunci (Admin)
            </h1>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              👑 Administrador
            </span>
          </div>
          <p className="text-gray-600">
            Wizard avançat amb privilegis d'administrador per crear anuncis destacats
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={6}
          steps={steps}
        />

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
              ${currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }
            `}
          >
            <ArrowLeft className="w-5 h-5" />
            Anterior
          </button>

          {currentStep < 6 && (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
            >
              {currentStep === 5 ? 'Revisar' : 'Següent'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}