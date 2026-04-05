import { api, ApiError } from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse } from '@/types';

interface CommissionConfig {
  id: string;
  kpiId: string;
  kpiName: string;
  rate: number;
  minAttainment: number;
  maxAttainment: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

interface SlabBonus {
  id: string;
  name: string;
  kpiId: string;
  slabs: {
    minAttainment: number;
    maxAttainment: number;
    bonusAmount: number;
  }[];
  effectiveFrom: string;
  isActive: boolean;
}

interface CompositeBonus {
  id: string;
  name: string;
  bonusType: 'team' | 'individual';
  targetKpiIds: string[];
  minAttainment: number;
  bonusAmount: number;
  effectiveFrom: string;
  isActive: boolean;
}

interface IncentiveCalculation {
  id: string;
  executiveId: string;
  executiveName: string;
  periodStart: string;
  periodEnd: string;
  kpiId: string;
  kpiName: string;
  targetValue: number;
  actualValue: number;
  attainment: number;
  commissionRate: number;
  commissionAmount: number;
  slabBonus: number;
  compositeBonus: number;
  totalIncentive: number;
}

interface PayoutRequest {
  id: string;
  executiveId: string;
  executiveName: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
}

interface IncentiveFilters {
  executiveId?: string;
  periodStart?: string;
  periodEnd?: string;
  kpiId?: string;
}

export const incentiveService = {
  async getCommissionConfigs(): Promise<CommissionConfig[]> {
    try {
      const response = await api.get<ApiResponse<CommissionConfig[]>>('/incentives/commissions');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch commission configs');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async createCommissionConfig(config: Omit<CommissionConfig, 'id'>): Promise<CommissionConfig> {
    try {
      const response = await api.post<ApiResponse<CommissionConfig>>('/incentives/commissions', config);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create commission config');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async updateCommissionConfig(id: string, config: Partial<CommissionConfig>): Promise<CommissionConfig> {
    try {
      const response = await api.patch<ApiResponse<CommissionConfig>>(`/incentives/commissions/${id}`, config);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update commission config');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async getSlabBonuses(): Promise<SlabBonus[]> {
    try {
      const response = await api.get<ApiResponse<SlabBonus[]>>('/incentives/slabs');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch slab bonuses');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async createSlabBonus(bonus: Omit<SlabBonus, 'id'>): Promise<SlabBonus> {
    try {
      const response = await api.post<ApiResponse<SlabBonus>>('/incentives/slabs', bonus);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create slab bonus');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async getCompositeBonuses(): Promise<CompositeBonus[]> {
    try {
      const response = await api.get<ApiResponse<CompositeBonus[]>>('/incentives/composite');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch composite bonuses');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async createCompositeBonus(bonus: Omit<CompositeBonus, 'id'>): Promise<CompositeBonus> {
    try {
      const response = await api.post<ApiResponse<CompositeBonus>>('/incentives/composite', bonus);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create composite bonus');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async calculateIncentives(filters: IncentiveFilters): Promise<IncentiveCalculation[]> {
    try {
      const params = new URLSearchParams();
      if (filters.executiveId) params.set('executiveId', filters.executiveId);
      if (filters.periodStart) params.set('periodStart', filters.periodStart);
      if (filters.periodEnd) params.set('periodEnd', filters.periodEnd);
      if (filters.kpiId) params.set('kpiId', filters.kpiId);

      const query = params.toString();
      const response = await api.get<ApiResponse<IncentiveCalculation[]>>(
        `/incentives/calculate${query ? `?${query}` : ''}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to calculate incentives');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async canCalculateIncentives(periodStart: string): Promise<{ canCalculate: boolean; reasons: string[] }> {
    try {
      const response = await api.get<ApiResponse<{ canCalculate: boolean; reasons: string[] }>>(
        `/incentives/can-calculate?periodStart=${periodStart}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to check incentive eligibility');
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

export const payoutService = {
  async getPayouts(filters?: {
    status?: PayoutRequest['status'];
    executiveId?: string;
    periodStart?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<PayoutRequest>> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.executiveId) params.set('executiveId', filters.executiveId);
      if (filters?.periodStart) params.set('periodStart', filters.periodStart);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.pageSize) params.set('pageSize', String(filters.pageSize));

      const query = params.toString();
      const response = await api.get<ApiResponse<PaginatedResponse<PayoutRequest>>>(
        `/payouts${query ? `?${query}` : ''}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch payouts');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async requestPayout(data: {
    executiveId: string;
    periodStart: string;
    periodEnd: string;
    totalAmount: number;
  }): Promise<PayoutRequest> {
    try {
      const response = await api.post<ApiResponse<PayoutRequest>>('/payouts', data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to request payout');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async approvePayout(id: string, approved: boolean, note?: string): Promise<PayoutRequest> {
    try {
      const response = await api.post<ApiResponse<PayoutRequest>>(`/payouts/${id}/approve`, {
        approved,
        note,
      });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to approve payout');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async markAsPaid(id: string): Promise<PayoutRequest> {
    try {
      const response = await api.post<ApiResponse<PayoutRequest>>(`/payouts/${id}/mark-paid`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to mark payout as paid');
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
