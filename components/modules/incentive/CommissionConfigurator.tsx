'use client';

import { useState } from 'react';
import { Card, Button, Input, Modal } from '@/components/ui';
import { DollarSign, Wallet } from 'lucide-react';

interface CommissionConfig {
  salesPercent: number;
  collectionPercent: number;
}

interface CommissionConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: CommissionConfig) => void;
  currentConfig: CommissionConfig;
  canEdit?: boolean;
}

export function CommissionConfigurator({
  isOpen,
  onClose,
  onSave,
  currentConfig,
  canEdit = true,
}: CommissionConfiguratorProps) {
  const [config, setConfig] = useState<CommissionConfig>(currentConfig);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (config.salesPercent < 0 || config.salesPercent > 100) {
      newErrors.sales = 'Commission must be between 0% and 100%';
    }
    if (config.collectionPercent < 0 || config.collectionPercent > 100) {
      newErrors.collection = 'Commission must be between 0% and 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(config);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commission Configuration"
      size="md"
      footer={
        canEdit && (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Commission</strong> is calculated as a percentage of actual value achieved. 
            This is always calculated independently of slab bonuses.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Sales Commission</h4>
                <p className="text-xs text-green-700">Applied to Sales KPI actual value</p>
              </div>
            </div>
            <Input
              label="Commission Rate (%)"
              type="number"
              value={config.salesPercent}
              onChange={(e) => setConfig(prev => ({ ...prev, salesPercent: parseFloat(e.target.value) || 0 }))}
              disabled={!canEdit}
              error={errors.sales}
              hint="Percentage of total sales achieved"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900">Collection Commission</h4>
                <p className="text-xs text-purple-700">Applied to Collection KPI actual value</p>
              </div>
            </div>
            <Input
              label="Commission Rate (%)"
              type="number"
              value={config.collectionPercent}
              onChange={(e) => setConfig(prev => ({ ...prev, collectionPercent: parseFloat(e.target.value) || 0 }))}
              disabled={!canEdit}
              error={errors.collection}
              hint="Percentage of total collections received"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Commission Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sales Commission Formula:</span>
              <span className="font-medium">(Sales Actual × {config.salesPercent}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Collection Commission Formula:</span>
              <span className="font-medium">(Collection Actual × {config.collectionPercent}%)</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
