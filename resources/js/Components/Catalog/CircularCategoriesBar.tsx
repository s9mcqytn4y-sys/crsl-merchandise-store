import React, { useRef } from "react";
import { Link } from "@inertiajs/react";

export interface CircularCategoryItem {
    id: number | string;
    nama: string;
    slug: string;
    gambar?: string;
}

interface CircularCategoriesBarProps {
    categories: CircularCategoryItem[];
    activeCategorySlug: string;
    onSelectCategory: (slug: string) => void;
}

// Fallback visual data untuk kategori lingkaran jika gambar belum diset
const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
    "back-to-school-essentials": "/assets/kategori/kategori-backpack.webp",
    "bts-collection": "/assets/kategori/kategori-backpack.webp",
    "all-products": "/assets/gambar/banner-1.webp",
    "discounts": "/assets/kategori/kategori-clearance.webp",
    "backpack-collection": "/assets/kategori/kategori-backpack.webp",
    "slingbag-collection": "/assets/kategori/kategori-slingbag.webp",
    "tops-collection": "/assets/kategori/kategori-tees.webp",
    "bottoms-collection": "/assets/kategori/kategori-pants-skirt.webp",
    "outerwears-collection": "/assets/kategori/kategori-outerwear.webp",
    "outerwear": "/assets/kategori/kategori-outerwear.webp",
    "footwear-collection": "/assets/kategori/kategori-shoes.webp",
    "wallet-accessories": "/assets/kategori/kategori-wallet.webp",
    "watch-collection": "/assets/kategori/kategori-watch.webp",
    "headwear-collection": "/assets/kategori/kategori-hat-helmet.webp",
    "accessories": "/assets/kategori/kategori-wallet.webp",
    "tumbler-collection": "/assets/kategori/kategori-tumbler.webp",
};

export default function CircularCategoriesBar({
    categories = [],
    activeCategorySlug,
    onSelectCategory,
}: CircularCategoriesBarProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Filter daftar kategori yang ditampilkan di bar bulat
    const displayList = categories.filter(
        (c) => c.slug !== "all-products"
    );

    return (
        <div className="w-full bg-white py-3 border-b border-slate-100">
            <div
                ref={scrollContainerRef}
                className="max-w-7xl mx-auto px-4 sm:px-6 flex items-start gap-4 sm:gap-6 overflow-x-auto scrollbar-none overscroll-x-contain select-none"
            >
                {/* 1. Opsi "All Products" Bulat Pertama */}
                <button
                    type="button"
                    onClick={() => onSelectCategory("all-products")}
                    className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer focus:outline-none"
                    aria-label="Kategori Semua Produk"
                >
                    <div
                        className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full overflow-hidden transition-all duration-200 border-2 p-0.5 ${
                            !activeCategorySlug || activeCategorySlug === "all-products"
                                ? "border-[#E52027] ring-2 ring-red-100 scale-105"
                                : "border-slate-200 group-hover:border-slate-400"
                        }`}
                    >
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] sm:text-xs font-black tracking-tight">
                            ALL
                        </div>
                    </div>
                    <span
                        className={`text-[10px] sm:text-[11px] text-center font-medium max-w-[68px] sm:max-w-[76px] leading-tight line-clamp-2 ${
                            !activeCategorySlug || activeCategorySlug === "all-products"
                                ? "text-[#E52027] font-bold"
                                : "text-slate-700 group-hover:text-slate-900"
                        }`}
                    >
                        All Products
                    </span>
                </button>

                {/* 2. Daftar Kategori Lainnya Berdasarkan Screenshot 1 */}
                {displayList.map((cat) => {
                    const isActive = activeCategorySlug === cat.slug;
                    const imageSrc =
                        cat.gambar ||
                        FALLBACK_CATEGORY_IMAGES[cat.slug] ||
                        "/assets/kategori/kategori-backpack.webp";

                    return (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => onSelectCategory(cat.slug)}
                            className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer focus:outline-none"
                            aria-label={`Kategori ${cat.nama}`}
                        >
                            <div
                                className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full overflow-hidden transition-all duration-200 border-2 p-0.5 ${
                                    isActive
                                        ? "border-[#E52027] ring-2 ring-red-100 scale-105"
                                        : "border-slate-200 group-hover:border-slate-400"
                                }`}
                            >
                                <img
                                    src={imageSrc}
                                    alt={cat.nama}
                                    className="w-full h-full object-cover rounded-full group-hover:scale-108 transition-transform duration-300"
                                    loading="lazy"
                                    width={72}
                                    height={72}
                                    onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = "/assets/kategori/kategori-backpack.webp";
                                    }}
                                />
                            </div>
                            <span
                                className={`text-[10px] sm:text-[11px] text-center font-medium max-w-[68px] sm:max-w-[76px] leading-tight line-clamp-2 ${
                                    isActive
                                        ? "text-[#E52027] font-bold"
                                        : "text-slate-700 group-hover:text-slate-900"
                                }`}
                            >
                                {cat.nama}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
