'use client';

import { Kpi, TrafficLightThresholds } from '@/types';
import { KPI_CATALOG, DEFAULT_TRAFFIC_LIGHT_THRESHOLDS } from '@/lib/constants';
import { Card, Badge, ProgressBar, TrafficLightBadge } from '@/components/ui';
import { calculateAttainment, formatAttainment, capAttainment, classNames } from '@/lib/utils';

interface AttainmentCardProps {
  kpi: Kpi;
  target: number;
  actual: number;
  previousActual?: number;
  thresholds?: TrafficLightThresholds;
  onClick?: () => void;
  compact?: boolean;
}

export function AttainmentCard({
  kpi,
  target,
  actual,
  previousActual,
  thresholds = DEFAULT_TRAFFIC_LIGHT_THRESHOLDS,
  onClick,
  compact = false,
}: AttainmentCardProps) {
  const attainment = calculateAttainment(actual, target);
  const isBreached = kpi.requiresTwoTargets && actual > 0 && target > 0;
  const change = previousActual !== undefined ? actual - previousActual : undefined;
  const changePercent = previousActual !== undefined && previousActual !== 0 
    ? ((actual - previousActual) / previousActual) * 100 
    : undefined;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={classNames(
          'p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer',
          onClick ? 'cursor-pointer' : ''
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{kpi.name}</p>
            <p className="text-xs text-gray-500">{kpi.unit}</p>
          </div>
          <div className="text-right ml-3">
            <p className={classNames(
              'text-lg font-bold',
              attainment >= 90 ? 'text-green-600' :
              attainment >= 60 ? 'text-yellow-600' : 'text-red-600'
            )}>
              {formatAttainment(attainment)}
            </p>
            <TrafficLightBadge attainment={attainment} thresholds={thresholds} showLabel={false} size="sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className="hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{kpi.name}</h3>
          <Badge size="sm" variant="default">{kpi.type}</Badge>
        </div>
        <TrafficLightBadge attainment={attainment} thresholds={thresholds} size="md" />
      </div>

      <div className="mb-4">
        <ProgressBar attainment={attainment} thresholds={thresholds} showLabel={false} height="lg" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Target</p>
          <p className="text-lg font-bold text-gray-900">
            {target.toLocaleString()}{kpi.unit === '%' && '%'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Actual</p>
          <p className={classNames(
            'text-lg font-bold',
            isBreached ? 'text-red-600' : 'text-gray-900'
          )}>
            {actual.toLocaleString()}{kpi.unit === '%' && '%'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase">Attainment</p>
          <p className={classNames(
            'text-lg font-bold',
            attainment >= 90 ? 'text-green-600' :
            attainment >= 60 ? 'text-yellow-600' : 'text-red-600'
          )}>
            {formatAttainment(attainment)}
          </p>
        </div>
      </div>

      {change !== undefined && (
        <div className={classNames(
          'flex items-center justify-center gap-1 text-sm',
          change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
        )}>
          {change > 0 ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : change < 0 ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ) : null}
          <span className="font-medium">
            {change > 0 ? '+' : ''}{change.toFixed(1)} ({changePercent !== undefined ? `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%` : ''})
          </span>
          <span className="text-gray-400">vs prev</span>
        </div>
      )}

      {kpi.requiresTwoTargets && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Benchmark:</span>
              <span className="ml-2 font-medium">{kpi.targetFields?.includes('Benchmark') ? '3' : '-'} days</span>
            </div>
            <div>
              <span className="text-gray-500">Ceiling:</span>
              <span className="ml-2 font-medium">{kpi.targetFields?.includes('Ceiling') ? '7' : '-'} days</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
