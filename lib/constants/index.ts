import { Kpi, TrafficLightThresholds } from '@/types';

export const KPI_CATALOG: Kpi[] = [
  { id: 'kpi-01', name: 'Sales', type: 'Revenue', unit: '%' },
  { id: 'kpi-02', name: 'Collection', type: 'Revenue', unit: '%' },
  { id: 'kpi-03', name: 'Lead Relevancy', type: 'Quality', unit: '%' },
  { id: 'kpi-04', name: 'Lead Conversion', type: 'Quality', unit: '%' },
  { id: 'kpi-05', name: 'Call Connect Rate', type: 'Quality', unit: '%' },
  { id: 'kpi-06', name: 'Deal Creation', type: 'Activity', unit: 'Count' },
  { id: 'kpi-07', name: 'Quote Creation', type: 'Activity', unit: 'Count' },
  { id: 'kpi-08', name: 'Customer Touch', type: 'Activity', unit: 'Count' },
  { id: 'kpi-09', name: 'Dialed Calls', type: 'Activity', unit: 'Count' },
  { id: 'kpi-10', name: 'Talk Time', type: 'Activity', unit: 'Minutes' },
  { id: 'kpi-11', name: 'Clients Onboarded', type: 'Output', unit: 'Count' },
  { id: 'kpi-12', name: 'Number of Services', type: 'Output', unit: 'Count' },
  { id: 'kpi-13', name: 'Completion TAT', type: 'Quality', unit: 'Days', requiresTwoTargets: true, targetFields: ['Benchmark', 'Ceiling'] },
];

export const PERIOD_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export const DEFAULT_TRAFFIC_LIGHT_THRESHOLDS: TrafficLightThresholds = {
  red: 60,
  amber: 89,
  green: 150,
};

export const ATTAINMENT_CAP = 150;

export const ROLE_PERMISSIONS = {
  Admin: {
    canSetTargets: true,
    canOverrideTeamTargets: true,
    canApprovePeriods: true,
    canViewCrossFranchisee: true,
    canViewLeaderboard: true,
    canTriggerIncentive: true,
    canApprovePayout: true,
    canExportReports: true,
  },
  Franchisee: {
    canSetTargets: false,
    canOverrideTeamTargets: false,
    canApprovePeriods: false,
    canViewCrossFranchisee: false,
    canViewLeaderboard: true,
    canTriggerIncentive: false,
    canApprovePayout: false,
    canExportReports: true,
  },
  Manager: {
    canSetTargets: true,
    canOverrideTeamTargets: true,
    canApprovePeriods: false,
    canViewCrossFranchisee: false,
    canViewLeaderboard: true,
    canTriggerIncentive: true,
    canApprovePayout: false,
    canExportReports: true,
  },
  Executive: {
    canSetTargets: false,
    canOverrideTeamTargets: false,
    canApprovePeriods: false,
    canViewCrossFranchisee: false,
    canViewLeaderboard: false,
    canTriggerIncentive: false,
    canApprovePayout: false,
    canExportReports: true,
  },
} as const;

export const API_ENDPOINTS = {
  auth: {
    validateToken: '/api/auth/validate',
    refreshSession: '/api/auth/refresh',
  },
  targets: {
    list: '/api/targets',
    create: '/api/targets',
    update: '/api/targets/:id',
    delete: '/api/targets/:id',
    revision: '/api/targets/:id/revisions',
  },
  periods: {
    list: '/api/periods',
    create: '/api/periods',
    approve: '/api/periods/:id/approve',
  },
  executives: {
    list: '/api/executives',
    byTeam: '/api/executives/team/:teamId',
  },
  teams: {
    list: '/api/teams',
    byFranchisee: '/api/teams/franchisee/:franchiseeId',
  },
};
