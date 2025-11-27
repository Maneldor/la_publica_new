'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Types
interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  shares: number;
}

interface PostsResponse {
  content: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API functions
const fetchPosts = async (page = 1, limit = 20): Promise<PostsResponse> => {
  const response = await fetch(`${API_BASE_URL}/content?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    cache: 'force-cache',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
};

const fetchPost = async (id: string): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/content/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    cache: 'force-cache',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }

  return response.json();
};

const createPost = async (postData: { title: string; content: string; excerpt?: string }): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/content`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
};

// React Query Hooks

// Get posts with infinite scroll
export const useInfinitePosts = (limit = 20) => {
  return useInfiniteQuery<PostsResponse, Error>({
    queryKey: ['posts', 'infinite', limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPosts((pageParam as number | undefined) ?? 1, limit),
    getNextPageParam: (lastPage: PostsResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos (cacheTime renombrado a gcTime en v5)
  });
};

// Get paginated posts
export const usePosts = (page = 1, limit = 20) => {
  return useQuery<PostsResponse, Error>({
    queryKey: ['posts', page, limit],
    queryFn: () => fetchPosts(page, limit),
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos (cacheTime renombrado a gcTime en v5)
    placeholderData: (previousData) => previousData, // keepPreviousData renombrado en v5
  });
};

// Get single post
export const usePost = (id: string) => {
  return useQuery<Post, Error>({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
    enabled: !!id, // Only run if id exists
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (cacheTime renombrado a gcTime en v5)
  });
};

// Create post mutation
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (newPost) => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      // Optionally, add the new post to the cache
      queryClient.setQueryData(['post', newPost.id], newPost);
    },
    onError: (error) => {
      console.error('Error creating post:', error);
    },
  });
};

// Prefetch post for hover effects
export const usePrefetchPost = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery<Post, Error>({
      queryKey: ['post', id],
      queryFn: () => fetchPost(id),
      staleTime: 2 * 60 * 1000,
    });
  };
};

// Optimistic updates for likes
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`${API_BASE_URL}/content/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      return response.json();
    },
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(['post', postId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['post', postId], (old: Post | undefined) => {
        if (!old) return old;
        return {
          ...old,
          likes: old.likes + 1,
        };
      });

      // Return a context with the previous and new post
      return { previousPost, postId };
    },
    onError: (err, postId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },
    onSettled: (data, error, postId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};