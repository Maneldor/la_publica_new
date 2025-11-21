'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CompanyWizard from '@/components/company/CompanyWizard';
import { MinimalCompanyData, PlanTier } from '@/lib/auth/credentialGenerator';

interface AvailablePlan {
  tier: PlanTier;
  name: string;
  basePrice: number;
  firstYearDiscount: number;
  description: string;
  features: string[];
}

export default function CrearEmpresaPage() {
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>([]);

  // Cargar planes disponibles
  useEffect(() => {
    loadAvailablePlans();
  }, []);

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch('/api/plans');
      const data = await response.json();

      if (data.success) {
        const mappedPlans = (data.data || []).map((plan: any) => ({
          tier: plan.tier,
          name: plan.name,
          basePrice: plan.basePrice,
          firstYearDiscount: plan.firstYearDiscount || 0,
          description: `Pla ${plan.name} per a empreses col·laboradores`,
          features: plan.features ? Object.entries(plan.features)
            .filter(([_, enabled]) => enabled)
            .map(([feature, _]) => feature)
            .slice(0, 3) : []
        }));

        setAvailablePlans(mappedPlans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleSubmit = async (companyData: MinimalCompanyData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/admin/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies de sesión
        body: JSON.stringify(companyData),
      });

      const result = await response.json();

      if (result.success) {
        // Mostrar mensaje de éxito con información de las credenciales
        const successMessage = `
✅ Empresa creada exitosamente

📋 Información de la empresa:
• Nom: ${result.data.companyName}
• Email: ${result.data.userEmail}
• Username: ${result.data.username}
• Pla: ${result.data.plan.name}
• Estat: ${result.data.status}

📧 S'ha enviat un email amb les credencials d'accés a: ${result.data.userEmail}

La empresa podrà accedir amb aquestes credencials i completar el seu perfil.
        `;

        alert(successMessage);

        // Redirigir a la lista de empresas o usuarios
        router.push('/admin/usuarios/listar');
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('❌ Error de connexió creant l\'empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (!showWizard) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Crear Empresa Col·laboradora</h2>
          <p className="text-gray-600 mb-6">
            Utilitza l'assistent per crear una nova empresa amb accés a la plataforma
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Començar Assistent
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWizard && (
        <CompanyWizard
          mode="admin_create"
          userRole="ADMIN"
          onSubmit={handleSubmit}
          onClose={handleClose}
          availablePlans={availablePlans}
        />
      )}
    </>
  );
}