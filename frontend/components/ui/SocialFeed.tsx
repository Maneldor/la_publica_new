'use client';

import { useState } from 'react';
import { mockPosts } from '../../app/dashboard/components/SocialFeed/data/mockPosts';
import { CreatePostBox } from '../../app/dashboard/components/SocialFeed/components/CreatePostBox';
import { PostCard } from '../../app/dashboard/components/SocialFeed/components/PostCard';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  userLiked: boolean;
}

interface Post {
  id: number;
  user: string;
  avatar: string;
  role: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  userLiked: boolean;
  showComments: boolean;
}

export function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handleCreatePost = (content: string) => {
    const post: Post = {
      id: posts.length + 1,
      user: 'Usuari',
      avatar: 'U',
      role: 'Empleat Públic',
      time: 'Ara mateix',
      content: content,
      likes: 0,
      comments: [],
      shares: 0,
      userLiked: false,
      showComments: false
    };
    setPosts([post, ...posts]);
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.userLiked ? post.likes - 1 : post.likes + 1, userLiked: !post.userLiked }
        : post
    ));
  };

  const handleCommentLike = (postId: number, commentId: number) => {
    setPosts(posts.map(post =>
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

  const toggleComments = (postId: number) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, showComments: !post.showComments }
        : post
    ));
  };

  const handleAddComment = (postId: number, commentText: string) => {
    const newComment: Comment = {
      id: Date.now(),
      user: 'Usuari',
      avatar: 'U',
      content: commentText,
      time: 'Ara mateix',
      likes: 0,
      userLiked: false
    };

    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, newComment], showComments: true }
        : post
    ));
  };

  return (
    <div>
      {/* Create Post Box */}
      <CreatePostBox onCreatePost={handleCreatePost} />

      {/* Posts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onToggleComments={toggleComments}
            onAddComment={handleAddComment}
            onCommentLike={handleCommentLike}
          />
        ))}
      </div>
    </div>
  );
}