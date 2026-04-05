'use client';

import { useState } from 'react';
import { KPI_CATALOG } from '@/lib/constants';
import { Button, Input, Select, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';

interface Executive {
  id: string;
  name: string;
  team: string;
}

interface TargetEntryFormProps {
  executives: Executive[];
  selectedExecutive: string;
  onSelectExecutive: (id: string) => void;
  onSave: (target: any) => void;
  onCancel: () => void;
  editTarget?: any;
  periodType?: string;
}

export function TargetEntryForm({
  executives,
  selectedExecutive,
  onSelectExecutive,
  onSave,
  onCancel,
  editTarget,
  periodType = 'monthly',
}: TargetEntryFormProps) {
  const [selectedKpis, setSelectedKpis] = useState<string[]>(editTarget ? [editTarget.kpiId] : []);
  const [targetValues, setTargetValues] = useState<Record<string, number>>(
    editTarget ? { [editTarget.kpiId]: editTarget.targetValue } : {}
  );
  const [benchmarkValues, setBenchmarkValues] = useState<Record<string, number>>(
    editTarget?.benchmark ? { [editTarget.kpiId]: editTarget.benchmark } : {}
  );
  const [ceilingValues, setCeilingValues] = useState<Record<string, number>>(
    editTarget?.ceiling ? { [editTarget.kpiId]: editTarget.ceiling } : {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleKpiToggle = (kpiId: string) => {
    setSelectedKpis(prev =>
      prev.includes(kpiId)
        ? prev.filter(id => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedExecutive) {
      newErrors.executive = 'Please select an executive';
    }
    
    selectedKpis.forEach(kpiId => {
      if (!targetValues[kpiId] || targetValues[kpiId] <= 0) {
        newErrors[`target-${kpiId}`] = 'Required';
      }
      
      const kpi = KPI_CATALOG.find(k => k.id === kpiId);
      if (kpi?.requiresTwoTargets) {
        if (!benchmarkValues[kpiId] && benchmarkValues[kpiId] !== 0) {
          newErrors[`benchmark-${kpiId}`] = 'Required';
        }
        if (!ceilingValues[kpiId] && ceilingValues[kpiId] !== 0) {
          newErrors[`ceiling-${kpiId}`] = 'Required';
        }
        if (benchmarkValues[kpiId] > ceilingValues[kpiId]) {
          newErrors[`ceiling-${kpiId}`] = 'Ceiling must be >= Benchmark';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const exec = executives.find(e => e.id === selectedExecutive);
    
    if (editTarget) {
      onSave({
        executiveId: selectedExecutive,
        executiveName: exec?.name || '',
        kpiId: editTarget.kpiId,
        kpiName: editTarget.kpiName,
        periodType: 'monthly',
        targetValue: targetValues[editTarget.kpiId] || 0,
        benchmark: benchmarkValues[editTarget.kpiId],
        ceiling: ceilingValues[editTarget.kpiId],
      });
    } else {
      selectedKpis.forEach(kpiId => {
        const kpi = KPI_CATALOG.find(k => k.id === kpiId);
        onSave({
          executiveId: selectedExecutive,
          executiveName: exec?.name || '',
          kpiId,
          kpiName: kpi?.name || '',
        periodType: periodType,
          targetValue: targetValues[kpiId] || 0,
          benchmark: kpi?.requiresTwoTargets ? benchmarkValues[kpiId] : undefined,
          ceiling: kpi?.requiresTwoTargets ? ceilingValues[kpiId] : undefined,
        });
      });
    }
  };

  const selectedExecutiveData = executives.find(e => e.id === selectedExecutive);
  const hasTatKpi = selectedKpis.includes('kpi-13');

  return (
    <div className="space-y-5">
      {!editTarget && (
        <div>
          <Select
            label="Executive"
            options={[
              { value: '', label: 'Select Executive' },
              ...executives.map(e => ({ value: e.id, label: `${e.name} (${e.team})` })),
            ]}
            value={selectedExecutive}
            onChange={(e) => onSelectExecutive(e.target.value)}
            error={errors.executive}
          />
        </div>
      )}

      {!editTarget && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select KPIs {selectedExecutiveData ? `for ${selectedExecutiveData.name}` : ''}
          </label>
          <div className="flex flex-wrap gap-2">
            {KPI_CATALOG.map((kpi) => {
              const isSelected = selectedKpis.includes(kpi.id);
              return (
                <button
                  key={kpi.id}
                  type="button"
                  onClick={() => handleKpiToggle(kpi.id)}
                  className={classNames(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {kpi.name}
                  <span className="ml-1 text-xs opacity-75">({kpi.unit})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedKpis.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                {hasTatKpi && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Benchmark</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ceiling</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedKpis.map((kpiId) => {
                const kpi = KPI_CATALOG.find(k => k.id === kpiId);
                if (!kpi) return null;

                return (
                  <tr key={kpiId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{kpi.name}</span>
                        <Badge size="sm">{kpi.unit}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={targetValues[kpiId] || ''}
                        onChange={(e) => setTargetValues(prev => ({
                          ...prev,
                          [kpiId]: parseFloat(e.target.value) || 0,
                        }))}
                        className={classNames(
                          'w-28 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
                          errors[`target-${kpiId}`] ? 'border-red-500' : 'border-gray-300'
                        )}
                        placeholder="0"
                      />
                      {errors[`target-${kpiId}`] && (
                        <p className="text-xs text-red-500 mt-1">{errors[`target-${kpiId}`]}</p>
                      )}
                    </td>
                    {kpi.requiresTwoTargets && (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={benchmarkValues[kpiId] ?? ''}
                            onChange={(e) => setBenchmarkValues(prev => ({
                              ...prev,
                              [kpiId]: parseFloat(e.target.value) || 0,
                            }))}
                            className={classNames(
                              'w-28 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
                              errors[`benchmark-${kpiId}`] ? 'border-red-500' : 'border-gray-300'
                            )}
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={ceilingValues[kpiId] ?? ''}
                            onChange={(e) => setCeilingValues(prev => ({
                              ...prev,
                              [kpiId]: parseFloat(e.target.value) || 0,
                            }))}
                            className={classNames(
                              'w-28 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
                              errors[`ceiling-${kpiId}`] ? 'border-red-500' : 'border-gray-300'
                            )}
                            placeholder="0"
                          />
                          {errors[`ceiling-${kpiId}`] && (
                            <p className="text-xs text-red-500 mt-1">{errors[`ceiling-${kpiId}`]}</p>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {editTarget ? 'Update Target' : `Save ${selectedKpis.length} Target${selectedKpis.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}
