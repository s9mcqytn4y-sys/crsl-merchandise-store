import { create } from 'zustand';

export interface ItemKeranjang {
    id: string;
    produk_id: number;
    varian_id?: number | null;
    nama_produk: string;
    harga: number;
    gambar: string;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    sku?: string;
}

interface StateKeranjang {
    items: ItemKeranjang[];
    isOpen: boolean;
    bukaKeranjang: () => void;
    tutupKeranjang: () => void;
    setItems: (items: ItemKeranjang[]) => void;
    tambahItem: (item: ItemKeranjang) => void;
    hapusItem: (id: string) => void;
    kosongkan: () => void;
    hitungTotal: () => number;
    hitungJumlahTotal: () => number;
}

export const useKeranjangStore = create<StateKeranjang>((set, get) => ({
    items: [],
    isOpen: false,
    bukaKeranjang: () => set({ isOpen: true }),
    tutupKeranjang: () => set({ isOpen: false }),
    setItems: (items) => set({ items }),
    tambahItem: (newItem) =>
        set((state) => {
            const existingIndex = state.items.findIndex((i) => i.id === newItem.id);
            if (existingIndex > -1) {
                const updated = [...state.items];
                updated[existingIndex].jumlah += newItem.jumlah;
                return { items: updated, isOpen: true };
            }
            return { items: [...state.items, newItem], isOpen: true };
        }),
    hapusItem: (id) =>
        set((state) => ({
            items: state.items.filter((i) => i.id !== id),
        })),
    kosongkan: () => set({ items: [] }),
    hitungTotal: () => {
        return get().items.reduce((acc, item) => acc + item.harga * item.jumlah, 0);
    },
    hitungJumlahTotal: () => {
        return get().items.reduce((acc, item) => acc + item.jumlah, 0);
    },
}));
