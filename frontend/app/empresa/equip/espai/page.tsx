'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight, Send, Heart, MessageCircle, Share2, Paperclip, Upload, Smile,
  MessageSquare, FileText, CheckSquare, Calendar, Video, Users, Download, X
} from 'lucide-react';

export default function EspaiTreballPage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Mock data del equipo
  const teamInfo = {
    name: 'Equip MAPFRE',
    empresaName: 'MAPFRE Seguros',
    totalMembers: 3,
    onlineMembers: 2,
  };

  // Miembros online/offline con simulación de cambios de estado
  const [members, setMembers] = useState([
    {
      id: '1',
      name: 'Joan Pérez',
      avatar: 'J',
      isOnline: true,
      role: 'GESTOR',
      cargo: 'Director de RRHH',
      lastSeen: new Date(),
    },
    {
      id: '2',
      name: 'Anna Martí',
      avatar: 'A',
      isOnline: true,
      role: 'MEMBRE',
      cargo: 'Responsable Comercial',
      lastSeen: new Date(),
    },
    {
      id: '3',
      name: 'Pere Soler',
      avatar: 'P',
      isOnline: false,
      role: 'MEMBRE',
      cargo: 'Analista de Marketing',
      lastSeen: new Date(Date.now() - 3600000), // 1h ago
    },
  ]);

  // Simular cambios de estado online/offline
  useEffect(() => {
    const interval = setInterval(() => {
      setMembers(prev => prev.map(member => ({
        ...member,
        isOnline: Math.random() > 0.3, // 70% probabilidad de estar online
        lastSeen: member.isOnline ? new Date() : member.lastSeen,
      })));
    }, 10000); // Cambiar cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const onlineMembers = members.filter(m => m.isOnline);
  const offlineMembers = members.filter(m => !m.isOnline);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/empresa/dashboard" className="hover:text-blue-600 transition">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/empresa/equip" className="hover:text-blue-600 transition">
              Equip
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Espai de Treball</span>
          </div>

          {/* Título y acciones */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <span>Espai de Treball Col·laboratiu</span>
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <span className="font-medium">{teamInfo.empresaName}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>{onlineMembers.length}/{teamInfo.totalMembers} membres en línia</span>
                </span>
              </p>
            </div>

            <Link
              href="/empresa/equip"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition flex items-center gap-2"
            >
              <span>←</span>
              <span>Gestionar Membres</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 border-t pt-3 overflow-x-auto">
            {[
              { id: 'feed', label: 'Feed', icon: MessageSquare, count: 3 },
              { id: 'documents', label: 'Documents', icon: FileText, count: 12 },
              { id: 'tasques', label: 'Tasques', icon: CheckSquare, count: 8 },
              { id: 'calendari', label: 'Calendari', icon: Calendar, count: 5 },
              { id: 'reunions', label: 'Reunions', icon: Video, count: 2 },
            ].map(tab => {
              const Icon = tab.icon;
              return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 border-b-2 transition font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            {activeTab === 'feed' && (
          <FeedTab
            members={members}
            onSharePost={(post) => {
              setSelectedPost(post);
              setShowShareModal(true);
            }}
          />
        )}
            {activeTab === 'documents' && <DocumentsTab />}
            {activeTab === 'tasques' && <TasksTab />}
            {activeTab === 'calendari' && <CalendarTab />}
            {activeTab === 'reunions' && <MeetingsTab />}
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg border p-4 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Membres en línia ({onlineMembers.length})</span>
              </h3>
              <div className="space-y-3 mb-6">
                {onlineMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                        {member.avatar}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">{member.cargo}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowMessageModal(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition"
                      title="Enviar missatge"
                    >
                      💬
                    </button>
                  </div>
                ))}
              </div>

              {offlineMembers.length > 0 && (
                <>
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-500">
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span>Fora de línia ({offlineMembers.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {offlineMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3 opacity-60">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-500">
                            {member.avatar}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{member.name}</p>
                          <p className="text-xs text-gray-500 truncate">Vist fa {getTimeAgo(member.lastSeen)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Estado del equipo */}
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-xs font-semibold text-gray-500 mb-2">
                  ACTIVITAT AVUI
                </h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Publicacions</span>
                    <span className="font-semibold text-blue-600">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Documents</span>
                    <span className="font-semibold text-green-600">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tasques completades</span>
                    <span className="font-semibold text-purple-600">5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para enviar mensaje */}
      {showMessageModal && selectedMember && (
        <MessageModal
          member={selectedMember}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {/* Modal para crear reunión */}
      <CreateMeetingModal
        isOpen={showCreateMeeting}
        onClose={() => setShowCreateMeeting(false)}
      />

      {/* Modal para compartir post */}
      <SharePostModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        teamMembers={members}
      />
    </div>
  );
}

// Helper function
function getTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) return 'ara mateix';
  if (diffMinutes < 60) return `${diffMinutes} min`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)} dies`;
}

// ═══════════════════════════════════════════════════════════
// TAB: FEED (funcionalidad completa)
// ═══════════════════════════════════════════════════════════

interface FeedTabProps {
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    role: string;
    cargo: string;
    lastSeen: Date;
  }>;
  onSharePost: (post: any) => void;
}

function FeedTab({ members, onSharePost }: FeedTabProps) {
  const [newPost, setNewPost] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<{[key: string]: any[]}>({
    '1': [
      { id: '1', author: 'Anna Martí', avatar: 'A', content: 'Perfecte! Ja ho tinc anotat.', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
      { id: '2', author: 'Pere Soler', avatar: 'P', content: 'Gràcies per la informació!', timestamp: new Date(Date.now() - 15 * 60 * 1000) }
    ]
  });
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: 'Joan Pérez',
      authorAvatar: 'J',
      role: 'GESTOR',
      content: 'Bon dia equip. Avui tenim reunió a les 15h per revisar les noves ofertes. Prepareu les vostres propostes.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 3,
      comments: 2,
      isLiked: false,
    },
    {
      id: '2',
      author: 'Anna Martí',
      authorAvatar: 'A',
      role: 'MEMBRE',
      content: 'He actualitzat l\'oferta d\'Administratiu amb experiència en Excel. Us agrairia que la revisessiu abans de demà.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      likes: 5,
      comments: 1,
      isLiked: true,
    },
    {
      id: '3',
      author: 'Pere Soler',
      authorAvatar: 'P',
      role: 'MEMBRE',
      content: 'Adjunto l\'informe d\'estadístiques del mes passat. Reviseu la secció de rendiment de candidats.',
      hasAttachment: true,
      attachmentName: 'Informe_Octubre_2024.pdf',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      likes: 8,
      comments: 3,
      isLiked: false,
    },
  ]);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Fa menys d\'1h';
    if (diffHours < 24) return `Fa ${diffHours}h`;
    if (diffDays === 1) return 'Ahir';
    if (diffDays < 7) return `Fa ${diffDays} dies`;
    return date.toLocaleDateString('ca');
  };

  const handleSubmitPost = () => {
    if (!newPost.trim()) return;

    const newPostObj = {
      id: Date.now().toString(),
      author: 'Joan Pérez', // Usuario actual
      authorAvatar: 'J',
      role: 'GESTOR',
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false,
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string) => {
    const comment = newComment[postId];
    if (!comment?.trim()) return;

    const newCommentObj = {
      id: Date.now().toString(),
      author: 'Joan Pérez', // Usuario actual
      avatar: 'J',
      content: comment,
      timestamp: new Date()
    };

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj]
    }));

    // Actualizar contador de comentarios en el post
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: post.comments + 1 };
      }
      return post;
    }));

    // Limpiar el input
    setNewComment(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Crear post */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0">
            J
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Què vols compartir amb l'equip?"
              className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewPost(prev => prev + ` [Imatge: ${file.name}]`);
                      }
                    };
                    input.click();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-1 text-gray-600"
                  title="Afegir imatge"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,.doc,.docx,.txt';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        setNewPost(prev => prev + ` [Document: ${file.name}]`);
                      }
                    };
                    input.click();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-1 text-gray-600"
                  title="Adjuntar document"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const emojis = ['😊', '👍', '❤️', '🎉', '💪', '🔥', '✅', '📝'];
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    setNewPost(prev => prev + randomEmoji);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-1 text-gray-600"
                  title="Afegir emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleSubmitPost}
                disabled={!newPost.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600 flex-shrink-0">
              {post.authorAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-semibold text-gray-900">{post.author}</span>
                {post.role === 'GESTOR' && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                    Gestor
                  </span>
                )}
                <span className="text-sm text-gray-500">·</span>
                <span className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</span>
              </div>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
              <div className="flex gap-6 text-sm">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-1 transition ${
                    post.isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments} comentaris</span>
                </button>
                <button
                  onClick={() => onSharePost(post)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
              </div>

              {/* Sección de comentarios */}
              {showComments === post.id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-3">
                    {(comments[post.id] || []).map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 text-sm">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                          comment.avatar === 'A' ? 'bg-green-100 text-green-600' :
                          comment.avatar === 'P' ? 'bg-purple-100 text-purple-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {comment.avatar}
                        </div>
                        <div className="flex-1">
                          <p><span className="font-medium">{comment.author}</span> {comment.content}</p>
                          <span className="text-xs text-gray-500">{getTimeAgo(comment.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Escriu un comentari..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TABS PLACEHOLDERS MEJORADOS
// ═══════════════════════════════════════════════════════════

function DocumentsTab() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Documents Recents</h3>
          <button
            onClick={handleFileUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Pujant...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Pujar Document
              </div>
            )}
          </button>
        </div>

        {isUploading && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Pujant document.pdf...</span>
              <span className="text-sm text-blue-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {[
            { name: 'Contracte_Anna_Marti.pdf', size: '245 KB', date: '2 hores', author: 'Joan Pérez' },
            { name: 'Oferta_Administratiu.docx', size: '180 KB', date: '1 dia', author: 'Anna Martí' },
            { name: 'Estadistiques_Q4.xlsx', size: '892 KB', date: '3 dies', author: 'Pere Soler' },
          ].map((doc, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
              <FileText className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{doc.name}</p>
                <p className="text-sm text-gray-500">{doc.size} · {doc.author} · fa {doc.date}</p>
              </div>
              <button
                onClick={() => {
                  // Simular descarga
                  const blob = new Blob(['Contingut del document simulat'], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = doc.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Descarregar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="max-w-md mx-auto">
          <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Organització Avançada</h3>
          <p className="text-gray-600 mb-6">
            Crea carpetes, estableix permisos i col·labora en temps real amb el control de versions.
          </p>
          <button
            onClick={() => window.open('https://docs.lapublica.cat/documents', '_blank')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Veure documentació
          </button>
        </div>
      </div>
    </div>
  );
}

function TasksTab() {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Revisar CV candidats', status: 'todo', assignee: 'Anna Martí', priority: 'high' },
    { id: '2', title: 'Actualitzar ofertes web', status: 'in-progress', assignee: 'Pere Soler', priority: 'medium' },
    { id: '3', title: 'Reunió equip setmanal', status: 'done', assignee: 'Joan Pérez', priority: 'low' },
  ]);

  const moveTask = (taskId: string, newStatus: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const statusColumns = [
    { id: 'todo', title: 'Per fer', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'En curs', color: 'bg-blue-100' },
    { id: 'done', title: 'Fet', color: 'bg-green-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tauler Kanban</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusColumns.map(column => (
            <div key={column.id} className={`${column.color} rounded-lg p-4`}>
              <h4 className="font-medium text-gray-900 mb-3">{column.title}</h4>
              <div className="space-y-3">
                {tasks.filter(task => task.status === column.id).map(task => (
                  <div key={task.id} className="bg-white p-3 rounded-lg shadow-sm border">
                    <p className="font-medium text-sm mb-2">{task.title}</p>
                    <p className="text-xs text-gray-600 mb-2">{task.assignee}</p>
                    <div className="flex gap-2">
                      {column.id !== 'todo' && (
                        <button
                          onClick={() => moveTask(task.id, 'todo')}
                          className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition"
                        >
                          ← Per fer
                        </button>
                      )}
                      {column.id !== 'in-progress' && (
                        <button
                          onClick={() => moveTask(task.id, 'in-progress')}
                          className="text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200 transition"
                        >
                          En curs
                        </button>
                      )}
                      {column.id !== 'done' && (
                        <button
                          onClick={() => moveTask(task.id, 'done')}
                          className="text-xs px-2 py-1 bg-green-100 rounded hover:bg-green-200 transition"
                        >
                          Fet ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="max-w-md mx-auto">
          <CheckSquare className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Gestió Avançada</h3>
          <p className="text-gray-600 mb-6">
            Crea projectes, estableix deadlines, assigna responsables i fes seguiment del progrés.
          </p>
          <button
            onClick={() => window.open('https://docs.lapublica.cat/documents', '_blank')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Veure documentació
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarTab() {
  const [events] = useState([
    { id: '1', title: 'Reunió equip', date: '2024-11-05', time: '15:00', attendees: 3 },
    { id: '2', title: 'Entrevista candidat', date: '2024-11-06', time: '10:30', attendees: 2 },
    { id: '3', title: 'Revisió ofertes', date: '2024-11-07', time: '09:00', attendees: 2 },
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Esdeveniments Propers</h3>
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-500">{event.date} · {event.time} · {event.attendees} assistents</p>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Vols unir-te a "${event.title}"?`)) {
                    alert(`T'has unit a "${event.title}". Rebràs una notificació abans de l'esdeveniment.`);
                  }
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Unir-se
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="max-w-md mx-auto">
          <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Sincronització Completa</h3>
          <p className="text-gray-600 mb-6">
            Sincronitza amb Google Calendar, Outlook i altres calendaris. Configura recordatoris i notificacions.
          </p>
          <button
            onClick={() => window.open('https://docs.lapublica.cat/documents', '_blank')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Veure documentació
          </button>
        </div>
      </div>
    </div>
  );
}

function MeetingsTab() {
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [meetings, setMeetings] = useState([
    { id: '1', title: 'Stand-up setmanal', status: 'scheduled', date: '2024-11-05', participants: ['Joan', 'Anna', 'Pere'] },
    { id: '2', title: 'Revisió Q4', status: 'completed', date: '2024-11-02', duration: '45 min' },
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Reunions</h3>
          <button
            onClick={() => setShowCreateMeeting(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Nova Reunió
          </button>
        </div>
        <div className="space-y-3">
          {meetings.map(meeting => (
            <div key={meeting.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
              <Video className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{meeting.title}</p>
                <p className="text-sm text-gray-500">
                  {meeting.date} · {meeting.status === 'completed' ? meeting.duration : `${meeting.participants?.length} participants`}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                meeting.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {meeting.status === 'completed' ? 'Completada' : 'Programada'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="max-w-md mx-auto">
          <Video className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Videollamades Integrades</h3>
          <p className="text-gray-600 mb-6">
            Integració directa amb Google Meet, Zoom i Teams. Grava reunions i genera actes automàticament.
          </p>
          <button
            onClick={() => window.open('https://docs.lapublica.cat/documents', '_blank')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Veure documentació
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para enviar mensaje directo
function MessageModal({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: any }) {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    console.log(`Enviando mensaje a ${member?.name}: ${message}`);
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Enviar mensaje a {member?.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para crear nueva reunión
function CreateMeetingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    participants: [] as string[],
    link: ''
  });

  if (!isOpen) return null;

  const handleCreate = () => {
    console.log('Creando reunión:', meetingData);
    setMeetingData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      participants: [],
      link: ''
    });
    onClose();
  };

  const toggleParticipant = (email: string) => {
    setMeetingData(prev => ({
      ...prev,
      participants: prev.participants.includes(email)
        ? prev.participants.filter(p => p !== email)
        : [...prev.participants, email]
    }));
  };

  const teamEmails = ['anna.garcia@empresa.com', 'pere.lopez@empresa.com'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Crear Nueva Reunión</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la reunión
            </label>
            <input
              type="text"
              value={meetingData.title}
              onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Reunión de planificación semanal"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={meetingData.description}
              onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción opcional de la reunión..."
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={meetingData.date}
                onChange={(e) => setMeetingData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora
              </label>
              <input
                type="time"
                value={meetingData.time}
                onChange={(e) => setMeetingData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración (minutos)
            </label>
            <select
              value={meetingData.duration}
              onChange={(e) => setMeetingData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1h 30min</option>
              <option value="120">2 horas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participantes
            </label>
            <div className="space-y-2">
              {teamEmails.map(email => (
                <label key={email} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={meetingData.participants.includes(email)}
                    onChange={() => toggleParticipant(email)}
                    className="mr-2"
                  />
                  <span className="text-sm">{email}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace de videoconferencia (opcional)
            </label>
            <input
              type="url"
              value={meetingData.link}
              onChange={(e) => setMeetingData(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!meetingData.title || !meetingData.date || !meetingData.time}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Crear Reunión
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para compartir post con miembros del equipo
function SharePostModal({ isOpen, onClose, post, teamMembers }: {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  teamMembers: any[]
}) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  if (!isOpen || !post) return null;

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleShare = () => {
    if (selectedMembers.length === 0) {
      alert('Selecciona almenys un membre per compartir');
      return;
    }

    console.log('Compartint post amb:', {
      post: post,
      members: selectedMembers,
      message: message
    });

    alert(`Post compartit amb ${selectedMembers.length} membre(s)!`);
    setSelectedMembers([]);
    setMessage('');
    onClose();
  };

  const otherMembers = teamMembers.filter(member => member.role !== 'GESTOR');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Compartir Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vista previa del post */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {post.authorAvatar}
            </div>
            <div>
              <p className="font-medium text-sm">{post.author}</p>
              <p className="text-xs text-gray-500">{post.role}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
        </div>

        {/* Seleccionar miembros */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Compartir amb:
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {otherMembers.map(member => (
              <label key={member.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => toggleMember(member.id)}
                  className="mr-3"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-500">
                        {member.isOnline ? 'En línia' : 'Fora de línia'}
                      </span>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Mensaje opcional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Missatge opcional:
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Afegeix un comentari..."
            className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none text-sm"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel·lar
          </button>
          <button
            onClick={handleShare}
            disabled={selectedMembers.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Compartir ({selectedMembers.length})
          </button>
        </div>
      </div>
    </div>
  );
}