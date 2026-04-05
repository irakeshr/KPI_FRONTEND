'use client';

import { useState, useMemo } from 'react';
import { useTargetStore, useAuthStore, Role } from '@/store';
import { KPI_CATALOG, PERIOD_LABELS } from '@/lib/constants';
import { Card, Button, Badge, Modal, Input, Select } from '@/components/ui';
import { 
  Search, Calendar, Users, Target, AlertCircle, CheckCircle, 
  Package, Star, Activity, DollarSign, Clock, History, 
  Info, AlertTriangle, ChevronRight, Filter, RefreshCcw
} from 'lucide-react';
import { classNames } from '@/lib/utils';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type KpiCategory = 'Revenue' | 'Quality' | 'Activity' | 'Output';

interface Executive {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  teamId: string;
  teamName: string;
  franchiseeId: string;
  avatar: string | null;
  status: 'active' | 'inactive';
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

const PERIOD_TYPES: { value: PeriodType; label: string; requiresApproval: boolean }[] = [
  { value: 'daily', label: 'Daily', requiresApproval: false },
  { value: 'weekly', label: 'Weekly', requiresApproval: false },
  { value: 'monthly', label: 'Monthly', requiresApproval: false },
  { value: 'quarterly', label: 'Quarterly', requiresApproval: true },
  { value: 'yearly', label: 'Yearly', requiresApproval: true },
];

const KPI_CATEGORIES: { id: KpiCategory; label: string; icon: React.ReactNode; count: number }[] = [
  { id: 'Revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" />, count: 2 },
  { id: 'Quality', label: 'Quality', icon: <Star className="w-4 h-4" />, count: 4 },
  { id: 'Activity', label: 'Activity', icon: <Activity className="w-4 h-4" />, count: 5 },
  { id: 'Output', label: 'Output', icon: <Package className="w-4 h-4" />, count: 2 },
];

const MOCK_EXECUTIVES: Executive[] = [
  { id: 'exec-1', firstName: 'Rahul', lastName: 'Sharma', role: 'Executive', teamId: 'team-1', teamName: 'Sales Team A', franchiseeId: 'fran-1', avatar: null, status: 'active' },
  { id: 'exec-2', firstName: 'Priya', lastName: 'Patel', role: 'Executive', teamId: 'team-1', teamName: 'Sales Team A', franchiseeId: 'fran-1', avatar: null, status: 'active' },
  { id: 'exec-3', firstName: 'Amit', lastName: 'Kumar', role: 'Executive', teamId: 'team-2', teamName: 'Sales Team B', franchiseeId: 'fran-1', avatar: null, status: 'active' },
  { id: 'exec-4', firstName: 'Sneha', lastName: 'Reddy', role: 'Executive', teamId: 'team-2', teamName: 'Sales Team B', franchiseeId: 'fran-2', avatar: null, status: 'active' },
  { id: 'exec-5', firstName: 'Vikram', lastName: 'Singh', role: 'Executive', teamId: 'team-3', teamName: 'Sales Team C', franchiseeId: 'fran-2', avatar: null, status: 'active' },
  { id: 'exec-6', firstName: 'Anjali', lastName: 'Mehta', role: 'Executive', teamId: 'team-3', teamName: 'Sales Team C', franchiseeId: 'fran-3', avatar: null, status: 'inactive' },
];

interface TargetSettingPageProps {
  role: Role;
  userId: string;
}

export function TargetSettingPage({ role, userId }: TargetSettingPageProps) {
  const { targets, periods, addTarget, getCurrentPeriod } = useTargetStore();
  const currentPeriod = getCurrentPeriod();
  const isAdmin = role === 'Admin';
  const isManager = role === 'Manager';

  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeKpiCategory, setActiveKpiCategory] = useState<KpiCategory>('Revenue');
  const [kpiTargets, setKpiTargets] = useState<TargetData>({});
  const [isOverridden, setIsOverridden] = useState(false);
  const [overrideValue, setOverrideValue] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [revisionKpi, setRevisionKpi] = useState<string | null>(null);
  const [revisionValue, setRevisionValue] = useState<number>(0);
  const [revisionReason, setRevisionReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const periodInfo = PERIOD_TYPES.find(p => p.value === periodType);
  const requiresApproval = periodInfo?.requiresApproval || false;

  const selectedExecutive = MOCK_EXECUTIVES.find(e => e.id === selectedExecutiveId);

  const filteredExecutives = useMemo(() => {
    if (!searchTerm) return MOCK_EXECUTIVES.filter(e => e.status === 'active');
    const term = searchTerm.toLowerCase();
    return MOCK_EXECUTIVES.filter(exec => 
      exec.status === 'active' && (
        exec.firstName.toLowerCase().includes(term) || 
        exec.lastName.toLowerCase().includes(term)
      )
    );
  }, [searchTerm]);

  const kpisByCategory = useMemo(() => {
    return KPI_CATALOG.filter(kpi => kpi.type === activeKpiCategory);
  }, [activeKpiCategory]);

  const selectedKpisCount = useMemo(() => {
    return Object.values(kpiTargets).filter(t => t.selected).length;
  }, [kpiTargets]);

  const autoSumValue = useMemo(() => {
    let sum = 0;
    Object.values(kpiTargets).forEach(t => {
      if (t.selected && t.target) {
        sum += t.target;
      }
    });
    return sum;
  }, [kpiTargets]);

  const handleKpiSelect = (kpiId: string, selected: boolean) => {
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
  };

  const handleKpiTargetChange = (kpiId: string, target: number) => {
    setKpiTargets(prev => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], target }
    }));
    setErrors(prev => ({ ...prev, [`target-${kpiId}`]: '' }));
  };

  const handleTatChange = (kpiId: string, field: 'benchmark' | 'ceiling', value: number) => {
    setKpiTargets(prev => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], [field]: value }
    }));
    setErrors(prev => ({ ...prev, [`${field}-${kpiId}`]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedExecutiveId) {
      newErrors.executive = 'Please select an executive';
    }
    if (selectedKpisCount === 0) {
      newErrors.kpis = 'Please select at least one KPI';
    }
    
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
  };

  const handleSave = async (saveAsDraft: boolean = false) => {
    if (!validateForm()) return;

    if (requiresApproval && !saveAsDraft && !isAdmin) {
      setShowApprovalModal(true);
      return;
    }

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
            periodStart: new Date().toISOString().split('T')[0],
            periodEnd: new Date().toISOString().split('T')[0],
            targetValue: target.target || 0,
            benchmark: target.benchmark,
            ceiling: target.ceiling,
            teamTarget: isOverridden ? overrideValue || undefined : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: userId,
          });
        }
      });

      setKpiTargets({});
      setSelectedExecutiveId('');
      setIsOverridden(false);
      setOverrideValue(null);
      setErrors({});
    } catch (error) {
      console.error('Error saving targets:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevision = (kpiId: string) => {
    setRevisionKpi(kpiId);
    const target = kpiTargets[kpiId];
    setRevisionValue(target?.target || 0);
    setRevisionReason('');
    setShowRevisionModal(true);
  };

  const handleSaveRevision = () => {
    if (!revisionKpi || !revisionReason.trim()) return;
    
    setKpiTargets(prev => ({
      ...prev,
      [revisionKpi]: { ...prev[revisionKpi], target: revisionValue }
    }));
    setShowRevisionModal(false);
    setRevisionKpi(null);
    setRevisionReason('');
  };

  if (!isManager && !isAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Access Restricted</h3>
            <p className="text-gray-500 mt-1">Target setting is only available for Managers and Admins.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Target Setting</h1>
          <p className="text-sm text-gray-500 mt-1">Set and manage KPI targets for your team</p>
        </div>
        <div className="flex items-center gap-2">
          {requiresApproval && !isAdmin && (
            <Badge variant="warning">
              <Clock className="w-3 h-3 mr-1" />
              Requires Approval
            </Badge>
          )}
          {isAdmin && (
            <Badge variant="info">
              <CheckCircle className="w-3 h-3 mr-1" />
              Admin Override
            </Badge>
          )}
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Please fix the following errors:</p>
              <ul className="mt-1 list-disc list-inside text-sm text-red-700">
                {Object.values(errors).filter(Boolean).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Executive
            </h3>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredExecutives.map((exec) => (
                  <button
                    key={exec.id}
                    onClick={() => setSelectedExecutiveId(exec.id)}
                    className={classNames(
                      'w-full p-2 rounded-lg text-left transition-colors flex items-center gap-2',
                      selectedExecutiveId === exec.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    )}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {exec.firstName[0]}{exec.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {exec.firstName} {exec.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{exec.teamName}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Period
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period Type</label>
                <div className="flex flex-wrap gap-2">
                  {PERIOD_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setPeriodType(type.value)}
                      className={classNames(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        periodType === type.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                type="month"
                label="Specific Period"
                value={periodType === 'monthly' ? '2026-04' : ''}
                onChange={() => {}}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    Monthly targets activate immediately. Quarterly/Yearly require Admin approval.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-9 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">KPI Targets</h3>
              </div>
              {selectedExecutive && (
                <Badge variant="info">
                  {selectedExecutive.firstName} {selectedExecutive.lastName}
                </Badge>
              )}
            </div>

            {!selectedExecutiveId ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Select an executive to set targets</p>
              </div>
            ) : (
              <>
                <div className="border-b border-gray-200 mb-4">
                  <nav className="-mb-px flex gap-1">
                    {KPI_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveKpiCategory(category.id)}
                        className={classNames(
                          'px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                          activeKpiCategory === category.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                      >
                        {category.icon}
                        {category.label}
                        <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="space-y-3">
                  {kpisByCategory.map((kpi) => {
                    const target = kpiTargets[kpi.id] || { selected: false };
                    const isTat = kpi.id === 'kpi-13';

                    return (
                      <div
                        key={kpi.id}
                        className={classNames(
                          'p-4 rounded-xl border-2 transition-all',
                          target.selected 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-white border-gray-100 hover:border-gray-200'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={target.selected}
                            onChange={(e) => handleKpiSelect(kpi.id, e.target.checked)}
                            className="mt-1.5 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{kpi.name}</p>
                                <p className="text-sm text-gray-500">Unit: {kpi.unit}</p>
                              </div>
                              {isTat && target.selected && (
                                <button
                                  onClick={() => handleRevision(kpi.id)}
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  <History className="w-4 h-4" />
                                  Revision
                                </button>
                              )}
                            </div>

                            {target.selected && !isTat && (
                              <div className="mt-3 max-w-xs">
                                <div className="relative">
                                  <input
                                    type="number"
                                    placeholder="Enter target value"
                                    value={target.target || ''}
                                    onChange={(e) => handleKpiTargetChange(kpi.id, parseFloat(e.target.value) || 0)}
                                    min={0}
                                    step="any"
                                    className={classNames(
                                      'w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
                                      errors[`target-${kpi.id}`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    )}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                    {kpi.unit}
                                  </span>
                                </div>
                                {errors[`target-${kpi.id}`] && (
                                  <p className="text-xs text-red-500 mt-1">{errors[`target-${kpi.id}`]}</p>
                                )}
                              </div>
                            )}

                            {target.selected && isTat && (
                              <div className="mt-3 grid grid-cols-2 gap-4 max-w-md">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Benchmark (Ideal days)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Ideal days"
                                    value={target.benchmark ?? ''}
                                    onChange={(e) => handleTatChange(kpi.id, 'benchmark', parseInt(e.target.value) || 0)}
                                    min={1}
                                    className={classNames(
                                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
                                      errors[`benchmark-${kpi.id}`] ? 'border-red-500' : 'border-gray-300'
                                    )}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Target (lower is better)</p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ceiling (Max allowed days)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Max allowed days"
                                    value={target.ceiling ?? ''}
                                    onChange={(e) => handleTatChange(kpi.id, 'ceiling', parseInt(e.target.value) || 0)}
                                    min={1}
                                    className={classNames(
                                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
                                      errors[`ceiling-${kpi.id}`] ? 'border-red-500' : 'border-gray-300'
                                    )}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">Breach threshold</p>
                                </div>
                                {target.benchmark && target.ceiling && target.benchmark >= target.ceiling && (
                                  <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-sm text-amber-700 flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" />
                                      Benchmark must be less than Ceiling
                                    </p>
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
              </>
            )}
          </Card>

          {selectedExecutiveId && selectedKpisCount > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Team Target Summary</h3>
                <Badge variant="default">{selectedKpisCount} KPIs selected</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600">Auto-Sum Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {autoSumValue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Status</p>
                  {requiresApproval && !isAdmin ? (
                    <Badge variant="warning" className="mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Approval
                    </Badge>
                  ) : (
                    <Badge variant="success" className="mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">KPIs</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedKpisCount}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOverridden}
                    onChange={(e) => {
                      setIsOverridden(e.target.checked);
                      if (!e.target.checked) setOverrideValue(null);
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Override team target</span>
                </label>

                {isOverridden && (
                  <div className="mt-3 ml-7">
                    <div className="max-w-xs">
                      <Input
                        type="number"
                        label="Override Value"
                        placeholder="Enter override amount"
                        value={overrideValue || ''}
                        onChange={(e) => setOverrideValue(parseFloat(e.target.value) || null)}
                        min={0}
                        error={errors.override}
                      />
                    </div>
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <p className="text-sm text-amber-700">Override will be logged in audit trail</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {selectedExecutiveId && (
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary">Cancel</Button>
              {requiresApproval && (
                <Button 
                  variant="ghost" 
                  onClick={() => handleSave(true)}
                  disabled={isSaving || selectedKpisCount === 0}
                >
                  Save as Draft
                </Button>
              )}
              <Button 
                onClick={() => handleSave(false)}
                disabled={isSaving || !selectedExecutiveId || selectedKpisCount === 0}
              >
                {isSaving ? 'Saving...' : 'Save & Activate'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        title="Revise Target"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KPI</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {revisionKpi && KPI_CATALOG.find(k => k.id === revisionKpi)?.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Target</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{revisionValue}</p>
            </div>
          </div>
          
          <Input
            type="number"
            label="New Target"
            value={revisionValue}
            onChange={(e) => setRevisionValue(parseFloat(e.target.value) || 0)}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Revision <span className="text-red-500">*</span>
            </label>
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Please explain why target is being revised..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{revisionReason.length}/500</p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowRevisionModal(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveRevision} 
              disabled={!revisionReason.trim()}
            >
              Save Revision
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Admin Approval Required"
        size="md"
      >
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Request Submitted</h3>
          <p className="text-gray-500 mt-2">
            Your {periodType} target setting request has been submitted for Admin approval.
          </p>
          <p className="text-sm text-amber-600 mt-2">
            Track status in "My Requests" section.
          </p>
        </div>
        <div className="mt-4">
          <Button onClick={() => setShowApprovalModal(false)} className="w-full">
            Got it
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Target Revision History"
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revised By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Original</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">New</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-500">Apr 1, 2026</td>
                <td className="px-4 py-3 text-sm text-gray-900">Anita Sharma</td>
                <td className="px-4 py-3 text-sm text-gray-900">Sales</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">45,000</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">50,000</td>
                <td className="px-4 py-3 text-sm text-gray-500">Performance exceeded</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>Close</Button>
          <Button variant="ghost">Export</Button>
        </div>
      </Modal>
    </div>
  );
}
