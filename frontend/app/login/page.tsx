'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

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
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirigir según rol del usuario
        const role = response.data.user.primaryRole;

        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
          router.push('/admin');
        } else if (role === 'EMPLEADO_PUBLICO') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Funciones de login rápido para desarrollo
  const quickLoginAdmin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: 'admin@lapublica.es',
        password: 'admin123456'
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push('/admin');
      }
    } catch (err: any) {
      setError('Error en login rápido de admin');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginEmpleado = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: 'empleado@lapublica.es',
        password: 'empleado123456'
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError('Error en login rápido de empleado');
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="admin@lapublica.es"
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
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="font-medium text-purple-800">🔐 Administrador</div>
              <div className="text-purple-600">Email: admin@lapublica.es</div>
              <div className="text-purple-600">Contraseña: admin123456</div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="font-medium text-green-800">👤 Empleado Público</div>
              <div className="text-green-600">Email: empleado@lapublica.es</div>
              <div className="text-green-600">Contraseña: empleado123456</div>
            </div>
          </div>
        </div>

        {/* Link a registro */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            No tens compte?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Registra't
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}