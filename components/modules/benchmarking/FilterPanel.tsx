'use client';

import { useState } from 'react';
import { Kpi, Period } from '@/types';
import { KPI_CATALOG } from '@/lib/constants';
import { Button, Select, Badge, Card } from '@/components/ui';
import { classNames } from '@/lib/utils';

export interface FilterState {
  kpiIds: string[];
  periodId: string;
  executiveId: string;
  teamId: string;
  franchiseeId: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  kpis?: Kpi[];
  periods?: { id: string; label: string }[];
  executives?: { id: string; name: string }[];
  teams?: { id: string; name: string }[];
  franchisees?: { id: string; name: string }[];
  onApply?: () => void;
  onReset?: () => void;
  showFranchiseeFilter?: boolean;
  compact?: boolean;
}

const DEFAULT_KPIS = KPI_CATALOG.slice(0, 6);

export function FilterPanel({
  filters,
  onChange,
  kpis = DEFAULT_KPIS,
  periods = [],
  executives = [],
  teams = [],
  franchisees = [],
  onApply,
  onReset,
  showFranchiseeFilter = false,
  compact = false,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleKpiToggle = (kpiId: string) => {
    const newKpis = localFilters.kpiIds.includes(kpiId)
      ? localFilters.kpiIds.filter(id => id !== kpiId)
      : [...localFilters.kpiIds, kpiId];
    setLocalFilters(prev => ({ ...prev, kpiIds: newKpis }));
  };

  const handleSelectAllKpis = () => {
    setLocalFilters(prev => ({ ...prev, kpiIds: kpis.map(k => k.id) }));
  };

  const handleClearKpis = () => {
    setLocalFilters(prev => ({ ...prev, kpiIds: [] }));
  };

  const handleApply = () => {
    onChange(localFilters);
    onApply?.();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      kpiIds: [],
      periodId: '',
      executiveId: '',
      teamId: '',
      franchiseeId: '',
    };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
    onReset?.();
  };

  const activeFilterCount = 
    (localFilters.kpiIds.length > 0 ? 1 : 0) +
    (localFilters.periodId ? 1 : 0) +
    (localFilters.executiveId ? 1 : 0) +
    (localFilters.teamId ? 1 : 0) +
    (localFilters.franchiseeId ? 1 : 0);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Select
          options={[
            { value: '', label: 'All KPIs' },
            ...kpis.map(k => ({ value: k.id, label: k.name })),
          ]}
          value={localFilters.kpiIds[0] || ''}
          onChange={(e) => setLocalFilters(prev => ({ ...prev, kpiIds: e.target.value ? [e.target.value] : [] }))}
        />
        <Select
          options={[
            { value: '', label: 'All Periods' },
            ...periods.map(p => ({ value: p.id, label: p.label })),
          ]}
          value={localFilters.periodId}
          onChange={(e) => setLocalFilters(prev => ({ ...prev, periodId: e.target.value }))}
        />
        <Button size="sm" variant="secondary" onClick={handleApply}>
          Apply
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="info">{activeFilterCount} active</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* KPI Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">KPI</label>
            <div className="flex gap-2 text-xs">
              <button
                onClick={handleSelectAllKpis}
                className="text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={handleClearKpis}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {kpis.map(kpi => (
              <button
                key={kpi.id}
                onClick={() => handleKpiToggle(kpi.id)}
                className={classNames(
                  'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
                  localFilters.kpiIds.includes(kpi.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {kpi.name}
              </button>
            ))}
          </div>
        </div>

        {/* Period Filter */}
        {periods.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <Select
              options={[
                { value: '', label: 'All Periods' },
                ...periods.map(p => ({ value: p.id, label: p.label })),
              ]}
              value={localFilters.periodId}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, periodId: e.target.value }))}
            />
          </div>
        )}

        {/* Executive Filter */}
        {executives.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Executive</label>
            <Select
              options={[
                { value: '', label: 'All Executives' },
                ...executives.map(e => ({ value: e.id, label: e.name })),
              ]}
              value={localFilters.executiveId}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, executiveId: e.target.value }))}
            />
          </div>
        )}

        {/* Team Filter */}
        {teams.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
            <Select
              options={[
                { value: '', label: 'All Teams' },
                ...teams.map(t => ({ value: t.id, label: t.name })),
              ]}
              value={localFilters.teamId}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, teamId: e.target.value }))}
            />
          </div>
        )}

        {/* Franchisee Filter */}
        {showFranchiseeFilter && franchisees.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Franchisee</label>
            <Select
              options={[
                { value: '', label: 'All Franchisees' },
                ...franchisees.map(f => ({ value: f.id, label: f.name })),
              ]}
              value={localFilters.franchiseeId}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, franchiseeId: e.target.value }))}
            />
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {localFilters.kpiIds.length > 0 && (
              <Badge variant="default">
                {localFilters.kpiIds.length} KPI{localFilters.kpiIds.length > 1 ? 's' : ''}
              </Badge>
            )}
            {localFilters.periodId && (
              <Badge variant="default">Period selected</Badge>
            )}
            {localFilters.executiveId && (
              <Badge variant="default">Executive selected</Badge>
            )}
            {localFilters.teamId && (
              <Badge variant="default">Team selected</Badge>
            )}
            {localFilters.franchiseeId && (
              <Badge variant="default">Franchisee selected</Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
