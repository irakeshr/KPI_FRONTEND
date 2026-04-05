'use client';

import { Card, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  executiveId: string;
  executiveName: string;
  teamName: string;
  compositeAttainment: number;
  totalIncentive: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  metric?: 'attainment' | 'incentive';
  currentUserId?: string;
}

export function Leaderboard({
  entries,
  title = 'Leaderboard',
  metric = 'attainment',
  currentUserId,
}: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">1</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow">
          <span className="text-white font-bold text-sm">2</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow">
          <span className="text-white font-bold text-sm">3</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 font-medium text-sm">{rank}</span>
      </div>
    );
  };

  const getMetricDisplay = (entry: LeaderboardEntry) => {
    if (metric === 'incentive') {
      return `₹${entry.totalIncentive.toLocaleString()}`;
    }
    return `${entry.compositeAttainment.toFixed(1)}%`;
  };

  const currentUserRank = entries.findIndex(e => e.executiveId === currentUserId) + 1;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">
            Ranked by {metric === 'attainment' ? 'Composite Attainment' : 'Total Incentive'}
          </p>
        </div>
        <Badge variant="info">
          {entries.length} participants
        </Badge>
      </div>

      <div className="space-y-3">
        {entries.slice(0, 10).map((entry) => {
          const isTop3 = entry.rank <= 3;
          const isCurrentUser = entry.executiveId === currentUserId;
          const needsCoaching = entry.rank >= entries.length - 1 && entries.length > 3;

          return (
            <div
              key={entry.executiveId}
              className={classNames(
                'flex items-center justify-between p-3 rounded-lg transition-all',
                isTop3 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100' : 'bg-gray-50',
                isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              )}
            >
              <div className="flex items-center gap-3">
                {getRankIcon(entry.rank)}
                <div>
                  <div className="flex items-center gap-2">
                    <p className={classNames(
                      'font-medium',
                      isTop3 ? 'text-gray-900' : 'text-gray-700'
                    )}>
                      {entry.executiveName}
                    </p>
                    {isCurrentUser && (
                      <Badge size="sm" variant="info">You</Badge>
                    )}
                    {needsCoaching && (
                      <Badge size="sm" variant="danger">Needs Attention</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{entry.teamName}</p>
                </div>
              </div>

              <div className="text-right">
                <p className={classNames(
                  'text-lg font-bold',
                  isTop3 ? 'text-blue-700' : 'text-gray-900'
                )}>
                  {getMetricDisplay(entry)}
                </p>
                {metric === 'attainment' && (
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div
                      className={classNames(
                        'h-full rounded-full',
                        entry.compositeAttainment >= 90 ? 'bg-green-500' :
                        entry.compositeAttainment >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(entry.compositeAttainment, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentUserId && currentUserRank > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Your rank</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">#{currentUserRank}</span>
              <Badge variant="info" size="sm">
                {entries[currentUserRank - 1]?.compositeAttainment.toFixed(1) || 0}%
              </Badge>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
