import { create } from "zustand";

export interface ModalProductVariant {
    id: number;
    nama_varian?: string;
    warna?: string | null;
    ukuran?: string | null;
    sku?: string | null;
    harga?: number | null;
    harga_tambahan?: number | null;
    stok: number;
    gambar_varian?: string | null;
}

export interface CartModalProduct {
    id: number;
    nama: string;
    slug?: string;
    harga: number;
    harga_asli?: number;
    harga_diskon?: number | null;
    gambar_utama?: string | null;
    gambar?: string | null;
    stok_total?: number;
    kategori?: string;
    deskripsi_singkat?: string;
    varians?: ModalProductVariant[];
    berat_gram?: number;
}

interface CartModalState {
    // 1. Add to Cart / Quick Config Modal State
    isAddToCartOpen: boolean;
    activeProduct: CartModalProduct | null;
    selectedVariant: ModalProductVariant | null;
    selectedQuantity: number;
    selectedWarna: string | null;
    selectedUkuran: string | null;

    // 2. Add to Cart Modal Actions
    openAddToCart: (product: CartModalProduct, defaultVariantId?: number) => void;
    closeAddToCart: () => void;
    setSelectedVariant: (variant: ModalProductVariant | null) => void;
    setSelectedQuantity: (qty: number | ((prev: number) => number)) => void;
    setSelectedWarna: (warna: string | null) => void;
    setSelectedUkuran: (ukuran: string | null) => void;

    // 3. Backward-compat aliases (delegasi ke openAddToCart/closeAddToCart)
    openModal: (product: CartModalProduct) => void;
    closeModal: () => void;
}

export const useCartModalStore = create<CartModalState>((set, get) => ({
    // Initial Modal State
    isAddToCartOpen: false,
    activeProduct: null,
    selectedVariant: null,
    selectedQuantity: 1,
    selectedWarna: null,
    selectedUkuran: null,

    // Buka Modal Add To Cart & Inisialisasi Varian Default
    openAddToCart: (product, defaultVariantId) => {
        let initialVariant: ModalProductVariant | null = null;

        if (product.varians && product.varians.length > 0) {
            if (defaultVariantId) {
                initialVariant =
                    product.varians.find((v) => v.id === defaultVariantId) ||
                    product.varians[0];
            } else {
                // Pilih varian pertama yang masih memiliki stok jika ada
                initialVariant =
                    product.varians.find((v) => v.stok > 0) ||
                    product.varians[0];
            }
        }

        set({
            isAddToCartOpen: true,
            activeProduct: product,
            selectedVariant: initialVariant,
            selectedWarna: initialVariant?.warna || null,
            selectedUkuran: initialVariant?.ukuran || null,
            selectedQuantity: 1,
        });
    },

    closeAddToCart: () => {
        set({
            isAddToCartOpen: false,
            activeProduct: null,
            selectedVariant: null,
            selectedQuantity: 1,
            selectedWarna: null,
            selectedUkuran: null,
        });
    },

    setSelectedVariant: (variant) => {
        set({
            selectedVariant: variant,
            selectedWarna: variant?.warna ?? get().selectedWarna,
            selectedUkuran: variant?.ukuran ?? get().selectedUkuran,
        });
    },

    setSelectedQuantity: (qty) => {
        set((state) => {
            const nextQty =
                typeof qty === "function" ? qty(state.selectedQuantity) : qty;
            const maxStok = state.selectedVariant
                ? state.selectedVariant.stok
                : (state.activeProduct?.stok_total ?? 99);

            return {
                selectedQuantity: Math.max(
                    1,
                    Math.min(nextQty, maxStok > 0 ? maxStok : 1),
                ),
            };
        });
    },

    setSelectedWarna: (warna) => {
        const { activeProduct, selectedUkuran } = get();
        let matchedVariant: ModalProductVariant | null = null;

        if (activeProduct?.varians) {
            matchedVariant =
                activeProduct.varians.find(
                    (v) =>
                        v.warna === warna &&
                        (!selectedUkuran || v.ukuran === selectedUkuran),
                ) ||
                activeProduct.varians.find((v) => v.warna === warna) ||
                null;
        }

        set({
            selectedWarna: warna,
            selectedVariant: matchedVariant,
            ...(matchedVariant?.ukuran
                ? { selectedUkuran: matchedVariant.ukuran }
                : {}),
        });
    },

    setSelectedUkuran: (ukuran) => {
        const { activeProduct, selectedWarna } = get();
        let matchedVariant: ModalProductVariant | null = null;

        if (activeProduct?.varians) {
            matchedVariant =
                activeProduct.varians.find(
                    (v) =>
                        v.ukuran === ukuran &&
                        (!selectedWarna || v.warna === selectedWarna),
                ) ||
                activeProduct.varians.find((v) => v.ukuran === ukuran) ||
                null;
        }

        set({
            selectedUkuran: ukuran,
            selectedVariant: matchedVariant,
            ...(matchedVariant?.warna
                ? { selectedWarna: matchedVariant.warna }
                : {}),
        });
    },

    // Aliases backward-compat
    openModal: (product) => get().openAddToCart(product),
    closeModal: () => get().closeAddToCart(),
}));
