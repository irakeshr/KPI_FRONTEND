'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { classNames } from '@/lib/utils';
import { Settings, Save, RotateCcw, Eye } from 'lucide-react';

interface TrafficLightThresholds {
  red: number;
  amber: number;
}

interface RoleThresholds {
  [role: string]: TrafficLightThresholds;
}

interface TrafficLightConfiguratorProps {
  initialThresholds?: RoleThresholds;
  onSave?: (thresholds: RoleThresholds) => void;
}

const DEFAULT_THRESHOLDS: RoleThresholds = {
  Executive: { red: 60, amber: 89 },
  Manager: { red: 50, amber: 85 },
  Franchisee: { red: 55, amber: 80 },
  Admin: { red: 50, amber: 85 },
};

const ROLES = ['Executive', 'Manager', 'Franchisee', 'Admin'];

export function TrafficLightConfigurator({
  initialThresholds = DEFAULT_THRESHOLDS,
  onSave,
}: TrafficLightConfiguratorProps) {
  const [thresholds, setThresholds] = useState<RoleThresholds>(initialThresholds);
  const [selectedRole, setSelectedRole] = useState<string>('Executive');
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleRedChange = (value: number) => {
    setThresholds(prev => ({
      ...prev,
      [selectedRole]: { ...prev[selectedRole], red: value },
    }));
    setHasChanges(true);
  };

  const handleAmberChange = (value: number) => {
    setThresholds(prev => ({
      ...prev,
      [selectedRole]: { ...prev[selectedRole], amber: value },
    }));
    setHasChanges(true);
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(thresholds);
    setHasChanges(false);
  };

  const currentThreshold = thresholds[selectedRole];
  const isValidRange = currentThreshold.red < currentThreshold.amber;

  const getPreviewColor = (attainment: number) => {
    if (attainment >= currentThreshold.amber) return 'bg-green-100 text-green-800 border-green-300';
    if (attainment >= currentThreshold.red) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Traffic Light Configuration</h3>
          <Badge variant="info">Admin Only</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Hide Preview' : 'Preview'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || !isValidRange}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Select Role</h4>
          <div className="space-y-2">
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={classNames(
                  'w-full px-4 py-3 text-left rounded-lg border transition-colors',
                  selectedRole === role
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                )}
              >
                <span className="font-medium">{role}</span>
                {role === 'Admin' && (
                  <span className="block text-xs text-gray-500">Can configure all roles</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Configure Thresholds for {selectedRole}
          </h4>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-600">
                  Red Threshold (below this = Red)
                </label>
                <span className="text-sm font-medium text-red-600">
                  Below {currentThreshold.red}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentThreshold.red}
                onChange={(e) => handleRedChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-600">
                  Amber Threshold (below red = Amber)
                </label>
                <span className="text-sm font-medium text-yellow-600">
                  {currentThreshold.red}% - {currentThreshold.amber}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentThreshold.amber}
                onChange={(e) => handleAmberChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {!isValidRange && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ Red threshold must be less than Amber threshold
                </p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Summary:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    Red
                  </span>
                  {' '}Below {currentThreshold.red}%
                </li>
                <li>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Amber
                  </span>
                  {' '}{currentThreshold.red}% to {currentThreshold.amber}%
                </li>
                <li>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Green
                  </span>
                  {' '}{currentThreshold.amber}% and above
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <h4 className="text-sm font-medium text-gray-700 mb-3">All Roles</h4>
          <div className="space-y-3">
            {ROLES.map(role => (
              <div key={role} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{role}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-red-600">Red: &lt;{thresholds[role].red}%</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-yellow-600">Amber: {thresholds[role].red}-{thresholds[role].amber}%</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-green-600">Green: ≥{thresholds[role].amber}%</span>
                </div>
              </div>
            ))}
          </div>

          {previewMode && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Preview for {selectedRole}</h4>
              <div className="space-y-2">
                {[95, 75, 55].map(val => (
                  <div key={val} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{val}% attainment</span>
                    <span className={classNames(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                      getPreviewColor(val)
                    )}>
                      {val >= currentThreshold.amber ? 'Green' : val >= currentThreshold.red ? 'Amber' : 'Red'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}