import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminDashboardStats, StatusPesanan } from "../types";

// -----------------------------------------------------------------------
// ADMIN FILTER TYPES
// -----------------------------------------------------------------------

export interface AdminPesananFilter {
    status?: StatusPesanan | "semua";
    search?: string;
    tanggal_dari?: string;
    tanggal_sampai?: string;
    metode_pembayaran?: string;
    kurir?: string;
    halaman?: number;
    per_halaman?: number;
}

export interface AdminProdukFilter {
    search?: string;
    kategori_id?: number;
    status_stok?: "semua" | "tersedia" | "habis";
    tipe?: string;
    halaman?: number;
    per_halaman?: number;
}

// -----------------------------------------------------------------------
// ADMIN STORE STATE
// -----------------------------------------------------------------------

interface AdminState {
    // 1. Sidebar
    isSidebarCollapsed: boolean;
    activeSidebarMenu: string;
    toggleSidebar: () => void;
    setSidebarMenu: (menu: string) => void;

    // 2. Dashboard Stats Cache
    stats: AdminDashboardStats | null;
    statsLastFetched: number | null;
    setStats: (stats: AdminDashboardStats) => void;

    // 3. Filter Pesanan (Persisted di sessionStorage)
    pesananFilter: AdminPesananFilter;
    setPesananFilter: (filter: Partial<AdminPesananFilter>) => void;
    resetPesananFilter: () => void;

    // 4. Filter Produk (Persisted di sessionStorage)
    produkFilter: AdminProdukFilter;
    setProdukFilter: (filter: Partial<AdminProdukFilter>) => void;
    resetProdukFilter: () => void;

    // 5. Bulk Selection State
    selectedPesananIds: number[];
    selectedProdukIds: number[];
    toggleSelectPesanan: (id: number) => void;
    toggleSelectProduk: (id: number) => void;
    clearPesananSelection: () => void;
    clearProdukSelection: () => void;
    selectAllPesanan: (ids: number[]) => void;

    // 6. UI State
    isGlobalSearchOpen: boolean;
    openGlobalSearch: () => void;
    closeGlobalSearch: () => void;
}

const DEFAULT_PESANAN_FILTER: AdminPesananFilter = {
    status: "semua",
    search: "",
    halaman: 1,
    per_halaman: 25,
};

const DEFAULT_PRODUK_FILTER: AdminProdukFilter = {
    search: "",
    status_stok: "semua",
    halaman: 1,
    per_halaman: 25,
};

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            // Sidebar
            isSidebarCollapsed: false,
            activeSidebarMenu: "dashboard",
            toggleSidebar: () =>
                set((state) => ({
                    isSidebarCollapsed: !state.isSidebarCollapsed,
                })),
            setSidebarMenu: (menu) => set({ activeSidebarMenu: menu }),

            // Dashboard Stats
            stats: null,
            statsLastFetched: null,
            setStats: (stats) =>
                set({ stats, statsLastFetched: Date.now() }),

            // Filter Pesanan
            pesananFilter: { ...DEFAULT_PESANAN_FILTER },
            setPesananFilter: (filter) =>
                set((state) => ({
                    pesananFilter: {
                        ...state.pesananFilter,
                        ...filter,
                        // Reset halaman saat filter berubah
                        halaman: filter.halaman ?? 1,
                    },
                })),
            resetPesananFilter: () =>
                set({ pesananFilter: { ...DEFAULT_PESANAN_FILTER } }),

            // Filter Produk
            produkFilter: { ...DEFAULT_PRODUK_FILTER },
            setProdukFilter: (filter) =>
                set((state) => ({
                    produkFilter: {
                        ...state.produkFilter,
                        ...filter,
                        halaman: filter.halaman ?? 1,
                    },
                })),
            resetProdukFilter: () =>
                set({ produkFilter: { ...DEFAULT_PRODUK_FILTER } }),

            // Bulk Selection
            selectedPesananIds: [],
            selectedProdukIds: [],
            toggleSelectPesanan: (id) =>
                set((state) => {
                    const exists = state.selectedPesananIds.includes(id);
                    return {
                        selectedPesananIds: exists
                            ? state.selectedPesananIds.filter((x) => x !== id)
                            : [...state.selectedPesananIds, id],
                    };
                }),
            toggleSelectProduk: (id) =>
                set((state) => {
                    const exists = state.selectedProdukIds.includes(id);
                    return {
                        selectedProdukIds: exists
                            ? state.selectedProdukIds.filter((x) => x !== id)
                            : [...state.selectedProdukIds, id],
                    };
                }),
            clearPesananSelection: () => set({ selectedPesananIds: [] }),
            clearProdukSelection: () => set({ selectedProdukIds: [] }),
            selectAllPesanan: (ids) => set({ selectedPesananIds: ids }),

            // Global Search
            isGlobalSearchOpen: false,
            openGlobalSearch: () => set({ isGlobalSearchOpen: true }),
            closeGlobalSearch: () => set({ isGlobalSearchOpen: false }),
        }),
        {
            name: "crsl_admin_state_v1",
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                isSidebarCollapsed: state.isSidebarCollapsed,
                activeSidebarMenu: state.activeSidebarMenu,
                pesananFilter: state.pesananFilter,
                produkFilter: state.produkFilter,
            }),
        },
    ),
);
