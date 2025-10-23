import { Author, BlogPost, BlogCategory, PopularTag, StatsData } from '../types/blogTypes';

// Datos de ejemplo - Autores
export const sampleAuthors: Author[] = [
  {
    id: 1,
    name: 'Joan Martín',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    role: 'Director de Modernització',
    department: 'Departament de Presidència',
    expertise: ['Transformació Digital', 'Gestió Pública', 'Innovació'],
    bio: 'Expert en transformació digital del sector públic amb més de 15 anys d\'experiència en modernització administrativa.',
    socialLinks: {
      twitter: '@joan_martin_cat',
      linkedin: 'linkedin.com/in/joanmartin',
      email: 'joan.martin@gencat.cat'
    },
    stats: {
      postsCount: 12,
      followersCount: 245,
      likesReceived: 1567
    },
    blogCount: 2,
    isVerified: true,
    isFollowing: false
  },
  {
    id: 2,
    name: 'Maria González',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    role: 'Desenvolupadora Senior',
    department: 'Departament de Tecnologia',
    expertise: ['Desenvolupament Web', 'UX/UI', 'Frontend'],
    bio: 'Desenvolupadora especialitzada en aplicacions web per a l\'administració pública, amb focus en experiència d\'usuari.',
    socialLinks: {
      linkedin: 'linkedin.com/in/mariagonzalez',
      email: 'maria.gonzalez@gencat.cat'
    },
    stats: {
      postsCount: 8,
      followersCount: 567,
      likesReceived: 892
    },
    blogCount: 2,
    isVerified: true,
    isFollowing: true
  },
  {
    id: 3,
    name: 'Laura Puig',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    role: 'Responsable de Transparència',
    department: 'Secretaria de Transparència',
    expertise: ['Transparència', 'Participació Ciutadana', 'Govern Obert'],
    bio: 'Impulsora de polítiques de transparència i participació ciutadana en l\'administració catalana.',
    socialLinks: {
      twitter: '@laura_puig_transparencia',
      linkedin: 'linkedin.com/in/laurapuig',
      email: 'laura.puig@gencat.cat'
    },
    stats: {
      postsCount: 15,
      followersCount: 432,
      likesReceived: 2134
    },
    blogCount: 1,
    isVerified: true,
    isFollowing: true
  },
  {
    id: 4,
    name: 'Pere Camps',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    role: 'Analista de Sostenibilitat',
    department: 'Departament d\'Acció Climàtica',
    expertise: ['Sostenibilitat', 'Smart Cities', 'Medi Ambient'],
    bio: 'Especialista en sostenibilitat urbana i implementació de tecnologies verdes en ciutats intel·ligents.',
    socialLinks: {
      twitter: '@pere_camps_sostenible',
      email: 'pere.camps@gencat.cat'
    },
    stats: {
      postsCount: 6,
      followersCount: 189,
      likesReceived: 456
    },
    blogCount: 1,
    isVerified: false,
    isFollowing: false
  }
];

// Datos de ejemplo - Categorías
export const blogCategories: BlogCategory[] = [
  {
    id: 'politica',
    name: 'Política',
    description: 'Anàlisi i reflexions sobre polítiques públiques',
    count: 15,
    color: '#3b82f6',
    icon: '🏛️'
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    description: 'Innovació i transformació digital',
    count: 23,
    color: '#10b981',
    icon: '💻'
  },
  {
    id: 'gestio',
    name: 'Gestió Pública',
    description: 'Estratègies de gestió i administració',
    count: 12,
    color: '#f59e0b',
    icon: '📊'
  },
  {
    id: 'cultura',
    name: 'Cultura',
    description: 'Cultura digital i canvi organitzacional',
    count: 8,
    color: '#8b5cf6',
    icon: '🎭'
  },
  {
    id: 'esports',
    name: 'Esports',
    description: 'Polítiques esportives i promoció de l\'activitat física',
    count: 5,
    color: '#ef4444',
    icon: '⚽'
  },
  {
    id: 'altres',
    name: 'Altres',
    description: 'Temes diversos d\'interès general',
    count: 7,
    color: '#6b7280',
    icon: '📝'
  }
];

// Datos de ejemplo - Blogs
export const sampleBlogs: BlogPost[] = [
  {
    id: 1,
    slug: 'protocols-teletreball-funcionaris-publics',
    title: 'Protocols de teletreball per a funcionaris públics en l\'era post-pandèmia',
    excerpt: 'Una reflexió sobre com adaptar-nos als nous models de treball i mantenir l\'eficiència en el sector públic...',
    content: 'Contingut complet del blog...',
    author: sampleAuthors[0],
    category: 'Gestió Pública',
    categoryColor: '#10b981',
    tags: ['teletreball', 'protocols', 'gestió', 'funcionaris'],
    coverImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
    publishedAt: '2024-10-15T08:00:00Z',
    readTime: 8,
    views: 1234,
    likes: 123,
    comments: 45,
    isBookmarked: false,
    isLiked: false,
    status: 'published',
    featured: true
  },
  {
    id: 2,
    slug: 'digitalitzacio-serveis-municipals',
    title: 'La digitalització dels serveis municipals: reptes i oportunitats',
    excerpt: 'Anàlisi dels processos de transformació digital en administracions locals catalanes...',
    content: 'Contingut complet del blog...',
    author: sampleAuthors[1],
    category: 'Tecnologia',
    categoryColor: '#6366f1',
    tags: ['digitalització', 'municipis', 'tecnologia', 'innovació'],
    coverImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
    publishedAt: '2024-10-14T14:30:00Z',
    readTime: 6,
    views: 987,
    likes: 89,
    comments: 32,
    isBookmarked: false,
    isLiked: true,
    status: 'published',
    featured: false
  },
  {
    id: 3,
    slug: 'transparencia-participacio-ciutadana',
    title: 'Transparència i participació ciutadana: eines per a una democràcia més forta',
    excerpt: 'Explorant les noves plataformes digitals que permeten una major participació dels ciutadans...',
    content: 'Contingut complet del blog...',
    author: sampleAuthors[2],
    category: 'Política',
    categoryColor: '#3b82f6',
    tags: ['transparència', 'participació', 'democràcia', 'ciutadania'],
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
    publishedAt: '2024-10-13T10:15:00Z',
    readTime: 10,
    views: 1567,
    likes: 234,
    comments: 67,
    isBookmarked: true,
    isLiked: false,
    status: 'published',
    featured: true
  },
  {
    id: 4,
    slug: 'sostenibilitat-urbana-smart-cities',
    title: 'Sostenibilitat urbana i smart cities: el futur de les nostres ciutats',
    excerpt: 'Com les tecnologies intel·ligents poden ajudar a crear ciutats més verdes i eficients...',
    content: 'Contingut complet del blog...',
    author: sampleAuthors[3],
    category: 'Tecnologia',
    categoryColor: '#6366f1',
    tags: ['sostenibilitat', 'smart-cities', 'medi-ambient', 'innovació'],
    coverImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&h=400&fit=crop',
    publishedAt: '2024-10-12T16:45:00Z',
    readTime: 7,
    views: 756,
    likes: 156,
    comments: 28,
    isBookmarked: false,
    isLiked: false,
    status: 'published',
    featured: false
  },
  {
    id: 5,
    slug: 'cultura-digital-administracio',
    title: 'Cultura digital en l\'administració: canvi de mentalitat vs. canvi tecnològic',
    excerpt: 'Per què la transformació digital requereix primer un canvi cultural profund...',
    content: 'Contingut complet del blog...',
    author: sampleAuthors[0],
    category: 'Cultura',
    categoryColor: '#f59e0b',
    tags: ['cultura-digital', 'transformació', 'mentalitat', 'administració'],
    coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    publishedAt: '2024-10-11T09:30:00Z',
    readTime: 5,
    views: 623,
    likes: 78,
    comments: 19,
    isBookmarked: false,
    isLiked: false,
    status: 'published',
    featured: false
  },
  {
    id: 6,
    slug: 'gestio-recursos-humans-sector-public',
    title: 'Gestió de recursos humans en el sector públic: noves estratègies per al talent',
    excerpt: 'Estratègies innovadores per atreure i retenir talent en l\'administració pública...',
    content: 'Contingut complet del blog...',
    author: sampleAuthors[1],
    category: 'Gestió Pública',
    categoryColor: '#10b981',
    tags: ['recursos-humans', 'talent', 'estratègies', 'administració'],
    coverImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
    publishedAt: '2024-10-10T11:20:00Z',
    readTime: 9,
    views: 892,
    likes: 145,
    comments: 35,
    isBookmarked: true,
    isLiked: true,
    status: 'published',
    featured: false
  }
];

// Tags populares
export const popularTags: PopularTag[] = [
  { name: 'transparència', count: 45, trending: true },
  { name: 'innovació', count: 32, trending: true },
  { name: 'digitalització', count: 28, trending: false },
  { name: 'gestió', count: 24, trending: false },
  { name: 'participació', count: 21, trending: true },
  { name: 'sostenibilitat', count: 18, trending: false },
  { name: 'tecnologia', count: 15, trending: false },
  { name: 'administració', count: 12, trending: false }
];

// Datos de estadísticas
export const statsData: StatsData[] = [
  { label: 'Total Articles', value: '156', trend: '+12%' },
  { label: 'Els Meus Articles', value: '8', trend: '+2' },
  { label: 'Nous Avui', value: '7', trend: '+3' },
  { label: 'Visualitzacions Total', value: '12.4K', trend: '+18%' }
];