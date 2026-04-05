'use client';

import { useMemo } from 'react';
import { Kpi, TrafficLightThresholds, Role } from '@/types';
import { KPI_CATALOG, DEFAULT_TRAFFIC_LIGHT_THRESHOLDS } from '@/lib/constants';
import { CompositeAttainmentScoreCard } from './CompositeAttainmentScoreCard';
import { AttainmentCard } from './AttainmentCard';
import { IncentiveEarnedCard } from './IncentiveEarnedCard';
import { TrendChart } from './TrendChart';
import { Card, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';

interface ExecutiveKpiData {
  kpiId: string;
  kpiName: string;
  target: number;
  actual: number;
  attainment: number;
  benchmark?: number;
  ceiling?: number;
  isBreached?: boolean;
}

interface ExecutiveViewProps {
  executiveId: string;
  executiveName: string;
  period: string;
  kpis: ExecutiveKpiData[];
  compositeScore: number;
  previousCompositeScore?: number;
  incentive: {
    commission: number;
    slabBonuses: number;
    compositeBonus: number;
    total: number;
    estimated: boolean;
  };
  trendData?: { label: string; value: number; attainment: number; revisionOccurred?: boolean }[];
  thresholds?: TrafficLightThresholds;
}

export function ExecutiveView({
  executiveId,
  executiveName,
  period,
  kpis,
  compositeScore,
  previousCompositeScore,
  incentive,
  trendData = [],
  thresholds = DEFAULT_TRAFFIC_LIGHT_THRESHOLDS,
}: ExecutiveViewProps) {
  const sortedKpis = useMemo(() => {
    return [...kpis].sort((a, b) => b.attainment - a.attainment);
  }, [kpis]);

  const topKpis = sortedKpis.slice(0, 4);
  const remainingKpis = sortedKpis.slice(4);

  const showBreachedWarning = kpis.some(k => k.isBreached);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CompositeAttainmentScoreCard
            score={compositeScore}
            previousScore={previousCompositeScore}
            title="Your Performance Score"
            showTrend={true}
            trendPeriods={3}
            size="lg"
          />
        </div>

        <div className="lg:col-span-2">
          <IncentiveEarnedCard
            executiveName={executiveName}
            period={period}
            commissionEarned={incentive.commission}
            slabBonusesEarned={incentive.slabBonuses}
            compositeBonusEarned={incentive.compositeBonus > 0}
            compositeBonusAmount={incentive.compositeBonus}
            runningTotal={incentive.total * 5}
          />
        </div>
      </div>

      {showBreachedWarning && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-amber-800">Attention Required</h4>
              <p className="text-sm text-amber-700">
                Some KPIs have breached the ceiling threshold. Review your performance carefully.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your KPI Attainment</h3>
            <p className="text-sm text-gray-500">{period}</p>
          </div>
          <Badge variant="info">{kpis.length} KPIs</Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topKpis.map(kpi => {
            const kpiDefinition = KPI_CATALOG.find(k => k.id === kpi.kpiId);
            if (!kpiDefinition) return null;
            
            return (
              <AttainmentCard
                key={kpi.kpiId}
                kpi={kpiDefinition}
                target={kpi.target}
                actual={kpi.actual}
                thresholds={thresholds}
              />
            );
          })}
        </div>

        {remainingKpis.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {remainingKpis.map(kpi => {
                const kpiDefinition = KPI_CATALOG.find(k => k.id === kpi.kpiId);
                if (!kpiDefinition) return null;
                
                return (
                  <AttainmentCard
                    key={kpi.kpiId}
                    kpi={kpiDefinition}
                    target={kpi.target}
                    actual={kpi.actual}
                    thresholds={thresholds}
                    compact
                  />
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {trendData.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
          <TrendChart title="" data={trendData} showRevisionIndicator />
        </Card>
      )}
    </div>
  );
}