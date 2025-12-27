'use client'

import Link from 'next/link';
import { Home, Shield, ArrowLeft, Settings } from 'lucide-react';

/**
 * Página 404 específica para el área de administración
 */
export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Card principal */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8">
          {/* Icono de admin */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <Shield className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Contenido */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Pàgina d'administració no trobada
            </h2>
            <p className="text-gray-600">
              La pàgina que busques no existeix dins del panel d'administració.
            </p>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <Link
              href="/admin"
              className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              Dashboard Admin
            </Link>

            <Link
              href="/admin/logs"
              className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Logs d'Auditoria
            </Link>
          </div>

          {/* Link volver */}
          <div className="mt-6 text-center">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Tornar a la pàgina anterior
            </button>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Si creus que això és un error, contacta amb el suport tècnic.
        </div>
      </div>
    </div>
  );
}