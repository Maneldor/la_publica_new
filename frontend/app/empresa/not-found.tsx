'use client'

import Link from 'next/link';
import { Home, Building2, ArrowLeft, BarChart3 } from 'lucide-react';

/**
 * Página 404 específica para el área de empresa
 */
export default function EmpresaNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8">
          {/* Icono */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-100 rounded-full">
              <Building2 className="w-12 h-12 text-indigo-600" />
            </div>
          </div>

          {/* Contenido */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Pàgina d'empresa no trobada
            </h2>
            <p className="text-gray-600">
              La pàgina que busques no existeix dins del teu panel d'empresa.
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <Link
              href="/empresa/dashboard"
              className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Dashboard Empresa
            </Link>

            <Link
              href="/empresa/ofertes"
              className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              Les Meves Ofertes
            </Link>
          </div>

          {/* Link volver */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Tornar enrere
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}