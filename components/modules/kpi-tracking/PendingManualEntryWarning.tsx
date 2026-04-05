'use client';

import { Badge, Button } from '@/components/ui';

interface PendingManualEntryWarningBannerProps {
  pendingCount: number;
  executives: { id: string; name: string }[];
  onViewPending?: () => void;
  onRemindManager?: () => void;
}

export function PendingManualEntryWarningBanner({
  pendingCount,
  executives,
  onViewPending,
  onRemindManager,
}: PendingManualEntryWarningBannerProps) {
  if (pendingCount === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-amber-900">
              Pending Manual Collection Entries
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              <span className="font-medium">{pendingCount}</span> manual collection 
              {pendingCount === 1 ? ' entry is' : ' entries are'} pending confirmation.
              {executives.length > 0 && (
                <> Affected executives: <span className="font-medium">{executives.map(e => e.name).join(', ')}</span></>
              )}
            </p>
            <p className="text-xs text-amber-600 mt-2">
              Incentive calculation will be blocked until all manual entries are confirmed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onRemindManager && (
            <Button size="sm" variant="secondary" onClick={onRemindManager}>
              Remind Manager
            </Button>
          )}
          {onViewPending && (
            <Button size="sm" onClick={onViewPending}>
              View Pending ({pendingCount})
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="warning">Pending</Badge>
          <span className="text-sm text-amber-700">
            Requires Manager confirmation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span className="text-sm text-amber-700">
            Updated 5 minutes ago
          </span>
        </div>
      </div>
    </div>
  );
}

interface ManualEntryPendingItemProps {
  executive: { id: string; name: string; teamName: string };
  pendingSince: string;
  amount: number;
  source: string;
  onConfirm?: () => void;
}

export function ManualEntryPendingItem({
  executive,
  pendingSince,
  amount,
  source,
  onConfirm,
}: ManualEntryPendingItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-900">{executive.name}</p>
          <p className="text-sm text-gray-500">
            {executive.teamName} • Pending since {pendingSince}
          </p>
          <p className="text-sm text-gray-500">
            ₹{amount.toLocaleString()} • {source}
          </p>
        </div>
      </div>
      {onConfirm && (
        <Button size="sm" onClick={onConfirm}>
          Confirm Entry
        </Button>
      )}
    </div>
  );
}
