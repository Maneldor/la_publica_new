'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Building2,
  Info,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react';
import { createCompanySlug } from '@/lib/utils/slugs';
import ImageUploader from '@/components/ui/ImageUploader';

interface CompanyEditData {
  // Fase 1 - Dades bàsiques
  companyName: string;
  email: string;
  cif: string;
  sector: string;

  // Fase 2 - Informació
  description: string;
  phone: string;
  website: string;
  address: string;
  logo: string;

  // Fase 3 - Plan
  selectedPlan: string;

  // Datos existentes
  id: string;
  status: string;
  isActive: boolean;
  createdAt: string;
}

export default function EditarEmpresaPage() {
  const router = useRouter();
  const params = useParams();
  const companySlug = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<CompanyEditData>({
    companyName: '',
    email: '',
    cif: '',
    sector: '',
    description: '',
    phone: '',
    website: '',
    address: '',
    logo: '',
    selectedPlan: '',
    id: '',
    status: '',
    isActive: true,
    createdAt: ''
  });

  // Cargar datos de la empresa
  useEffect(() => {
    if (companySlug) {
      fetchCompanyData(companySlug);
    }
  }, [companySlug]);

  // Cargar planes disponibles
  useEffect(() => {
    loadAvailablePlans();
  }, []);

  const fetchCompanyData = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${slug}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const company = result.data;
          setFormData({
            companyName: company.name || '',
            email: company.email || '',
            cif: company.cif || '',
            sector: company.sector || '', // Cargar el sector desde la API
            description: company.description || '',
            phone: company.phone || '',
            website: company.website || '',
            address: company.address || '',
            logo: company.logo || '',
            selectedPlan: company.currentPlan?.tier || '',
            id: company.id,
            status: company.status,
            isActive: company.isActive,
            createdAt: company.createdAt
          });
        }
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setIsFetching(false);
    }
  };

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Dades bàsiques
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

      case 2: // Informació
        // Aquests camps són opcionals en edició
        break;

      case 3: // Plan
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
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/companies/${companySlug}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.companyName,
          email: formData.email,
          cif: formData.cif,
          description: formData.description,
          phone: formData.phone,
          website: formData.website,
          address: formData.address,
          logo: formData.logo,
          currentPlanTier: formData.selectedPlan
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Empresa actualitzada correctament!');
          router.push('/admin/empresas/listar');
        } else {
          alert(result.error || 'Error al actualitzar l\'empresa');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualitzar l\'empresa');
      }
    } catch (error) {
      alert('Error de connexió');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartialSave = async () => {
    setIsSaving(true);

    try {
      // Preparar datos para guardado parcial
      const updateData: any = {};

      // Siempre incluir datos básicos si están disponibles
      if (formData.companyName) updateData.name = formData.companyName;
      if (formData.email) updateData.email = formData.email;
      if (formData.cif) updateData.cif = formData.cif;

      // Datos de información adicional
      if (formData.description !== undefined) updateData.description = formData.description;
      if (formData.phone !== undefined) updateData.phone = formData.phone;
      if (formData.website !== undefined) updateData.website = formData.website;
      if (formData.address !== undefined) updateData.address = formData.address;
      if (formData.logo !== undefined) updateData.logo = formData.logo;
      if (formData.sector !== undefined) updateData.sector = formData.sector;

      // Plan si está seleccionado
      if (formData.selectedPlan) updateData.currentPlanTier = formData.selectedPlan;

      // Usar el slug de la URL en lugar del ID del formData
      const response = await fetch(`/api/admin/companies/${companySlug}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Canvis guardats correctament!');
        } else {
          alert(result.error || 'Error al guardar els canvis');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar els canvis');
      }
    } catch (error) {
      alert('Error de connexió');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Dades Bàsiques</h2>
              <p className="text-gray-600">Informació essencial de l'empresa</p>
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

            {/* Botón Guardar */}
            <div className="pt-4 border-t">
              <button
                onClick={handlePartialSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardant...' : 'Guardar'}
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Info className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Informació Addicional</h2>
              <p className="text-gray-600">Dades complementàries de l'empresa</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripció
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Breu descripció de l'empresa..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telèfon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+34 900 000 000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lloc Web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.empresa.cat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adreça
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Carrer Principal, 123, 08001 Barcelona"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo de l'Empresa
                </label>
                <ImageUploader
                  value={formData.logo}
                  onChange={(value) => setFormData(prev => ({ ...prev, logo: value }))}
                  placeholder="Arrossega el logo aquí o clica per seleccionar"
                />
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="pt-4 border-t">
              <button
                onClick={handlePartialSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardant...' : 'Guardar'}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pla de Col·laboració</h2>
              <p className="text-gray-600">Actualitza el pla de l'empresa</p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Plans Disponibles
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {plan.badge && (
                        <span
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{ backgroundColor: plan.badgeColor || '#6366f1' }}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {plan.basePrice === 0 ? 'Gratis' : `${plan.basePrice}€/any`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ofertes: {plan.maxActiveOffers === -1 ? 'Il·limitades' : plan.maxActiveOffers}
                    </p>
                    {plan.firstYearDiscount > 0 && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
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

            {/* Botón Guardar */}
            <div className="pt-4 border-t">
              <button
                onClick={handlePartialSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaving
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardant...' : 'Guardar'}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmació</h2>
              <p className="text-gray-600">Revisa els canvis abans de guardar</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <span className="text-sm font-medium text-gray-500">Estat</span>
                  <p className={`text-lg font-medium ${
                    formData.status === 'APPROVED' ? 'text-green-600' :
                    formData.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formData.status}
                  </p>
                </div>
              </div>

              {formData.description && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Descripció</span>
                  <p className="text-gray-900 mt-1">{formData.description}</p>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Els canvis s'aplicaran immediatament després de guardar.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregant dades de l'empresa...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Empresa</h1>
            <p className="text-gray-600">Actualitza les dades de {formData.companyName}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { num: 1, label: 'Dades Bàsiques' },
              { num: 2, label: 'Informació' },
              { num: 3, label: 'Plan' },
              { num: 4, label: 'Confirmació' }
            ].map((step) => (
              <div key={step.num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.num === currentStep
                    ? 'bg-blue-600 text-white'
                    : step.num < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.num < currentStep ? '✓' : step.num}
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    step.num <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {step.num < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step.num < currentStep ? 'bg-green-600' : 'bg-gray-300'
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

            <div>
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Següent
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                    isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? 'Guardant...' : 'Guardar Canvis'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}