'use client';

import { useState } from 'react';
import { Modal, Button, Input, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface ManualCollectionEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: {
    amount: number;
    source: string;
    date: string;
    notes?: string;
  }) => void;
  executiveName: string;
  periodStart: string;
  periodEnd: string;
}

const COLLECTION_SOURCES = [
  { value: 'cheque', label: 'Cheque' },
  { value: 'neft', label: 'NEFT Transfer' },
  { value: 'rtgs', label: 'RTGS Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI Payment' },
  { value: 'card', label: 'Card Payment' },
  { value: 'other', label: 'Other' },
];

export function ManualCollectionEntryForm({
  isOpen,
  onClose,
  onSubmit,
  executiveName,
  periodStart,
  periodEnd,
}: ManualCollectionEntryFormProps) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(formatDate(new Date(), 'iso'));
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!source) {
      newErrors.source = 'Collection source is required';
    }
    
    if (!date) {
      newErrors.date = 'Collection date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      amount: parseFloat(amount),
      source,
      date,
      notes: notes.trim() || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setSource('');
    setDate(formatDate(new Date(), 'iso'));
    setNotes('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manual Collection Entry"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Entry
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium">Manual Entry Required</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Collection actuals require manual confirmation. Please verify the source document before entry.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Executive</label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-sm">
              {executiveName}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-sm">
              {formatDate(periodStart)} - {formatDate(periodEnd)}
            </div>
          </div>
        </div>

        <Input
          label="Collection Amount (₹)"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          error={errors.amount}
          min="0"
          step="0.01"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Collection Source <span className="text-red-500">*</span>
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={`
              block w-full rounded-md border-gray-300 shadow-sm
              focus:border-blue-500 focus:ring-blue-500
              ${errors.source ? 'border-red-500' : ''}
            `}
          >
            <option value="">Select source</option>
            {COLLECTION_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.source && (
            <p className="mt-1 text-sm text-red-600">{errors.source}</p>
          )}
        </div>

        <Input
          label="Collection Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source Document Reference <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter payment reference, cheque number, transaction ID, etc."
            className={`
              block w-full rounded-md border-gray-300 shadow-sm
              focus:border-blue-500 focus:ring-blue-500
              ${errors.notes ? 'border-red-500' : ''}
            `}
            rows={3}
          />
          <p className="mt-1 text-sm text-gray-500">
            This reference is mandatory for audit purposes. Entry is immutable once saved.
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Entry Status</span>
            <Badge variant="info">Pending Confirmation</Badge>
          </div>
        </div>
      </div>
    </Modal>
  );
}
