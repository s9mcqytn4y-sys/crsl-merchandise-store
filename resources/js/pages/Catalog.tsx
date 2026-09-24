import React, { useState, useEffect, useId } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import {
    SlidersHorizontal,
    RotateCcw,
    X,
    Heart,
    Plus,
    Package,
    Search,
    Check,
} from "lucide-react";
import { toast } from "sonner";
import { useKeranjangStore } from "../Stores/useKeranjangStore";

interface Category {
    id: number | string;
    nama: string;
    slug: string;
    emoji?: string;
}

interface Product {
    id: number;
    nama: string;
    slug: string;
    harga_dasar: number;
    harga_diskon?: number | null;
    gambar_utama?: string | null;
    stok_total?: number;
    kategori?: {
        nama: string;
    };
    has_variants?: boolean;
}

interface FilterState {
    kategori?: string;
    urutkan?: string;
    min_harga?: string | number;
    max_harga?: string | number;
    cari?: string;
}

interface CatalogProps {
    produk?: Product[];
    products?: Product[];
    kategori?: Category[];
    categories?: Category[];
    filter?: FilterState;
    filters?: FilterState;
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatRupiah(amount: number): string {
    return rupiahFormatter.format(amount || 0);
}

function hitungDiskon(dasar: number, diskon: number): number {
    if (dasar <= 0) return 0;
    return Math.max(0, Math.round(((dasar - diskon) / dasar) * 100));
}

export default function Catalog({
    produk = [],
    products = [],
    kategori = [],
    categories = [],
    filter = {},
    filters = {},
}: CatalogProps) {
    const listProduk = produk.length > 0 ? produk : products;
    const listKategori = kategori.length > 0 ? kategori : categories;
    const activeFilter = Object.keys(filter).length > 0 ? filter : filters;

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [minHarga, setMinHarga] = useState(activeFilter.min_harga || "");
    const [maxHarga, setMaxHarga] = useState(activeFilter.max_harga || "");

    const sortSelectId = useId();
    const minHargaInputId = useId();
    const maxHargaInputId = useId();

    const tambahItemStore = useKeranjangStore((state) => state.tambahItem);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);

    // Sinkronisasi state lokal jika query URL berubah
    useEffect(() => {
        setMinHarga(activeFilter.min_harga || "");
        setMaxHarga(activeFilter.max_harga || "");
    }, [activeFilter.min_harga, activeFilter.max_harga]);

    // Kunci scroll saat drawer filter terbuka & shortcut tombol ESC
    useEffect(() => {
        if (!isFilterOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsFilterOpen(false);
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isFilterOpen]);

    const handleCategoryChange = (slug: string) => {
        const nextFilter: Record<string, unknown> = { ...activeFilter };
        if (slug === "all-products") {
            delete nextFilter.kategori;
        } else {
            nextFilter.kategori = slug;
        }
        router.get("/katalog", nextFilter, { preserveScroll: true });
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            "/katalog",
            { ...activeFilter, urutkan: e.target.value },
            { preserveScroll: true },
        );
    };

    const handleApplyPriceFilter = () => {
        const queryParams: Record<string, unknown> = { ...activeFilter };

        if (minHarga) {
            queryParams.min_harga = minHarga;
        } else {
            delete queryParams.min_harga;
        }

        if (maxHarga) {
            queryParams.max_harga = maxHarga;
        } else {
            delete queryParams.max_harga;
        }

        router.get("/katalog", queryParams, { preserveScroll: true });
        setIsFilterOpen(false);
        toast.success("Filter harga berhasil diterapkan!");
    };

    const handleResetFilter = () => {
        setMinHarga("");
        setMaxHarga("");
        router.get("/katalog", {}, { preserveScroll: true });
        setIsFilterOpen(false);
        toast.info("Filter dibersihkan.");
    };

    const handleQuickAddToCart = (e: React.MouseEvent, item: Product) => {
        e.preventDefault();
        e.stopPropagation();

        if (item.has_variants) {
            router.visit(`/produk/${item.slug}`);
            return;
        }

        if (tambahItemStore) {
            tambahItemStore({
                id: String(item.id),
                nama_produk: item.nama,
                harga: item.harga_diskon ?? item.harga_dasar,
                gambar: item.gambar_utama || undefined,
                jumlah: 1,
            });
            toast.success(`${item.nama} ditambahkan ke keranjang!`);
            bukaKeranjang?.();
        } else {
            router.post(
                "/keranjang",
                { produk_id: item.id, jumlah: 1 },
                { preserveScroll: true },
            );
        }
    };

    const handleToggleWishlist = (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(
            "/wishlist/toggle",
            { produk_id: productId },
            {
                preserveScroll: true,
                onSuccess: () => toast.success("Status wishlist diperbarui!"),
            },
        );
    };

    return (
        <StorefrontLayout>
            <Head title="Katalog Produk Merchandise — CRSL Official Store" />

            {/* Header Banner */}
            <div className="bg-slate-50 border-b border-slate-200/80 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Katalog Produk CRSL
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Temukan berbagai merchandise karakter hewan sahabat
                        favoritmu yang fungsional dan trendi.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Control Bar: Kategori, Filter, & Sorting */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8 pb-6 border-b border-slate-200/80">
                    {/* Kategori Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none overscroll-x-contain">
                        <button
                            type="button"
                            onClick={() => handleCategoryChange("all-products")}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                !activeFilter.kategori ||
                                activeFilter.kategori === "all-products"
                                    ? "bg-[#E52027] text-white shadow-xs"
                                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}
                        >
                            Semua Produk
                        </button>
                        {listKategori.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    activeFilter.kategori === cat.slug
                                        ? "bg-[#E52027] text-white shadow-xs"
                                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                                }`}
                            >
                                {cat.emoji && <span>{cat.emoji}</span>}
                                {cat.nama}
                            </button>
                        ))}
                    </div>

                    {/* Filter Modal Trigger & Urutkan Dropdown */}
                    <div className="flex items-center gap-2.5 shrink-0 justify-between md:justify-end">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(true)}
                            className="bg-white border border-slate-200 hover:border-[#E52027] text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-[#E52027]" />
                            <span>Filter Harga</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <label htmlFor={sortSelectId} className="sr-only">
                                Urutkan Produk
                            </label>
                            <select
                                id={sortSelectId}
                                value={activeFilter.urutkan || "default"}
                                onChange={handleSortChange}
                                className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E52027] shadow-2xs"
                            >
                                <option value="default">
                                    Unggulan (Default)
                                </option>
                                <option value="terbaru">Terbaru</option>
                                <option value="harga_rendah">
                                    Harga Terendah
                                </option>
                                <option value="harga_tinggi">
                                    Harga Tertinggi
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {listProduk.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center my-8 shadow-xs max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                            <Search className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">
                            Tidak ada produk yang sesuai
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                            Coba ubah kata kunci pencarian atau bersihkan
                            batasan filter harga Anda.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="mt-5 bg-[#E52027] hover:bg-[#CC1C22] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-xs transition-colors"
                        >
                            Reset Semua Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {listProduk.map((item) => {
                            const price = item.harga_dasar || 0;
                            const discountPrice = item.harga_diskon ?? price;
                            const isDiscounted =
                                item.harga_diskon !== null &&
                                item.harga_diskon !== undefined &&
                                item.harga_diskon < price;
                            const discountPercent = isDiscounted
                                ? hitungDiskon(price, discountPrice)
                                : 0;
                            const isOutOfStock =
                                item.stok_total !== undefined &&
                                item.stok_total <= 0;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/produk/${item.slug}`}
                                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col group relative"
                                    aria-label={`Detail produk ${item.nama}`}
                                >
                                    {/* Thumbnail Box */}
                                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                                        {item.gambar_utama ? (
                                            <img
                                                src={item.gambar_utama}
                                                alt={item.nama}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                                width={300}
                                                height={300}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Package className="w-10 h-10" />
                                            </div>
                                        )}

                                        {/* Diskon Badge */}
                                        {isDiscounted && (
                                            <span className="absolute top-2.5 left-2.5 bg-[#E52027] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                                                -{discountPercent}%
                                            </span>
                                        )}

                                        {/* Wishlist Button */}
                                        <button
                                            type="button"
                                            onClick={(e) =>
                                                handleToggleWishlist(e, item.id)
                                            }
                                            className="absolute top-2.5 right-2.5 bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 p-2 rounded-full shadow-2xs backdrop-blur-xs transition-colors z-10"
                                            title="Simpan ke Wishlist"
                                            aria-label="Simpan ke wishlist"
                                        >
                                            <Heart className="w-4 h-4" />
                                        </button>

                                        {/* Quick Add to Cart Button */}
                                        {!isOutOfStock && (
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    handleQuickAddToCart(
                                                        e,
                                                        item,
                                                    )
                                                }
                                                className="absolute bottom-2.5 right-2.5 bg-white hover:bg-[#E52027] text-slate-800 hover:text-white p-2 rounded-full shadow-md transition-colors active:scale-95 z-10"
                                                title="Tambah ke Keranjang"
                                                aria-label="Tambah ke keranjang"
                                            >
                                                <Plus
                                                    className="w-4 h-4"
                                                    strokeWidth={2.5}
                                                />
                                            </button>
                                        )}

                                        {/* Out of Stock Overlay */}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                                                <span className="text-white font-bold text-xs bg-black/75 px-3 py-1 rounded-full border border-white/20">
                                                    Stok Habis
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Box */}
                                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                {item.kategori?.nama ||
                                                    "CRSL Merch"}
                                            </span>
                                            <h3 className="font-semibold text-xs text-slate-900 line-clamp-2 mt-0.5 group-hover:text-[#E52027] transition-colors leading-snug">
                                                {item.nama}
                                            </h3>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                                            <div className="tabular-nums">
                                                {isDiscounted ? (
                                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                                        <span className="text-xs sm:text-sm font-extrabold text-[#E52027]">
                                                            {formatRupiah(
                                                                discountPrice,
                                                            )}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 line-through">
                                                            {formatRupiah(
                                                                price,
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                                                        {formatRupiah(price)}
                                                    </span>
                                                )}
                                            </div>
                                            {item.stok_total !== undefined &&
                                                item.stok_total > 0 && (
                                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                                                        Stok {item.stok_total}
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Filter Drawer Dialog */}
            {isFilterOpen && (
                <div
                    className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-sm bg-white h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-[#E52027]" />
                                    Filter & Rentang Harga
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsFilterOpen(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                                    aria-label="Tutup filter"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 text-xs">
                                <div>
                                    <label
                                        htmlFor={minHargaInputId}
                                        className="font-bold text-slate-800 block mb-2"
                                    >
                                        Rentang Harga (IDR)
                                    </label>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-[11px] text-slate-500 block mb-1">
                                                Harga Minimum:
                                            </span>
                                            <input
                                                id={minHargaInputId}
                                                type="number"
                                                value={minHarga}
                                                onChange={(e) =>
                                                    setMinHarga(e.target.value)
                                                }
                                                placeholder="Contoh: 50000"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E52027]"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-500 block mb-1">
                                                Harga Maksimum:
                                            </span>
                                            <input
                                                id={maxHargaInputId}
                                                type="number"
                                                value={maxHarga}
                                                onChange={(e) =>
                                                    setMaxHarga(e.target.value)
                                                }
                                                placeholder="Contoh: 500000"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E52027]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyPriceFilter}
                                className="flex-1 py-3 bg-[#E52027] hover:bg-[#CC1C22] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Check
                                    className="w-3.5 h-3.5"
                                    strokeWidth={2.5}
                                />
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
