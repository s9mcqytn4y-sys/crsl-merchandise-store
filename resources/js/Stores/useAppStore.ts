import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AppPreferences {
    country: string;
    language: string;
    currency: string;
}

interface AppState {
    // 1. Mobile Menu State
    isMobileMenuOpen: boolean;
    openMobileMenu: () => void;
    closeMobileMenu: () => void;
    toggleMobileMenu: () => void;
    openMenu: () => void;
    closeMenu: () => void;

    // 2. Search Modal State
    isSearchOpen: boolean;
    searchQuery: string;
    openSearch: (initialQuery?: string) => void;
    closeSearch: () => void;
    setSearchQuery: (query: string) => void;
    clearSearch: () => void;

    // 3. Preferensi Modal (Region, Language, Currency)
    isPrefOpen: boolean;
    country: string;
    language: string;
    currency: string;
    openPref: () => void;
    closePref: () => void;
    togglePref: () => void;

    // 4. Announcement Bar
    isAnnouncementVisible: boolean;
    announcementText: string;
    dismissAnnouncement: () => void;
    showAnnouncement: (text?: string) => void;


    // 5. Page Loading
    isPageLoading: boolean;
    setPageLoading: (loading: boolean) => void;

    // 6. setPreferences - sinkronisasi cookie + store
    setPreferences: (country: string, language: string, currency: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Mobile Menu
            isMobileMenuOpen: false,
            openMobileMenu: () => set({ isMobileMenuOpen: true }),
            closeMobileMenu: () => set({ isMobileMenuOpen: false }),
            toggleMobileMenu: () =>
                set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
            openMenu: () => set({ isMobileMenuOpen: true }),
            closeMenu: () => set({ isMobileMenuOpen: false }),

            // Search Modal
            isSearchOpen: false,
            searchQuery: "",
            openSearch: (initialQuery = "") =>
                set({
                    isSearchOpen: true,
                    searchQuery: initialQuery,
                    isMobileMenuOpen: false,
                }),
            closeSearch: () => set({ isSearchOpen: false }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            clearSearch: () => set({ searchQuery: "" }),

            // Preferensi Modal
            isPrefOpen: false,
            country: "ID",
            language: "id",
            currency: "IDR",

            openPref: () => set({ isPrefOpen: true, isMobileMenuOpen: false }),
            closePref: () => set({ isPrefOpen: false }),
            togglePref: () =>
                set((state) => ({ isPrefOpen: !state.isPrefOpen })),

            // Announcement Bar
            isAnnouncementVisible: true,
            announcementText:
                "Gratis Ongkir ke Seluruh Pulau Jawa untuk Pesanan di Atas Rp 300.000! 🚚",
            dismissAnnouncement: () => set({ isAnnouncementVisible: false }),
            showAnnouncement: (text) =>
                set((state) => ({
                    isAnnouncementVisible: true,
                    announcementText: text || state.announcementText,
                })),

            // Page Loading Indicator
            isPageLoading: false,
            setPageLoading: (loading) => set({ isPageLoading: loading }),

            // Sinkronisasi preferensi ke store + cookie Laravel
            setPreferences: (country, language, currency) => {
                set({ country, language, currency });

                if (typeof document !== "undefined") {
                    const maxAge = 60 * 60 * 24 * 365;
                    document.cookie = `crsl_locale=${encodeURIComponent(language)}; path=/; max-age=${maxAge}; SameSite=Lax`;
                    document.cookie = `crsl_currency=${encodeURIComponent(currency)}; path=/; max-age=${maxAge}; SameSite=Lax`;
                    document.cookie = `crsl_user_preferences=${encodeURIComponent(
                        JSON.stringify({ country, language, currency }),
                    )}; path=/; max-age=${maxAge}; SameSite=Lax`;
                }
            },
        }),
        {
            name: "crsl_app_preferences_v2",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                country: state.country,
                language: state.language,
                currency: state.currency,
                isAnnouncementVisible: state.isAnnouncementVisible,
            }),
        },
    ),
);

