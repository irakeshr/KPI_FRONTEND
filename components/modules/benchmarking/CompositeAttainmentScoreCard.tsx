'use client';

import { Card, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface CompositeAttainmentScoreCardProps {
  score: number;
  previousScore?: number;
  title?: string;
  showTrend?: boolean;
  trendPeriods?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompositeAttainmentScoreCard({
  score,
  previousScore,
  title = 'Overall Performance Score',
  showTrend = true,
  trendPeriods = 3,
  size = 'lg',
  className,
}: CompositeAttainmentScoreCardProps) {
  const trend = previousScore !== undefined ? score - previousScore : undefined;
  const trendPercent = previousScore !== undefined && previousScore !== 0
    ? ((score - previousScore) / previousScore) * 100
    : undefined;

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRingColor = (value: number) => {
    if (value >= 90) return '#22c55e';
    if (value >= 60) return '#eab308';
    return '#ef4444';
  };

  const getRingGradient = (value: number) => {
    if (value >= 90) {
      return 'from-green-400 to-green-600';
    }
    if (value >= 60) {
      return 'from-yellow-400 to-yellow-600';
    }
    return 'from-red-400 to-red-600';
  };

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  };

  const fontSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className={classNames('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {trendPeriods > 0 && (
            <p className="text-xs text-gray-500">Last {trendPeriods} periods trend</p>
          )}
        </div>
        <Badge
          variant={score >= 90 ? 'success' : score >= 60 ? 'warning' : 'danger'}
          size="md"
        >
          <Target className="w-3 h-3 mr-1" />
          {score >= 90 ? 'Excellent' : score >= 60 ? 'On Track' : 'Needs Attention'}
        </Badge>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className={classNames('relative', sizeClasses[size])}>
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getRingColor(score)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={classNames(
                'transition-all duration-1000 ease-out',
                `stroke-${score >= 90 ? 'green' : score >= 60 ? 'yellow' : 'red'}-500`
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={classNames('font-bold', getScoreColor(score), fontSizeClasses[size])}>
              {score.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">Attainment</span>
          </div>
        </div>
      </div>

      {showTrend && trend !== undefined && (
        <div className={classNames(
          'flex items-center justify-center gap-2 text-sm font-medium pt-2 border-t border-gray-100',
          trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
        )}>
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : trend < 0 ? (
            <TrendingDown className="w-4 h-4" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
          <span>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}% ({trendPercent !== undefined ? `${trendPercent > 0 ? '+' : ''}${trendPercent.toFixed(1)}%` : ''} vs prev)
          </span>
        </div>
      )}

      <div className="absolute top-4 right-4 opacity-10">
        <Target className="w-16 h-16 text-gray-400" />
      </div>
    </Card>
  );
}