'use client';

import { Card, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';

interface IncentiveEarnedCardProps {
  executiveName: string;
  period: string;
  commissionEarned: number;
  slabBonusesEarned: number;
  compositeBonusEarned: boolean;
  compositeBonusAmount: number;
  runningTotal: number;
  onClick?: () => void;
}

export function IncentiveEarnedCard({
  executiveName,
  period,
  commissionEarned,
  slabBonusesEarned,
  compositeBonusEarned,
  compositeBonusAmount,
  runningTotal,
  onClick,
}: IncentiveEarnedCardProps) {
  const totalEarned = commissionEarned + slabBonusesEarned + (compositeBonusEarned ? compositeBonusAmount : 0);

  return (
    <Card
      className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Incentive Earned</h3>
          <p className="text-sm text-gray-500">{executiveName} • {period}</p>
        </div>
        <Badge variant="success" size="lg">EARNED</Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Commission</span>
          </div>
          <span className="font-semibold text-gray-900">
            ₹{commissionEarned.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Slab Bonuses</span>
          </div>
          <span className="font-semibold text-gray-900">
            ₹{slabBonusesEarned.toLocaleString()}
          </span>
        </div>

        <div className={classNames(
          'flex items-center justify-between p-3 rounded-lg border',
          compositeBonusEarned
            ? 'bg-green-100 border-green-200'
            : 'bg-gray-50 border-gray-200'
        )}>
          <div className="flex items-center gap-2">
            <div className={classNames(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              compositeBonusEarned ? 'bg-green-500' : 'bg-gray-300'
            )}>
              {compositeBonusEarned ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Composite Bonus</span>
              <p className={classNames(
                'text-xs',
                compositeBonusEarned ? 'text-green-700' : 'text-gray-500'
              )}>
                {compositeBonusEarned ? 'All KPIs achieved!' : 'Not earned'}
              </p>
            </div>
          </div>
          <span className={classNames(
            'font-semibold',
            compositeBonusEarned ? 'text-green-700' : 'text-gray-400'
          )}>
            {compositeBonusEarned ? `₹${compositeBonusAmount.toLocaleString()}` : '₹0'}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-emerald-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-emerald-800 font-medium">Total Earned</span>
          <span className="text-3xl font-bold text-emerald-700">
            ₹{totalEarned.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-emerald-600">
          <span>Running Total (YTD)</span>
          <span className="font-medium">₹{runningTotal.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
}
