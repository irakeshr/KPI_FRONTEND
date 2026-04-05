'use client';

import { useState, useMemo } from 'react';
import { Role } from '@/store/authStore';
import { Card, Badge, Button, Input, Select } from '@/components/ui';
import { BarChart } from '@/components/ui/BarChart';
import { 
  Users, UserCog, Search, Filter, MoreVertical, 
  TrendingUp, TrendingDown, Minus, Star, Crown, Award,
  Mail, Phone, Building2, ChevronLeft, ChevronRight,
  Trophy, Medal
} from 'lucide-react';
import { classNames } from '@/lib/utils';

export interface Executive {
  id: string;
  name: string;
  email: string;
  phone: string;
  teamId: string;
  teamName: string;
  franchiseeId: string;
  franchiseeName: string;
  status: 'active' | 'inactive';
  avgAttainment: number;
  rank: number;
  totalSales: number;
  totalCollection: number;
  joinedAt: string;
  lastActiveAt: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  teamId: string;
  teamName: string;
  franchiseeId: string;
  franchiseeName: string;
  status: 'active' | 'inactive';
  teamSize: number;
  teamAvgAttainment: number;
  totalTeamSales: number;
  totalTeamCollection: number;
  joinedAt: string;
}

export interface ExecutiveApiResponse {
  items: Executive[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ManagerApiResponse {
  items: Manager[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExecutiveFilters {
  search: string;
  teamId: string;
  franchiseeId: string;
  status: string;
}

export interface ManagerFilters {
  search: string;
  teamId: string;
  franchiseeId: string;
  status: string;
}

const MOCK_EXECUTIVES: Executive[] = [
  { id: 'exec-1', name: 'Rahul Sharma', email: 'rahul@bizpole.com', phone: '+91 98765 43210', teamId: 'team-1', teamName: 'Sales Team A', franchiseeId: 'fran-1', franchiseeName: 'North Region', status: 'active', avgAttainment: 92, rank: 1, totalSales: 2500000, totalCollection: 2300000, joinedAt: '2023-01-15', lastActiveAt: '2024-03-15' },
  { id: 'exec-2', name: 'Priya Patel', email: 'priya@bizpole.com', phone: '+91 98765 43211', teamId: 'team-1', teamName: 'Sales Team A', franchiseeId: 'fran-1', franchiseeName: 'North Region', status: 'active', avgAttainment: 88, rank: 2, totalSales: 2100000, totalCollection: 1950000, joinedAt: '2023-02-20', lastActiveAt: '2024-03-15' },
  { id: 'exec-3', name: 'Amit Kumar', email: 'amit@bizpole.com', phone: '+91 98765 43212', teamId: 'team-2', teamName: 'Sales Team B', franchiseeId: 'fran-1', franchiseeName: 'North Region', status: 'active', avgAttainment: 85, rank: 3, totalSales: 1800000, totalCollection: 1650000, joinedAt: '2023-03-10', lastActiveAt: '2024-03-14' },
  { id: 'exec-4', name: 'Sneha Reddy', email: 'sneha@bizpole.com', phone: '+91 98765 43213', teamId: 'team-2', teamName: 'Sales Team B', franchiseeId: 'fran-2', franchiseeName: 'South Region', status: 'active', avgAttainment: 82, rank: 4, totalSales: 1650000, totalCollection: 1500000, joinedAt: '2023-04-05', lastActiveAt: '2024-03-15' },
  { id: 'exec-5', name: 'Vikram Singh', email: 'vikram@bizpole.com', phone: '+91 98765 43214', teamId: 'team-3', teamName: 'Sales Team C', franchiseeId: 'fran-2', franchiseeName: 'South Region', status: 'active', avgAttainment: 79, rank: 5, totalSales: 1450000, totalCollection: 1320000, joinedAt: '2023-05-12', lastActiveAt: '2024-03-13' },
  { id: 'exec-6', name: 'Anjali Mehta', email: 'anjali@bizpole.com', phone: '+91 98765 43215', teamId: 'team-3', teamName: 'Sales Team C', franchiseeId: 'fran-3', franchiseeName: 'East Region', status: 'inactive', avgAttainment: 0, rank: 0, totalSales: 0, totalCollection: 0, joinedAt: '2023-06-01', lastActiveAt: '2024-01-10' },
];

const MOCK_MANAGERS: Manager[] = [
  { id: 'mgr-1', name: 'Anita Sharma', email: 'anita@bizpole.com', phone: '+91 98765 43001', teamId: 'team-1', teamName: 'Sales Team A', franchiseeId: 'fran-1', franchiseeName: 'North Region', status: 'active', teamSize: 8, teamAvgAttainment: 90, totalTeamSales: 12000000, totalTeamCollection: 11000000, joinedAt: '2022-01-10' },
  { id: 'mgr-2', name: 'Rajesh Kumar', email: 'rajesh@bizpole.com', phone: '+91 98765 43002', teamId: 'team-2', teamName: 'Sales Team B', franchiseeId: 'fran-1', franchiseeName: 'North Region', status: 'active', teamSize: 6, teamAvgAttainment: 85, totalTeamSales: 8500000, totalTeamCollection: 7800000, joinedAt: '2022-03-15' },
  { id: 'mgr-3', name: 'Sunita Devi', email: 'sunita@bizpole.com', phone: '+91 98765 43003', teamId: 'team-3', teamName: 'Sales Team C', franchiseeId: 'fran-2', franchiseeName: 'South Region', status: 'active', teamSize: 10, teamAvgAttainment: 82, totalTeamSales: 15000000, totalTeamCollection: 13500000, joinedAt: '2022-02-01' },
  { id: 'mgr-4', name: 'Mohit Gupta', email: 'mohit@bizpole.com', phone: '+91 98765 43004', teamId: 'team-4', teamName: 'Sales Team D', franchiseeId: 'fran-3', franchiseeName: 'East Region', status: 'active', teamSize: 5, teamAvgAttainment: 78, totalTeamSales: 6500000, totalTeamCollection: 5900000, joinedAt: '2022-06-20' },
  { id: 'mgr-5', name: 'Pooja Singh', email: 'pooja@bizpole.com', phone: '+91 98765 43005', teamId: 'team-5', teamName: 'Sales Team E', franchiseeId: 'fran-4', franchiseeName: 'West Region', status: 'inactive', teamSize: 0, teamAvgAttainment: 0, totalTeamSales: 0, totalTeamCollection: 0, joinedAt: '2022-04-10' },
];

export function AdminManagementPage({ role, userId }: { role: Role; userId: string }) {
  const [activeTab, setActiveTab] = useState<'executives' | 'managers'>('executives');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterFranchisee, setFilterFranchisee] = useState('');

  const filteredExecutives = MOCK_EXECUTIVES.filter(exec => {
    const matchesSearch = exec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exec.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = !filterTeam || exec.teamId === filterTeam;
    const matchesFranchisee = !filterFranchisee || exec.franchiseeId === filterFranchisee;
    return matchesSearch && matchesTeam && matchesFranchisee;
  });

  const filteredManagers = MOCK_MANAGERS.filter(mgr => {
    const matchesSearch = mgr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mgr.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = !filterTeam || mgr.teamId === filterTeam;
    const matchesFranchisee = !filterFranchisee || mgr.franchiseeId === filterFranchisee;
    return matchesSearch && matchesTeam && matchesFranchisee;
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-gray-400 font-medium">#{rank}</span>;
  };

  const getAttainmentTrend = (attainment: number) => {
    if (attainment >= 90) return { icon: <TrendingUp className="w-4 h-4 text-green-500" />, color: 'text-green-600', bg: 'bg-green-50' };
    if (attainment >= 60) return { icon: <Minus className="w-4 h-4 text-amber-500" />, color: 'text-amber-600', bg: 'bg-amber-50' };
    return { icon: <TrendingDown className="w-4 h-4 text-red-500" />, color: 'text-red-600', bg: 'bg-red-50' };
  };

  const teams = [...new Set([...MOCK_EXECUTIVES.map(e => e.teamName), ...MOCK_MANAGERS.map(m => m.teamName)])];
  const franchisees = [...new Set([...MOCK_EXECUTIVES.map(e => e.franchiseeName), ...MOCK_MANAGERS.map(m => m.franchiseeName)])];

  const executiveBarChartData = useMemo(() => {
    return MOCK_EXECUTIVES
      .filter(e => e.status === 'active')
      .sort((a, b) => b.avgAttainment - a.avgAttainment)
      .slice(0, 6)
      .map(exec => ({
        label: exec.name.split(' ')[0],
        value: exec.avgAttainment,
      }));
  }, []);

  const managerBarChartData = useMemo(() => {
    return MOCK_MANAGERS
      .filter(m => m.status === 'active')
      .sort((a, b) => b.teamAvgAttainment - a.teamAvgAttainment)
      .slice(0, 6)
      .map(mgr => ({
        label: mgr.name.split(' ')[0],
        value: mgr.teamAvgAttainment,
      }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage executives and managers across organization</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          <button
            onClick={() => setActiveTab('executives')}
            className={classNames(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'executives'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <Users className="w-4 h-4" />
            Executives
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              {MOCK_EXECUTIVES.filter(e => e.status === 'active').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('managers')}
            className={classNames(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'managers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <UserCog className="w-4 h-4" />
            Managers
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              {MOCK_MANAGERS.filter(m => m.status === 'active').length}
            </span>
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="w-48">
          <Select
            options={[{ value: '', label: 'All Teams' }, ...teams.map(t => ({ value: t, label: t }))]}
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={[{ value: '', label: 'All Franchisees' }, ...franchisees.map(f => ({ value: f, label: f }))]}
            value={filterFranchisee}
            onChange={(e) => setFilterFranchisee(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'executives' && (
          <BarChart
            title="Executive Rankings"
            subtitle="Top performers by attainment"
            data={executiveBarChartData}
            height={200}
          />
        )}
        {activeTab === 'managers' && (
          <BarChart
            title="Manager Rankings"
            subtitle="Team performance by manager"
            data={managerBarChartData}
            height={200}
          />
        )}
      </div>

      {activeTab === 'executives' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Executive</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Franchisee</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attainment</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExecutives.map((exec) => {
                  const trend = getAttainmentTrend(exec.avgAttainment);
                  return (
                    <tr key={exec.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(exec.rank)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {exec.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{exec.name}</p>
                            <p className="text-sm text-gray-500">{exec.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">{exec.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default" size="sm">{exec.teamName}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info" size="sm">{exec.franchiseeName}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className={classNames('text-lg font-bold', trend.color)}>
                            {exec.avgAttainment}%
                          </span>
                          {trend.icon}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={exec.status === 'active' ? 'success' : 'default'}>
                          {exec.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {filteredExecutives.length} of {MOCK_EXECUTIVES.length} executives
            </p>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">Page 1 of 1</span>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'managers' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Franchisee</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Team Size</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Team Avg</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredManagers.map((mgr) => {
                  const trend = getAttainmentTrend(mgr.teamAvgAttainment);
                  return (
                    <tr key={mgr.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                            {mgr.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{mgr.name}</p>
                            <p className="text-sm text-gray-500">{mgr.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">{mgr.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default" size="sm">{mgr.teamName}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info" size="sm">{mgr.franchiseeName}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-gray-900">{mgr.teamSize}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className={classNames('text-lg font-bold', trend.color)}>
                            {mgr.teamAvgAttainment}%
                          </span>
                          {trend.icon}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={mgr.status === 'active' ? 'success' : 'default'}>
                          {mgr.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {filteredManagers.length} of {MOCK_MANAGERS.length} managers
            </p>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">Page 1 of 1</span>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
