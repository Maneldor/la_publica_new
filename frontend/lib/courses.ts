import api from './api';

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  slug: string;
  instructor: string;
  institution: string;
  instructorEmail?: string;
  institutionLogo?: string;
  category: string;
  subcategory?: string;
  tags?: string;
  level: string;
  mode: string;
  duration: number;
  language: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  enrollmentDeadline?: string;
  availableSlots?: number;
  totalSlots?: number;
  status: string;
  isHighlighted: boolean;
  isFeatured: boolean;
  isNew: boolean;
  coverImage?: string;
  promoVideo?: string;
  materials?: string;
  viewsCount: number;
  enrollmentCount: number;
  completionRate?: number;
  averageRating?: number;
  totalRatings: number;
  creatorId: string;
  comunidadSlug?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    email: string;
    employee?: {
      firstName: string;
      lastName: string;
    };
  };
  _count?: {
    enrollments: number;
    ratings: number;
    reviews: number;
  };
}

export interface CoursesFilters {
  category?: string;
  level?: string;
  mode?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  highlighted?: boolean;
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const coursesService = {
  // Obtener lista de cursos con filtros
  async getCourses(filters: CoursesFilters = {}): Promise<CoursesResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/courses?${params.toString()}`);
    return response.data;
  },

  // Obtener curso por ID
  async getCourse(id: string): Promise<{ success: boolean; data: Course }> {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // Inscribirse a un curso
  async enrollCourse(courseId: string, userId?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/courses/${courseId}/enroll`, { userId });
    return response.data;
  },

  // Obtener estadísticas por categoría
  async getCategoryStats(): Promise<{ success: boolean; data: Array<{ category: string; _count: { category: number } }> }> {
    const response = await api.get('/courses/categories/stats');
    return response.data;
  }
};

export default coursesService;