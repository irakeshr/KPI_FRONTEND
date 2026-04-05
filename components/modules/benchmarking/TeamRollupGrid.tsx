'use client';

import { useState, useMemo } from 'react';
import { Executive, Kpi } from '@/types';
import { KPI_CATALOG } from '@/lib/constants';
import { Card, Button, Badge, Select, Input } from '@/components/ui';
import { calculateAttainment, formatAttainment, classNames } from '@/lib/utils';
import { Search, Download, Filter, AlertCircle } from 'lucide-react';

interface TeamMemberKpi {
  executiveId: string;
  executiveName: string;
  teamName: string;
  kpis: {
    kpiId: string;
    kpiName: string;
    target: number;
    actual: number;
    attainment: number;
    benchmark?: number;
    ceiling?: number;
    isBreached?: boolean;
  }[];
  compositeAttainment: number;
}

interface TeamRollupGridProps {
  members: TeamMemberKpi[];
  kpis?: Kpi[];
  onExecutiveClick?: (executiveId: string) => void;
  sortable?: boolean;
  searchable?: boolean;
  exportable?: boolean;
  filterableByKpi?: boolean;
}

type SortField = 'name' | 'composite' | string;
type SortDirection = 'asc' | 'desc';

export function TeamRollupGrid({
  members,
  kpis = KPI_CATALOG,
  onExecutiveClick,
  sortable = true,
  searchable = true,
  exportable = true,
  filterableByKpi = true,
}: TeamRollupGridProps) {
  const [sortField, setSortField] = useState<SortField>('composite');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterKpi, setFilterKpi] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMembers = useMemo(() => {
    let filtered = members;

    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.executiveName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.teamName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterKpi) {
      filtered = filtered.filter(m => m.kpis.some(k => k.kpiId === filterKpi));
    }

    return filtered;
  }, [members, searchQuery, filterKpi]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      if (sortField === 'name') {
        aVal = a.executiveName;
        bVal = b.executiveName;
      } else if (sortField === 'composite') {
        aVal = a.compositeAttainment;
        bVal = b.compositeAttainment;
      } else {
        const aKpi = a.kpis.find(k => k.kpiId === sortField);
        const bKpi = b.kpis.find(k => k.kpiId === sortField);
        aVal = aKpi?.attainment || 0;
        bVal = bKpi?.attainment || 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [filteredMembers, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortable) {
      if (sortField === field) {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('desc');
      }
    }
  };

  const getAttainmentColor = (attainment: number) => {
    if (attainment >= 90) return 'bg-green-500';
    if (attainment >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (attainment: number) => {
    if (attainment >= 90) return 'text-green-600';
    if (attainment >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  const kpiOptions = [
    { value: '', label: 'All KPIs' },
    ...kpis.map(k => ({ value: k.id, label: k.name })),
  ];

  const KPI_COLUMNS = [
    { key: 'kpi-01', label: 'Sales', format: 'percentage' },
    { key: 'kpi-02', label: 'Collection', format: 'percentage' },
    { key: 'kpi-03', label: 'Lead Relevancy', format: 'percentage' },
    { key: 'kpi-04', label: 'Lead Conversion', format: 'percentage' },
    { key: 'kpi-05', label: 'Call Connect', format: 'percentage' },
    { key: 'kpi-06', label: 'Deals', format: 'number' },
    { key: 'kpi-07', label: 'Quotes', format: 'number' },
    { key: 'kpi-08', label: 'Customer Touch', format: 'number' },
    { key: 'kpi-09', label: 'Dialed Calls', format: 'number' },
    { key: 'kpi-10', label: 'Talk Time', format: 'minutes' },
    { key: 'kpi-11', label: 'Clients', format: 'number' },
    { key: 'kpi-12', label: 'Services', format: 'number' },
    { key: 'kpi-13', label: 'TAT', format: 'days', special: true },
  ];

  const getCellValue = (kpiData: any, format: string, special?: boolean) => {
    if (!kpiData) return <span className="text-gray-400">-</span>;

    if (special && kpiData.kpiId === 'kpi-13') {
      return (
        <div className="flex flex-col items-center">
          <span className={getTextColor(kpiData.attainment)}>
            {kpiData.actual} days
          </span>
          {kpiData.isBreached && (
            <Badge variant="danger" size="sm" className="mt-1">Breached</Badge>
          )}
        </div>
      );
    }

    if (format === 'percentage') {
      return (
        <div className="flex flex-col items-center">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={classNames('h-full rounded-full', getAttainmentColor(kpiData.attainment))}
              style={{ width: `${Math.min(kpiData.attainment, 100)}%` }}
            />
          </div>
          <span className={classNames('text-xs font-medium mt-1', getTextColor(kpiData.attainment))}>
            {formatAttainment(kpiData.attainment)}
          </span>
        </div>
      );
    }

    if (format === 'minutes') {
      return (
        <span className="text-gray-900">{kpiData.actual} min</span>
      );
    }

    return (
      <span className={getTextColor(kpiData.attainment)}>{kpiData.actual}</span>
    );
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h3 className="font-semibold text-gray-900">Team Performance</h3>
        
        <div className="flex items-center gap-3 flex-wrap">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search executives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
          )}

          {filterableByKpi && (
            <Select
              options={kpiOptions}
              value={filterKpi}
              onChange={(e) => setFilterKpi(e.target.value)}
              className="w-40"
            />
          )}

          {exportable && (
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className={classNames(
                  'px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white',
                  sortable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                )}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Executive
                  {sortField === 'name' && (
                    <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              {KPI_COLUMNS.map(col => (
                <th
                  key={col.key}
                  className={classNames(
                    'px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap',
                    sortable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{col.label}</span>
                    {sortField === col.key && (
                      <span className="text-blue-600 text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
              <th 
                className={classNames(
                  'px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider',
                  sortable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                )}
                onClick={() => handleSort('composite')}
              >
                <div className="flex items-center justify-center gap-1">
                  Composite
                  {sortField === 'composite' && (
                    <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedMembers.map((member) => (
              <tr 
                key={member.executiveId} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onExecutiveClick?.(member.executiveId)}
              >
                <td className="px-3 py-3 sticky left-0 bg-white">
                  <div>
                    <p className="font-medium text-gray-900">{member.executiveName}</p>
                    <p className="text-xs text-gray-500">{member.teamName}</p>
                  </div>
                </td>
                {KPI_COLUMNS.map(col => {
                  const kpiData = member.kpis.find(k => k.kpiId === col.key);
                  return (
                    <td key={col.key} className="px-2 py-3 text-center">
                      {getCellValue(kpiData, col.format, col.special)}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center">
                  <Badge 
                    variant={
                      member.compositeAttainment >= 90 ? 'success' :
                      member.compositeAttainment >= 60 ? 'warning' : 'danger'
                    }
                    size="lg"
                  >
                    {formatAttainment(member.compositeAttainment)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedMembers.length === 0 && (
        <div className="text-center py-8">
          {searchQuery || filterKpi ? (
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-gray-400" />
              <p className="text-gray-500">No results match your filters. Clear filters to see all data.</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSearchQuery(''); setFilterKpi(''); }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <p className="text-gray-500">No executives in this team yet.</p>
          )}
        </div>
      )}
    </Card>
  );
}