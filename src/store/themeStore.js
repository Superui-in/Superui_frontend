import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const applyTheme = (isDark) => {
  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
    }
  }
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      darkMode: false,
      toggleDarkMode: () => {
        const next = !get().darkMode;
        applyTheme(next);
        set({ darkMode: next });
      },
      setDarkMode: (isDark) => {
        applyTheme(isDark);
        set({ darkMode: isDark });
      },
      initTheme: () => {
        applyTheme(get().darkMode);
      },
    }),
    {
      name: 'digitalstore-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.darkMode);
      }
    }
  )
);

export default useThemeStore;
