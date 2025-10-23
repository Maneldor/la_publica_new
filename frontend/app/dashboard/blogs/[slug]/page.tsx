'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageTemplate } from '../../../../components/ui/PageTemplate';

// Interfaces
interface Author {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  blogCount: number;
  followers: number;
  following: number;
  isFollowing: boolean;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  coverImage: string;
  category: string;
  categoryColor: string;
  tags: string[];
  authorId: number;
  publishedAt: Date;
  updatedAt: Date;
  readTime: number;
  views: number;
  comments: number;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  featured: boolean;
}

interface Comment {
  id: number;
  authorId: number;
  content: string;
  publishedAt: Date;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
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
];

// Sample data - Blog posts
const sampleBlogs: BlogPost[] = [
  {
    id: 1,
    slug: 'protocols-teletreball-funcionaris-publics',
    title: 'Protocols de teletreball per a funcionaris públics en l\'era post-pandèmia',
    subtitle: 'Una reflexió sobre com adaptar-nos als nous models de treball i mantenir l\'eficiència en el sector públic',
    content: `
      <p>La pandèmia de COVID-19 ha marcat un abans i un després en la manera com treballem...</p>
      <h2>Els reptes del teletreball en l'administració pública</h2>
      <p>Implementar el teletreball en el sector públic presenta desafiaments únics...</p>
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
    content: `
      <p>La transformació digital dels serveis municipals és un dels reptes més importants que afronten les administracions locals...</p>
      <h2>Els beneficis de la digitalització</h2>
      <p>La digitalització permet millorar l'eficiència, reduir costos i oferir millors serveis als ciutadans...</p>
      <h2>Reptes a superar</h2>
      <p>Malgrat els beneficis, hi ha diversos reptes que cal afrontar...</p>
    `,
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
    content: `
      <p>La transparència i la participació ciutadana són pilars fonamentals de la democràcia moderna...</p>
      <h2>Plataformes de participació</h2>
      <p>Les noves tecnologies ofereixen oportunitats sense precedents per involucrar els ciutadans...</p>
    `,
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
  },
  {
    id: 4,
    slug: 'sostenibilitat-urbana-smart-cities',
    title: 'Sostenibilitat urbana i smart cities: el futur de les nostres ciutats',
    subtitle: 'Com les tecnologies intel·ligents poden ajudar a crear ciutats més verdes i eficients',
    content: `
      <p>Les smart cities representen el futur de la vida urbana, combinant tecnologia i sostenibilitat...</p>
      <h2>Tecnologies per a ciutats intel·ligents</h2>
      <p>Des de sensors IoT fins a sistemes de gestió intel·ligent del trànsit...</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&h=400&fit=crop',
    category: 'Tecnologia',
    categoryColor: '#6366f1',
    tags: ['sostenibilitat', 'smart-cities', 'medi-ambient', 'innovació'],
    authorId: 2,
    publishedAt: new Date('2024-10-12T16:45:00'),
    updatedAt: new Date('2024-10-12T16:45:00'),
    readTime: 7,
    views: 756,
    comments: 28,
    likes: 156,
    isLiked: false,
    isSaved: false,
    featured: false
  },
  {
    id: 5,
    slug: 'cultura-digital-administracio',
    title: 'Cultura digital en l\'administració: canvi de mentalitat vs. canvi tecnològic',
    subtitle: 'Per què la transformació digital requereix primer un canvi cultural profund',
    content: `
      <p>La transformació digital no és només una qüestió de tecnologia, sinó sobretot de cultura organitzacional...</p>
      <h2>El factor humà en la transformació digital</h2>
      <p>Les persones són el centre de qualsevol procés de canvi exitós...</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    category: 'Cultura',
    categoryColor: '#f59e0b',
    tags: ['cultura-digital', 'transformació', 'mentalitat', 'administració'],
    authorId: 1,
    publishedAt: new Date('2024-10-11T09:30:00'),
    updatedAt: new Date('2024-10-11T09:30:00'),
    readTime: 5,
    views: 623,
    comments: 19,
    likes: 78,
    isLiked: false,
    isSaved: false,
    featured: false
  },
  {
    id: 6,
    slug: 'gestio-recursos-humans-sector-public',
    title: 'Gestió de recursos humans en el sector públic: noves estratègies per al talent',
    subtitle: 'Estratègies innovadores per atreure i retenir talent en l\'administració pública',
    content: `
      <p>La gestió del talent en el sector públic afronta reptes únics que requereixen solucions innovadores...</p>
      <h2>Atreure nou talent</h2>
      <p>Com competir amb el sector privat per atreure els millors professionals...</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
    category: 'Gestió Pública',
    categoryColor: '#10b981',
    tags: ['recursos-humans', 'talent', 'estratègies', 'administració'],
    authorId: 2,
    publishedAt: new Date('2024-10-10T11:20:00'),
    updatedAt: new Date('2024-10-10T11:20:00'),
    readTime: 9,
    views: 892,
    comments: 35,
    likes: 145,
    isLiked: true,
    isSaved: true,
    featured: false
  }
];

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
  }
];

// Related blogs
const relatedBlogs = [
  {
    id: 2,
    slug: 'digitalitzacio-serveis-municipals',
    title: 'La digitalització dels serveis municipals: reptes i oportunitats',
    excerpt: 'Anàlisi dels processos de transformació digital en administracions locals catalanes...',
    coverImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop',
    readTime: 6,
    publishedAt: new Date('2024-10-14T14:30:00')
  }
];

export default function BlogSinglePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize blog data
  useEffect(() => {
    const foundBlog = sampleBlogs.find(b => b.slug === slug);
    if (foundBlog) {
      setBlog(foundBlog);
      const foundAuthor = sampleAuthors.find(a => a.id === foundBlog.authorId);
      setAuthor(foundAuthor || null);

      // Increment views (simulated)
      foundBlog.views += 1;
    }
  }, [slug]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) {
      return `fa ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (days < 7) {
      return `fa ${days} dia${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('ca-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const handleLike = () => {
    if (!blog) return;
    setBlog(prev => prev ? {
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
    } : null);
  };

  const handleSave = () => {
    if (!blog) return;
    setBlog(prev => prev ? {
      ...prev,
      isSaved: !prev.isSaved
    } : null);
  };

  const handleFollow = () => {
    if (!author) return;
    setAuthor(prev => prev ? {
      ...prev,
      isFollowing: !prev.isFollowing,
      followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
    } : null);
  };

  // Stats data for PageTemplate
  const statsData = [
    { label: 'Visualitzacions', value: blog?.views.toString() || '0', trend: '+12%' },
    { label: 'Temps lectura', value: blog ? `${blog.readTime} min` : '0 min', trend: '' },
    { label: 'Comentaris', value: blog?.comments.toString() || '0', trend: `+${comments.length}` },
    { label: 'Likes', value: blog?.likes.toString() || '0', trend: blog?.isLiked ? '+1' : '' }
  ];

  if (!blog || !author) {
    return (
      <PageTemplate
        title="Blog"
        subtitle="Carregant article..."
        statsData={[]}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '18px',
          color: '#6c757d'
        }}>
          Carregant...
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Blog"
      subtitle="Article i discussió"
      statsData={statsData}
    >
      <div style={{
        padding: '0 24px 24px 24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#6c757d'
        }}>
          <button
            onClick={() => router.push('/dashboard/blogs')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Blogs
          </button>
          <span>›</span>
          <button
            onClick={() => router.push(`/dashboard/blogs?category=${encodeURIComponent(blog.category)}`)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {blog.category}
          </button>
          <span>›</span>
          <span style={{ fontWeight: '500', color: '#2c3e50' }}>
            {blog.title.length > 50 ? blog.title.substring(0, 50) + '...' : blog.title}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
          gap: '24px'
        }}>
          {/* Contenido principal */}
          <div>
            {/* Header del blog */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#2c3e50',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}>
                {blog.title}
              </h1>

              <p style={{
                fontSize: '18px',
                color: '#6c757d',
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                {blog.subtitle}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <img
                  src={author.avatar}
                  alt={author.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}>
                    {author.name}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginLeft: '8px'
                  }}>
                    • {formatTime(blog.publishedAt)} • {blog.readTime} min lectura
                  </span>
                </div>
              </div>

              <img
                src={blog.coverImage}
                alt={blog.title}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>

            {/* Article Content */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <div
                style={{
                  fontSize: '18px',
                  lineHeight: '1.8',
                  color: '#2c3e50'
                }}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>

            {/* Comments Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '20px'
              }}>
                💬 Comentaris ({comments.length})
              </h3>

              {comments.map(comment => {
                const commentAuthor = sampleAuthors.find(a => a.id === comment.authorId);
                return (
                  <div key={comment.id} style={{
                    borderBottom: '1px solid #f0f0f0',
                    paddingBottom: '20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '12px'
                    }}>
                      <img
                        src={commentAuthor?.avatar}
                        alt={commentAuthor?.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '500',
                          color: '#2c3e50',
                          marginBottom: '4px'
                        }}>
                          {commentAuthor?.name}
                        </div>
                        <p style={{
                          fontSize: '14px',
                          color: '#2c3e50',
                          lineHeight: '1.6',
                          marginBottom: '8px'
                        }}>
                          {comment.content}
                        </p>
                        <div style={{
                          fontSize: '12px',
                          color: '#6c757d'
                        }}>
                          {formatTime(comment.publishedAt)} • ❤️ {comment.likes} likes
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          {!isMobile && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              {/* Author sidebar */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '16px'
                }}>
                  ✍️ Sobre l'autor
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <img
                    src={author.avatar}
                    alt={author.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '12px'
                    }}
                  />
                  <h5 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '8px'
                  }}>
                    {author.name}
                  </h5>
                  <p style={{
                    fontSize: '13px',
                    color: '#6c757d',
                    lineHeight: '1.4',
                    marginBottom: '16px'
                  }}>
                    {author.bio}
                  </p>
                  <button
                    onClick={handleFollow}
                    style={{
                      backgroundColor: author.isFollowing ? '#e5e7eb' : '#3b82f6',
                      color: author.isFollowing ? '#6c757d' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    {author.isFollowing ? 'Deixar de seguir' : 'Seguir'}
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '16px'
                }}>
                  🏷️ Etiquetes
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {blog.tags.map((tag, index) => (
                    <button
                      key={index}
                      style={{
                        backgroundColor: '#f0f7ff',
                        color: '#3b82f6',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Articles */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginTop: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #f0f0f0'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '24px'
          }}>
            📚 Articles relacionats
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {relatedBlogs.map(relatedBlog => (
              <div
                key={relatedBlog.id}
                onClick={() => router.push(`/dashboard/blogs/${relatedBlog.slug}`)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.2s'
                }}
              >
                <img
                  src={relatedBlog.coverImage}
                  alt={relatedBlog.title}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ padding: '16px' }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '8px'
                  }}>
                    {relatedBlog.title}
                  </h4>
                  <p style={{
                    fontSize: '13px',
                    color: '#6c757d',
                    marginBottom: '8px'
                  }}>
                    {relatedBlog.excerpt}
                  </p>
                  <div style={{
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    {formatTime(relatedBlog.publishedAt)} • {relatedBlog.readTime} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}