'use client';

import { Kpi, Target } from '@/types';
import { KPI_CATALOG, DEFAULT_TRAFFIC_LIGHT_THRESHOLDS } from '@/lib/constants';
import { TrafficLightBadge, ProgressBar, Card, Badge } from '@/components/ui';
import { calculateAttainment, formatAttainment, capAttainment, classNames } from '@/lib/utils';

interface KpiCardProps {
  kpi: Kpi;
  target?: Target;
  actualValue: number;
  onClick?: () => void;
  className?: string;
}

export function KpiCard({ kpi, target, actualValue, onClick, className }: KpiCardProps) {
  const attainment = target ? calculateAttainment(actualValue, target.targetValue) : 0;
  const isBreached = kpi.requiresTwoTargets && target && actualValue > (target.ceiling || 0);

  return (
    <div
      onClick={onClick}
      className={classNames(
        'bg-white border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md',
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{kpi.name}</h3>
          <Badge size="sm" variant="default">{kpi.type}</Badge>
        </div>
        <TrafficLightBadge
          attainment={attainment}
          thresholds={DEFAULT_TRAFFIC_LIGHT_THRESHOLDS}
          showLabel={false}
          size="md"
        />
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-gray-500 block">Target</span>
            <span className="font-semibold text-gray-900">
              {target?.targetValue.toLocaleString() || '-'}
              {kpi.unit === '%' && '%'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Actual</span>
            <span className={classNames(
              'font-semibold',
              isBreached ? 'text-red-600' : 'text-gray-900'
            )}>
              {actualValue.toLocaleString()}
              {kpi.unit === '%' && '%'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Attainment</span>
            <span className={classNames(
              'font-semibold',
              attainment >= 90 ? 'text-green-600' :
              attainment >= 60 ? 'text-yellow-600' : 'text-red-600'
            )}>
              {formatAttainment(attainment)}
            </span>
          </div>
        </div>

        <ProgressBar attainment={attainment} showLabel={false} height="md" />

        {kpi.requiresTwoTargets && target && (
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Benchmark:</span>
                <span className="ml-1 font-medium">{target.benchmark || '-'} {kpi.unit}</span>
              </div>
              <div>
                <span className="text-gray-500">Ceiling:</span>
                <span className="ml-1 font-medium">{target.ceiling || '-'} {kpi.unit}</span>
              </div>
            </div>
          </div>
        )}

        {isBreached && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Ceiling Breached
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
