import { api, ApiError } from '@/lib/api/client';
import type { Kpi, ApiResponse, PaginatedResponse } from '@/types';
import type { KpiCategory, KpiUnit } from '@/types';

interface KpiActualFilters {
  executiveId?: string;
  kpiId?: string;
  periodStart?: string;
  periodEnd?: string;
  confirmed?: boolean;
}

interface KpiActual {
  id: string;
  executiveId: string;
  kpiId: string;
  periodStart: string;
  actualValue: number;
  source: 'system' | 'manual';
  sourceNote?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ManualEntryRequest {
  executiveId: string;
  kpiId: string;
  periodStart: string;
  actualValue: number;
  sourceNote: string;
}

export const kpiService = {
  async getKpis(filters?: {
    type?: KpiCategory;
    unit?: KpiUnit;
  }): Promise<Kpi[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.set('type', filters.type);
      if (filters?.unit) params.set('unit', filters.unit);

      const query = params.toString();
      const response = await api.get<ApiResponse<Kpi[]>>(
        `/kpis${query ? `?${query}` : ''}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch KPIs');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async getKpiById(id: string): Promise<Kpi> {
    try {
      const response = await api.get<ApiResponse<Kpi>>(`/kpis/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'KPI not found');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async createKpi(kpiData: Omit<Kpi, 'id'>): Promise<Kpi> {
    try {
      const response = await api.post<ApiResponse<Kpi>>('/kpis', kpiData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create KPI');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async updateKpi(id: string, kpiData: Partial<Kpi>): Promise<Kpi> {
    try {
      const response = await api.patch<ApiResponse<Kpi>>(`/kpis/${id}`, kpiData);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update KPI');
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

export const kpiActualService = {
  async getActuals(filters?: KpiActualFilters, pagination?: { page?: number; pageSize?: number }): Promise<PaginatedResponse<KpiActual>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.executiveId) params.set('executiveId', filters.executiveId);
        if (filters.kpiId) params.set('kpiId', filters.kpiId);
        if (filters.periodStart) params.set('periodStart', filters.periodStart);
        if (filters.periodEnd) params.set('periodEnd', filters.periodEnd);
        if (filters.confirmed !== undefined) params.set('confirmed', String(filters.confirmed));
      }
      
      if (pagination) {
        if (pagination.page) params.set('page', String(pagination.page));
        if (pagination.pageSize) params.set('pageSize', String(pagination.pageSize));
      }

      const query = params.toString();
      const response = await api.get<ApiResponse<PaginatedResponse<KpiActual>>>(
        `/kpi-actuals${query ? `?${query}` : ''}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch KPI actuals');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async submitManualEntry(entry: ManualEntryRequest): Promise<KpiActual> {
    try {
      const response = await api.post<ApiResponse<KpiActual>>('/kpi-actuals/manual', entry);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to submit manual entry');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async confirmEntry(id: string): Promise<KpiActual> {
    try {
      const response = await api.post<ApiResponse<KpiActual>>(`/kpi-actuals/${id}/confirm`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to confirm entry');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async getPendingEntries(periodStart?: string): Promise<KpiActual[]> {
    try {
      const url = periodStart 
        ? `/kpi-actuals/pending?periodStart=${periodStart}` 
        : '/kpi-actuals/pending';
      const response = await api.get<ApiResponse<KpiActual[]>>(url);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch pending entries');
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
