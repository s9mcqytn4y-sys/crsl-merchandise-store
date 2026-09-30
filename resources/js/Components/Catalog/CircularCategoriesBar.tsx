import { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CircularCategoryItem {
    id: number | string;
    nama: string;
    slug: string;
    gambar?: string | null;
}

interface CircularCategoriesBarProps {
    categories: CircularCategoryItem[];
    activeCategorySlug?: string;
    onSelectCategory: (slug: string) => void;
    className?: string;
}

// Fallback visual data untuk kategori lingkaran jika gambar belum diset di CMS
const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
    "back-to-school-essentials": "/assets/kategori/kategori-backpack.webp",
    "bts-collection": "/assets/kategori/kategori-backpack.webp",
    "all-products": "/assets/gambar/banner-1.webp",
    discounts: "/assets/kategori/kategori-clearance.webp",
    "backpack-collection": "/assets/kategori/kategori-backpack.webp",
    "slingbag-collection": "/assets/kategori/kategori-slingbag.webp",
    "tops-collection": "/assets/kategori/kategori-tees.webp",
    "bottoms-collection": "/assets/kategori/kategori-pants-skirt.webp",
    "outerwears-collection": "/assets/kategori/kategori-outerwear.webp",
    outerwear: "/assets/kategori/kategori-outerwear.webp",
    "footwear-collection": "/assets/kategori/kategori-shoes.webp",
    "wallet-accessories": "/assets/kategori/kategori-wallet.webp",
    "watch-collection": "/assets/kategori/kategori-watch.webp",
    "headwear-collection": "/assets/kategori/kategori-hat-helmet.webp",
    accessories: "/assets/kategori/kategori-wallet.webp",
    "tumbler-collection": "/assets/kategori/kategori-tumbler.webp",
};

const DEFAULT_CATEGORY_FALLBACK = "/assets/kategori/kategori-backpack.webp";

/**
 * Normalisasi URL gambar aman (menangani path storage lokal & CDN remote)
 */
function normalizeCategoryImageUrl(gambar?: string | null): string {
    if (!gambar) return "";
    const g = gambar.trim();
    if (
        g.startsWith("http://") ||
        g.startsWith("https://") ||
        g.startsWith("data:")
    ) {
        return g;
    }
    if (g.startsWith("/storage/")) return g;
    if (g.startsWith("storage/")) return `/${g}`;
    if (g.startsWith("/")) return g;
    return `/storage/${g}`;
}

export default function CircularCategoriesBar({
    categories = [],
    activeCategorySlug = "all-products",
    onSelectCategory,
    className,
}: CircularCategoriesBarProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeItemRef = useRef<HTMLButtonElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Filter daftar kategori agar "all-products" tidak duplikat dengan tombol utama
    const displayList = categories.filter((c) => c.slug !== "all-products");

    // Evaluasi status scroll container
    const checkScrollButtons = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 4);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }, []);

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener("resize", checkScrollButtons);
        return () => window.removeEventListener("resize", checkScrollButtons);
    }, [checkScrollButtons, categories]);

    // Auto-scroll ke kategori aktif saat komponen dimuat atau kategori berubah
    useEffect(() => {
        if (activeItemRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const target = activeItemRef.current;

            const targetLeft = target.offsetLeft;
            const targetWidth = target.offsetWidth;
            const containerWidth = container.offsetWidth;

            container.scrollTo({
                left: targetLeft - containerWidth / 2 + targetWidth / 2,
                behavior: "smooth",
            });
        }
    }, [activeCategorySlug]);

    const handleScroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.75;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const isAllActive =
        !activeCategorySlug || activeCategorySlug === "all-products";

    return (
        <nav
            aria-label="Kategori Pilihan Produk"
            className={cn(
                "w-full bg-white py-3 sm:py-4 border-b border-slate-100 relative group select-none",
                className,
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
                {/* Tombol Geser Kiri (Desktop) */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => handleScroll("left")}
                        className="hidden md:flex absolute -left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-[#E52027] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        aria-label="Geser kategori ke kiri"
                    >
                        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    </button>
                )}

                {/* Tombol Geser Kanan (Desktop) */}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={() => handleScroll("right")}
                        className="hidden md:flex absolute -right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-[#E52027] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        aria-label="Geser kategori ke kanan"
                    >
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                )}

                {/* Kontainer Horizontal Scroll */}
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollButtons}
                    className="flex items-start gap-3.5 sm:gap-6 overflow-x-auto no-scrollbar overscroll-x-contain py-1"
                >
                    {/* 1. Opsi "All Products" Bulat Pertama */}
                    <button
                        ref={isAllActive ? activeItemRef : undefined}
                        type="button"
                        onClick={() => onSelectCategory("all-products")}
                        aria-pressed={isAllActive}
                        className="flex flex-col items-center gap-1.5 shrink-0 group/item cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:ring-offset-2 rounded-2xl p-1"
                        aria-label="Kategori Semua Produk"
                    >
                        <div
                            className={cn(
                                "w-14 h-14 sm:w-18 sm:h-18 rounded-full overflow-hidden transition-all duration-300 border-2 p-0.5",
                                isAllActive
                                    ? "border-[#E52027] ring-2 ring-red-100 scale-105 shadow-2xs"
                                    : "border-slate-200 group-hover/item:border-slate-400",
                            )}
                        >
                            <div
                                className={cn(
                                    "w-full h-full rounded-full flex items-center justify-center text-white text-[11px] sm:text-xs font-black tracking-tight transition-colors",
                                    isAllActive
                                        ? "bg-[#E52027]"
                                        : "bg-slate-900 group-hover/item:bg-slate-800",
                                )}
                            >
                                ALL
                            </div>
                        </div>
                        <span
                            className={cn(
                                "text-[10px] sm:text-[11px] text-center max-w-[68px] sm:max-w-[76px] leading-tight line-clamp-2 transition-colors",
                                isAllActive
                                    ? "text-[#E52027] font-bold"
                                    : "text-slate-700 font-medium group-hover/item:text-slate-900",
                            )}
                        >
                            All Products
                        </span>
                    </button>

                    {/* 2. Daftar Kategori Lainnya */}
                    {displayList.map((cat) => {
                        const isActive = activeCategorySlug === cat.slug;
                        const rawImage =
                            cat.gambar ||
                            FALLBACK_CATEGORY_IMAGES[cat.slug] ||
                            DEFAULT_CATEGORY_FALLBACK;
                        const imageSrc = normalizeCategoryImageUrl(rawImage);

                        return (
                            <button
                                key={cat.id}
                                ref={isActive ? activeItemRef : undefined}
                                type="button"
                                onClick={() => onSelectCategory(cat.slug)}
                                aria-pressed={isActive}
                                className="flex flex-col items-center gap-1.5 shrink-0 group/item cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:ring-offset-2 rounded-2xl p-1"
                                aria-label={`Kategori ${cat.nama}`}
                            >
                                <div
                                    className={cn(
                                        "w-14 h-14 sm:w-18 sm:h-18 rounded-full overflow-hidden transition-all duration-300 border-2 p-0.5 bg-slate-50",
                                        isActive
                                            ? "border-[#E52027] ring-2 ring-red-100 scale-105 shadow-2xs"
                                            : "border-slate-200 group-hover/item:border-slate-400",
                                    )}
                                >
                                    <img
                                        src={imageSrc}
                                        alt={cat.nama}
                                        className="w-full h-full object-cover rounded-full group-hover/item:scale-110 transition-transform duration-300"
                                        loading="lazy"
                                        width={72}
                                        height={72}
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.onerror = null;
                                            target.src =
                                                DEFAULT_CATEGORY_FALLBACK;
                                        }}
                                    />
                                </div>
                                <span
                                    className={cn(
                                        "text-[10px] sm:text-[11px] text-center max-w-[68px] sm:max-w-[76px] leading-tight line-clamp-2 transition-colors",
                                        isActive
                                            ? "text-[#E52027] font-bold"
                                            : "text-slate-700 font-medium group-hover/item:text-slate-900",
                                    )}
                                >
                                    {cat.nama}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
