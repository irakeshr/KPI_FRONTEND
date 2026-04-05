'use client';

import { useState, useMemo } from 'react';
import { Kpi, TrafficLightThresholds } from '@/types';
import { KPI_CATALOG, DEFAULT_TRAFFIC_LIGHT_THRESHOLDS } from '@/lib/constants';
import { CompositeAttainmentScoreCard } from './CompositeAttainmentScoreCard';
import { TeamRollupGrid } from './TeamRollupGrid';
import { Leaderboard } from './Leaderboard';
import { TrendChart } from './TrendChart';
import { FilterPanel, FilterState } from './FilterPanel';
import { Card, Badge, Button, Select } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface TeamMember {
  executiveId: string;
  executiveName: string;
  teamName: string;
  kpis: {
    kpiId: string;
    kpiName: string;
    target: number;
    actual: number;
    attainment: number;
  }[];
  compositeAttainment: number;
  totalIncentive: number;
  trend?: number;
}

interface LeaderboardEntry {
  rank: number;
  executiveId: string;
  executiveName: string;
  teamName: string;
  compositeAttainment: number;
  totalIncentive: number;
}

interface ManagerViewProps {
  teamMembers: TeamMember[];
  leaderboard: LeaderboardEntry[];
  compositeScore: number;
  previousCompositeScore?: number;
  trendData?: { label: string; value: number; attainment: number; hasRevision?: boolean }[];
  kpis?: Kpi[];
  periods?: { id: string; label: string }[];
  thresholds?: TrafficLightThresholds;
  onPeriodChange?: (periodId: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  kpiIds: [],
  periodId: '',
  executiveId: '',
  teamId: '',
  franchiseeId: '',
};

export function ManagerView({
  teamMembers,
  leaderboard,
  compositeScore,
  previousCompositeScore,
  trendData = [],
  kpis = KPI_CATALOG,
  periods = [],
  thresholds = DEFAULT_TRAFFIC_LIGHT_THRESHOLDS,
}: ManagerViewProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [selectedQuickPeriod, setSelectedQuickPeriod] = useState<string>('');

  const quickPeriods = [
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'last_quarter', label: 'Last Quarter' },
  ];

  const activeFilterCount = useMemo(() => {
    return (
      (filters.kpiIds.length > 0 ? 1 : 0) +
      (filters.periodId ? 1 : 0) +
      (filters.executiveId ? 1 : 0) +
      (filters.teamId ? 1 : 0) +
      (filters.franchiseeId ? 1 : 0)
    );
  }, [filters]);

  const sortedLeaderboard = useMemo(() => {
    return [...leaderboard].sort((a, b) => b.compositeAttainment - a.compositeAttainment);
  }, [leaderboard]);

  const teamComposite = teamMembers.length > 0
    ? teamMembers.reduce((sum, m) => sum + m.compositeAttainment, 0) / teamMembers.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Performance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor your team's KPI attainment and rankings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="info" size="sm" className="ml-2">{activeFilterCount}</Badge>
            )}
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Granularity:</span>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).map(g => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={classNames(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  granularity === g
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
          <span className="text-sm font-medium text-gray-700">Quick:</span>
          <div className="flex gap-1">
            {quickPeriods.map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedQuickPeriod(selectedQuickPeriod === period.value ? '' : period.value)}
                className={classNames(
                  'px-2 py-1 text-xs font-medium rounded transition-colors',
                  selectedQuickPeriod === period.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1" />
        
        <Select
          options={[
            { value: '', label: 'All Periods' },
            ...periods.map(p => ({ value: p.id, label: p.label })),
          ]}
          value={filters.periodId}
          onChange={(e) => setFilters(prev => ({ ...prev, periodId: e.target.value }))}
          className="w-40"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={compareWithPrevious}
            onChange={(e) => setCompareWithPrevious(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Compare with previous
        </label>
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          kpis={kpis}
          periods={periods}
          executives={teamMembers.map(m => ({ id: m.executiveId, name: m.executiveName }))}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CompositeAttainmentScoreCard
              score={compositeScore}
              previousScore={previousCompositeScore}
              title="Team Composite Score"
              showTrend={true}
              trendPeriods={3}
              size="md"
            />
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <p className="text-sm text-gray-500">Active Executives</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{teamMembers.length}</p>
              <p className="text-xs text-gray-500 mt-1">Team members</p>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50">
              <p className="text-sm text-gray-500">Average Attainment</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{teamComposite.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Across all KPIs</p>
            </Card>
          </div>

          <TeamRollupGrid
            members={teamMembers}
            kpis={kpis}
            onExecutiveClick={(id) => console.log('View executive:', id)}
            sortable={true}
          />

          {trendData.length > 0 && (
            <TrendChart
              title="Team Performance Trend"
              data={trendData}
              showRevisionIndicator={true}
            />
          )}
        </div>

        <div className="space-y-6">
          <Leaderboard
            entries={sortedLeaderboard.map((entry, index) => ({
              ...entry,
              rank: index + 1,
            }))}
            title="Team Leaderboard"
            metric="attainment"
          />
        </div>
      </div>
    </div>
  );
}