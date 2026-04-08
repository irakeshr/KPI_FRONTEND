'use client';

import { useState, useMemo } from 'react';
import { useIncentiveStore, useKpiStore, useAuthStore, Role } from '@/store';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { 
  Wallet, Percent, Award, Users, Calculator, CheckCircle, AlertTriangle,
  ChevronDown, Search, X, Lock, Unlock, Wifi, WifiOff, RefreshCw,
  DollarSign, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
  Calendar, Clock, FileText, Download, Filter, Settings, ChevronRight,
  CircleCheck, Eye, Info, Building2, Receipt, Sparkles, Check,
  AlertCircle, ExternalLink, RotateCcw, FileBarChart, Layers, XCircle
} from 'lucide-react';

type ViewTab = 'overview' | 'configure' | 'team' | 'approvals' | 'history';
type KpiCategory = 'Cumulative' | 'Non-Cumulative';

interface Executive {
  id: string;
  firstName: string;
  lastName: string;
  team: string;
  teamId: string;
  franchiseeName: string;
  avgAttainment: number;
  status: 'active' | 'inactive';
  ctc?: number;
}

const ALL_EXECUTIVES: Executive[] = [
  { id: 'exec-1', firstName: 'Rahul', lastName: 'Sharma', team: 'Sales Team A', teamId: 'team-1', franchiseeName: 'North Region', avgAttainment: 92, status: 'active', ctc: 600000 },
  { id: 'exec-2', firstName: 'Priya', lastName: 'Patel', team: 'Sales Team A', teamId: 'team-1', franchiseeName: 'North Region', avgAttainment: 87, status: 'active', ctc: 550000 },
  { id: 'exec-3', firstName: 'Amit', lastName: 'Kumar', team: 'Sales Team B', teamId: 'team-2', franchiseeName: 'North Region', avgAttainment: 78, status: 'active', ctc: 500000 },
  { id: 'exec-4', firstName: 'Sneha', lastName: 'Reddy', team: 'Sales Team B', teamId: 'team-2', franchiseeName: 'South Region', avgAttainment: 95, status: 'active', ctc: 650000 },
  { id: 'exec-5', firstName: 'Vikram', lastName: 'Singh', team: 'Sales Team C', teamId: 'team-3', franchiseeName: 'South Region', avgAttainment: 71, status: 'active', ctc: 480000 },
  { id: 'exec-6', firstName: 'Raj', lastName: 'Kumar', team: 'Sales Team D', teamId: 'team-4', franchiseeName: 'East Region', avgAttainment: 88, status: 'active', ctc: 520000 },
];

const MANAGER_TEAMS: Record<string, string[]> = {
  'manager-1': ['team-1', 'team-2'],
  'manager-2': ['team-3', 'team-4'],
};

const getExecutivesForRole = (role: Role, userId: string): Executive[] => {
  if (role === 'Admin') return ALL_EXECUTIVES.filter(e => e.status === 'active');
  if (role === 'Manager') {
    const teamIds = MANAGER_TEAMS[userId] || ['team-1', 'team-2'];
    return ALL_EXECUTIVES.filter(e => e.status === 'active' && teamIds.includes(e.teamId));
  }
  return ALL_EXECUTIVES.filter(e => e.id === userId);
};

const KPI_LIST = [
  { id: 'kpi-03', name: 'Lead Relevancy', category: 'Non-Cumulative', unit: '%', trigger: 'Achievement %' },
  { id: 'kpi-04', name: 'Lead Conversion', category: 'Non-Cumulative', unit: '%', trigger: 'Achievement %' },
  { id: 'kpi-05', name: 'Call Connect Rate', category: 'Non-Cumulative', unit: '%', trigger: 'Achievement %' },
  { id: 'kpi-06', name: 'Deal Creation', category: 'Non-Cumulative', unit: 'count', trigger: 'Absolute count' },
  { id: 'kpi-07', name: 'Quote Creation', category: 'Non-Cumulative', unit: 'count', trigger: 'Absolute count' },
  { id: 'kpi-08', name: 'Completion TAT', category: 'Non-Cumulative', unit: 'days', trigger: 'Lower is better' },
  { id: 'kpi-09', name: 'Dialed Calls', category: 'Cumulative', unit: 'calls', trigger: 'Absolute count' },
  { id: 'kpi-10', name: 'Customer Touch', category: 'Cumulative', unit: 'touches', trigger: 'Absolute count' },
  { id: 'kpi-11', name: 'Talk Time', category: 'Cumulative', unit: 'mins', trigger: 'Absolute minutes' },
  { id: 'kpi-12', name: 'Clients Onboarded', category: 'Cumulative', unit: 'clients', trigger: 'Absolute count' },
  { id: 'kpi-13', name: 'Number of Services', category: 'Cumulative', unit: 'services', trigger: 'Absolute count' },
];

interface SlabBonus {
  from: number;
  to: number;
  bonusType: 'fixed' | 'percentage';
  amount: number;
}

interface CommissionConfig {
  salesRate: number;
  collectionRate: number;
}

interface IncentiveEnginePageProps {
  role: Role;
  userId: string;
}

interface PayoutRecord {
  id: string;
  executiveId: string;
  executiveName: string;
  teamName: string;
  period: string;
  salesCommission: number;
  collectionCommission: number;
  slabBonuses: number;
  compositeBonus: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'exported';
  rejectionNote?: string;
  calculatedAt?: string;
  approvedAt?: string;
  exportedAt?: string;
}

export function IncentiveEnginePage({ role, userId }: IncentiveEnginePageProps) {
  const { isCalculationLocked } = useIncentiveStore();
  const { hasAllManualEntriesConfirmed, getPendingEntries } = useKpiStore();
  const [configStatus, setConfigStatus] = useState<'draft' | 'pending' | 'active'>('active');

  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string>('exec-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExecutiveDrawer, setShowExecutiveDrawer] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2026-04');
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [configTab, setConfigTab] = useState<'commission' | 'slabs' | 'composite'>('commission');
  const [selectedKpiForSlab, setSelectedKpiForSlab] = useState<string>(KPI_LIST[0].id);

  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig>({ salesRate: 5, collectionRate: 3 });
  const [slabConfigs, setSlabConfigs] = useState<Record<string, SlabBonus[]>>({
    'kpi-03': [
      { from: 0, to: 50, bonusType: 'fixed', amount: 500 },
      { from: 50, to: 75, bonusType: 'fixed', amount: 1000 },
      { from: 75, to: 100, bonusType: 'fixed', amount: 1500 },
      { from: 100, to: 150, bonusType: 'fixed', amount: 2000 },
    ],
    'kpi-04': [
      { from: 0, to: 50, bonusType: 'fixed', amount: 600 },
      { from: 50, to: 75, bonusType: 'fixed', amount: 1200 },
      { from: 75, to: 100, bonusType: 'fixed', amount: 1800 },
      { from: 100, to: 150, bonusType: 'fixed', amount: 2400 },
    ],
  });
  const [compositeBonusAmount, setCompositeBonusAmount] = useState<number>(5000);

  const isAdmin = role === 'Admin';
  const isManager = role === 'Manager';
  const isExecutive = role === 'Executive';
  const canConfigure = isManager || isAdmin;
  const canTriggerCalculation = isManager && !isCalculationLocked;
  const canApprove = isAdmin;

  const availableExecutives = useMemo(() => getExecutivesForRole(role, userId), [role, userId]);
  const selectedExecutive = ALL_EXECUTIVES.find(e => e.id === selectedExecutiveId);
  const pendingEntries = getPendingEntries();
  const hasMissingActuals = pendingEntries.length > 0;

  const filteredExecutives = useMemo(() => {
    if (!searchQuery) return availableExecutives;
    const query = searchQuery.toLowerCase();
    return availableExecutives.filter(exec => {
      const fullName = `${exec.firstName} ${exec.lastName}`.toLowerCase();
      return fullName.includes(query) || exec.team.toLowerCase().includes(query);
    });
  }, [availableExecutives, searchQuery]);

  const incentiveData = useMemo(() => {
    const salesActual = 45000;
    const collectionActual = 42000;
    const salesCommission = (salesActual * commissionConfig.salesRate) / 100;
    const collectionCommission = (collectionActual * commissionConfig.collectionRate) / 100;

    let totalSlabBonus = 0;
    const slabBreakdown: Record<string, { earned: number; attainment: number; nextTarget?: number; achieved: boolean }> = {};
    const missingKpis: string[] = [];

    KPI_LIST.forEach(kpi => {
      const attainment = 60 + Math.random() * 50;
      const slabs = slabConfigs[kpi.id] || [];
      const achievedSlab = slabs.find(s => attainment >= s.from && attainment < s.to);

      if (achievedSlab) {
        if (kpi.category === 'Cumulative') {
          const achievedIndex = slabs.indexOf(achievedSlab);
          const cumulativeBonus = slabs.slice(0, achievedIndex + 1).reduce((sum, s) => sum + s.amount, 0);
          totalSlabBonus += cumulativeBonus;
          slabBreakdown[kpi.id] = { earned: cumulativeBonus, attainment, achieved: true };
        } else {
          totalSlabBonus += achievedSlab.amount;
          slabBreakdown[kpi.id] = { earned: achievedSlab.amount, attainment, achieved: true };
        }
      } else {
        missingKpis.push(kpi.name);
        slabBreakdown[kpi.id] = { earned: 0, attainment, achieved: false };
      }
    });

    const allKpisEarned = missingKpis.length === 0;
    const compositeBonus = allKpisEarned ? compositeBonusAmount : 0;
    const total = salesCommission + collectionCommission + totalSlabBonus + compositeBonus;

    return {
      salesCommission,
      collectionCommission,
      totalSlabBonus,
      slabBreakdown,
      compositeBonus,
      compositeEarned: allKpisEarned,
      missingKpis,
      total,
    };
  }, [commissionConfig, slabConfigs, compositeBonusAmount]);

  const teamIncentiveData: PayoutRecord[] = useMemo(() => {
    return availableExecutives.map(exec => ({
      id: `payout-${exec.id}`,
      executiveId: exec.id,
      executiveName: `${exec.firstName} ${exec.lastName}`,
      teamName: exec.team,
      period: selectedPeriod,
      salesCommission: Math.round(Math.random() * 3000 + 2000),
      collectionCommission: Math.round(Math.random() * 2000 + 1500),
      slabBonuses: Math.round(Math.random() * 5000 + 3000),
      compositeBonus: Math.random() > 0.5 ? compositeBonusAmount : 0,
      total: 0,
      status: 'pending' as const,
    })).map(p => ({ ...p, total: p.salesCommission + p.collectionCommission + p.slabBonuses + p.compositeBonus }));
  }, [availableExecutives, selectedPeriod, compositeBonusAmount]);

  const summaryStats = useMemo(() => {
    const total = teamIncentiveData.reduce((sum, e) => sum + e.total, 0);
    const pending = teamIncentiveData.filter(e => e.status === 'pending').length;
    const approved = teamIncentiveData.filter(e => e.status === 'approved').length;
    return { total, pending, approved, count: teamIncentiveData.length };
  }, [teamIncentiveData]);

  const validateSlabs = (slabs: SlabBonus[]): { valid: boolean; error?: string } => {
    if (slabs.length < 2) return { valid: false, error: 'Minimum 2 slabs required' };
    if (slabs.length > 8) return { valid: false, error: 'Maximum 8 slabs allowed' };

    const sorted = [...slabs].sort((a, b) => a.from - b.from);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].from !== sorted[i - 1].to) {
        return { valid: false, error: `Gap found between slab ${i} and ${i + 1}` };
      }
      if (sorted[i].from <= sorted[i - 1].from) {
        return { valid: false, error: `Overlapping slabs detected` };
      }
    }
    return { valid: true };
  };

  const handleTriggerCalculation = () => {
    if (hasMissingActuals) {
      setShowCalcModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmCalculation = () => {
    setShowConfirmModal(false);
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 2000);
  };

  const handleApprove = (payout: PayoutRecord) => {
    alert(`Approved payout for ${payout.executiveName}`);
  };

  const handleReject = () => {
    if (selectedPayout && rejectReason.trim()) {
      setShowRejectModal(false);
      setSelectedPayout(null);
      setRejectReason('');
    }
  };

  const getConfigStatusBadge = () => {
    switch (configStatus) {
      case 'active':
        return <Badge variant="success" size="md" className="gap-1"><CheckCircle className="w-3 h-3" /> Active</Badge>;
      case 'pending':
        return <Badge variant="warning" size="md" className="gap-1"><Clock className="w-3 h-3" /> Pending Approval</Badge>;
      default:
        return <Badge variant="default" size="md" className="gap-1"><Settings className="w-3 h-3" /> Draft</Badge>;
    }
  };

  const selectedKpi = KPI_LIST.find(k => k.id === selectedKpiForSlab);
  const selectedKpiSlabs = slabConfigs[selectedKpiForSlab] || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Incentive Engine</h1>
                <p className="text-xs text-slate-500">
                  {isExecutive ? 'Your Incentive Dashboard' : isManager ? 'Team Performance Earnings' : 'Organization Incentive Management'}
                </p>
              </div>
            </div>

            {role !== 'Executive' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowExecutiveDrawer(!showExecutiveDrawer)}
                  className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {selectedExecutive?.firstName?.[0]}{selectedExecutive?.lastName?.[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">{selectedExecutive?.firstName} {selectedExecutive?.lastName}</p>
                    <p className="text-xs text-slate-500">{summaryStats.count} members</p>
                  </div>
                  <ChevronDown className={classNames('w-4 h-4 text-slate-400 transition-transform', showExecutiveDrawer && 'rotate-180')} />
                </button>

                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <input
                    type="month"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className={classNames(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
                connectionStatus === 'connected' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              )}>
                {connectionStatus === 'connected' ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <Wifi className="w-3 h-3" />
                    <span>Live</span>
                  </>
                ) : (
                  <><WifiOff className="w-3 h-3" /><span>Offline</span></>
                )}
              </div>

              {getConfigStatusBadge()}

              {isCalculationLocked ? (
                <Badge variant="danger" size="md" className="gap-1">
                  <Lock className="w-3 h-3" /> Period Locked
                </Badge>
              ) : (
                <Badge variant="success" size="md" className="gap-1">
                  <Unlock className="w-3 h-3" /> Active
                </Badge>
              )}

              {canTriggerCalculation && (
                <Button
                  onClick={handleTriggerCalculation}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4" />
                  )}
                  Trigger Calculation
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Drawer */}
      {showExecutiveDrawer && role !== 'Executive' && (
        <div className="bg-white border-b border-slate-200 px-6 py-4 animate-in slide-in-from-top-2">
          <div className="max-w-5xl mx-auto">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filteredExecutives.map((exec) => (
                <button
                  key={exec.id}
                  onClick={() => { setSelectedExecutiveId(exec.id); setShowExecutiveDrawer(false); }}
                  className={classNames(
                    'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                    selectedExecutiveId === exec.id
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {exec.firstName[0]}{exec.lastName[0]}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{exec.firstName} {exec.lastName}</p>
                    <p className="text-xs text-slate-500 truncate">{exec.team}</p>
                    <p className="text-xs font-semibold text-indigo-600">{exec.avgAttainment}%</p>
                  </div>
                  {selectedExecutiveId === exec.id && <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <Layers className="w-4 h-4" /> },
            ...(canConfigure ? [
              { id: 'configure', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
              { id: 'team', label: 'Team Summary', icon: <Users className="w-4 h-4" /> },
            ] : []),
            ...(canApprove ? [
              { id: 'approvals', label: 'Approvals', icon: <CheckCircle className="w-4 h-4" />, badge: summaryStats.pending },
            ] : []),
            { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ViewTab)}
              className={classNames(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              )}
            >
              {tab.icon}
              {tab.label}
              {'badge' in tab && typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Total Incentive Hero Card */}
            <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white !border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Your Estimated Incentive</p>
                    <p className="text-4xl font-bold mt-1">₹{Math.round(incentiveData.total).toLocaleString()}</p>
                    <p className="text-indigo-200 text-xs mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {isCalculationLocked ? 'Final locked amount' : 'Real-time estimate - updates with actuals'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Summary Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="!p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Sales Commission</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">₹{Math.round(incentiveData.salesCommission).toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">{commissionConfig.salesRate}% of sales</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
              <Card className="!p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Collection Commission</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">₹{Math.round(incentiveData.collectionCommission).toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">{commissionConfig.collectionRate}% of collection</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
              <Card className="!p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">KPI Slab Bonuses</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">₹{Math.round(incentiveData.totalSlabBonus).toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">11 KPIs tracked</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
              <Card className={classNames(
                '!p-4 hover:shadow-md transition-shadow',
                incentiveData.compositeEarned ? 'ring-2 ring-emerald-500' : ''
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Composite Bonus</p>
                    <p className={classNames(
                      'text-2xl font-bold mt-1',
                      incentiveData.compositeEarned ? 'text-emerald-600' : 'text-slate-400'
                    )}>
                      {incentiveData.compositeEarned ? `₹${compositeBonusAmount.toLocaleString()}` : 'Locked'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {incentiveData.compositeEarned ? 'All KPIs achieved!' : `${incentiveData.missingKpis.length} KPIs missing`}
                    </p>
                  </div>
                  <div className={classNames(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    incentiveData.compositeEarned
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                      : 'bg-gradient-to-br from-slate-300 to-slate-500'
                  )}>
                    {incentiveData.compositeEarned ? (
                      <Award className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Three Layer Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Layer 1: Commission */}
              <Card className="!p-0 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Percent className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Layer 1: Commission</h3>
                      <p className="text-xs text-slate-500">Sales & Collection</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-700">Sales</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">₹{Math.round(incentiveData.salesCommission).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-violet-600" />
                        <span className="text-sm font-medium text-slate-700">Collection</span>
                      </div>
                      <span className="text-sm font-bold text-violet-600">₹{Math.round(incentiveData.collectionCommission).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Subtotal</span>
                    <span className="text-lg font-bold text-slate-900">₹{Math.round(incentiveData.salesCommission + incentiveData.collectionCommission).toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Layer 2: Slab Bonuses */}
              <Card className="!p-0 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Layer 2: Slab Bonuses</h3>
                      <p className="text-xs text-slate-500">11 KPIs</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {KPI_LIST.slice(0, 6).map((kpi) => {
                      const data = incentiveData.slabBreakdown[kpi.id];
                      return (
                        <div key={kpi.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={classNames(
                              'w-2 h-2 rounded-full',
                              data?.achieved ? 'bg-emerald-500' : 'bg-slate-300'
                            )} />
                            <span className="text-xs font-medium text-slate-700">{kpi.name}</span>
                          </div>
                          <span className={classNames(
                            'text-xs font-semibold',
                            data?.achieved ? 'text-emerald-600' : 'text-slate-400'
                          )}>
                            {data?.achieved ? `₹${data.earned.toLocaleString()}` : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Subtotal</span>
                    <span className="text-lg font-bold text-slate-900">₹{Math.round(incentiveData.totalSlabBonus).toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Layer 3: Composite Bonus */}
              <Card className={classNames(
                '!p-0 overflow-hidden',
                incentiveData.compositeEarned ? 'ring-2 ring-emerald-500' : ''
              )}>
                <div className={classNames(
                  'h-1',
                  incentiveData.compositeEarned
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                    : 'bg-gradient-to-r from-slate-400 to-slate-500'
                )} />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={classNames(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      incentiveData.compositeEarned ? 'bg-emerald-100' : 'bg-slate-100'
                    )}>
                      {incentiveData.compositeEarned ? (
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Layer 3: Composite</h3>
                      <p className="text-xs text-slate-500">All-or-nothing</p>
                    </div>
                  </div>

                  {incentiveData.compositeEarned ? (
                    <div className="text-center py-6 bg-emerald-50 rounded-xl">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">Congratulations!</p>
                      <p className="text-xs text-emerald-600 mt-1">All KPI slab bonuses earned</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-2">₹{compositeBonusAmount.toLocaleString()}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">Locked</p>
                      <p className="text-xs text-slate-400 mt-1 mb-3">Missing KPI bonuses:</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {incentiveData.missingKpis.slice(0, 3).map((kpi, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{kpi}</span>
                        ))}
                        {incentiveData.missingKpis.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">+{incentiveData.missingKpis.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* KPI Breakdown Table */}
            <Card className="!p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-900">KPI Slab Bonus Breakdown</h3>
                <p className="text-xs text-slate-500">Attainment and bonus earned per KPI</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">KPI</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Attainment</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Bonus Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {KPI_LIST.map((kpi) => {
                      const data = incentiveData.slabBreakdown[kpi.id];
                      return (
                        <tr key={kpi.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={classNames(
                                'w-2 h-2 rounded-full',
                                data?.achieved ? 'bg-emerald-500' : 'bg-slate-300'
                              )} />
                              <span className="text-sm font-medium text-slate-900">{kpi.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={kpi.category === 'Cumulative' ? 'info' : 'default'} size="sm">
                              {kpi.category === 'Cumulative' ? 'Cumulative' : 'Non-Cumulative'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={classNames(
                              'text-sm font-semibold',
                              (data?.attainment || 0) >= 100 ? 'text-emerald-600' :
                              (data?.attainment || 0) >= 70 ? 'text-amber-600' : 'text-red-600'
                            )}>
                              {Math.round(data?.attainment || 0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {data?.achieved ? (
                              <Badge variant="success" size="sm" className="gap-1">
                                <CheckCircle className="w-3 h-3" /> Earned
                              </Badge>
                            ) : (
                              <Badge variant="default" size="sm" className="gap-1">
                                <Minus className="w-3 h-3" /> Not Met
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={classNames(
                              'text-sm font-bold',
                              data?.achieved ? 'text-emerald-600' : 'text-slate-400'
                            )}>
                              {data?.achieved ? `₹${data.earned.toLocaleString()}` : '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Configuration Tab */}
        {activeTab === 'configure' && canConfigure && (
          <div className="space-y-6">
            {/* Config Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
              {[
                { id: 'commission', label: 'Commission Rates', icon: <Percent className="w-4 h-4" /> },
                { id: 'slabs', label: 'Slab Bonuses (11 KPIs)', icon: <Award className="w-4 h-4" /> },
                { id: 'composite', label: 'Composite Bonus', icon: <Sparkles className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id as any)}
                  className={classNames(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    configTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Commission Configuration */}
            {configTab === 'commission' && (
              <div className="max-w-2xl space-y-6">
                <Card>
                  <div className="p-5 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 text-lg">Commission Configuration</h3>
                    <p className="text-sm text-slate-500">Set commission rates for Sales and Collection (Layer 1)</p>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Sales Commission */}
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">Sales Commission</h4>
                            <p className="text-xs text-slate-500">% of actual sales value achieved</p>
                          </div>
                        </div>
                        <div className="relative w-32">
                          <input
                            type="number"
                            value={commissionConfig.salesRate}
                            onChange={(e) => setCommissionConfig(prev => ({ ...prev, salesRate: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-4 py-3 pr-10 bg-white border-2 border-emerald-200 rounded-xl text-xl font-bold text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-700 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Commission is always calculated regardless of slab attainment (BR-21)
                      </p>
                    </div>

                    {/* Collection Commission */}
                    <div className="p-5 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-violet-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">Collection Commission</h4>
                            <p className="text-xs text-slate-500">% of actual collection amount</p>
                          </div>
                        </div>
                        <div className="relative w-32">
                          <input
                            type="number"
                            value={commissionConfig.collectionRate}
                            onChange={(e) => setCommissionConfig(prev => ({ ...prev, collectionRate: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-4 py-3 pr-10 bg-white border-2 border-violet-200 rounded-xl text-xl font-bold text-center focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                      </div>
                      <p className="text-xs text-violet-700 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Requires manual entry of Collection actuals before calculation trigger (BR-24)
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800">Approval Required</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Configuration changes require Admin approval before becoming active for the period. (BR-18)
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button variant="secondary">Save as Draft</Button>
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">Submit for Approval</Button>
                </div>
              </div>
            )}

            {/* Slab Bonuses Configuration */}
            {configTab === 'slabs' && (
              <div className="space-y-6">
                {/* KPI Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {KPI_LIST.map((kpi) => (
                    <button
                      key={kpi.id}
                      onClick={() => setSelectedKpiForSlab(kpi.id)}
                      className={classNames(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                        selectedKpiForSlab === kpi.id
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                      )}
                    >
                      {kpi.name}
                      <Badge variant={kpi.category === 'Cumulative' ? 'info' : 'default'} size="sm">
                        {kpi.category === 'Cumulative' ? 'Cum' : 'Non-Cum'}
                      </Badge>
                    </button>
                  ))}
                </div>

                {/* Slab Editor */}
                {selectedKpi && (
                  <Card className="!p-0 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg">{selectedKpi.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={selectedKpi.category === 'Cumulative' ? 'info' : 'default'}>
                                {selectedKpi.category === 'Cumulative' ? 'Cumulative' : 'Non-Cumulative'}
                              </Badge>
                              <span className="text-xs text-slate-500">Trigger: {selectedKpi.trigger}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Info className="w-4 h-4" />
                          {selectedKpi.category === 'Cumulative' 
                            ? 'Bonus sums up: hitting a higher slab earns all lower slabs too'
                            : 'Bonus is standalone: hitting a slab earns only that slab\'s amount'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-3 px-3 text-xs font-semibold text-slate-500 uppercase">
                          <div className="col-span-1">#</div>
                          <div className="col-span-3">From</div>
                          <div className="col-span-3">To</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Amount</div>
                          <div className="col-span-1"></div>
                        </div>

                        {/* Slab Rows */}
                        {selectedKpiSlabs.map((slab, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 rounded-xl">
                            <div className="col-span-1 text-sm font-semibold text-slate-400">{index + 1}</div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={slab.from}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setSlabConfigs(prev => ({
                                    ...prev,
                                    [selectedKpiForSlab]: prev[selectedKpiForSlab].map((s, i) => i === index ? { ...s, from: value } : s)
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={slab.to}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setSlabConfigs(prev => ({
                                    ...prev,
                                    [selectedKpiForSlab]: prev[selectedKpiForSlab].map((s, i) => i === index ? { ...s, to: value } : s)
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                              />
                            </div>
                            <div className="col-span-2">
                              <select
                                value={slab.bonusType}
                                onChange={(e) => {
                                  setSlabConfigs(prev => ({
                                    ...prev,
                                    [selectedKpiForSlab]: prev[selectedKpiForSlab].map((s, i) => i === index ? { ...s, bonusType: e.target.value as 'fixed' | 'percentage' } : s)
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                              >
                                <option value="fixed">Fixed ₹</option>
                                <option value="percentage">% CTC</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <div className="relative">
                                {slab.bonusType === 'percentage' && (
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                                )}
                                <input
                                  type="number"
                                  value={slab.amount}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    setSlabConfigs(prev => ({
                                      ...prev,
                                      [selectedKpiForSlab]: prev[selectedKpiForSlab].map((s, i) => i === index ? { ...s, amount: value } : s)
                                    }));
                                  }}
                                  className={classNames(
                                    'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none',
                                    slab.bonusType === 'percentage' && 'pl-8'
                                  )}
                                />
                              </div>
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <button
                                onClick={() => {
                                  setSlabConfigs(prev => ({
                                    ...prev,
                                    [selectedKpiForSlab]: prev[selectedKpiForSlab].filter((_, i) => i !== index)
                                  }));
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Slab Button */}
                        <button
                          onClick={() => {
                            const slabs = slabConfigs[selectedKpiForSlab] || [];
                            const lastSlab = slabs[slabs.length - 1] || { from: 0, to: 50 };
                            setSlabConfigs(prev => ({
                              ...prev,
                              [selectedKpiForSlab]: [...(prev[selectedKpiForSlab] || []), { from: lastSlab.to, to: lastSlab.to + 25, bonusType: 'fixed', amount: 500 }]
                            }));
                          }}
                          disabled={selectedKpiSlabs.length >= 8}
                          className="w-full p-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + Add Slab (max 8, min 2 required)
                        </button>
                      </div>

                      {/* Validation */}
                      {(() => {
                        const validation = validateSlabs(selectedKpiSlabs);
                        return validation.valid ? (
                          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Slabs are valid and contiguous
                          </div>
                        ) : (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {validation.error}
                          </div>
                        );
                      })()}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Composite Bonus Configuration */}
            {configTab === 'composite' && (
              <div className="max-w-2xl">
                <Card className={classNames(
                  'overflow-hidden',
                  incentiveData.compositeEarned ? 'ring-2 ring-emerald-500' : ''
                )}>
                  <div className={classNames(
                    'h-2',
                    incentiveData.compositeEarned
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                      : 'bg-gradient-to-r from-slate-400 to-slate-500'
                  )} />
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={classNames(
                        'w-14 h-14 rounded-xl flex items-center justify-center',
                        incentiveData.compositeEarned ? 'bg-emerald-100' : 'bg-slate-100'
                      )}>
                        {incentiveData.compositeEarned ? (
                          <Sparkles className="w-7 h-7 text-emerald-600" />
                        ) : (
                          <Lock className="w-7 h-7 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xl">Composite Bonus</h3>
                        <p className="text-sm text-slate-500">All-or-nothing bonus (Layer 3)</p>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl mb-6">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Bonus Amount (Fixed Currency)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                        <input
                          type="number"
                          value={compositeBonusAmount}
                          onChange={(e) => setCompositeBonusAmount(parseInt(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-4 bg-white border-2 border-amber-200 rounded-xl text-2xl font-bold focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-slate-400" />
                        How it works (BR-23)
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          Composite bonus is <strong>all-or-nothing</strong>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          Requires every KPI slab bonus to be earned
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          All 11 KPIs must have bonus amount {'>'} 0
                        </li>
                        <li className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          Missing even one KPI locks the entire composite bonus
                        </li>
                      </ul>
                    </div>

                    {/* Status Preview */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm font-medium text-slate-700 mb-2">Current Status for {selectedExecutive?.firstName} {selectedExecutive?.lastName}:</p>
                      {incentiveData.compositeEarned ? (
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Unlocked! Will receive ₹{compositeBonusAmount.toLocaleString()}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Lock className="w-5 h-5" />
                          <span className="font-semibold">Locked - Missing {incentiveData.missingKpis.length} KPIs</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Team Summary Tab */}
        {activeTab === 'team' && canConfigure && (
          <>
            {/* Team Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white !border-0">
                <p className="text-sm text-indigo-100">Team Total Incentive</p>
                <p className="text-3xl font-bold mt-1">₹{summaryStats.total.toLocaleString()}</p>
                <p className="text-xs text-indigo-200 mt-1">{summaryStats.count} executives</p>
              </Card>
              <Card className="!p-4">
                <p className="text-sm text-slate-500">Pending Approval</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{summaryStats.pending}</p>
              </Card>
              <Card className="!p-4">
                <p className="text-sm text-slate-500">Approved</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{summaryStats.approved}</p>
              </Card>
            </div>

            {/* Team Table */}
            <Card className="!p-0 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Team Incentive Summary</h3>
                  <p className="text-xs text-slate-500">{selectedPeriod}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-48 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <Button variant="secondary" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Executive</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Sales Comm.</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Collection Comm.</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Slab Bonuses</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Composite</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamIncentiveData.map((payout) => (
                      <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                              {payout.executiveName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{payout.executiveName}</p>
                              <p className="text-xs text-slate-500">{payout.teamName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">₹{payout.salesCommission.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">₹{payout.collectionCommission.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">₹{payout.slabBonuses.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          {payout.compositeBonus > 0 ? (
                            <span className="text-sm font-bold text-emerald-600">₹{payout.compositeBonus.toLocaleString()}</span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">₹{payout.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={payout.status === 'approved' ? 'success' : payout.status === 'pending' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {payout.status === 'approved' ? 'Approved' : payout.status === 'pending' ? 'Pending' : payout.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Approvals Tab (Admin) */}
        {activeTab === 'approvals' && isAdmin && (
          <div className="space-y-4">
            {/* Pending Banner */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-amber-800 text-lg">{summaryStats.pending} Payouts Pending</p>
                  <p className="text-sm text-amber-600">Review and approve or reject before export</p>
                </div>
              </div>
              <Button variant="secondary" className="border-amber-300 hover:bg-amber-100">
                <CheckCircle className="w-4 h-4 mr-2" />
                Bulk Approve
              </Button>
            </div>

            {/* Payout Cards */}
            {teamIncentiveData.filter(e => e.status === 'pending').map((payout) => (
              <Card key={payout.id} className="!p-0 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
                      {payout.executiveName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{payout.executiveName}</h3>
                      <p className="text-sm text-slate-500">{payout.teamName} • {payout.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-indigo-600">₹{payout.total.toLocaleString()}</p>
                    <Badge variant="warning" size="sm">Pending Approval</Badge>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-4 gap-4 mb-5">
                    <div className="text-center p-3 bg-emerald-50 rounded-xl">
                      <p className="text-xs text-emerald-600 font-medium">Sales Comm.</p>
                      <p className="text-lg font-bold text-emerald-700">₹{payout.salesCommission.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-violet-50 rounded-xl">
                      <p className="text-xs text-violet-600 font-medium">Collection Comm.</p>
                      <p className="text-lg font-bold text-violet-700">₹{payout.collectionCommission.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-xl">
                      <p className="text-xs text-amber-600 font-medium">Slab Bonuses</p>
                      <p className="text-lg font-bold text-amber-700">₹{payout.slabBonuses.toLocaleString()}</p>
                    </div>
                    <div className={classNames(
                      'text-center p-3 rounded-xl',
                      payout.compositeBonus > 0 ? 'bg-emerald-50' : 'bg-slate-50'
                    )}>
                      <p className={classNames(
                        'text-xs font-medium',
                        payout.compositeBonus > 0 ? 'text-emerald-600' : 'text-slate-500'
                      )}>Composite</p>
                      <p className={classNames(
                        'text-lg font-bold',
                        payout.compositeBonus > 0 ? 'text-emerald-700' : 'text-slate-400'
                      )}>
                        {payout.compositeBonus > 0 ? `₹${payout.compositeBonus.toLocaleString()}` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>Calculated: {payout.calculatedAt || 'Apr 1, 2026'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => { setSelectedPayout(payout); setShowRejectModal(true); }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        onClick={() => handleApprove(payout)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {summaryStats.pending === 0 && (
              <Card className="text-center py-16">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">All Payouts Approved!</h3>
                <p className="text-slate-500 mt-2">No pending payouts to review</p>
              </Card>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <Card className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Incentive History</h3>
            <p className="text-slate-500 mt-2">View past periods and exported records</p>
            <Button variant="secondary" className="mt-4">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full History
            </Button>
          </Card>
        )}
      </div>

      {/* Cannot Calculate Modal */}
      {showCalcModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Cannot Trigger Calculation</h3>
              <p className="text-slate-500 mt-3">
                Collection actuals are pending for some executives. Complete all manual entries before triggering calculation.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
              <Button onClick={() => setShowCalcModal(false)}>Understood</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Calculation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Confirm Incentive Calculation</h3>
              <p className="text-slate-500 mt-3">
                Actuals will be locked. This action cannot be undone. Continue?
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600" onClick={confirmCalculation}>
                <Lock className="w-4 h-4 mr-2" />
                Yes, Lock & Calculate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Reject Payout</h3>
              <p className="text-sm text-slate-500">{selectedPayout?.executiveName}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this payout is being rejected..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">{rejectReason.length}/500 characters</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setShowRejectModal(false); setSelectedPayout(null); setRejectReason(''); }}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
