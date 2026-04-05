'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface KpiActual {
  id: string;
  executiveId: string;
  kpiId: string;
  periodStart: string;
  periodEnd: string;
  actualValue: number;
  source: 'auto' | 'manual';
  manualEntryId?: string;
  enteredAt?: string;
  enteredBy?: string;
}

export interface ManualCollectionEntry {
  id: string;
  executiveId: string;
  executiveName: string;
  amount: number;
  source: string;
  reference: string;
  date: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

interface KpiState {
  actuals: Record<string, KpiActual>;
  manualEntries: ManualCollectionEntry[];
  tatValues: Record<string, number[]>;
  isLoading: boolean;
  error: string | null;

  setActuals: (actuals: KpiActual[]) => void;
  updateActual: (executiveId: string, kpiId: string, periodStart: string, value: number, source?: 'auto' | 'manual') => void;
  getActual: (executiveId: string, kpiId: string, periodStart: string) => KpiActual | undefined;
  getAllActualsForExecutive: (executiveId: string) => KpiActual[];
  hasManualEntriesPending: (executiveId?: string) => boolean;
  hasAllManualEntriesConfirmed: (executiveId: string) => boolean;

  addManualEntry: (entry: Omit<ManualCollectionEntry, 'id' | 'createdAt'>) => void;
  confirmManualEntry: (id: string, confirmedBy: string) => void;
  rejectManualEntry: (id: string, rejectedBy: string, reason: string) => void;
  getPendingEntries: () => ManualCollectionEntry[];
  getPendingEntriesForExecutive: (executiveId: string) => ManualCollectionEntry[];

  setTatValues: (executiveId: string, periodStart: string, values: number[]) => void;
  getTatValues: (executiveId: string, periodStart: string) => number[];
  getAverageTat: (executiveId: string, periodStart: string) => number;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const generateKey = (executiveId: string, kpiId: string, periodStart: string) =>
  `${executiveId}:${kpiId}:${periodStart}`;

const MOCK_ACTUALS: Record<string, KpiActual> = {
  'exec-1:kpi-01:2026-04-01': { id: 'a-1', executiveId: 'exec-1', kpiId: 'kpi-01', periodStart: '2026-04-01', periodEnd: '2026-04-30', actualValue: 92, source: 'auto' },
  'exec-1:kpi-02:2026-04-01': { id: 'a-2', executiveId: 'exec-1', kpiId: 'kpi-02', periodStart: '2026-04-01', periodEnd: '2026-04-30', actualValue: 88, source: 'auto' },
  'exec-1:kpi-03:2026-04-01': { id: 'a-3', executiveId: 'exec-1', kpiId: 'kpi-03', periodStart: '2026-04-01', periodEnd: '2026-04-30', actualValue: 78, source: 'auto' },
  'exec-1:kpi-06:2026-04-01': { id: 'a-4', executiveId: 'exec-1', kpiId: 'kpi-06', periodStart: '2026-04-01', periodEnd: '2026-04-30', actualValue: 18, source: 'auto' },
  'exec-1:kpi-09:2026-04-01': { id: 'a-5', executiveId: 'exec-1', kpiId: 'kpi-09', periodStart: '2026-04-01', periodEnd: '2026-04-30', actualValue: 420, source: 'auto' },
  'exec-2:kpi-01:2026-04-01': { id: 'a-6', executiveId: 'exec-2', kpiId: 'kpi-01', periodStart: '2026-04-01', periodEnd: '2026-04-30', actualValue: 105, source: 'auto' },
  'exec-2:kpi-02:2026-04-01': { id: 'a-7', executiveId: 'exec-2', kpiId: 'kpi-02', periodStart: '2026-04-01', periodEnd: '2026-04-30', actualValue: 92, source: 'auto' },
  'exec-2:kpi-06:2026-04-01': { id: 'a-8', executiveId: 'exec-2', kpiId: 'kpi-06', periodStart: '2026-04-01', periodEnd: '2026-04-30', actualValue: 22, source: 'auto' },
};

const MOCK_MANUAL_ENTRIES: ManualCollectionEntry[] = [
  { id: 'mc-1', executiveId: 'exec-2', executiveName: 'Priya Patel', amount: 45000, source: 'NEFT Transfer', reference: 'TXN123456789', date: '2026-04-02', status: 'pending', createdAt: '2026-04-02T10:30:00Z' },
];

const MOCK_TAT_VALUES: Record<string, number[]> = {
  'exec-1:2026-04-01': [6, 8, 9, 7, 10, 8, 9, 7, 11, 6],
  'exec-2:2026-04-01': [5, 6, 7, 5, 8, 6, 7, 5, 6, 7],
};

export const useKpiStore = create<KpiState>()(
  persist(
    (set, get) => ({
      actuals: MOCK_ACTUALS,
      manualEntries: MOCK_MANUAL_ENTRIES,
      tatValues: MOCK_TAT_VALUES,
      isLoading: false,
      error: null,

      setActuals: (actuals) => {
        const actualsMap: Record<string, KpiActual> = {};
        actuals.forEach((a) => {
          actualsMap[generateKey(a.executiveId, a.kpiId, a.periodStart)] = a;
        });
        set({ actuals: actualsMap });
      },

      updateActual: (executiveId, kpiId, periodStart, value, source = 'auto') => {
        const key = generateKey(executiveId, kpiId, periodStart);
        const existing = get().actuals[key];
        set((state) => ({
          actuals: {
            ...state.actuals,
            [key]: {
              id: existing?.id || `a-${Date.now()}`,
              executiveId,
              kpiId,
              periodStart,
              periodEnd: '',
              actualValue: value,
              source,
              manualEntryId: source === 'manual' ? `mc-${Date.now()}` : undefined,
              enteredAt: new Date().toISOString(),
            },
          },
        }));
      },

      getActual: (executiveId, kpiId, periodStart) => {
        return get().actuals[generateKey(executiveId, kpiId, periodStart)];
      },

      getAllActualsForExecutive: (executiveId) => {
        return Object.values(get().actuals).filter((a) => a.executiveId === executiveId);
      },

      hasManualEntriesPending: (executiveId) => {
        const { manualEntries } = get();
        if (executiveId) {
          return manualEntries.some((e) => e.executiveId === executiveId && e.status === 'pending');
        }
        return manualEntries.some((e) => e.status === 'pending');
      },

      hasAllManualEntriesConfirmed: (executiveId) => {
        const { manualEntries } = get();
        const entries = manualEntries.filter((e) => e.executiveId === executiveId);
        return entries.length > 0 && entries.every((e) => e.status === 'confirmed');
      },

      addManualEntry: (entry) => {
        const newEntry: ManualCollectionEntry = {
          ...entry,
          id: `mc-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          manualEntries: [...state.manualEntries, newEntry],
        }));
      },

      confirmManualEntry: (id, confirmedBy) => {
        set((state) => ({
          manualEntries: state.manualEntries.map((e) =>
            e.id === id
              ? { ...e, status: 'confirmed' as const, confirmedAt: new Date().toISOString(), confirmedBy }
              : e
          ),
        }));
      },

      rejectManualEntry: (id, rejectedBy, reason) => {
        set((state) => ({
          manualEntries: state.manualEntries.map((e) =>
            e.id === id
              ? { ...e, status: 'rejected' as const, rejectedAt: new Date().toISOString(), rejectedBy, rejectionReason: reason }
              : e
          ),
        }));
      },

      getPendingEntries: () => {
        return get().manualEntries.filter((e) => e.status === 'pending');
      },

      getPendingEntriesForExecutive: (executiveId) => {
        return get().manualEntries.filter((e) => e.executiveId === executiveId && e.status === 'pending');
      },

      setTatValues: (executiveId, periodStart, values) => {
        const key = `${executiveId}:${periodStart}`;
        set((state) => ({
          tatValues: { ...state.tatValues, [key]: values },
        }));
      },

      getTatValues: (executiveId, periodStart) => {
        const key = `${executiveId}:${periodStart}`;
        return get().tatValues[key] || [];
      },

      getAverageTat: (executiveId, periodStart) => {
        const values = get().getTatValues(executiveId, periodStart);
        if (values.length === 0) return 0;
        return values.reduce((sum, v) => sum + v, 0) / values.length;
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'kpi-actuals',
    }
  )
);
