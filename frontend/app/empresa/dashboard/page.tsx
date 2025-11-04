'use client';

export default function EmpresaDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard d'Empresa</h1>
        <p className="text-gray-600 mt-2">Benvingut al teu espai de gestió</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vistes al perfil</p>
              <p className="text-3xl font-bold text-gray-900">1,234</p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Equip actiu</p>
              <p className="text-3xl font-bold text-gray-900">7/10</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agents IA</p>
              <p className="text-3xl font-bold text-gray-900">2/3</p>
            </div>
            <span className="text-4xl">🤖</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Missatges</p>
              <p className="text-3xl font-bold text-gray-900">15</p>
            </div>
            <span className="text-4xl">💬</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Activitat Recent</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">👥</span>
            <div>
              <p className="text-sm text-gray-900">Nou membre afegit a l'equip</p>
              <p className="text-xs text-gray-500">Fa 2 hores</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">🤖</span>
            <div>
              <p className="text-sm text-gray-900">Agent IA ha contactat 12 empreses</p>
              <p className="text-xs text-gray-500">Fa 4 hores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}