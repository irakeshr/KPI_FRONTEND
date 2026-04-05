import { api, ApiError } from '@/lib/api/client';
import type { Target, Period, ApiResponse, PaginatedResponse } from '@/types';
import type { PeriodType } from '@/types';

interface TargetFilters {
  executiveId?: string;
  kpiId?: string;
  periodType?: PeriodType;
  periodStart?: string;
  periodEnd?: string;
  teamId?: string;
}

interface TargetRequest {
  executiveId: string;
  kpiId: string;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  targetValue: number;
  benchmark?: number;
  ceiling?: number;
  teamTarget?: number;
}

export const targetService = {
  async getTargets(filters?: TargetFilters, pagination?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<Target>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.executiveId) params.set('executiveId', filters.executiveId);
        if (filters.kpiId) params.set('kpiId', filters.kpiId);
        if (filters.periodType) params.set('periodType', filters.periodType);
        if (filters.periodStart) params.set('periodStart', filters.periodStart);
        if (filters.periodEnd) params.set('periodEnd', filters.periodEnd);
        if (filters.teamId) params.set('teamId', filters.teamId);
      }
      
      if (pagination) {
        if (pagination.page) params.set('page', String(pagination.page));
        if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize));
      }

      const query = params.toString();
      const response = await api.get<ApiResponse<PaginatedResponse<Target>>>(
        `/targets${query ? `?${query}` : ''}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch targets');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async getTargetById(id: string): Promise<Target> {
    try {
      const response = await api.get<ApiResponse<Target>>(`/targets/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Target not found');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async createTarget(targetData: TargetRequest): Promise<Target> {
    try {
      const response = await api.post<ApiResponse<Target>>('/targets', targetData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create target');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async updateTarget(id: string, targetData: Partial<TargetRequest>): Promise<Target> {
    try {
      const response = await api.patch<ApiResponse<Target>>(`/targets/${id}`, targetData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update target');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async deleteTarget(id: string): Promise<void> {
    try {
      const response = await api.delete<ApiResponse<void>>(`/targets/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete target');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async requestTargetRevision(id: string, newValue: number, reason: string): Promise<Target> {
    try {
      const response = await api.post<ApiResponse<Target>>(`/targets/${id}/revision`, {
        newValue,
        reason,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to request revision');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async approveTarget(id: string, approved: boolean, note?: string): Promise<Target> {
    try {
      const response = await api.post<ApiResponse<Target>>(`/targets/${id}/approve`, {
        approved,
        note,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to approve target');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
};

export const periodService = {
  async getPeriods(filters?: { type?: PeriodType; isActive?: boolean }): Promise<Period[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.set('type', filters.type);
      if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));

      const query = params.toString();
      const response = await api.get<ApiResponse<Period[]>>(
        `/periods${query ? `?${query}` : ''}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch periods');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async getCurrentPeriod(type?: PeriodType): Promise<Period> {
    try {
      const url = type ? `/periods/current?type=${type}` : '/periods/current';
      const response = await api.get<ApiResponse<Period>>(url);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'No active period found');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async createPeriod(periodData: Omit<Period, 'id'>): Promise<Period> {
    try {
      const response = await api.post<ApiResponse<Period>>('/periods', periodData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create period');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
};
