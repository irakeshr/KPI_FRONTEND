'use client';

import { Card, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { DollarSign, Wallet, CheckCircle, XCircle } from 'lucide-react';

interface IncentiveBreakdown {
  commission: {
    sales: number;
    collection: number;
  };
  slabBonuses: {
    kpiId: string;
    kpiName: string;
    amount: number;
    slabDescription: string;
  }[];
  compositeBonus: number;
  compositeEarned: boolean;
  total: number;
}

interface IncentiveEstimatorProps {
  executiveName: string;
  period: string;
  breakdown: IncentiveBreakdown;
  onClick?: () => void;
}

export function IncentiveEstimator({
  executiveName,
  period,
  breakdown,
  onClick,
}: IncentiveEstimatorProps) {
  const totalCommission = breakdown.commission.sales + breakdown.commission.collection;
  const totalSlabBonuses = breakdown.slabBonuses.reduce((sum, b) => sum + b.amount, 0);
  const grandTotal = breakdown.total;

  return (
    <Card
      className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">Incentive Estimator</h3>
            <Badge variant="info" size="sm">ESTIMATED</Badge>
          </div>
          <p className="text-sm text-gray-500">
            {executiveName} • {period}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Estimated Total</p>
          <p className="text-2xl font-bold text-blue-700">
            ₹{grandTotal.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Commission</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Sales Commission</span>
              </div>
              <span className="font-semibold text-gray-900">
                ₹{breakdown.commission.sales.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Collection Commission</span>
              </div>
              <span className="font-semibold text-gray-900">
                ₹{breakdown.commission.collection.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Subtotal Commission</span>
              <span className="font-semibold text-gray-900">
                ₹{totalCommission.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {breakdown.slabBonuses.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Slab Bonuses</h4>
            <div className="space-y-2">
              {breakdown.slabBonuses.map((bonus) => (
                <div key={bonus.kpiId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{bonus.kpiName}</span>
                    <p className="text-xs text-gray-500">{bonus.slabDescription}</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ₹{bonus.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Subtotal Slab Bonuses</span>
                <span className="font-semibold text-gray-900">
                  ₹{totalSlabBonuses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {breakdown.compositeBonus > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Composite Bonus</h4>
            <div className={classNames(
              'flex items-center justify-between p-3 rounded-lg border-2',
              breakdown.compositeEarned
                ? 'bg-green-100 border-green-300'
                : 'bg-red-50 border-red-200'
            )}>
              <div className="flex items-center gap-2">
                {breakdown.compositeEarned ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={classNames(
                  'text-sm font-medium',
                  breakdown.compositeEarned ? 'text-green-800' : 'text-red-800'
                )}>
                  {breakdown.compositeEarned ? 'Composite Bonus Earned' : 'Composite Bonus Not Earned'}
                </span>
              </div>
              <span className={classNames(
                'font-semibold',
                breakdown.compositeEarned ? 'text-green-700' : 'text-red-600'
              )}>
                ₹{breakdown.compositeBonus.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600">Total Estimated Incentive</p>
            <p className="text-xs text-blue-400">(Excludes TDS deductions)</p>
          </div>
          <p className="text-3xl font-bold text-blue-700">
            ₹{grandTotal.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
