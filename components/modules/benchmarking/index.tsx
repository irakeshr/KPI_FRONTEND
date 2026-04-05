'use client';

import { useState, useMemo } from 'react';
import { Role } from '@/store';
import { ExecutiveView } from './ExecutiveView';
import { ManagerView } from './ManagerView';
import { FranchiseeView } from './FranchiseeView';
import { AdminView } from './AdminView';

interface BenchmarkingPageProps {
  role: Role;
  userId: string;
}

const MOCK_EXECUTIVE_DATA = {
  id: 'exec-1',
  name: 'Rahul Sharma',
  kpis: [
    { kpiId: 'kpi-01', kpiName: 'Sales', target: 100, actual: 92, attainment: 92 },
    { kpiId: 'kpi-02', kpiName: 'Collection', target: 100, actual: 88, attainment: 88 },
    { kpiId: 'kpi-03', kpiName: 'Lead Relevancy', target: 80, actual: 75, attainment: 93.75 },
    { kpiId: 'kpi-04', kpiName: 'Lead Conversion', target: 60, actual: 52, attainment: 86.67 },
    { kpiId: 'kpi-05', kpiName: 'Call Connect Rate', target: 70, actual: 65, attainment: 92.86 },
    { kpiId: 'kpi-06', kpiName: 'Deal Creation', target: 15, actual: 18, attainment: 120 },
    { kpiId: 'kpi-07', kpiName: 'Quote Creation', target: 30, actual: 25, attainment: 83.33 },
    { kpiId: 'kpi-08', kpiName: 'Customer Touch', target: 50, actual: 45, attainment: 90 },
    { kpiId: 'kpi-09', kpiName: 'Dialed Calls', target: 200, actual: 185, attainment: 92.5 },
    { kpiId: 'kpi-10', kpiName: 'Talk Time', target: 600, actual: 580, attainment: 96.67 },
    { kpiId: 'kpi-11', kpiName: 'Clients Onboarded', target: 5, actual: 4, attainment: 80 },
    { kpiId: 'kpi-12', kpiName: 'Number of Services', target: 10, actual: 8, attainment: 80 },
    { kpiId: 'kpi-13', kpiName: 'Completion TAT', target: 7, actual: 8, attainment: 87.5, isBreached: true },
  ],
  compositeScore: 91.6,
  previousCompositeScore: 87.3,
  incentive: {
    commission: 4500,
    slabBonuses: 1200,
    compositeBonus: 500,
    total: 6200,
    estimated: true,
  },
};

const MOCK_TEAM_MEMBERS = [
  {
    executiveId: 'exec-1',
    executiveName: 'Rahul Sharma',
    teamName: 'Sales Team A',
    kpis: [
      { kpiId: 'kpi-01', kpiName: 'Sales', target: 100, actual: 92, attainment: 92 },
      { kpiId: 'kpi-02', kpiName: 'Collection', target: 100, actual: 88, attainment: 88 },
      { kpiId: 'kpi-03', kpiName: 'Lead Relevancy', target: 80, actual: 75, attainment: 93.75 },
      { kpiId: 'kpi-04', kpiName: 'Lead Conversion', target: 60, actual: 52, attainment: 86.67 },
      { kpiId: 'kpi-05', kpiName: 'Call Connect Rate', target: 70, actual: 65, attainment: 92.86 },
      { kpiId: 'kpi-06', kpiName: 'Deal Creation', target: 15, actual: 18, attainment: 120 },
    ],
    compositeAttainment: 91.6,
    totalIncentive: 6200,
  },
  {
    executiveId: 'exec-2',
    executiveName: 'Priya Patel',
    teamName: 'Sales Team A',
    kpis: [
      { kpiId: 'kpi-01', kpiName: 'Sales', target: 100, actual: 85, attainment: 85 },
      { kpiId: 'kpi-02', kpiName: 'Collection', target: 100, actual: 90, attainment: 90 },
      { kpiId: 'kpi-03', kpiName: 'Lead Relevancy', target: 80, actual: 72, attainment: 90 },
      { kpiId: 'kpi-04', kpiName: 'Lead Conversion', target: 60, actual: 48, attainment: 80 },
      { kpiId: 'kpi-05', kpiName: 'Call Connect Rate', target: 70, actual: 58, attainment: 82.86 },
      { kpiId: 'kpi-06', kpiName: 'Deal Creation', target: 15, actual: 12, attainment: 80 },
    ],
    compositeAttainment: 84.6,
    totalIncentive: 5200,
  },
  {
    executiveId: 'exec-3',
    executiveName: 'Amit Kumar',
    teamName: 'Sales Team A',
    kpis: [
      { kpiId: 'kpi-01', kpiName: 'Sales', target: 100, actual: 78, attainment: 78 },
      { kpiId: 'kpi-02', kpiName: 'Collection', target: 100, actual: 82, attainment: 82 },
      { kpiId: 'kpi-03', kpiName: 'Lead Relevancy', target: 80, actual: 68, attainment: 85 },
      { kpiId: 'kpi-04', kpiName: 'Lead Conversion', target: 60, actual: 42, attainment: 70 },
      { kpiId: 'kpi-05', kpiName: 'Call Connect Rate', target: 70, actual: 55, attainment: 78.57 },
      { kpiId: 'kpi-06', kpiName: 'Deal Creation', target: 15, actual: 10, attainment: 66.67 },
    ],
    compositeAttainment: 76.7,
    totalIncentive: 3800,
  },
  {
    executiveId: 'exec-4',
    executiveName: 'Sneha Reddy',
    teamName: 'Sales Team A',
    kpis: [
      { kpiId: 'kpi-01', kpiName: 'Sales', target: 100, actual: 95, attainment: 95 },
      { kpiId: 'kpi-02', kpiName: 'Collection', target: 100, actual: 92, attainment: 92 },
      { kpiId: 'kpi-03', kpiName: 'Lead Relevancy', target: 80, actual: 78, attainment: 97.5 },
      { kpiId: 'kpi-04', kpiName: 'Lead Conversion', target: 60, actual: 56, attainment: 93.33 },
      { kpiId: 'kpi-05', kpiName: 'Call Connect Rate', target: 70, actual: 68, attainment: 97.14 },
      { kpiId: 'kpi-06', kpiName: 'Deal Creation', target: 15, actual: 16, attainment: 106.67 },
    ],
    compositeAttainment: 96.9,
    totalIncentive: 7500,
  },
];

const MOCK_LEADERBOARD = [
  { rank: 1, executiveId: 'exec-4', executiveName: 'Sneha Reddy', teamName: 'Sales Team A', compositeAttainment: 96.9, totalIncentive: 7500 },
  { rank: 2, executiveId: 'exec-1', executiveName: 'Rahul Sharma', teamName: 'Sales Team A', compositeAttainment: 91.6, totalIncentive: 6200 },
  { rank: 3, executiveId: 'exec-2', executiveName: 'Priya Patel', teamName: 'Sales Team A', compositeAttainment: 84.6, totalIncentive: 5200 },
  { rank: 4, executiveId: 'exec-3', executiveName: 'Amit Kumar', teamName: 'Sales Team A', compositeAttainment: 76.7, totalIncentive: 3800 },
];

const MOCK_TREND_DATA = [
  { label: 'Aug 2025', value: 78, attainment: 78, hasRevision: false },
  { label: 'Sep 2025', value: 82, attainment: 82, hasRevision: true },
  { label: 'Oct 2025', value: 85, attainment: 85, hasRevision: false },
  { label: 'Nov 2025', value: 88, attainment: 88, hasRevision: false },
  { label: 'Dec 2025', value: 91, attainment: 91, hasRevision: true },
  { label: 'Jan 2026', value: 87, attainment: 87, hasRevision: false },
];

const MOCK_FRANCHISEES = [
  { franchiseeId: 'fr-1', franchiseeName: 'Mumbai Central', compositeAttainment: 88.5, totalSales: 2500000, totalCollection: 2200000, activeExecutives: 45, avgAttainment: 87.2 },
  { franchiseeId: 'fr-2', franchiseeName: 'Delhi North', compositeAttainment: 82.3, totalSales: 2100000, totalCollection: 1950000, activeExecutives: 38, avgAttainment: 81.5 },
  { franchiseeId: 'fr-3', franchiseeName: 'Bangalore West', compositeAttainment: 91.2, totalSales: 2800000, totalCollection: 2650000, activeExecutives: 52, avgAttainment: 90.1 },
  { franchiseeId: 'fr-4', franchiseeName: 'Chennai South', compositeAttainment: 79.8, totalSales: 1800000, totalCollection: 1650000, activeExecutives: 32, avgAttainment: 78.4 },
  { franchiseeId: 'fr-5', franchiseeName: 'Kolkata East', compositeAttainment: 85.6, totalSales: 1950000, totalCollection: 1800000, activeExecutives: 35, avgAttainment: 84.9 },
];

const MOCK_TEAMS = [
  { teamId: 'team-1', teamName: 'Sales Team A', compositeAttainment: 91.6, totalSales: 850000, totalCollection: 780000, topPerformer: 'Sneha Reddy', executives: [
    { executiveId: 'exec-1', executiveName: 'Rahul Sharma', kpis: [], compositeAttainment: 91.6 },
    { executiveId: 'exec-2', executiveName: 'Priya Patel', kpis: [], compositeAttainment: 84.6 },
  ]},
  { teamId: 'team-2', teamName: 'Sales Team B', compositeAttainment: 76.7, totalSales: 620000, totalCollection: 580000, topPerformer: 'Amit Kumar', executives: [
    { executiveId: 'exec-3', executiveName: 'Amit Kumar', kpis: [], compositeAttainment: 76.7 },
    { executiveId: 'exec-4', executiveName: 'Sneha Reddy', kpis: [], compositeAttainment: 96.9 },
  ]},
];

export function BenchmarkingPage({ role, userId }: BenchmarkingPageProps) {
  const [selectedFranchiseeId, setSelectedFranchiseeId] = useState<string>('');

  const teamComposite = useMemo(() => {
    if (MOCK_TEAM_MEMBERS.length === 0) return 0;
    return MOCK_TEAM_MEMBERS.reduce((sum, m) => sum + m.compositeAttainment, 0) / MOCK_TEAM_MEMBERS.length;
  }, []);

  switch (role) {
    case 'Executive':
      return (
        <ExecutiveView
          executiveId={MOCK_EXECUTIVE_DATA.id}
          executiveName={MOCK_EXECUTIVE_DATA.name}
          period="January 2026"
          kpis={MOCK_EXECUTIVE_DATA.kpis}
          compositeScore={MOCK_EXECUTIVE_DATA.compositeScore}
          previousCompositeScore={MOCK_EXECUTIVE_DATA.previousCompositeScore}
          incentive={MOCK_EXECUTIVE_DATA.incentive}
          trendData={MOCK_TREND_DATA}
        />
      );

    case 'Manager':
      return (
        <ManagerView
          teamMembers={MOCK_TEAM_MEMBERS}
          leaderboard={MOCK_LEADERBOARD}
          compositeScore={teamComposite}
          previousCompositeScore={teamComposite - 3.5}
          trendData={MOCK_TREND_DATA}
        />
      );

    case 'Franchisee':
      return (
        <FranchiseeView
          franchiseeName="Mumbai Central"
          period="January 2026"
          compositeAttainment={88.5}
          previousCompositeAttainment={85.2}
          totalSales={2500000}
          totalCollection={2200000}
          teamCount={8}
          executiveCount={45}
          teams={MOCK_TEAMS}
          trendData={MOCK_TREND_DATA}
        />
      );

    case 'Admin':
      return (
        <AdminView
          franchisees={MOCK_FRANCHISEES}
          selectedFranchiseeId={selectedFranchiseeId}
          onSelectFranchisee={setSelectedFranchiseeId}
          teamMembers={MOCK_TEAM_MEMBERS}
          leaderboard={MOCK_LEADERBOARD}
          compositeScore={teamComposite}
          previousCompositeScore={teamComposite - 3.5}
          trendData={MOCK_TREND_DATA}
        />
      );

    default:
      return (
        <div className="p-8 text-center text-gray-500">
          Unable to determine your role for Benchmarking Dashboard
        </div>
      );
  }
}