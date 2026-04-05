'use client';

import { useState, useMemo } from 'react';
import { TeamRollupGrid } from './TeamRollupGrid';
import { TrendChart } from './TrendChart';
import { Card, Badge, Button, Select } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { Users, TrendingUp, DollarSign, Building2 } from 'lucide-react';

interface TeamData {
  teamId: string;
  teamName: string;
  compositeAttainment: number;
  totalSales: number;
  totalCollection: number;
  topPerformer: string;
  executives: {
    executiveId: string;
    executiveName: string;
    kpis: { kpiId: string; attainment: number }[];
    compositeAttainment: number;
  }[];
}

interface FranchiseeViewProps {
  franchiseeName: string;
  period: string;
  compositeAttainment: number;
  previousCompositeAttainment?: number;
  totalSales: number;
  totalCollection: number;
  teamCount: number;
  executiveCount: number;
  teams: TeamData[];
  trendData?: { label: string; value: number; attainment: number; hasRevision?: boolean }[];
}

export function FranchiseeView({
  franchiseeName,
  period,
  compositeAttainment,
  previousCompositeAttainment,
  totalSales,
  totalCollection,
  teamCount,
  executiveCount,
  teams,
  trendData = [],
}: FranchiseeViewProps) {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'teamName' | 'compositeAttainment'>('compositeAttainment');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const aVal = sortField === 'teamName' ? a.teamName : a.compositeAttainment;
      const bVal = sortField === 'teamName' ? b.teamName : b.compositeAttainment;
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [teams, sortField, sortDirection]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Franchisee Performance</h1>
          <p className="text-sm text-gray-500 mt-1">{franchiseeName} • {period}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Composite Attainment</p>
              <p className={classNames('text-2xl font-bold', getAttainmentColor(compositeAttainment))}>
                {compositeAttainment.toFixed(1)}%
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
              <p className="text-2xl font-bold text-gray-900">₹{totalSales.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">₹{totalCollection.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Teams</p>
              <p className="text-2xl font-bold text-gray-900">{teamCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-sky-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Executives</p>
              <p className="text-2xl font-bold text-gray-900">{executiveCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Performance Breakdown</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <Select
              options={[
                { value: 'compositeAttainment', label: 'Attainment' },
                { value: 'teamName', label: 'Team Name' },
              ]}
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="w-36"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Composite Attainment</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Collection</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Performer</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedTeams.map(team => (
                <>
                  <tr key={team.teamId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{team.teamName}</p>
                      <p className="text-xs text-gray-500">{team.executives.length} executives</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={classNames(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border',
                        getAttainmentBg(team.compositeAttainment)
                      )}>
                        {team.compositeAttainment.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ₹{team.totalSales.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      ₹{team.totalCollection.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{team.topPerformer}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleTeam(team.teamId)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {expandedTeams.has(team.teamId) ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedTeams.has(team.teamId) && (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 bg-gray-50">
                        <div className="pl-8">
                          <p className="text-sm font-medium text-gray-700 mb-2">Team Executives</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {team.executives.map(exec => (
                              <div key={exec.executiveId} className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-900">{exec.executiveName}</p>
                                <p className={classNames('text-lg font-bold', getAttainmentColor(exec.compositeAttainment))}>
                                  {exec.compositeAttainment.toFixed(1)}%
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {sortedTeams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No teams found for this franchisee
          </div>
        )}
      </Card>

      {trendData.length > 0 && (
        <TrendChart
          title="Franchisee Performance Trend"
          data={trendData}
          showRevisionIndicator={true}
        />
      )}
    </div>
  );
}