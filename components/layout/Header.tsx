'use client';

import { useAuthStore, useUIStore } from '@/store';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

const MODULE_TITLES: Record<string, { title: string; description: string }> = {
  overview: { title: 'Dashboard', description: 'KPI Performance Overview' },
  targets: { title: 'Target Setting', description: 'Set and manage KPI targets for your team' },
  tracking: { title: 'KPI Tracking', description: 'Monitor actual performance against targets' },
  incentives: { title: 'Incentive Engine', description: 'Configure commissions and bonuses' },
  benchmarking: { title: 'Benchmarking Dashboard', description: 'Compare performance across team members' },
  reports: { title: 'Report Generation', description: 'Generate and export performance reports' },
  requests: { title: 'My Requests', description: 'Track your submitted requests and their status' },
  approvals: { title: 'Approvals', description: 'Review and approve pending requests from Managers' },
  admin: { title: 'User Management', description: 'Manage executives and managers across organization' },
};

export function Header() {
  const { user } = useAuthStore();
  const { currentModule, sidebarCollapsed } = useUIStore();

  const moduleInfo = MODULE_TITLES[currentModule] || { title: 'Dashboard', description: '' };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6 transition-all duration-300 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{moduleInfo.title}</h1>
        <p className="text-sm text-gray-500">{moduleInfo.description}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <Calendar className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">April 2026</span>
        </div>

        {user && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatDate(new Date().toISOString())}</span>
          </div>
        )}
      </div>
    </header>
  );
}
