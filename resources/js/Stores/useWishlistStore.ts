import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

export interface WishlistProduct {
    id: number;
    nama: string;
    slug: string;
    harga: number;
    gambar?: string | null;
}

interface WishlistState {
    items: WishlistProduct[];
    itemIds: number[];
    tambahWishlist: (product: WishlistProduct, isLoggedIn?: boolean) => void;
    hapusWishlist: (productId: number, isLoggedIn?: boolean) => void;
    toggleWishlist: (product: WishlistProduct, isLoggedIn?: boolean) => void;
    isWishlisted: (productId: number) => boolean;
    setInitialItems: (items: WishlistProduct[]) => void;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            itemIds: [],

            isWishlisted: (productId: number) => {
                return get().itemIds.includes(productId);
            },

            tambahWishlist: (product: WishlistProduct, isLoggedIn = false) => {
                const { items, itemIds } = get();
                if (itemIds.includes(product.id)) return;

                const nextItems = [product, ...items];
                const nextIds = [product.id, ...itemIds];
                set({ items: nextItems, itemIds: nextIds });

                toast.success(`${product.nama} disimpan ke wishlist!`);

                if (isLoggedIn) {
                    router.post(
                        "/wishlist/toggle",
                        { produk_id: product.id },
                        {
                            preserveScroll: true,
                            preserveState: true,
                            onError: () => {
                                // rollback on server error
                                set({ items, itemIds });
                                toast.error("Gagal memperbarui wishlist di server.");
                            },
                        }
                    );
                }
            },

            hapusWishlist: (productId: number, isLoggedIn = false) => {
                const { items, itemIds } = get();
                const nextItems = items.filter((item) => item.id !== productId);
                const nextIds = itemIds.filter((id) => id !== productId);
                set({ items: nextItems, itemIds: nextIds });

                toast.info("Produk dihapus dari wishlist.");

                if (isLoggedIn) {
                    router.post(
                        "/wishlist/toggle",
                        { produk_id: productId },
                        {
                            preserveScroll: true,
                            preserveState: true,
                            onError: () => {
                                // rollback on server error
                                set({ items, itemIds });
                                toast.error("Gagal memperbarui wishlist di server.");
                            },
                        }
                    );
                }
            },

            toggleWishlist: (product: WishlistProduct, isLoggedIn = false) => {
                const exists = get().isWishlisted(product.id);
                if (exists) {
                    get().hapusWishlist(product.id, isLoggedIn);
                } else {
                    get().tambahWishlist(product, isLoggedIn);
                }
            },

            setInitialItems: (serverItems: WishlistProduct[]) => {
                const serverIds = serverItems.map((item) => item.id);
                set({ items: serverItems, itemIds: serverIds });
            },

            clearWishlist: () => {
                set({ items: [], itemIds: [] });
            },
        }),
        {
            name: "crsl_wishlist_storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
