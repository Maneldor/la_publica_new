'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Key, Mail, Phone, Globe, MapPin, Building2, Calendar, Crown, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { createCompanySlug } from '@/lib/utils/slugs';

// Función para generar contraseña (misma lógica que en crear empresa)
const generatePassword = (companyName: string, planTier: string, createdAt: string) => {
  const date = new Date(createdAt);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);

  const companyPrefix = companyName.slice(0, 3).toUpperCase();
  const planSuffix = planTier.slice(-1).toUpperCase();

  return `${companyPrefix}${day}${month}${year}${planSuffix}`;
};

interface CompanyDetails {
  id: string;
  name: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  cif?: string;
  logo?: string;
  isActive: boolean;
  status: string;
  currentPlan?: {
    id: string;
    name: string;
    tier: string;
    badge?: string;
    badgeColor?: string;
  };
  owner?: {
    id: string;
    email: string;
    name?: string;
    password?: string; // Solo para mostrar al admin
  };
  subscription?: {
    status: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export default function VerEmpresaPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCompanyDetails(params.id as string);
    }
  }, [params.id]);

  const fetchCompanyDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCompany(result.data);
        } else {
          setError(result.error || 'Error al cargar los datos de la empresa');
        }
      } else {
        try {
          const errorData = await response.json();
          if (response.status === 404) {
            setError('Empresa no encontrada');
          } else if (response.status === 403) {
            setError('No tienes permisos para ver esta empresa');
          } else {
            setError(errorData.error || 'Error al cargar los datos de la empresa');
          }
        } catch (jsonError) {
          setError(`Error ${response.status}: ${response.statusText}`);
        }
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'APPROVED': 'bg-green-100 text-green-800 border-green-200',
      'SUSPENDED': 'bg-red-100 text-red-800 border-red-200'
    };

    const icons = {
      'PENDING': <Clock className="w-4 h-4" />,
      'APPROVED': <CheckCircle className="w-4 h-4" />,
      'SUSPENDED': <AlertTriangle className="w-4 h-4" />
    };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {icons[status as keyof typeof icons]}
        <span className="font-medium">
          {status === 'PENDING' && 'Pendiente'}
          {status === 'APPROVED' && 'Aprobada'}
          {status === 'SUSPENDED' && 'Suspendida'}
          {!['PENDING', 'APPROVED', 'SUSPENDED'].includes(status) && status}
        </span>
      </div>
    );
  };

  const getPlanBadge = (plan: any) => {
    if (!plan) return null;

    const styles = {
      'PIONERES': 'bg-purple-100 text-purple-800 border-purple-200',
      'STANDARD': 'bg-blue-100 text-blue-800 border-blue-200',
      'STRATEGIC': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'ENTERPRISE': 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${styles[plan.tier as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {plan.tier === 'ENTERPRISE' && <Crown className="w-4 h-4" />}
        <span className="font-medium">{plan.name || plan.tier}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando datos de la empresa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
        Empresa no encontrada
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Detalles de Empresa</h1>
          <p className="text-gray-600">Información completa de la empresa</p>
        </div>

        <Link
          href={`/admin/empresas/editar/${createCompanySlug(company.name)}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Información básica */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Información Básica</h2>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Logo o icono */}
            <div className="flex-shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>

            {/* Información principal */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h3>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(company.status)}
                    {getPlanBadge(company.currentPlan)}
                  </div>
                </div>
              </div>

              {/* Para empresas PENDIENTE, mostrar solo información básica */}
              {company.status === 'PENDING' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Esta empresa está pendiente de completar su información.
                  </p>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{company.email}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      Registrada: {new Date(company.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Descripción si existe */}
                  {company.description && (
                    <p className="text-gray-600 mb-4">{company.description}</p>
                  )}

                  {/* Grid de información completa */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{company.email}</span>
                      </div>

                      {company.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{company.phone}</span>
                        </div>
                      )}

                      {company.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-gray-400" />
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {company.website}
                          </a>
                        </div>
                      )}

                      {company.address && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{company.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">
                          Registrada: {new Date(company.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      {company.cif && (
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">CIF: {company.cif}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-400" />
                        <span className={`${company.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {company.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credenciales de acceso (solo para admin y empresas con credenciales generadas) */}
      {company.status === 'PENDING' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="px-6 py-4 border-b border-yellow-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-600" />
              Credenciales de Acceso
            </h2>
            <p className="text-sm text-yellow-700 mt-1">Información confidencial solo visible para administradores</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Email de acceso</label>
                <div className="mt-1 p-3 bg-white border border-yellow-200 rounded-lg">
                  <span className="text-gray-900 font-mono text-sm">{company.email}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Contraseña generada</label>
                <div className="mt-1 p-3 bg-white border border-yellow-200 rounded-lg">
                  <span className="text-gray-900 font-mono text-sm">
                    {generatePassword(company.name, company.currentPlan?.tier || 'STANDARD', company.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Empresa pendiente:</strong> Estas credenciales se han generado automáticamente.
                La empresa puede usar este email y contraseña para acceder y completar su información.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información de suscripción */}
      {company.subscription && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Información de Suscripción</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <div className="mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    company.subscription.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {company.subscription.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Fecha de inicio</label>
                <div className="mt-1 text-gray-900">
                  {new Date(company.subscription.startDate).toLocaleDateString('es-ES')}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Fecha de fin</label>
                <div className="mt-1 text-gray-900">
                  {new Date(company.subscription.endDate).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}