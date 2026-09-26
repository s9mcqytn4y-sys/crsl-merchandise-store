import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import { SlidersHorizontal, RotateCcw, X, Search } from "lucide-react";
import ProductCard, { ProductData } from "../Components/Common/ProductCard";
import CircularCategoriesBar, { CircularCategoryItem } from "../Components/Catalog/CircularCategoriesBar";
import FilterSortDrawer, { FilterValues } from "../Components/Catalog/FilterSortDrawer";
import StickyCartBar from "../Components/StickyCartBar";

interface CatalogProps {
    produk?: ProductData[];
    products?: ProductData[];
    kategori?: CircularCategoryItem[];
    categories?: CircularCategoryItem[];
    filter?: Partial<FilterValues> & { kategori?: string; cari?: string };
    filters?: Partial<FilterValues> & { kategori?: string; cari?: string };
    priceRangeBounds?: { min: number; max: number };
}

export default function Catalog({
    produk = [],
    products = [],
    kategori = [],
    categories = [],
    filter = {},
    filters = {},
    priceRangeBounds = { min: 2500, max: 519000 },
}: CatalogProps) {
    const listProduk = produk.length > 0 ? produk : products;
    const listKategori = kategori.length > 0 ? kategori : categories;
    const activeFilter = Object.keys(filter).length > 0 ? filter : filters;

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(activeFilter.cari || "");

    const activeCategorySlug = activeFilter.kategori || "all-products";

    // Handle Kategori Select
    const handleCategoryChange = (slug: string) => {
        const nextFilter: Record<string, any> = { ...activeFilter };
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
        if (searchQuery.trim()) {
            nextFilter.cari = searchQuery.trim();
        } else {
            delete nextFilter.cari;
        }
        router.get("/katalog", nextFilter, { preserveScroll: true });
    };

    // Handle Apply Filters from Drawer Sesuai Screenshot 2
    const handleApplyDrawerFilters = (newValues: FilterValues) => {
        const nextFilter: Record<string, any> = {
            ...activeFilter,
            urutkan: newValues.urutkan,
            tipe: newValues.tipe,
            ketersediaan: newValues.ketersediaan,
        };

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
    const activeCategoryObj = listKategori.find((c) => c.slug === activeCategorySlug);
    const categoryTitle =
        activeCategorySlug === "all-products" || !activeCategoryObj
            ? "All Products"
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
            <Head title="Products - CRSL Official Store - Animals as your bestfriends!" />


            {/* 2. Circular Horizontal Category Carousel Sesuai Screenshot 1 */}
            <CircularCategoriesBar
                categories={listKategori}
                activeCategorySlug={activeCategorySlug}
                onSelectCategory={handleCategoryChange}
            />

            {/* 3. Main Catalog Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Search Bar Opsional */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="mb-6 max-w-md flex items-center gap-2"
                >
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari produk merchandise favoritmu..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E52027] focus:bg-white transition-colors"
                        />
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery("");
                                handleCategoryChange(activeCategorySlug);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </form>

                {/* 4. Section Bar: Title "All Products" di Kiri & Tombol "Filter & Sort" di Kanan Sesuai Screenshot 1 */}
                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {categoryTitle}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Menampilkan {listProduk.length} produk
                        </p>
                    </div>

                    {/* Tombol Outline Pill Merah: Filter & Sort Sesuai Screenshot 1 */}
                    <button
                        type="button"
                        onClick={() => setIsFilterOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-[#E52027] text-[#E52027] hover:bg-[#E52027] hover:text-white rounded-full text-xs sm:text-[13px] font-bold tracking-tight transition-all duration-150 shadow-2xs cursor-pointer active:scale-98"
                        aria-label="Buka Filter dan Pengurutan"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Filter &amp; Sort</span>
                        {activeFilterCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-[#E52027] text-white text-[10px] flex items-center justify-center font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Active Filter Badges */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-xs text-slate-400">Filter Aktif:</span>
                        {activeFilter.warna && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#E52027] rounded-full text-xs font-semibold">
                                Warna: {activeFilter.warna}
                            </span>
                        )}
                        {activeFilter.ukuran && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#E52027] rounded-full text-xs font-semibold">
                                Ukuran: {activeFilter.ukuran}
                            </span>
                        )}
                        {(activeFilter.min_harga || activeFilter.max_harga) && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-[#E52027] rounded-full text-xs font-semibold">
                                Harga: Rp {activeFilter.min_harga || 0} - Rp {activeFilter.max_harga || "Max"}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleResetAllFilters}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#E52027] underline ml-2 cursor-pointer"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Filter</span>
                        </button>
                    </div>
                )}

                {/* 5. Product Grid 2-Column Mobile Sesuai Screenshot 1 */}
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
                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#E52027] flex items-center justify-center mx-auto">
                            <SlidersHorizontal className="w-8 h-8" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            Tidak Ada Produk yang Cocok
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Coba sesuaikan filter warna, ukuran, atau rentang harga untuk menemukan produk yang kamu inginkan.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetAllFilters}
                            className="inline-flex items-center gap-2 bg-[#E52027] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#CC1C22] transition-colors shadow-xs"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Semua Filter</span>
                        </button>
                    </div>
                )}
            </div>

            {/* 6. Filter & Sort Drawer Sesuai Screenshot 2 */}
            <FilterSortDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={{
                    urutkan: (activeFilter.urutkan as string) || "featured",
                    tipe: (activeFilter.tipe as string) || "all_products",
                    ketersediaan: (activeFilter.ketersediaan as string) || "all",
                    min_harga: activeFilter.min_harga || "",
                    max_harga: activeFilter.max_harga || "",
                    warna: (activeFilter.warna as string) || "",
                    ukuran: (activeFilter.ukuran as string) || "",
                }}
                onApply={handleApplyDrawerFilters}
                priceBounds={priceRangeBounds}
            />

            {/* 7. Sticky Bottom Cart Bar Sesuai Screenshot 1 */}
            <StickyCartBar />
        </StorefrontLayout>
    );
}
