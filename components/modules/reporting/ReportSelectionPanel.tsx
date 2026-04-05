'use client';

import { Card, Button, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';

export type ReportType = 'individual' | 'team' | 'franchisee' | 'kpi-specific' | 'incentive-payout';

type ExporterRole = 'Executive' | 'Manager' | 'Franchisee' | 'Admin' | 'Manager (own team)';

interface ReportTypeCardProps {
  type: ReportType;
  title: string;
  description: string;
  formats: ('PDF' | 'CSV' | 'XLSX')[];
  exporters: ExporterRole[];
  selected: boolean;
  onClick: () => void;
}

export function ReportTypeCard({
  type,
  title,
  description,
  formats,
  exporters,
  selected,
  onClick,
}: ReportTypeCardProps) {
  const formatColors: Record<string, string> = {
    PDF: 'bg-red-100 text-red-700',
    CSV: 'bg-green-100 text-green-700',
    XLSX: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div
      onClick={onClick}
      className={classNames(
        'p-4 border-2 rounded-lg cursor-pointer transition-all',
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {selected && (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Formats:</span>
          <div className="flex gap-1">
            {formats.map((format) => (
              <Badge key={format} size="sm" className={formatColors[format]}>
                {format}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Exporters:</span>
          <div className="flex gap-1">
            {exporters.map((role) => (
              <Badge key={role} size="sm" variant="default">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReportSelectionPanelProps {
  selectedReport: ReportType;
  onSelectReport: (type: ReportType) => void;
  userRole: 'Admin' | 'Manager' | 'Executive' | 'Franchisee';
}

const REPORT_TYPES = [
  {
    type: 'individual' as ReportType,
    title: 'Individual Performance Report',
    description: 'Performance metrics and KPI attainment for a single executive',
    formats: ['PDF', 'CSV'] as ('PDF' | 'CSV')[],
    exporters: ['Executive', 'Manager', 'Franchisee', 'Admin'] as ExporterRole[],
  },
  {
    type: 'team' as ReportType,
    title: 'Team Report',
    description: 'Aggregated team performance with individual breakdowns',
    formats: ['PDF', 'XLSX'] as ('PDF' | 'XLSX')[],
    exporters: ['Manager', 'Franchisee', 'Admin'] as ExporterRole[],
  },
  {
    type: 'franchisee' as ReportType,
    title: 'Franchisee Report',
    description: 'Cross-team performance for the entire franchisee',
    formats: ['PDF', 'XLSX'] as ('PDF' | 'XLSX')[],
    exporters: ['Franchisee', 'Admin'] as ExporterRole[],
  },
  {
    type: 'kpi-specific' as ReportType,
    title: 'KPI-Specific Report',
    description: 'Detailed analysis of a specific KPI across executives',
    formats: ['PDF', 'XLSX'] as ('PDF' | 'XLSX')[],
    exporters: ['Manager', 'Franchisee', 'Admin'] as ExporterRole[],
  },
  {
    type: 'incentive-payout' as ReportType,
    title: 'Incentive Payout Report',
    description: 'Commission, slab bonuses, and composite bonus breakdown',
    formats: ['PDF', 'XLSX'] as ('PDF' | 'XLSX')[],
    exporters: ['Manager (own team)', 'Franchisee', 'Admin'] as ExporterRole[],
  },
];

export function ReportSelectionPanel({
  selectedReport,
  onSelectReport,
  userRole,
}: ReportSelectionPanelProps) {
  const canAccessReport = (exporters: string[]) => {
    if (userRole === 'Admin') return true;
    if (userRole === 'Franchisee') return exporters.includes('Franchisee');
    if (userRole === 'Manager') return exporters.includes('Manager') || exporters.includes('Manager (own team)');
    if (userRole === 'Executive') return exporters.includes('Executive');
    return false;
  };

  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-4">Select Report Type</h3>
      <div className="space-y-3">
        {REPORT_TYPES.map((report) => {
          const accessible = canAccessReport(report.exporters);
          return (
            <ReportTypeCard
              key={report.type}
              {...report}
              selected={selectedReport === report.type}
              onClick={() => accessible && onSelectReport(report.type)}
            />
          );
        })}
      </div>
    </Card>
  );
}
