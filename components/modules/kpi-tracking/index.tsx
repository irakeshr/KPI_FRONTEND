'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTargetStore, useKpiStore, useAuthStore, Role } from '@/store';
import { KPI_CATALOG } from '@/lib/constants';
import { Card, Button, Badge } from '@/components/ui';
import { formatAttainment, calculateAttainment, classNames } from '@/lib/utils';
import { 
  Activity, TrendingUp, CheckCircle, Clock, AlertTriangle,
  DollarSign, Target, Calendar, Wifi, WifiOff, RefreshCw, ChevronDown,
  ArrowUpRight, ArrowDownRight, Minus, Info, Lock, BarChart3, Zap, Award,
  Users, Search, ChevronRight, Building2, UserCheck, X, Filter, List, Grid3X3
} from 'lucide-react';

type Granularity = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type KpiCategory = 'Revenue' | 'Quality' | 'Activity' | 'Output';

interface Executive {
  id: string;
  firstName: string;
  lastName: string;
  team: string;
  teamId: string;
  franchiseeId: string;
  franchiseeName: string;
  avgAttainment: number;
  status: 'active' | 'inactive';
}

const ALL_EXECUTIVES: Executive[] = [
  { id: 'exec-1', firstName: 'Rahul', lastName: 'Sharma', team: 'Sales Team A', teamId: 'team-1', franchiseeId: 'fran-1', franchiseeName: 'North Region', avgAttainment: 92, status: 'active' },
  { id: 'exec-2', firstName: 'Priya', lastName: 'Patel', team: 'Sales Team A', teamId: 'team-1', franchiseeId: 'fran-1', franchiseeName: 'North Region', avgAttainment: 87, status: 'active' },
  { id: 'exec-3', firstName: 'Amit', lastName: 'Kumar', team: 'Sales Team B', teamId: 'team-2', franchiseeId: 'fran-1', franchiseeName: 'North Region', avgAttainment: 78, status: 'active' },
  { id: 'exec-4', firstName: 'Sneha', lastName: 'Reddy', team: 'Sales Team B', teamId: 'team-2', franchiseeId: 'fran-2', franchiseeName: 'South Region', avgAttainment: 95, status: 'active' },
  { id: 'exec-5', firstName: 'Vikram', lastName: 'Singh', team: 'Sales Team C', teamId: 'team-3', franchiseeId: 'fran-2', franchiseeName: 'South Region', avgAttainment: 71, status: 'active' },
  { id: 'exec-6', firstName: 'Anjali', lastName: 'Mehta', team: 'Sales Team C', teamId: 'team-3', franchiseeId: 'fran-3', franchiseeName: 'East Region', avgAttainment: 85, status: 'inactive' },
  { id: 'exec-7', firstName: 'Raj', lastName: 'Kumar', team: 'Sales Team D', teamId: 'team-4', franchiseeId: 'fran-3', franchiseeName: 'East Region', avgAttainment: 88, status: 'active' },
  { id: 'exec-8', firstName: 'Meera', lastName: 'Shah', team: 'Sales Team D', teamId: 'team-4', franchiseeId: 'fran-3', franchiseeName: 'East Region', avgAttainment: 76, status: 'active' },
];

const MANAGER_TEAMS: Record<string, string[]> = {
  'manager-1': ['team-1', 'team-2'],
  'manager-2': ['team-3', 'team-4'],
};

const getExecutivesForRole = (role: Role, userId: string): Executive[] => {
  if (role === 'Admin') {
    return ALL_EXECUTIVES.filter(e => e.status === 'active');
  }
  if (role === 'Manager') {
    const managerTeamIds = MANAGER_TEAMS[userId] || ['team-1', 'team-2'];
    return ALL_EXECUTIVES.filter(e => 
      e.status === 'active' && managerTeamIds.includes(e.teamId)
    );
  }
  return ALL_EXECUTIVES.filter(e => e.id === userId);
};

const GRANULARITY_OPTIONS: { value: Granularity; label: string; shortLabel: string }[] = [
  { value: 'daily', label: 'Daily', shortLabel: 'D' },
  { value: 'weekly', label: 'Weekly', shortLabel: 'W' },
  { value: 'monthly', label: 'Monthly', shortLabel: 'M' },
  { value: 'quarterly', label: 'Quarterly', shortLabel: 'Q' },
  { value: 'yearly', label: 'Yearly', shortLabel: 'Y' },
];

const KPI_CATEGORIES: { id: KpiCategory | 'all'; label: string; color: string; activeBg: string }[] = [
  { id: 'all', label: 'All', color: 'text-slate-600', activeBg: 'bg-slate-900 text-white' },
  { id: 'Revenue', label: 'Revenue', color: 'text-emerald-600', activeBg: 'bg-emerald-100 text-emerald-700' },
  { id: 'Quality', label: 'Quality', color: 'text-violet-600', activeBg: 'bg-violet-100 text-violet-700' },
  { id: 'Activity', label: 'Activity', color: 'text-blue-600', activeBg: 'bg-blue-100 text-blue-700' },
  { id: 'Output', label: 'Output', color: 'text-amber-600', activeBg: 'bg-amber-100 text-amber-700' },
];

interface KpiTrackingPageProps {
  role: Role;
  userId: string;
}

export function KpiTrackingPage({ role, userId }: KpiTrackingPageProps) {
  const { targets, getCurrentPeriod } = useTargetStore();
  const { manualEntries, addManualEntry, getPendingEntries } = useKpiStore();
  
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string>('exec-1');
  const [granularity, setGranularity] = useState<Granularity>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-04');
  const [activeCategory, setActiveCategory] = useState<KpiCategory | 'all'>('all');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionAmount, setCollectionAmount] = useState('');
  const [collectionSource, setCollectionSource] = useState('');
  const [collectionNote, setCollectionNote] = useState('');
  const [collectionErrors, setCollectionErrors] = useState<Record<string, string>>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [realtimeActuals, setRealtimeActuals] = useState<Record<string, number>>({});
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showExecutiveDrawer, setShowExecutiveDrawer] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentPeriod = getCurrentPeriod();
  const pendingEntries = getPendingEntries();
  const isManager = role === 'Manager' || role === 'Admin';
  const isExecutive = role === 'Executive';

  const availableExecutives = useMemo(() => {
    return getExecutivesForRole(role, userId);
  }, [role, userId]);

  const selectedExecutive = ALL_EXECUTIVES.find(e => e.id === selectedExecutiveId);

  const executiveTargets = useMemo(() => {
    if (!currentPeriod) return [];
    return targets.filter(t => t.executiveId === selectedExecutiveId);
  }, [targets, selectedExecutiveId, currentPeriod]);

  const collectionEntry = useMemo(() => {
    return manualEntries.find(e => 
      e.executiveId === selectedExecutiveId && 
      e.status === 'confirmed'
    );
  }, [manualEntries, selectedExecutiveId]);

  const hasCollectionPending = useMemo(() => {
    return !collectionEntry && isManager;
  }, [collectionEntry, isManager]);

  const filteredExecutives = useMemo(() => {
    if (!searchQuery) return availableExecutives;
    const query = searchQuery.toLowerCase();
    return availableExecutives.filter(exec => {
      const fullName = `${exec.firstName} ${exec.lastName}`.toLowerCase();
      return fullName.includes(query) || 
             exec.team.toLowerCase().includes(query) ||
             exec.franchiseeName.toLowerCase().includes(query);
    });
  }, [availableExecutives, searchQuery]);

  const filteredStats = useMemo(() => {
    const active = filteredExecutives.filter(e => e.avgAttainment >= 90).length;
    const near = filteredExecutives.filter(e => e.avgAttainment >= 70 && e.avgAttainment < 90).length;
    const below = filteredExecutives.filter(e => e.avgAttainment < 70).length;
    return { total: filteredExecutives.length, active, near, below };
  }, [filteredExecutives]);

  const summaryStats = useMemo(() => {
    let totalAttainment = 0;
    let count = 0;
    let greenCount = 0;
    let amberCount = 0;
    let redCount = 0;

    executiveTargets.forEach(t => {
      const actualValue = realtimeActuals[t.kpiId] ?? 0;
      const attainment = calculateAttainment(actualValue, t.targetValue);
      totalAttainment += attainment;
      count++;

      if (attainment >= 100) greenCount++;
      else if (attainment >= 70) amberCount++;
      else redCount++;
    });

    return {
      totalKpis: executiveTargets.length,
      greenCount,
      amberCount,
      redCount,
      avgAttainment: count > 0 ? totalAttainment / count : 0,
    };
  }, [executiveTargets, realtimeActuals]);

  const filteredKpis = useMemo(() => {
    if (activeCategory === 'all') return executiveTargets;
    return executiveTargets.filter(t => {
      const kpi = KPI_CATALOG.find(k => k.id === t.kpiId);
      return kpi?.type === activeCategory;
    });
  }, [executiveTargets, activeCategory]);

  const completionTatTarget = executiveTargets.find(t => t.kpiId === 'kpi-13');
  const completionTatActual = useMemo(() => 3.4, []);

  const getTrafficLight = useCallback((attainment: number) => {
    if (attainment >= 100) return { color: 'emerald', label: 'On Track' };
    if (attainment >= 70) return { color: 'amber', label: 'Near Target' };
    return { color: 'red', label: 'Below Target' };
  }, []);

  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      setRealtimeActuals(prev => {
        const newActuals = { ...prev };
        const randomKpiId = executiveTargets[Math.floor(Math.random() * executiveTargets.length)]?.kpiId;
        if (randomKpiId && Math.random() > 0.5) {
          const currentActual = newActuals[randomKpiId] ?? 0;
          newActuals[randomKpiId] = currentActual + Math.floor(Math.random() * 10) + 1;
        }
        return newActuals;
      });
      setLastUpdate(new Date());
    }, 5000);

    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
  }, [executiveTargets]);

  const handleSaveCollection = () => {
    const errors: Record<string, string> = {};
    if (!collectionAmount || parseFloat(collectionAmount) <= 0) errors.amount = 'Valid amount required';
    if (!collectionSource) errors.source = 'Source required';
    if (!collectionNote.trim()) errors.note = 'Reference mandatory for audit';

    if (Object.keys(errors).length > 0) {
      setCollectionErrors(errors);
      return;
    }

    addManualEntry({
      executiveId: selectedExecutiveId,
      executiveName: `${selectedExecutive?.firstName} ${selectedExecutive?.lastName}`,
      amount: parseFloat(collectionAmount),
      source: collectionSource,
      reference: collectionNote,
      date: new Date().toISOString(),
      status: 'confirmed',
    });

    setShowCollectionModal(false);
    setCollectionAmount('');
    setCollectionSource('');
    setCollectionNote('');
    setCollectionErrors({});
  };

  const isTatBreached = completionTatTarget && completionTatActual > (completionTatTarget.ceiling || 0);
  const tatAttainment = completionTatTarget ? calculateAttainment(completionTatTarget.benchmark || 0, completionTatActual) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">KPI Tracking</h1>
                <p className="text-xs text-slate-500">
                  {isExecutive 
                    ? 'Your Performance Dashboard' 
                    : `${selectedExecutive?.firstName} ${selectedExecutive?.lastName} • ${selectedExecutive?.team}`
                  }
                </p>
              </div>
            </div>

            {/* Center: Executive Selector (Manager/Admin only) */}
            {role !== 'Executive' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExecutiveDrawer(!showExecutiveDrawer)}
                  className="flex items-center gap-3 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <div className={classNames(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold',
                    selectedExecutive && selectedExecutive.avgAttainment >= 90 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                    selectedExecutive && selectedExecutive.avgAttainment >= 70 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                    'bg-gradient-to-br from-slate-400 to-slate-500'
                  )}>
                    {selectedExecutive?.firstName?.[0]}{selectedExecutive?.lastName?.[0]}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedExecutive?.firstName} {selectedExecutive?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{filteredStats.total} members</p>
                  </div>
                  <ChevronDown className={classNames('w-4 h-4 text-slate-400 transition-transform', showExecutiveDrawer && 'rotate-180')} />
                </button>

                {/* Quick Stats Pills */}
                <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-xs font-medium text-slate-600">{filteredStats.active}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200 mx-1" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-xs font-medium text-slate-600">{filteredStats.near}</span>
                  </div>
                  <div className="w-px h-3 bg-slate-200 mx-1" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs font-medium text-slate-600">{filteredStats.below}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={classNames(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
                connectionStatus === 'connected' ? 'bg-emerald-50 text-emerald-700' :
                connectionStatus === 'reconnecting' ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              )}>
                {connectionStatus === 'connected' ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <Wifi className="w-3 h-3" />
                  </>
                ) : connectionStatus === 'reconnecting' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
              </div>

              {isManager && (
                <Button onClick={() => setShowCollectionModal(true)} size="sm" className="gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Collection</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Drawer */}
      {showExecutiveDrawer && role !== 'Executive' && (
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, team, or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Executive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filteredExecutives.map((exec) => (
                <button
                  key={exec.id}
                  onClick={() => {
                    setSelectedExecutiveId(exec.id);
                    setShowExecutiveDrawer(false);
                  }}
                  className={classNames(
                    'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                    selectedExecutiveId === exec.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <div className={classNames(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-semibold flex-shrink-0',
                    exec.avgAttainment >= 90 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                    exec.avgAttainment >= 70 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                    'bg-gradient-to-br from-red-500 to-red-600'
                  )}>
                    {exec.firstName[0]}{exec.lastName[0]}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {exec.firstName} {exec.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{exec.team}</p>
                    <p className={classNames(
                      'text-xs font-semibold',
                      exec.avgAttainment >= 90 ? 'text-emerald-600' :
                      exec.avgAttainment >= 70 ? 'text-amber-600' :
                      'text-red-600'
                    )}>
                      {exec.avgAttainment}%
                    </p>
                  </div>
                  {selectedExecutiveId === exec.id && (
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {filteredExecutives.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No executives found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Filter & Controls Bar */}
        <Card className="!p-0">
          <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            {/* Grain Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Period:</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {GRANULARITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGranularity(opt.value)}
                    className={classNames(
                      'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                      granularity === opt.value
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    {opt.shortLabel}
                  </button>
                ))}
              </div>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {KPI_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as KpiCategory | 'all')}
                  className={classNames(
                    'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap',
                    activeCategory === cat.id ? cat.activeBg : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Collection Pending Warning */}
        {hasCollectionPending && (
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-amber-800">Collection actuals pending for this period</p>
            </div>
            <Button 
              size="sm"
              variant="secondary" 
              onClick={() => setShowCollectionModal(true)}
              className="border-amber-300"
            >
              Enter Now
            </Button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white !border-0">
            <p className="text-xs text-indigo-100">Avg Attainment</p>
            <p className="text-2xl font-bold mt-1">{formatAttainment(summaryStats.avgAttainment)}</p>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">On Track</p>
                <p className="text-2xl font-bold text-emerald-600">{summaryStats.greenCount}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Near Target</p>
                <p className="text-2xl font-bold text-amber-600">{summaryStats.amberCount}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Below Target</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.redCount}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* KPI Cards Grid */}
        {filteredKpis.length === 0 ? (
          <Card className="text-center py-12">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No KPIs found</p>
            <p className="text-sm text-slate-400 mt-1">Targets not set for this period</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredKpis.map((target) => {
              const kpi = KPI_CATALOG.find(k => k.id === target.kpiId);
              if (!kpi) return null;

              const actualValue = realtimeActuals[target.kpiId] ?? 0;
              const attainment = calculateAttainment(actualValue, target.targetValue);
              const cappedAttainment = Math.min(attainment, 150);
              const trafficLight = getTrafficLight(attainment);

              return (
                <Card key={target.id} className={classNames(
                  '!p-0 overflow-hidden',
                  attainment >= 100 ? 'ring-2 ring-emerald-200' :
                  attainment >= 70 ? 'ring-2 ring-amber-200' :
                  'ring-2 ring-red-200'
                )}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{kpi.name}</h3>
                        <p className="text-xs text-slate-500">{kpi.unit}</p>
                      </div>
                      <div className={classNames(
                        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                        trafficLight.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                        trafficLight.color === 'amber' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      )}>
                        <div className={classNames(
                          'w-2 h-2 rounded-full',
                          trafficLight.color === 'emerald' ? 'bg-emerald-500' :
                          trafficLight.color === 'amber' ? 'bg-amber-500' :
                          'bg-red-500'
                        )} />
                        {trafficLight.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-500">Target</p>
                        <p className="text-lg font-bold text-slate-900">{target.targetValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Actual</p>
                        <p className="text-lg font-bold text-slate-900">{actualValue.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Attainment</span>
                        <span className={classNames(
                          'font-bold',
                          attainment >= 100 ? 'text-emerald-600' :
                          attainment >= 70 ? 'text-amber-600' :
                          'text-red-600'
                        )}>
                          {formatAttainment(cappedAttainment)}
                          {attainment > 150 && <span className="text-xs text-slate-400 ml-1">(capped)</span>}
                        </span>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={classNames(
                            'absolute inset-y-0 left-0 rounded-full transition-all',
                            attainment >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                            attainment >= 70 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                            'bg-gradient-to-r from-red-400 to-red-500'
                          )}
                          style={{ width: `${Math.min((cappedAttainment / 150) * 100, 100)}%` }}
                        />
                        <div className="absolute top-0 bottom-0 w-0.5 bg-slate-300" style={{ left: '66.67%' }} />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Completion TAT Card */}
        {completionTatTarget && (
          <Card className="!p-0 overflow-hidden border-2 border-red-200">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">Completion TAT</h3>
                  <p className="text-xs text-red-100">Turnaround Time Performance</p>
                </div>
              </div>
              {isTatBreached && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white text-red-600 rounded-lg text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  Ceiling Breached
                </div>
              )}
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-slate-500">Benchmark</p>
                <p className="text-xl font-bold text-emerald-600">{completionTatTarget.benchmark || 0} days</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-slate-500">Ceiling</p>
                <p className="text-xl font-bold text-red-600">{completionTatTarget.ceiling || 0} days</p>
              </div>
              <div className={classNames(
                'text-center p-3 rounded-lg',
                isTatBreached ? 'bg-red-50' : 'bg-slate-50'
              )}>
                <p className="text-xs text-slate-500">Actual TAT</p>
                <p className={classNames(
                  'text-xl font-bold',
                  isTatBreached ? 'text-red-600' : 'text-slate-900'
                )}>
                  {completionTatActual.toFixed(1)} days
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Attainment</p>
                <p className={classNames(
                  'text-xl font-bold',
                  tatAttainment >= 100 ? 'text-emerald-600' :
                  tatAttainment >= 70 ? 'text-amber-600' :
                  'text-red-600'
                )}>
                  {formatAttainment(tatAttainment)}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Collection Entry Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Manual Collection Entry</h3>
                  <p className="text-sm text-slate-500">{selectedPeriod}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700">Entry is immutable once saved</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={collectionAmount}
                    onChange={(e) => setCollectionAmount(e.target.value)}
                    className={classNames(
                      'w-full pl-8 pr-4 py-2.5 border-2 rounded-xl outline-none',
                      collectionErrors.amount ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500'
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Source <span className="text-red-500">*</span>
                </label>
                <select
                  value={collectionSource}
                  onChange={(e) => setCollectionSource(e.target.value)}
                  className={classNames(
                    'w-full px-4 py-2.5 border-2 rounded-xl outline-none appearance-none bg-white',
                    collectionErrors.source ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500'
                  )}
                >
                  <option value="">Select source</option>
                  <option value="neft">NEFT Transfer</option>
                  <option value="rtgs">RTGS Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Reference <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Transaction ID, cheque number, etc."
                  value={collectionNote}
                  onChange={(e) => setCollectionNote(e.target.value)}
                  rows={2}
                  className={classNames(
                    'w-full px-4 py-2.5 border-2 rounded-xl outline-none resize-none',
                    collectionErrors.note ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-500'
                  )}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCollectionModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCollection}>
                <Lock className="w-4 h-4 mr-2" />
                Save & Lock
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
