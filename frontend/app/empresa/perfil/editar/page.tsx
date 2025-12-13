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
// import { useAdminCreateEmpresa } from '@/app/admin/empresas/crear/hooks/useAdminCreateEmpresa';
// Imports replaced with local placeholders due to missing files
// import { Step1Branding } from '@/app/admin/empresas/crear/components/steps/Step1Branding';
// ...

// Local placeholders for missing components
const StepPlaceholder = ({ title, formData }: any) => (
  <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500">Component missing or under construction.</p>
    <div className="mt-4 text-left bg-gray-50 p-4 rounded text-xs font-mono overflow-auto max-h-40">
      {JSON.stringify(formData, null, 2)}
    </div>
  </div>
);

const Step1Branding = (props: any) => <StepPlaceholder title="Branding" {...props} />;
const Step2BasicInfo = (props: any) => <StepPlaceholder title="Basic Info" {...props} />;
const Step3Contact = (props: any) => <StepPlaceholder title="Contact" {...props} />;
const Step4Professional = (props: any) => <StepPlaceholder title="Professional" {...props} />;
const Step5Certifications = (props: any) => <StepPlaceholder title="Certifications" {...props} />;
const Step6Team = (props: any) => <StepPlaceholder title="Team" {...props} />;
const Step8Review = (props: any) => <StepPlaceholder title="Review" {...props} />;

export default function EditarPerfilEmpresaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Local state management replacing useAdminCreateEmpresa
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  // Stubs for specific actions
  const addTeamMember = () => { };
  const updateTeamMember = () => { };
  const removeTeamMember = () => { };
  const addCertification = () => { };
  const updateCertification = () => { };
  const removeCertification = () => { };

  /*
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
  */

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
            onSaveDraft={() => { }}
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