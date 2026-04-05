import { api, ApiError } from '@/lib/api/client';
import type { User, Role, ApiResponse, PaginatedResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      return await api.post<AuthResponse>('/auth/login', credentials);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get current user');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      return await api.post<AuthResponse>('/auth/refresh');
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
};

export const userService = {
  async getUsers(filters?: {
    role?: Role;
    franchiseeId?: string;
    teamId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.set('role', filters.role);
      if (filters?.franchiseeId) params.set('franchiseeId', filters.franchiseeId);
      if (filters?.teamId) params.set('teamId', filters.teamId);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));

      const query = params.toString();
      const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
        `/users${query ? `?${query}` : ''}`
      );
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch users');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'User not found');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.post<ApiResponse<User>>('/users', userData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create user');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.patch<ApiResponse<User>>(`/users/${id}`, userData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update user');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/users/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
};
