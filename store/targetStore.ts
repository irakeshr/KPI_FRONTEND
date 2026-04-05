'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Target, Period } from '@/types';

export interface TeamTarget extends Target {
  teamTargetValue?: number;
  overrideReason?: string;
  isOverridden?: boolean;
}

interface TargetState {
  targets: Target[];
  periods: Period[];
  currentPeriodId: string | null;
  isLoading: boolean;
  error: string | null;

  setTargets: (targets: Target[]) => void;
  addTarget: (target: Target) => void;
  updateTarget: (id: string, updates: Partial<Target>) => void;
  deleteTarget: (id: string) => void;
  getTargetsByExecutive: (executiveId: string) => Target[];
  getTargetsByPeriod: (periodId: string) => Target[];
  getTargetByExecutiveAndKpi: (executiveId: string, kpiId: string, periodId?: string) => Target | undefined;

  setPeriods: (periods: Period[]) => void;
  addPeriod: (period: Period) => void;
  setCurrentPeriod: (periodId: string) => void;
  getCurrentPeriod: () => Period | undefined;

  teamOverride: (executiveId: string, periodId: string, kpiId: string, overrideValue: number, reason: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const MOCK_TARGETS: Target[] = [
  { id: 't-1', executiveId: 'exec-1', executiveName: 'Rahul Sharma', kpiId: 'kpi-01', kpiName: 'Sales', periodType: 'monthly', periodStart: '2026-04-01', periodEnd: '2026-04-30', targetValue: 100, createdAt: '', updatedAt: '', createdBy: '' },
  { id: 't-2', executiveId: 'exec-1', executiveName: 'Rahul Sharma', kpiId: 'kpi-02', kpiName: 'Collection', periodType: 'monthly', periodStart: '2026-04-01', periodEnd: '2026-04-30', targetValue: 95, createdAt: '', updatedAt: '', createdBy: '' },
  { id: 't-3', executiveId: 'exec-1', executiveName: 'Rahul Sharma', kpiId: 'kpi-03', kpiName: 'Lead Relevancy', periodType: 'monthly', periodStart: '2026-04-01', periodEnd: '2026-04-30', targetValue: 85, createdAt: '', updatedAt: '', createdBy: '' },
  { id: 't-4', executiveId: 'exec-1', executiveName: 'Rahul Sharma', kpiId: 'kpi-06', kpiName: 'Deal Creation', periodType: 'monthly', periodStart: '2026-04-01', periodEnd: '2026-04-30', targetValue: 20, createdAt: '', updatedAt: '', createdBy: '' },
  { id: 't-5', executiveId: 'exec-1', executiveName: 'Rahul Sharma', kpiId: 'kpi-09', kpiName: 'Dialed Calls', periodType: 'monthly', periodStart: '2026-04-01', periodEnd: '2026-04-30', targetValue: 500, createdAt: '', updatedAt: '', createdBy: '' },
  { id: 't-6', executiveId: 'exec-1', executiveName: 'Rahul Sharma', kpiId: 'kpi-13', kpiName: 'Completion TAT', periodType: 'monthly', periodStart: '2026-04-01', periodEnd: '2026-04-30', targetValue: 5, benchmark: 3, ceiling: 7, createdAt: '', updatedAt: '', createdBy: '' },
  { id: 't-7', executiveId: 'exec-2', executiveName: 'Priya Patel', kpiId: 'kpi-01', kpiName: 'Sales', periodType: 'monthly', periodStart: '2026-04-01', periodEnd: '2026-04-30', targetValue: 120, createdAt: '', updatedAt: '', createdBy: '' },
  { id: 't-8', executiveId: 'exec-2', executiveName: 'Priya Patel', kpiId: 'kpi-02', kpiName: 'Collection', periodType: 'monthly', periodStart: '2026-04-01', periodEnd: '2026-04-30', targetValue: 100, createdAt: '', updatedAt: '', createdBy: '' },
  { id: 't-9', executiveId: 'exec-2', executiveName: 'Priya Patel', kpiId: 'kpi-06', kpiName: 'Deal Creation', periodType: 'monthly', periodStart: '2026-04-01', periodEnd: '2026-04-30', targetValue: 25, createdAt: '', updatedAt: '', createdBy: '' },
];

const MOCK_PERIODS: Period[] = [
  { id: 'p-3', type: 'monthly', startDate: '2026-04-01', endDate: '2026-04-30', label: 'April 2026', isActive: true },
  { id: 'p-2', type: 'monthly', startDate: '2026-03-01', endDate: '2026-03-31', label: 'March 2026', isActive: false },
  { id: 'p-1', type: 'monthly', startDate: '2026-02-01', endDate: '2026-02-28', label: 'February 2026', isActive: false },
];

export const useTargetStore = create<TargetState>()(
  persist(
    (set, get) => ({
      targets: MOCK_TARGETS,
      periods: MOCK_PERIODS,
      currentPeriodId: 'p-3',
      isLoading: false,
      error: null,

      setTargets: (targets) => set({ targets }),

      addTarget: (target) => set((state) => ({
        targets: [...state.targets, target],
      })),

      updateTarget: (id, updates) => set((state) => ({
        targets: state.targets.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      })),

      deleteTarget: (id) => set((state) => ({
        targets: state.targets.filter((t) => t.id !== id),
      })),

      getTargetsByExecutive: (executiveId) => {
        const { targets, currentPeriodId } = get();
        return targets.filter((t) => t.executiveId === executiveId);
      },

      getTargetsByPeriod: (periodId) => {
        return get().targets.filter((t) => {
          const period = get().periods.find((p) => p.id === periodId);
          return period && t.periodStart === period.startDate;
        });
      },

      getTargetByExecutiveAndKpi: (executiveId, kpiId, periodId) => {
        const { targets, currentPeriodId: defaultPeriod } = get();
        const period = periodId || defaultPeriod;
        const periodData = get().periods.find((p) => p.id === period);
        if (!periodData) return undefined;
        return targets.find(
          (t) => t.executiveId === executiveId && t.kpiId === kpiId && t.periodStart === periodData.startDate
        );
      },

      setPeriods: (periods) => set({ periods }),

      addPeriod: (period) => set((state) => ({
        periods: [...state.periods, period],
      })),

      setCurrentPeriod: (periodId) => set({ currentPeriodId: periodId }),

      getCurrentPeriod: () => {
        const { periods, currentPeriodId } = get();
        return periods.find((p) => p.id === currentPeriodId);
      },

      teamOverride: (executiveId, periodId, kpiId, overrideValue, reason) => {
        const period = get().periods.find((p) => p.id === periodId);
        if (!period) return;

        set((state) => ({
          targets: state.targets.map((t) =>
            t.executiveId === executiveId &&
            t.kpiId === kpiId &&
            t.periodStart === period.startDate
              ? { ...t, teamTargetValue: overrideValue, overrideReason: reason, isOverridden: true, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'kpi-targets',
    }
  )
);
