'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FileText,
  Calendar,
  Tag,
  Clock,
  Heart,
  MessageCircle,
  Eye,
  Bookmark,
  Share2,
  MoreHorizontal,
  ArrowLeft,
  Loader2,
  User,
  ThumbsUp,
  Flag,
  Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Interfaces
interface Author {
  id: number
  name: string
  username: string
  avatar: string
  bio: string
  blogCount: number
  followers: number
  following: number
  isFollowing: boolean
  socialLinks: {
    twitter?: string
    linkedin?: string
    website?: string
  }
}

interface BlogPost {
  id: number
  slug: string
  title: string
  subtitle: string
  content: string
  coverImage: string
  category: string
  categoryColor: string
  tags: string[]
  authorId: number
  publishedAt: Date
  updatedAt: Date
  readTime: number
  views: number
  comments: number
  likes: number
  isLiked: boolean
  isSaved: boolean
  featured: boolean
}

interface Comment {
  id: number
  authorId: number
  content: string
  publishedAt: Date
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

// Sample data - Authors
const sampleAuthors: Author[] = [
  {
    id: 1,
    name: 'Joan Martín',
    username: 'joan_martin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    bio: 'Expert en transformació digital del sector públic. 15 anys d\'experiència en administració local.',
    blogCount: 12,
    followers: 245,
    following: 89,
    isFollowing: false,
    socialLinks: {
      twitter: 'https://twitter.com/joan_martin',
      linkedin: 'https://linkedin.com/in/joan-martin',
      website: 'https://joanmartin.cat'
    }
  },
  {
    id: 2,
    name: 'Maria González',
    username: 'maria_dev',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    bio: 'Desenvolupadora especialitzada en solucions tecnològiques per a administracions públiques.',
    blogCount: 8,
    followers: 567,
    following: 123,
    isFollowing: true,
    socialLinks: {
      twitter: 'https://twitter.com/maria_dev',
      linkedin: 'https://linkedin.com/in/maria-gonzalez'
    }
  }
]

// Sample data - Blog posts
const sampleBlogs: BlogPost[] = [
  {
    id: 1,
    slug: 'protocols-teletreball-funcionaris-publics',
    title: 'Protocols de teletreball per a funcionaris públics en l\'era post-pandèmia',
    subtitle: 'Una reflexió sobre com adaptar-nos als nous models de treball i mantenir l\'eficiència en el sector públic',
    content: `
      <p>La pandèmia de COVID-19 ha marcat un abans i un després en la manera com treballem. Per al sector públic, aquesta transformació ha suposat un repte sense precedents que ens ha obligat a repensar els nostres models organitzatius.</p>

      <h2>Els reptes del teletreball en l'administració pública</h2>
      <p>Implementar el teletreball en el sector públic presenta desafiaments únics que cal abordar amb una estratègia clara i ben definida. Entre els principals reptes trobem:</p>
      <ul>
        <li>La necessitat de garantir la seguretat de les dades dels ciutadans</li>
        <li>L'adaptació dels sistemes informàtics a l'accés remot</li>
        <li>La gestió d'equips distribuïts geogràficament</li>
        <li>El manteniment de la qualitat del servei públic</li>
      </ul>

      <h2>Protocols recomanats</h2>
      <p>Per assegurar una implementació exitosa del teletreball, és fonamental establir protocols clars que incloguin:</p>
      <ol>
        <li>Definició clara d'horaris i disponibilitat</li>
        <li>Eines de comunicació i col·laboració estandarditzades</li>
        <li>Mecanismes de seguiment i avaluació del rendiment</li>
        <li>Formació contínua en competències digitals</li>
      </ol>

      <blockquote>
        "El teletreball no és només una solució d'emergència, sinó una oportunitat per modernitzar l'administració pública i millorar la qualitat de vida dels treballadors."
      </blockquote>

      <h2>Conclusions</h2>
      <p>La transformació cap al teletreball en l'administració pública és un procés que requereix temps, recursos i, sobretot, un canvi cultural profund. Les organitzacions que aconsegueixin adaptar-se amb èxit estaran millor preparades per afrontar els reptes del futur.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=600&fit=crop',
    category: 'Gestió Pública',
    categoryColor: '#f59e0b',
    tags: ['teletreball', 'protocols', 'gestió', 'funcionaris', 'transformació-digital'],
    authorId: 1,
    publishedAt: new Date('2024-10-15T08:00:00'),
    updatedAt: new Date('2024-10-15T08:00:00'),
    readTime: 8,
    views: 1234,
    comments: 45,
    likes: 123,
    isLiked: false,
    isSaved: false,
    featured: true
  },
  {
    id: 2,
    slug: 'digitalitzacio-serveis-municipals',
    title: 'La digitalització dels serveis municipals: reptes i oportunitats',
    subtitle: 'Anàlisi dels processos de transformació digital en administracions locals catalanes',
    content: `<p>La transformació digital dels serveis municipals és un dels reptes més importants...</p>`,
    coverImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
    category: 'Tecnologia',
    categoryColor: '#6366f1',
    tags: ['digitalització', 'municipis', 'tecnologia', 'innovació'],
    authorId: 2,
    publishedAt: new Date('2024-10-14T14:30:00'),
    updatedAt: new Date('2024-10-14T14:30:00'),
    readTime: 6,
    views: 987,
    comments: 32,
    likes: 89,
    isLiked: true,
    isSaved: false,
    featured: false
  },
  {
    id: 3,
    slug: 'transparencia-participacio-ciutadana',
    title: 'Transparència i participació ciutadana: eines per a una democràcia més forta',
    subtitle: 'Explorant les noves plataformes digitals que permeten una major participació dels ciutadans',
    content: `<p>La transparència i la participació ciutadana són pilars fonamentals...</p>`,
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
    category: 'Política',
    categoryColor: '#3b82f6',
    tags: ['transparència', 'participació', 'democràcia', 'ciutadania'],
    authorId: 1,
    publishedAt: new Date('2024-10-13T10:15:00'),
    updatedAt: new Date('2024-10-13T10:15:00'),
    readTime: 10,
    views: 1567,
    comments: 67,
    likes: 234,
    isLiked: false,
    isSaved: true,
    featured: true
  }
]

// Sample comments
const sampleComments: Comment[] = [
  {
    id: 1,
    authorId: 2,
    content: 'Excellent article! La implementació de protocols de teletreball és fonamental per modernitzar l\'administració pública.',
    publishedAt: new Date('2024-10-15T10:30:00'),
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: 2,
        authorId: 1,
        content: 'Gràcies Maria! Efectivament, els indicadors són clau.',
        publishedAt: new Date('2024-10-15T11:15:00'),
        likes: 8,
        isLiked: false
      }
    ]
  },
  {
    id: 3,
    authorId: 1,
    content: 'Molt interessant la perspectiva sobre el canvi cultural. Crec que aquest és el punt més important de tot l\'article.',
    publishedAt: new Date('2024-10-16T09:00:00'),
    likes: 5,
    isLiked: true
  }
]

// Related blogs
const relatedBlogs = [
  {
    id: 2,
    slug: 'digitalitzacio-serveis-municipals',
    title: 'La digitalització dels serveis municipals',
    coverImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
    readTime: 6,
    publishedAt: new Date('2024-10-14T14:30:00')
  },
  {
    id: 3,
    slug: 'transparencia-participacio-ciutadana',
    title: 'Transparència i participació ciutadana',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=200&fit=crop',
    readTime: 10,
    publishedAt: new Date('2024-10-13T10:15:00')
  }
]

// Popular tags
const popularTags = [
  { name: 'transparència', count: 45 },
  { name: 'innovació', count: 32 },
  { name: 'digitalització', count: 28 },
  { name: 'gestió', count: 24 },
  { name: 'participació', count: 21 },
]

export default function BlogSinglePage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [author, setAuthor] = useState<Author | null>(null)
  const [comments, setComments] = useState<Comment[]>(sampleComments)
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Initialize blog data
  useEffect(() => {
    setIsLoading(true)
    const foundBlog = sampleBlogs.find(b => b.slug === slug)
    if (foundBlog) {
      setBlog(foundBlog)
      const foundAuthor = sampleAuthors.find(a => a.id === foundBlog.authorId)
      setAuthor(foundAuthor || null)
    }
    setIsLoading(false)
  }, [slug])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatCommentDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 24) return `fa ${hours}h`
    if (days < 7) return `fa ${days} dies`
    return formatShortDate(date)
  }

  const handleLike = () => {
    if (!blog) return
    setBlog(prev => prev ? {
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
    } : null)
  }

  const handleSave = () => {
    if (!blog) return
    setBlog(prev => prev ? {
      ...prev,
      isSaved: !prev.isSaved
    } : null)
  }

  const handleFollow = () => {
    if (!author) return
    setAuthor(prev => prev ? {
      ...prev,
      isFollowing: !prev.isFollowing,
      followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
    } : null)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregant article...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (!blog || !author) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article no trobat</h2>
          <p className="text-gray-600 mb-6">L'article que busques no existeix o ha estat eliminat.</p>
          <button
            onClick={() => router.push('/dashboard/blogs')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tornar als blogs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header with cover */}
      <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden">
        {/* Cover image */}
        {blog.coverImage ? (
          <Image
            src={blog.coverImage}
            alt=""
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Category badge - top left */}
        <div className="absolute top-4 left-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full text-white"
            style={{ backgroundColor: blog.categoryColor }}
          >
            <Tag className="w-4 h-4" />
            {blog.category}
          </span>
        </div>

        {/* Actions - top right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              blog.isSaved
                ? 'bg-amber-500 text-white'
                : 'bg-white/20 text-white hover:bg-white/40'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${blog.isSaved ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    Desar
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notificacions
                  </button>
                  <hr className="my-1" />
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    Reportar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content - bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {blog.title}
            </h1>

            {/* Meta info */}
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              {/* Author */}
              <Link href={`/dashboard/membres/${author.username}`} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50">
                  {author.avatar ? (
                    <Image
                      src={author.avatar}
                      alt=""
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                      {author.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium drop-shadow">{author.name}</p>
                  <p className="text-white/70 text-sm">@{author.username}</p>
                </div>
              </Link>

              <span className="text-white/50 hidden sm:inline">·</span>

              <span className="text-white/80 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(blog.publishedAt)}
              </span>

              <span className="text-white/50 hidden sm:inline">·</span>

              <span className="text-white/80 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {blog.readTime} min lectura
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content with grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Article */}
          <Card>
            <CardContent className="p-6 md:p-8">
              {/* Subtitle */}
              {blog.subtitle && (
                <p className="text-lg text-gray-600 mb-6 pb-6 border-b border-gray-100 italic">
                  {blog.subtitle}
                </p>
              )}

              {/* Content */}
              <article
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-800 prose-li:text-gray-800 prose-strong:text-gray-900 prose-a:text-indigo-600 prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-gray-700 prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {blog.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/dashboard/blogs?tag=${tag}`}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        blog.isLiked
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${blog.isLiked ? 'fill-current' : ''}`} />
                      {blog.likes}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      {blog.comments}
                    </button>
                    <span className="flex items-center gap-2 text-gray-500 text-sm">
                      <Eye className="w-4 h-4" />
                      {blog.views} visualitzacions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      className={`p-2 rounded-lg transition-colors ${
                        blog.isSaved
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${blog.isSaved ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comentaris ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* New comment form */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                    U
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escriu un comentari..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Publicar
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {comments.map((comment) => {
                  const commentAuthor = sampleAuthors.find(a => a.id === comment.authorId)
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {commentAuthor?.avatar ? (
                          <Image
                            src={commentAuthor.avatar}
                            alt=""
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                            {commentAuthor?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{commentAuthor?.name || 'Usuari'}</span>
                          <span className="text-sm text-gray-400">{formatCommentDate(comment.publishedAt)}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{comment.content}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <button className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                            Respondre
                          </button>
                          <button className={`text-sm transition-colors flex items-center gap-1 ${
                            comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-600'
                          }`}>
                            <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                            {comment.likes}
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                            {comment.replies.map((reply) => {
                              const replyAuthor = sampleAuthors.find(a => a.id === reply.authorId)
                              return (
                                <div key={reply.id} className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    {replyAuthor?.avatar ? (
                                      <Image
                                        src={replyAuthor.avatar}
                                        alt=""
                                        width={32}
                                        height={32}
                                        className="object-cover w-full h-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xs font-bold">
                                        {replyAuthor?.name?.charAt(0) || 'U'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 text-sm">{replyAuthor?.name || 'Usuari'}</span>
                                      <span className="text-xs text-gray-400">{formatCommentDate(reply.publishedAt)}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-0.5">{reply.content}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Author card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sobre l'autor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                  {author.avatar ? (
                    <Image
                      src={author.avatar}
                      alt=""
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-bold">
                      {author.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mt-3">{author.name}</h3>
                <p className="text-sm text-gray-500">@{author.username}</p>
                {author.bio && (
                  <p className="text-sm text-gray-600 mt-2">{author.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span><strong className="text-gray-900">{author.blogCount}</strong> articles</span>
                  <span><strong className="text-gray-900">{author.followers}</strong> seguidors</span>
                </div>
                <button
                  onClick={handleFollow}
                  className={`mt-4 w-full py-2 text-sm font-medium rounded-lg transition-colors ${
                    author.isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {author.isFollowing ? 'Seguint' : 'Seguir'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Related articles card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Articles relacionats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedBlogs.map((related) => (
                <Link
                  key={related.id}
                  href={`/dashboard/blogs/${related.slug}`}
                  className="flex gap-3 group"
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden flex-shrink-0">
                    {related.coverImage && (
                      <Image
                        src={related.coverImage}
                        alt=""
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {related.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {related.readTime} min
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Popular tags card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tags populars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Link
                    key={tag.name}
                    href={`/dashboard/blogs?tag=${tag.name}`}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                  >
                    {tag.name}
                    <span className="ml-1 text-gray-400">({tag.count})</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
