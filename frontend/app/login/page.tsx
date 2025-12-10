'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Crown, Settings, Users, FileText, Building, UserCheck, Eye } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const callbackUrl = searchParams.get('callbackUrl') || '/gestio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      if (result?.error) {
        setError('Credenciales incorrectas');
      } else {
        // Obtener la sesión para verificar el rol
        const session = await getSession();
        if (session?.user?.role) {
          router.push(callbackUrl);
        }
      }
    } catch (err: any) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string, password: string, userRole: string) => {
    console.log('🟡 QuickLogin clicked:', { email, password, userRole });
    setLoading(true);
    setError('');

    try {
      console.log('🟡 Calling signIn with credentials...');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      });

      console.log('🟡 SignIn result:', result);

      if (result?.error) {
        setError('Error en login rápido');
      } else {
        // Redirigir según el rol del usuario
        let redirectUrl = '/gestio'; // Por defecto para ADMIN/CRM

        switch (userRole) {
          case 'SUPER_ADMIN':
          case 'ADMIN':
            redirectUrl = '/admin';
            break;
          case 'ADMIN_GESTIO':
          case 'CRM_COMERCIAL':
          case 'CRM_CONTINGUT':
          case 'GESTOR_ESTANDARD':
          case 'GESTOR_ESTRATEGIC':
          case 'GESTOR_ENTERPRISE':
            redirectUrl = '/gestio';
            break;
          case 'COMPANY':
            redirectUrl = '/empresa';
            break;
          case 'USER':
            redirectUrl = '/dashboard';
            break;
          default:
            redirectUrl = '/admin';
            break;
        }

        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError('Error en login rápido');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginUsers = [
    // ============================================
    // 1. SUPER ADMIN
    // ============================================
    {
      email: 'super.admin@lapublica.cat',
      password: 'super123',
      role: 'SUPER_ADMIN',
      name: 'Manel',
      icon: Crown,
      color: 'from-red-500 to-pink-600',
      description: 'Propietat - Accés complet',
      badge: 'SA'
    },

    // ============================================
    // 2. ADMIN GESTIÓ
    // ============================================
    {
      email: 'gestio@lapublica.cat',
      password: 'admin123',
      role: 'ADMIN_GESTIO',
      name: 'Admin Gestió',
      icon: UserCheck,
      color: 'from-purple-500 to-blue-600',
      description: 'Acceso directo al dashboard de gestión',
      badge: 'GES'
    },

    // ============================================
    // 3. ADMIN
    // ============================================
    {
      email: 'admin@lapublica.cat',
      password: 'admin123',
      role: 'ADMIN',
      name: 'Administrador',
      icon: Settings,
      color: 'from-orange-500 to-red-600',
      description: 'Direcció - Gestió general',
      badge: 'ADM'
    },

    // ============================================
    // 4. GESTIÓ D'EMPRESES (CRM COMERCIAL)
    // ============================================
    {
      email: 'crm@gestio.com',
      password: 'crm123456',
      role: 'CRM_COMERCIAL',
      name: 'Gestió d\'Empreses',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      description: 'CRM Comercial - Dashboard Gestió',
      badge: 'CRM'
    },

    // ============================================
    // 5. GESTOR ESTÀNDARD
    // ============================================
    {
      email: 'g-estandar@lapublica.cat',
      password: 'gestor123',
      role: 'GESTOR_ESTANDARD',
      name: 'G-Estandar',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      description: 'Gestor d\'empreses estàndard',
      badge: 'GES'
    },

    // ============================================
    // 6. GESTOR ESTRATÈGIC
    // ============================================
    {
      email: 'g-strategic@lapublica.cat',
      password: 'gestor123',
      role: 'GESTOR_ESTRATEGIC',
      name: 'G-Estratègic',
      icon: Users,
      color: 'from-teal-500 to-cyan-600',
      description: 'Gestor d\'empreses estratègiques',
      badge: 'EST'
    },

    // ============================================
    // 7. GESTOR ENTERPRISE
    // ============================================
    {
      email: 'g-enterprise@lapublica.cat',
      password: 'gestor123',
      role: 'GESTOR_ENTERPRISE',
      name: 'G-Enterprise',
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      description: 'Gestor d\'empreses enterprise',
      badge: 'ENT'
    },

    // ============================================
    // 8. GESTOR PRINCIPAL EMPRESA
    // ============================================
    {
      email: 'joan.perez@empresadeprova.cat',
      password: 'owner123',
      role: 'COMPANY',
      name: 'Joan Pérez',
      icon: Building,
      color: 'from-green-500 to-emerald-600',
      description: 'Propietari Empresa de Prova',
      badge: 'EMP'
    },

    // ============================================
    // 9. EMPLEADO PÚBLICO
    // ============================================
    {
      email: 'laura.garcia@generalitat.cat',
      password: 'empleat123',
      role: 'USER',
      name: 'Laura García',
      icon: UserCheck,
      color: 'from-purple-500 to-indigo-600',
      description: 'Empleada Pública',
      badge: 'USR'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">La Pública</h1>
          <h2 className="text-xl text-gray-600">Sistema de Permisos Granulares</h2>
          <p className="text-sm text-gray-500 mt-2">NextAuth + RBAC Integration Test</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Formulario manual */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Login Manual</h3>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@lapublica.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold mb-6 text-center">Usuarios de Prueba</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLoginUsers.map((user, index) => {
                const IconComponent = user.icon;
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      console.log('🟡 Card clicked for user:', user.name);
                      quickLogin(user.email, user.password, user.role);
                    }}
                  >
                    <div className="relative mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${user.color} flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-sm">{user.badge}</span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-1">{user.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{user.description}</p>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-mono text-gray-700">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pass:</span>
                        <span className="font-mono text-gray-700">{user.password}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rol:</span>
                        <span className="font-semibold text-blue-600">{user.role}</span>
                      </div>
                    </div>

                    <button
                      className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                      disabled={loading}
                    >
                      {loading ? 'Cargando...' : 'Login Rápido'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OAuth options */}
          <div className="border-t mt-8 pt-8">
            <h3 className="text-lg font-semibold mb-4 text-center">OAuth Providers</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => signIn('google', { callbackUrl })}
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>

              <button
                onClick={() => signIn('github', { callbackUrl })}
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continuar con GitHub
              </button>
            </div>
          </div>

          {/* Info para testing */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Testing del Sistema</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Después del login, ve a <code className="bg-blue-100 px-1 rounded">/api/test-permissions?test=overview</code></li>
                  <li>• Prueba diferentes roles para ver los permisos</li>
                  <li>• El Community Manager solo ve su comunidad (Barcelona)</li>
                  <li>• Los Admins pueden ver todas las rutas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NextAuthLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 animate-pulse">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-80 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Formulario skeleton */}
            <div className="mb-8">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="md:col-span-2 mt-4">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Usuarios de prueba skeleton */}
            <div className="border-t pt-8">
              <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-6"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="space-y-1 mb-4">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* OAuth skeleton */}
            <div className="border-t mt-8 pt-8">
              <div className="h-6 bg-gray-200 rounded w-40 mx-auto mb-4"></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Info skeleton */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded mt-0.5"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}