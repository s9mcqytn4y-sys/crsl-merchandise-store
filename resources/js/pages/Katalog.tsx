import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import {
    SlidersHorizontal,
    RotateCcw,
    X,
    Search,
} from "lucide-react";
import ProductCard, { ProductData } from "../Components/Common/ProductCard";
import CircularCategoriesBar, {
    CircularCategoryItem,
} from "../Components/Catalog/CircularCategoriesBar";
import FilterSortDrawer, {
    FilterValues,
} from "../Components/Catalog/FilterSortDrawer";
import StickyCartBar from "../Components/StickyCartBar";
import { formatRupiah } from "../Utils/formatters";
import { cn } from "../lib/utils";

interface CatalogProps {
    produk?: ProductData[];
    products?: ProductData[];
    kategori?: CircularCategoryItem[];
    categories?: CircularCategoryItem[];
    filter?: Partial<FilterValues> & {
        kategori?: string;
        cari?: string;
        page?: number;
    };
    filters?: Partial<FilterValues> & {
        kategori?: string;
        cari?: string;
        page?: number;
    };
    priceRangeBounds?: { min: number; max: number };
    className?: string;
}

export default function Catalog({
    produk = [],
    products = [],
    kategori = [],
    categories = [],
    filter = {},
    filters = {},
    priceRangeBounds = { min: 2500, max: 519000 },
    className,
}: CatalogProps) {
    const listProduk = produk.length > 0 ? produk : products;
    const listKategori = kategori.length > 0 ? kategori : categories;
    const activeFilter = Object.keys(filter).length > 0 ? filter : filters;

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(activeFilter.cari || "");

    useEffect(() => {
        setSearchQuery(activeFilter.cari || "");
    }, [activeFilter.cari]);

    const activeCategorySlug = activeFilter.kategori || "all-products";

    // Handle Kategori Select (otomatis reset pagination)
    const handleCategoryChange = (slug: string) => {
        const nextFilter: Record<string, any> = { ...activeFilter };
        delete nextFilter.page;

        if (slug === "all-products") {
            delete nextFilter.kategori;
        } else {
            nextFilter.kategori = slug;
        }
        router.get("/katalog", nextFilter, { preserveScroll: true });
    };

    // Handle Search Submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nextFilter: Record<string, any> = { ...activeFilter };
        delete nextFilter.page;

        if (searchQuery.trim()) {
            nextFilter.cari = searchQuery.trim();
        } else {
            delete nextFilter.cari;
        }
        router.get("/katalog", nextFilter, { preserveScroll: true });
    };

    // Handle Clear Search
    const handleClearSearch = () => {
        setSearchQuery("");
        const nextFilter: Record<string, any> = { ...activeFilter };
        delete nextFilter.cari;
        delete nextFilter.page;
        router.get("/katalog", nextFilter, { preserveScroll: true });
    };

    // Handle Apply Filters from Drawer
    const handleApplyDrawerFilters = (newValues: FilterValues) => {
        const nextFilter: Record<string, any> = {
            ...activeFilter,
            urutkan: newValues.urutkan,
            tipe: newValues.tipe,
            ketersediaan: newValues.ketersediaan,
        };
        delete nextFilter.page;

        if (newValues.min_harga) {
            nextFilter.min_harga = newValues.min_harga;
        } else {
            delete nextFilter.min_harga;
        }

        if (newValues.max_harga) {
            nextFilter.max_harga = newValues.max_harga;
        } else {
            delete nextFilter.max_harga;
        }

        if (newValues.warna) {
            nextFilter.warna = newValues.warna;
        } else {
            delete nextFilter.warna;
        }

        if (newValues.ukuran) {
            nextFilter.ukuran = newValues.ukuran;
        } else {
            delete nextFilter.ukuran;
        }

        router.get("/katalog", nextFilter, { preserveScroll: true });
    };

    // Reset Semua Filter
    const handleResetAllFilters = () => {
        setSearchQuery("");
        router.get("/katalog", {}, { preserveScroll: true });
    };

    // Temukan nama kategori aktif
    const activeCategoryObj = listKategori.find(
        (c) => c.slug === activeCategorySlug,
    );
    const categoryTitle =
        activeCategorySlug === "all-products" || !activeCategoryObj
            ? "Semua Produk"
            : activeCategoryObj.nama;

    // Hitung active filter count untuk badge
    const activeFilterCount = [
        activeFilter.tipe && activeFilter.tipe !== "all_products",
        activeFilter.ketersediaan && activeFilter.ketersediaan !== "all",
        activeFilter.min_harga,
        activeFilter.max_harga,
        activeFilter.warna,
        activeFilter.ukuran,
    ].filter(Boolean).length;

    return (
        <StorefrontLayout>
            <Head title="Katalog Produk - CRSL Official Merchandise Store" />

            {/* 1. Bar Kategori Melingkar Horizontal */}
            <CircularCategoriesBar
                categories={listKategori}
                activeCategorySlug={activeCategorySlug}
                onSelectCategory={handleCategoryChange}
            />

            {/* 2. Kontainer Utama Katalog */}
            <div
                className={cn(
                    "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 select-none",
                    className,
                )}
            >
                {/* Search Bar Input */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="mb-6 max-w-md flex items-center gap-2"
                >
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.2]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari produk merchandise CRSL..."
                            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all shadow-2xs font-medium"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Hapus kata kunci pencarian"
                            >
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                        Cari
                    </button>
                </form>

                {/* 3. Section Bar: Judul Kategori & Tombol Drawer Filter & Sort */}
                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {categoryTitle}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            Menampilkan{" "}
                            <span className="font-bold text-slate-800 font-mono">
                                {listProduk.length}
                            </span>{" "}
                            produk
                        </p>
                    </div>

                    {/* Tombol Buka Drawer Filter WAI-ARIA */}
                    <button
                        type="button"
                        role="button"
                        aria-haspopup="dialog"
                        aria-expanded={isFilterOpen}
                        aria-controls="drawer-filter-sort"
                        onClick={() => setIsFilterOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-2xl text-xs sm:text-[13px] font-bold tracking-tight transition-all duration-200 shadow-2xs cursor-pointer active:scale-95 group"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Filter &amp; Urutkan</span>
                        {activeFilterCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-primary group-hover:bg-white text-white group-hover:text-primary text-[10px] flex items-center justify-center font-black font-mono transition-colors">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* 4. Active Filter Badges */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in duration-200">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Filter Aktif:
                        </span>
                        {activeFilter.warna && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-primary border border-red-200/80 rounded-xl text-xs font-bold shadow-2xs">
                                Warna: {activeFilter.warna}
                            </span>
                        )}
                        {activeFilter.ukuran && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-primary border border-red-200/80 rounded-xl text-xs font-bold shadow-2xs">
                                Ukuran: {activeFilter.ukuran}
                            </span>
                        )}
                        {(activeFilter.min_harga || activeFilter.max_harga) && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-primary border border-red-200/80 rounded-xl text-xs font-bold font-mono shadow-2xs">
                                Harga:{" "}
                                {formatRupiah(
                                    Number(activeFilter.min_harga) || 0,
                                )}{" "}
                                -{" "}
                                {activeFilter.max_harga
                                    ? formatRupiah(
                                          Number(activeFilter.max_harga),
                                      )
                                    : "Maksimal"}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleResetAllFilters}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary font-bold underline ml-1 cursor-pointer transition-colors"
                        >
                            <RotateCcw className="w-3 h-3 stroke-[2.2]" />
                            <span>Reset Semua</span>
                        </button>
                    </div>
                )}

                {/* 5. Product Grid (2 Kolom Mobile, 3-4 Kolom Desktop) */}
                {listProduk.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5 pb-16">
                        {listProduk.map((item, idx) => (
                            <ProductCard
                                key={item.id}
                                produk={item}
                                priority={idx < 4}
                            />
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-3xl bg-red-50 text-primary border border-red-100 flex items-center justify-center mx-auto shadow-2xs">
                            <SlidersHorizontal className="w-7 h-7 stroke-[2]" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                Tidak Ada Produk yang Cocok
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                                Coba sesuaikan kata kunci pencarian, pilihan
                                warna, ukuran, atau rentang harga yang dipilih.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleResetAllFilters}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                            <span>Reset Semua Filter</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 6. Filter & Sort Drawer WAI-ARIA */}
            <FilterSortDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={{
                    urutkan: (activeFilter.urutkan as string) || "featured",
                    tipe: (activeFilter.tipe as string) || "all_products",
                    ketersediaan:
                        (activeFilter.ketersediaan as string) || "all",
                    min_harga: activeFilter.min_harga || "",
                    max_harga: activeFilter.max_harga || "",
                    warna: (activeFilter.warna as string) || "",
                    ukuran: (activeFilter.ukuran as string) || "",
                }}
                onApply={handleApplyDrawerFilters}
                priceBounds={priceRangeBounds}
            />

            {/* 7. Sticky Bottom Cart Bar */}
            <StickyCartBar />
        </StorefrontLayout>
    );
}
