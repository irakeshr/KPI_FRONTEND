'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/types';
import { classNames } from '@/lib/utils';

interface SidebarProps {
  role: Role;
  collapsed?: boolean;
  onToggle?: () => void;
}

const NAV_ITEMS = {
  Admin: [
    { href: '/admin/overview', label: 'Overview', icon: DashboardIcon },
    { href: '/admin/target-setting', label: 'Target Setting', icon: TargetIcon },
    { href: '/admin/kpi-tracking', label: 'KPI Tracking', icon: KpiIcon },
    { href: '/admin/incentive', label: 'Incentive Engine', icon: IncentiveIcon },
    { href: '/admin/benchmarking', label: 'Benchmarking', icon: BenchmarkIcon },
    { href: '/admin/reports', label: 'Reports', icon: ReportIcon },
    { href: '/admin/approval-queue', label: 'Approval Queue', icon: ApprovalIcon },
    { href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
  ],
  Franchisee: [
    { href: '/franchisee/overview', label: 'Overview', icon: DashboardIcon },
    { href: '/franchisee/benchmarking', label: 'Benchmarking', icon: BenchmarkIcon },
    { href: '/franchisee/reports', label: 'Reports', icon: ReportIcon },
  ],
  Manager: [
    { href: '/manager/overview', label: 'Overview', icon: DashboardIcon },
    { href: '/manager/target-setting', label: 'Target Setting', icon: TargetIcon },
    { href: '/manager/kpi-tracking', label: 'KPI Tracking', icon: KpiIcon },
    { href: '/manager/incentive', label: 'Incentive Engine', icon: IncentiveIcon },
    { href: '/manager/benchmarking', label: 'Benchmarking', icon: BenchmarkIcon },
    { href: '/manager/reports', label: 'Reports', icon: ReportIcon },
  ],
  Executive: [
    { href: '/executive/overview', label: 'Overview', icon: DashboardIcon },
    { href: '/executive/kpi-tracking', label: 'My KPIs', icon: KpiIcon },
    { href: '/executive/incentive', label: 'My Incentive', icon: IncentiveIcon },
    { href: '/executive/reports', label: 'Reports', icon: ReportIcon },
  ],
};

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function KpiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IncentiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BenchmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

function ReportIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ApprovalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#2563EB" />
      <path d="M12 28V12h6.5c2.5 0 4 1.5 4 4s-1.5 4-4 4H15.5v8H12zm3.5-12h3c1 0 1.5-.5 1.5-1.5S20 13 19 13h-3.5v3z" fill="white" />
      <path d="M24 28V12h3.5v16H24z" fill="white" />
    </svg>
  );
}

export function Sidebar({ role, collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] || [];

  return (
    <aside
      className={classNames(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <LogoIcon className="w-8 h-8 flex-shrink-0" />
        {!collapsed && (
          <span className="ml-3 font-bold text-gray-900">Bizpole ONE</span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-2 rounded-md hover:bg-gray-100 lg:block hidden"
        >
          <MenuIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={classNames(
                'flex items-center px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

interface HeaderProps {
  user: {
    name: string;
    role: Role;
    franchiseeName?: string;
    teamName?: string;
  };
  currentPeriod: {
    label: string;
    type: string;
  };
  onPeriodChange?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
}

export function Header({
  user,
  currentPeriod,
  onPeriodChange,
  onNotificationClick,
  notificationCount = 0,
}: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onPeriodChange}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{currentPeriod.label}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <span className="text-sm text-gray-500">{currentPeriod.type}</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onNotificationClick}
          className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-medium text-sm">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    role: Role;
    franchiseeName?: string;
    teamName?: string;
  };
  currentPeriod: {
    label: string;
    type: string;
  };
}

export function AppShell({ children, user, currentPeriod }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        role={user.role}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={classNames(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Header
          user={user}
          currentPeriod={currentPeriod}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
