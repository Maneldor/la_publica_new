'use client';

import { useState } from 'react';

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

interface PostCardProps {
  post: Post;
  onLike: (postId: number) => void;
  onToggleComments: (postId: number) => void;
  onAddComment: (postId: number, comment: string) => void;
  onCommentLike: (postId: number, commentId: number) => void;
}

export function PostCard({
  post,
  onLike,
  onToggleComments,
  onAddComment,
  onCommentLike
}: PostCardProps) {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(post.id, newComment);
      setNewComment('');
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      border: '2px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
      overflow: 'hidden',
      transition: 'all 0.2s ease'
    }} onMouseEnter={(e) => {
      e.currentTarget.style.border = '2px solid #3b82f6';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)';
    }} onMouseLeave={(e) => {
      e.currentTarget.style.border = '2px solid #e5e7eb';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)';
    }}>
      {/* Post Header */}
      <div style={{ padding: '20px 20px 12px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            {post.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#2c3e50',
                margin: 0
              }}>
                {post.user}
              </h3>
            </div>
            <div style={{
              fontSize: '13px',
              color: '#6c757d',
              marginTop: '2px'
            }}>
              {post.role}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '4px'
            }}>
              {post.time}
            </div>
          </div>
          <button style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#6c757d',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px'
          }}>
            ⋯
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div style={{ padding: '0 20px 16px 20px' }}>
        <p style={{
          fontSize: '15px',
          color: '#212529',
          lineHeight: '1.5',
          margin: 0,
          whiteSpace: 'pre-wrap'
        }}>
          {post.content}
        </p>
      </div>

      {/* Post Stats */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid #f0f0f0',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: '#6c757d'
      }}>
        <span style={{ cursor: 'pointer' }}>
          {post.userLiked ? '❤️' : '🤍'} {post.likes} m'agrada
        </span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => onToggleComments(post.id)}>
            💬 {post.comments.length} comentaris
          </span>
          <span style={{ cursor: 'pointer' }}>
            🔄 {post.shares} compartit
          </span>
        </div>
      </div>

      {/* Post Actions */}
      <div style={{
        padding: '8px 20px',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <button
          onClick={() => onLike(post.id)}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: post.userLiked ? '#3b82f6' : '#6c757d',
            fontWeight: post.userLiked ? '600' : '500',
            fontSize: '14px',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {post.userLiked ? '👍' : '👍'} M'agrada
        </button>
        <button
          onClick={() => onToggleComments(post.id)}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#6c757d',
            fontSize: '14px',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          💬 Comentar
        </button>
        <button style={{
          flex: 1,
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#6c757d',
          fontSize: '14px',
          cursor: 'pointer',
          borderRadius: '6px',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          ↗️ Compartir
        </button>
      </div>

      {/* Comments Section */}
      {post.showComments && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafbfc'
        }}>
          {/* Existing Comments */}
          {post.comments.map((comment) => (
            <div key={comment.id} style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#6c757d',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {comment.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  backgroundColor: '#f0f2f5',
                  borderRadius: '12px',
                  padding: '8px 12px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '4px'
                  }}>
                    {comment.user}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#212529',
                    lineHeight: '1.4'
                  }}>
                    {comment.content}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '6px',
                  paddingLeft: '12px',
                  fontSize: '12px',
                  color: '#6c757d'
                }}>
                  <button
                    onClick={() => onCommentLike(post.id, comment.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: comment.userLiked ? '#3b82f6' : '#6c757d',
                      fontWeight: comment.userLiked ? '600' : '500',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    M'agrada {comment.likes > 0 && `(${comment.likes})`}
                  </button>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: '#6c757d',
                    cursor: 'pointer',
                    padding: 0
                  }}>
                    Respondre
                  </button>
                  <span>{comment.time}</span>
                </div>
              </div>
            </div>
          ))}

          {/* New Comment Input */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              flexShrink: 0
            }}>
              U
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Escriu un comentari..."
                style={{
                  width: '100%',
                  padding: '8px 40px 8px 12px',
                  borderRadius: '20px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: '#f0f2f5',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: newComment.trim() ? '#3b82f6' : '#ccc',
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  padding: '4px'
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}