'use client';

import { useState } from 'react';
import { useTargetStore, useIncentiveStore, Role } from '@/store';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import { formatDate, classNames } from '@/lib/utils';

interface Request {
  id: string;
  type: 'target' | 'calculation';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  period?: string;
  periodType?: 'monthly' | 'quarterly' | 'yearly';
  executiveCount?: number;
  description: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

const MOCK_REQUESTS: Request[] = [
  { id: 'req-1', type: 'target', status: 'pending', submittedAt: '2026-04-01T10:00:00Z', period: 'Q2 2026', periodType: 'quarterly', executiveCount: 4, description: 'Q2 2026 Target Setting Request' },
  { id: 'req-2', type: 'target', status: 'approved', submittedAt: '2026-03-01T09:00:00Z', period: 'March 2026', periodType: 'monthly', executiveCount: 4, description: 'March 2026 Target Setting', reviewedAt: '2026-03-01T12:00:00Z', reviewedBy: 'Admin' },
  { id: 'req-3', type: 'calculation', status: 'approved', submittedAt: '2026-03-31T18:00:00Z', description: 'March 2026 Incentive Calculation', reviewedAt: '2026-03-31T20:00:00Z', reviewedBy: 'Admin' },
];

export function RequestsPage({ role, userId }: { role: Role; userId: string }) {
  const { periods } = useTargetStore();
  const { isCalculationLocked } = useIncentiveStore();
  const [requests] = useState<Request[]>(MOCK_REQUESTS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: Request['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
    }
  };

  const getTypeBadge = (type: Request['type']) => {
    switch (type) {
      case 'target':
        return <Badge variant="info">Target Request</Badge>;
      case 'calculation':
        return <Badge variant="info">Calculation</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Track your submitted requests and their status</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => {
          const count = status === 'all' 
            ? requests.length 
            : requests.filter(r => r.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={classNames(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                filter === status
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Card>
        {filteredRequests.length === 0 ? (
          <EmptyState
            title="No requests found"
            description={filter === 'all' ? "You haven't submitted any requests yet." : `No ${filter} requests.`}
          />
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={classNames(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      request.status === 'pending' ? 'bg-amber-100' :
                      request.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                    )}>
                      {request.type === 'target' ? (
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{request.description}</p>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {getTypeBadge(request.type)}
                        <span className="text-sm text-gray-500">
                          Submitted: {formatDate(request.submittedAt)}
                        </span>
                        {request.executiveCount && (
                          <span className="text-sm text-gray-500">
                            {request.executiveCount} executives
                          </span>
                        )}
                      </div>
                      {request.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">
                            <strong>Rejection Reason:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}
                      {request.reviewedAt && (
                        <p className="text-sm text-gray-400 mt-1">
                          Reviewed {request.status} by {request.reviewedBy} on {formatDate(request.reviewedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <Button size="sm" variant="secondary">Cancel</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Guidelines</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Monthly Targets</p>
              <p className="text-sm text-gray-500">Monthly targets are activated immediately upon save.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 font-bold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Quarterly/Yearly Targets</p>
              <p className="text-sm text-gray-500">These require Admin approval before activation.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-bold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Calculation Trigger</p>
              <p className="text-sm text-gray-500">Incentive calculations require Admin approval before payout.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
