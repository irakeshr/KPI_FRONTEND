'use client';

import { useAuthStore, useUIStore } from '@/store';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Target, TrendingUp, Wallet, BarChart3, FileText, 
  Send, CheckCircle, ChevronLeft, ChevronRight, LogOut, User,
  Users
} from 'lucide-react';
import { classNames } from '@/lib/utils';
import { useEffect } from 'react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/overview',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['Admin', 'Franchisee', 'Manager', 'Executive'],
  },
  {
    id: 'targets',
    label: 'Target Setting',
    path: '/targets',
    icon: <Target className="w-5 h-5" />,
    roles: ['Admin', 'Manager'],
  },
  {
    id: 'tracking',
    label: 'KPI Tracking',
    path: '/tracking',
    icon: <TrendingUp className="w-5 h-5" />,
    roles: ['Admin', 'Franchisee', 'Manager', 'Executive'],
  },
  {
    id: 'incentives',
    label: 'Incentive Engine',
    path: '/incentives',
    icon: <Wallet className="w-5 h-5" />,
    roles: ['Admin', 'Manager'],
  },
  {
    id: 'benchmarking',
    label: 'Benchmarking',
    path: '/benchmarking',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['Admin', 'Franchisee', 'Manager'],
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: <FileText className="w-5 h-5" />,
    roles: ['Admin', 'Franchisee', 'Manager', 'Executive'],
  },
  {
    id: 'requests',
    label: 'My Requests',
    path: '/requests',
    icon: <Send className="w-5 h-5" />,
    roles: ['Manager'],
  },
  {
    id: 'approvals',
    label: 'Approvals',
    path: '/approvals',
    icon: <CheckCircle className="w-5 h-5" />,
    roles: ['Admin'],
  },
  {
    id: 'admin',
    label: 'User Management',
    path: '/admin',
    icon: <Users className="w-5 h-5" />,
    roles: ['Admin'],
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const visibleNavItems = navItems.filter((item) =>
    user && item.roles.includes(user.role)
  );

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <aside
      className={classNames(
        'fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 z-40 flex flex-col',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-white font-bold text-lg truncate">Bizpole ONE</h1>
              <p className="text-slate-400 text-xs">KPI Module</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={classNames(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!sidebarCollapsed && (
              <span className="font-medium truncate">{item.label}</span>
            )}
            {item.badge && item.badge > 0 && !sidebarCollapsed && (
              <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {item.badge}
              </span>
            )}
            {isActive(item.path) && !sidebarCollapsed && (
              <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>

        {user && (
          <div className={classNames(
            'flex items-center gap-3',
            sidebarCollapsed && 'justify-center'
          )}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-slate-400 text-xs truncate">{user.role}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={logout}
          className={classNames(
            'w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!sidebarCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
