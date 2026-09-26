import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { formatRupiah } from "../..//Utils/formatters";

export interface ViewedProductItem {
    id: number | string;
    nama: string;
    slug: string;
    harga: number;
    harga_diskon?: number | null;
    gambar?: string | null;
}

interface RecentViewedProps {
    currentProduct?: ViewedProductItem;
    fallbackRecommendations?: ViewedProductItem[];
}

const STORAGE_KEY = "crsl_recently_viewed";
const MAX_STORED = 10;

export default function RecentViewed({
    currentProduct,
    fallbackRecommendations = [],
}: RecentViewedProps) {
    const [viewedItems, setViewedItems] = useState<ViewedProductItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            let parsed: ViewedProductItem[] = raw ? JSON.parse(raw) : [];

            if (currentProduct && currentProduct.id) {
                // Hapus duplikasi produk yang sedang dibuka
                parsed = parsed.filter(
                    (item) => String(item.id) !== String(currentProduct.id),
                );
                // Sisipkan di posisi terdepan
                parsed.unshift(currentProduct);
                // Simpan maksimal 10 produk
                parsed = parsed.slice(0, MAX_STORED);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }

            // Produk yang sedang dilihat dikeluarkan dari daftar tampil
            const displayed = parsed.filter(
                (item) =>
                    !currentProduct ||
                    String(item.id) !== String(currentProduct.id),
            );
            setViewedItems(displayed);
        } catch {
            // Abaikan jika storage disabled/private mode
        } finally {
            setIsLoaded(true);
        }
    }, [currentProduct?.id]);

    // Jika riwayat dilihat masih sedikit (< 3 produk), padukan dengan rekomendasi fallback
    const displayList = useMemo(() => {
        if (!isLoaded) return [];

        if (viewedItems.length >= 3) {
            return viewedItems;
        }

        // Gabungkan viewed items + fallback yang unik
        const combined = [...viewedItems];
        const existingIds = new Set(combined.map((item) => String(item.id)));
        if (currentProduct) {
            existingIds.add(String(currentProduct.id));
        }

        for (const rec of fallbackRecommendations) {
            if (!existingIds.has(String(rec.id))) {
                combined.push(rec);
                existingIds.add(String(rec.id));
            }
            if (combined.length >= 6) break;
        }

        return combined;
    }, [viewedItems, fallbackRecommendations, currentProduct, isLoaded]);

    const handleScroll = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;
        const offset = direction === "left" ? -260 : 260;
        scrollContainerRef.current.scrollBy({
            left: offset,
            behavior: "smooth",
        });
    };

    if (!isLoaded || displayList.length === 0) return null;

    const isActualHistory = viewedItems.length > 0;

    return (
        <section
            className="pt-10 pb-6 border-t border-slate-100 select-none"
            aria-labelledby="heading-recently-viewed"
        >
            <div className="flex items-center justify-between mb-5">
                <h3
                    id="heading-recently-viewed"
                    className="text-base sm:text-lg font-bold text-slate-800 tracking-normal"
                >
                    {isActualHistory
                        ? "Recently Viewed"
                        : "You Might Also Like"}
                </h3>

                {/* Tombol Navigasi Desktop */}
                {displayList.length > 3 && (
                    <div className="hidden sm:flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleScroll("left")}
                            className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                            aria-label="Geser ke kiri"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleScroll("right")}
                            className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                            aria-label="Geser ke kanan"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-3 scroll-smooth no-scrollbar snap-x snap-mandatory"
            >
                {displayList.map((item) => {
                    const price =
                        item.harga_diskon && item.harga_diskon < item.harga
                            ? item.harga_diskon
                            : item.harga;
                    const hasDiscount =
                        Boolean(item.harga_diskon) &&
                        item.harga_diskon! < item.harga;

                    return (
                        <Link
                            key={item.id}
                            href={`/produk/${item.slug}`}
                            className="snap-start w-40 sm:w-46.25 md:w-50 shrink-0 group bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                        >
                            {/* Gambar Produk */}
                            <div className="aspect-square w-full bg-slate-50 overflow-hidden relative">
                                {item.gambar ? (
                                    <img
                                        src={item.gambar}
                                        alt={item.nama}
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <Package className="w-8 h-8 stroke-[1.2]" />
                                    </div>
                                )}

                                {hasDiscount && (
                                    <span className="absolute top-2 left-2 bg-primary text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                                        SALE
                                    </span>
                                )}
                            </div>

                            {/* Deskripsi & Harga */}
                            <div className="p-3 space-y-1">
                                <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                    {item.nama}
                                </h4>
                                <div className="flex items-baseline gap-1.5 pt-1 tabular-nums flex-wrap">
                                    <span className="text-xs sm:text-[13px] font-bold text-slate-900">
                                        {formatRupiah(price)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                            {formatRupiah(item.harga)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
