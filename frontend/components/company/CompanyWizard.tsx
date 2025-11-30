'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Building2, Mail, CreditCard, CheckCircle2 } from 'lucide-react';
import WizardLayout, { WizardStep } from '@/components/wizard/WizardLayout';
import { MinimalCompanyData, PlanTier, COMPANY_SECTORS, CompanySector, validateSpanishNIF } from '@/lib/auth/credentialGenerator';

export interface CompanyWizardProps {
  mode: 'admin_create' | 'create' | 'edit';
  userRole: 'ADMIN' | 'GESTOR' | 'COMPANY_OWNER';
  companyData?: Partial<MinimalCompanyData>;
  onSubmit: (data: MinimalCompanyData) => Promise<void>;
  onClose: () => void;
  availablePlans?: Array<{
    tier: PlanTier;
    name: string;
    basePrice: number;
    firstYearDiscount: number;
    description: string;
    features: string[];
  }>;
}

interface FormData {
  companyName: string;
  companyEmail: string;
  companyNif: string;
  sector: CompanySector | '';
  selectedPlan: PlanTier | '';
}

interface FormErrors {
  companyName?: string;
  companyEmail?: string;
  companyNif?: string;
  sector?: string;
  selectedPlan?: string;
}

export const CompanyWizard: React.FC<CompanyWizardProps> = ({
  mode,
  userRole,
  companyData = {},
  onSubmit,
  onClose,
  availablePlans = []
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    companyName: companyData.companyName || '',
    companyEmail: companyData.companyEmail || '',
    companyNif: companyData.companyNif || '',
    sector: (companyData.sector as CompanySector) || '',
    selectedPlan: companyData.selectedPlan || ''
  });

  // Configuración de pasos según el modo
  const steps = [
    {
      title: 'Dades Bàsiques',
      description: 'Informació general de l\'empresa',
      icon: <Building2 className="w-5 h-5" />,
      component: null // Se renderiza directamente en el return
    },
    {
      title: 'Contacte',
      description: 'Email de contacte i comunicació',
      icon: <Mail className="w-5 h-5" />,
      component: null
    },
    {
      title: 'Pla',
      description: 'Selecció del pla de col·laboració',
      icon: <CreditCard className="w-5 h-5" />,
      component: null
    },
    {
      title: 'Confirmació',
      description: 'Revisió i confirmació de les dades',
      icon: <CheckCircle2 className="w-5 h-5" />,
      component: null
    }
  ].filter(step => {
    // En modo edit, sin step de plan
    if (mode === 'edit' && step.title === 'Pla') {
      return false;
    }
    return true;
  });

  // Validaciones por paso usando useMemo para evitar re-renders
  const { currentStepErrors, isCurrentStepValid } = useMemo(() => {
    const newErrors: FormErrors = {};

    switch (currentStep) {
      case 1: // Datos Básicos
        if (!formData.companyName.trim()) {
          newErrors.companyName = 'El nom de l\'empresa és obligatori';
        } else if (formData.companyName.length < 2) {
          newErrors.companyName = 'El nom ha de tenir almenys 2 caràcters';
        }

        if (!formData.companyNif.trim()) {
          newErrors.companyNif = 'El CIF/NIF és obligatori';
        } else if (!validateSpanishNIF(formData.companyNif)) {
          newErrors.companyNif = 'Format de CIF/NIF no vàlid';
        }

        if (!formData.sector) {
          newErrors.sector = 'El sector és obligatori';
        }
        break;

      case 2: // Contacto
        if (!formData.companyEmail.trim()) {
          newErrors.companyEmail = 'L\'email és obligatori';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.companyEmail)) {
            newErrors.companyEmail = 'Format d\'email no vàlid';
          }
        }
        break;

      case 3: // Plan (solo si está visible)
        if (mode !== 'edit' && !formData.selectedPlan) {
          newErrors.selectedPlan = 'Has de seleccionar un pla';
        }
        break;
    }

    return {
      currentStepErrors: newErrors,
      isCurrentStepValid: Object.keys(newErrors).length === 0
    };
  }, [currentStep, formData, mode]);

  // Actualizar errores solo cuando cambien
  useEffect(() => {
    setErrors(currentStepErrors);
  }, [currentStepErrors]);

  // Función auxiliar para validar pasos específicos
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1: // Datos Básicos
        if (!formData.companyName.trim()) {
          newErrors.companyName = 'El nom de l\'empresa és obligatori';
        } else if (formData.companyName.length < 2) {
          newErrors.companyName = 'El nom ha de tenir almenys 2 caràcters';
        }

        if (!formData.companyNif.trim()) {
          newErrors.companyNif = 'El CIF/NIF és obligatori';
        } else if (!validateSpanishNIF(formData.companyNif)) {
          newErrors.companyNif = 'Format de CIF/NIF no vàlid';
        }

        if (!formData.sector) {
          newErrors.sector = 'El sector és obligatori';
        }
        break;

      case 2: // Contacto
        if (!formData.companyEmail.trim()) {
          newErrors.companyEmail = 'L\'email és obligatori';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.companyEmail)) {
            newErrors.companyEmail = 'Format d\'email no vàlid';
          }
        }
        break;

      case 3: // Plan (solo si está visible)
        if (mode !== 'edit' && !formData.selectedPlan) {
          newErrors.selectedPlan = 'Has de seleccionar un pla';
        }
        break;
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validar todos los pasos
    const allStepsValid = steps.every((_, index) => validateStep(index + 1));

    if (!allStepsValid) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        companyNif: formData.companyNif.toUpperCase(),
        sector: formData.sector as CompanySector,
        selectedPlan: formData.selectedPlan as PlanTier
      });
    } catch (error) {
      console.error('Error submitting company data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Componentes de cada paso memoizados
  const BasicDataStep = useMemo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Dades Bàsiques de l'Empresa</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'empresa *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => updateFormData('companyName', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: InnoTech Solutions SL"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CIF/NIF *
            </label>
            <input
              type="text"
              value={formData.companyNif}
              onChange={(e) => updateFormData('companyNif', e.target.value.toUpperCase())}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.companyNif ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: B12345678"
              maxLength={9}
            />
            {errors.companyNif && (
              <p className="mt-1 text-sm text-red-600">{errors.companyNif}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector *
            </label>
            <select
              value={formData.sector}
              onChange={(e) => updateFormData('sector', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.sector ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona un sector</option>
              {COMPANY_SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            {errors.sector && (
              <p className="mt-1 text-sm text-red-600">{errors.sector}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  ), [formData.companyName, formData.companyNif, formData.sector, errors.companyName, errors.companyNif, errors.sector, updateFormData]);

  const ContactStep = useMemo(() => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contacte i Comunicació</h3>
        <p className="text-gray-600 mb-6">Aquest email s'utilitzarà per a l'accés a la plataforma</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de l'empresa *
          </label>
          <input
            type="email"
            value={formData.companyEmail}
            onChange={(e) => updateFormData('companyEmail', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.companyEmail ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="contacte@empresa.com"
          />
          {errors.companyEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.companyEmail}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Aquest serà l'usuari per accedir a la plataforma
          </p>
        </div>
      </div>
    </div>
  ), [formData.companyEmail, errors.companyEmail, updateFormData]);

  const PlanStep = useMemo(() => {
    if (mode === 'edit') return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecció del Pla</h3>
          <p className="text-gray-600 mb-6">Escull el pla que millor s'adapti a les necessitats de l'empresa</p>

          <div className="grid gap-4">
            {availablePlans.map(plan => {
              const discountedPrice = plan.basePrice * (1 - plan.firstYearDiscount);
              return (
                <div
                  key={plan.tier}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.selectedPlan === plan.tier
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateFormData('selectedPlan', plan.tier)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{plan.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{plan.description}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-green-600">
                          {discountedPrice}€
                        </span>
                        {plan.firstYearDiscount > 0 && (
                          <>
                            <span className="text-lg text-gray-400 line-through">
                              {plan.basePrice}€
                            </span>
                            <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                              -{plan.firstYearDiscount}%
                            </span>
                          </>
                        )}
                        <span className="text-gray-500">/any</span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 ${
                      formData.selectedPlan === plan.tier
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.selectedPlan === plan.tier && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <ul className="text-sm text-gray-600 space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {errors.selectedPlan && (
            <p className="mt-2 text-sm text-red-600">{errors.selectedPlan}</p>
          )}
        </div>
      </div>
    );
  }, [mode, availablePlans, formData.selectedPlan, errors.selectedPlan, updateFormData]);

  const ConfirmationStep = useMemo(() => {
    const selectedPlan = availablePlans.find(p => p.tier === formData.selectedPlan);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Confirmació de Dades</h3>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Empresa</h4>
              <p className="text-lg font-semibold">{formData.companyName}</p>
              <p className="text-gray-600">CIF: {formData.companyNif}</p>
              <p className="text-gray-600">Sector: {formData.sector}</p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700">Contacte</h4>
              <p className="text-gray-600">{formData.companyEmail}</p>
            </div>

            {mode !== 'edit' && selectedPlan && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700">Pla Seleccionat</h4>
                <p className="text-lg font-semibold">{selectedPlan.name}</p>
                <p className="text-green-600 font-medium">
                  {selectedPlan.basePrice * (1 - selectedPlan.firstYearDiscount)}€/any
                  {selectedPlan.firstYearDiscount > 0 && (
                    <span className="text-gray-500 text-sm ml-2">
                      (Descompte del {Math.round(selectedPlan.firstYearDiscount * 100)}% el primer any)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-900 font-medium mb-1">Següents passos:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Es crearà el compte de l'empresa</li>
                  <li>• Rebràs un email amb les credencials d'accés</li>
                  <li>• Podràs completar el perfil des del teu panell</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [availablePlans, formData.selectedPlan, formData.companyName, formData.companyNif, formData.sector, formData.companyEmail, mode]);

  const canGoNext = isCurrentStepValid;
  const isLastStep = currentStep === steps.length;

  // Renderizar el contenido del paso actual
  const renderCurrentStepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return BasicDataStep;
      case 2:
        return ContactStep;
      case 3:
        if (mode === 'edit') return ConfirmationStep;
        return PlanStep;
      case 4:
        return ConfirmationStep;
      default:
        return BasicDataStep;
    }
  }, [currentStep, mode, BasicDataStep, ContactStep, PlanStep, ConfirmationStep]);

  return (
    <WizardLayout
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      onClose={onClose}
      canGoNext={canGoNext}
      isLastStep={isLastStep}
      isLoading={isLoading}
      title={mode === 'admin_create' ? 'Nova Empresa Col·laboradora' : 'Configuració d\'Empresa'}
      submitText={mode === 'edit' ? 'Actualitzar' : 'Crear Empresa'}
      loadingText={mode === 'edit' ? 'Actualitzant...' : 'Creant empresa...'}
    >
      {renderCurrentStepContent}
    </WizardLayout>
  );
};

export default CompanyWizard;