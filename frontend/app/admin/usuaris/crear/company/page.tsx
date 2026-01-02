'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Image,
  Info,
  Phone,
  CreditCard,
  CheckCircle,
  Key,
  Loader2,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import SimpleWizard from '@/components/wizard/SimpleWizard';
import {
  Step1Branding,
  Step2BasicInfo,
  Step3Contact,
  Step4Social,
  Step8Review,
} from '@/components/empresa/wizard/steps';
import {
  EmpresaFormData,
  initialEmpresaFormData,
} from '@/components/empresa/wizard/types';
import { getLeadById, marcarLeadGuanyat } from '@/lib/admin/actions/empreses-pendents-actions';

// Step especial para seleccion de plan
const StepPlan = ({
  availablePlans,
  selectedPlan,
  onSelectPlan,
  generatedPassword,
  error,
}: {
  availablePlans: any[];
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
  generatedPassword: string;
  error?: string;
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccio de Pla</h2>
        <p className="text-gray-600">Escull el pla de col·laboracio</p>
      </div>

      {availablePlans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Carregant plans...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                selectedPlan === plan.tier
                  ? 'border-amber-500 bg-amber-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => onSelectPlan(plan.tier)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  plan.basePrice === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {plan.basePrice === 0 ? 'Gratis' : `${plan.basePrice}€/any`}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Ofertes: {plan.maxActiveOffers === -1 ? 'Il·limitades' : plan.maxActiveOffers}
              </p>
              {plan.trialDurationDays > 0 && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {plan.trialDurationDays} dies de prova
                </span>
              )}
              {plan.firstYearDiscount > 0 && (
                <span className="inline-block ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  -{Math.round(plan.firstYearDiscount * 100)}% 1r any
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Password preview */}
      {generatedPassword && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">Contrasenya Generada</h4>
          </div>
          <div className="font-mono text-lg bg-white text-gray-900 px-3 py-2 border rounded">
            {generatedPassword}
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Aquesta contrasenya es generara automaticament al crear l'empresa
          </p>
        </div>
      )}
    </div>
  );
};

function CrearEmpresaWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [leadData, setLeadData] = useState<any>(null);
  const [loadingLead, setLoadingLead] = useState(false);

  const [formData, setFormData] = useState<EmpresaFormData>(initialEmpresaFormData);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAvailablePlans();
    if (leadId) {
      loadLeadData(leadId);
    }
  }, [leadId]);

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();
      if (data.success) {
        setAvailablePlans(data.data || []);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const loadLeadData = async (id: string) => {
    setLoadingLead(true);
    try {
      const result = await getLeadById(id);
      if (result.success && result.data) {
        setLeadData(result.data);
        // Pre-fill form with lead data
        setFormData((prev) => ({
          ...prev,
          name: result.data.companyName || '',
          cif: result.data.cif || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          website: result.data.website || '',
          address: result.data.address || '',
          city: result.data.city || '',
          sector: result.data.sector || '',
        }));
      }
    } catch (error) {
      console.error('Error carregant lead:', error);
    } finally {
      setLoadingLead(false);
    }
  };

  // Generate password
  const generatePassword = (companyName: string, planTier: string) => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString().slice(-2);
    const companyPrefix = (companyName || 'EMP').slice(0, 3).toUpperCase();
    const planSuffix = (planTier || 'X').slice(-1).toUpperCase();
    return `${companyPrefix}${day}${month}${year}${planSuffix}`;
  };

  useEffect(() => {
    if (formData.name && selectedPlan) {
      setGeneratedPassword(generatePassword(formData.name, selectedPlan));
    }
  }, [formData.name, selectedPlan]);

  const updateField = (field: keyof EmpresaFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 2: // Basic Info
        if (!formData.name?.trim()) newErrors.name = 'El nom es obligatori';
        if (!formData.cif?.trim()) newErrors.cif = 'El CIF es obligatori';
        if (!formData.sector?.trim()) newErrors.sector = 'El sector es obligatori';
        break;
      case 3: // Contact
        if (!formData.email?.trim()) {
          newErrors.email = "L'email es obligatori";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Format d'email invalid";
        }
        break;
      case 5: // Plan
        if (!selectedPlan) newErrors.selectedPlan = 'Selecciona un pla';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const steps = [
    { id: 1, title: 'Branding', icon: <Image className="w-5 h-5" /> },
    { id: 2, title: 'Informacio', icon: <Info className="w-5 h-5" /> },
    { id: 3, title: 'Contacte', icon: <Phone className="w-5 h-5" /> },
    { id: 4, title: 'Xarxes', icon: <Share2 className="w-5 h-5" /> },
    { id: 5, title: 'Pla', icon: <CreditCard className="w-5 h-5" /> },
    { id: 6, title: 'Revisio', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsLoading(true);
    try {
      const payload = {
        userType: 'COMPANY_OWNER',
        email: formData.email,
        password: generatedPassword,
        companyName: formData.name,
        cif: formData.cif,
        selectedPlan: selectedPlan,
        sector: formData.sector,
        phone: formData.phone,
        address: formData.address,
        userData: {
          name: formData.name,
          cif: formData.cif,
          sector: formData.sector,
          website: formData.website,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
        },
      };

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Si viene de un lead, marcarlo como ganado
          if (leadId && result.data?.company?.id) {
            try {
              await marcarLeadGuanyat(leadId, result.data.company.id);
            } catch (error) {
              console.error('Error marcant lead com guanyat:', error);
            }
          }

          const successMessage = leadData
            ? `Empresa creada exitosament des del lead!\n\nCredencials:\n- Empresa: ${formData.name}\n- Email: ${formData.email}\n- Contrasenya: ${generatedPassword}\n\nEl lead "${leadData.companyName}" s'ha marcat com guanyat.`
            : `Empresa creada exitosament!\n\nCredencials:\n- Empresa: ${formData.name}\n- Email: ${formData.email}\n- Contrasenya: ${generatedPassword}`;

          alert(successMessage);
          router.push('/admin/usuaris');
        } else {
          alert(result.error || "Error al crear l'empresa");
        }
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear l'empresa");
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de connexio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (confirm('Vols sortir sense guardar els canvis?')) {
      router.push('/admin/usuaris/crear');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Branding formData={formData} errors={errors} updateField={updateField} />
        );
      case 2:
        return (
          <Step2BasicInfo formData={formData} errors={errors} updateField={updateField} />
        );
      case 3:
        return (
          <Step3Contact formData={formData} errors={errors} updateField={updateField} />
        );
      case 4:
        return (
          <Step4Social formData={formData} errors={errors} updateField={updateField} />
        );
      case 5:
        return (
          <StepPlan
            availablePlans={availablePlans}
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            generatedPassword={generatedPassword}
            error={errors.selectedPlan}
          />
        );
      case 6:
        return (
          <Step8Review
            formData={formData}
            errors={errors}
            onSaveDraft={() => {}}
            onPublish={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Lead banner */}
      {leadData && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <Info className="w-5 h-5" />
            <span>Creant empresa des del lead: <strong>{leadData.companyName}</strong></span>
          </div>
        </div>
      )}

      {loadingLead && (
        <div className="bg-slate-100 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
            <span className="text-slate-600">Carregant dades del lead...</span>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <SimpleWizard
            title="Crear Nova Empresa"
            steps={steps}
            currentStep={currentStep}
            onClose={handleClose}
            onNext={nextStep}
            onPrevious={prevStep}
            onSubmit={currentStep === 6 ? handleSubmit : undefined}
            isLoading={isLoading}
            submitText="Crear Empresa"
            loadingText="Creant..."
            showModal={false}
          >
            {renderStep()}
          </SimpleWizard>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Carregant...</p>
      </div>
    </div>
  );
}

export default function CrearEmpresaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CrearEmpresaWizardContent />
    </Suspense>
  );
}
