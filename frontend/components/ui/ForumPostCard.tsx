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
          backgroundColor: 'var(--ForumPostCard-background, #ffffff)',
          borderRadius: 'var(--ForumPostCard-border-radius-list, 12px)',
          padding: 'var(--ForumPostCard-padding, 20px)',
          border: `2px solid ${isHovered ? 'var(--ForumPostCard-hover-border-color, #3b82f6)' : 'var(--ForumPostCard-border-color, #e5e7eb)'}`,
          boxShadow: isHovered
            ? 'var(--ForumPostCard-hover-shadow, 0 8px 16px -4px rgba(59, 130, 246, 0.2))'
            : 'var(--ForumPostCard-shadow, 0 4px 6px -1px rgba(59, 130, 246, 0.1))',
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
            backgroundColor: 'var(--ForumPostCard-pinned-background, #f59e0b)',
            color: 'var(--ForumPostCard-pinned-color, #ffffff)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            Fixat
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Cover image */}
          <div style={{
            width: 'var(--ForumPostCard-image-width-list, 140px)',
            height: 'var(--ForumPostCard-image-height-list, 90px)',
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
                  color: 'var(--ForumPostCard-title-color, #2c3e50)',
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
                    color: 'var(--ForumPostCard-category-color, #3b82f6)',
                    fontWeight: '500'
                  }}>
                    {post.category}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--ForumPostCard-meta-color, #8e8e93)'
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
                  backgroundColor: post.isFollowing
                    ? 'var(--ForumPostCard-following-background, #10b981)'
                    : 'transparent',
                  color: post.isFollowing
                    ? 'var(--ForumPostCard-following-color, #ffffff)'
                    : 'var(--ForumPostCard-follow-color, #6c757d)',
                  border: `1px solid ${post.isFollowing ? 'var(--ForumPostCard-following-background, #10b981)' : 'var(--ForumPostCard-border-color, #e9ecef)'}`,
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
              color: 'var(--ForumPostCard-description-color, #6c757d)',
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
                      backgroundColor: 'var(--ForumPostCard-tag-background, #f0f7ff)',
                      color: 'var(--ForumPostCard-tag-color, #3b82f6)',
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
                width: 'var(--ForumPostCard-avatar-size, 24px)',
                height: 'var(--ForumPostCard-avatar-size, 24px)',
                borderRadius: '50%',
                backgroundImage: `url(${post.authorAvatar})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <span style={{
                fontSize: '12px',
                color: 'var(--ForumPostCard-author-color, #6c757d)',
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

  // Vista Grid
  return (
    <div
      onClick={handleViewPost}
      style={{
        backgroundColor: 'var(--ForumPostCard-background, #ffffff)',
        borderRadius: 'var(--ForumPostCard-border-radius, 16px)',
        overflow: 'hidden',
        border: `2px solid ${isHovered ? 'var(--ForumPostCard-hover-border-color, #3b82f6)' : 'var(--ForumPostCard-border-color, #e5e7eb)'}`,
        boxShadow: isHovered
          ? 'var(--ForumPostCard-hover-shadow, 0 8px 16px -4px rgba(59, 130, 246, 0.2))'
          : 'var(--ForumPostCard-shadow, 0 4px 6px -1px rgba(59, 130, 246, 0.1))',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        height: '380px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div style={{
        height: 'var(--ForumPostCard-cover-height, 200px)',
        backgroundImage: `url(${post.coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        flexShrink: 0
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%)'
        }} />
      </div>

      {/* Contenido */}
      <div style={{
        padding: 'var(--ForumPostCard-content-padding, 16px)',
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
            color: 'var(--ForumPostCard-category-color, #3b82f6)',
            fontWeight: '500'
          }}>
            {post.category}
          </span>
          <span style={{
            fontSize: '11px',
            color: 'var(--ForumPostCard-meta-color, #8e8e93)'
          }}>
            {post.lastActivity}
          </span>
        </div>

        {/* Título */}
        <h3 style={{
          fontSize: '15px',
          fontWeight: '600',
          color: 'var(--ForumPostCard-title-color, #2c3e50)',
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
          color: 'var(--ForumPostCard-description-color, #6c757d)',
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
                  backgroundColor: 'var(--ForumPostCard-tag-background, #f0f7ff)',
                  color: 'var(--ForumPostCard-tag-color, #3b82f6)',
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

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
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
              color: 'var(--ForumPostCard-author-color, #6c757d)',
              fontWeight: '500'
            }}>
              {post.author}
            </span>

            {post.isPinned && (
              <div style={{
                padding: '6px 12px',
                backgroundColor: 'var(--ForumPostCard-pinned-background, #f59e0b)',
                color: 'var(--ForumPostCard-pinned-color, #ffffff)',
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

          <button
            onClick={handleToggleFollow}
            style={{
              padding: '6px 12px',
              backgroundColor: post.isFollowing
                ? 'var(--ForumPostCard-following-background, #10b981)'
                : 'rgba(255,255,255,0.9)',
              color: post.isFollowing
                ? 'var(--ForumPostCard-following-color, #ffffff)'
                : 'var(--ForumPostCard-follow-color, #374151)',
              border: `1px solid ${post.isFollowing ? 'var(--ForumPostCard-following-background, #10b981)' : 'var(--ForumPostCard-border-color, #e9ecef)'}`,
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
