'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Forum {
  id: number;
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  allowAnonymous: boolean;
  topicsCount?: number;
  postsCount?: number;
  createdAt: string;
}

export default function ListarForosPage() {
  const router = useRouter();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/forums', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (Array.isArray(data)) {
          setForums(data);
        } else if (data.data && Array.isArray(data.data)) {
          setForums(data.data);
        } else {
          console.error('Los datos no son un array:', data);
          setForums([]);
        }
      } else {
        setError('Error al cargar los foros');
        setForums([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
      setForums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este foro? Se eliminarán todos sus temas y respuestas.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/forums/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setForums(forums.filter(f => f.id !== id));
      } else {
        alert('Error al eliminar el foro');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando foros...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Foros</h1>
        <button
          onClick={() => router.push('/admin/foros/crear')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Crear Foro
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {forums.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No hay foros creados aún
            </div>
          ) : (
            forums.map((forum) => (
              <div key={forum.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{forum.title}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                        {forum.category}
                      </span>
                      {forum.isPublic && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                          Público
                        </span>
                      )}
                      {forum.allowAnonymous && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                          Anónimo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{forum.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>{forum.topicsCount || 0} temas</span>
                      <span>{forum.postsCount || 0} respuestas</span>
                      <span>{new Date(forum.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/admin/foros/editar/${forum.id}`)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(forum.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}