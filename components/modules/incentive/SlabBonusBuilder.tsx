'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Modal, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { XCircle } from 'lucide-react';

interface Slab {
  id: string;
  minValue: number;
  maxValue: number | null;
  bonusType: 'fixed' | 'percent';
  bonusValue: number;
}

interface SlabConfig {
  kpiId: string;
  kpiName: string;
  slabs: Slab[];
  accumulationType: 'cumulative' | 'non-cumulative';
}

interface SlabBonusBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SlabConfig) => void;
  configs: SlabConfig[];
  kpiOptions: { id: string; name: string; unit: string }[];
  canEdit?: boolean;
}

const MAX_SLABS = 8;
const BONUS_TYPES = [
  { value: 'fixed', label: 'Fixed Amount (₹)' },
  { value: 'percent', label: '% of CTC' },
];
const ACCUMULATION_TYPES = [
  { value: 'cumulative', label: 'Cumulative (earn all previous slabs)' },
  { value: 'non-cumulative', label: 'Non-Cumulative (current slab only)' },
];

export function SlabBonusBuilder({
  isOpen,
  onClose,
  onSave,
  configs,
  kpiOptions,
  canEdit = true,
}: SlabBonusBuilderProps) {
  const [selectedKpi, setSelectedKpi] = useState('');
  const [slabConfig, setSlabConfig] = useState<SlabConfig | null>(null);
  const [accumulationType, setAccumulationType] = useState<'cumulative' | 'non-cumulative'>('cumulative');

  useEffect(() => {
    if (selectedKpi) {
      const existing = configs.find(c => c.kpiId === selectedKpi);
      if (existing) {
        setSlabConfig(existing);
        setAccumulationType(existing.accumulationType);
      } else {
        const kpi = kpiOptions.find(k => k.id === selectedKpi);
        setSlabConfig({
          kpiId: selectedKpi,
          kpiName: kpi?.name || '',
          slabs: [],
          accumulationType: 'cumulative',
        });
        setAccumulationType('cumulative');
      }
    }
  }, [selectedKpi, configs, kpiOptions]);

  const addSlab = () => {
    if (!slabConfig || slabConfig.slabs.length >= MAX_SLABS) return;

    const lastSlab = slabConfig.slabs[slabConfig.slabs.length - 1];
    const newMin = lastSlab ? (lastSlab.maxValue || lastSlab.minValue) + 1 : 0;

    setSlabConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slabs: [
          ...prev.slabs,
          {
            id: `slab-${Date.now()}`,
            minValue: newMin,
            maxValue: null,
            bonusType: 'fixed',
            bonusValue: 0,
          },
        ],
      };
    });
  };

  const updateSlab = (slabId: string, updates: Partial<Slab>) => {
    setSlabConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slabs: prev.slabs.map(s => s.id === slabId ? { ...s, ...updates } : s),
      };
    });
  };

  const removeSlab = (slabId: string) => {
    setSlabConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        slabs: prev.slabs.filter(s => s.id !== slabId),
      };
    });
  };

  const handleSave = () => {
    if (!slabConfig || slabConfig.slabs.length < 2) return;
    onSave({ ...slabConfig, accumulationType });
    onClose();
  };

  const validateSlabs = () => {
    if (!slabConfig || slabConfig.slabs.length < 2) {
      return 'Minimum 2 slabs required';
    }
    if (slabConfig.slabs.length > MAX_SLABS) {
      return `Maximum ${MAX_SLABS} slabs allowed`;
    }
    for (let i = 1; i < slabConfig.slabs.length; i++) {
      const prev = slabConfig.slabs[i - 1];
      const curr = slabConfig.slabs[i];
      if (curr.minValue <= (prev.maxValue || prev.minValue)) {
        return 'Slabs must be contiguous and non-overlapping';
      }
    }
    return null;
  };

  const selectedKpiData = kpiOptions.find(k => k.id === selectedKpi);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Slab Bonus Builder"
      size="xl"
      footer={
        canEdit && (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!!validateSlabs()}>
              Save Configuration
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Slab Bonus</strong> is earned based on KPI attainment. Configure up to {MAX_SLABS} contiguous, 
            non-overlapping slabs. Slabs can be cumulative (earn all previous slabs) or non-cumulative.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="KPI"
            options={[
              { value: '', label: 'Select KPI' },
              ...kpiOptions.map(k => ({ value: k.id, label: `${k.name} (${k.unit})` })),
            ]}
            value={selectedKpi}
            onChange={(e) => setSelectedKpi(e.target.value)}
            disabled={!canEdit}
          />

          <Select
            label="Accumulation Type"
            options={ACCUMULATION_TYPES}
            value={accumulationType}
            onChange={(e) => setAccumulationType(e.target.value as 'cumulative' | 'non-cumulative')}
            disabled={!canEdit}
          />
        </div>

        {slabConfig && selectedKpi && (
          <>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  Slabs for {slabConfig.kpiName}
                </h4>
                <Badge variant="info">
                  {slabConfig.slabs.length} / {MAX_SLABS} slabs
                </Badge>
              </div>

              {slabConfig.slabs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No slabs configured. Click "Add Slab" to start.
                </p>
              ) : (
                <div className="space-y-3">
                  {slabConfig.slabs.map((slab, index) => (
                    <div
                      key={slab.id}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="w-24">
                        <span className="text-xs text-gray-500 block">Slab {index + 1}</span>
                      </div>

                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Min Attainment %</label>
                          <input
                            type="number"
                            value={slab.minValue}
                            onChange={(e) => updateSlab(slab.id, { minValue: parseFloat(e.target.value) || 0 })}
                            disabled={!canEdit}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Max Attainment %</label>
                          <input
                            type="number"
                            value={slab.maxValue || ''}
                            onChange={(e) => updateSlab(slab.id, { maxValue: e.target.value ? parseFloat(e.target.value) : null })}
                            placeholder="∞"
                            disabled={!canEdit}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Bonus Type</label>
                          <select
                            value={slab.bonusType}
                            onChange={(e) => updateSlab(slab.id, { bonusType: e.target.value as 'fixed' | 'percent' })}
                            disabled={!canEdit}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                          >
                            {BONUS_TYPES.map(bt => (
                              <option key={bt.value} value={bt.value}>{bt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 block mb-1">
                            Bonus Value ({slab.bonusType === 'fixed' ? '₹' : '%'})
                          </label>
                          <input
                            type="number"
                            value={slab.bonusValue}
                            onChange={(e) => updateSlab(slab.id, { bonusValue: parseFloat(e.target.value) || 0 })}
                            disabled={!canEdit}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>

                      {canEdit && (
                        <button
                          onClick={() => removeSlab(slab.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {canEdit && slabConfig.slabs.length < MAX_SLABS && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addSlab}
                  className="mt-3"
                >
                  + Add Slab
                </Button>
              )}

              {validateSlabs() && (
                <p className="text-sm text-red-600 mt-2">{validateSlabs()}</p>
              )}
            </div>

            {slabConfig.slabs.length >= 2 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">Preview</h4>
                <div className="space-y-2">
                  {slabConfig.slabs.map((slab, index) => (
                    <div key={slab.id} className="flex items-center justify-between text-sm">
                      <span className="text-green-800">
                        {slab.minValue}% - {slab.maxValue || '∞'}% Attainment:
                      </span>
                      <span className="font-medium text-green-900">
                        {slab.bonusType === 'fixed' 
                          ? `₹${slab.bonusValue.toLocaleString()}`
                          : `${slab.bonusValue}% of CTC`
                        }
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-green-700 mt-3">
                  {accumulationType === 'cumulative' 
                    ? 'Bonuses are cumulative - earning a higher slab also earns all lower slabs.'
                    : 'Only the current slab bonus is earned based on final attainment.'
                  }
                </p>
              </div>
            )}
          </>
        )}

        {configs.length > 0 && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Configured KPIs</h4>
            <div className="flex flex-wrap gap-2">
              {configs.map(c => (
                <Badge key={c.kpiId} variant="success">{c.kpiName}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
