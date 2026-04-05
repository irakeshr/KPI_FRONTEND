'use client';

import { useState } from 'react';
import { Franchisee, Team, Target } from '@/types';
import { KPI_CATALOG } from '@/lib/constants';
import { Card, Button, Select, Modal, Table, TableRow, TableCell, Badge } from '@/components/ui';
import { formatDate, classNames } from '@/lib/utils';

interface AdminOverrideInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  franchisees: Franchisee[];
  teams: Team[];
  crossFranchiseeTargets: Target[];
  onOverride: (targetId: string, newValue: number, reason: string) => void;
}

export function AdminOverrideInterface({
  isOpen,
  onClose,
  franchisees,
  teams,
  crossFranchiseeTargets,
  onOverride,
}: AdminOverrideInterfaceProps) {
  const [selectedFranchisee, setSelectedFranchisee] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [newValue, setNewValue] = useState(0);
  const [overrideReason, setOverrideReason] = useState('');

  const filteredTargets = crossFranchiseeTargets.filter(t => {
    const team = teams.find(tm => tm.id === t.executiveId);
    const franchisee = franchisees.find(f => 
      teams.find(tm => tm.franchiseeId === f.id)
    );
    
    if (selectedFranchisee && team?.franchiseeId !== selectedFranchisee) return false;
    if (selectedTeam && team?.id !== selectedTeam) return false;
    return true;
  });

  const groupedByFranchisee = filteredTargets.reduce((acc, target) => {
    const team = teams.find(t => t.id === target.executiveId);
    const franchiseeId = team?.franchiseeId || 'unknown';
    
    if (!acc[franchiseeId]) {
      acc[franchiseeId] = [];
    }
    acc[franchiseeId].push(target);
    return acc;
  }, {} as Record<string, Target[]>);

  const handleOverride = () => {
    if (editingTarget && overrideReason.trim()) {
      onOverride(editingTarget.id, newValue, overrideReason);
      setEditingTarget(null);
      setNewValue(0);
      setOverrideReason('');
    }
  };

  const franchiseeOptions = [
    { value: '', label: 'All Franchisees' },
    ...franchisees.map(f => ({ value: f.id, label: f.name })),
  ];

  const teamOptions = [
    { value: '', label: 'All Teams' },
    ...teams
      .filter(t => !selectedFranchisee || t.franchiseeId === selectedFranchisee)
      .map(t => ({ value: t.id, label: t.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admin Override Interface"
      size="xl"
      footer={
        editingTarget && (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditingTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleOverride} disabled={!overrideReason.trim()}>
              Apply Override
            </Button>
          </div>
        )
      }
    >
      {editingTarget ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900">Override Target</h4>
            <p className="text-sm text-blue-700 mt-1">
              {editingTarget.executiveName} - {editingTarget.kpiName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md">
                {editingTarget.targetValue.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Value</label>
              <input
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Override Reason</label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Enter reason for cross-franchisee override..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            <div className="w-48">
              <Select
                label="Franchisee"
                options={franchiseeOptions}
                value={selectedFranchisee}
                onChange={(e) => {
                  setSelectedFranchisee(e.target.value);
                  setSelectedTeam('');
                }}
              />
            </div>
            <div className="w-48">
              <Select
                label="Team"
                options={teamOptions}
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              />
            </div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Admin overrides affect all targets across franchisees. Use sparingly and always provide a reason.
            </p>
          </div>

          {Object.keys(groupedByFranchisee).length === 0 ? (
            <p className="text-center text-gray-500 py-8">No targets found with current filters.</p>
          ) : (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {Object.entries(groupedByFranchisee).map(([franchiseeId, targets]) => {
                const franchisee = franchisees.find(f => f.id === franchiseeId);
                return (
                  <div key={franchiseeId}>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {franchisee?.name || 'Unknown Franchisee'}
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table headers={['Executive', 'KPI', 'Period', 'Target', 'Status', 'Action']}>
                        {targets.map((target) => (
                          <TableRow key={target.id}>
                            <TableCell className="font-medium">{target.executiveName}</TableCell>
                            <TableCell>{target.kpiName}</TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDate(target.periodStart)} - {formatDate(target.periodEnd)}
                            </TableCell>
                            <TableCell className="font-medium">
                              {target.targetValue.toLocaleString()}
                              {KPI_CATALOG.find(k => k.id === target.kpiId)?.unit === '%' && '%'}
                            </TableCell>
                            <TableCell>
                              {target.isOverridden ? (
                                <Badge variant="info">Overridden</Badge>
                              ) : (
                                <Badge variant="success">Active</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTarget(target);
                                  setNewValue(target.targetValue);
                                }}
                              >
                                Override
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </Table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
