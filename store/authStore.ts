'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'Admin' | 'Franchisee' | 'Manager' | 'Executive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId: string;
  teamName: string;
  franchiseeId: string;
  franchiseeName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const MOCK_USERS: Record<string, User & { password: string }> = {
  'admin@bizpole.com': {
    id: 'admin-1',
    name: 'Vikram Singh',
    email: 'admin@bizpole.com',
    password: 'admin123',
    role: 'Admin',
    teamId: 'all',
    teamName: 'All Teams',
    franchiseeId: 'all',
    franchiseeName: 'All Franchisees',
  },
  'franchisee@bizpole.com': {
    id: 'fr-1',
    name: 'Rajesh Kumar',
    email: 'franchisee@bizpole.com',
    password: 'franchisee123',
    role: 'Franchisee',
    teamId: 'all',
    teamName: 'North Region',
    franchiseeId: 'fr-1',
    franchiseeName: 'North Region',
  },
  'manager@bizpole.com': {
    id: 'mgr-1',
    name: 'Anita Sharma',
    email: 'manager@bizpole.com',
    password: 'manager123',
    role: 'Manager',
    teamId: 'team-1',
    teamName: 'Sales Team A',
    franchiseeId: 'fr-1',
    franchiseeName: 'North Region',
  },
  'executive@bizpole.com': {
    id: 'exec-1',
    name: 'Rahul Sharma',
    email: 'executive@bizpole.com',
    password: 'exec123',
    role: 'Executive',
    teamId: 'team-1',
    teamName: 'Sales Team A',
    franchiseeId: 'fr-1',
    franchiseeName: 'North Region',
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const mockUser = MOCK_USERS[email.toLowerCase()];
          if (mockUser && mockUser.password === password) {
            const { password: _, ...user } = mockUser;
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          }
          
          set({ isLoading: false, error: 'Invalid email or password' });
          return false;
        } catch (error) {
          set({ isLoading: false, error: 'An error occurred during login' });
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'kpi-auth',
    }
  )
);
