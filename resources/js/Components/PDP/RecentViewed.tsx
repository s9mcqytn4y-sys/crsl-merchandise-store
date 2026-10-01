import {
    useEffect,
    useState,
    useRef,
    useMemo,
    useCallback,
} from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight, Package, Tag } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

export interface ViewedProductItem {
    id: number | string;
    nama: string;
    slug: string;
    harga: number | string;
    harga_diskon?: number | string | null;
    gambar?: string | null;
}

interface RecentViewedProps {
    currentProduct?: ViewedProductItem;
    fallbackRecommendations?: ViewedProductItem[];
    className?: string;
}

const STORAGE_KEY = "crsl_recently_viewed";
const MAX_STORED = 10;
const PLACEHOLDER_IMAGE = "/assets/gambar/produk-placeholder.webp";

/**
 * Normalisasi URL gambar aman (mendukung path storage lokal & remote CDN)
 */
function normalizeImageUrl(gambar?: string | null): string {
    if (!gambar) return PLACEHOLDER_IMAGE;
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

export default function RecentViewed({
    currentProduct,
    fallbackRecommendations = [],
    className,
}: RecentViewedProps) {
    const [viewedItems, setViewedItems] = useState<ViewedProductItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>(
        {},
    );

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // 1. Sinkronisasi Penyimpanan Riwayat di LocalStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            let parsed: ViewedProductItem[] = raw ? JSON.parse(raw) : [];

            if (currentProduct && currentProduct.id) {
                // Hapus duplikasi produk yang sedang aktif
                parsed = parsed.filter(
                    (item) => String(item.id) !== String(currentProduct.id),
                );
                // Sisipkan produk di urutan terdepan
                parsed.unshift(currentProduct);
                // Batasi kuota riwayat penyimpanan
                parsed = parsed.slice(0, MAX_STORED);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            }

            // Produk yang sedang dibuka dikeluarkan dari daftar tampil
            const displayed = parsed.filter(
                (item) =>
                    !currentProduct ||
                    String(item.id) !== String(currentProduct.id),
            );
            setViewedItems(displayed);
        } catch {
            // Abaikan jika localStorage dibatasi atau browser dalam mode private
        } finally {
            setIsLoaded(true);
        }
    }, [currentProduct?.id]);

    // 2. Padukan dengan Rekomendasi Fallback jika Riwayat Masih Minim (< 3)
    const displayList = useMemo(() => {
        if (!isLoaded) return [];

        if (viewedItems.length >= 3) {
            return viewedItems;
        }

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

    // 3. Evaluasi Status Tombol Navigasi Scroll
    const checkScrollBounds = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 4);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }, []);

    useEffect(() => {
        checkScrollBounds();
        window.addEventListener("resize", checkScrollBounds);
        return () => window.removeEventListener("resize", checkScrollBounds);
    }, [checkScrollBounds, displayList]);

    const handleScroll = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;
        const offset = direction === "left" ? -280 : 280;
        scrollContainerRef.current.scrollBy({
            left: offset,
            behavior: "smooth",
        });
    };

    const handleImageError = (id: string | number) => {
        setBrokenImages((prev) => ({ ...prev, [String(id)]: true }));
    };

    if (!isLoaded || displayList.length === 0) return null;

    const isActualHistory = viewedItems.length > 0;

    return (
        <section
            className={cn(
                "pt-10 pb-6 border-t border-slate-100 select-none",
                className,
            )}
            aria-labelledby="heading-recently-viewed"
        >
            {/* Header Seksi & Kontrol Navigasi */}
            <div className="flex items-center justify-between mb-5">
                <div className="space-y-0.5">
                    <h3
                        id="heading-recently-viewed"
                        className="text-base sm:text-lg font-black text-slate-900 tracking-tight"
                    >
                        {isActualHistory
                            ? "Terakhir Dilihat"
                            : "Mungkin Kamu Suka"}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                        {isActualHistory
                            ? "Produk yang baru saja Anda jelajahi"
                            : "Pilihan merchandise spesial untuk melengkapi gayamu"}
                    </p>
                </div>

                {/* Tombol Navigasi Desktop */}
                {displayList.length > 3 && (
                    <div className="hidden sm:flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleScroll("left")}
                            disabled={!canScrollLeft}
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                            aria-label="Geser ke kiri"
                        >
                            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleScroll("right")}
                            disabled={!canScrollRight}
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                            aria-label="Geser ke kanan"
                        >
                            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                    </div>
                )}
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScrollBounds}
                className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-3 scroll-smooth no-scrollbar snap-x snap-mandatory"
            >
                {displayList.map((item) => {
                    // Normalisasi numerik ketat anti-lexicographical bug
                    const hargaDasar = Number(item.harga) || 0;
                    const rawDiskon =
                        item.harga_diskon !== null &&
                        item.harga_diskon !== undefined
                            ? Number(item.harga_diskon)
                            : null;

                    const hasDiscount =
                        rawDiskon !== null &&
                        !isNaN(rawDiskon) &&
                        rawDiskon > 0 &&
                        rawDiskon < hargaDasar;

                    const effectivePrice =
                        hasDiscount && rawDiskon !== null
                            ? rawDiskon
                            : hargaDasar;

                    const diskonPersen =
                        hasDiscount && hargaDasar > 0
                            ? Math.round(
                                  ((hargaDasar - (rawDiskon as number)) /
                                      hargaDasar) *
                                      100,
                              )
                            : 0;

                    const isImgBroken = brokenImages[String(item.id)];
                    const imageUrl = normalizeImageUrl(item.gambar);

                    return (
                        <Link
                            key={item.id}
                            href={`/produk/${encodeURIComponent(item.slug)}`}
                            className="snap-start w-40 sm:w-48 md:w-52 shrink-0 group bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                        >
                            {/* Gambar Produk */}
                            <div className="aspect-square w-full bg-slate-50 overflow-hidden relative">
                                {imageUrl && !isImgBroken ? (
                                    <img
                                        src={imageUrl}
                                        alt={item.nama}
                                        width={220}
                                        height={220}
                                        loading="lazy"
                                        onError={() =>
                                            handleImageError(item.id)
                                        }
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                                        <Package className="w-8 h-8 stroke-[1.2]" />
                                    </div>
                                )}

                                {/* Badge Diskon Dinamis */}
                                {hasDiscount && diskonPersen > 0 && (
                                    <span className="absolute top-2 left-2 bg-primary text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5 font-mono">
                                        <Tag className="w-2.5 h-2.5 stroke-[2.5]" />
                                        <span>-{diskonPersen}%</span>
                                    </span>
                                )}
                            </div>

                            {/* Deskripsi & Harga */}
                            <div className="p-3 space-y-1">
                                <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                    {item.nama}
                                </h4>

                                <div className="flex items-baseline gap-1.5 pt-1 tabular-nums flex-wrap font-mono">
                                    <span className="text-xs sm:text-[13px] font-black text-slate-900">
                                        {formatRupiah(effectivePrice)}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                            {formatRupiah(hargaDasar)}
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
