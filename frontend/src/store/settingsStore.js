import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const useSettingsStore = create(
  persist(
    (set) => ({
      dataSaverEnabled: false,

      setDataSaver: async (enabled) => {
        set({ dataSaverEnabled: enabled });
        try {
          await api.patch('/users/settings', { dataSaverEnabled: enabled });
        } catch {
          // Keep local preference in demo/offline mode
        }
      },

      // Sync from backend after login
      syncFromUser: (user) => {
        if (user?.dataSaverEnabled !== undefined) {
          set({ dataSaverEnabled: user.dataSaverEnabled });
        }
      },
    }),
    { name: 'parfum-settings' }
  )
);

export default useSettingsStore;
