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
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg',
  };

  const initial = name?.[0]?.toUpperCase() || 'U';
  const hasImage = src && isImageUrl(src);

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden`}>
      {hasImage ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
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
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden transition-all hover:border-blue-500 hover:shadow-md">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-3">
          <Avatar src={post.avatar} name={post.user} size="md" />

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-gray-800 truncate">
              {post.user}
            </h3>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {post.role}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {post.time}
            </p>
          </div>

          <div className="relative" ref={optionsMenuRef}>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Options Menu */}
            {showOptionsMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {/* Guardar */}
                <button
                  onClick={handleSave}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-blue-500 text-blue-500' : ''}`} />
                  {saved ? 'Desat' : 'Desar publicació'}
                </button>

                {/* Copiar enllaç */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Copiar enllaç
                </button>

                {/* Separador si és propi */}
                {isOwn && <div className="border-t border-gray-100 my-1" />}

                {/* Editar (només si és propi) */}
                {isOwn && onEdit && (
                  <button
                    onClick={() => {
                      onEdit(post.id);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
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
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar publicació
                  </button>
                )}

                {/* Reportar (si no és propi) */}
                {!isOwn && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        onReport?.(post.id);
                        setShowOptionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Flag className="w-4 h-4" />
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
      <div className="px-5 pb-4">
        <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Images */}
      {postImages.length > 0 && (
        <div className={`${postImages.length === 1 ? '' : 'grid grid-cols-2 gap-1'}`}>
          {postImages.map((img, index) => (
            <div
              key={index}
              className={`${postImages.length === 1 ? 'max-h-[400px]' : 'aspect-square'} overflow-hidden bg-gray-100`}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              />
            </div>
          ))}
        </div>
      )}

      {/* Post Documents */}
      {postDocuments.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex flex-wrap gap-2">
            {postDocuments.map((doc, index) => (
              <a
                key={index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-700 truncate max-w-[150px]">
                  {doc.filename || 'Document'}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Post Stats */}
      <div className="px-5 py-3 border-t border-gray-100 flex justify-between text-[13px] text-gray-500">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
        >
          {post.userLiked ? (
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
          <span>{post.likes} m'agrada</span>
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => onToggleComments(post.id)}
            className="flex items-center gap-1.5 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments.length} comentaris</span>
          </button>
          <span className="flex items-center gap-1.5">
            <Share2 className="w-4 h-4" />
            <span>{post.shares} compartit</span>
          </span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-5 py-2 border-t border-gray-100 flex justify-around">
        <button
          onClick={() => onLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            post.userLiked
              ? 'text-blue-600 font-semibold'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${post.userLiked ? 'fill-blue-600' : ''}`} />
          <span className="text-sm">M'agrada</span>
        </button>

        <button
          onClick={() => onToggleComments(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Comentar</span>
        </button>

        <div className="relative flex-1" ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">Compartir</span>
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {/* Copiar enllaç */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Enllaç copiat!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar enllaç
                  </>
                )}
              </button>

              <div className="border-t border-gray-100 my-1" />

              {/* Twitter/X */}
              <button
                onClick={() => handleShareTo('twitter')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Compartir a X
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => handleShareTo('linkedin')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Compartir a LinkedIn
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShareTo('whatsapp')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
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
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
          {/* Existing Comments */}
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 mb-4">
              <Avatar src={comment.avatar} name={comment.user} size="sm" />

              <div className="flex-1">
                <div className="bg-white rounded-xl px-4 py-2.5 border border-gray-100">
                  <p className="text-[13px] font-semibold text-gray-800">
                    {comment.user}
                  </p>
                  <p className="text-[14px] text-gray-700 mt-1 leading-relaxed">
                    {comment.content}
                  </p>
                </div>

                <div className="flex gap-4 mt-1.5 pl-3 text-xs text-gray-500">
                  <button
                    onClick={() => onCommentLike(post.id, comment.id)}
                    className={`hover:text-blue-500 transition-colors ${
                      comment.userLiked ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    M'agrada {comment.likes > 0 && `(${comment.likes})`}
                  </button>
                  <button className="hover:text-blue-500 transition-colors">
                    Respondre
                  </button>
                  <span>{comment.time}</span>
                </div>
              </div>
            </div>
          ))}

          {/* New Comment Input */}
          <div className="flex gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              <User className="w-4 h-4" />
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Escriu un comentari..."
                className="w-full px-4 py-2 pr-10 rounded-full border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                  newComment.trim()
                    ? 'text-blue-500 hover:bg-blue-50'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
