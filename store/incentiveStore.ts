'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CommissionConfig {
  kpiId: string;
  kpiName: string;
  percentage: number;
  enabled: boolean;
}

export interface SlabBonus {
  id: string;
  kpiId: string;
  minAttainment: number;
  maxAttainment: number;
  value: number;
  type: 'fixed' | 'percentage';
  cumulative: boolean;
}

export interface CompositeBonus {
  enabled: boolean;
  bonusType: 'fixed' | 'percentage';
  value: number;
  condition: 'all-or-nothing';
}

export interface PayoutRecord {
  id: string;
  executiveId: string;
  executiveName: string;
  periodId: string;
  periodLabel: string;
  commissionAmount: number;
  slabBonusAmount: number;
  compositeBonusAmount: number;
  totalPayout: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  snapshotDate: string;
  lockedAt?: string;
}

interface IncentiveState {
  commissionConfig: CommissionConfig[];
  slabBonuses: SlabBonus[];
  compositeBonus: CompositeBonus;
  payoutRecords: PayoutRecord[];
  isCalculationLocked: boolean;
  isLoading: boolean;
  error: string | null;

  setCommissionConfig: (config: CommissionConfig[]) => void;
  updateCommission: (kpiId: string, percentage: number, enabled: boolean) => void;

  setSlabBonuses: (slabs: SlabBonus[]) => void;
  addSlabBonus: (slab: SlabBonus) => void;
  updateSlabBonus: (id: string, updates: Partial<SlabBonus>) => void;
  deleteSlabBonus: (id: string) => void;
  getSlabBonusesForKpi: (kpiId: string) => SlabBonus[];

  setCompositeBonus: (composite: CompositeBonus) => void;

  triggerCalculation: (executiveId: string, executiveName: string, periodId: string, periodLabel: string) => void;
  lockCalculation: () => void;

  approvePayout: (payoutId: string, approvedBy: string) => void;
  rejectPayout: (payoutId: string, rejectedBy: string, reason: string) => void;
  getPayoutForExecutive: (executiveId: string, periodId: string) => PayoutRecord | undefined;
  getPendingPayouts: () => PayoutRecord[];

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const MOCK_COMMISSION_CONFIG: CommissionConfig[] = [
  { kpiId: 'kpi-01', kpiName: 'Sales', percentage: 2, enabled: true },
  { kpiId: 'kpi-02', kpiName: 'Collection', percentage: 1.5, enabled: true },
];

const MOCK_SLAB_BONUSES: SlabBonus[] = [
  { id: 'slab-1', kpiId: 'kpi-01', minAttainment: 90, maxAttainment: 100, value: 5000, type: 'fixed', cumulative: true },
  { id: 'slab-2', kpiId: 'kpi-01', minAttainment: 100, maxAttainment: 120, value: 10000, type: 'fixed', cumulative: true },
  { id: 'slab-3', kpiId: 'kpi-01', minAttainment: 120, maxAttainment: 150, value: 15000, type: 'fixed', cumulative: true },
  { id: 'slab-4', kpiId: 'kpi-02', minAttainment: 90, maxAttainment: 100, value: 3000, type: 'fixed', cumulative: true },
  { id: 'slab-5', kpiId: 'kpi-02', minAttainment: 100, maxAttainment: 150, value: 5000, type: 'fixed', cumulative: true },
  { id: 'slab-6', kpiId: 'kpi-06', minAttainment: 90, maxAttainment: 100, value: 2000, type: 'fixed', cumulative: false },
  { id: 'slab-7', kpiId: 'kpi-06', minAttainment: 100, maxAttainment: 150, value: 4000, type: 'fixed', cumulative: false },
];

const MOCK_COMPOSITE_BONUS: CompositeBonus = {
  enabled: true,
  bonusType: 'percentage',
  value: 5,
  condition: 'all-or-nothing',
};

const MOCK_PAYOUT_RECORDS: PayoutRecord[] = [
  { id: 'payout-1', executiveId: 'exec-1', executiveName: 'Rahul Sharma', periodId: 'p-2', periodLabel: 'March 2026', commissionAmount: 4500, slabBonusAmount: 8000, compositeBonusAmount: 5000, totalPayout: 17500, status: 'approved', approvedAt: '2026-03-31T18:00:00Z', approvedBy: 'admin-1', snapshotDate: '2026-03-31T00:00:00Z' },
  { id: 'payout-2', executiveId: 'exec-2', executiveName: 'Priya Patel', periodId: 'p-2', periodLabel: 'March 2026', commissionAmount: 5200, slabBonusAmount: 10000, compositeBonusAmount: 6000, totalPayout: 21200, status: 'pending', snapshotDate: '2026-03-31T00:00:00Z' },
];

export const useIncentiveStore = create<IncentiveState>()(
  persist(
    (set, get) => ({
      commissionConfig: MOCK_COMMISSION_CONFIG,
      slabBonuses: MOCK_SLAB_BONUSES,
      compositeBonus: MOCK_COMPOSITE_BONUS,
      payoutRecords: MOCK_PAYOUT_RECORDS,
      isCalculationLocked: false,
      isLoading: false,
      error: null,

      setCommissionConfig: (config) => set({ commissionConfig: config }),

      updateCommission: (kpiId, percentage, enabled) => {
        set((state) => ({
          commissionConfig: state.commissionConfig.map((c) =>
            c.kpiId === kpiId ? { ...c, percentage, enabled } : c
          ),
        }));
      },

      setSlabBonuses: (slabs) => set({ slabBonuses: slabs }),

      addSlabBonus: (slab) => set((state) => ({
        slabBonuses: [...state.slabBonuses, slab],
      })),

      updateSlabBonus: (id, updates) => set((state) => ({
        slabBonuses: state.slabBonuses.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      })),

      deleteSlabBonus: (id) => set((state) => ({
        slabBonuses: state.slabBonuses.filter((s) => s.id !== id),
      })),

      getSlabBonusesForKpi: (kpiId) => {
        return get().slabBonuses.filter((s) => s.kpiId === kpiId);
      },

      setCompositeBonus: (composite) => set({ compositeBonus: composite }),

      triggerCalculation: (executiveId, executiveName, periodId, periodLabel) => {
        const payoutRecord: PayoutRecord = {
          id: `payout-${Date.now()}`,
          executiveId,
          executiveName,
          periodId,
          periodLabel,
          commissionAmount: 0,
          slabBonusAmount: 0,
          compositeBonusAmount: 0,
          totalPayout: 0,
          status: 'pending',
          snapshotDate: new Date().toISOString(),
        };
        set((state) => ({
          payoutRecords: [...state.payoutRecords, payoutRecord],
        }));
      },

      lockCalculation: () => set({ isCalculationLocked: true }),

      approvePayout: (payoutId, approvedBy) => {
        set((state) => ({
          payoutRecords: state.payoutRecords.map((p) =>
            p.id === payoutId
              ? { ...p, status: 'approved' as const, approvedAt: new Date().toISOString(), approvedBy }
              : p
          ),
        }));
      },

      rejectPayout: (payoutId, rejectedBy, reason) => {
        set((state) => ({
          payoutRecords: state.payoutRecords.map((p) =>
            p.id === payoutId
              ? { ...p, status: 'rejected' as const, rejectedAt: new Date().toISOString(), rejectedBy, rejectionReason: reason }
              : p
          ),
        }));
      },

      getPayoutForExecutive: (executiveId, periodId) => {
        return get().payoutRecords.find((p) => p.executiveId === executiveId && p.periodId === periodId);
      },

      getPendingPayouts: () => {
        return get().payoutRecords.filter((p) => p.status === 'pending');
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'kpi-incentives',
    }
  )
);
