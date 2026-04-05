'use client';

import { useState } from 'react';
import { Period, PeriodType } from '@/types';
import { PERIOD_LABELS } from '@/lib/constants';
import { Card, Button, Modal } from '@/components/ui';

interface PeriodManagementProps {
  currentPeriod: Period;
  periods: Period[];
  onPeriodSelect: (period: Period) => void;
  onCreatePeriod?: (type: PeriodType, startDate: string, endDate: string) => void;
  isAdmin?: boolean;
}

const PERIOD_TYPES: PeriodType[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

export function PeriodManagement({
  currentPeriod,
  periods,
  onPeriodSelect,
  onCreatePeriod,
  isAdmin = false,
}: PeriodManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<PeriodType>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getActivePeriodsByType = (type: PeriodType) =>
    periods.filter(p => p.type === type && p.isActive);

  const handleCreate = () => {
    if (onCreatePeriod && startDate && endDate) {
      onCreatePeriod(selectedType, startDate, endDate);
      setShowCreateModal(false);
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <Card
      title="Period Management"
      subtitle="Select or create tracking periods"
      className="mb-6"
      headerAction={
        isAdmin && (
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            Create Period
          </Button>
        )
      }
    >
      <div className="flex flex-wrap gap-2">
        {PERIOD_TYPES.map((type) => {
          const activePeriods = getActivePeriodsByType(type);
          const isSelected = currentPeriod.type === type;

          return (
            <div key={type} className="relative group">
              <button
                onClick={() => {
                  if (activePeriods.length > 0) {
                    onPeriodSelect(activePeriods[0]);
                  }
                }}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {PERIOD_LABELS[type]}
                {activePeriods.length > 0 && (
                  <span className="ml-2 text-xs opacity-75">
                    ({activePeriods.length})
                  </span>
                )}
              </button>

              {activePeriods.length > 1 && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[200px]">
                  {activePeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => onPeriodSelect(period)}
                      className={`
                        w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg
                        ${currentPeriod.id === period.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                      `}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentPeriod.requiresApproval && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> {PERIOD_LABELS[currentPeriod.type]} periods require Admin approval before activation.
          </p>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Period"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Period
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as PeriodType)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {PERIOD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PERIOD_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
