'use client';

import { Target } from '@/types';
import { Card, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';

interface CompletionTatCardProps {
  target: Target;
  actualValues: number[];
  onEditActual?: () => void;
}

export function CompletionTatCard({ target, actualValues, onEditActual }: CompletionTatCardProps) {
  const avgActual = actualValues.length > 0
    ? actualValues.reduce((a, b) => a + b, 0) / actualValues.length
    : 0;
  
  const benchmark = target.benchmark || 0;
  const ceiling = target.ceiling || 0;
  
  const isBelowBenchmark = avgActual < benchmark;
  const isBreached = avgActual > ceiling;
  const isOnTarget = !isBelowBenchmark && !isBreached;

  const getStatus = () => {
    if (isBreached) return {
      variant: 'danger' as const,
      label: 'Ceiling Breached',
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    };
    if (isBelowBenchmark) return {
      variant: 'warning' as const,
      label: 'Below Benchmark',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
    };
    return {
      variant: 'success' as const,
      label: 'On Target',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };
  };

  const status = getStatus();

  return (
    <Card className="border-2 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Completion TAT</h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">Benchmark</span>
              <span className="text-xl font-bold text-gray-900">
                {benchmark}
                <span className="text-sm font-normal text-gray-500 ml-1">days</span>
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">Ceiling</span>
              <span className="text-xl font-bold text-gray-900">
                {ceiling}
                <span className="text-sm font-normal text-gray-500 ml-1">days</span>
              </span>
            </div>

            <div className={classNames(
              'p-3 rounded-lg border-2',
              isBreached ? 'bg-red-50 border-red-200' :
              isBelowBenchmark ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            )}>
              <span className="text-xs text-gray-500 block mb-1">Actual Avg TAT</span>
              <span className={classNames(
                'text-xl font-bold',
                isBreached ? 'text-red-600' :
                isBelowBenchmark ? 'text-yellow-600' :
                'text-green-600'
              )}>
                {avgActual.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">days</span>
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 block mb-1">Entries</span>
              <span className="text-xl font-bold text-gray-900">
                {actualValues.length}
                <span className="text-sm font-normal text-gray-500 ml-1">records</span>
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">TAT Scale:</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full bg-green-500" style={{ width: `${(benchmark / ceiling) * 100}%` }} />
                <div className="absolute top-0 h-full bg-red-500" style={{ left: `${(benchmark / ceiling) * 100}%`, width: `${((ceiling - benchmark) / ceiling) * 100}%` }} />
                <div 
                  className="absolute top-0 w-1 h-full bg-blue-600 transform -translate-x-1/2"
                  style={{ left: `${Math.min((avgActual / ceiling) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span className="text-green-600">Benchmark: {benchmark}d</span>
              <span>Ceiling: {ceiling}d</span>
            </div>
          </div>
        </div>

        {onEditActual && (
          <button
            onClick={onEditActual}
            className="ml-4 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Edit TAT
          </button>
        )}
      </div>

      {isBreached && (
        <div className={classNames('mt-4 p-3 rounded-lg border flex items-start gap-2', status.color)}>
          <div className="flex-shrink-0">{status.icon}</div>
          <div>
            <p className="font-medium">Ceiling Breached Warning</p>
            <p className="text-sm opacity-80">
              Average TAT of {avgActual.toFixed(1)} days exceeds the ceiling of {ceiling} days.
              This will affect the Completion TAT KPI score.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
