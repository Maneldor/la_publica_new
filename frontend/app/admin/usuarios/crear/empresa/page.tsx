'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Mail, CreditCard, CheckCircle2, Key, Info, Loader2 } from 'lucide-react';
import { getLeadById, marcarLeadGuanyat } from '@/lib/admin/actions/empreses-pendents-actions';

function CrearEmpresaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [leadData, setLeadData] = useState<any>(null);
  const [loadingLead, setLoadingLead] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    cif: '',
    sector: '',
    selectedPlan: '',
    generatedPassword: '',
    // Camps adicionals del lead
    phone: '',
    contactName: '',
    contactRole: '',
    website: '',
    address: '',
    city: ''
  });

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
        // Pre-omplir el formulari amb les dades del lead
        setFormData(prev => ({
          ...prev,
          companyName: result.data.companyName || '',
          cif: result.data.cif || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          contactName: result.data.contactName || '',
          contactRole: result.data.contactRole || '',
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

  // Función para generar contraseña automática
  const generatePassword = (companyName: string, planTier: string) => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear().toString().slice(-2);

    const companyPrefix = companyName.slice(0, 3).toUpperCase();
    const planSuffix = planTier.slice(-1).toUpperCase();

    return `${companyPrefix}${day}${month}${year}${planSuffix}`;
  };

  // Actualizar contraseña cuando cambian nombre o plan
  useEffect(() => {
    if (formData.companyName && formData.selectedPlan) {
      const password = generatePassword(formData.companyName, formData.selectedPlan);
      setFormData(prev => ({ ...prev, generatedPassword: password }));
    }
  }, [formData.companyName, formData.selectedPlan]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.companyName.trim()) {
          newErrors.companyName = 'El nom de l\'empresa és obligatori';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'L\'email és obligatori';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Format d\'email invàlid';
        }
        if (!formData.cif.trim()) {
          newErrors.cif = 'El CIF/NIF és obligatori';
        }
        if (!formData.sector.trim()) {
          newErrors.sector = 'El sector és obligatori';
        }
        break;
      case 2:
        if (!formData.selectedPlan) {
          newErrors.selectedPlan = 'Selecciona un pla';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      const payload = {
        userType: 'COMPANY_OWNER',
        email: formData.email,
        password: formData.generatedPassword,
        companyName: formData.companyName,
        cif: formData.cif,
        selectedPlan: formData.selectedPlan,
        sector: formData.sector, // Añadir sector al nivel principal
        userData: {
          name: formData.companyName,
          cif: formData.cif,
          sector: formData.sector
        }
      };

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Si ve d'un lead, marcar-lo com guanyat
          if (leadId && result.companyId) {
            try {
              await marcarLeadGuanyat(leadId, result.companyId);
            } catch (error) {
              console.error('Error marcant lead com guanyat:', error);
            }
          }

          const successMessage = leadData
            ? `Empresa creada exitosament des del lead!\n\nCredencials generades:\n🏢 Empresa: ${formData.companyName}\n📧 Email: ${formData.email}\n🏭 Sector: ${formData.sector}\n🔑 Contrasenya: ${formData.generatedPassword}\n\n✅ El lead "${leadData.companyName}" s'ha marcat com guanyat.\n\nPodràs completar les dades addicionals des de la llista d'empreses.`
            : `Empresa creada exitosament!\n\nCredencials generades:\n🏢 Empresa: ${formData.companyName}\n📧 Email: ${formData.email}\n🏭 Sector: ${formData.sector}\n🔑 Contrasenya: ${formData.generatedPassword}\n\nPodràs completar les dades addicionals des de la llista d'empreses.`;

          alert(successMessage);
          router.push('/admin/empresas/listar?refresh=1');
        } else {
          alert(result.error || 'Error al crear l\'empresa');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear l\'empresa');
      }
    } catch (error) {
      alert('Error de connexió');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Informació Bàsica</h2>
              <p className="text-gray-600">Dades essencials de l'empresa</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'Empresa *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.companyName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Empresa Col·laboradora SL"
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacte *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="contacte@empresa.cat"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CIF/NIF *
                </label>
                <input
                  type="text"
                  value={formData.cif}
                  onChange={(e) => setFormData(prev => ({ ...prev, cif: e.target.value.toUpperCase() }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cif ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="B12345678"
                />
                {errors.cif && (
                  <p className="text-sm text-red-600 mt-1">{errors.cif}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector *
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sector ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona un sector</option>
                  <option value="tecnologia">Tecnologia</option>
                  <option value="salut">Salut</option>
                  <option value="educacio">Educació</option>
                  <option value="construccio">Construcció</option>
                  <option value="alimentacio">Alimentació</option>
                  <option value="serveis">Serveis</option>
                  <option value="comerc">Comerç</option>
                  <option value="turisme">Turisme</option>
                  <option value="transport">Transport</option>
                  <option value="finances">Finances</option>
                  <option value="agricultura">Agricultura</option>
                  <option value="energia">Energia</option>
                  <option value="altres">Altres</option>
                </select>
                {errors.sector && (
                  <p className="text-sm text-red-600 mt-1">{errors.sector}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecció de Pla</h2>
              <p className="text-gray-600">Escull el pla de col·laboració</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Plans Disponibles
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePlans.map(plan => (
                  <div
                    key={plan.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.selectedPlan === plan.tier
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, selectedPlan: plan.tier }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{plan.name}</h4>
                      <span className="text-sm font-medium text-blue-600">
                        {plan.basePrice === 0 ? 'Gratis' : `${plan.basePrice}€/any`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Ofertes: {plan.maxActiveOffers === -1 ? 'Il·limitades' : plan.maxActiveOffers}
                    </p>
                    {plan.firstYearDiscount > 0 && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        -{Math.round(plan.firstYearDiscount * 100)}% 1r any
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {errors.selectedPlan && (
                <p className="text-sm text-red-600">{errors.selectedPlan}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisió Final</h2>
              <p className="text-gray-600">Revisa les dades abans de crear l'empresa</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Nom de l'Empresa</span>
                <p className="text-lg font-medium text-gray-900">{formData.companyName}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-lg font-medium text-gray-900">{formData.email}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">CIF/NIF</span>
                <p className="text-lg font-medium text-gray-900">{formData.cif}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Sector</span>
                <p className="text-lg font-medium text-gray-900 capitalize">{formData.sector}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Pla Seleccionat</span>
                <p className="text-lg font-medium text-gray-900">
                  {availablePlans.find(p => p.tier === formData.selectedPlan)?.name}
                </p>
              </div>
            </div>

            {formData.generatedPassword && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Contrasenya Generada</h4>
                </div>
                <div className="font-mono text-lg bg-white px-3 py-2 border rounded mb-2">
                  {formData.generatedPassword}
                </div>
                <p className="text-sm text-yellow-700">
                  Format: {formData.companyName.slice(0,3).toUpperCase()}DDMMYY{formData.selectedPlan.slice(-1).toUpperCase()}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nova Empresa</h1>
          <p className="text-gray-600">Assistent per crear empresa col·laboradora</p>
        </div>

        {/* Banner informatiu si ve d'un lead */}
        {leadData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-medium text-blue-900">
                  Creant empresa des del lead
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Les dades s'han pre-omplert automàticament des del lead "{leadData.companyName}".
                  Verifica i completa la informació abans de crear l'empresa.
                </p>
                {leadData.estimatedValue && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    💰 Valor estimat: {leadData.estimatedValue.toLocaleString('ca-ES')} €
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : step < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anterior
                </button>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel·lar
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Següent
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {isLoading ? 'Generant credencials...' : 'Generar contrasenya i listar empresa'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Carregant...</p>
      </div>
    </div>
  );
}

export default function CrearEmpresaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CrearEmpresaContent />
    </Suspense>
  );
}