'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  ThumbsUp,
  Share2,
  Pin,
  AlertTriangle,
  Shield,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  ChevronDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  Flag,
  Trash2,
  Edit,
  ExternalLink,
  Camera
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

interface PostStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reports: number;
}

interface Post {
  id: number;
  type: 'text' | 'image' | 'poll';
  content: string;
  author: {
    id: number;
    name: string;
    avatar: string;
    role: string;
  };
  images?: string[];
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
  };
  isPinned: boolean;
  status: 'published' | 'scheduled' | 'draft' | 'reported' | 'hidden';
  audienceType: 'public' | 'members' | 'groups';
  tags: string[];
  stats: PostStats;
  createdAt: string;
  scheduledDate?: string;
  reports?: {
    count: number;
    reasons: string[];
  };
}

export default function ListarPostsSocialesPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    type: 'all',
    audience: 'all',
    dateRange: 'all',
    moderation: 'all'
  });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'reported'>('recent');

  // Mock data para desarrollo
  const mockPosts: Post[] = [
    {
      id: 1,
      type: 'text',
      content: 'Nova actualització del sistema de gestió de recursos humans. Tots els departaments han de revisar els nous protocols abans de divendres.',
      author: {
        id: 1,
        name: 'Maria García',
        avatar: 'MG',
        role: 'Admin'
      },
      isPinned: true,
      status: 'published',
      audienceType: 'public',
      tags: ['rrhh', 'important', 'protocols'],
      stats: {
        views: 1245,
        likes: 89,
        comments: 23,
        shares: 15,
        reports: 0
      },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'poll',
      content: 'Quina és la vostra opinió sobre el nou horari flexible?',
      author: {
        id: 2,
        name: 'Joan Martínez',
        avatar: 'JM',
        role: 'HR Manager'
      },
      poll: {
        question: 'Quina és la vostra opinió sobre el nou horari flexible?',
        options: [
          { text: 'Molt positiva', votes: 145 },
          { text: 'Positiva', votes: 89 },
          { text: 'Neutral', votes: 45 },
          { text: 'Negativa', votes: 12 }
        ],
        totalVotes: 291
      },
      isPinned: false,
      status: 'published',
      audienceType: 'members',
      tags: ['horari', 'enquesta'],
      stats: {
        views: 892,
        likes: 156,
        comments: 45,
        shares: 8,
        reports: 0
      },
      createdAt: '2024-01-14T14:20:00Z'
    },
    {
      id: 3,
      type: 'image',
      content: 'Fotos de la jornada de formació en ciberseguretat. Gràcies a tots els participants!',
      author: {
        id: 3,
        name: 'Anna Puig',
        avatar: 'AP',
        role: 'IT Admin'
      },
      images: ['image1.jpg', 'image2.jpg'],
      isPinned: false,
      status: 'reported',
      audienceType: 'public',
      tags: ['formació', 'ciberseguretat'],
      stats: {
        views: 567,
        likes: 234,
        comments: 67,
        shares: 23,
        reports: 3
      },
      reports: {
        count: 3,
        reasons: ['Contingut inapropiat', 'Spam']
      },
      createdAt: '2024-01-13T09:15:00Z'
    },
    {
      id: 4,
      type: 'text',
      content: 'Recordatori: Demà tanca el termini per sol·licitar els dies de vacances del primer trimestre.',
      author: {
        id: 1,
        name: 'Maria García',
        avatar: 'MG',
        role: 'Admin'
      },
      isPinned: false,
      status: 'scheduled',
      scheduledDate: '2024-01-20T08:00:00Z',
      audienceType: 'members',
      tags: ['vacances', 'recordatori'],
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        reports: 0
      },
      createdAt: '2024-01-10T16:45:00Z'
    }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
    } catch {
      setError('Error de connexió');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas globales
  const stats = {
    totalPosts: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    reported: posts.filter(p => p.status === 'reported').length,
    totalViews: posts.reduce((acc, p) => acc + p.stats.views, 0),
    totalEngagement: posts.reduce((acc, p) => acc + p.stats.likes + p.stats.comments + p.stats.shares, 0),
    avgEngagementRate: posts.length > 0
      ? ((posts.reduce((acc, p) => acc + p.stats.likes + p.stats.comments + p.stats.shares, 0) /
          posts.reduce((acc, p) => acc + p.stats.views, 0)) * 100).toFixed(1)
      : '0'
  };

  // Filtrar y ordenar posts
  const filteredPosts = posts.filter(post => {
    // Búsqueda por texto
    if (searchTerm && !post.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }

    // Filtro por estado
    if (selectedFilters.status !== 'all' && post.status !== selectedFilters.status) {
      return false;
    }

    // Filtro por tipo
    if (selectedFilters.type !== 'all' && post.type !== selectedFilters.type) {
      return false;
    }

    // Filtro por audiencia
    if (selectedFilters.audience !== 'all' && post.audienceType !== selectedFilters.audience) {
      return false;
    }

    // Filtro por moderación
    if (selectedFilters.moderation === 'reported' && post.status !== 'reported') {
      return false;
    }
    if (selectedFilters.moderation === 'clean' && post.status === 'reported') {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'popular') {
      return (b.stats.likes + b.stats.comments + b.stats.shares) -
             (a.stats.likes + a.stats.comments + a.stats.shares);
    } else if (sortBy === 'reported') {
      return (b.stats.reports || 0) - (a.stats.reports || 0);
    }
    return 0;
  });

  const handleModeratePost = async (postId: number, action: 'approve' | 'hide' | 'delete') => {
    if (action === 'delete' && !confirm('Estàs segur d\'eliminar aquesta publicació?')) return;

    try {
      // API call aquí
      console.log(`Moderating post ${postId} with action ${action}`);

      if (action === 'delete') {
        setPosts(posts.filter(p => p.id !== postId));
      } else {
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              status: action === 'approve' ? 'published' : 'hidden'
            };
          }
          return p;
        }));
      }
    } catch {
      alert('Error al moderar la publicació');
    }
  };

  const handleBulkAction = (action: 'delete' | 'hide' | 'pin') => {
    if (selectedPosts.length === 0) {
      alert('Selecciona almenys una publicació');
      return;
    }

    if (action === 'delete' && !confirm(`Estàs segur d'eliminar ${selectedPosts.length} publicacions?`)) {
      return;
    }

    // Implementar acción masiva
    console.log(`Bulk action ${action} on posts:`, selectedPosts);
    setSelectedPosts([]);
  };

  const togglePostSelection = (postId: number) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregant publicacions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestió de Publicacions Socials</h1>
          <p className="text-gray-600 mt-1">Modera i gestiona el contingut del feed social</p>
        </div>
        <button
          onClick={() => router.push('/admin/posts/crear')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          + Nova Publicació
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Publicacions"
          value={stats.totalPosts}
          subtitle={`${stats.published} publicades • ${stats.scheduled} programades`}
          icon={<BarChart3 className="w-10 h-10" />}
          color="blue"
        />

        <StatCard
          title="Visualitzacions"
          value={stats.totalViews}
          icon={<Eye className="w-10 h-10" />}
          color="green"
          trend={{
            value: "+12%",
            label: "últim mes",
            isPositive: true
          }}
        />

        <StatCard
          title="Engagement Total"
          value={stats.totalEngagement}
          subtitle={`Taxa: ${stats.avgEngagementRate}%`}
          icon={<TrendingUp className="w-10 h-10" />}
          color="purple"
        />

        <StatCard
          title="Requereixen Moderació"
          value={stats.reported}
          icon={<Shield className="w-10 h-10" />}
          color="red"
          badge="Acció immediata"
        />
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cercar per contingut, autor, etiquetes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex gap-2">
            <select
              value={selectedFilters.status}
              onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tots els estats</option>
              <option value="published">Publicades</option>
              <option value="scheduled">Programades</option>
              <option value="draft">Esborranys</option>
              <option value="reported">Reportades</option>
              <option value="hidden">Ocultes</option>
            </select>

            <select
              value={selectedFilters.type}
              onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tots els tipus</option>
              <option value="text">Text</option>
              <option value="image">Imatges</option>
              <option value="poll">Enquestes</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'reported')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Més recents</option>
              <option value="popular">Més populars</option>
              <option value="reported">Més reportades</option>
            </select>

            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Més filtres
            </button>
          </div>
        </div>

        {/* Filtros avanzados desplegables */}
        {showFilterDropdown && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audiència</label>
              <select
                value={selectedFilters.audience}
                onChange={(e) => setSelectedFilters({...selectedFilters, audience: e.target.value})}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
              >
                <option value="all">Totes</option>
                <option value="public">Públiques</option>
                <option value="members">Membres</option>
                <option value="groups">Grups</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Període</label>
              <select
                value={selectedFilters.dateRange}
                onChange={(e) => setSelectedFilters({...selectedFilters, dateRange: e.target.value})}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
              >
                <option value="all">Tot</option>
                <option value="today">Avui</option>
                <option value="week">Última setmana</option>
                <option value="month">Últim mes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moderació</label>
              <select
                value={selectedFilters.moderation}
                onChange={(e) => setSelectedFilters({...selectedFilters, moderation: e.target.value})}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
              >
                <option value="all">Totes</option>
                <option value="reported">Amb reports</option>
                <option value="clean">Sense reports</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedFilters({
                    status: 'all',
                    type: 'all',
                    audience: 'all',
                    dateRange: 'all',
                    moderation: 'all'
                  });
                  setSearchTerm('');
                }}
                className="w-full px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Netejar filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Acciones masivas */}
      {selectedPosts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-blue-800">
            {selectedPosts.length} publicacions seleccionades
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('pin')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Ancorar
            </button>
            <button
              onClick={() => handleBulkAction('hide')}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Ocultar
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Eliminar
            </button>
            <button
              onClick={() => setSelectedPosts([])}
              className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50"
            >
              Cancel·lar
            </button>
          </div>
        </div>
      )}

      {/* Lista de posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No s'han trobat publicacions amb els filtres seleccionats</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
              post.status === 'reported' ? 'border-2 border-red-200' : ''
            }`}>
              {/* Post header */}
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => togglePostSelection(post.id)}
                      className="mt-1 rounded"
                    />
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {post.author.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                        <span className="text-sm text-gray-500">• {post.author.role}</span>
                        {post.isPinned && (
                          <Pin className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('ca-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          post.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                          post.status === 'reported' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {post.status === 'published' ? 'Publicada' :
                           post.status === 'scheduled' ? `Programada: ${new Date(post.scheduledDate!).toLocaleDateString()}` :
                           post.status === 'draft' ? 'Esborrany' :
                           post.status === 'reported' ? 'Reportada' : 'Oculta'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.audienceType === 'public' ? '🌍 Públic' :
                           post.audienceType === 'members' ? '👥 Membres' : '👥 Grups'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Post content */}
              <div className="p-4">
                <p className="text-gray-800 mb-3">{post.content}</p>

                {/* Poll */}
                {post.type === 'poll' && post.poll && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <h4 className="font-medium text-gray-900 mb-3">{post.poll.question}</h4>
                    <div className="space-y-2">
                      {post.poll.options.map((option, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                                style={{ width: `${(option.votes / post.poll!.totalVotes) * 100}%` }}
                              />
                              <span className="absolute left-3 top-0 text-xs leading-6 text-gray-700 font-medium">
                                {option.text}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600 w-16 text-right">
                              {((option.votes / post.poll!.totalVotes) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{post.poll.totalVotes} vots totals</p>
                  </div>
                )}

                {/* Images */}
                {post.type === 'image' && post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {post.images.map((img, index) => (
                      <div key={index} className="bg-gray-200 rounded-lg h-32 flex items-center justify-center text-gray-500">
                        <Camera className="w-8 h-8" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reports warning */}
                {post.status === 'reported' && post.reports && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {post.reports.count} reports - Requereix moderació
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-red-600">
                      Raons: {post.reports.reasons.join(', ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Post stats */}
              <div className="px-4 py-3 border-t border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.stats.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {post.stats.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post.stats.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      {post.stats.shares}
                    </span>
                    {post.stats.reports > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <Flag className="w-4 h-4" />
                        {post.stats.reports}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Taxa d'engagement: {((post.stats.likes + post.stats.comments + post.stats.shares) / post.stats.views * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard`)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Veure al feed
                  </button>
                  <button
                    onClick={() => router.push(`/admin/posts/editar/${post.id}`)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>

                <div className="flex gap-2">
                  {post.status === 'reported' && (
                    <>
                      <button
                        onClick={() => handleModeratePost(post.id, 'approve')}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleModeratePost(post.id, 'hide')}
                        className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Ocultar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleModeratePost(post.id, 'delete')}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {filteredPosts.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Anterior
          </button>
          <div className="flex gap-1">
            <button className="px-3 py-2 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-2 hover:bg-gray-100 rounded">2</button>
            <button className="px-3 py-2 hover:bg-gray-100 rounded">3</button>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Següent
          </button>
        </div>
      )}
    </div>
  );
}