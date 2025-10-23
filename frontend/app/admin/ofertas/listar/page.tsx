'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Offer {
  id: number;
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  discountPrice: number;
  discountPercentage: number;
  stock?: number;
  validUntil: string;
  status: string;
  imageUrl?: string;
  company: {
    name: string;
  };
  createdAt: string;
}

export default function ListarOfertasPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/offers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      } else {
        setError('Error al cargar las ofertas');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta oferta?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/offers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setOffers(offers.filter(o => o.id !== id));
      } else {
        alert('Error al eliminar la oferta');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  // Aplicar filtros y búsqueda
  let filteredOffers = offers;

  // Filtrar por estado
  if (filter !== 'ALL') {
    filteredOffers = filteredOffers.filter(o => o.status === filter);
  }

  // Filtrar por búsqueda
  if (searchTerm) {
    filteredOffers = filteredOffers.filter(o =>
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Calcular estadísticas
  const getStats = () => {
    const total = offers.length;
    const activas = offers.filter(o => o.status === 'PUBLISHED').length;
    const borradores = offers.filter(o => o.status === 'DRAFT').length;
    const caducadas = offers.filter(o => {
      const expireDate = new Date(o.validUntil);
      return expireDate < new Date() || o.status === 'EXPIRED';
    }).length;

    return { total, activas, borradores, caducadas };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando ofertas...</p>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🎁 Gestión de Ofertas VIP</h1>
          <p className="text-gray-600">Administra las ofertas y promociones de la plataforma</p>
        </div>
        <button
          onClick={() => router.push('/admin/ofertas/crear')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Crear Oferta
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total ofertas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.activas}</div>
          <div className="text-sm text-gray-600">Ofertas activas</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.borradores}</div>
          <div className="text-sm text-gray-600">Borradores</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.caducadas}</div>
          <div className="text-sm text-gray-600">Caducadas</div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Título, descripción o empresa..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('ALL');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrar por estado</h3>
          <div className="flex gap-2">
            {['ALL', 'PUBLISHED', 'DRAFT', 'EXPIRED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? '📋 Todas' :
                 status === 'PUBLISHED' ? '✅ Publicadas' :
                 status === 'DRAFT' ? '📝 Borradores' : '⏰ Caducadas'}
                <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                  {status === 'ALL' ? stats.total :
                   status === 'PUBLISHED' ? stats.activas :
                   status === 'DRAFT' ? stats.borradores : stats.caducadas}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-gray-600">
          Mostrando {filteredOffers.length} de {offers.length} ofertas
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No hay ofertas {filter !== 'ALL' ? 'en este estado' : 'creadas aún'}</p>
          </div>
        ) : (
          filteredOffers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {offer.imageUrl && (
                <div className="relative">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-3 py-1 bg-red-500 text-white font-bold rounded-full text-sm">
                      -{offer.discountPercentage}%
                    </span>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{offer.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ml-2 ${
                    offer.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                    offer.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {offer.status === 'PUBLISHED' ? 'Activa' :
                     offer.status === 'DRAFT' ? 'Borrador' : 'Caducada'}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-2">🏢 {offer.company.name}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-400 line-through">{offer.originalPrice}€</span>
                  <span className="text-xl font-bold text-blue-600">{offer.discountPrice}€</span>
                </div>

                {offer.stock !== null && (
                  <p className="text-xs text-gray-500 mb-2">
                    📦 Stock: {offer.stock} unidades
                  </p>
                )}

                <p className="text-xs text-gray-500 mb-3">
                  ⏰ Válida hasta: {new Date(offer.validUntil).toLocaleDateString('es-ES')}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {offer.category}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => router.push(`/admin/ofertas/editar/${offer.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}