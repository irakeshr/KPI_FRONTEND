'use client';

import { useState, useMemo } from 'react';
import { useTargetStore, useKpiStore, useAuthStore, Role } from '@/store';
import { KPI_CATALOG } from '@/lib/constants';
import { KpiCard } from './KpiCard';
import { CompletionTatCard } from './CompletionTatCard';
import { ManualCollectionEntryForm } from './ManualCollectionEntryForm';
import { PendingManualEntryWarningBanner } from './PendingManualEntryWarning';
import { Card, Button, Select, Badge, Modal, Input } from '@/components/ui';
import { formatDate, calculateAttainment, formatAttainment, classNames } from '@/lib/utils';
import { 
  RefreshCw, Calendar, TrendingUp, TrendingDown, Minus, 
  AlertTriangle, CheckCircle, DollarSign, Activity, Users, 
  Target, Filter, ChevronDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

type Granularity = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface Executive {
  id: string;
  name: string;
  team: string;
}

const EXECUTIVES: Executive[] = [
  { id: 'exec-1', name: 'Rahul Sharma', team: 'Sales Team A' },
  { id: 'exec-2', name: 'Priya Patel', team: 'Sales Team A' },
  { id: 'exec-3', name: 'Amit Kumar', team: 'Sales Team B' },
  { id: 'exec-4', name: 'Sneha Reddy', team: 'Sales Team B' },
];

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const QUICK_PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
];

interface KpiTrackingPageProps {
  role: Role;
  userId: string;
}

export function KpiTrackingPage({ role, userId }: KpiTrackingPageProps) {
  const { user } = useAuthStore();
  const { targets, getCurrentPeriod } = useTargetStore();
  const { actuals, getActual, getAverageTat, manualEntries, confirmManualEntry, addManualEntry, getPendingEntries } = useKpiStore();
  
  const [selectedExecutive, setSelectedExecutive] = useState<string>(role === 'Executive' ? 'exec-1' : 'exec-1');
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [granularity, setGranularity] = useState<Granularity>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-04');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'updating'>('connected');

  const currentPeriod = getCurrentPeriod();
  const pendingEntries = getPendingEntries();

  const canEnterCollection = role === 'Manager' || role === 'Admin';
  const canViewAllExecutives = role !== 'Executive';

  const executiveTargets = currentPeriod
    ? targets.filter(t => t.executiveId === selectedExecutive && t.periodStart === currentPeriod.startDate)
    : [];

  const executiveActuals = currentPeriod
    ? Object.values(actuals).filter(a => a.executiveId === selectedExecutive && a.periodStart === currentPeriod.startDate)
    : [];

  const averageTat = currentPeriod ? getAverageTat(selectedExecutive, currentPeriod.startDate) : 0;

  const summaryStats = useMemo(() => {
    let totalAttainment = 0;
    let greenCount = 0;
    let amberCount = 0;
    let redCount = 0;

    executiveTargets.forEach(t => {
      const actual = getActual(t.executiveId, t.kpiId, t.periodStart);
      const actualValue = actual?.actualValue || 0;
      const attainment = calculateAttainment(actualValue, t.targetValue);
      totalAttainment += attainment;

      if (attainment >= 90) greenCount++;
      else if (attainment >= 60) amberCount++;
      else redCount++;
    });

    const avgAttainment = executiveTargets.length > 0 ? totalAttainment / executiveTargets.length : 0;
    
    return {
      totalTargets: executiveTargets.length,
      greenCount,
      amberCount,
      redCount,
      avgAttainment,
      totalAttainment,
    };
  }, [executiveTargets, actuals, getActual]);

  const pieData = [
    { name: 'On Track', value: summaryStats.greenCount, color: '#10b981' },
    { name: 'Near Target', value: summaryStats.amberCount, color: '#f59e0b' },
    { name: 'Below Target', value: summaryStats.redCount, color: '#ef4444' },
  ];

  const trendData = [
    { label: 'Jan', value: 78 },
    { label: 'Feb', value: 85 },
    { label: 'Mar', value: 72 },
    { label: 'Apr', value: summaryStats.avgAttainment },
  ];

  const getTrend = () => {
    const current = trendData[trendData.length - 1].value;
    const previous = trendData[trendData.length - 2].value;
    if (current > previous) return { icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-500', text: `+${((current - previous) / previous * 100).toFixed(1)}%` };
    if (current < previous) return { icon: <TrendingDown className="w-4 h-4" />, color: 'text-red-500', text: `${((current - previous) / previous * 100).toFixed(1)}%` };
    return { icon: <Minus className="w-4 h-4" />, color: 'text-gray-400', text: '0%' };
  };

  const trend = getTrend();
  const tatTarget = executiveTargets.find(t => t.kpiId === 'kpi-13');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setConnectionStatus('updating');
    setTimeout(() => {
      setIsRefreshing(false);
      setConnectionStatus('connected');
    }, 1500);
  };

  const handleSaveCollection = (entry: any) => {
    const exec = EXECUTIVES.find(e => e.id === selectedExecutive);
    addManualEntry({
      executiveId: selectedExecutive,
      executiveName: exec?.name || '',
      amount: entry.amount,
      source: entry.source,
      reference: entry.notes || '',
      date: entry.date,
      status: 'pending',
    });
    setShowCollectionForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Tracking & Actuals</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time performance monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'updating' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-medium text-green-700">
              {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'updating' ? 'Updating...' : 'Offline'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          {canEnterCollection && (
            <Button onClick={() => setShowCollectionForm(true)}>
              <DollarSign className="w-4 h-4 mr-2" />
              Enter Collection
            </Button>
          )}
        </div>
      </div>

      {pendingEntries.length > 0 && (
        <PendingManualEntryWarningBanner
          pendingCount={pendingEntries.length}
          executives={pendingEntries.map(e => ({ id: e.executiveId, name: e.executiveName }))}
          onViewPending={() => setShowPendingModal(true)}
        />
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {GRANULARITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGranularity(opt.value)}
                className={classNames(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  granularity === opt.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {QUICK_PERIODS.map((period) => (
              <button
                key={period.id}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {canViewAllExecutives && (
            <div className="w-64">
              <Select
                label="Executive"
                options={EXECUTIVES.map(e => ({ value: e.id, label: `${e.name} (${e.team})` }))}
                value={selectedExecutive}
                onChange={(e) => setSelectedExecutive(e.target.value)}
              />
            </div>
          )}
          {currentPeriod && (
            <div className="text-sm text-gray-500">
              Period: <span className="font-medium text-gray-700">{formatDate(currentPeriod.startDate)} - {formatDate(currentPeriod.endDate)}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
              <div className="flex items-center gap-2">
                {trend.icon}
                <span className={classNames('text-sm font-medium', trend.color)}>{trend.text} vs last period</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#progressGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(summaryStats.avgAttainment / 150) * 352} 352`}
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{formatAttainment(summaryStats.avgAttainment)}</span>
                    <span className="text-xs text-gray-500">attainment</span>
                  </div>
                </div>
              </div>

              <div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [`${value}%`, 'Attainment']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">KPI Performance</h3>
              <Badge variant="default">{summaryStats.totalTargets} KPIs</Badge>
            </div>

            {executiveTargets.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No targets set for this period</p>
                <p className="text-sm text-gray-400 mt-1">Contact your manager to set targets.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {executiveTargets
                  .filter(t => t.kpiId !== 'kpi-13')
                  .map((target) => {
                    const kpi = KPI_CATALOG.find(k => k.id === target.kpiId);
                    if (!kpi) return null;
                    const actual = getActual(target.executiveId, target.kpiId, target.periodStart);
                    return (
                      <KpiCard
                        key={target.id}
                        kpi={kpi}
                        target={target}
                        actualValue={actual?.actualValue || 0}
                      />
                    );
                  })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-500">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">{summaryStats.greenCount}</p>
                <p className="text-xs text-green-700 mt-1">On Track</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">{summaryStats.amberCount}</p>
                <p className="text-xs text-amber-700 mt-1">Near Target</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">{summaryStats.redCount}</p>
                <p className="text-xs text-red-700 mt-1">Below Target</p>
              </div>
            </div>
          </Card>

          {tatTarget && (
            <CompletionTatCard
              target={tatTarget}
              actualValues={[6, 8, 9, 7, 10, 8, 9, 7, 11, 6]}
              onEditActual={canEnterCollection ? () => {} : undefined}
            />
          )}

          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total Targets</span>
                <span className="font-medium text-gray-900">{summaryStats.totalTargets}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Avg Attainment</span>
                <span className="font-medium text-gray-900">{formatAttainment(summaryStats.avgAttainment)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="font-medium text-gray-900 text-sm">Just now</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ManualCollectionEntryForm
        isOpen={showCollectionForm}
        onClose={() => setShowCollectionForm(false)}
        onSubmit={handleSaveCollection}
        executiveName={EXECUTIVES.find(e => e.id === selectedExecutive)?.name || ''}
        periodStart={currentPeriod?.startDate || ''}
        periodEnd={currentPeriod?.endDate || ''}
      />

      <Modal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        title="Pending Manual Collection Entries"
        size="lg"
      >
        <div className="space-y-3">
          {pendingEntries.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending entries.</p>
          ) : (
            pendingEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-white border border-amber-200 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900">{entry.executiveName}</p>
                  <p className="text-sm text-gray-500">
                    ₹{entry.amount.toLocaleString()} • {entry.source} • {formatDate(entry.date)}
                  </p>
                  {entry.reference && (
                    <p className="text-xs text-gray-400 mt-1">Ref: {entry.reference}</p>
                  )}
                </div>
                {canEnterCollection && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" onClick={() => {}}>Reject</Button>
                    <Button size="sm" onClick={() => confirmManualEntry(entry.id, userId)}>Confirm</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
