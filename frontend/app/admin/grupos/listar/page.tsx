'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Group {
  id: number;
  name: string;
  description: string;
  category: string;
  visibility: string;
  imageUrl?: string;
  memberCount?: number;
  createdAt: string;
}

export default function ListarGruposPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (Array.isArray(data)) {
          setGroups(data);
        } else if (data.data && Array.isArray(data.data)) {
          setGroups(data.data);
        } else {
          console.error('Los datos no son un array:', data);
          setGroups([]);
        }
      } else {
        setError('Error al cargar los grupos');
        setGroups([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este grupo?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/groups/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGroups(groups.filter(g => g.id !== id));
      } else {
        alert('Error al eliminar el grupo');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando grupos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Grupos</h1>
        <button
          onClick={() => router.push('/admin/grupos/crear')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Crear Grupo
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No hay grupos creados aún</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {group.imageUrl && (
                <img
                  src={group.imageUrl}
                  alt={group.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    group.visibility === 'PUBLIC'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {group.description}
                </p>

                {group.category && (
                  <p className="text-xs text-gray-500 mb-3">
                    {group.category}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {group.memberCount || 0} miembros
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => router.push(`/admin/grupos/editar/${group.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
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