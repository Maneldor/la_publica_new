'use client'

export default function TestScrollPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Prueba de Scroll - Sidebar Fijo</h1>
      
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sección 1 - Funcionalidad Sticky</h2>
          <p className="text-gray-700 leading-relaxed">
            Esta página es para probar que el sidebar permanece fijo mientras haces scroll en el contenido principal.
            El sidebar debería permanecer visible en todo momento, tanto el logo como el menú de navegación.
          </p>
        </div>

        {/* Generar contenido largo para forzar scroll */}
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Sección {i + 2} - Contenido de prueba</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut 
              labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt 
              mollit anim id est laborum.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Funcionalidad Implementada</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Sidebar sticky con position: sticky</li>
                  <li>• Header fijo en la parte superior</li>
                  <li>• Contenido principal con scroll independiente</li>
                  <li>• Layout responsive y fluido</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Beneficios</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Navegación siempre accesible</li>
                  <li>• Mejor experiencia de usuario</li>
                  <li>• No hay saltos visuales</li>
                  <li>• Mantiene el flujo del documento</li>
                </ul>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🎉 Final de la página</h2>
          <p className="leading-relaxed">
            Si llegaste hasta aquí haciendo scroll y el sidebar siguió visible en todo momento, 
            ¡la funcionalidad sticky está funcionando correctamente!
          </p>
          <div className="mt-4 p-4 bg-white/20 rounded-lg">
            <h3 className="font-semibold mb-2">Verificaciones completadas:</h3>
            <ul className="space-y-1 text-sm">
              <li>✅ Sidebar permanece fijo durante el scroll</li>
              <li>✅ Header permanece visible en la parte superior</li>
              <li>✅ Contenido principal hace scroll independientemente</li>
              <li>✅ No hay interferencias entre elementos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}