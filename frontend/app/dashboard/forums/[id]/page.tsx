'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown, Bookmark, Share2, Pin, Paperclip } from 'lucide-react';
import { samplePosts } from '../data/forumData';
import { Post } from '../types/forumTypes';

export default function ForumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [votes, setVotes] = useState({ up: 0, down: 0 });
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const postId = parseInt(params.id as string);

    // Buscar en foros de ejemplo
    let foundPost = samplePosts.find(p => p.id === postId);

    // Si no se encuentra, buscar en foros creados
    if (!foundPost) {
      const createdForums = JSON.parse(localStorage.getItem('createdForums') || '[]');
      const createdPost = createdForums.find((forum: any) => forum.id === postId);

      if (createdPost) {
        foundPost = {
          id: createdPost.id,
          title: createdPost.title,
          content: createdPost.description,
          author: createdPost.author,
          authorAvatar: createdPost.authorAvatar,
          category: createdPost.category,
          tags: createdPost.tags || [createdPost.category],
          coverImage: createdPost.coverImageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
          createdAt: createdPost.createdAt,
          lastActivity: 'fa pocs minuts',
          commentsCount: createdPost.commentsCount || 0,
          votesUp: createdPost.votesUp || 0,
          votesDown: createdPost.votesDown || 0,
          isFollowing: createdPost.isFollowing || false,
          isPinned: createdPost.isPinned || false,
          hasAttachments: createdPost.hasAttachments || false,
          attachments: createdPost.attachments || []
        };
      }
    }

    if (foundPost) {
      setPost(foundPost);
      setIsFollowing(foundPost.isFollowing);
      setVotes({ up: foundPost.votesUp, down: foundPost.votesDown });
    }
  }, [params.id]);

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      // Remove vote
      setVotes(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
      setUserVote(null);
    } else {
      // Add new vote, remove old if exists
      setVotes(prev => {
        const newVotes = { ...prev };
        if (userVote) {
          newVotes[userVote] -= 1;
        }
        newVotes[type] += 1;
        return newVotes;
      });
      setUserVote(type);
    }
  };

  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fòrum no trobat</h2>
          <p className="text-gray-600 mb-4">El fòrum que busques no existeix o ha estat eliminat.</p>
          <button
            onClick={() => router.push('/dashboard/forums')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tornar als fòrums
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con imagen de portada */}
      <div className="relative h-80 bg-gray-900">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Botón volver */}
        <button
          onClick={() => router.push('/dashboard/forums')}
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg hover:bg-opacity-30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Tornar
        </button>

        {/* Badge de pinned */}
        {post.isPinned && (
          <div className="absolute top-6 right-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold">
            <Pin className="w-4 h-4" />
            Fixat
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header del post */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-3">
                  {post.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón seguir */}
              <button
                onClick={handleToggleFollow}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isFollowing
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? 'Seguint' : 'Seguir'}
              </button>
            </div>

            {/* Información del autor */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{post.author}</p>
                  <p className="text-sm text-gray-600">
                    Publicat el {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.commentsCount}
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {votes.up}
                </div>
                {post.hasAttachments && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="w-4 h-4" />
                    {post.attachments.length}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenido del post */}
          <div className="p-8">
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Adjuntos */}
            {post.hasAttachments && post.attachments.length > 0 && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Fitxers adjunts
                </h3>
                <div className="space-y-3">
                  {post.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-xs">
                          {attachment.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-sm text-gray-600">{attachment.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Acciones del post */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Votos */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote('up')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                      userVote === 'up'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {votes.up}
                  </button>
                  <button
                    onClick={() => handleVote('down')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                      userVote === 'down'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    {votes.down}
                  </button>
                </div>

                {/* Comentarios */}
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Comentar
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Guardar */}
                <button className="flex items-center gap-2 px-3 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>

                {/* Compartir */}
                <button className="flex items-center gap-2 px-3 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de comentarios */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comentaris ({post.commentsCount})
          </h2>

          {/* Formulario para nuevo comentario */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Afegir comentari</h3>
            <textarea
              placeholder="Escriu el teu comentari aquí..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-4">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Publicar comentari
              </button>
            </div>
          </div>

          {/* Lista de comentarios */}
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Encara no hi ha comentaris en aquest fòrum.</p>
            <p className="text-sm">Sigues el primer en participar!</p>
          </div>
        </div>
      </div>
    </div>
  );
}