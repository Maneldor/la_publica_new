'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Image,
  Info,
  Phone,
  Briefcase,
  Award,
  Users,
  CheckCircle
} from 'lucide-react';
import SimpleWizard from '@/components/wizard/SimpleWizard';
import { useAdminCreateEmpresa } from '@/app/admin/empresas/crear/hooks/useAdminCreateEmpresa';
import { Step1Branding } from '@/app/admin/empresas/crear/components/steps/Step1Branding';
import { Step2BasicInfo } from '@/app/admin/empresas/crear/components/steps/Step2BasicInfo';
import { Step3Contact } from '@/app/admin/empresas/crear/components/steps/Step3Contact';
import { Step4Professional } from '@/app/admin/empresas/crear/components/steps/Step4Professional';
import { Step5Certifications } from '@/app/admin/empresas/crear/components/steps/Step5Certifications';
import { Step6Team } from '@/app/admin/empresas/crear/components/steps/Step6Team';
import { Step8Review } from '@/app/admin/empresas/crear/components/steps/Step8Review';

export default function EditarPerfilEmpresaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

  const steps = [
    { id: 1, title: 'Branding', icon: <Image className="w-5 h-5" /> },
    { id: 2, title: 'Informació', icon: <Info className="w-5 h-5" /> },
    { id: 3, title: 'Contacte', icon: <Phone className="w-5 h-5" /> },
    { id: 4, title: 'Professional', icon: <Briefcase className="w-5 h-5" /> },
    { id: 5, title: 'Certificacions', icon: <Award className="w-5 h-5" /> },
    { id: 6, title: 'Equip', icon: <Users className="w-5 h-5" /> },
    { id: 7, title: 'Revisió', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Actualitzant perfil empresa:', formData);
      alert('✅ Perfil actualitzat correctament!');
      router.push('/empresa/perfil');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualitzar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (confirm('Vols sortir sense guardar els canvis?')) {
      router.push('/empresa/perfil');
    }
  };

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
          <Step8Review
            formData={formData}
            errors={errors}
            onSaveDraft={() => {}}
            onPublish={handleSubmit}
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
    <SimpleWizard
      title="Editar Perfil d'Empresa"
      steps={steps}
      currentStep={currentStep}
      onClose={handleClose}
      onNext={nextStep}
      onPrevious={prevStep}
      onSubmit={currentStep === 7 ? handleSubmit : undefined}
      isLoading={isLoading}
      submitText="Actualitzar Perfil"
      loadingText="Actualitzant..."
      showModal={true}
    >
      {renderStep()}
    </SimpleWizard>
  );
}