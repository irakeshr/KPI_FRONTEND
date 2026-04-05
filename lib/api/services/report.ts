import { api, ApiError } from '@/lib/api/client';
import type { ApiResponse } from '@/types';

type ReportType = 
  | 'performance-summary'
  | 'attainment-detail'
  | 'incentive-breakdown'
  | 'team-comparison'
  | 'trend-analysis';

interface ReportFilter {
  periodStart?: string;
  periodEnd?: string;
  executiveIds?: string[];
  teamIds?: string[];
  kpiIds?: string[];
  includeUnconfirmed?: boolean;
}

interface GeneratedReport {
  id: string;
  type: ReportType;
  title: string;
  filters: ReportFilter;
  generatedAt: string;
  generatedBy: string;
  downloadUrl: string;
}

interface ReportGenerationRequest {
  type: ReportType;
  filters: ReportFilter;
}

export const reportService = {
  async generateReport(request: ReportGenerationRequest): Promise<GeneratedReport> {
    try {
      const response = await api.post<ApiResponse<GeneratedReport>>('/reports/generate', request);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate report');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async getReportById(id: string): Promise<GeneratedReport> {
    try {
      const response = await api.get<ApiResponse<GeneratedReport>>(`/reports/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Report not found');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async getReportTypes(): Promise<{ type: ReportType; name: string; description: string }[]> {
    try {
      const response = await api.get<ApiResponse<{ type: ReportType; name: string; description: string }[]>>('/reports/types');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch report types');
      }
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async downloadReport(id: string): Promise<Blob> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/reports/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  },
};
