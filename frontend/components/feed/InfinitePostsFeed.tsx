'use client';

import { useInfinitePosts, usePrefetchPost, useLikePost } from '@/lib/hooks/useContent';
import { PostsSkeletonList } from '@/components/skeletons/PostSkeleton';
import { useEffect, useRef, useState } from 'react';
// import Image from 'next/image'; // Unused

export default function InfinitePostsFeed() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfinitePosts();

  const prefetchPost = usePrefetchPost();
  const likePostMutation = useLikePost();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, number>>({});

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = async (postId: string, currentLikes: number) => {
    // Optimistic update
    setOptimisticLikes(prev => ({
      ...prev,
      [postId]: (prev[postId] ?? currentLikes) + 1
    }));

    try {
      await likePostMutation.mutateAsync(postId);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticLikes(prev => ({
        ...prev,
        [postId]: currentLikes
      }));
    }
  };

  if (status === 'loading') {
    return <PostsSkeletonList count={3} />;
  }

  if (status === 'error') {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="text-red-500 mb-2">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar posts</h3>
        <p className="text-gray-500 mb-4">Hubo un problema al cargar el contenido.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap(page => page.content) ?? [];

  return (
    <div className="space-y-6">
      {/* Create Post Widget */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">EP</span>
          </div>
          <button className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            ¿Qué quieres compartir con la comunidad?
          </button>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">Foto</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">Documento</span>
            </button>

            <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4M3 21h18M5 21V10a2 2 0 012-2h10a2 2 0 012 2v11" />
              </svg>
              <span className="text-sm">Evento</span>
            </button>
          </div>

          <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium">
            Publicar
          </button>
        </div>
      </div>

      {/* Posts */}
      {allPosts.map((post, index) => {
        const displayLikes = optimisticLikes[post.id] ?? post.likes;

        return (
          <article
            key={`${post.id}-${index}`}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            onMouseEnter={() => prefetchPost(post.id)}
          >
            {/* Post Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {post.author.email.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{post.author.email}</h4>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>

            {/* Post Title */}
            {post.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
            )}

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-800 leading-relaxed text-[15px] whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Post Engagement Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <span>{displayLikes} me gusta</span>
                <span>{post.comments} comentarios</span>
                <span>{post.shares} compartidas</span>
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-6">
                <button
                  onClick={() => handleLike(post.id, post.likes)}
                  disabled={likePostMutation.isLoading}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium">Me gusta</span>
                </button>

                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm font-medium">Comentar</span>
                </button>

                <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors p-2 hover:bg-green-50 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="text-sm font-medium">Compartir</span>
                </button>
              </div>

              <button className="flex items-center space-x-2 text-gray-500 hover:text-yellow-600 transition-colors p-2 hover:bg-yellow-50 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span className="text-sm font-medium">Guardar</span>
              </button>
            </div>
          </article>
        );
      })}

      {/* Loading More Indicator */}
      <div ref={loadMoreRef} className="text-center py-6">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-500">Cargando más posts...</span>
          </div>
        )}

        {!hasNextPage && allPosts.length > 0 && (
          <p className="text-gray-500">¡Has visto todos los posts disponibles!</p>
        )}

        {allPosts.length === 0 && !isFetching && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay posts aún</h3>
            <p className="text-gray-500 mb-4">Sé el primero en compartir algo con la comunidad.</p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Crear primer post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}