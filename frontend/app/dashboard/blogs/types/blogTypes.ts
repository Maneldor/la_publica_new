// Interfaces y tipos para el sistema de blogs

export interface Author {
  id: number;
  name: string;
  avatar: string;
  role: string;
  department: string;
  expertise: string[];
  bio: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    email: string;
  };
  stats: {
    postsCount: number;
    followersCount: number;
    likesReceived: number;
  };
  isVerified: boolean;
  isFollowing: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: Author;
  category: string;
  tags: string[];
  coverImage: string;
  publishedAt: string;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
  isBookmarked: boolean;
  isLiked: boolean;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  count: number;
}

export interface StatsData {
  label: string;
  value: string;
  trend: string;
}

export interface BlogFilters {
  category: string;
  author: string;
  tags: string[];
  dateRange: string;
  status: string;
}

export interface PopularTag {
  name: string;
  count: number;
  trending: boolean;
}