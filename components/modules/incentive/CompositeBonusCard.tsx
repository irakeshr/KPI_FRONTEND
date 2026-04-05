'use client';

import { Badge, Card } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { PlusCircle, CheckCircle, XCircle } from 'lucide-react';

interface KpiBonusStatus {
  kpiId: string;
  kpiName: string;
  attained: boolean;
  slabEarned?: string;
  bonusAmount?: number;
}

interface CompositeBonusCardProps {
  kpiBonuses: KpiBonusStatus[];
  compositeEarned: boolean;
  totalCompositeBonus: number;
  isCompositeConfigured: boolean;
  onClick?: () => void;
}

export function CompositeBonusCard({
  kpiBonuses,
  compositeEarned,
  totalCompositeBonus,
  isCompositeConfigured,
  onClick,
}: CompositeBonusCardProps) {
  const earnedCount = kpiBonuses.filter(b => b.attained).length;
  const totalCount = kpiBonuses.length;

  if (!isCompositeConfigured) {
    return (
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <PlusCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="font-medium text-gray-700">Composite Bonus Not Configured</h4>
          <p className="text-sm text-gray-500 mt-1">
            Configure slab bonuses to enable composite bonus
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={classNames(
        'transition-all',
        compositeEarned ? 'border-2 border-green-500 bg-green-50' : 'border-2 border-red-200'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Composite Bonus</h3>
          <p className="text-sm text-gray-500">All-or-nothing bonus</p>
        </div>
        <Badge variant={compositeEarned ? 'success' : 'danger'} size="lg">
          {compositeEarned ? 'EARNED' : 'NOT EARNED'}
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Individual KPI Bonus Progress</span>
          <span className="font-medium">
            {earnedCount} / {totalCount} earned
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={classNames(
              'h-full rounded-full transition-all duration-500',
              earnedCount === totalCount ? 'bg-green-500' : 'bg-red-400'
            )}
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {kpiBonuses.map((bonus) => (
          <div
            key={bonus.kpiId}
            className={classNames(
              'flex items-center justify-between p-2 rounded-lg',
              bonus.attained ? 'bg-green-100' : 'bg-red-50'
            )}
          >
            <div className="flex items-center gap-2">
              {bonus.attained ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={classNames(
                'font-medium',
                bonus.attained ? 'text-green-900' : 'text-red-900'
              )}>
                {bonus.kpiName}
              </span>
            </div>
            <div className="text-right">
              {bonus.attained ? (
                <>
                  <span className="text-sm text-green-700">{bonus.slabEarned}</span>
                  <span className="ml-2 font-semibold text-green-900">
                    ₹{bonus.bonusAmount?.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-sm text-red-600">Missed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {compositeEarned && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-medium">Composite Bonus Amount:</span>
            <span className="text-xl font-bold text-green-900">
              ₹{totalCompositeBonus.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {!compositeEarned && (
        <div className="mt-4 p-3 bg-red-100 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Not earned:</strong> All individual KPI slab bonuses must be earned to receive the composite bonus.
          </p>
        </div>
      )}
    </Card>
  );
}
