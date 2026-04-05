'use client';

import { useState } from 'react';
import { useTargetStore, useIncentiveStore, Role } from '@/store';
import { Card, Button, Badge, EmptyState, Modal } from '@/components/ui';
import { formatDate, classNames } from '@/lib/utils';

interface PendingRequest {
  id: string;
  type: 'target' | 'calculation';
  submittedBy: string;
  submittedByRole: string;
  submittedAt: string;
  period?: string;
  periodType?: 'monthly' | 'quarterly' | 'yearly';
  executiveCount?: number;
  description: string;
  details?: any;
}

interface PayoutApproval {
  id: string;
  executiveId: string;
  executiveName: string;
  periodId: string;
  periodLabel: string;
  commissionAmount: number;
  slabBonusAmount: number;
  compositeBonusAmount: number;
  totalPayout: number;
  submittedAt: string;
  submittedBy: string;
}

const MOCK_PENDING_REQUESTS: PendingRequest[] = [
  { id: 'req-1', type: 'target', submittedBy: 'Anita Sharma', submittedByRole: 'Manager', submittedAt: '2026-04-01T10:00:00Z', period: 'Q2 2026', periodType: 'quarterly', executiveCount: 4, description: 'Q2 2026 Target Setting Request for Sales Team A' },
  { id: 'req-2', type: 'target', submittedBy: 'Vikram Singh', submittedByRole: 'Manager', submittedAt: '2026-04-02T09:00:00Z', period: '2026', periodType: 'yearly', executiveCount: 8, description: 'Annual Target Setting for North Region' },
];

const MOCK_PAYOUT_APPROVALS: PayoutApproval[] = [
  { id: 'payout-2', executiveId: 'exec-1', executiveName: 'Rahul Sharma', periodId: 'p-2', periodLabel: 'March 2026', commissionAmount: 4500, slabBonusAmount: 8000, compositeBonusAmount: 5000, totalPayout: 17500, submittedAt: '2026-03-31T18:00:00Z', submittedBy: 'Anita Sharma' },
  { id: 'payout-3', executiveId: 'exec-2', executiveName: 'Priya Patel', periodId: 'p-2', periodLabel: 'March 2026', commissionAmount: 5200, slabBonusAmount: 10000, compositeBonusAmount: 6000, totalPayout: 21200, submittedAt: '2026-03-31T18:30:00Z', submittedBy: 'Anita Sharma' },
];

export function ApprovalsPage({ role, userId }: { role: Role; userId: string }) {
  const [activeTab, setActiveTab] = useState<'targets' | 'calculations' | 'payouts'>('targets');
  const [targetRequests] = useState<PendingRequest[]>(MOCK_PENDING_REQUESTS);
  const [payoutApprovals] = useState<PayoutApproval[]>(MOCK_PAYOUT_APPROVALS);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const targetReqs = targetRequests.filter(r => r.type === 'target');
  const calculationReqs = targetRequests.filter(r => r.type === 'calculation');

  const handleApprove = (request: any) => {
    alert(`Approved ${request.description}`);
  };

  const handleReject = () => {
    if (selectedRequest && rejectReason.trim()) {
      alert(`Rejected ${selectedRequest.description}: ${rejectReason}`);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  const handlePayoutApprove = (payout: PayoutApproval) => {
    alert(`Approved payout for ${payout.executiveName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve pending requests from Managers</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning" size="md">
            {targetReqs.length + payoutApprovals.length} Pending
          </Badge>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1">
          {[
            { id: 'targets' as const, label: 'Target Requests', count: targetReqs.length },
            { id: 'calculations' as const, label: 'Calculations', count: calculationReqs.length },
            { id: 'payouts' as const, label: 'Payout Approvals', count: payoutApprovals.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'targets' && (
          <div className="space-y-4">
            {targetReqs.length === 0 ? (
              <Card>
                <EmptyState
                  title="No pending target requests"
                  description="All target requests have been processed."
                />
              </Card>
            ) : (
              targetReqs.map((request) => (
                <Card key={request.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{request.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="info">{request.periodType?.toUpperCase()}</Badge>
                          <span className="text-sm text-gray-500">by {request.submittedBy}</span>
                          <span className="text-sm text-gray-400">{formatDate(request.submittedAt)}</span>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Period</p>
                              <p className="font-medium text-gray-900">{request.period}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Executives</p>
                              <p className="font-medium text-gray-900">{request.executiveCount}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Type</p>
                              <p className="font-medium text-gray-900">New Targets</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="danger"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectModal(true);
                        }}
                      >
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(request)}>
                        Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'calculations' && (
          <Card>
            <EmptyState
              title="No pending calculation requests"
              description="All calculation requests have been processed."
            />
          </Card>
        )}

        {activeTab === 'payouts' && (
          <div className="space-y-4">
            {payoutApprovals.length === 0 ? (
              <Card>
                <EmptyState
                  title="No pending payout approvals"
                  description="All payout approvals have been processed."
                />
              </Card>
            ) : (
              payoutApprovals.map((payout) => (
                <Card key={payout.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {payout.executiveName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{payout.executiveName}</p>
                        <p className="text-sm text-gray-500">{payout.periodLabel}</p>
                      </div>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 mb-1">Commission</p>
                      <p className="text-lg font-bold text-gray-900">₹{payout.commissionAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 mb-1">Slab Bonus</p>
                      <p className="text-lg font-bold text-gray-900">₹{payout.slabBonusAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 mb-1">Composite</p>
                      <p className="text-lg font-bold text-gray-900">₹{payout.compositeBonusAmount.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
                      <p className="text-xs text-blue-600 mb-1">Total Payout</p>
                      <p className="text-lg font-bold text-blue-600">₹{payout.totalPayout.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Submitted by {payout.submittedBy} on {formatDate(payout.submittedAt)}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="danger">Reject</Button>
                      <Button size="sm" onClick={() => handlePayoutApprove(payout)}>Approve</Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedRequest(null);
          setRejectReason('');
        }}
        title="Reject Request"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for rejecting this request from <strong>{selectedRequest?.submittedBy}</strong>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter the reason for rejection..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()}>
            Confirm Rejection
          </Button>
        </div>
      </Modal>
    </div>
  );
}
