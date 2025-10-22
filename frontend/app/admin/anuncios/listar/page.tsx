'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  targetAudience: string;
  isPinned: boolean;
  expiresAt?: string;
  createdAt: string;
}

export default function ListarAnunciosPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (Array.isArray(data)) {
          setAnnouncements(data);
        } else if (data.data && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        } else {
          console.error('Los datos no son un array:', data);
          setAnnouncements([]);
        }
      } else {
        setError('Error al cargar los anuncios');
        setAnnouncements([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este anuncio?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAnnouncements(announcements.filter(a => a.id !== id));
      } else {
        alert('Error al eliminar el anuncio');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INFO': return 'ℹ️';
      case 'WARNING': return '⚠️';
      case 'URGENT': return '🚨';
      case 'NEWS': return '📰';
      case 'EVENT': return '📅';
      default: return 'ℹ️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'NEWS': return 'bg-green-100 text-green-800';
      case 'EVENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600';
      case 'NORMAL': return 'text-gray-600';
      case 'LOW': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando anuncios...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Anuncios</h1>
        <button
          onClick={() => router.push('/admin/anuncios/crear')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Crear Anuncio
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No hay anuncios creados aún
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {announcement.isPinned && <span className="text-xl">📌</span>}
                    <span className="text-2xl">{getTypeIcon(announcement.type)}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(announcement.priority)}`}>
                      Prioridad: {announcement.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{announcement.content}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>{announcement.targetAudience === 'ALL' ? 'Todos' : announcement.targetAudience}</span>
                    <span>{new Date(announcement.createdAt).toLocaleDateString('es-ES')}</span>
                    {announcement.expiresAt && (
                      <span>Expira: {new Date(announcement.expiresAt).toLocaleDateString('es-ES')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/admin/anuncios/editar/${announcement.id}`)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
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
  );
}