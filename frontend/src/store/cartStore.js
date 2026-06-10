import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ product, size, quantity }]

      addItem: (product, size = '100ml') => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id && i.size === size);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id && i.size === size
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, size, quantity: 1 }] });
        }
      },

      removeItem: (productId, size) =>
        set({ items: get().items.filter((i) => !(i.product.id === productId && i.size === size)) }),

      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) return get().removeItem(productId, size);
        set({
          items: get().items.map((i) =>
            i.product.id === productId && i.size === size ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      },
    }),
    { name: 'parfum-cart' }
  )
);

export default useCartStore;
