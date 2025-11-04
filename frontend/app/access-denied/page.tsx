'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function AccessDeniedPage() {
  const searchParams = useSearchParams();
  const attempted = searchParams.get('attempted');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <ShieldX className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>

          <p className="text-gray-600 mb-6">
            No tienes permisos suficientes para acceder a esta página.
          </p>

          {attempted && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Página solicitada:</span>
                <br />
                <code className="text-red-600">{attempted}</code>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Ir al Dashboard
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver Atrás
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            Si crees que esto es un error, contacta con el administrador del sistema.
          </div>
        </div>
      </div>
    </div>
  );
}