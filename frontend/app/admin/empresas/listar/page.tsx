'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle, Activity, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import ExpandableFilters from '@/components/ui/ExpandableFilters';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';
import { createCompanySlug } from '@/lib/utils/slugs';


export default function ListarEmpresasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    estado: [],
    sector: [],
    plan: []
  });
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);

  // Usar el hook para obtener empresas del backend
  const { data: companies = [], isLoading, error, refetch } = useEmpresas();

  // Cargar planes disponibles al montar el componente
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAvailablePlans(result.data || []);
          }
        }
      } catch (error) {
        console.error('Error loading plans:', error);
      }
    };

    fetchPlans();
  }, []);

  // Detectar si viene de crear empresa y refrescar
  useEffect(() => {
    if (searchParams.get('refresh') === '1') {
      refetch();
      // Limpiar el parámetro de la URL sin recargar la página
      router.replace('/admin/empresas/listar');
    }
  }, [searchParams, refetch, router]);

  // Empresas filtradas usando useMemo para evitar loops infinitos
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((company: Empresa) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (selectedFilters.estado.length > 0) {
      filtered = filtered.filter((company: Empresa) => {
        return selectedFilters.estado.some(status => {
          switch (status) {
            case 'verified': return company.isVerified;
            case 'pending': return !company.isVerified && company.status === 'PENDING';
            case 'active': return company.isActive;
            case 'suspended': return !company.isActive || company.status === 'SUSPENDED';
            case 'approved': return company.status === 'APPROVED';
            default: return false;
          }
        });
      });
    }

    // Filtrar por sector
    if (selectedFilters.sector.length > 0) {
      filtered = filtered.filter((company: Empresa) =>
        selectedFilters.sector.includes(company.sector)
      );
    }

    // Filtrar por plan
    if (selectedFilters.plan.length > 0) {
      filtered = filtered.filter((company: Empresa) => {
        return selectedFilters.plan.some(planTier => {
          // Buscar si la empresa tiene un plan asignado que coincida
          return company.currentPlan?.tier === planTier ||
                 company.planTier === planTier ||
                 company.subscription?.planConfig?.tier === planTier;
        });
      });
    }

    return filtered;
  }, [companies, searchTerm, selectedFilters]);

  // Funciones para manejar filtros
  const handleFilterChange = (filterKey: string, value: string, checked: boolean) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: checked
        ? [...prev[filterKey], value]
        : prev[filterKey].filter(v => v !== value)
    }));
  };

  const handleClearFilters = () => {
    setSelectedFilters({
      estado: [],
      sector: [],
      plan: []
    });
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).flat().length + (searchTerm ? 1 : 0);
  };

  // Configuración de filtros (dinámica)
  const filterConfig = [
    {
      title: 'ESTADO',
      key: 'estado',
      type: 'checkbox' as const,
      options: [
        { value: 'pending', label: 'Pendiente', color: '#f59e0b' },
        { value: 'verified', label: 'Verificada', color: '#10b981' },
        { value: 'approved', label: 'Aprobada', color: '#3b82f6' },
        { value: 'suspended', label: 'Suspendida', color: '#ef4444' },
        { value: 'active', label: 'Activa', color: '#8b5cf6' }
      ]
    },
    {
      title: 'PLAN',
      key: 'plan',
      type: 'checkbox' as const,
      options: availablePlans.map(plan => ({
        value: plan.tier,
        label: plan.nombreCorto || plan.tier,
        color: plan.badgeColor || '#6366f1'
      }))
    },
    {
      title: 'SECTOR',
      key: 'sector',
      type: 'checkbox' as const,
      collapsible: true,
      initialCollapsed: true,
      maxVisibleOptions: 8,
      layout: 'quad',
      options: [
        { value: 'tecnologia', label: 'Tecnología', color: '#3b82f6' },
        { value: 'salud', label: 'Salud', color: '#ef4444' },
        { value: 'educacion', label: 'Educación', color: '#f59e0b' },
        { value: 'construccion', label: 'Construcción', color: '#f97316' },
        { value: 'alimentacion', label: 'Alimentación', color: '#84cc16' },
        { value: 'servicios', label: 'Servicios', color: '#8b5cf6' },
        { value: 'comercio', label: 'Comercio', color: '#06b6d4' },
        { value: 'turismo', label: 'Turismo', color: '#10b981' },
        { value: 'transporte', label: 'Transporte', color: '#6366f1' },
        { value: 'finanzas', label: 'Finanzas', color: '#eab308' },
        { value: 'agricultura', label: 'Agricultura', color: '#22c55e' },
        { value: 'energia', label: 'Energía', color: '#dc2626' },
        { value: 'otros', label: 'Otros', color: '#64748b' }
      ]
    }
  ];

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta empresa?')) return;

    try {
      const response = await fetch(`/api/admin/companies/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          refetch();
        } else {
          alert('Error al eliminar la empresa: ' + result.error);
        }
      } else {
        alert('Error al eliminar la empresa');
      }
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
      alert('Error de conexión');
    }
  };

  const handleToggleVerification = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${id}/toggle-verification`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          refetch();
        } else {
          alert('Error al cambiar el estado de verificación: ' + result.error);
        }
      } else {
        alert('Error al cambiar el estado de verificación');
      }
    } catch (error) {
      console.error('Error al cambiar verificación:', error);
      alert('Error de conexión');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${id}/toggle-active`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          refetch();
        } else {
          alert('Error al cambiar el estado activo: ' + result.error);
        }
      } else {
        alert('Error al cambiar el estado activo');
      }
    } catch (error) {
      console.error('Error al cambiar estado activo:', error);
      alert('Error de conexión');
    }
  };

  // Calcular estadísticas
  const getStats = () => {
    const total = companies.length;
    const verificadas = companies.filter((c: Empresa) => c.isVerified).length;
    const activas = companies.filter((c: Empresa) => c.isActive).length;
    const pendientes = companies.filter((c: Empresa) => !c.isVerified).length;

    return { total, verificadas, activas, pendientes };
  };

  const getCategoryIcon = (sector: string) => {
    const icons: Record<string, string> = {
      'tecnologia': '💻',
      'salud': '🏥',
      'educacion': '🎓',
      'construccion': '🏗️',
      'alimentacion': '🍽️',
      'servicios': '🛠️',
      'comercio': '🛒',
      'turismo': '🏖️',
      'transporte': '🚛',
      'finanzas': '💰',
      'agricultura': '🌾',
      'energia': '⚡',
      'otros': '🏢'
    };
    return icons[sector.toLowerCase()] || '🏢';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando empresas...</div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏢 Gestión de Empresas</h1>
          <p className="text-gray-600">Administra las empresas colaboradoras de la plataforma</p>
        </div>
        <Link
          href="/admin/empresas/crear"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Crear Empresa
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Empresas"
          value={stats.total}
          icon={<Building2 className="w-10 h-10" />}
          color="blue"
        />
        <StatCard
          title="Empresas Verificadas"
          value={stats.verificadas}
          icon={<CheckCircle className="w-10 h-10" />}
          color="green"
        />
        <StatCard
          title="Empresas Activas"
          value={stats.activas}
          icon={<Activity className="w-10 h-10" />}
          color="purple"
        />
        <StatCard
          title="Pendientes Verificación"
          value={stats.pendientes}
          icon={<Clock className="w-10 h-10" />}
          color="orange"
        />
      </div>

      {/* Filtros */}
      <ExpandableFilters
        title="Filtros"
        subtitle="Filtra empresas por estado, prioridad y tipo"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar empresas por nombre, descripción o sector..."
        filters={filterConfig}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearFilters}
        activeFiltersCount={getActiveFiltersCount()}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error al cargar empresas: {(error instanceof Error ? error.message : 'Error desconocido')}
        </div>
      )}

      {/* Lista de empresas */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Empresas ({filteredCompanies.length})
          </h2>
        </div>

        {filteredCompanies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {companies.length === 0
              ? "No hay empresas registradas aún"
              : "No hay empresas que coincidan con los filtros seleccionados."
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-8">
                      {/* Nombre Empresa */}
                      <h3 className="text-lg font-medium text-gray-900 min-w-[200px]">
                        {company.name}
                      </h3>

                      {/* Estado */}
                      <div className="min-w-[120px]">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          company.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : company.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : company.status === 'SUSPENDED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {company.status === 'PENDING' && 'Pendiente'}
                          {company.status === 'APPROVED' && 'Aprobada'}
                          {company.status === 'SUSPENDED' && 'Suspendida'}
                          {!['PENDING', 'APPROVED', 'SUSPENDED'].includes(company.status) && (company.status || 'Activa')}
                        </span>
                      </div>

                      {/* Plan */}
                      <div className="min-w-[120px]">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          company.currentPlan?.tier === 'PIONERES'
                            ? 'bg-purple-100 text-purple-800'
                            : company.currentPlan?.tier === 'STANDARD'
                            ? 'bg-blue-100 text-blue-800'
                            : company.currentPlan?.tier === 'STRATEGIC'
                            ? 'bg-indigo-100 text-indigo-800'
                            : company.currentPlan?.tier === 'ENTERPRISE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {company.currentPlan?.nombreCorto || company.currentPlan?.tier || 'Sin Plan'}
                        </span>
                      </div>

                      {/* Fecha */}
                      <span className="text-sm text-gray-500 min-w-[100px]">
                        {new Date(company.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/admin/empresas/${createCompanySlug(company.name)}`)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Ver
                    </button>
                    <Link
                      href={`/admin/empresas/editar/${createCompanySlug(company.name)}`}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleToggleVerification(company.id, company.isVerified)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        company.isVerified
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {company.isVerified ? 'Desverificar' : 'Verificar'}
                    </button>
                    <button
                      onClick={() => handleToggleActive(company.id, company.isActive)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        company.isActive
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {company.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}