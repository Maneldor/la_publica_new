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
    } catch (err) {
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
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const filteredOffers = filter === 'ALL' 
    ? offers 
    : offers.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando ofertas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ofertas VIP</h1>
        <button
          onClick={() => router.push('/admin/ofertas/crear')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Crear Oferta
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6 flex gap-2">
        {['ALL', 'PUBLISHED', 'DRAFT', 'EXPIRED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'Todas' : 
             status === 'PUBLISHED' ? 'Publicadas' :
             status === 'DRAFT' ? 'Borradores' : 'Caducadas'}
          </button>
        ))}
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