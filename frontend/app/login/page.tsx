'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales incorrectas');
      } else {
        console.log('🔐 Login exitoso, obteniendo sesión...');

        // Obtener sesión para determinar el rol del usuario
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        console.log('📝 Sesión después de login normal:', session);

        // Guardar el token JWT en localStorage para las APIs
        if (session?.user?.apiToken) {
          localStorage.setItem('token', session.user.apiToken);
          console.log('✅ Token JWT guardado en localStorage');
        } else {
          console.error('❌ NO HAY API TOKEN EN LA SESIÓN');
        }

        // Redirigir según el rol real del usuario
        if (session?.user?.role === 'COMPANY' || session?.user?.role === 'EMPRESA') {
          router.push('/empresa/dashboard');
        } else if (session?.user?.role === 'COMPANY_MANAGER' || session?.user?.role === 'GESTOR_EMPRESAS') {
          router.push('/gestor-empreses/dashboard');
        } else if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
          router.push('/admin');
        } else {
          // Fallback basado en el email si no hay sesión
          if (email.includes('@test.cat') || email.includes('empresa')) {
            router.push('/empresa/dashboard');
          } else if (email.includes('gestor')) {
            router.push('/gestor-empreses/dashboard');
          } else {
            router.push('/admin');
          }
        }
      }
    } catch (err: any) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de login rápido para desarrollo con NextAuth
  const quickLoginAdmin = async () => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'admin@lapublica.cat',
        password: 'admin123',
        redirect: false,
      });

      if (result?.error) {
        setError('Error en login rápido de admin');
      } else {
        console.log('🔐 Login exitoso, obteniendo sesión...');

        // Obtener sesión y guardar token
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        console.log('📝 Sesión completa:', session);
        console.log('📝 Usuario:', session?.user);
        console.log('📝 API Token presente:', !!session?.user?.apiToken);

        if (session?.user?.apiToken) {
          localStorage.setItem('token', session.user.apiToken);
          console.log('✅ Token JWT guardado en localStorage');
          console.log('🔑 Token:', session.user.apiToken.substring(0, 50) + '...');
        } else {
          console.error('❌ NO HAY API TOKEN EN LA SESIÓN');
          console.log('Datos de usuario disponibles:', Object.keys(session?.user || {}));
        }

        router.push('/admin');
      }
    } catch (err: any) {
      setError('Error en login rápido de admin');
    } finally {
      setLoading(false);
    }
  };


  const quickLoginGestor = async () => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'maria.garcia@lapublica.cat',
        password: 'gestora123',
        redirect: false,
      });

      if (result?.error) {
        setError('Error en login rápido de gestor');
      } else {
        // Obtener sesión y guardar token
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user?.apiToken) {
          localStorage.setItem('token', session.user.apiToken);
          console.log('✅ Token JWT guardado en localStorage (gestor)');
        }

        router.push('/gestor-empreses/dashboard'); // Redirigir a gestor
      }
    } catch (err: any) {
      setError('Error en login rápido de gestor');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginCRM = async () => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'contacte@lapublica.es',
        password: 'crm123',
        redirect: false,
      });

      if (result?.error) {
        setError('Error en login rápido de CRM');
      } else {
        router.push('/gestor-empreses/dashboard'); // Redirigir a gestor CRM
      }
    } catch (err: any) {
      setError('Error en login rápido de CRM');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginEmpresa = async () => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'joan.perez@empresadeprova.cat',
        password: 'owner123',
        redirect: false,
      });

      if (result?.error) {
        setError('Error en login rápido de empresa');
      } else {
        router.push('/empresa'); // Redirigir a empresa
      }
    } catch (err: any) {
      setError('Error en login rápido de empresa');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginMiembro = async () => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'anna.marti@empresadeprova.cat',
        password: 'member123',
        redirect: false,
      });

      if (result?.error) {
        setError('Error en login rápido de miembro');
      } else {
        router.push('/empresa'); // Redirigir a empresa
      }
    } catch (err: any) {
      setError('Error en login rápido de miembro');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginEmpleado = async () => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'laura.garcia@generalitat.cat',
        password: 'empleat123',
        redirect: false,
      });

      if (result?.error) {
        setError('Error en login rápido de empleado');
      } else {
        router.push('/dashboard'); // Redirigir a dashboard normal
      }
    } catch (err: any) {
      setError('Error en login rápido de empleado');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginSuperAdmin = async () => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: 'super.admin@lapublica.cat',
        password: 'superadmin123',
        redirect: false,
      });

      if (result?.error) {
        setError('Error en login rápido de super admin');
      } else {
        router.push('/admin'); // Redirigir a admin
      }
    } catch (err: any) {
      setError('Error en login rápido de super admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">La Pública</h1>
        <h2 className="text-xl text-gray-600 text-center mb-8">Iniciar Sesión</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar amb Google
          </button>

          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continuar amb GitHub
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">O continua amb email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="admin@lapublica.cat"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Usuarios de prueba */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 text-center mb-4">Usuarios de Prueba</p>

          <div className="space-y-3 text-sm">

            <div className="bg-red-50 p-3 rounded-lg border-2 border-red-200">
              <div className="font-medium text-red-800">👑 Super Administrador</div>
              <div className="text-red-600">Email: super.admin@lapublica.cat</div>
              <div className="text-red-600">Contraseña: superadmin123</div>
              <button
                onClick={quickLoginSuperAdmin}
                disabled={loading}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
              >
                Login Rápido
              </button>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium text-purple-800">👤 Administrador</div>
              <div className="text-purple-600">Email: admin@lapublica.cat</div>
              <div className="text-purple-600">Contraseña: admin123</div>
              <button
                onClick={quickLoginAdmin}
                disabled={loading}
                className="mt-2 px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
              >
                Login Rápido
              </button>
            </div>

            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="font-medium text-indigo-800">🤝 Gestor La Pública</div>
              <div className="text-indigo-600">Email: maria.garcia@lapublica.cat</div>
              <div className="text-indigo-600">Contraseña: gestora123</div>
              <button
                onClick={quickLoginGestor}
                disabled={loading}
                className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                Login Rápido
              </button>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg border-2 border-orange-200">
              <div className="font-medium text-orange-800">📊 Gestor CRM (con datos reales)</div>
              <div className="text-orange-600">Email: contacte@lapublica.es</div>
              <div className="text-orange-600">Contraseña: crm123</div>
              <button
                onClick={quickLoginCRM}
                disabled={loading}
                className="mt-2 px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50"
              >
                Login Rápido CRM
              </button>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-800">🏢 Gestor Principal Empresa</div>
              <div className="text-green-600">Email: joan.perez@empresadeprova.cat</div>
              <div className="text-green-600">Contraseña: owner123</div>
              <button
                onClick={quickLoginEmpresa}
                disabled={loading}
                className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
              >
                Login Rápido
              </button>
            </div>

            <div className="bg-teal-50 p-3 rounded-lg">
              <div className="font-medium text-teal-800">👥 Miembro Empresa</div>
              <div className="text-teal-600">Email: anna.marti@empresadeprova.cat</div>
              <div className="text-teal-600">Contraseña: member123</div>
              <button
                onClick={quickLoginMiembro}
                disabled={loading}
                className="mt-2 px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 disabled:opacity-50"
              >
                Login Rápido
              </button>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-800">👨‍💼 Empleado Público</div>
              <div className="text-blue-600">Email: laura.garcia@generalitat.cat</div>
              <div className="text-blue-600">Contraseña: empleat123</div>
              <button
                onClick={quickLoginEmpleado}
                disabled={loading}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Login Rápido
              </button>
            </div>
          </div>
        </div>

        {/* Link a registro */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            No tens compte?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Registra't
            </Link>
          </p>
          <div className="border-t border-gray-200 pt-3">
            <p className="text-sm text-gray-600">
              ¿Eres una empresa?{' '}
              <Link href="/registro-empresa" className="text-green-600 hover:underline font-medium">
                Registra tu empresa aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}