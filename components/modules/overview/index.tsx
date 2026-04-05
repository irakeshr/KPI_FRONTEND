'use client';

import { useMemo } from 'react';
import { useAuthStore, useTargetStore, useKpiStore, useIncentiveStore, Role } from '@/store';
import { Card, Badge } from '@/components/ui';
import { PerformanceChart } from '@/components/ui/PerformanceChart';
import { BarChart } from '@/components/ui/BarChart';
import { formatAttainment, calculateAttainment, classNames } from '@/lib/utils';

const EXECUTIVES = [
  { id: 'exec-1', name: 'Rahul Sharma', team: 'Sales Team A' },
  { id: 'exec-2', name: 'Priya Patel', team: 'Sales Team A' },
  { id: 'exec-3', name: 'Amit Kumar', team: 'Sales Team B' },
  { id: 'exec-4', name: 'Sneha Reddy', team: 'Sales Team B' },
];

export function OverviewDashboard({ role, userId }: { role: Role; userId: string }) {
  const { user } = useAuthStore();
  const { targets, periods, getCurrentPeriod } = useTargetStore();
  const { actuals, getActual, getPendingEntries } = useKpiStore();
  const { getPendingPayouts } = useIncentiveStore();

  const currentPeriod = getCurrentPeriod();
  const pendingPayouts = getPendingPayouts();
  const pendingManualEntries = getPendingEntries();

  const stats = useMemo(() => {
    const periodTargets = currentPeriod
      ? targets.filter(t => t.periodStart === currentPeriod.startDate)
      : [];

    const executiveIds = [...new Set(periodTargets.map(t => t.executiveId))];
    const kpis = [...new Set(periodTargets.map(t => t.kpiId))];

    let totalAttainment = 0;
    let count = 0;
    let greenCount = 0;
    let amberCount = 0;
    let redCount = 0;

    executiveIds.forEach(execId => {
      const execTargets = periodTargets.filter(t => t.executiveId === execId);
      execTargets.forEach(t => {
        const actual = getActual(execId, t.kpiId, t.periodStart);
        const attainment = calculateAttainment(actual?.actualValue || 0, t.targetValue);
        totalAttainment += attainment;
        count++;
        if (attainment >= 90) greenCount++;
        else if (attainment >= 60) amberCount++;
        else redCount++;
      });
    });

    return {
      totalExecutives: executiveIds.length,
      totalKpis: kpis.length,
      avgAttainment: count > 0 ? totalAttainment / count : 0,
      greenCount,
      amberCount,
      redCount,
      pendingPayouts: pendingPayouts.length,
      pendingManualEntries: pendingManualEntries.length,
    };
  }, [targets, actuals, currentPeriod]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      label: month,
      value: Math.min(150, Math.max(0, stats.avgAttainment + (Math.random() - 0.5) * 30)),
      target: 100,
    }));
  }, [stats.avgAttainment]);

  const barChartData = useMemo(() => {
    return EXECUTIVES.map(exec => {
      const execTargets = currentPeriod
        ? targets.filter(t => t.executiveId === exec.id && t.periodStart === currentPeriod.startDate)
        : [];
      let total = 0;
      let count = 0;
      execTargets.forEach(t => {
        const actual = getActual(exec.id, t.kpiId, t.periodStart);
        total += calculateAttainment(actual?.actualValue || 0, t.targetValue);
        count++;
      });
      return {
        label: exec.name.split(' ')[0],
        value: count > 0 ? Math.round(total / count) : 0,
      };
    });
  }, [targets, actuals, currentPeriod]);

  const topPerformers = useMemo(() => {
    const execStats: Record<string, { name: string; total: number; count: number }> = {};

    EXECUTIVES.forEach(exec => {
      const execTargets = currentPeriod
        ? targets.filter(t => t.executiveId === exec.id && t.periodStart === currentPeriod.startDate)
        : [];

      let total = 0;
      let count = 0;
      execTargets.forEach(t => {
        const actual = getActual(exec.id, t.kpiId, t.periodStart);
        total += calculateAttainment(actual?.actualValue || 0, t.targetValue);
        count++;
      });

      if (count > 0) {
        execStats[exec.id] = { name: exec.name, total, count };
      }
    });

    return Object.entries(execStats)
      .map(([id, data]) => ({
        id,
        name: data.name,
        avgAttainment: data.total / data.count,
      }))
      .sort((a, b) => b.avgAttainment - a.avgAttainment)
      .slice(0, 5);
  }, [targets, actuals, currentPeriod]);

  if (role === 'Executive') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
          </div>
          {currentPeriod && (
            <Badge variant="info" size="md">{currentPeriod.label}</Badge>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-sm text-blue-100">Average Attainment</p>
            <p className="text-3xl font-bold mt-1">{formatAttainment(stats.avgAttainment)}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              <p className="text-sm text-green-700 font-medium">On Track</p>
            </div>
            <p className="text-3xl font-bold text-green-700 mt-2">{stats.greenCount}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full" />
              <p className="text-sm text-amber-700 font-medium">Near Target</p>
            </div>
            <p className="text-3xl font-bold text-amber-700 mt-2">{stats.amberCount}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              <p className="text-sm text-red-700 font-medium">Below Target</p>
            </div>
            <p className="text-3xl font-bold text-red-700 mt-2">{stats.redCount}</p>
          </div>
        </div>

        <PerformanceChart
          title="Performance Trend"
          subtitle="Monthly attainment over time"
          data={chartData}
          height={240}
        />

        <BarChart
          title="KPI Attainment by Executive"
          subtitle="Current period performance"
          data={barChartData}
          height={200}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My KPIs</h3>
            <div className="space-y-3">
              {EXECUTIVES.slice(0, 1).flatMap(exec => {
                const execTargets = currentPeriod
                  ? targets.filter(t => t.executiveId === exec.id && t.periodStart === currentPeriod.startDate)
                  : [];
                return execTargets.slice(0, 6).map(t => {
                  const actual = getActual(exec.id, t.kpiId, t.periodStart);
                  const attainment = calculateAttainment(actual?.actualValue || 0, t.targetValue);
                  return (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{t.kpiName}</p>
                        <p className="text-sm text-gray-500">Target: {t.targetValue}</p>
                      </div>
                      <div className="text-right">
                        <p className={classNames(
                          'text-lg font-bold',
                          attainment >= 90 ? 'text-green-600' : attainment >= 60 ? 'text-amber-600' : 'text-red-600'
                        )}>
                          {formatAttainment(attainment)}
                        </p>
                        <p className="text-xs text-gray-500">Actual: {actual?.actualValue || 0}</p>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors">
                <p className="font-medium text-gray-900">View My Targets</p>
                <p className="text-sm text-gray-500">Review your KPI targets</p>
              </button>
              <button className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors">
                <p className="font-medium text-gray-900">Generate Report</p>
                <p className="text-sm text-gray-500">Download your performance report</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (role === 'Manager') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {currentPeriod && (
              <Badge variant="info" size="md">{currentPeriod.label}</Badge>
            )}
            {stats.pendingManualEntries > 0 && (
              <Badge variant="warning" size="md">{stats.pendingManualEntries} Pending Entries</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-sm text-blue-100">Team Average</p>
            <p className="text-3xl font-bold mt-1">{formatAttainment(stats.avgAttainment)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
            <p className="text-sm text-green-100">On Track</p>
            <p className="text-3xl font-bold mt-1">{stats.greenCount}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
            <p className="text-sm text-amber-100">Near Target</p>
            <p className="text-3xl font-bold mt-1">{stats.amberCount}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white">
            <p className="text-sm text-red-100">Below Target</p>
            <p className="text-3xl font-bold mt-1">{stats.redCount}</p>
          </div>
        </div>

        <PerformanceChart
          title="Team Performance Trend"
          subtitle="Monthly attainment over time"
          data={chartData}
          height={240}
        />

        <BarChart
          title="Team Member Performance"
          subtitle="Attainment by team member"
          data={barChartData}
          height={200}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
            <div className="space-y-3">
              {EXECUTIVES.slice(0, 4).map(exec => {
                const execTargets = currentPeriod
                  ? targets.filter(t => t.executiveId === exec.id && t.periodStart === currentPeriod.startDate)
                  : [];
                let total = 0;
                let count = 0;
                execTargets.forEach(t => {
                  const actual = getActual(exec.id, t.kpiId, t.periodStart);
                  total += calculateAttainment(actual?.actualValue || 0, t.targetValue);
                  count++;
                });
                const avgAttainment = count > 0 ? total / count : 0;
                return (
                  <div key={exec.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {exec.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{exec.name}</p>
                        <p className="text-sm text-gray-500">{exec.team}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={classNames(
                        'text-xl font-bold',
                        avgAttainment >= 90 ? 'text-green-600' : avgAttainment >= 60 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {formatAttainment(avgAttainment)}
                      </p>
                      <p className="text-xs text-gray-500">{count} KPIs</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors">
                <p className="font-medium text-gray-900">Set Targets</p>
                <p className="text-sm text-gray-500">Manage team KPIs</p>
              </button>
              <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors">
                <p className="font-medium text-gray-900">Enter Collection</p>
                <p className="text-sm text-gray-500">Manual collection entry</p>
              </button>
              <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors">
                <p className="font-medium text-gray-900">Trigger Calculation</p>
                <p className="text-sm text-gray-500">Calculate incentives</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Admin or Franchisee View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">KPI Performance Overview</p>
        </div>
        <div className="flex items-center gap-3">
          {currentPeriod && (
            <Badge variant="info" size="md">{currentPeriod.label}</Badge>
          )}
          {stats.pendingPayouts > 0 && (
            <Badge variant="warning" size="md">{stats.pendingPayouts} Pending Approvals</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-5 text-white">
          <p className="text-sm text-blue-100">Organization Average</p>
          <p className="text-3xl font-bold mt-1">{formatAttainment(stats.avgAttainment)}</p>
          <p className="text-xs text-blue-200 mt-1">{stats.totalExecutives} executives</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
          <p className="text-sm text-green-100">On Track (90%+)</p>
          <p className="text-3xl font-bold mt-1">{stats.greenCount}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white">
          <p className="text-sm text-amber-100">Near Target (60-89%)</p>
          <p className="text-3xl font-bold mt-1">{stats.amberCount}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-5 text-white">
          <p className="text-sm text-red-100">Below Target (&lt;60%)</p>
          <p className="text-3xl font-bold mt-1">{stats.redCount}</p>
        </div>
      </div>

      <PerformanceChart
        title="Organization Performance Trend"
        subtitle="Monthly attainment over time"
        data={chartData}
        height={280}
      />

      <BarChart
        title="Executive Performance Overview"
        subtitle="Attainment by executive for current period"
        data={barChartData}
        height={200}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.map((exec, index) => (
              <div key={exec.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={classNames(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  )}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{exec.name}</p>
                    <p className="text-sm text-gray-500">
                      {EXECUTIVES.find(e => e.id === exec.id)?.team}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">{formatAttainment(exec.avgAttainment)}</p>
                  <p className="text-xs text-gray-500">avg attainment</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
          <div className="space-y-3">
            {stats.pendingPayouts > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="font-medium text-amber-800">{stats.pendingPayouts} Payout Approvals</p>
                <p className="text-sm text-amber-600">Review incentive payouts</p>
              </div>
            )}
            {stats.pendingManualEntries > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="font-medium text-blue-800">{stats.pendingManualEntries} Manual Entries</p>
                <p className="text-sm text-blue-600">Awaiting confirmation</p>
              </div>
            )}
            {stats.pendingPayouts === 0 && stats.pendingManualEntries === 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <p className="text-green-700 font-medium">All caught up!</p>
                <p className="text-sm text-green-600">No pending actions</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Franchisee Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-medium text-gray-900">North Region</p>
            <p className="text-2xl font-bold text-green-600 mt-1">92%</p>
            <p className="text-xs text-gray-500">avg attainment</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-medium text-gray-900">South Region</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">78%</p>
            <p className="text-xs text-gray-500">avg attainment</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-medium text-gray-900">East Region</p>
            <p className="text-2xl font-bold text-green-600 mt-1">85%</p>
            <p className="text-xs text-gray-500">avg attainment</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
