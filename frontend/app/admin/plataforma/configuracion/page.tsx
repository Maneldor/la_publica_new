'use client';

import { useState } from 'react';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState({
    siteName: 'La Pública',
    siteDescription: 'Red Social para Empleados Públicos',
    contactEmail: 'admin@lapublica.es',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    maxUploadSize: 5,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Aquí iría la lógica para guardar en el backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración de la Plataforma</h1>

      {saved && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✓ Configuración guardada exitosamente
        </div>
      )}

      <div className="space-y-6">
        {/* Información General */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Información General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Sitio
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={config.siteDescription}
                onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                value={config.contactEmail}
                onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Usuarios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Usuarios</h2>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.allowRegistrations}
                onChange={(e) => setConfig({ ...config, allowRegistrations: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Permitir nuevos registros</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.requireEmailVerification}
                onChange={(e) => setConfig({ ...config, requireEmailVerification: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Requerir verificación de email</span>
            </label>
          </div>
        </div>

        {/* Configuración de Archivos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Archivos</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño máximo de subida (MB)
            </label>
            <input
              type="number"
              value={config.maxUploadSize}
              onChange={(e) => setConfig({ ...config, maxUploadSize: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {/* Mantenimiento */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Modo Mantenimiento</h2>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.maintenanceMode}
              onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Activar modo mantenimiento (el sitio no estará disponible para usuarios)
            </span>
          </label>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}