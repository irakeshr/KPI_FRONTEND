'use client';

import { useState } from 'react';
import { Card, Button, Badge, Modal, Input } from '@/components/ui';
import { formatDate, classNames } from '@/lib/utils';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

interface PayoutRecord {
  id: string;
  executiveId: string;
  executiveName: string;
  teamName: string;
  franchiseeName: string;
  period: string;
  commissionAmount: number;
  slabBonuses: number;
  compositeBonus: number;
  totalAmount: number;
  calculatedAt: string;
  calculatedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface ApprovalQueueProps {
  payouts: PayoutRecord[];
  onApprove: (payoutId: string) => void;
  onReject: (payoutId: string, reason: string) => void;
  onViewDetails: (payout: PayoutRecord) => void;
}

export function ApprovalQueue({
  payouts,
  onApprove,
  onReject,
  onViewDetails,
}: ApprovalQueueProps) {
  const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const filteredPayouts = payouts.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const pendingCount = payouts.filter(p => p.status === 'pending').length;

  const handleReject = () => {
    if (selectedPayout && rejectionReason.trim()) {
      onReject(selectedPayout.id, rejectionReason);
      setShowRejectModal(false);
      setSelectedPayout(null);
      setRejectionReason('');
    }
  };

  const getStatusBadge = (status: PayoutRecord['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
    }
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Payout Approval Queue</h3>
            <p className="text-sm text-gray-500">
              {pendingCount} pending approval{pendingCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={classNames(
                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                  filter === f
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filteredPayouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {filter === 'pending' ? 'No pending payouts to approve' : 'No payouts found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPayouts.map((payout) => (
              <div
                key={payout.id}
                className={classNames(
                  'p-4 border rounded-lg transition-all',
                  payout.status === 'pending' ? 'bg-white border-amber-200 hover:border-amber-300' :
                  payout.status === 'approved' ? 'bg-green-50 border-green-200' :
                  'bg-red-50 border-red-200'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{payout.executiveName}</h4>
                      {getStatusBadge(payout.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block">Team</span>
                        <span className="font-medium">{payout.teamName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Franchisee</span>
                        <span className="font-medium">{payout.franchiseeName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Period</span>
                        <span className="font-medium">{payout.period}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Total Amount</span>
                        <span className="font-bold text-lg text-gray-900">
                          ₹{payout.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>Calculated: {formatDate(payout.calculatedAt)} by {payout.calculatedBy}</span>
                      {payout.approvedAt && (
                        <span>Approved: {formatDate(payout.approvedAt)} by {payout.approvedBy}</span>
                      )}
                      {payout.rejectionReason && (
                        <span className="text-red-600">Reason: {payout.rejectionReason}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails(payout)}
                    >
                      Details
                    </Button>
                    {payout.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedPayout(payout);
                            setShowRejectModal(true);
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApprove(payout.id)}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedPayout(null);
          setRejectionReason('');
        }}
        title="Reject Payout"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={!rejectionReason.trim()}>
              Reject Payout
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedPayout && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <strong>Executive:</strong> {selectedPayout.executiveName}
              </p>
              <p className="text-sm">
                <strong>Period:</strong> {selectedPayout.period}
              </p>
              <p className="text-sm">
                <strong>Amount:</strong> ₹{selectedPayout.totalAmount.toLocaleString()}
              </p>
            </div>
          )}
          <Input
            label="Rejection Reason (Required)"
            placeholder="Enter reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            The manager will be notified of the rejection. They can make corrections and resubmit.
          </p>
        </div>
      </Modal>
    </>
  );
}
