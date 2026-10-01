import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface KeranjangItem {
    id: string | number;
    produk_id: number;
    varian_id?: number | null;
    nama_produk: string;
    harga: number;
    harga_asli?: number;
    harga_dasar?: number;
    jumlah: number;
    warna?: string | null;
    ukuran?: string | null;
    gambar?: string | null;
    sku?: string | null;
    slug?: string;
    stok?: number;
    berat_gram?: number;
    weight?: number;
    is_bundle?: boolean;
    bundle_name?: string;
    sub_items?: Array<{
        nama: string;
        variasi?: string;
        gambar?: string | null;
    }>;
    bundle_items?: Array<{
        item_nama?: string;
        varian_nama?: string;
        gambar?: string | null;
    }>;
}

// Alias untuk backward compatibility komponen lama
export type ItemKeranjang = KeranjangItem;

interface KeranjangState {
    // 1. Visibility Drawer Keranjang (Digunakan StorefrontLayout & FloatingActionHub)
    isOpen: boolean;
    bukaKeranjang: () => void;
    tutupKeranjang: () => void;
    toggleKeranjang: () => void;

    // 2. Data Items & Status Loading
    items: KeranjangItem[];
    isLoading: boolean;

    // 3. Actions Manipulasi Item
    tambah: (
        item: Partial<KeranjangItem> & {
            produk_id: number;
            nama_produk: string;
            harga: number;
        },
        jumlah?: number,
    ) => void;
    tambahItem: (
        item: Partial<KeranjangItem> & {
            produk_id: number;
            nama_produk: string;
            harga: number;
        },
        jumlah?: number,
    ) => void;
    perbaruiJumlah: (id: string | number, jumlah: number) => void;
    ubahJumlah: (id: string | number, delta: number) => void;
    hapus: (id: string | number) => void;
    kosongkan: () => void;
    setInitialItems: (items: KeranjangItem[]) => void;

    // 4. Perhitungan & Helper Reaktif
    totalItem: () => number;
    totalHarga: () => number;
    totalHemat: () => number;
    hitungJumlahTotal: () => number;
    hitungTotalHarga: () => number;
}

export const useKeranjangStore = create<KeranjangState>()(
    persist(
        (set, get) => ({
            // State Awal Drawer (In-Memory, tidak dipersist)
            isOpen: false,
            bukaKeranjang: () => set({ isOpen: true }),
            tutupKeranjang: () => set({ isOpen: false }),
            toggleKeranjang: () => set((state) => ({ isOpen: !state.isOpen })),

            // State Data Items
            items: [],
            isLoading: false,

            tambah: (itemBaru, jumlah = 1) => {
                const qtyToAdd = Math.max(1, jumlah);
                const currentItems = get().items;

                // Tentukan identifier unik berdasarkan produk_id dan varian_id
                const targetKey = itemBaru.id
                    ? String(itemBaru.id)
                    : `${itemBaru.produk_id}${
                          itemBaru.varian_id ? `_${itemBaru.varian_id}` : ""
                      }`;

                const existingIndex = currentItems.findIndex(
                    (it) =>
                        String(it.id) === targetKey ||
                        (it.produk_id === itemBaru.produk_id &&
                            it.varian_id === itemBaru.varian_id),
                );

                if (existingIndex > -1) {
                    const updated = [...currentItems];
                    const existingItem = updated[existingIndex];
                    const newQty = existingItem.jumlah + qtyToAdd;

                    // Proteksi batas stok jika tersedia
                    const maxStok =
                        existingItem.stok ?? itemBaru.stok ?? Infinity;
                    updated[existingIndex] = {
                        ...existingItem,
                        jumlah: Math.min(newQty, maxStok),
                    };
                    set({ items: updated });
                } else {
                    const newItem: KeranjangItem = {
                        id: targetKey,
                        produk_id: itemBaru.produk_id,
                        varian_id: itemBaru.varian_id ?? null,
                        nama_produk: itemBaru.nama_produk,
                        harga: Number(itemBaru.harga) || 0,
                        harga_asli:
                            Number(itemBaru.harga_asli ?? itemBaru.harga) || 0,
                        harga_dasar:
                            Number(
                                itemBaru.harga_dasar ??
                                    itemBaru.harga_asli ??
                                    itemBaru.harga,
                            ) || 0,
                        jumlah: qtyToAdd,
                        warna: itemBaru.warna ?? null,
                        ukuran: itemBaru.ukuran ?? null,
                        gambar: itemBaru.gambar ?? null,
                        sku: itemBaru.sku ?? `CRSL-${itemBaru.produk_id}`,
                        slug: itemBaru.slug ?? "",
                        stok: itemBaru.stok,
                        berat_gram:
                            itemBaru.berat_gram ?? itemBaru.weight ?? 350,
                        is_bundle: itemBaru.is_bundle ?? false,
                        bundle_name: itemBaru.bundle_name,
                        sub_items: itemBaru.sub_items,
                        bundle_items: itemBaru.bundle_items,
                    };
                    set({ items: [...currentItems, newItem] });
                }
            },

            tambahItem: (itemBaru, jumlah = 1) => {
                get().tambah(itemBaru, jumlah);
            },

            perbaruiJumlah: (id, jumlah) => {
                const targetQty = Number(jumlah);
                if (targetQty <= 0) {
                    get().hapus(id);
                    return;
                }

                set((state) => ({
                    items: state.items.map((it) => {
                        if (String(it.id) === String(id)) {
                            const maxStok = it.stok ?? Infinity;
                            return {
                                ...it,
                                jumlah: Math.min(targetQty, maxStok),
                            };
                        }
                        return it;
                    }),
                }));
            },

            ubahJumlah: (id, delta) => {
                const item = get().items.find(
                    (it) => String(it.id) === String(id),
                );
                if (!item) return;

                const nextQty = item.jumlah + delta;
                get().perbaruiJumlah(id, nextQty);
            },

            hapus: (id) => {
                set((state) => ({
                    items: state.items.filter(
                        (it) => String(it.id) !== String(id),
                    ),
                }));
            },

            kosongkan: () => {
                set({ items: [] });
            },

            setInitialItems: (items) => {
                set({ items: Array.isArray(items) ? items : [] });
            },

            // Kalkulasi Reaktif
            totalItem: () => {
                return get().items.reduce(
                    (acc, it) => acc + (Number(it.jumlah) || 1),
                    0,
                );
            },

            totalHarga: () => {
                return get().items.reduce(
                    (acc, it) =>
                        acc +
                        (Number(it.harga) || 0) * (Number(it.jumlah) || 1),
                    0,
                );
            },

            totalHemat: () => {
                return get().items.reduce((acc, it) => {
                    const hargaCoret = Number(
                        it.harga_asli || it.harga_dasar || 0,
                    );
                    if (hargaCoret > it.harga) {
                        return (
                            acc +
                            (hargaCoret - it.harga) * (Number(it.jumlah) || 1)
                        );
                    }
                    return acc;
                }, 0);
            },

            hitungJumlahTotal: () => {
                return get().totalItem();
            },

            hitungTotalHarga: () => {
                return get().totalHarga();
            },
        }),
        {
            name: "crsl_cart_store_v2",
            storage: createJSONStorage(() => localStorage),
            // Hanya persistenkan items, state isOpen drawer wajib in-memory
            partialize: (state) => ({ items: state.items }),
        },
    ),
);
