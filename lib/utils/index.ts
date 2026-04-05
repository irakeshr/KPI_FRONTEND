import { TrafficLightThresholds, PeriodType, Period } from '@/types';
import { ATTAINMENT_CAP, DEFAULT_TRAFFIC_LIGHT_THRESHOLDS } from '@/lib/constants';

export function getTrafficLightStatus(
  attainment: number,
  thresholds: TrafficLightThresholds = DEFAULT_TRAFFIC_LIGHT_THRESHOLDS
): 'red' | 'amber' | 'green' {
  if (attainment < thresholds.red) return 'red';
  if (attainment < thresholds.amber) return 'amber';
  return 'green';
}

export function getTrafficLightColor(status: 'red' | 'amber' | 'green'): string {
  const colors = {
    red: 'bg-red-500',
    amber: 'bg-yellow-500',
    green: 'bg-green-500',
  };
  return colors[status];
}

export function getTrafficLightTextColor(status: 'red' | 'amber' | 'green'): string {
  const colors = {
    red: 'text-red-600',
    amber: 'text-yellow-600',
    green: 'text-green-600',
  };
  return colors[status];
}

export function capAttainment(value: number): number {
  return Math.min(value, ATTAINMENT_CAP);
}

export function calculateAttainment(actual: number, target: number): number {
  if (target === 0) return 0;
  return capAttainment((actual / target) * 100);
}

export function formatAttainment(value: number): string {
  return `${capAttainment(value).toFixed(1)}%`;
}

export function getPeriodLabel(type: PeriodType): string {
  const labels: Record<PeriodType, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  };
  return labels[type];
}

export function generatePeriodDates(type: PeriodType, referenceDate: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(referenceDate);
  const end = new Date(referenceDate);

  switch (type) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'quarterly':
      const quarter = Math.floor(start.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(quarter * 3 + 3, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

export function formatDate(date: Date | string, format: 'short' | 'long' | 'iso' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
    case 'iso':
      return d.toISOString().split('T')[0];
    default:
      return d.toLocaleDateString();
  }
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}
