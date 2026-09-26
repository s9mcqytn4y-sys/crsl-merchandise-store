/**
 * CRSL Official Store - Unified Constants & Design Tokens
 */

export const WARNA_BRAND = {
    merahUtama: "#E52027",
    merahHover: "#CC1C22",
    merahMuda: "#FEF2F2",
    hitamSlate: "#0F172A",
    abuBackground: "#F8F9FA",
    abuBorder: "#E2E8F0",
} as const;

export const OPSI_SORTING_KATALOG = [
    { id: "featured", label: "Featured" },
    { id: "recent", label: "Recent" },
    { id: "oldest", label: "Oldest" },
    { id: "popular", label: "Most Popular" },
    { id: "lowest_price", label: "Lowest Price" },
    { id: "highest_price", label: "Highest Price" },
    { id: "name_asc", label: "Product Name (A-Z)" },
    { id: "name_desc", label: "Product Name (Z-A)" },
] as const;

export const OPSI_TIPE_PRODUK = [
    { id: "all_products", label: "All Products" },
    { id: "featured_products", label: "Featured Products" },
    { id: "discount", label: "Discount" },
    { id: "bundled_products", label: "Bundled Products" },
] as const;

export const OPSI_KETERSEDIAAN = [
    { id: "all", label: "All" },
    { id: "in_stock", label: "In Stock" },
] as const;

export const OPSI_UKURAN_PRODUK = ["S", "M", "L", "XL", "XXL"] as const;

export const STATUS_PESANAN_LABELS: Record<string, string> = {
    belum_bayar: "Belum Bayar",
    akan_dikirim: "Perlu Dikirim",
    dikirim: "Dikirim",
    selesai: "Selesai",
    dibatalkan: "Dibatalkan",
    dikembalikan: "Dikembalikan",
};
