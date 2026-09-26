import React, { useState, useEffect, useRef } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Search,
    X,
    Trash2,
    Clock,
    ArrowRight,
    CornerDownLeft,
} from "lucide-react";
import { toast } from "sonner";
import { SITUS_CONFIG } from "../Config/situsConfig";

interface PencarianModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatRupiah(num: number): string {
    return rupiahFormatter.format(num || 0);
}

// Rekomendasi Terakhir Dilihat (Mock/Client Store)
const RECENT_VIEWED = [
    {
        id: 1,
        nama: "CRSL Moccapo Tees | T-Shirt Mocca Unisex",
        harga: 188100,
        hargaAsli: 209000,
        gambar: "/assets/gambar/cassie-wallet.webp",
        badge: "Low Stock",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        slug: "crsl-moccapo-tees",
    },
    {
        id: 2,
        nama: "CRSL Drinke Tumblr Series | Botol Stainless",
        harga: 289000,
        hargaAsli: 289000,
        gambar: "/assets/gambar/drinke-tumblr.webp",
        badge: "Pre Order",
        badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
        slug: "crsl-drinke-tumblr-series",
    },
    {
        id: 3,
        nama: "CRSL Cassie Wallet | Dompet Canvas Plaid",
        harga: 179100,
        hargaAsli: 199000,
        gambar: "/assets/gambar/cassie-wallet.webp",
        badge: "Best Seller",
        badgeColor: "bg-red-100 text-[#E52027] border-red-200",
        slug: "crsl-cassie-wallet",
    },
];

export default function PencarianModal({
    isOpen,
    onClose,
}: PencarianModalProps) {
    const [query, setQuery] = useState("");
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Ambil data kata populer dari single-source-of-truth situsConfig
    const popularTerms = SITUS_CONFIG.pencarianPopuler || [
        "slingbag",
        "topi",
        "monie",
        "mosko",
        "ruby",
        "wallet",
        "yori",
        "helm",
    ];

    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            return;
        }

        try {
            const saved = localStorage.getItem("crsl_recent_searches");
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Gagal membaca riwayat pencarian:", e);
        }

        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Handle shortcut keyboard Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const saveSearchTerm = (term: string) => {
        const trimmed = term.trim();
        if (trimmed.length < 2) return;

        const updated = [
            trimmed,
            ...recentSearches.filter(
                (item) => item.toLowerCase() !== trimmed.toLowerCase(),
            ),
        ].slice(0, 6);

        setRecentSearches(updated);
        try {
            localStorage.setItem(
                "crsl_recent_searches",
                JSON.stringify(updated),
            );
        } catch (e) {
            console.error("Gagal menyimpan riwayat:", e);
        }
    };

    const eksekusiCari = (term: string) => {
        const target = term.trim();
        if (!target) return;
        saveSearchTerm(target);
        onClose();
        // Kirim parameter pencarian yang kompatibel dengan KatalogController
        router.get(
            "/katalog",
            { q: target, cari: target },
            { preserveState: true },
        );
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
                "crsl_recent_searches",
                JSON.stringify(updated),
            );
        } catch {}
    };

    const handleClearAllHistory = () => {
        setRecentSearches([]);
        try {
            localStorage.removeItem("crsl_recent_searches");
            toast.info("Riwayat pencarian dibersihkan.");
        } catch {}
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 px-4 bg-slate-950/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Pencarian Toko"
        >
            <div
                className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] transition-transform animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Bar Input Container */}
                <form
                    onSubmit={handleFormSubmit}
                    className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0"
                >
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="search"
                        role="searchbox"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari ransel, tumbler, kaos, atau karakter..."
                        className="flex-1 bg-transparent border-none text-sm sm:text-base text-slate-900 focus:outline-none font-semibold placeholder-slate-400"
                        autoFocus
                        autoComplete="off"
                    />

                    {query.trim().length > 0 && (
                        <button
                            type="submit"
                            className="p-1.5 bg-red-50 text-[#E52027] hover:bg-[#E52027] hover:text-white rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
                            title="Tekan Enter untuk mencari"
                        >
                            <CornerDownLeft className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {query.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                inputRef.current?.focus();
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                            aria-label="Bersihkan input"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        Tutup
                    </button>
                </form>

                {/* Body Content */}
                <div className="overflow-y-auto p-5 space-y-6 [scrollbar-width:thin] overscroll-contain">
                    {/* Riwayat Pencarian Terakhir */}
                    {recentSearches.length > 0 && (
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> Pencarian
                                    Terakhir
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClearAllHistory}
                                    className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                    Semua
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((item) => (
                                    <div
                                        key={item}
                                        onClick={() => eksekusiCari(item)}
                                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-[#E52027] text-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors group"
                                    >
                                        <span>{item}</span>
                                        <button
                                            type="button"
                                            onClick={(e) =>
                                                handleRemoveRecentItem(item, e)
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
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Paling Banyak Dicari
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {popularTerms.map((term) => (
                                <button
                                    key={term}
                                    type="button"
                                    onClick={() => eksekusiCari(term)}
                                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-[#E52027] text-slate-700 hover:text-white border border-slate-200/80 hover:border-[#E52027] rounded-full text-xs font-semibold transition-all duration-150 active:scale-95"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Terakhir Dilihat */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Rekomendasi Produk
                            </h4>
                            <Link
                                href="/katalog"
                                onClick={onClose}
                                className="text-xs font-bold text-[#E52027] hover:underline inline-flex items-center gap-1"
                            >
                                Lihat Semua{" "}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {RECENT_VIEWED.map((prod) => (
                                <Link
                                    key={prod.id}
                                    href={`/produk/${prod.slug}`}
                                    onClick={onClose}
                                    className="group flex flex-col bg-slate-50 hover:bg-white p-2.5 rounded-2xl border border-slate-200/70 hover:border-slate-300 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-slate-200/80 mb-2">
                                        <img
                                            src={prod.gambar}
                                            alt={prod.nama}
                                            width={150}
                                            height={150}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <span
                                            className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md border shadow-2xs ${prod.badgeColor}`}
                                        >
                                            {prod.badge}
                                        </span>
                                    </div>
                                    <h5 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight group-hover:text-[#E52027] transition-colors mb-1.5">
                                        {prod.nama}
                                    </h5>
                                    <div className="mt-auto font-black text-xs text-[#E52027]">
                                        {formatRupiah(prod.harga)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
