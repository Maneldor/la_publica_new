'use client';

import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Heart, Send, User, Trash2, Edit3, Flag, Bookmark, Link2, Copy, Check } from 'lucide-react';

interface Attachment {
  type: string;
  url: string;
  filename?: string;
}

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
  attachments?: Attachment[];
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
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onReport?: (postId: number) => void;
  onSave?: (postId: number) => void;
  isOwn?: boolean;
}

// Helper per verificar si és URL o inicial
const isImageUrl = (str: string): boolean => {
  return str.startsWith('http') || str.startsWith('/') || str.startsWith('data:');
};

// Component Avatar reutilitzable
function Avatar({ src, name, size = 'md' }: { src?: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { width: '32px', height: '32px', fontSize: '12px' },
    md: { width: '48px', height: '48px', fontSize: '16px' },
    lg: { width: '56px', height: '56px', fontSize: '18px' },
  };

  const initial = name?.[0]?.toUpperCase() || 'U';
  const hasImage = src && isImageUrl(src);

  return (
    <div style={{
      ...sizes[size],
      borderRadius: '50%',
      backgroundColor: 'var(--PostCard-avatar-bg, #3b82f6)',
      color: 'var(--PostCard-avatar-color, #ffffff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      {hasImage ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initial
      )}
    </div>
  );
}

export function PostCard({
  post,
  onLike,
  onToggleComments,
  onAddComment,
  onCommentLike,
  onDelete,
  onEdit,
  onShare,
  onReport,
  onSave,
  isOwn = false
}: PostCardProps) {
  const [newComment, setNewComment] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Tancar menus quan es clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Copiar enllaç
  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 1500);
  };

  // Compartir a xarxes
  const handleShareTo = (platform: 'twitter' | 'linkedin' | 'whatsapp') => {
    const url = `${window.location.origin}/post/${post.id}`;
    const text = post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '');

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    setShowShareMenu(false);
    onShare?.(post.id);
  };

  // Guardar post
  const handleSave = () => {
    setSaved(!saved);
    onSave?.(post.id);
    setShowOptionsMenu(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(post.id, newComment);
      setNewComment('');
    }
  };

  // Obtenir imatges del post
  const postImages = post.attachments?.filter(a => a.type === 'IMAGE') || [];
  const postDocuments = post.attachments?.filter(a => a.type === 'DOCUMENT') || [];

  // Si hi ha image legacy, afegir-la
  if (post.image && !postImages.find(i => i.url === post.image)) {
    postImages.unshift({ type: 'IMAGE', url: post.image });
  }

  return (
    <div style={{
      backgroundColor: 'var(--PostCard-background, #ffffff)',
      borderRadius: 'var(--PostCard-border-radius, 12px)',
      border: '2px solid var(--PostCard-border-color, #e5e7eb)',
      boxShadow: 'var(--PostCard-shadow, 0 1px 3px rgba(0,0,0,0.1))',
      overflow: 'hidden',
      transition: 'all 0.2s'
    }}>
      {/* Post Header */}
      <div style={{ padding: '20px', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Avatar src={post.avatar} name={post.user} size="md" />

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--PostCard-user-name, #1f2937)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {post.user}
            </h3>
            <p style={{
              fontSize: '13px',
              color: 'var(--PostCard-user-role, #6b7280)',
              margin: '2px 0 0 0'
            }}>
              {post.role}
            </p>
            <p style={{
              fontSize: '12px',
              color: 'var(--PostCard-time-color, #9ca3af)',
              margin: '4px 0 0 0'
            }}>
              {post.time}
            </p>
          </div>

          <div style={{ position: 'relative' }} ref={optionsMenuRef}>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              style={{
                padding: '8px',
                color: 'var(--PostCard-menu-icon-color, #9ca3af)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <MoreHorizontal style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Options Menu */}
            {showOptionsMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '4px',
                width: '192px',
                backgroundColor: 'var(--PostCard-menu-bg, #ffffff)',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                border: '1px solid var(--PostCard-menu-border, #e5e7eb)',
                padding: '4px 0',
                zIndex: 50
              }}>
                {/* Guardar */}
                <button
                  onClick={handleSave}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    color: 'var(--PostCard-menu-text, #374151)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <Bookmark style={{ width: '16px', height: '16px', fill: saved ? 'var(--PostCard-saved-color, #3b82f6)' : 'none', color: saved ? 'var(--PostCard-saved-color, #3b82f6)' : 'currentColor' }} />
                  {saved ? 'Desat' : 'Desar publicació'}
                </button>

                {/* Copiar enllaç */}
                <button
                  onClick={handleCopyLink}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    color: 'var(--PostCard-menu-text, #374151)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Link2 style={{ width: '16px', height: '16px' }} />
                  Copiar enllaç
                </button>

                {/* Separador si és propi */}
                {isOwn && <div style={{ borderTop: '1px solid var(--PostCard-menu-divider, #f3f4f6)', margin: '4px 0' }} />}

                {/* Editar (només si és propi) */}
                {isOwn && onEdit && (
                  <button
                    onClick={() => {
                      onEdit(post.id);
                      setShowOptionsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      color: 'var(--PostCard-menu-text, #374151)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit3 style={{ width: '16px', height: '16px' }} />
                    Editar publicació
                  </button>
                )}

                {/* Eliminar (només si és propi) */}
                {isOwn && onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('Estàs segur que vols eliminar aquesta publicació?')) {
                        onDelete(post.id);
                      }
                      setShowOptionsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      color: 'var(--PostCard-danger-color, #dc2626)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                    Eliminar publicació
                  </button>
                )}

                {/* Reportar (si no és propi) */}
                {!isOwn && (
                  <>
                    <div style={{ borderTop: '1px solid var(--PostCard-menu-divider, #f3f4f6)', margin: '4px 0' }} />
                    <button
                      onClick={() => {
                        onReport?.(post.id);
                        setShowOptionsMenu(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        fontSize: '14px',
                        color: 'var(--PostCard-danger-color, #dc2626)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Flag style={{ width: '16px', height: '16px' }} />
                      Reportar publicació
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div style={{ padding: '0 20px 16px' }}>
        <p style={{
          fontSize: '15px',
          color: 'var(--PostCard-content-color, #1f2937)',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          margin: 0
        }}>
          {post.content}
        </p>
      </div>

      {/* Post Images */}
      {postImages.length > 0 && (
        <div style={{
          display: postImages.length === 1 ? 'block' : 'grid',
          gridTemplateColumns: postImages.length > 1 ? 'repeat(2, 1fr)' : undefined,
          gap: postImages.length > 1 ? '4px' : undefined
        }}>
          {postImages.map((img, index) => (
            <div
              key={index}
              style={{
                maxHeight: postImages.length === 1 ? '400px' : undefined,
                aspectRatio: postImages.length > 1 ? '1' : undefined,
                overflow: 'hidden',
                backgroundColor: 'var(--PostCard-image-bg, #f3f4f6)'
              }}
            >
              <img
                src={img.url}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Post Documents */}
      {postDocuments.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {postDocuments.map((doc, index) => (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--PostCard-document-bg, #f3f4f6)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
              >
                <svg style={{ width: '16px', height: '16px', color: 'var(--PostCard-document-icon, #6b7280)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span style={{
                  fontSize: '14px',
                  color: 'var(--PostCard-document-text, #374151)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '150px'
                }}>
                  {doc.filename || 'Document'}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Post Stats */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--PostCard-divider, #f3f4f6)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: 'var(--PostCard-stats-color, #6b7280)'
      }}>
        <button
          onClick={() => onLike(post.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            transition: 'color 0.2s'
          }}
        >
          {post.userLiked ? (
            <Heart style={{ width: '16px', height: '16px', fill: 'var(--PostCard-liked-color, #ef4444)', color: 'var(--PostCard-liked-color, #ef4444)' }} />
          ) : (
            <Heart style={{ width: '16px', height: '16px' }} />
          )}
          <span>{post.likes} m'agrada</span>
        </button>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => onToggleComments(post.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit'
            }}
          >
            <MessageCircle style={{ width: '16px', height: '16px' }} />
            <span>{post.comments.length} comentaris</span>
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Share2 style={{ width: '16px', height: '16px' }} />
            <span>{post.shares} compartit</span>
          </span>
        </div>
      </div>

      {/* Post Actions */}
      <div style={{
        padding: '8px 20px',
        borderTop: '1px solid var(--PostCard-divider, #f3f4f6)',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <button
          onClick={() => onLike(post.id)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: post.userLiked ? 'var(--PostCard-action-active, #2563eb)' : 'var(--PostCard-action-color, #4b5563)',
            fontWeight: post.userLiked ? '600' : '400',
            transition: 'all 0.2s'
          }}
        >
          <ThumbsUp style={{ width: '20px', height: '20px', fill: post.userLiked ? 'var(--PostCard-action-active, #2563eb)' : 'none' }} />
          <span style={{ fontSize: '14px' }}>M'agrada</span>
        </button>

        <button
          onClick={() => onToggleComments(post.id)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--PostCard-action-color, #4b5563)',
            transition: 'background-color 0.2s'
          }}
        >
          <MessageCircle style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '14px' }}>Comentar</span>
        </button>

        <div style={{ flex: 1, position: 'relative' }} ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--PostCard-action-color, #4b5563)',
              transition: 'background-color 0.2s'
            }}
          >
            <Share2 style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '14px' }}>Compartir</span>
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              width: '208px',
              backgroundColor: 'var(--PostCard-menu-bg, #ffffff)',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              border: '1px solid var(--PostCard-menu-border, #e5e7eb)',
              padding: '4px 0',
              zIndex: 50
            }}>
              {/* Copiar enllaç */}
              <button
                onClick={handleCopyLink}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: copied ? 'var(--PostCard-success-color, #16a34a)' : 'var(--PostCard-menu-text, #374151)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {copied ? (
                  <>
                    <Check style={{ width: '16px', height: '16px', color: 'var(--PostCard-success-color, #16a34a)' }} />
                    <span>Enllaç copiat!</span>
                  </>
                ) : (
                  <>
                    <Copy style={{ width: '16px', height: '16px' }} />
                    Copiar enllaç
                  </>
                )}
              </button>

              <div style={{ borderTop: '1px solid var(--PostCard-menu-divider, #f3f4f6)', margin: '4px 0' }} />

              {/* Twitter/X */}
              <button
                onClick={() => handleShareTo('twitter')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'var(--PostCard-menu-text, #374151)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Compartir a X
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleShareTo('linkedin')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'var(--PostCard-menu-text, #374151)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Compartir a LinkedIn
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShareTo('whatsapp')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'var(--PostCard-menu-text, #374151)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Compartir a WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {post.showComments && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--PostCard-divider, #f3f4f6)',
          backgroundColor: 'var(--PostCard-comments-bg, #f9fafb)'
        }}>
          {/* Existing Comments */}
          {post.comments.map((comment) => (
            <div key={comment.id} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <Avatar src={comment.avatar} name={comment.user} size="sm" />

              <div style={{ flex: 1 }}>
                <div style={{
                  backgroundColor: 'var(--PostCard-comment-bg, #ffffff)',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  border: '1px solid var(--PostCard-comment-border, #f3f4f6)'
                }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--PostCard-comment-author, #1f2937)',
                    margin: 0
                  }}>
                    {comment.user}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--PostCard-comment-text, #374151)',
                    marginTop: '4px',
                    lineHeight: '1.5'
                  }}>
                    {comment.content}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '6px',
                  paddingLeft: '12px',
                  fontSize: '12px',
                  color: 'var(--PostCard-comment-meta, #6b7280)'
                }}>
                  <button
                    onClick={() => onCommentLike(post.id, comment.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: comment.userLiked ? 'var(--PostCard-action-active, #2563eb)' : 'inherit',
                      fontWeight: comment.userLiked ? '600' : '400'
                    }}
                  >
                    M'agrada {comment.likes > 0 && `(${comment.likes})`}
                  </button>
                  <button style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit'
                  }}>
                    Respondre
                  </button>
                  <span>{comment.time}</span>
                </div>
              </div>
            </div>
          ))}

          {/* New Comment Input */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--PostCard-avatar-bg, #3b82f6)',
              color: 'var(--PostCard-avatar-color, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              flexShrink: 0
            }}>
              <User style={{ width: '16px', height: '16px' }} />
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
                  padding: '8px 40px 8px 16px',
                  borderRadius: '9999px',
                  border: '1px solid var(--PostCard-input-border, #e5e7eb)',
                  backgroundColor: 'var(--PostCard-input-bg, #ffffff)',
                  fontSize: '14px',
                  color: 'var(--PostCard-input-text, #111827)',
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
                  padding: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  color: newComment.trim() ? 'var(--PostCard-action-active, #3b82f6)' : 'var(--PostCard-input-placeholder, #d1d5db)'
                }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
