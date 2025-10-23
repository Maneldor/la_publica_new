'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAdminCreateEmpresa } from './hooks/useAdminCreateEmpresa';
import { ProgressIndicator } from './components/ProgressIndicator';
import { Step1Branding } from './components/steps/Step1Branding';
import { Step2BasicInfo } from './components/steps/Step2BasicInfo';
import { Step3Contact } from './components/steps/Step3Contact';
import { Step4Professional } from './components/steps/Step4Professional';
import { Step5Certifications } from './components/steps/Step5Certifications';
import { Step6Team } from './components/steps/Step6Team';
import { Step7AdminConfig } from './components/steps/Step7AdminConfig';
import { Step8Review } from './components/steps/Step8Review';

export default function CrearEmpresaPage() {
  const router = useRouter();
  const {
    currentStep,
    formData,
    errors,
    updateField,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    addCertification,
    updateCertification,
    removeCertification,
    nextStep,
    prevStep,
  } = useAdminCreateEmpresa();

  const handleSaveDraft = async () => {
    // TODO: Implement save as draft functionality
    console.log('Guardant esborrany:', formData);
    alert('✅ Esborrany guardat correctament!');
  };

  const handlePublish = async () => {
    // TODO: Implement full publish functionality with API calls
    console.log('Publicant empresa:', formData);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    alert('✅ Empresa publicada correctament!');
    router.push('/admin/empresas/listar');
  };

  const steps = [
    'Branding',
    'Informació',
    'Contacte',
    'Professional',
    'Certificacions',
    'Equip',
    'Config Admin',
    'Revisió'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Branding
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 2:
        return (
          <Step2BasicInfo
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 3:
        return (
          <Step3Contact
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 4:
        return (
          <Step4Professional
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 5:
        return (
          <Step5Certifications
            formData={formData}
            errors={errors}
            updateField={updateField}
            addCertification={addCertification}
            updateCertification={updateCertification}
            removeCertification={removeCertification}
          />
        );
      case 6:
        return (
          <Step6Team
            formData={formData}
            errors={errors}
            updateField={updateField}
            addTeamMember={addTeamMember}
            updateTeamMember={updateTeamMember}
            removeTeamMember={removeTeamMember}
          />
        );
      case 7:
        return (
          <Step7AdminConfig
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 8:
        return (
          <Step8Review
            formData={formData}
            errors={errors}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Pas {currentStep} - En construcció
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
              Crear Nova Empresa (Admin)
            </h1>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              👑 Administrador
            </span>
          </div>
          <p className="text-gray-600">
            Wizard avançat amb privilegis d'administrador per crear empreses col·laboradores
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={8}
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

          {currentStep < 8 && (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
            >
              {currentStep === 7 ? 'Revisar' : 'Següent'}
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}