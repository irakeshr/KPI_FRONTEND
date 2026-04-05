'use client';

import { Card, Button, Select, Input } from '@/components/ui';
import { KPI_CATALOG } from '@/lib/constants';
import { classNames } from '@/lib/utils';

interface ReportFilters {
  period: string;
  periodType: 'monthly' | 'quarterly' | 'yearly';
  executive: string | undefined;
  team: string | undefined;
  franchisee: string | undefined;
  kpi: string | undefined;
}

interface ReportFilterFormProps {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  reportType: string;
  userRole: 'Admin' | 'Manager' | 'Executive' | 'Franchisee';
  onGenerate: () => void;
  loading?: boolean;
}

const MOCK_EXECUTIVES = [
  { id: 'exec-1', name: 'Rahul Sharma' },
  { id: 'exec-2', name: 'Priya Patel' },
  { id: 'exec-3', name: 'Amit Kumar' },
];

const MOCK_TEAMS = [
  { id: 'team-1', name: 'Sales Team A' },
  { id: 'team-2', name: 'Sales Team B' },
];

const MOCK_FRANCHISEES = [
  { id: 'fr-1', name: 'North Region' },
  { id: 'fr-2', name: 'South Region' },
  { id: 'fr-3', name: 'East Region' },
];

const MOCK_PERIODS = [
  { value: 'apr-2026', label: 'April 2026' },
  { value: 'mar-2026', label: 'March 2026' },
  { value: 'feb-2026', label: 'February 2026' },
  { value: 'jan-2026', label: 'January 2026' },
  { value: 'q1-2026', label: 'Q1 2026' },
  { value: '2025', label: 'FY 2025' },
];

export function ReportFilterForm({
  filters,
  onChange,
  reportType,
  userRole,
  onGenerate,
  loading = false,
}: ReportFilterFormProps) {
  const showExecutive = ['individual', 'kpi-specific', 'incentive-payout'].includes(reportType);
  const showTeam = ['team', 'franchisee', 'kpi-specific', 'incentive-payout'].includes(reportType);
  const showFranchisee = userRole === 'Admin' || userRole === 'Franchisee';
  const showKpi = ['kpi-specific'].includes(reportType);

  const updateFilter = (key: keyof ReportFilters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">Report Filters</h3>
      
      <div className="space-y-4">
        {/* Period Selection - Always shown */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Period"
            options={[
              { value: '', label: 'Select Period' },
              ...MOCK_PERIODS,
            ]}
            value={filters.period}
            onChange={(e) => updateFilter('period', e.target.value)}
          />
          
          <Select
            label="Period Type"
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
            value={filters.periodType}
            onChange={(e) => updateFilter('periodType', e.target.value)}
          />
        </div>

        {/* Executive Selection */}
        {showExecutive && (userRole === 'Admin' || userRole === 'Manager') && (
          <Select
            label="Executive"
            options={[
              { value: '', label: 'All Executives' },
              ...MOCK_EXECUTIVES.map(e => ({ value: e.id, label: e.name })),
            ]}
            value={filters.executive || ''}
            onChange={(e) => updateFilter('executive', e.target.value)}
          />
        )}

        {/* Team Selection */}
        {showTeam && (
          <Select
            label="Team"
            options={[
              { value: '', label: 'All Teams' },
              ...MOCK_TEAMS.map(t => ({ value: t.id, label: t.name })),
            ]}
            value={filters.team || ''}
            onChange={(e) => updateFilter('team', e.target.value)}
          />
        )}

        {/* Franchisee Selection */}
        {showFranchisee && (
          <Select
            label="Franchisee"
            options={[
              { value: '', label: 'All Franchisees' },
              ...MOCK_FRANCHISEES.map(f => ({ value: f.id, label: f.name })),
            ]}
            value={filters.franchisee || ''}
            onChange={(e) => updateFilter('franchisee', e.target.value)}
          />
        )}

        {/* KPI Selection */}
        {showKpi && (
          <Select
            label="KPI"
            options={[
              { value: '', label: 'All KPIs' },
              ...KPI_CATALOG.slice(0, 6).map(k => ({ value: k.id, label: k.name })),
            ]}
            value={filters.kpi || ''}
            onChange={(e) => updateFilter('kpi', e.target.value)}
          />
        )}

        {/* Generate Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={onGenerate}
            loading={loading}
            className="w-full"
            disabled={!filters.period}
          >
            Generate Report
          </Button>
          {!filters.period && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Please select a period to generate the report
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
