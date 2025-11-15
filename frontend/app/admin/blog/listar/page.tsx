'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, Clock, Calendar } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  createdAt: string;
  author: {
    name: string;
  };
}

export default function ListarBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filtrar posts cuando cambian los filtros
  useEffect(() => {
    let filtered = posts;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(post => {
        if (selectedStatus === 'published') {
          return post.status === 'PUBLISHED';
        } else if (selectedStatus === 'draft') {
          return post.status !== 'PUBLISHED';
        }
        return true;
      });
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedStatus]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/admin/content');

      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);

        if (Array.isArray(data)) {
          setPosts(data);
          setFilteredPosts(data);
        } else if (data.data && Array.isArray(data.data)) {
          setPosts(data.data);
          setFilteredPosts(data.data);
        } else {
          console.log('Respuesta de la API:', data);
          setPosts([]);
          setFilteredPosts([]);
          if (data.message || data.info) {
            setError(data.message || data.info);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar los posts');
        setPosts([]);
        setFilteredPosts([]);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión con el servidor');
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este post?')) return;

    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== id));
        setFilteredPosts(filteredPosts.filter(p => p.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al eliminar el post');
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error de conexión');
    }
  };

  // Calcular estadísticas
  const getStats = () => {
    const total = posts.length;
    const publicados = posts.filter(p => p.status === 'PUBLISHED').length;
    const borradores = posts.filter(p => p.status !== 'PUBLISHED').length;
    const hoy = posts.filter(p => {
      const postDate = new Date(p.createdAt).toDateString();
      const today = new Date().toDateString();
      return postDate === today;
    }).length;

    return { total, publicados, borradores, hoy };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Cargando posts...</p>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📝 Posts del Blog</h1>
          <p className="text-gray-600">Gestiona los artículos del blog de la plataforma</p>
        </div>
        <button
          onClick={() => router.push('/admin/blog/crear')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Crear Post
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Posts"
          value={stats.total}
          icon={<FileText className="w-10 h-10" />}
          color="blue"
        />
        <StatCard
          title="Posts Publicados"
          value={stats.publicados}
          icon={<CheckCircle className="w-10 h-10" />}
          color="green"
        />
        <StatCard
          title="Borradores"
          value={stats.borradores}
          icon={<Clock className="w-10 h-10" />}
          color="yellow"
        />
        <StatCard
          title="Creados Hoy"
          value={stats.hoy}
          icon={<Calendar className="w-10 h-10" />}
          color="purple"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Título o contenido..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="published">✅ Publicados</option>
              <option value="draft">📝 Borradores</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredPosts.length} de {posts.length} posts
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No hay posts creados aún
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500">{post.excerpt?.substring(0, 60)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.author?.name || 'Admin'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => router.push(`/admin/blog/editar/${post.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}