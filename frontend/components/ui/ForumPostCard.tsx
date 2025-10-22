'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  coverImage: string;
  createdAt: string;
  lastActivity: string;
  commentsCount: number;
  votesUp: number;
  votesDown: number;
  isFollowing: boolean;
  isPinned: boolean;
  hasAttachments: boolean;
  attachments: Array<{
    name: string;
    type: string;
    size: string;
  }>;
}

interface ForumPostCardProps {
  post: ForumPost;
  viewMode: 'grid' | 'list';
}

export function ForumPostCard({ post, viewMode }: ForumPostCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleViewPost = () => {
    router.push(`/dashboard/forums/${post.id}`);
  };

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(post.isFollowing ? 'Deixar de seguir fòrum:' : 'Seguir fòrum:', post.title);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleViewPost}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
          boxShadow: isHovered ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          marginBottom: '16px',
          position: 'relative'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge de pinned */}
        {post.isPinned && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            Fixat
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          {/* Cover image */}
          <div style={{
            width: '120px',
            height: '80px',
            borderRadius: '8px',
            backgroundImage: `url(${post.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0
          }} />

          {/* Contenido */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  margin: '0 0 4px 0',
                  lineHeight: '1.3'
                }}>
                  {post.title}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#3b82f6',
                    fontWeight: '500'
                  }}>
                    {post.category}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#8e8e93'
                  }}>
                    {post.lastActivity}
                  </span>
                </div>
              </div>

              {/* Botón seguir */}
              <button
                onClick={handleToggleFollow}
                style={{
                  padding: '4px 8px',
                  backgroundColor: post.isFollowing ? '#10b981' : 'transparent',
                  color: post.isFollowing ? 'white' : '#6c757d',
                  border: `1px solid ${post.isFollowing ? '#10b981' : '#e9ecef'}`,
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {post.isFollowing ? 'Seguint' : 'Seguir'}
              </button>
            </div>

            <p style={{
              fontSize: '13px',
              color: '#6c757d',
              margin: '0 0 12px 0',
              lineHeight: '1.4',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {post.content}
            </p>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                marginBottom: '12px'
              }}>
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#f0f7ff',
                      color: '#3b82f6',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '500'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Autor */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundImage: `url(${post.authorAvatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <span style={{
                fontSize: '12px',
                color: '#6c757d',
                fontWeight: '500'
              }}>
                {post.author}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista Grid (por defecto) - Simplificada
  return (
    <div
      onClick={handleViewPost}
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: isHovered ? '2px solid #3b82f6' : '2px solid #e5e7eb',
        boxShadow: isHovered ? '0 8px 16px -4px rgba(59, 130, 246, 0.2)' : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        height: '350px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Cover Image - Altura fija */}
      <div style={{
        height: '180px',
        backgroundImage: `url(${post.coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%)'
        }} />
      </div>

      {/* Contenido del post */}
      <div style={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Categoría y fecha */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#3b82f6',
            fontWeight: '500'
          }}>
            {post.category}
          </span>
          <span style={{
            fontSize: '11px',
            color: '#8e8e93'
          }}>
            {post.lastActivity}
          </span>
        </div>

        {/* Título */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#2c3e50',
          margin: '0 0 8px 0',
          lineHeight: '1.3',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {post.title}
        </h3>

        {/* Descripción */}
        <p style={{
          fontSize: '13px',
          color: '#6c757d',
          lineHeight: '1.4',
          margin: '0 0 12px 0',
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {post.content}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginBottom: '12px'
          }}>
            {post.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#f0f7ff',
                  color: '#3b82f6',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '500'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Fila inferior: Autor, Badge Fixat y Botón Seguir */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Lado izquierdo: Autor y Badge Fixat */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundImage: `url(${post.authorAvatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
            <span style={{
              fontSize: '11px',
              color: '#6c757d',
              fontWeight: '500'
            }}>
              {post.author}
            </span>

            {/* Badge Fixat en el lado izquierdo */}
            {post.isPinned && (
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                Fixat
              </div>
            )}
          </div>

          {/* Lado derecho: Botón seguir */}
          <button
            onClick={handleToggleFollow}
            style={{
              padding: '6px 12px',
              backgroundColor: post.isFollowing ? '#10b981' : 'rgba(255,255,255,0.9)',
              color: post.isFollowing ? 'white' : '#374151',
              border: `1px solid ${post.isFollowing ? '#10b981' : '#e9ecef'}`,
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {post.isFollowing ? 'Seguint' : 'Seguir'}
          </button>
        </div>
      </div>
    </div>
  );
}