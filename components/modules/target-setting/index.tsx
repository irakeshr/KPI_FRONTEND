'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTargetStore, useAuthStore, Role } from '@/store';
import { KPI_CATALOG } from '@/lib/constants';
import { Card, Button, Badge } from '@/components/ui';
import { 
  Target, Calendar, Users, CheckCircle, Clock, AlertTriangle,
  ChevronRight, ChevronDown, Info, Search, History, Save,
  ArrowRight, Zap, TrendingUp, Award, Sparkles
} from 'lucide-react';
import { classNames } from '@/lib/utils';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type KpiCategory = 'Revenue' | 'Quality' | 'Activity' | 'Output';
type WizardStep = 'period' | 'executive' | 'kpis' | 'review';

interface Executive {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  teamId: string;
  teamName: string;
  franchiseeId: string;
  franchiseeName: string;
  avatar: string | null;
  status: 'active' | 'inactive';
  avgAttainment?: number;
}

interface KpiTarget {
  selected: boolean;
  target?: number;
  benchmark?: number;
  ceiling?: number;
}

interface TargetData {
  [kpiId: string]: KpiTarget;
}

const PERIOD_TYPES: { value: PeriodType; label: string; requiresApproval: boolean; description: string }[] = [
  { value: 'daily', label: 'Daily', requiresApproval: false, description: 'Activates immediately' },
  { value: 'weekly', label: 'Weekly', requiresApproval: false, description: 'Activates immediately' },
  { value: 'monthly', label: 'Monthly', requiresApproval: false, description: 'Activates immediately' },
  { value: 'quarterly', label: 'Quarterly', requiresApproval: true, description: 'Requires Admin approval' },
  { value: 'yearly', label: 'Yearly', requiresApproval: true, description: 'Requires Admin approval' },
];

const KPI_CATEGORIES: { id: KpiCategory; label: string; color: string; bgColor: string; icon: React.ReactNode }[] = [
  { id: 'Revenue', label: 'Revenue', color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'Quality', label: 'Quality', color: 'text-violet-600', bgColor: 'bg-violet-50 border-violet-200', icon: <Award className="w-4 h-4" /> },
  { id: 'Activity', label: 'Activity', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: <Zap className="w-4 h-4" /> },
  { id: 'Output', label: 'Output', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200', icon: <Target className="w-4 h-4" /> },
];

const MOCK_EXECUTIVES: Executive[] = [
  { id: 'exec-1', firstName: 'Rahul', lastName: 'Sharma', role: 'Executive', teamId: 'team-1', teamName: 'Sales Team A', franchiseeId: 'fran-1', franchiseeName: 'North Region', avatar: null, status: 'active', avgAttainment: 92 },
  { id: 'exec-2', firstName: 'Priya', lastName: 'Patel', role: 'Executive', teamId: 'team-1', teamName: 'Sales Team A', franchiseeId: 'fran-1', franchiseeName: 'North Region', avatar: null, status: 'active', avgAttainment: 87 },
  { id: 'exec-3', firstName: 'Amit', lastName: 'Kumar', role: 'Executive', teamId: 'team-2', teamName: 'Sales Team B', franchiseeId: 'fran-1', franchiseeName: 'North Region', avatar: null, status: 'active', avgAttainment: 78 },
  { id: 'exec-4', firstName: 'Sneha', lastName: 'Reddy', role: 'Executive', teamId: 'team-2', teamName: 'Sales Team B', franchiseeId: 'fran-2', franchiseeName: 'South Region', avatar: null, status: 'active', avgAttainment: 95 },
  { id: 'exec-5', firstName: 'Vikram', lastName: 'Singh', role: 'Executive', teamId: 'team-3', teamName: 'Sales Team C', franchiseeId: 'fran-2', franchiseeName: 'South Region', avatar: null, status: 'active', avgAttainment: 71 },
  { id: 'exec-6', firstName: 'Anjali', lastName: 'Mehta', role: 'Executive', teamId: 'team-3', teamName: 'Sales Team C', franchiseeId: 'fran-3', franchiseeName: 'East Region', avatar: null, status: 'inactive', avgAttainment: 85 },
];

interface TargetSettingPageProps {
  role: Role;
  userId: string;
}

export function TargetSettingPage({ role, userId }: TargetSettingPageProps) {
  const { addTarget } = useTargetStore();
  const isAdmin = role === 'Admin';
  const isManager = role === 'Manager';

  const [wizardStep, setWizardStep] = useState<WizardStep>('period');
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<KpiCategory>('Revenue');
  const [kpiTargets, setKpiTargets] = useState<TargetData>({});
  const [isOverridden, setIsOverridden] = useState(false);
  const [overrideValue, setOverrideValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);

  const periodInfo = PERIOD_TYPES.find(p => p.value === periodType);
  const requiresApproval = periodInfo?.requiresApproval || false;
  const selectedExecutive = MOCK_EXECUTIVES.find(e => e.id === selectedExecutiveId);

  const availablePeriods = useMemo(() => {
    const now = new Date();
    const periods = [];
    if (periodType === 'monthly') {
      for (let i = -1; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        periods.push({
          value: date.toISOString().slice(0, 7),
          label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
      }
    } else if (periodType === 'quarterly') {
      for (let i = 0; i < 4; i++) {
        const quarter = Math.floor((now.getMonth() + i * 3) / 3);
        const year = now.getFullYear() + Math.floor((now.getMonth() + i * 3) / 12);
        periods.push({
          value: `Q${quarter} ${year}`,
          label: `Q${quarter} ${year}`,
        });
      }
    }
    return periods;
  }, [periodType]);

  const filteredExecutives = useMemo(() => {
    let filtered = MOCK_EXECUTIVES.filter(e => e.status === 'active');
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exec => 
        exec.firstName.toLowerCase().includes(term) || 
        exec.lastName.toLowerCase().includes(term) ||
        exec.teamName.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [searchTerm]);

  const kpisByCategory = useMemo(() => {
    return KPI_CATALOG.filter(kpi => kpi.type === activeCategory);
  }, [activeCategory]);

  const selectedKpisCount = useMemo(() => {
    return Object.values(kpiTargets).filter(t => t.selected).length;
  }, [kpiTargets]);

  const autoSumValue = useMemo(() => {
    let sum = 0;
    Object.values(kpiTargets).forEach(t => {
      if (t.selected && t.target && !isNaN(t.target)) {
        sum += t.target;
      }
    });
    return sum;
  }, [kpiTargets]);

  const completionPercentage = useMemo(() => {
    const steps: WizardStep[] = ['period', 'executive', 'kpis', 'review'];
    const currentIndex = steps.indexOf(wizardStep);
    return ((currentIndex + 1) / steps.length) * 100;
  }, [wizardStep]);

  const canProceed = useCallback(() => {
    switch (wizardStep) {
      case 'period':
        return periodType && selectedPeriod;
      case 'executive':
        return selectedExecutiveId;
      case 'kpis':
        return selectedKpisCount > 0 && Object.values(kpiTargets).filter(t => t.selected && t.target).length === selectedKpisCount;
      case 'review':
        return true;
      default:
        return false;
    }
  }, [wizardStep, periodType, selectedPeriod, selectedExecutiveId, selectedKpisCount, kpiTargets]);

  const handleNext = useCallback(() => {
    const steps: WizardStep[] = ['period', 'executive', 'kpis', 'review'];
    const currentIndex = steps.indexOf(wizardStep);
    if (currentIndex < steps.length - 1) {
      setWizardStep(steps[currentIndex + 1]);
    }
  }, [wizardStep]);

  const handleBack = useCallback(() => {
    const steps: WizardStep[] = ['period', 'executive', 'kpis', 'review'];
    const currentIndex = steps.indexOf(wizardStep);
    if (currentIndex > 0) {
      setWizardStep(steps[currentIndex - 1]);
    }
  }, [wizardStep]);

  const handleKpiSelect = useCallback((kpiId: string, selected: boolean) => {
    setKpiTargets(prev => ({
      ...prev,
      [kpiId]: {
        ...prev[kpiId],
        selected,
        target: selected ? prev[kpiId]?.target : undefined,
        benchmark: selected ? prev[kpiId]?.benchmark : undefined,
        ceiling: selected ? prev[kpiId]?.ceiling : undefined,
      }
    }));
    setAutoSaveIndicator(true);
    setTimeout(() => setAutoSaveIndicator(false), 1500);
  }, []);

  const handleKpiTargetChange = useCallback((kpiId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setKpiTargets(prev => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], target: numValue }
    }));
    setErrors(prev => ({ ...prev, [`target-${kpiId}`]: '' }));
    setAutoSaveIndicator(true);
    setTimeout(() => setAutoSaveIndicator(false), 1500);
  }, []);

  const handleTatChange = useCallback((kpiId: string, field: 'benchmark' | 'ceiling', value: string) => {
    const numValue = parseInt(value) || 0;
    setKpiTargets(prev => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], [field]: numValue }
    }));
    setErrors(prev => ({ ...prev, [`${field}-${kpiId}`]: '' }));
  }, []);

  const validateTargets = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.entries(kpiTargets).forEach(([kpiId, target]) => {
      if (target.selected) {
        if (!target.target && target.target !== 0) {
          const kpi = KPI_CATALOG.find(k => k.id === kpiId);
          newErrors[`target-${kpiId}`] = `Target required for ${kpi?.name}`;
        }
        if (kpiId === 'kpi-13') {
          if (!target.benchmark && target.benchmark !== 0) {
            newErrors[`benchmark-${kpiId}`] = 'Benchmark required';
          }
          if (!target.ceiling && target.ceiling !== 0) {
            newErrors[`ceiling-${kpiId}`] = 'Ceiling required';
          }
          if (target.benchmark && target.ceiling && target.benchmark >= target.ceiling) {
            newErrors[`ceiling-${kpiId}`] = 'Benchmark must be less than Ceiling';
          }
        }
      }
    });

    if (isOverridden && !overrideValue) {
      newErrors.override = 'Please enter override value';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [kpiTargets, isOverridden, overrideValue]);

  const handleSave = async () => {
    if (!validateTargets()) return;

    setIsSaving(true);
    
    try {
      Object.entries(kpiTargets).forEach(([kpiId, target]) => {
        if (target.selected) {
          const kpi = KPI_CATALOG.find(k => k.id === kpiId);
          addTarget({
            id: `t-${Date.now()}-${kpiId}`,
            executiveId: selectedExecutiveId,
            executiveName: `${selectedExecutive!.firstName} ${selectedExecutive!.lastName}`,
            kpiId,
            kpiName: kpi?.name || '',
            periodType,
            periodStart: selectedPeriod,
            periodEnd: selectedPeriod,
            targetValue: target.target || 0,
            benchmark: target.benchmark,
            ceiling: target.ceiling,
            teamTarget: isOverridden ? parseFloat(overrideValue) || undefined : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId,
          });
        }
      });

      setShowSuccessModal(true);
      
      setTimeout(() => {
        setWizardStep('period');
        setPeriodType('monthly');
        setSelectedPeriod('');
        setSelectedExecutiveId('');
        setKpiTargets({});
        setIsOverridden(false);
        setOverrideValue('');
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving targets:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isManager && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Target Setting</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Target setting is only available for Managers and Administrators. 
            Please contact your manager if you need to update your targets.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Target Setting</h1>
              <p className="text-sm text-slate-500">Set performance targets for your team</p>
            </div>
          </div>
        </div>
        
        {autoSaveIndicator && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Auto-saved
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <Card className="!p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
          <div className="flex items-center justify-between">
            {(['period', 'executive', 'kpis', 'review'] as WizardStep[]).map((step, index) => {
              const labels = {
                period: 'Select Period',
                executive: 'Choose Executive',
                kpis: 'Set Targets',
                review: 'Review & Save'
              };
              const icons = {
                period: <Calendar className="w-4 h-4" />,
                executive: <Users className="w-4 h-4" />,
                kpis: <Target className="w-4 h-4" />,
                review: <Save className="w-4 h-4" />
              };
              const isActive = wizardStep === step;
              const isCompleted = ['period', 'executive', 'kpis', 'review'].indexOf(wizardStep) > index;
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div className={classNames(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                      isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
                      isCompleted ? 'bg-emerald-500 text-white' :
                      'bg-slate-700 text-slate-400'
                    )}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : icons[step]}
                    </div>
                    <span className={classNames(
                      'text-sm font-medium hidden md:block',
                      isActive ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-slate-400'
                    )}>
                      {labels[step]}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={classNames(
                      'w-12 md:w-20 h-0.5 mx-4',
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-700'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Period Selection */}
          {wizardStep === 'period' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Select Period Type</h2>
                <p className="text-sm text-slate-500">Choose the type of period you want to set targets for</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {PERIOD_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setPeriodType(type.value);
                      setSelectedPeriod('');
                    }}
                    className={classNames(
                      'relative p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]',
                      periodType === type.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}
                  >
                    {type.requiresApproval && (
                      <span className="absolute top-2 right-2">
                        <Badge variant="warning" size="sm">Approval</Badge>
                      </span>
                    )}
                    <p className={classNames(
                      'font-semibold',
                      periodType === type.value ? 'text-blue-600' : 'text-slate-700'
                    )}>
                      {type.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>

              {periodType && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Choose Specific {periodType.charAt(0).toUpperCase() + periodType.slice(1)}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all appearance-none bg-white"
                    >
                      <option value="">Select a period...</option>
                      {availablePeriods.map((period) => (
                        <option key={period.value} value={period.value}>
                          {period.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Contextual Info */}
              {periodType && selectedPeriod && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">About {periodType} targets:</p>
                    <p className="mt-1">
                      {requiresApproval 
                        ? 'These targets will be saved as "Pending Approval" and must be approved by an Admin before becoming active.'
                        : 'These targets will be activated immediately and visible to the executive right away.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Executive Selection */}
          {wizardStep === 'executive' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Choose Executive</h2>
                <p className="text-sm text-slate-500">
                  {isAdmin ? 'Select any executive across any franchisee' : 'Select an executive from your team'}
                </p>
              </div>

              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredExecutives.map((exec) => (
                  <button
                    key={exec.id}
                    onClick={() => setSelectedExecutiveId(exec.id)}
                    className={classNames(
                      'relative p-4 rounded-xl border-2 text-left transition-all',
                      selectedExecutiveId === exec.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={classNames(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold',
                        exec.avgAttainment && exec.avgAttainment >= 90 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                        exec.avgAttainment && exec.avgAttainment >= 70 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                        'bg-gradient-to-br from-slate-400 to-slate-500'
                      )}>
                        {exec.firstName[0]}{exec.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {exec.firstName} {exec.lastName}
                        </p>
                        <p className="text-sm text-slate-500 truncate">{exec.teamName}</p>
                        {isAdmin && (
                          <p className="text-xs text-slate-400 mt-0.5">{exec.franchiseeName}</p>
                        )}
                      </div>
                    </div>
                    {exec.avgAttainment && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={classNames(
                              'h-full rounded-full',
                              exec.avgAttainment >= 90 ? 'bg-emerald-500' :
                              exec.avgAttainment >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            )}
                            style={{ width: `${Math.min(exec.avgAttainment, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{exec.avgAttainment}%</span>
                      </div>
                    )}
                    {selectedExecutiveId === exec.id && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: KPI Targets */}
          {wizardStep === 'kpis' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Set KPI Targets</h2>
                  <p className="text-sm text-slate-500">
                    Select KPIs and enter target values for {selectedExecutive?.firstName} {selectedExecutive?.lastName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{selectedKpisCount} KPIs selected</span>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {KPI_CATEGORIES.map((category) => {
                  const categoryKpis = KPI_CATALOG.filter(k => k.type === category.id);
                  const selectedCount = categoryKpis.filter(k => kpiTargets[k.id]?.selected).length;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={classNames(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap',
                        activeCategory === category.id
                          ? `${category.bgColor} border-current ${category.color}`
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {category.icon}
                      <span className="font-medium">{category.label}</span>
                      <span className={classNames(
                        'px-2 py-0.5 rounded-full text-xs',
                        activeCategory === category.id ? 'bg-white/50' : 'bg-slate-100'
                      )}>
                        {selectedCount}/{categoryKpis.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* KPI Cards */}
              <div className="space-y-3">
                {kpisByCategory.map((kpi) => {
                  const target = kpiTargets[kpi.id] || { selected: false };
                  const isTat = kpi.id === 'kpi-13';
                  const category = KPI_CATEGORIES.find(c => c.id === kpi.type);

                  return (
                    <div
                      key={kpi.id}
                      className={classNames(
                        'p-4 rounded-xl border-2 transition-all',
                        target.selected 
                          ? `${category?.bgColor || 'bg-blue-50'} border-current` 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleKpiSelect(kpi.id, !target.selected)}
                          className={classNames(
                            'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-1',
                            target.selected
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-slate-300 hover:border-slate-400'
                          )}
                        >
                          {target.selected && <CheckCircle className="w-4 h-4" />}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{kpi.name}</p>
                              <p className="text-sm text-slate-500">Unit: {kpi.unit}</p>
                            </div>
                            {isTat && target.selected && (
                              <button
                                onClick={() => setShowRevisionModal(true)}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <History className="w-4 h-4" />
                                History
                              </button>
                            )}
                          </div>

                          {/* Target Input - Single KPI */}
                          {target.selected && !isTat && (
                            <div className="mt-4 max-w-xs">
                              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Target Value
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  placeholder="Enter target"
                                  value={target.target || ''}
                                  onChange={(e) => handleKpiTargetChange(kpi.id, e.target.value)}
                                  min={0}
                                  step="any"
                                  className={classNames(
                                    'w-full px-4 py-2.5 pr-16 border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-200 outline-none',
                                    errors[`target-${kpi.id}`] 
                                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                                      : 'border-slate-200 focus:border-blue-500'
                                  )}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                  {kpi.unit}
                                </span>
                              </div>
                              {errors[`target-${kpi.id}`] && (
                                <p className="text-xs text-red-500 mt-1">{errors[`target-${kpi.id}`]}</p>
                              )}
                            </div>
                          )}

                          {/* Completion TAT - Two Inputs */}
                          {target.selected && isTat && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                  Benchmark (Ideal days)
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    placeholder="Ideal"
                                    value={target.benchmark ?? ''}
                                    onChange={(e) => handleTatChange(kpi.id, 'benchmark', e.target.value)}
                                    min={1}
                                    className={classNames(
                                      'w-full px-4 py-2.5 pr-16 border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-200 outline-none',
                                      errors[`benchmark-${kpi.id}`] 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-slate-200 focus:border-blue-500'
                                    )}
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                                    days
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Lower is better</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                  Ceiling (Max allowed)
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    placeholder="Max"
                                    value={target.ceiling ?? ''}
                                    onChange={(e) => handleTatChange(kpi.id, 'ceiling', e.target.value)}
                                    min={1}
                                    className={classNames(
                                      'w-full px-4 py-2.5 pr-16 border-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-200 outline-none',
                                      errors[`ceiling-${kpi.id}`] 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-slate-200 focus:border-blue-500'
                                    )}
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                                    days
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Breach threshold</p>
                              </div>
                              {target.benchmark && target.ceiling && target.benchmark >= target.ceiling && (
                                <div className="md:col-span-2 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                  <p className="text-sm text-amber-700">Benchmark must be less than Ceiling</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Team Target Summary */}
              {selectedKpisCount > 0 && (
                <div className="border-t-2 border-slate-200 pt-6 mt-6">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white">Team Target Summary</h3>
                      <Badge variant="default" className="bg-white/20 text-white border-0">
                        {selectedKpisCount} KPIs
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-sm text-slate-300">Auto-Sum Total</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {autoSumValue.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-sm text-slate-300">Status</p>
                        <div className="mt-1">
                          {requiresApproval ? (
                            <Badge variant="warning">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Approval
                            </Badge>
                          ) : (
                            <Badge variant="success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-sm text-slate-300">Period</p>
                        <p className="text-lg font-semibold text-white mt-1">{selectedPeriod}</p>
                      </div>
                    </div>

                    {/* Override Toggle */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div 
                          onClick={() => setIsOverridden(!isOverridden)}
                          className={classNames(
                            'w-10 h-6 rounded-full transition-colors relative cursor-pointer',
                            isOverridden ? 'bg-blue-500' : 'bg-slate-600'
                          )}
                        >
                          <div className={classNames(
                            'w-4 h-4 bg-white rounded-full absolute top-1 transition-transform',
                            isOverridden ? 'translate-x-5 right-1' : 'left-1'
                          )} />
                        </div>
                        <span className="text-sm text-slate-300">Override Team Target</span>
                      </label>

                      {isOverridden && (
                        <div className="mt-3 ml-13">
                          <div className="max-w-xs">
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="Enter override amount"
                                value={overrideValue}
                                onChange={(e) => setOverrideValue(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm">Override will be logged in audit trail</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Save */}
          {wizardStep === 'review' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Review & Save</h2>
                <p className="text-sm text-slate-500">Review your target settings before saving</p>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-slate-500">Executive</p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {selectedExecutive?.firstName} {selectedExecutive?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Period</p>
                    <p className="font-semibold text-slate-900 mt-1">{selectedPeriod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">KPIs</p>
                    <p className="font-semibold text-slate-900 mt-1">{selectedKpisCount} selected</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <div className="mt-1">
                      {requiresApproval ? (
                        <Badge variant="warning">
                          <Clock className="w-3 h-3 mr-1" />
                          Requires Approval
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active Immediately
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Summary */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Target Summary</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {Object.entries(kpiTargets)
                    .filter(([_, t]) => t.selected)
                    .map(([kpiId, target]) => {
                      const kpi = KPI_CATALOG.find(k => k.id === kpiId);
                      const isTat = kpiId === 'kpi-13';
                      
                      return (
                        <div key={kpiId} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{kpi?.name}</p>
                            <p className="text-sm text-slate-500">
                              {isTat 
                                ? `Benchmark: ${target.benchmark} days | Ceiling: ${target.ceiling} days`
                                : `Target: ${target.target} ${kpi?.unit}`
                              }
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Team Target */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Team Target</p>
                    <p className="text-3xl font-bold mt-1">
                      {isOverridden && overrideValue 
                        ? parseFloat(overrideValue).toLocaleString()
                        : autoSumValue.toLocaleString()
                      }
                    </p>
                    {isOverridden && overrideValue && (
                      <p className="text-sm text-blue-200 mt-1">
                        (Overridden from {autoSumValue.toLocaleString()})
                      </p>
                    )}
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={wizardStep === 'period'}
          >
            Back
          </Button>
          
          {wizardStep !== 'review' ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-32"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {requiresApproval ? 'Submit for Approval' : 'Save & Activate'}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Revision History</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">Apr 1, 2026</span>
                  <Badge variant="success" size="sm">Approved</Badge>
                </div>
                <p className="text-sm text-slate-600">Benchmark: 3 → 2 days</p>
                <p className="text-xs text-slate-400 mt-1">By: Anita Sharma</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">Mar 15, 2026</span>
                  <Badge variant="default" size="sm">Initial</Badge>
                </div>
                <p className="text-sm text-slate-600">Benchmark: 5 days (initial)</p>
                <p className="text-xs text-slate-400 mt-1">By: Manager</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setShowRevisionModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {requiresApproval ? 'Submitted for Approval!' : 'Targets Saved!'}
            </h3>
            <p className="text-slate-500">
              {requiresApproval 
                ? 'Your targets have been submitted and are pending Admin approval.'
                : 'Your targets have been activated and are now visible to the executive.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
