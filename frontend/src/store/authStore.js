import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

/* ── Demo accounts (work without a backend) ─────────────────────────────── */
const DEMO_ACCOUNTS = {
  'user@parfum.com': {
    password: 'User@1234',
    user: {
      id: 'demo-user-001',
      name: 'Priya Sharma',
      email: 'user@parfum.com',
      role: 'user',
      plan: 'free',
      referralCode: 'PRIY4X2K',
      referralCount: 3,
      createdAt: '2024-11-15T10:00:00.000Z',
    },
  },
  'admin@parfum.com': {
    password: 'Admin@1234',
    user: {
      id: 'demo-admin-001',
      name: 'Admin',
      email: 'admin@parfum.com',
      role: 'admin',
      plan: 'pro',
      referralCode: 'ADMN9Z1Q',
      referralCount: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  },
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        // Try real backend first; fall back to demo accounts
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return data;
        } catch (err) {
          // Backend unavailable — check demo accounts
          const demo = DEMO_ACCOUNTS[email.toLowerCase()];
          if (demo && demo.password === password) {
            const token = 'demo-token-' + Date.now();
            localStorage.setItem('token', token);
            set({ user: demo.user, token, isAuthenticated: true });
            return { user: demo.user, token };
          }
          throw err;
        }
      },

      signup: async (name, email, password) => {
        try {
          const { data } = await api.post('/auth/signup', { name, email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return data;
        } catch (err) {
          // Backend unavailable — create a demo session
          if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || !err.response) {
            const newUser = {
              id: 'demo-' + Date.now(),
              name,
              email,
              role: 'user',
              plan: 'free',
              referralCode: name.replace(/\s+/g, '').toUpperCase().slice(0, 4) + Math.random().toString(36).substring(2, 6).toUpperCase(),
              referralCount: 0,
              createdAt: new Date().toISOString(),
            };
            const token = 'demo-token-' + Date.now();
            localStorage.setItem('token', token);
            set({ user: newUser, token, isAuthenticated: true });
            return { user: newUser, token };
          }
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          // Keep demo session alive — don't log out if backend is down
          const token = localStorage.getItem('token');
          if (!token || !get().user) get().logout();
        }
      },
    }),
    {
      name: 'parfum-auth',
      partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAuthStore;
