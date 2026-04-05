'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { KPI_CATALOG } from '@/lib/constants';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newValue: number, reason: string) => void;
  target: any | null;
}

export function RevisionModal({ isOpen, onClose, onSave, target }: RevisionModalProps) {
  const [newValue, setNewValue] = useState(target?.targetValue || 0);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!target) return null;

  const kpi = KPI_CATALOG.find(k => k.id === target.kpiId);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (newValue <= 0) {
      newErrors.value = 'Target value must be greater than 0';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Revision reason is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(newValue, reason);
    setNewValue(target.targetValue);
    setReason('');
    setErrors({});
  };

  const handleClose = () => {
    setNewValue(target.targetValue);
    setReason('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Revise Target: ${target.kpiName}`}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Confirm Revision
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Mid-Period Revision</p>
              <p className="text-xs text-amber-700 mt-1">A mandatory reason is required for audit purposes.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Executive</p>
            <p className="font-medium text-gray-900">{target.executiveName}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Target</p>
            <p className="font-medium text-gray-900">
              {target.targetValue.toLocaleString()}{kpi?.unit === '%' ? '%' : ''}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            New Target Value {kpi?.unit === '%' && '(%)'}
          </label>
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
              errors.value ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.value && <p className="text-sm text-red-500 mt-1">{errors.value}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Revision Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${
              errors.reason ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Explain why this target is being revised..."
          />
          {errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason}</p>}
        </div>

        {newValue !== target.targetValue && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Change:</strong> {target.targetValue} → {newValue}{kpi?.unit === '%' ? '%' : ''}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
