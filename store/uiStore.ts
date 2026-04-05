'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Module = 'overview' | 'targets' | 'tracking' | 'incentives' | 'benchmarking' | 'reports' | 'approvals' | 'requests' | 'settings' | 'admin';

interface FilterState {
  kpiIds: string[];
  periodId: string | null;
  executiveIds: string[];
  teamIds: string[];
  franchiseeIds: string[];
}

interface UIState {
  sidebarCollapsed: boolean;
  currentModule: Module;
  filters: FilterState;
  viewMode: 'cards' | 'table';
  theme: 'light' | 'dark';

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentModule: (module: Module) => void;

  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setKpiFilter: (kpiIds: string[]) => void;
  setPeriodFilter: (periodId: string | null) => void;
  setExecutiveFilter: (executiveIds: string[]) => void;

  setViewMode: (mode: 'cards' | 'table') => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const DEFAULT_FILTERS: FilterState = {
  kpiIds: [],
  periodId: null,
  executiveIds: [],
  teamIds: [],
  franchiseeIds: [],
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currentModule: 'overview',
      filters: DEFAULT_FILTERS,
      viewMode: 'cards',
      theme: 'light',

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCurrentModule: (module) => set({ currentModule: module }),

      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
      })),

      clearFilters: () => set({ filters: DEFAULT_FILTERS }),

      setKpiFilter: (kpiIds) => set((state) => ({
        filters: { ...state.filters, kpiIds },
      })),

      setPeriodFilter: (periodId) => set((state) => ({
        filters: { ...state.filters, periodId },
      })),

      setExecutiveFilter: (executiveIds) => set((state) => ({
        filters: { ...state.filters, executiveIds },
      })),

      setViewMode: (mode) => set({ viewMode: mode }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'kpi-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        viewMode: state.viewMode,
        theme: state.theme,
      }),
    }
  )
);
