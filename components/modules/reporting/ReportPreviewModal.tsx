'use client';

import { Modal, Button, Badge } from '@/components/ui';
import { ReportType } from './ReportSelectionPanel';
import { formatDate, classNames } from '@/lib/utils';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  filters: {
    period: string;
    executive?: string;
    team?: string;
    franchisee?: string;
    kpi?: string;
  };
  onExport: (format: 'pdf' | 'excel') => void;
  exporting?: boolean;
}

export function ReportPreviewModal({
  isOpen,
  onClose,
  reportType,
  filters,
  onExport,
  exporting = false,
}: ReportPreviewModalProps) {
  const getReportTitle = () => {
    switch (reportType) {
      case 'individual': return 'Individual Performance Report';
      case 'team': return 'Team Performance Report';
      case 'franchisee': return 'Franchisee Performance Report';
      case 'kpi-specific': return 'KPI-Specific Analysis Report';
      case 'incentive-payout': return 'Incentive Payout Report';
    }
  };

  const mockData = {
    individual: [
      { kpi: 'Sales', target: 100, actual: 95, attainment: 95 },
      { kpi: 'Collection', target: 95, actual: 92, attainment: 96.8 },
      { kpi: 'Lead Relevancy', target: 85, actual: 82, attainment: 96.5 },
      { kpi: 'Lead Conversion', target: 30, actual: 28, attainment: 93.3 },
      { kpi: 'Call Connect Rate', target: 75, actual: 78, attainment: 104 },
    ],
    team: [
      { executive: 'Rahul Sharma', composite: 94.5, onTarget: 4, nearTarget: 1 },
      { executive: 'Priya Patel', composite: 88.2, onTarget: 3, nearTarget: 2 },
      { executive: 'Amit Kumar', composite: 76.8, onTarget: 2, nearTarget: 3 },
    ],
    kpi: [
      { executive: 'Rahul Sharma', attainment: 95 },
      { executive: 'Priya Patel', attainment: 88 },
      { executive: 'Amit Kumar', attainment: 72 },
      { executive: 'Sneha Gupta', attainment: 92 },
      { executive: 'Vikram Singh', attainment: 55 },
    ],
    incentive: [
      { name: 'Rahul Sharma', commission: 12500, slab: 15000, composite: 5000, total: 32500 },
      { name: 'Priya Patel', commission: 15000, slab: 20000, composite: 5000, total: 40000 },
    ],
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Preview"
      size="xl"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => onExport('excel')}
              disabled={exporting}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </Button>
            <Button
              onClick={() => onExport('pdf')}
              disabled={exporting}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </Button>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Report Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{getReportTitle()}</h2>
                <p className="text-sm text-gray-500">Bizpole ONE - KPI Module</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="success">CONFIDENTIAL</Badge>
              <p className="text-xs text-gray-500 mt-1">
                Generated: {formatDate(new Date(), 'short')} by System
              </p>
            </div>
          </div>
        </div>

        {/* Filters Applied */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Filters Applied</h4>
          <div className="flex flex-wrap gap-2">
            {filters.period && (
              <Badge variant="default">Period: {filters.period}</Badge>
            )}
            {filters.executive && (
              <Badge variant="default">Executive: {filters.executive}</Badge>
            )}
            {filters.team && (
              <Badge variant="default">Team: {filters.team}</Badge>
            )}
            {filters.franchisee && (
              <Badge variant="default">Franchisee: {filters.franchisee}</Badge>
            )}
            {filters.kpi && (
              <Badge variant="default">KPI: {filters.kpi}</Badge>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          {reportType === 'individual' && (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Target</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actual</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attainment</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockData.individual.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm font-medium">{row.kpi}</td>
                    <td className="px-4 py-3 text-sm text-center">{row.target}%</td>
                    <td className="px-4 py-3 text-sm text-center">{row.actual}%</td>
                    <td className="px-4 py-3 text-sm text-center font-medium">{row.attainment}%</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={row.attainment >= 90 ? 'success' : row.attainment >= 60 ? 'warning' : 'danger'}>
                        {row.attainment >= 90 ? 'On Track' : row.attainment >= 60 ? 'Near' : 'Below'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'team' && (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Executive</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Composite Attainment</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">On Target</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Near Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockData.team.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm font-medium">{row.executive}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium">{row.composite}%</td>
                    <td className="px-4 py-3 text-sm text-center text-green-600">{row.onTarget}</td>
                    <td className="px-4 py-3 text-sm text-center text-yellow-600">{row.nearTarget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'incentive-payout' && (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Executive</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Slab Bonus</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Composite</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockData.incentive.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-right">₹{row.commission.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">₹{row.slab.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right">₹{row.composite.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold">₹{row.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
          <p>This report contains confidential information. Unauthorized distribution is prohibited.</p>
          <p className="mt-1">Page 1 of 1 | Generated by Bizpole ONE KPI Module</p>
        </div>
      </div>
    </Modal>
  );
}
