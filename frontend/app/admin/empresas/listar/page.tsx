'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle, Activity, Clock } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { useEmpresas, Empresa } from '@/hooks/useEmpresas';


export default function ListarEmpresasPage() {
  const router = useRouter();
  const [filteredCompanies, setFilteredCompanies] = useState<Empresa[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Usar el hook para obtener empresas del backend
  const { data: companies = [], isLoading, error, refetch } = useEmpresas();

  useEffect(() => {
    let filtered = companies;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría/sector
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(company =>
        company.sector === selectedCategory
      );
    }

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(company => {
        if (selectedStatus === 'verified') {
          return company.isVerified;
        } else if (selectedStatus === 'pending') {
          return !company.isVerified;
        } else if (selectedStatus === 'active') {
          return company.isActive;
        } else if (selectedStatus === 'suspended') {
          return !company.isActive;
        }
        return true;
      });
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, selectedCategory, selectedStatus]);

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

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
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

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
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
    const verificadas = companies.filter(c => c.isVerified).length;
    const activas = companies.filter(c => c.isActive).length;
    const pendientes = companies.filter(c => !c.isVerified).length;

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
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, descripción o categoría..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los sectores</option>
              <option value="tecnologia">💻 Tecnología</option>
              <option value="salud">🏥 Salud</option>
              <option value="educacion">🎓 Educación</option>
              <option value="construccion">🏗️ Construcción</option>
              <option value="alimentacion">🍽️ Alimentación</option>
              <option value="servicios">🛠️ Servicios</option>
              <option value="comercio">🛒 Comercio</option>
              <option value="turismo">🏖️ Turismo</option>
              <option value="transporte">🚛 Transporte</option>
              <option value="finanzas">💰 Finanzas</option>
              <option value="agricultura">🌾 Agricultura</option>
              <option value="energia">⚡ Energía</option>
              <option value="otros">🏢 Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="verified">✅ Verificada</option>
              <option value="pending">⏳ Pendiente verificación</option>
              <option value="active">🟢 Activa</option>
              <option value="suspended">🔴 Suspendida</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error al cargar empresas: {(error as any)?.message || 'Error desconocido'}
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-12 h-12 object-contain rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                          {getCategoryIcon(company.sector)}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {company.name}
                          </h3>
                          {company.isVerified && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              ✓ Verificada
                            </span>
                          )}
                          {company.website && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              🌐 Web
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {company.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(company.sector)} {company.sector}
                          </span>
                          <span>📅 {new Date(company.createdAt).toLocaleDateString('es-ES')}</span>
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              🔗 Sitio web
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/admin/empresas/${company.id}`)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Ver
                    </button>
                    <Link
                      href={`/admin/empresas/editar/${company.id}`}
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