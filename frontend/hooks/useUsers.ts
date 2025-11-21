'use client';

import useSWR from 'swr';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  profileImage?: string | null;
  department?: string | null;
  position?: string | null;
  createdAt: Date | string;
  stats?: {
    assignedTasks: number;
    createdTasks: number;
  };
}

export interface UsersFilters {
  search?: string;
  active?: boolean;
  role?: string;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
  };
  total: number;
}

const fetcher = async (url: string): Promise<UsersResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

export function useUsers(filters?: UsersFilters) {
  const query = new URLSearchParams();

  if (filters?.search) {
    query.append('search', filters.search);
  }
  if (filters?.active !== undefined) {
    query.append('active', filters.active.toString());
  }
  if (filters?.role) {
    query.append('role', filters.role);
  }

  const url = `/api/admin/users${query.toString() ? `?${query.toString()}` : ''}`;

  const { data, error, mutate, isLoading } = useSWR<UsersResponse>(url, fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
    dedupingInterval: 10000, // Cache for 10 seconds
  });

  const users = data?.data?.users || [];
  const activeUsers = users.filter(user => user.isActive);
  const inactiveUsers = users.filter(user => !user.isActive);

  // Transform users for task assignment (simplified format)
  const usersForAssignment = activeUsers.map(user => ({
    id: user.id,
    name: user.name || user.email,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    department: user.department,
    position: user.position
  }));

  return {
    users,
    activeUsers,
    inactiveUsers,
    usersForAssignment,
    loading: isLoading,
    error,
    mutate,
    total: data?.total || 0
  };
}

export function useUserById(userId: string | undefined) {
  const url = userId ? `/api/admin/users/${userId}` : null;

  const { data, error, mutate, isLoading } = useSWR<{
    success: boolean;
    data: User;
  }>(url, fetcher, {
    refreshInterval: 0, // No auto-refresh for single user
    revalidateOnFocus: false,
  });

  return {
    user: data?.data,
    loading: isLoading,
    error,
    mutate
  };
}

// Hook especializado para selección de usuarios en formularios
export function useUserSelection(initialUsers: string[] = []) {
  const { usersForAssignment, loading } = useUsers({ active: true });

  const getSelectedUsers = (userIds: string[]) => {
    return usersForAssignment.filter(user => userIds.includes(user.id));
  };

  const getUserById = (userId: string) => {
    return usersForAssignment.find(user => user.id === userId);
  };

  const searchUsers = (query: string) => {
    if (!query.trim()) return usersForAssignment;

    const searchTerm = query.toLowerCase();
    return usersForAssignment.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.department && user.department.toLowerCase().includes(searchTerm)) ||
      (user.position && user.position.toLowerCase().includes(searchTerm))
    );
  };

  return {
    users: usersForAssignment,
    loading,
    getSelectedUsers,
    getUserById,
    searchUsers
  };
}