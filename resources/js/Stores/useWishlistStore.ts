import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistProduct {
    id: number;
    nama: string;
    slug: string;
    harga: number;
    gambar?: string | null;
}

interface WishlistState {
    items: WishlistProduct[];
    isLoading: boolean;

    // Actions
    setInitialItems: (items: WishlistProduct[]) => void;
    tambahWishlist: (produk: WishlistProduct, isLoggedIn?: boolean) => Promise<void>;
    hapusWishlist: (produkId: number, isLoggedIn?: boolean) => Promise<void>;
    toggleWishlist: (produk: WishlistProduct, isLoggedIn?: boolean) => Promise<void>;
    isWishlisted: (produkId: number) => boolean;
    kosongkan: () => void;
}

function getXsrfToken(): string {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Endpoint wishlist yang benar sesuai routes/web.php:
 * POST /wishlist/toggle -> wishlist.toggle
 */
async function apiToggleWishlist(produkId: number): Promise<void> {
    await fetch("/wishlist/toggle", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-XSRF-TOKEN": getXsrfToken(),
        },
        body: JSON.stringify({ produk_id: produkId }),
    });
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,

            setInitialItems: (items) => {
                set({ items: Array.isArray(items) ? items : [] });
            },

            isWishlisted: (produkId) => {
                return get().items.some(
                    (it) => Number(it.id) === Number(produkId),
                );
            },

            tambahWishlist: async (produk, isLoggedIn = false) => {
                const current = get().items;
                const idNum = Number(produk.id);

                // Optimistic update
                if (!current.some((it) => Number(it.id) === idNum)) {
                    const newItem: WishlistProduct = {
                        id: idNum,
                        nama: produk.nama,
                        slug: produk.slug,
                        harga: Number(produk.harga) || 0,
                        gambar: produk.gambar || null,
                    };
                    set({ items: [...current, newItem] });
                }

                // Sinkronkan ke database jika user terautentikasi
                if (isLoggedIn) {
                    try {
                        await apiToggleWishlist(idNum);
                    } catch (err) {
                        console.warn("Gagal sinkronisasi tambah wishlist ke database:", err);
                    }
                }
            },

            hapusWishlist: async (produkId, isLoggedIn = false) => {
                const idNum = Number(produkId);
                // Optimistic UI update: hapus seketika dari state lokal
                set((state) => ({
                    items: state.items.filter((it) => Number(it.id) !== idNum),
                }));

                // Sinkronkan ke database jika login
                if (isLoggedIn) {
                    try {
                        await apiToggleWishlist(idNum);
                    } catch (err) {
                        console.warn("Gagal sinkronisasi hapus wishlist ke database:", err);
                    }
                }
            },

            toggleWishlist: async (produk, isLoggedIn = false) => {
                const exists = get().isWishlisted(Number(produk.id));
                if (exists) {
                    await get().hapusWishlist(Number(produk.id), isLoggedIn);
                } else {
                    await get().tambahWishlist(produk, isLoggedIn);
                }
            },

            kosongkan: () => {
                set({ items: [] });
            },
        }),
        {
            name: "crsl_wishlist_store_v2",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items }),
        },
    ),
);
