import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ _id, name, title, imgUrl, actualPrice, discountPrice, currency, quantity }]

      addItem: (product) => {
        const items = get().items;
        const existing = items.find(i => i._id === product._id);
        if (existing) {
          // Digital products: cap at 1 per product
          return;
        }
        set({ items: [...items, { ...product, quantity: 1 }] });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i._id !== productId) });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.discountPrice && item.discountPrice < item.actualPrice
            ? item.discountPrice
            : item.actualPrice;
          return sum + price;
        }, 0);
      },

      getCurrency: () => get().items[0]?.currency || 'INR',

      isInCart: (productId) => get().items.some(i => i._id === productId),
    }),
    {
      name: 'digitalstore-cart',
    }
  )
);

export default useCartStore;
