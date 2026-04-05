'use client';

import { useState, useMemo, useCallback } from 'react';
import { Role } from '@/store';
import { KPI_CATALOG } from '@/lib/constants';
import { Card, Button, Badge, Select, Input, EmptyState, Modal } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { 
  User, Users, Building2, BarChart3, DollarSign, 
  FileText, Table2, Download, Eye, RefreshCw, 
  Loader2, AlertCircle, CheckCircle, Lock
} from 'lucide-react';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
  allowedRoles: Role[];
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'individual_performance',
    name: 'Individual Performance',
    description: 'Single executive – all KPIs, target vs actual, attainment %, incentive breakdown, trend',
    icon: <User className="w-6 h-6" />,
    formats: ['PDF', 'CSV'],
    allowedRoles: ['Executive', 'Manager', 'Franchisee', 'Admin'],
  },
  {
    id: 'team_report',
    name: 'Team Report',
    description: 'All executives under a manager – side-by-side KPI comparison, team rollup vs target',
    icon: <Users className="w-6 h-6" />,
    formats: ['PDF', 'XLSX'],
    allowedRoles: ['Manager', 'Franchisee', 'Admin'],
  },
  {
    id: 'franchisee_report',
    name: 'Franchisee Report',
    description: 'All teams – team-level rollup, franchisee totals vs franchise targets',
    icon: <Building2 className="w-6 h-6" />,
    formats: ['PDF', 'XLSX'],
    allowedRoles: ['Franchisee', 'Admin'],
  },
  {
    id: 'kpi_specific_report',
    name: 'KPI-Specific Report',
    description: 'One KPI across all executives – target, actual, attainment % per person',
    icon: <BarChart3 className="w-6 h-6" />,
    formats: ['PDF', 'XLSX'],
    allowedRoles: ['Manager', 'Franchisee', 'Admin'],
  },
  {
    id: 'incentive_payout_report',
    name: 'Incentive Payout Report',
    description: 'All executives for a period – commission, slab bonus, composite bonus, total, approval status',
    icon: <DollarSign className="w-6 h-6" />,
    formats: ['PDF', 'XLSX'],
    allowedRoles: ['Manager', 'Franchisee', 'Admin'],
  },
];

interface FilterFields {
  executiveId?: string;
  teamId?: string;
  franchiseeId?: string;
  kpiId?: string;
  period: string;
  includeTrend?: boolean;
  sortBy?: string;
  includeTeamBreakdown?: boolean;
  scope?: string;
  statusFilter?: string[];
}

const MOCK_EXECUTIVES = [
  { id: 'exec-1', name: 'Rahul Sharma', teamId: 'team-1', teamName: 'Sales Team A' },
  { id: 'exec-2', name: 'Priya Patel', teamId: 'team-1', teamName: 'Sales Team A' },
  { id: 'exec-3', name: 'Amit Kumar', teamId: 'team-2', teamName: 'Sales Team B' },
  { id: 'exec-4', name: 'Sneha Reddy', teamId: 'team-2', teamName: 'Sales Team B' },
];

const MOCK_TEAMS = [
  { id: 'team-1', name: 'Sales Team A', franchiseeId: 'fr-1' },
  { id: 'team-2', name: 'Sales Team B', franchiseeId: 'fr-1' },
  { id: 'team-3', name: 'Sales Team C', franchiseeId: 'fr-2' },
];

const MOCK_FRANCHISEES = [
  { id: 'fr-1', name: 'Mumbai Central' },
  { id: 'fr-2', name: 'Delhi North' },
  { id: 'fr-3', name: 'Bangalore West' },
];

const MOCK_PERIODS = [
  { id: 'p-6', label: 'February 2026' },
  { id: 'p-5', label: 'January 2026' },
  { id: 'p-4', label: 'December 2025' },
  { id: 'p-3', label: 'November 2025' },
  { id: 'p-2', label: 'October 2025' },
  { id: 'p-1', label: 'September 2025' },
];

interface ReportGenerationPageProps {
  role: Role;
  userId: string;
}

export function ReportGenerationPage({ role, userId }: ReportGenerationPageProps) {
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [filters, setFilters] = useState<FilterFields>({ period: 'p-5' });
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const accessibleReports = useMemo(() => {
    return REPORT_TYPES.filter(r => r.allowedRoles.includes(role));
  }, [role]);

  const selectedReport = useMemo(() => {
    return REPORT_TYPES.find(r => r.id === selectedReportId);
  }, [selectedReportId]);

  const scopedExecutives = useMemo(() => {
    if (role === 'Executive') {
      return MOCK_EXECUTIVES.filter(e => e.id === userId);
    }
    if (role === 'Manager') {
      return MOCK_EXECUTIVES.filter(e => e.teamId === 'team-1');
    }
    return MOCK_EXECUTIVES;
  }, [role, userId]);

  const scopedTeams = useMemo(() => {
    if (role === 'Manager') {
      return MOCK_TEAMS.filter(t => t.id === 'team-1');
    }
    if (role === 'Franchisee') {
      return MOCK_TEAMS.filter(t => t.franchiseeId === 'fr-1');
    }
    return MOCK_TEAMS;
  }, [role]);

  const getDynamicFields = useCallback(() => {
    switch (selectedReportId) {
      case 'individual_performance':
        return [
          { id: 'executiveId', type: 'select' as const, label: 'Executive', required: true, options: scopedExecutives.map(e => ({ value: e.id, label: e.name })) },
          { id: 'period', type: 'select' as const, label: 'Period', required: true, options: MOCK_PERIODS.map(p => ({ value: p.id, label: p.label })) },
          { id: 'includeTrend', type: 'checkbox' as const, label: 'Include trend chart', default: true },
        ];
      case 'team_report':
        return [
          { id: 'teamId', type: 'select' as const, label: 'Team', required: true, options: scopedTeams.map(t => ({ value: t.id, label: t.name })) },
          { id: 'period', type: 'select' as const, label: 'Period', required: true, options: MOCK_PERIODS.map(p => ({ value: p.id, label: p.label })) },
          { id: 'sortBy', type: 'select' as const, label: 'Sort by', options: [
            { value: 'name', label: 'Executive Name' },
            { value: 'composite', label: 'Composite Attainment' },
            { value: 'sales', label: 'Sales Attainment' },
          ]},
        ];
      case 'franchisee_report':
        return [
          { id: 'franchiseeId', type: 'select' as const, label: 'Franchisee', required: role === 'Admin', options: MOCK_FRANCHISEES.map(f => ({ value: f.id, label: f.name })), visible: role === 'Admin' },
          { id: 'period', type: 'select' as const, label: 'Period', required: true, options: MOCK_PERIODS.map(p => ({ value: p.id, label: p.label })) },
          { id: 'includeTeamBreakdown', type: 'checkbox' as const, label: 'Include team breakdown', default: true },
        ];
      case 'kpi_specific_report':
        return [
          { id: 'kpiId', type: 'select' as const, label: 'KPI', required: true, options: KPI_CATALOG.map(k => ({ value: k.id, label: k.name })) },
          { id: 'period', type: 'select' as const, label: 'Period', required: true, options: MOCK_PERIODS.map(p => ({ value: p.id, label: p.label })) },
        ];
      case 'incentive_payout_report':
        return [
          { id: 'period', type: 'select' as const, label: 'Period', required: true, options: MOCK_PERIODS.map(p => ({ value: p.id, label: p.label })) },
          { id: 'statusFilter', type: 'multi-select' as const, label: 'Payout Status', options: [
            { value: 'Pending Calculation', label: 'Pending Calculation' },
            { value: 'Calculated', label: 'Calculated' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Exported', label: 'Exported' },
          ]},
          ...(role === 'Admin' ? [{ id: 'teamId', type: 'select' as const, label: 'Team', options: scopedTeams.map(t => ({ value: t.id, label: t.name })) }] : []),
        ];
      default:
        return [];
    }
  }, [selectedReportId, role, scopedExecutives, scopedTeams]);

  const handleFilterChange = (fieldId: string, value: any) => {
    setFilters(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleGeneratePreview = async () => {
    setShowPreview(true);
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  const handleExport = async (format: 'PDF' | 'XLSX' | 'CSV') => {
    setIsExporting(true);
    setExportSuccess(false);
    
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 2000);
  };

  const requiredFields = getDynamicFields().filter(f => f.required);
  const canGenerate = requiredFields.every(f => {
    const value = filters[f.id as keyof FilterFields];
    return value !== undefined && value !== '';
  });

  const getScopeNote = (reportId: string) => {
    switch (reportId) {
      case 'individual_performance':
        return role === 'Executive' ? 'You can export your own report' : 'Select any executive within your scope';
      case 'team_report':
        return role === 'Manager' ? 'Shows your team only' : 'Shows all teams in your scope';
      case 'franchisee_report':
        return role === 'Franchisee' ? 'Shows your franchisee' : 'Select any franchisee';
      default:
        return 'Scope determined by your role';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Generation</h1>
          <p className="text-sm text-gray-500 mt-1">Export performance and incentive reports</p>
        </div>
        <Badge variant="info">{role}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {accessibleReports.map((report) => (
          <Card
            key={report.id}
            className={classNames(
              'cursor-pointer transition-all hover:shadow-lg',
              selectedReportId === report.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:border-blue-300'
            )}
            onClick={() => {
              setSelectedReportId(report.id);
              setFilters({ period: 'p-5' });
            }}
          >
            <div className="flex flex-col items-center text-center p-4">
              <div className={classNames(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                selectedReportId === report.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              )}>
                {report.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{report.name}</h3>
              <div className="flex gap-1 mt-2">
                {report.formats.map((format) => (
                  <Badge key={format} size="sm" variant="default">{format}</Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {accessibleReports.length === 0 && (
        <Card>
          <EmptyState
            title="No Reports Available"
            description="You don't have permission to generate any reports."
            icon={<FileText className="w-12 h-12 text-gray-400" />}
          />
        </Card>
      )}

      {selectedReport && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-gray-900">Report Filters</h3>
                <Badge variant="default" size="sm">{selectedReport.name}</Badge>
              </div>

              <p className="text-xs text-gray-500 mb-4">{getScopeNote(selectedReport.id)}</p>

              <div className="space-y-4">
                {getDynamicFields().map((field) => {
                  if ('visible' in field && !field.visible) return null;
                  
                  return (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {field.type === 'select' && (
                        <Select
                          options={field.options || []}
                          value={filters[field.id as keyof FilterFields] as string || ''}
                          onChange={(e) => handleFilterChange(field.id, e.target.value)}
                        />
                      )}
                      
                      {field.type === 'checkbox' && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters[field.id as keyof FilterFields] as boolean ?? field.default ?? false}
                            onChange={(e) => handleFilterChange(field.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">{field.label}</span>
                        </label>
                      )}
                      
                      {field.type === 'multi-select' && (
                        <div className="flex flex-wrap gap-2">
                          {(field.options || []).map((opt: any) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                const current = filters.statusFilter || [];
                                const newValue = current.includes(opt.value)
                                  ? current.filter((v: string) => v !== opt.value)
                                  : [...current, opt.value];
                                handleFilterChange(field.id, newValue);
                              }}
                              className={classNames(
                                'px-2 py-1 text-xs rounded-full border transition-colors',
                                (filters.statusFilter || []).includes(opt.value)
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-600'
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                variant="secondary"
                className="w-full mt-6"
                onClick={handleGeneratePreview}
                disabled={!canGenerate}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Report
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="min-h-[400px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Report Preview</h3>
                {showPreview && (
                  <Button variant="ghost" size="sm" onClick={handleGeneratePreview}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                )}
              </div>

              {showPreview ? (
                isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                    <p className="text-sm text-gray-500">Generating preview...</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="border-b pb-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">B</span>
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-gray-900">Bizpole ONE</h2>
                            <p className="text-xs text-gray-500">KPI & Incentive Module</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Generated by</p>
                          <p className="text-sm font-medium">{role}</p>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <h3 className="text-xl font-semibold text-gray-900">{selectedReport.name}</h3>
                        <p className="text-sm text-gray-500">Period: {MOCK_PERIODS.find(p => p.id === filters.period)?.label}</p>
                      </div>
                    </div>

                    <div className="text-center py-8">
                      <p className="text-gray-500">Report data will appear here...</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {selectedReportId === 'individual_performance' && 'KPI table with target vs actual, attainment %, incentive breakdown'}
                        {selectedReportId === 'team_report' && 'Team members table with side-by-side KPI comparison'}
                        {selectedReportId === 'franchisee_report' && 'Franchisee summary with team rollup'}
                        {selectedReportId === 'kpi_specific_report' && 'Single KPI across all executives'}
                        {selectedReportId === 'incentive_payout_report' && 'Incentive breakdown with approval status'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t text-center text-xs text-gray-400">
                      <p>Confidential – For internal use only</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <Eye className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Select report type and filters, then click 'Preview'</p>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Export Report</h3>
                  <p className="text-sm text-gray-500">Download in your preferred format</p>
                </div>
                {exportSuccess && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Downloaded!</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                {selectedReport.formats.includes('PDF') && (
                  <Button
                    onClick={() => handleExport('PDF')}
                    disabled={!canGenerate || isExporting}
                    className="flex-1"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4 mr-2" />
                    )}
                    Download PDF
                  </Button>
                )}
                {selectedReport.formats.includes('XLSX') && (
                  <Button
                    variant="secondary"
                    onClick={() => handleExport('XLSX')}
                    disabled={!canGenerate || isExporting}
                    className="flex-1"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Table2 className="w-4 h-4 mr-2" />
                    )}
                    Download Excel
                  </Button>
                )}
                {selectedReport.formats.includes('CSV') && (
                  <Button
                    variant="secondary"
                    onClick={() => handleExport('CSV')}
                    disabled={!canGenerate || isExporting}
                    className="flex-1"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Table2 className="w-4 h-4 mr-2" />
                    )}
                    Download CSV
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}