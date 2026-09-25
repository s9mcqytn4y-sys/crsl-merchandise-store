import { create } from 'zustand';

export interface VarianModalItem {
    id: number | string;
    sku?: string;
    nama_varian: string;
    tipe_varian?: string;
    warna?: string;
    warna_hex?: string;
    ukuran?: string;
    stok?: number;
    gambar_varian?: string;
    harga_tambahan?: number;
}

export interface ModalProductData {
    id: number;
    nama: string;
    slug: string;
    harga_dasar: number;
    harga_diskon?: number | null;
    gambar_utama?: string;
    varian?: VarianModalItem[];
}

interface CartModalState {
    isOpen: boolean;
    product: ModalProductData | null;
    openCartModal: (product: ModalProductData) => void;
    closeCartModal: () => void;
}

export const useCartModalStore = create<CartModalState>((set) => ({
    isOpen: false,
    product: null,
    openCartModal: (product) => set({ isOpen: true, product }),
    closeCartModal: () => set({ isOpen: false, product: null }),
}));
