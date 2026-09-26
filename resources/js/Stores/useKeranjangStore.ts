import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ItemKeranjang {
    id: string;
    produk_id?: number;
    slug?: string;
    varian_id?: number | null;
    nama_produk: string;
    harga: number;
    harga_asli?: number;
    harga_dasar?: number;
    stok?: number;
    gambar?: string;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    sku?: string;
    is_bundle?: boolean;
    bundle_name?: string;
    sub_items?: Array<{
        nama: string;
        variasi: string;
        gambar?: string;
    }>;
}

interface StateKeranjang {
    items: ItemKeranjang[];
    isOpen: boolean;
    bukaKeranjang: () => void;
    tutupKeranjang: () => void;
    toggleKeranjang: () => void;
    setItems: (items: ItemKeranjang[]) => void;
    tambahItem: (item: ItemKeranjang) => void;
    ubahJumlah: (id: string, delta: number) => void;
    hapusItem: (id: string) => void;
    kosongkan: () => void;
    hitungTotal: () => number;
    hitungJumlahTotal: () => number;
}

export const useKeranjangStore = create<StateKeranjang>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            bukaKeranjang: () => set({ isOpen: true }),
            tutupKeranjang: () => set({ isOpen: false }),
            toggleKeranjang: () => set((state) => ({ isOpen: !state.isOpen })),

            setItems: (items) =>
                set({ items: Array.isArray(items) ? items : [] }),

            tambahItem: (newItem) =>
                set((state) => {
                    const qtyToAdd = newItem.jumlah > 0 ? newItem.jumlah : 1;
                    const existingIndex = state.items.findIndex(
                        (i) => i.id === newItem.id,
                    );

                    if (existingIndex > -1) {
                        const updated = state.items.map((item, idx) =>
                            idx === existingIndex
                                ? { ...item, jumlah: item.jumlah + qtyToAdd }
                                : item,
                        );
                        return { items: updated, isOpen: true };
                    }

                    return {
                        items: [
                            ...state.items,
                            { ...newItem, jumlah: qtyToAdd },
                        ],
                        isOpen: true,
                    };
                }),

            ubahJumlah: (id, delta) =>
                set((state) => {
                    const updated = state.items
                        .map((item) => {
                            if (item.id === id) {
                                const nextQty = item.jumlah + delta;
                                return nextQty > 0
                                    ? { ...item, jumlah: nextQty }
                                    : null;
                            }
                            return item;
                        })
                        .filter((item): item is ItemKeranjang => item !== null);

                    return { items: updated };
                }),

            hapusItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                })),

            kosongkan: () => set({ items: [] }),

            hitungTotal: () => {
                const currentItems = get().items || [];
                return currentItems.reduce(
                    (acc, item) => acc + (item.harga || 0) * (item.jumlah || 1),
                    0,
                );
            },

            hitungJumlahTotal: () => {
                const currentItems = get().items || [];
                return currentItems.reduce(
                    (acc, item) => acc + (item.jumlah || 1),
                    0,
                );
            },
        }),
        {
            name: "crsl_cart_store", // Key penyimpanan di LocalStorage
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items }), // Hanya simpan data items (jangan simpan state isOpen)
        },
    ),
);
