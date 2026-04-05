'use client';

import { useState, useMemo } from 'react';
import { ManagerView } from './ManagerView';
import { Card, Badge, Button, Select } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { Building2, TrendingUp, DollarSign, Users } from 'lucide-react';

interface FranchiseeData {
  franchiseeId: string;
  franchiseeName: string;
  compositeAttainment: number;
  totalSales: number;
  totalCollection: number;
  activeExecutives: number;
  avgAttainment: number;
}

interface AdminViewProps {
  franchisees: FranchiseeData[];
  selectedFranchiseeId?: string;
  onSelectFranchisee?: (franchiseeId: string) => void;
  teamMembers?: any[];
  leaderboard?: any[];
  compositeScore?: number;
  previousCompositeScore?: number;
  trendData?: { label: string; value: number; attainment: number; hasRevision?: boolean }[];
  onViewFranchiseeDetails?: (franchiseeId: string) => void;
}

export function AdminView({
  franchisees,
  selectedFranchiseeId,
  onSelectFranchisee,
  teamMembers = [],
  leaderboard = [],
  compositeScore = 0,
  previousCompositeScore,
  trendData = [],
  onViewFranchiseeDetails,
}: AdminViewProps) {
  const [sortField, setSortField] = useState<'franchiseeName' | 'compositeAttainment' | 'totalSales'>('compositeAttainment');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedFranchisees = useMemo(() => {
    return [...franchisees].sort((a, b) => {
      if (sortField === 'franchiseeName') {
        const aVal = a.franchiseeName;
        const bVal = b.franchiseeName;
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else if (sortField === 'totalSales') {
        const aVal = a.totalSales;
        const bVal = b.totalSales;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      } else {
        const aVal = a.compositeAttainment;
        const bVal = b.compositeAttainment;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
  }, [franchisees, sortField, sortDirection]);

  const getAttainmentColor = (attainment: number) => {
    if (attainment >= 90) return 'text-green-600';
    if (attainment >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttainmentBg = (attainment: number) => {
    if (attainment >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (attainment >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const selectedFranchisee = franchisees.find(f => f.franchiseeId === selectedFranchiseeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin - Cross Franchisee Benchmarking</h1>
          <p className="text-sm text-gray-500 mt-1">Compare performance across all franchisees</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Franchisee</label>
            <Select
              options={[
                { value: '', label: 'All Franchisees' },
                ...franchisees.map(f => ({ value: f.franchiseeId, label: f.franchiseeName })),
              ]}
              value={selectedFranchiseeId || ''}
              onChange={(e) => onSelectFranchisee?.(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {selectedFranchiseeId ? '1 franchisee' : `${franchisees.length} franchisees`}
          </div>
        </div>
      </Card>

      {selectedFranchiseeId && selectedFranchisee ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Composite Attainment</p>
                  <p className={classNames('text-2xl font-bold', getAttainmentColor(selectedFranchisee.compositeAttainment))}>
                    {selectedFranchisee.compositeAttainment.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">₹{selectedFranchisee.totalSales.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Collection</p>
                  <p className="text-2xl font-bold text-gray-900">₹{selectedFranchisee.totalCollection.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Executives</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedFranchisee.activeExecutives}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-sky-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Attainment</p>
                  <p className={classNames('text-2xl font-bold', getAttainmentColor(selectedFranchisee.avgAttainment))}>
                    {selectedFranchisee.avgAttainment.toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {teamMembers.length > 0 && (
            <ManagerView
              teamMembers={teamMembers}
              leaderboard={leaderboard}
              compositeScore={compositeScore}
              previousCompositeScore={previousCompositeScore}
              trendData={trendData}
            />
          )}
        </div>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cross-Franchisee Comparison</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Select
                options={[
                  { value: 'compositeAttainment', label: 'Attainment' },
                  { value: 'totalSales', label: 'Total Sales' },
                  { value: 'franchiseeName', label: 'Franchisee Name' },
                ]}
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="w-40"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Franchisee</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Composite Attainment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Collection</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Active Executives</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Attainment</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedFranchisees.map(franchisee => (
                  <tr key={franchisee.franchiseeId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-slate-600" />
                        </div>
                        <p className="font-medium text-gray-900">{franchisee.franchiseeName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={classNames(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border',
                        getAttainmentBg(franchisee.compositeAttainment)
                      )}>
                        {franchisee.compositeAttainment.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ₹{franchisee.totalSales.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ₹{franchisee.totalCollection.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {franchisee.activeExecutives}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={classNames('font-medium', getAttainmentColor(franchisee.avgAttainment))}>
                        {franchisee.avgAttainment.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewFranchiseeDetails?.(franchisee.franchiseeId)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedFranchisees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No franchisees found
            </div>
          )}
        </Card>
      )}
    </div>
  );
}