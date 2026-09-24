import { create } from 'zustand';

interface AppState {
    isSearchOpen: boolean;
    isMenuOpen: boolean;
    isPrefOpen: boolean;
    country: string;
    currency: string;
    language: string;
    openSearch: () => void;
    closeSearch: () => void;
    openMenu: () => void;
    closeMenu: () => void;
    openPref: () => void;
    closePref: () => void;
    setPreferences: (country: string, lang: string, currency: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isSearchOpen: false,
    isMenuOpen: false,
    isPrefOpen: false,
    country: 'ID',
    currency: 'IDR',
    language: 'id',
    openSearch: () => set({ isSearchOpen: true }),
    closeSearch: () => set({ isSearchOpen: false }),
    openMenu: () => set({ isMenuOpen: true }),
    closeMenu: () => set({ isMenuOpen: false }),
    openPref: () => set({ isPrefOpen: true }),
    closePref: () => set({ isPrefOpen: false }),
    setPreferences: (country, language, currency) =>
        set({ country, language, currency }),
}));
