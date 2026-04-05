'use client';

import { useState, useMemo } from 'react';
import { useIncentiveStore, useKpiStore, useAuthStore, Role } from '@/store';
import { KPI_CATALOG } from '@/lib/constants';
import { Card, Button, Badge, Modal, Input, Select } from '@/components/ui';
import { 
  Wallet, BarChart2, Award, Calculator, CheckCircle, AlertCircle, 
  TrendingUp, TrendingDown, Minus, Users, FileText, Download, 
  Zap, AlertTriangle, Activity, CircleCheck, Lock, Unlock,
  ChevronDown, ChevronUp, RefreshCw, Filter, Search,
  Check, X, DollarSign, Percent, Calendar, Building2
} from 'lucide-react';
import { classNames } from '@/lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

interface Executive {
  id: string;
  name: string;
  team: string;
  franchisee: string;
}

const EXECUTIVES: Executive[] = [
  { id: 'exec-1', name: 'Rahul Sharma', team: 'Sales Team A', franchisee: 'North Region' },
  { id: 'exec-2', name: 'Priya Patel', team: 'Sales Team A', franchisee: 'North Region' },
  { id: 'exec-3', name: 'Amit Kumar', team: 'Sales Team B', franchisee: 'South Region' },
  { id: 'exec-4', name: 'Sneha Reddy', team: 'Sales Team B', franchisee: 'South Region' },
  { id: 'exec-5', name: 'Vikram Singh', team: 'Sales Team C', franchisee: 'East Region' },
];

interface CommissionConfig {
  kpiId: string;
  kpiName: string;
  percentage: number;
  enabled: boolean;
}

interface SlabConfig {
  id: string;
  kpiId: string;
  kpiName: string;
  minAttainment: number;
  maxAttainment: number;
  bonusType: 'fixed' | 'percentage';
  bonusAmount: number;
  cumulative: boolean;
}

interface PendingPayout {
  id: string;
  executiveId: string;
  executiveName: string;
  team: string;
  franchisee: string;
  period: string;
  salesCommission: number;
  collectionCommission: number;
  slabBonuses: number;
  compositeBonus: number;
  totalPayout: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface IncentiveEnginePageProps {
  role: Role;
  userId: string;
}

const DEFAULT_COMMISSION_CONFIG: CommissionConfig[] = [
  { kpiId: 'kpi-01', kpiName: 'Sales', percentage: 5, enabled: true },
  { kpiId: 'kpi-02', kpiName: 'Collection', percentage: 3, enabled: true },
];

const DEFAULT_SLAB_CONFIGS: SlabConfig[] = [
  { id: 'slab-1', kpiId: 'kpi-03', kpiName: 'Lead Relevancy', minAttainment: 0, maxAttainment: 50, bonusType: 'fixed', bonusAmount: 500, cumulative: false },
  { id: 'slab-2', kpiId: 'kpi-03', kpiName: 'Lead Relevancy', minAttainment: 50, maxAttainment: 75, bonusType: 'fixed', bonusAmount: 1000, cumulative: false },
  { id: 'slab-3', kpiId: 'kpi-03', kpiName: 'Lead Relevancy', minAttainment: 75, maxAttainment: 100, bonusType: 'fixed', bonusAmount: 1500, cumulative: false },
  { id: 'slab-4', kpiId: 'kpi-03', kpiName: 'Lead Relevancy', minAttainment: 100, maxAttainment: 150, bonusType: 'fixed', bonusAmount: 2000, cumulative: false },
  { id: 'slab-5', kpiId: 'kpi-04', kpiName: 'Lead Conversion', minAttainment: 0, maxAttainment: 30, bonusType: 'fixed', bonusAmount: 300, cumulative: false },
  { id: 'slab-6', kpiId: 'kpi-04', kpiName: 'Lead Conversion', minAttainment: 30, maxAttainment: 60, bonusType: 'fixed', bonusAmount: 600, cumulative: false },
];

const MOCK_PENDING_PAYOUTS: PendingPayout[] = [
  { id: 'pout-1', executiveId: 'exec-1', executiveName: 'Rahul Sharma', team: 'Sales Team A', franchisee: 'North Region', period: 'March 2026', salesCommission: 2250, collectionCommission: 1350, slabBonuses: 2000, compositeBonus: 2000, totalPayout: 7600, status: 'pending' },
  { id: 'pout-2', executiveId: 'exec-2', executiveName: 'Priya Patel', team: 'Sales Team A', franchisee: 'North Region', period: 'March 2026', salesCommission: 1800, collectionCommission: 1080, slabBonuses: 1500, compositeBonus: 0, totalPayout: 4380, status: 'pending' },
  { id: 'pout-3', executiveId: 'exec-3', executiveName: 'Amit Kumar', team: 'Sales Team B', franchisee: 'South Region', period: 'March 2026', salesCommission: 2100, collectionCommission: 1260, slabBonuses: 1800, compositeBonus: 2000, totalPayout: 7160, status: 'pending' },
];

export function IncentiveEnginePage({ role, userId }: IncentiveEnginePageProps) {
  const { user } = useAuthStore();
  const { getPendingEntries, hasAllManualEntriesConfirmed } = useKpiStore();
  const { commissionConfig, slabBonuses, compositeBonus, getPendingPayouts, isCalculationLocked, updateCommission } = useIncentiveStore();

  const [activeTab, setActiveTab] = useState<'summary' | 'commission' | 'slabs' | 'team' | 'approvals'>('summary');
  const [showCalcBlockedModal, setShowCalcBlockedModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PendingPayout | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState('exec-1');
  const [selectedKpi, setSelectedKpi] = useState('kpi-03');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAdmin = role === 'Admin';
  const isManager = role === 'Manager';
  const isExecutive = role === 'Executive';
  const canTriggerCalculation = isManager && !isCalculationLocked;
  const pendingPayouts = getPendingPayouts();

  const [localCommissionConfig, setLocalCommissionConfig] = useState<CommissionConfig[]>(DEFAULT_COMMISSION_CONFIG);
  const [localSlabConfigs, setLocalSlabConfigs] = useState<SlabConfig[]>(DEFAULT_SLAB_CONFIGS);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    commission: true,
    slabs: true,
    composite: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const executiveData = useMemo(() => {
    const exec = EXECUTIVES.find(e => e.id === selectedExecutive);
    const salesActual = 45000;
    const collectionActual = 45000;
    const salesCommission = (salesActual * (localCommissionConfig.find(c => c.kpiId === 'kpi-01')?.percentage || 5)) / 100;
    const collectionCommission = (collectionActual * (localCommissionConfig.find(c => c.kpiId === 'kpi-02')?.percentage || 3)) / 100;
    
    let slabBonusTotal = 0;
    const slabBreakdown: Record<string, { name: string; earned: number; nextSlab?: { name: string; delta: number } }> = {};
    
    localSlabConfigs.forEach(slab => {
      const attainment = Math.random() * 150;
      if (attainment >= slab.minAttainment && attainment <= slab.maxAttainment) {
        slabBonusTotal += slab.bonusAmount;
        slabBreakdown[slab.kpiId] = {
          name: `${slab.minAttainment}-${slab.maxAttainment}%`,
          earned: slab.bonusAmount,
        };
      }
    });

    const allKpisEarned = localSlabConfigs.filter(s => s.kpiId === selectedKpi).length > 0;
    const compositeBonusEarned = allKpisEarned;
    const compositeBonusAmount = compositeBonusEarned ? 2000 : 0;

    return {
      executive: exec,
      salesCommission,
      collectionCommission,
      slabBonusTotal,
      slabBreakdown,
      compositeBonusEarned,
      compositeBonusAmount,
      totalEstimated: salesCommission + collectionCommission + slabBonusTotal + compositeBonusAmount,
    };
  }, [selectedExecutive, selectedKpi, localCommissionConfig, localSlabConfigs]);

  const teamIncentiveData = useMemo(() => {
    return EXECUTIVES.map(exec => ({
      ...exec,
      salesCommission: Math.round(Math.random() * 3000),
      collectionCommission: Math.round(Math.random() * 2000),
      slabBonuses: Math.round(Math.random() * 2500),
      compositeBonus: Math.random() > 0.5 ? 2000 : 0,
      totalEstimated: 0,
    })).map(item => ({
      ...item,
      totalEstimated: item.salesCommission + item.collectionCommission + item.slabBonuses + item.compositeBonus,
    }));
  }, []);

  const incentiveTrendData = [
    { label: 'Jan', commission: 3000, slabs: 1500, composite: 0 },
    { label: 'Feb', commission: 3500, slabs: 1800, composite: 2000 },
    { label: 'Mar', commission: executiveData.salesCommission + executiveData.collectionCommission, slabs: executiveData.slabBonusTotal, composite: executiveData.compositeBonusAmount },
  ];

  const handleTriggerCalculation = async () => {
    if (!hasAllManualEntriesConfirmed('exec-1')) {
      setShowCalcBlockedModal(true);
      return;
    }
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const handleApprovePayout = (payoutId: string) => {
    console.log('Approved payout:', payoutId);
  };

  const handleRejectPayout = () => {
    if (selectedPayout && rejectReason.trim()) {
      console.log('Rejected payout:', selectedPayout.id, rejectReason);
      setShowRejectModal(false);
      setSelectedPayout(null);
      setRejectReason('');
    }
  };

  const getTrend = () => {
    const current = incentiveTrendData[incentiveTrendData.length - 1];
    const previous = incentiveTrendData[incentiveTrendData.length - 2];
    const currentTotal = current.commission + current.slabs + current.composite;
    const previousTotal = previous.commission + previous.slabs + previous.composite;
    if (currentTotal > previousTotal) return { icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-500', text: `+${Math.round((currentTotal - previousTotal) / previousTotal * 100)}%` };
    if (currentTotal < previousTotal) return { icon: <TrendingDown className="w-4 h-4" />, color: 'text-red-500', text: `${Math.round((currentTotal - previousTotal) / previousTotal * 100)}%` };
    return { icon: <Minus className="w-4 h-4" />, color: 'text-gray-400', text: '0%' };
  };

  const trend = getTrend();

  const tabs = [
    ...(isExecutive ? [{ id: 'summary', label: 'My Incentive', icon: <Wallet className="w-4 h-4" /> }] : []),
    ...((isManager || isAdmin) ? [
      { id: 'commission', label: 'Commission', icon: <Wallet className="w-4 h-4" /> },
      { id: 'slabs', label: 'Slab Bonuses', icon: <BarChart2 className="w-4 h-4" /> },
      { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    ] : []),
    ...(isAdmin ? [{ id: 'approvals', label: 'Approvals', icon: <CircleCheck className="w-4 h-4" /> }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incentive Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Configure, track, and approve performance-based earnings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Badge variant={isCalculationLocked ? 'danger' : 'success'} size="md">
            {isCalculationLocked ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
            {isCalculationLocked ? 'Locked' : 'Unlocked'}
          </Badge>
          {canTriggerCalculation && (
            <Button onClick={handleTriggerCalculation} disabled={isCalculating}>
              <Calculator className="w-4 h-4 mr-2" />
              {isCalculating ? 'Calculating...' : 'Calculate Incentives'}
            </Button>
          )}
        </div>
      </div>

      {(pendingPayouts.length > 0 || MOCK_PENDING_PAYOUTS.length > 0) && isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">{MOCK_PENDING_PAYOUTS.length} pending payout(s) awaiting approval</p>
              <p className="text-sm text-amber-600">Review and approve or reject them</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setActiveTab('approvals')}>
            View Approvals
          </Button>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={classNames(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span className="mr-2 inline-flex">{tab.icon}</span>
              {tab.label}
              {tab.id === 'approvals' && MOCK_PENDING_PAYOUTS.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                  {MOCK_PENDING_PAYOUTS.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'summary' && isExecutive && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Your Incentive (Estimated)</h3>
                  <div className="flex items-center gap-2">
                    {trend.icon}
                    <span className={classNames('text-sm font-medium', trend.color)}>{trend.text} vs last period</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center justify-center">
                    <div className="relative w-36 h-36">
                      <svg className="w-36 h-36 transform -rotate-90">
                        <circle cx="72" cy="72" r="64" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                        <circle
                          cx="72"
                          cy="72"
                          r="64"
                          stroke="url(#incentiveGradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(executiveData.totalEstimated / 15000) * 402} 402`}
                        />
                        <defs>
                          <linearGradient id="incentiveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">₹{Math.round(executiveData.totalEstimated).toLocaleString()}</span>
                        <span className="text-xs text-gray-500">Total</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={150}>
                      <AreaChart data={incentiveTrendData}>
                        <defs>
                          <linearGradient id="colorIncentive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                        />
                        <Area type="monotone" dataKey={(d) => d.commission + d.slabs + d.composite} stroke="#3b82f6" strokeWidth={2} fill="url(#colorIncentive)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <button 
                      className="flex items-center justify-between w-full"
                      onClick={() => toggleSection('commission')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Percent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Commission</p>
                          <p className="text-sm text-gray-500">Sales & Collection</p>
                        </div>
                      </div>
                      {expandedSections.commission ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                  {expandedSections.commission && (
                    <div className="space-y-2 pl-13">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Sales Commission</span>
                        <span className="font-medium text-gray-900">₹{Math.round(executiveData.salesCommission).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Collection Commission</span>
                        <span className="font-medium text-gray-900">₹{Math.round(executiveData.collectionCommission).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <button 
                      className="flex items-center justify-between w-full"
                      onClick={() => toggleSection('slabs')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Slab Bonuses</p>
                          <p className="text-sm text-gray-500">Performance-based bonuses</p>
                        </div>
                      </div>
                      {expandedSections.slabs ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                  {expandedSections.slabs && (
                    <div className="space-y-2 pl-13">
                      {Object.entries(executiveData.slabBreakdown).map(([kpiId, breakdown]) => (
                        <div key={kpiId} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">{KPI_CATALOG.find(k => k.id === kpiId)?.name} - {breakdown.name}</span>
                          <span className="font-medium text-gray-900">₹{breakdown.earned.toLocaleString()}</span>
                        </div>
                      ))}
                      {Object.keys(executiveData.slabBreakdown).length === 0 && (
                        <p className="text-sm text-gray-500 py-2">No slab bonuses earned yet</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <button 
                      className="flex items-center justify-between w-full"
                      onClick={() => toggleSection('composite')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={classNames("w-10 h-10 rounded-lg flex items-center justify-center", executiveData.compositeBonusEarned ? "bg-green-100" : "bg-gray-100")}>
                          {executiveData.compositeBonusEarned ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Composite Bonus</p>
                          <p className="text-sm text-gray-500">All-or-nothing bonus</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={classNames("font-medium", executiveData.compositeBonusEarned ? "text-green-600" : "text-gray-400")}>
                          {executiveData.compositeBonusEarned ? `₹${executiveData.compositeBonusAmount.toLocaleString()}` : 'Locked'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Commission</span>
                    <span className="font-medium text-gray-900">₹{Math.round(executiveData.salesCommission + executiveData.collectionCommission).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Slab Bonuses</span>
                    <span className="font-medium text-gray-900">₹{executiveData.slabBonusTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Composite</span>
                    <span className="font-medium text-gray-900">₹{executiveData.compositeBonusAmount.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <div className={classNames(
                  'p-4 rounded-xl border-2',
                  executiveData.compositeBonusEarned 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    {executiveData.compositeBonusEarned ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={classNames("font-medium", executiveData.compositeBonusEarned ? "text-green-700" : "text-gray-600")}>
                      Composite Bonus
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {executiveData.compositeBonusEarned 
                      ? "Congratulations! You've earned the composite bonus."
                      : "Complete all KPI slab bonuses to unlock this bonus."
                    }
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'commission' || activeTab === 'slabs') && (isManager || isAdmin) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeTab === 'commission' ? 'Commission Configuration' : 'Slab Bonus Configuration'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'commission' 
                      ? 'Set commission rates for Sales and Collection KPIs' 
                      : 'Define attainment slabs for bonus payouts'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">Save Draft</Button>
                  <Button size="sm">Submit for Approval</Button>
                </div>
              </div>

              {activeTab === 'commission' && (
                <div className="space-y-4">
                  {localCommissionConfig.map((config) => (
                    <div key={config.kpiId} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{config.kpiName}</h4>
                          <p className="text-sm text-gray-500">Percentage of actual value achieved</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={config.percentage}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                setLocalCommissionConfig(prev => prev.map(c => 
                                  c.kpiId === config.kpiId ? { ...c, percentage: value } : c
                                ));
                              }}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium"
                              min="0"
                              max="100"
                              step="0.5"
                            />
                            <span className="text-gray-500">%</span>
                          </div>
                          <Badge variant={config.enabled ? 'success' : 'default'}>
                            {config.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'slabs' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Select
                      label="Select KPI"
                      options={[
                        { value: 'kpi-03', label: 'Lead Relevancy' },
                        { value: 'kpi-04', label: 'Lead Conversion' },
                        { value: 'kpi-05', label: 'Call Connect Rate' },
                      ]}
                      value={selectedKpi}
                      onChange={(e) => setSelectedKpi(e.target.value)}
                    />
                    <Select
                      label="Executive"
                      options={EXECUTIVES.map(e => ({ value: e.id, label: e.name }))}
                      value={selectedExecutive}
                      onChange={(e) => setSelectedExecutive(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    {localSlabConfigs.filter(s => s.kpiId === selectedKpi).map((slab, index) => (
                      <div key={slab.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Slab {index + 1}</span>
                          <Badge variant={slab.cumulative ? 'info' : 'default'}>
                            {slab.cumulative ? 'Cumulative' : 'Non-Cumulative'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">From (%)</label>
                            <input
                              type="number"
                              value={slab.minAttainment}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setLocalSlabConfigs(prev => prev.map(s => 
                                  s.id === slab.id ? { ...s, minAttainment: value } : s
                                ));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                              max="150"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">To (%)</label>
                            <input
                              type="number"
                              value={slab.maxAttainment}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setLocalSlabConfigs(prev => prev.map(s => 
                                  s.id === slab.id ? { ...s, maxAttainment: value } : s
                                ));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                              max="150"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Bonus Type</label>
                            <select
                              value={slab.bonusType}
                              onChange={(e) => {
                                setLocalSlabConfigs(prev => prev.map(s => 
                                  s.id === slab.id ? { ...s, bonusType: e.target.value as 'fixed' | 'percentage' } : s
                                ));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="fixed">Fixed ₹</option>
                              <option value="percentage">% of CTC</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Amount</label>
                            <input
                              type="number"
                              value={slab.bonusAmount}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setLocalSlabConfigs(prev => prev.map(s => 
                                  s.id === slab.id ? { ...s, bonusAmount: value } : s
                                ));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Composite Bonus</h3>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-purple-700">Bonus Amount</span>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <p className="text-3xl font-bold text-purple-900">₹2,000</p>
                <p className="text-sm text-purple-600 mt-2">Fixed amount</p>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                All-or-nothing bonus when all individual KPI slab bonuses are earned.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Configuration Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Commission</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Slab Bonuses</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Composite</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'team' && (isManager || isAdmin) && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team Incentive Summary</h3>
              <p className="text-sm text-gray-500">View and manage team incentives</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Executive</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sales Comm.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collection Comm.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Slab Bonuses</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Composite</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamIncentiveData.map((exec) => (
                  <tr key={exec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {exec.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{exec.name}</p>
                          <p className="text-xs text-gray-500">{exec.team}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">₹{exec.salesCommission.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">₹{exec.collectionCommission.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium">₹{exec.slabBonuses.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      {exec.compositeBonus > 0 ? (
                        <span className="text-green-600 font-medium">₹{exec.compositeBonus.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">₹{exec.totalEstimated.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={exec.totalEstimated > 5000 ? 'success' : 'warning'} size="sm">
                        {exec.totalEstimated > 5000 ? 'High' : 'Average'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'approvals' && isAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select
                label="Franchisee"
                options={[
                  { value: '', label: 'All Franchisees' },
                  { value: 'north', label: 'North Region' },
                  { value: 'south', label: 'South Region' },
                  { value: 'east', label: 'East Region' },
                ]}
                value=""
                onChange={() => {}}
              />
              <Select
                label="Period"
                options={[
                  { value: '2026-03', label: 'March 2026' },
                  { value: '2026-02', label: 'February 2026' },
                ]}
                value="2026-03"
                onChange={() => {}}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Reject Selected</Button>
              <Button size="sm">Approve All</Button>
            </div>
          </div>

          <div className="space-y-4">
            {MOCK_PENDING_PAYOUTS.map((payout) => (
              <Card key={payout.id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {payout.executiveName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{payout.executiveName}</h4>
                      <p className="text-sm text-gray-500">{payout.team} • {payout.franchisee}</p>
                    </div>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Sales Comm.</p>
                    <p className="text-lg font-bold text-gray-900">₹{payout.salesCommission.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Collection Comm.</p>
                    <p className="text-lg font-bold text-gray-900">₹{payout.collectionCommission.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Slab Bonuses</p>
                    <p className="text-lg font-bold text-gray-900">₹{payout.slabBonuses.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Composite</p>
                    <p className="text-lg font-bold text-gray-900">₹{payout.compositeBonus.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600">Total</p>
                    <p className="text-xl font-bold text-blue-600">₹{payout.totalPayout.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    size="sm" 
                    variant="danger"
                    onClick={() => {
                      setSelectedPayout(payout);
                      setShowRejectModal(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleApprovePayout(payout.id)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showCalcBlockedModal}
        onClose={() => setShowCalcBlockedModal(false)}
        title="Cannot Trigger Calculation"
        size="md"
      >
        <div className="text-center py-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Calculation Blocked</h3>
          <p className="text-gray-500 mt-2">
            All manual collection entries must be confirmed before triggering the calculation.
          </p>
          <p className="text-sm text-amber-600 mt-2">
            Collection actuals pending for 2 executive(s).
          </p>
        </div>
        <div className="mt-6">
          <Button onClick={() => setShowCalcBlockedModal(false)} className="w-full">
            Understood
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedPayout(null);
          setRejectReason('');
        }}
        title="Reject Incentive Payout"
        size="md"
      >
        <div className="space-y-4">
          {selectedPayout && (
            <>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Executive</p>
                <p className="font-medium text-gray-900">{selectedPayout.executiveName}</p>
                <p className="text-sm text-gray-500 mt-2">Total Incentive</p>
                <p className="font-medium text-gray-900">₹{selectedPayout.totalPayout.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this payout is being rejected..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">{rejectReason.length}/500</p>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowRejectModal(false);
                setSelectedPayout(null);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleRejectPayout}
              disabled={!rejectReason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
