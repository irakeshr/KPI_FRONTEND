export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type KpiUnit = '%' | 'Count' | 'Days' | 'Minutes';
export type KpiCategory = 'Revenue' | 'Quality' | 'Activity' | 'Output';
export type Role = 'Admin' | 'Franchisee' | 'Manager' | 'Executive';

export interface Kpi {
  id: string;
  name: string;
  type: KpiCategory;
  unit: KpiUnit;
  requiresTwoTargets?: boolean;
  targetFields?: string[];
}

export interface Target {
  id: string;
  executiveId: string;
  executiveName: string;
  kpiId: string;
  kpiName: string;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  targetValue: number;
  benchmark?: number;
  ceiling?: number;
  teamTarget?: number;
  isOverridden?: boolean;
  overrideNote?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  revisionHistory?: RevisionHistory[];
}

export interface RevisionHistory {
  id: string;
  previousValue: number;
  newValue: number;
  reason: string;
  revisedAt: string;
  revisedBy: string;
}

export interface Period {
  id: string;
  type: PeriodType;
  startDate: string;
  endDate: string;
  label: string;
  isActive: boolean;
  requiresApproval?: boolean;
}

export interface Executive {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId: string;
  teamName: string;
  franchiseeId: string;
  franchiseeName: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  managerName: string;
  franchiseeId: string;
  memberCount: number;
}

export interface Franchisee {
  id: string;
  name: string;
  location: string;
  teamCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  franchiseeId: string;
  franchiseeName: string;
  teamId?: string;
  teamName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TrafficLightThresholds {
  red: number;
  amber: number;
  green: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  reason?: string;
  timestamp: string;
}
