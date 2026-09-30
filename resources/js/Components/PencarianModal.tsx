import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import { Link, router } from "@inertiajs/react";
import {
    Search,
    X,
    Trash2,
    Clock,
    ArrowRight,
    CornerDownLeft,
    Loader2,
    Package,
    Tag,
} from "lucide-react";
import { toast } from "sonner";
import { SITUS_CONFIG } from "../Config/situsConfig";
import { formatRupiah } from "../Utils/formatters";
import { cn } from "../lib/utils";

export interface SearchProductResult {
    id: number | string;
    nama: string;
    slug: string;
    harga: number;
    harga_diskon?: number | null;
    gambar?: string | null;
    kategori?: string;
}

interface PencarianModalProps {
    isOpen: boolean;
    onClose: () => void;
    rekomendasiFallback?: SearchProductResult[];
    className?: string;
}

const STORAGE_RECENT_SEARCHES = "crsl_recent_searches";
const STORAGE_RECENT_VIEWED = "crsl_recently_viewed";

/**
 * Normalisasi URL gambar aman (mendukung path storage lokal Laravel & CDN remote)
 */
function normalizeMediaUrl(url?: string | null): string {
    if (!url) return "";
    const clean = url.trim();
    if (
        clean.startsWith("http://") ||
        clean.startsWith("https://") ||
        clean.startsWith("data:")
    ) {
        return clean;
    }
    if (clean.startsWith("/storage/")) return clean;
    if (clean.startsWith("storage/")) return `/${clean}`;
    if (clean.startsWith("/")) return clean;
    return `/storage/${clean}`;
}

export default function PencarianModal({
    isOpen,
    onClose,
    rekomendasiFallback = [],
    className,
}: PencarianModalProps) {
    const [query, setQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<SearchProductResult[]>(
        [],
    );
    const [liveResults, setLiveResults] = useState<SearchProductResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const searchAbortRef = useRef<AbortController | null>(null);

    // Ambil kata populer dari konfigurasi situs atau fallback terstandarisasi
    const popularTerms = SITUS_CONFIG.pencarianPopuler || [
        "Slingbag",
        "T-Shirt",
        "Tumblr",
        "Backpack",
        "Wallet",
        "Oversized",
    ];

    // Sinkronisasi data lokal saat modal dibuka
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setLiveResults([]);
            setIsSearching(false);
            return;
        }

        // 1. Baca riwayat kata kunci pencarian
        try {
            const savedSearches = localStorage.getItem(STORAGE_RECENT_SEARCHES);
            if (savedSearches) {
                setRecentSearches(JSON.parse(savedSearches));
            }
        } catch {
            setRecentSearches([]);
        }

        // 2. Baca riwayat produk terakhir dilihat secara riil
        try {
            const savedViewed = localStorage.getItem(STORAGE_RECENT_VIEWED);
            if (savedViewed) {
                const parsed = JSON.parse(savedViewed);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setRecentlyViewed(parsed.slice(0, 4));
                } else {
                    setRecentlyViewed(rekomendasiFallback.slice(0, 4));
                }
            } else {
                setRecentlyViewed(rekomendasiFallback.slice(0, 4));
            }
        } catch {
            setRecentlyViewed(rekomendasiFallback.slice(0, 4));
        }

        // Lock background scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Auto-focus input
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 50);

        return () => {
            document.body.style.overflow = originalOverflow;
            clearTimeout(timer);
        };
    }, [isOpen, rekomendasiFallback]);

    // Handle Escape Key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Debounced Live Search Autocomplete
    useEffect(() => {
        const trimmed = query.trim();

        if (trimmed.length < 2) {
            setLiveResults([]);
            setIsSearching(false);
            return;
        }

        if (searchAbortRef.current) {
            searchAbortRef.current.abort();
        }

        const controller = new AbortController();
        searchAbortRef.current = controller;
        setIsSearching(true);

        const debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/produk/cari?q=${encodeURIComponent(trimmed)}`,
                    {
                        signal: controller.signal,
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With": "XMLHttpRequest",
                        },
                    },
                );

                if (res.ok) {
                    const data = await res.json();
                    if (data?.sukses && Array.isArray(data?.data)) {
                        setLiveResults(data.data.slice(0, 6));
                    } else {
                        setLiveResults([]);
                    }
                }
            } catch (err: unknown) {
                if ((err as Error)?.name !== "AbortError") {
                    setLiveResults([]);
                }
            } finally {
                setIsSearching(false);
            }
        }, 250);

        return () => {
            clearTimeout(debounceTimer);
            controller.abort();
        };
    }, [query]);

    const saveSearchTerm = (term: string) => {
        const trimmed = term.trim();
        if (trimmed.length < 2) return;

        const updated = [
            trimmed,
            ...recentSearches.filter(
                (item) => item.toLowerCase() !== trimmed.toLowerCase(),
            ),
        ].slice(0, 8);

        setRecentSearches(updated);
        try {
            localStorage.setItem(
                STORAGE_RECENT_SEARCHES,
                JSON.stringify(updated),
            );
        } catch {
            // Ignore storage quota
        }
    };

    const eksekusiCari = (term: string) => {
        const target = term.trim();
        if (!target) return;
        saveSearchTerm(target);
        onClose();
        router.get("/katalog", { cari: target }, { preserveState: true });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        eksekusiCari(query);
    };

    const handleRemoveRecentItem = (
        termToRemove: string,
        e: React.MouseEvent,
    ) => {
        e.stopPropagation();
        const updated = recentSearches.filter((item) => item !== termToRemove);
        setRecentSearches(updated);
        try {
            localStorage.setItem(
                STORAGE_RECENT_SEARCHES,
                JSON.stringify(updated),
            );
        } catch {}
    };

    const handleClearAllHistory = () => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(STORAGE_RECENT_SEARCHES);
            toast.info("Riwayat pencarian telah dibersihkan.");
        } catch {}
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 px-3 sm:px-4 bg-slate-950/65 backdrop-blur-xs select-none animate-in fade-in duration-150"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Pencarian Produk CRSL"
        >
            <div
                className={cn(
                    "bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[88dvh] animate-in zoom-in-95 duration-150",
                    className,
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Bar Input Container */}
                <form
                    onSubmit={handleFormSubmit}
                    className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center gap-2.5 sm:gap-3 bg-white shrink-0"
                >
                    <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
                    <input
                        ref={inputRef}
                        type="search"
                        role="searchbox"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari ransel, tumbler, kaos, atau karakter..."
                        className="flex-1 bg-transparent border-none text-xs sm:text-sm md:text-base text-slate-900 focus:outline-none font-bold placeholder-slate-400"
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck={false}
                    />

                    {isSearching && (
                        <Loader2 className="w-4 h-4 text-[#E52027] animate-spin shrink-0" />
                    )}

                    {query.trim().length > 0 && !isSearching && (
                        <button
                            type="submit"
                            className="p-1.5 bg-red-50 text-[#E52027] hover:bg-[#E52027] hover:text-white rounded-xl transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                            title="Tekan Enter untuk mencari"
                        >
                            <CornerDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                    )}

                    {query.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                inputRef.current?.focus();
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Bersihkan input"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </form>

                {/* Body Content */}
                <div className="overflow-y-auto p-4 sm:p-5 space-y-5 no-scrollbar overscroll-contain flex-1">
                    {/* Hasil Live Search (Jika User Sedang Mengetik) */}
                    {query.trim().length >= 2 ? (
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                Hasil Pencarian Cepat
                            </h4>

                            {liveResults.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {liveResults.map((item) => {
                                        const finalPrice =
                                            item.harga_diskon &&
                                            item.harga_diskon < item.harga
                                                ? item.harga_diskon
                                                : item.harga;
                                        const hasDiscount = Boolean(
                                            item.harga_diskon &&
                                            item.harga_diskon < item.harga,
                                        );

                                        return (
                                            <Link
                                                key={item.id}
                                                href={`/produk/${item.slug}`}
                                                onClick={onClose}
                                                className="py-2.5 flex items-center gap-3 hover:bg-slate-50 rounded-2xl px-2 transition-colors group cursor-pointer"
                                            >
                                                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                                    {item.gambar ? (
                                                        <img
                                                            src={normalizeMediaUrl(
                                                                item.gambar,
                                                            )}
                                                            alt={item.nama}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Package className="w-5 h-5 stroke-[1.5]" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#E52027] truncate transition-colors">
                                                        {item.nama}
                                                    </h5>
                                                    <div className="flex items-center gap-2 mt-0.5 font-mono text-xs">
                                                        <span className="font-black text-slate-900">
                                                            {formatRupiah(
                                                                finalPrice,
                                                            )}
                                                        </span>
                                                        {hasDiscount && (
                                                            <span className="text-[10px] text-slate-400 line-through">
                                                                {formatRupiah(
                                                                    item.harga,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#E52027] group-hover:translate-x-0.5 transition-all shrink-0" />
                                            </Link>
                                        );
                                    })}

                                    <div className="pt-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => eksekusiCari(query)}
                                            className="text-xs font-bold text-[#E52027] hover:underline inline-flex items-center gap-1.5 py-1"
                                        >
                                            <span>
                                                Lihat semua hasil untuk "{query}
                                                "
                                            </span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : !isSearching ? (
                                <div className="py-6 text-center space-y-1 text-slate-500">
                                    <p className="text-xs font-bold text-slate-700">
                                        Tidak ada produk yang cocok
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                        Coba gunakan kata kunci umum seperti
                                        "tas", "kaos", atau "dompet".
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <>
                            {/* Riwayat Pencarian Terakhir */}
                            {recentSearches.length > 0 && (
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />{" "}
                                            Pencarian Terakhir
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleClearAllHistory}
                                            className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Hapus</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((item) => (
                                            <div
                                                key={item}
                                                onClick={() =>
                                                    eksekusiCari(item)
                                                }
                                                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-[#E52027] text-slate-800 px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors group"
                                            >
                                                <span>{item}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleRemoveRecentItem(
                                                            item,
                                                            e,
                                                        )
                                                    }
                                                    className="text-slate-400 group-hover:text-[#E52027] p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                                                    aria-label={`Hapus ${item} dari riwayat`}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Kata Kunci Populer */}
                            <div className="space-y-2.5">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                    Paling Banyak Dicari
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {popularTerms.map((term) => (
                                        <button
                                            key={term}
                                            type="button"
                                            onClick={() => eksekusiCari(term)}
                                            className="px-3.5 py-1.5 bg-slate-50 hover:bg-[#E52027] text-slate-700 hover:text-white border border-slate-200/80 hover:border-[#E52027] rounded-full text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rekomendasi Terakhir Dilihat (Data Riil) */}
                            {recentlyViewed.length > 0 && (
                                <div className="space-y-3 pt-3 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                            Terakhir Dilihat
                                        </h4>
                                        <Link
                                            href="/katalog"
                                            onClick={onClose}
                                            className="text-xs font-bold text-[#E52027] hover:underline inline-flex items-center gap-1"
                                        >
                                            <span>Lihat Katalog</span>
                                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {recentlyViewed.map((prod) => (
                                            <Link
                                                key={prod.id}
                                                href={`/produk/${prod.slug}`}
                                                onClick={onClose}
                                                className="group flex flex-col bg-slate-50/70 hover:bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all"
                                            >
                                                <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200/80 mb-2">
                                                    {prod.gambar ? (
                                                        <img
                                                            src={normalizeMediaUrl(
                                                                prod.gambar,
                                                            )}
                                                            alt={prod.nama}
                                                            width={120}
                                                            height={120}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Package className="w-6 h-6 stroke-[1.2]" />
                                                        </div>
                                                    )}
                                                </div>

                                                <h5 className="font-bold text-[11px] text-slate-900 line-clamp-2 leading-snug group-hover:text-[#E52027] transition-colors mb-1">
                                                    {prod.nama}
                                                </h5>
                                                <div className="mt-auto font-black text-xs text-[#E52027] font-mono">
                                                    {formatRupiah(prod.harga)}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
