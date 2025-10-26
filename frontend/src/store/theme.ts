import { create } from 'zustand';

type ThemeState = {
  dark: boolean;
  toggle: () => void;
};

export const useTheme = create<ThemeState>((set) => ({
  dark: (() => {
    const saved = localStorage.getItem('theme.dark');
    return saved ? saved === '1' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  })(),
  toggle: () => set((s) => {
    const next = !s.dark;
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme.dark', next ? '1' : '0');
    return { dark: next };
  }),
}));


