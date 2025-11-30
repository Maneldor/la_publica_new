'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, CreditCard, CheckCircle2, Key } from 'lucide-react';

export default function CrearEmpresaPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    selectedPlan: '',
    generatedPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAvailablePlans();
  }, []);

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
        selectedPlan: formData.selectedPlan,
        userData: {
          name: formData.companyName
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
          alert(`Empresa creada exitosament!\n\nCredencials generades:\n🏢 Empresa: ${formData.companyName}\n📧 Email: ${formData.email}\n🔑 Contrasenya: ${formData.generatedPassword}\n\nPodràs completar les dades addicionals des de la llista d'empreses.`);
          router.push('/admin/empresas/listar');
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