'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CreatePostBox } from '../../app/dashboard/components/SocialFeed/components/CreatePostBox';
import { PostCard } from '../../app/dashboard/components/SocialFeed/components/PostCard';

interface Author {
  id: string;
  nick: string;
  name: string;
  image: string | null;
  position?: string;
  department?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  author: Author;
  replies?: Comment[];
}

interface PostAttachment {
  id: string;
  type: string;
  url: string;
  filename?: string;
}

interface Post {
  id: string;
  content: string;
  type: string;
  visibility: string;
  createdAt: string;
  author: Author;
  attachments: PostAttachment[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  isLiked: boolean;
  isOwn: boolean;
}

// Adaptar Post d'API al format esperat per PostCard
interface LegacyAttachment {
  type: string;
  url: string;
  filename?: string;
}

interface LegacyPost {
  id: number;
  user: string;
  avatar: string;
  role: string;
  time: string;
  content: string;
  image?: string;
  attachments?: LegacyAttachment[];
  likes: number;
  comments: LegacyComment[];
  shares: number;
  userLiked: boolean;
  showComments: boolean;
  _apiId: string; // Guardarem l'ID real de l'API
  isOwn: boolean; // Si és un post de l'usuari actual
}

interface LegacyComment {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  userLiked: boolean;
  _apiId: string;
}

// Helper per formatar temps relatiu
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ara mateix';
  if (diffMins < 60) return `Fa ${diffMins} min`;
  if (diffHours < 24) return `Fa ${diffHours}h`;
  if (diffDays < 7) return `Fa ${diffDays} dies`;
  return date.toLocaleDateString('ca-ES');
}

// Convertir Post d'API a format legacy
function convertToLegacyPost(post: Post, index: number): LegacyPost {
  return {
    id: index + 1, // Mantenim ID numèric per compatibilitat
    _apiId: post.id, // ID real de l'API
    user: post.author.name || post.author.nick || 'Usuari',
    avatar: post.author.image || '', // URL de la imatge o buit per mostrar inicial
    role: post.author.position || post.author.department || 'Empleat Públic',
    time: formatRelativeTime(post.createdAt),
    content: post.content,
    attachments: post.attachments.map(a => ({
      type: a.type,
      url: a.url,
      filename: a.filename,
    })),
    likes: post.stats.likes,
    comments: [], // Es carregaran sota demanda
    shares: post.stats.shares,
    userLiked: post.isLiked,
    showComments: false,
    isOwn: post.isOwn,
  };
}

export function SocialFeed() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<LegacyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [creating, setCreating] = useState(false);

  // Carregar posts
  const loadPosts = useCallback(async (cursor?: string) => {
    try {
      setLoading(true);
      const url = cursor
        ? `/api/posts?cursor=${cursor}&limit=10`
        : '/api/posts?limit=10';

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error carregant posts');

      const data = await response.json();

      const legacyPosts = data.posts.map((post: Post, i: number) =>
        convertToLegacyPost(post, cursor ? posts.length + i : i)
      );

      if (cursor) {
        setPosts(prev => [...prev, ...legacyPosts]);
      } else {
        setPosts(legacyPosts);
      }

      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      setLoading(false);
    }
  }, [posts.length]);

  // Carregar posts inicials
  useEffect(() => {
    if (session) {
      loadPosts();
    }
  }, [session]);

  // Crear post
  const handleCreatePost = async (content: string, attachments?: { type: string; url: string; filename?: string }[], visibility?: 'PUBLIC' | 'CONNECTIONS' | 'PRIVATE') => {
    if ((!content.trim() && !attachments?.length) || creating) return;

    try {
      setCreating(true);
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          visibility: visibility || 'PUBLIC',
          attachments: attachments?.map(att => ({
            type: att.type,
            url: att.url,
            filename: att.filename,
          })),
        }),
      });

      if (!response.ok) throw new Error('Error creant post');

      const newPost: Post = await response.json();
      const legacyPost = convertToLegacyPost(newPost, 0);

      // Marcar com a propi
      legacyPost.isOwn = true;

      // Si hem passat attachments manualment, afegir-los al post
      if (attachments && attachments.length > 0) {
        legacyPost.attachments = attachments.map(att => ({
          type: att.type,
          url: att.url,
          filename: att.filename,
        }));
      }

      // Afegir al principi i reindexar
      setPosts(prev => {
        const updated = [legacyPost, ...prev];
        return updated.map((p, i) => ({ ...p, id: i + 1 }));
      });
    } catch (err) {
      console.error('Error creant post:', err);
      alert('Error creant publicació');
    } finally {
      setCreating(false);
    }
  };

  // Toggle like
  const handleLike = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likes: p.userLiked ? p.likes - 1 : p.likes + 1, userLiked: !p.userLiked }
        : p
    ));

    try {
      const response = await fetch(`/api/posts/${post._apiId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        // Revertir si falla
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? { ...p, likes: p.userLiked ? p.likes - 1 : p.likes + 1, userLiked: !p.userLiked }
            : p
        ));
      }
    } catch (err) {
      // Revertir si falla
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes: p.userLiked ? p.likes - 1 : p.likes + 1, userLiked: !p.userLiked }
          : p
      ));
    }
  };

  // Carregar comentaris d'un post
  const loadComments = async (post: LegacyPost) => {
    try {
      const response = await fetch(`/api/posts/${post._apiId}/comments`);
      if (!response.ok) return [];

      const comments: Comment[] = await response.json();
      return comments.map((c, i) => ({
        id: i + 1,
        _apiId: c.id,
        user: c.author.name || c.author.nick || 'Usuari',
        avatar: c.author.image
          ? c.author.image
          : (c.author.name?.[0] || c.author.nick?.[0] || 'U').toUpperCase(),
        content: c.content,
        time: formatRelativeTime(c.createdAt),
        likes: c.likesCount,
        userLiked: false,
      }));
    } catch {
      return [];
    }
  };

  // Toggle comments
  const toggleComments = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Si s'obre i no té comentaris carregats, carregar-los
    if (!post.showComments && post.comments.length === 0) {
      const comments = await loadComments(post);
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, showComments: true, comments }
          : p
      ));
    } else {
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, showComments: !p.showComments }
          : p
      ));
    }
  };

  // Afegir comentari
  const handleAddComment = async (postId: number, commentText: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !commentText.trim()) return;

    try {
      const response = await fetch(`/api/posts/${post._apiId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });

      if (!response.ok) throw new Error('Error afegint comentari');

      const newComment: Comment = await response.json();
      const legacyComment: LegacyComment = {
        id: post.comments.length + 1,
        _apiId: newComment.id,
        user: newComment.author.name || newComment.author.nick || 'Usuari',
        avatar: newComment.author.image
          ? newComment.author.image
          : (newComment.author.name?.[0] || newComment.author.nick?.[0] || 'U').toUpperCase(),
        content: newComment.content,
        time: 'Ara mateix',
        likes: 0,
        userLiked: false,
      };

      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, comments: [...p.comments, legacyComment], showComments: true }
          : p
      ));
    } catch (err) {
      console.error('Error afegint comentari:', err);
    }
  };

  // Like comentari (local, no implementat a API encara)
  const handleCommentLike = (postId: number, commentId: number) => {
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, likes: comment.userLiked ? comment.likes - 1 : comment.likes + 1, userLiked: !comment.userLiked }
                : comment
            )
          }
        : post
    ));
  };

  // Eliminar post
  const handleDeletePost = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const response = await fetch(`/api/posts/${post._apiId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error eliminant post');

      // Eliminar de la llista local
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error eliminant post:', err);
      alert('Error eliminant publicació');
    }
  };

  // Reportar post (placeholder)
  const handleReportPost = (postId: number) => {
    alert('Gràcies pel teu report. El revisarem el més aviat possible.');
  };

  // Estat de càrrega inicial
  if (!session) {
    return (
      <div className="text-center py-10 text-gray-500">
        Inicia sessió per veure el feed
      </div>
    );
  }

  if (loading && posts.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">Carregant publicacions...</p>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error}</p>
        <button
          onClick={() => loadPosts()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Create Post Box */}
      <CreatePostBox onCreatePost={handleCreatePost} />

      {/* Posts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-2">Encara no hi ha publicacions</p>
            <p className="text-sm text-gray-400">Sigues el primer en compartir alguna cosa!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onToggleComments={toggleComments}
              onAddComment={handleAddComment}
              onCommentLike={handleCommentLike}
              onDelete={handleDeletePost}
              onReport={handleReportPost}
              isOwn={post.isOwn}
            />
          ))
        )}
      </div>

      {/* Carregar més */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => nextCursor && loadPosts(nextCursor)}
            disabled={loading}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Carregant...' : 'Carregar més publicacions'}
          </button>
        </div>
      )}
    </div>
  );
}
