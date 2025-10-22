'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    contenidos: 0,
    usuarios: 0,
    publicaciones: 0,
    traducciones: 0
  });

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setStats({
        contenidos: 12,
        usuarios: 45,
        publicaciones: 36,
        traducciones: 24
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const cards = [
    { title: 'Contenidos', value: stats.contenidos, icon: '📝', color: 'bg-blue-500' },
    { title: 'Usuarios', value: stats.usuarios, icon: '👥', color: 'bg-green-500' },
    { title: 'Publicaciones', value: stats.publicaciones, icon: '🌍', color: 'bg-purple-500' },
    { title: 'Traducciones', value: stats.traducciones, icon: '🔄', color: 'bg-orange-500' }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} text-white text-3xl w-16 h-16 rounded-lg flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/blog/crear"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-medium">Crear Post</div>
          </Link>

          <Link
            href="/admin/posts"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">💬</div>
            <div className="font-medium">Gestionar Posts</div>
          </Link>

          <Link
            href="/admin/moderacion-unificada"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🛡️</div>
            <div className="font-medium">Moderación Unificada</div>
            <div className="text-xs text-gray-500 mt-1">Gestionar todos los reportes</div>
          </Link>

          <Link
            href="/admin/moderacion"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">⚠️</div>
            <div className="font-medium">Moderación Blog</div>
            <div className="text-xs text-gray-500 mt-1">Solo reportes de blog</div>
          </Link>

          <Link
            href="/admin/grupos"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="font-medium">Gestionar Grupos</div>
          </Link>

          <Link
            href="/admin/foros"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">💭</div>
            <div className="font-medium">Gestionar Foros</div>
          </Link>

          <Link
            href="/admin/anuncios"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">📢</div>
            <div className="font-medium">Gestionar Anuncios</div>
          </Link>

          <Link
            href="/admin/empresas"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-colors text-center"
          >
            <div className="text-3xl mb-2">🏢</div>
            <div className="font-medium">Gestionar Empresas</div>
          </Link>
        </div>
      </div>
    </div>
  );
}