import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      // items: array of product objects (for demo/offline) or just IDs (for logged-in)
      items: [],
      isLoading: false,

      // ── Hydrate from backend ───────────────────────────────────────────────
      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get('/wishlist');
          set({ items: data.wishlist, isLoading: false });
        } catch {
          // Keep localStorage items if offline (demo mode)
          set({ isLoading: false });
        }
      },

      // ── Add ───────────────────────────────────────────────────────────────
      addToWishlist: async (product) => {
        // Optimistic update
        const existing = get().items.find(
          (i) => (i._id || i.id) === (product._id || product.id)
        );
        if (existing) return;
        set({ items: [...get().items, product] });
        try {
          await api.post(`/wishlist/${product._id || product.id}`);
        } catch {
          // Silently keep local state in demo mode
        }
      },

      // ── Remove ────────────────────────────────────────────────────────────
      removeFromWishlist: async (productId) => {
        set({ items: get().items.filter((i) => (i._id || i.id) !== productId) });
        try {
          await api.delete(`/wishlist/${productId}`);
        } catch {
          // Keep local state in demo mode
        }
      },

      // ── Toggle ────────────────────────────────────────────────────────────
      toggleWishlist: async (product) => {
        const id = product._id || product.id;
        const isInWishlist = get().items.some((i) => (i._id || i.id) === id);
        if (isInWishlist) {
          await get().removeFromWishlist(id);
        } else {
          await get().addToWishlist(product);
        }
      },

      isWishlisted: (productId) =>
        get().items.some((i) => (i._id || i.id) === productId),

      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'parfum-wishlist' }
  )
);

export default useWishlistStore;
