import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

/* ── Demo accounts — only active when backend is unreachable ─────────────── */
const DEMO_ACCOUNTS = {
  'user@jraphstreach.com': {
    password: 'User@1234',
    user: {
      id: 'demo-user-001',
      name: 'Priya Sharma',
      email: 'user@jraphstreach.com',
      role: 'user',
      referralCode: 'PRIY4X2K',
      referralCount: 3,
      createdAt: '2024-11-15T10:00:00.000Z',
    },
  },
  'admin@jraphstreach.com': {
    password: 'Admin@1234',
    user: {
      id: 'demo-admin-001',
      name: 'Admin',
      email: 'admin@jraphstreach.com',
      role: 'admin',
      referralCode: 'ADMN9Z1Q',
      referralCount: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  },
};

const isDemoToken = (token) => typeof token === 'string' && token.startsWith('demo-token-');

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return data;
        } catch (err) {
          // Demo fallback only when backend is genuinely unreachable
          const isNetworkError = !err.response;
          if (isNetworkError) {
            const demo = DEMO_ACCOUNTS[email.toLowerCase()];
            if (demo && demo.password === password) {
              const token = 'demo-token-' + Date.now();
              localStorage.setItem('token', token);
              set({ user: demo.user, token, isAuthenticated: true });
              return { user: demo.user, token };
            }
          }
          throw err;
        }
      },

      signup: async (formData) => {
        // formData: { firstName, lastName, email, password, confirmPassword, phoneNumber, country, referralCode }
        try {
          const { data } = await api.post('/auth/signup', formData);
          localStorage.setItem('token', data.token);
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return data;
        } catch (err) {
          // Demo fallback only when backend is unreachable
          if (!err.response) {
            const name = `${formData.firstName} ${formData.lastName}`.trim();
            const newUser = {
              id: 'demo-' + Date.now(),
              name,
              firstName:   formData.firstName,
              lastName:    formData.lastName,
              email:       formData.email,
              phoneNumber: formData.phoneNumber || '',
              country:     formData.country || '',
              role: 'user',
              referralCode: (formData.firstName.slice(0, 4)).toUpperCase() +
                Math.random().toString(36).substring(2, 6).toUpperCase(),
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
        const token = localStorage.getItem('token');
        // Keep demo sessions alive without hitting the backend
        if (isDemoToken(token)) return;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          if (!token || !get().user) get().logout();
        }
      },
    }),
    {
      name: 'jrs-auth',
      partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAuthStore;
