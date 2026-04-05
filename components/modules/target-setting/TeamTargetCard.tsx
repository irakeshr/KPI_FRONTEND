'use client';

import { useState } from 'react';
import { Target, Executive, AuditLog } from '@/types';
import { KPI_CATALOG } from '@/lib/constants';
import { Card, Button, Input, Modal, Badge, Table, TableRow, TableCell } from '@/components/ui';
import { formatDate, formatAttainment, sum, classNames } from '@/lib/utils';

interface TeamTargetCardProps {
  teamId: string;
  teamName: string;
  managerId: string;
  periodStart: string;
  periodEnd: string;
  executives: Executive[];
  teamTargets: Target[];
  onOverride: (kpiId: string, newTeamTarget: number, reason: string) => void;
  auditLogs?: AuditLog[];
  canOverride?: boolean;
}

export function TeamTargetCard({
  teamId,
  teamName,
  managerId,
  periodStart,
  periodEnd,
  executives,
  teamTargets,
  onOverride,
  auditLogs = [],
  canOverride = true,
}: TeamTargetCardProps) {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedKpiId, setSelectedKpiId] = useState('');
  const [newTeamTarget, setNewTeamTarget] = useState(0);
  const [overrideReason, setOverrideReason] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);

  const teamTargetByKpi = teamTargets.reduce((acc, t) => {
    if (!acc[t.kpiId]) {
      acc[t.kpiId] = {
        kpiId: t.kpiId,
        kpiName: t.kpiName,
        autoSum: 0,
        teamTarget: t.teamTarget || 0,
        isOverridden: t.isOverridden || false,
        members: [],
      };
    }
    acc[t.kpiId].autoSum += t.targetValue;
    acc[t.kpiId].members.push({
      executiveId: t.executiveId,
      executiveName: t.executiveName,
      target: t.targetValue,
    });
    return acc;
  }, {} as Record<string, {
    kpiId: string;
    kpiName: string;
    autoSum: number;
    teamTarget: number;
    isOverridden: boolean;
    members: { executiveId: string; executiveName: string; target: number }[];
  }>);

  const handleOverride = () => {
    if (selectedKpiId && newTeamTarget >= 0 && overrideReason.trim()) {
      onOverride(selectedKpiId, newTeamTarget, overrideReason);
      setShowOverrideModal(false);
      setSelectedKpiId('');
      setNewTeamTarget(0);
      setOverrideReason('');
    }
  };

  const selectedKpi = selectedKpiId ? KPI_CATALOG.find(k => k.id === selectedKpiId) : null;
  const kpiData = selectedKpiId ? teamTargetByKpi[selectedKpiId] : null;

  const getKpiLogs = (kpiId: string) =>
    auditLogs.filter(log => log.entityType === 'target' && log.entityId.includes(kpiId));

  return (
    <>
      <Card
        title={`Team Target: ${teamName}`}
        subtitle={`${formatDate(periodStart)} - ${formatDate(periodEnd)}`}
        headerAction={
          <div className="flex gap-2">
            {canOverride && (
              <Button size="sm" onClick={() => setShowOverrideModal(true)}>
                Override Team Target
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAuditLog(true)}
            >
              View Audit Log
            </Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <Table headers={['KPI', 'Auto-Sum', 'Team Target', 'Variance', 'Status', 'Members']}>
            {Object.values(teamTargetByKpi).map((data) => {
              const kpi = KPI_CATALOG.find(k => k.id === data.kpiId);
              const variance = data.teamTarget - data.autoSum;
              const variancePercent = data.autoSum > 0 
                ? ((variance / data.autoSum) * 100).toFixed(1)
                : '0';

              return (
                <TableRow key={data.kpiId}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{data.kpiName}</span>
                      <Badge size="sm" className="ml-2" variant="default">
                        {kpi?.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{kpi?.unit}</span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {data.autoSum.toLocaleString()}
                    {kpi?.unit === '%' && '%'}
                  </TableCell>
                  <TableCell className={classNames(
                    'font-medium',
                    data.isOverridden ? 'text-blue-600' : 'text-gray-900'
                  )}>
                    {data.teamTarget.toLocaleString()}
                    {kpi?.unit === '%' && '%'}
                    {data.isOverridden && (
                      <span className="ml-1 text-xs text-blue-600">(overridden)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={classNames(
                      'font-medium',
                      variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : 'text-gray-600'
                    )}>
                      {variance >= 0 ? '+' : ''}{variance.toLocaleString()} ({variancePercent}%)
                    </span>
                  </TableCell>
                  <TableCell>
                    {data.isOverridden ? (
                      <Badge variant="info">Overridden</Badge>
                    ) : (
                      <Badge variant="success">Auto-Sum</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => {
                        setSelectedKpiId(data.kpiId);
                        setShowOverrideModal(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View {data.members.length} members
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Team Members</span>
              <p className="font-medium">{executives.length}</p>
            </div>
            <div>
              <span className="text-gray-500">KPIs Assigned</span>
              <p className="font-medium">{Object.keys(teamTargetByKpi).length}</p>
            </div>
            <div>
              <span className="text-gray-500">Total Auto-Sum Target</span>
              <p className="font-medium">
                {sum(Object.values(teamTargetByKpi).map(d => d.autoSum)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showOverrideModal}
        onClose={() => {
          setShowOverrideModal(false);
          setSelectedKpiId('');
        }}
        title={selectedKpiId ? `Team Target - ${selectedKpi?.name}` : 'Override Team Target'}
        size="lg"
        footer={
          selectedKpiId && kpiData && (
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowOverrideModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleOverride}>
                Save Override
              </Button>
            </div>
          )
        }
      >
        {!selectedKpiId ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-4">
              Select a KPI to override its team target:
            </p>
            {Object.values(teamTargetByKpi).map((data) => (
              <button
                key={data.kpiId}
                onClick={() => setSelectedKpiId(data.kpiId)}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="font-medium">{data.kpiName}</span>
                <span className="ml-4 text-sm text-gray-500">
                  Auto-Sum: {data.autoSum} | Current: {data.teamTarget}
                </span>
              </button>
            ))}
          </div>
        ) : kpiData ? (
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Overriding will log the change for audit purposes. The individual targets will not be affected.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  KPI
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-md">
                  {kpiData.kpiName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Auto-Sum
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-md font-medium">
                  {kpiData.autoSum.toLocaleString()}
                  {selectedKpi?.unit === '%' && '%'}
                </div>
              </div>
            </div>

            <Input
              label="New Team Target"
              type="number"
              value={newTeamTarget}
              onChange={(e) => setNewTeamTarget(parseFloat(e.target.value) || 0)}
              hint={`Current: ${kpiData.teamTarget}`}
            />

            <Input
              label="Override Reason"
              placeholder="Enter reason for override..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
            />

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members & Targets</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Executive</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Target</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kpiData.members.map((member) => (
                      <tr key={member.executiveId}>
                        <td className="px-4 py-2 text-sm">{member.executiveName}</td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {member.target.toLocaleString()}
                          {selectedKpi?.unit === '%' && '%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={showAuditLog}
        onClose={() => setShowAuditLog(false)}
        title="Audit Log"
        size="lg"
      >
        {auditLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No audit logs available.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{log.action}</span>
                    <p className="text-sm text-gray-600">
                      by {log.userName} on {formatDate(log.timestamp)}
                    </p>
                  </div>
                  <Badge variant="default">{log.entityType}</Badge>
                </div>
                {log.reason && (
                  <p className="mt-2 text-sm text-gray-700">
                    <strong>Reason:</strong> {log.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
