'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, User, Shield, Eye } from 'lucide-react';

interface PermissionsData {
  user: {
    id: string;
    email: string;
    role: string;
    communityId?: string;
    isActive: boolean;
  };
  access: {
    canAccessAdmin: boolean;
    totalPermissions: number;
    accessibleRoutes: number;
  };
  permissions: string[];
  timestamp: string;
}

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [permissionsData, setPermissionsData] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPermissions = async () => {
    if (!session) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/test-permissions?test=overview');
      if (response.ok) {
        const data = await response.json();
        setPermissionsData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar permisos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPermissions();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sin Autenticar</h1>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para probar el sistema de permisos.
          </p>
          <Link
            href="/login-nextauth"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <User className="w-4 h-4" />
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test de Integración NextAuth + Permisos
          </h1>
          <p className="text-gray-600">
            Verificación completa del sistema de autenticación y autorización
          </p>
        </div>

        {/* Estado de la sesión */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold">✅ Sesión NextAuth</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold text-green-600">Autenticado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-sm">{session.user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-mono text-sm">{session.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rol:</span>
                <span className="font-semibold text-blue-600">{session.user?.role}</span>
              </div>
              {session.user?.communityId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Comunidad:</span>
                  <span className="font-semibold text-purple-600">{session.user.communityId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Activo:</span>
                <span className={`font-semibold ${session.user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {session.user?.isActive ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold">🔐 Sistema de Permisos</h2>
              <button
                onClick={fetchPermissions}
                disabled={loading}
                className="ml-auto p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {permissionsData ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin Access:</span>
                  <span className={`font-semibold ${permissionsData.access.canAccessAdmin ? 'text-green-600' : 'text-red-600'}`}>
                    {permissionsData.access.canAccessAdmin ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Permisos:</span>
                  <span className="font-semibold text-blue-600">{permissionsData.access.totalPermissions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rutas Accesibles:</span>
                  <span className="font-semibold text-purple-600">{permissionsData.access.accessibleRoutes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última Verificación:</span>
                  <span className="text-sm text-gray-500">
                    {new Date(permissionsData.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ) : loading ? (
              <div className="text-center py-4">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Cargando permisos...</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-gray-600">Presiona el botón de actualizar para cargar permisos</p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de permisos */}
        {permissionsData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">📋 Permisos Asignados ({permissionsData.permissions.length})</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {permissionsData.permissions.map((permission, index) => (
                <div
                  key={index}
                  className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  ✅ {permission}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links de testing */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">🔗 Links de Testing</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/api/test-permissions?test=overview"
              target="_blank"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">Overview</div>
                <div className="text-sm text-gray-600">Resumen general</div>
              </div>
            </Link>

            <Link
              href="/api/test-permissions?test=permissions"
              target="_blank"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium">Permisos</div>
                <div className="text-sm text-gray-600">Matriz completa</div>
              </div>
            </Link>

            <Link
              href="/api/test-permissions?test=routes"
              target="_blank"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium">Rutas</div>
                <div className="text-sm text-gray-600">Rutas accesibles</div>
              </div>
            </Link>

            <Link
              href="/api/test-permissions?test=communities"
              target="_blank"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-medium">Comunidades</div>
                <div className="text-sm text-gray-600">Acceso por comunidad</div>
              </div>
            </Link>

            <Link
              href="/api/test-permissions?test=all-roles"
              target="_blank"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium">Todos los Roles</div>
                <div className="text-sm text-gray-600">Análisis completo</div>
              </div>
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <div className="font-medium">Panel Admin</div>
                <div className="text-sm text-gray-600">Acceso protegido</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/login-nextauth"
            className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <User className="w-4 h-4" />
            Cambiar Usuario
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar Test
          </button>
        </div>
      </div>
    </div>
  );
}