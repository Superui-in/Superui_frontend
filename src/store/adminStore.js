import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
  persist(
    (set) => ({
      token: null,
      admin: null,

      setAuth: (token, admin) => set({ token, admin }),
      updateAdmin: (partialAdmin) =>
        set((state) => ({
          admin: state.admin ? { ...state.admin, ...partialAdmin } : partialAdmin,
        })),
      logout: () => set({ token: null, admin: null }),

      isLoggedIn: () => !!useAdminStore.getState().token,
    }),
    {
      name: 'digitalstore-admin',
    }
  )
);

export default useAdminStore;
