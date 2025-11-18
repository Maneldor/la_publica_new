import Link from 'next/link';
import { Home, Search, ArrowLeft, Mail, AlertCircle } from 'lucide-react';

/**
 * Página 404 personalizada para La Pública
 * Se muestra cuando una ruta no existe
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ilustración 404 */}
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Número 404 grande */}
            <h1 className="text-9xl font-bold text-gray-200 select-none">
              404
            </h1>

            {/* Icono superpuesto */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <AlertCircle className="w-24 h-24 text-gray-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Título y descripción */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pàgina no trobada
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Ho sentim, però la pàgina que busques no existeix o ha estat moguda.
          </p>
          <p className="text-gray-500">
            Verifica l'URL o torna a la pàgina principal.
          </p>
        </div>

        {/* Opciones de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Botón principal: Ir a inicio */}
          <Link
            href="/"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl group"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Anar a l'inici</span>
          </Link>

          {/* Botón secundario: Ver ofertas */}
          <Link
            href="/ofertes"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Veure ofertes</span>
          </Link>
        </div>

        {/* Enlaces adicionales */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <Link
            href="/dashboard"
            className="hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Tornar enrere
          </Link>

          <span className="text-gray-300">|</span>

          <Link
            href="/contacte"
            className="hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Contactar suport
          </Link>
        </div>

        {/* Footer con branding */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} <span className="font-semibold text-gray-700">La Pública</span> - Connectant empleats públics amb avantatges exclusius
          </p>
        </div>
      </div>
    </div>
  );
}