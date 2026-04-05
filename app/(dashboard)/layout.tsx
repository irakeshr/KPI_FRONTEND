'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewDashboard } from '@/components/modules/overview';
import { TargetSettingPage } from '@/components/modules/target-setting';
import { KpiTrackingPage } from '@/components/modules/kpi-tracking';
import { IncentiveEnginePage } from '@/components/modules/incentive';
import { BenchmarkingPage } from '@/components/modules/benchmarking';
import { ReportGenerationPage } from '@/components/modules/reporting';
import { RequestsPage } from '@/components/modules/requests';
import { ApprovalsPage } from '@/components/modules/approvals';
import { AdminManagementPage } from '@/components/modules/admin';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { currentModule, sidebarCollapsed } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const renderModule = () => {
    if (!user) return null;

    switch (currentModule) {
      case 'overview':
        return <OverviewDashboard role={user.role} userId={user.id} />;
      case 'targets':
        return <TargetSettingPage role={user.role} userId={user.id} />;
      case 'tracking':
        return <KpiTrackingPage role={user.role} userId={user.id} />;
      case 'incentives':
        return <IncentiveEnginePage role={user.role} userId={user.id} />;
      case 'benchmarking':
        return <BenchmarkingPage role={user.role} userId={user.id} />;
      case 'reports':
        return <ReportGenerationPage role={user.role} userId={user.id} />;
      case 'requests':
        return <RequestsPage role={user.role} userId={user.id} />;
      case 'approvals':
        return <ApprovalsPage role={user.role} userId={user.id} />;
      case 'admin':
        return <AdminManagementPage role={user.role} userId={user.id} />;
      default:
        return <OverviewDashboard role={user.role} userId={user.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="p-6">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}
