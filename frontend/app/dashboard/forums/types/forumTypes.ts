// Interfaces y tipos para el sistema de fórums

export interface Attachment {
  name: string;
  type: 'pdf' | 'excel' | 'word' | 'image';
  size: string;
}

export interface Post {
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
  attachments: Attachment[];
}

export interface StatsData {
  label: string;
  value: string;
  trend: string;
}

export interface ForumFilters {
  category: string;
  tags: string;
  author: string;
  hasAttachments: boolean;
}

export interface TabCounts {
  tots: number;
  meus: number;
  seguits: number;
  populars: number;
}