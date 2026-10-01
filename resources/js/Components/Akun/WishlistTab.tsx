import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Heart,
    Trash2,
    ArrowRight,
    ShoppingBag,
    Package,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "../../Utils/formatters";
import { useWishlistStore, WishlistProduct } from "../../Stores/useWishlistStore";
import { useCartModalStore } from "../../Stores/useCartModalStore";
import { cn } from "../../lib/utils";

export interface WishlistItem {
    id: number | string;
    nama: string;
    gambar?: string | null;
    harga: number;
    slug?: string;
    varian?: any[];
}

interface WishlistTabProps {
    wishlists?: WishlistItem[];
    className?: string;
}

const FALLBACK_IMAGE = "/assets/gambar/banner-1.webp";

/** Helper normalisasi URL gambar media Laravel Storage / External CDN */
function normalizeImageUrl(gambar?: string | null): string {
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

export default function WishlistTab({
    wishlists = [],
    className,
}: WishlistTabProps) {
    const page = usePage();
    const isLoggedIn = Boolean(
        (page.props as any)?.auth?.user || (page.props as any)?.user,
    );

    const storeItems = useWishlistStore((state) => state.items);
    const hapusWishlist = useWishlistStore((state) => state.hapusWishlist);
    const setInitialItems = useWishlistStore((state) => state.setInitialItems);

    const openModal = useCartModalStore((state) => state.openModal);

    const [isInitialized, setIsInitialized] = useState(false);
    const [deletingId, setDeletingId] = useState<number | string | null>(null);

    // 1. Sinkronisasi data awal saat komponen dibuka
    useEffect(() => {
        if (isLoggedIn && wishlists) {
            const formatted: WishlistProduct[] = wishlists.map((w) => ({
                id: Number(w.id),
                nama: w.nama,
                slug: w.slug || "",
                harga: Number(w.harga) || 0,
                gambar: w.gambar || null,
            }));
            setInitialItems(formatted);
            setIsInitialized(true);
        } else {
            setIsInitialized(true);
        }
    }, [isLoggedIn, wishlists, setInitialItems]);

    // 2. Proteksi State: Gunakan storeItems setelah inisialisasi untuk mencegah zombie items
    const displayItems: WishlistItem[] = useMemo(() => {
        if (isInitialized) {
            return storeItems;
        }
        return wishlists.length > 0 ? wishlists : storeItems;
    }, [isInitialized, storeItems, wishlists]);

    const handleHapus = async (
        produkId: number | string,
        namaProduk: string,
    ) => {
        try {
            setDeletingId(produkId);
            await hapusWishlist(Number(produkId), isLoggedIn);
            toast.success(`${namaProduk} dihapus dari wishlist`);
        } catch {
            toast.error("Gagal menghapus produk dari wishlist");
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddToCart = useCallback(
        (item: WishlistItem) => {
            // Buka modal pilih varian jika tersedia
            openModal({
                id: Number(item.id),
                nama: item.nama,
                slug: item.slug || "",
                harga: Number(item.harga) || 0,
                gambar_utama: item.gambar || null,
                varians: (item.varian || []).map((v: any) => ({
                    id: Number(v.id),
                    nama_varian: v.nama_varian,
                    warna: v.warna ?? null,
                    ukuran: v.ukuran ?? null,
                    sku: v.sku ?? null,
                    harga_tambahan: v.harga_tambahan ?? null,
                    stok: typeof v.stok === "number" ? v.stok : 99,
                    gambar_varian: v.gambar_varian ?? null,
                })),
            });
        },
        [openModal],
    );

    if (displayItems.length === 0) {
        return (
            <div
                className={cn(
                    "bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3.5 shadow-2xs select-none",
                    className,
                )}
            >
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-primary border border-red-100 flex items-center justify-center mx-auto shadow-2xs">
                    <Heart className="w-7 h-7 stroke-[2]" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-black text-base text-slate-900 tracking-tight">
                        Wishlist Masih Kosong
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Simpan produk impian Anda dengan menekan ikon hati pada
                        katalog produk agar mudah ditemukan dan dibeli kembali.
                    </p>
                </div>
                <div className="pt-1">
                    <Link
                        href="/katalog"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Jelajahi Katalog Produk</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("space-y-4 select-none", className)}>
            {/* Header Wishlist */}
            <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Wishlist Saya</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                        {displayItems.length}
                    </span>
                </h2>

                <Link
                    href="/katalog"
                    className="text-xs font-bold text-primary hover:text-primary-hover hover:underline inline-flex items-center gap-1 transition-colors"
                >
                    <span>Cari Produk Lain</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </Link>
            </div>

            {/* Grid Wishlist Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {displayItems.map((item) => {
                    const isDeleting = deletingId === item.id;
                    const imageUrl = normalizeImageUrl(item.gambar);

                    return (
                        <div
                            key={item.id}
                            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between group"
                        >
                            {/* Gambar Produk & Tombol Hapus */}
                            <div className="relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={item.nama}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.onerror = null;
                                            target.src = FALLBACK_IMAGE;
                                        }}
                                    />
                                ) : (
                                    <Package className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleHapus(item.id, item.nama)
                                    }
                                    disabled={isDeleting}
                                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl bg-white/95 backdrop-blur-xs hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer disabled:opacity-50 border border-slate-200/60"
                                    title="Hapus dari Wishlist"
                                    aria-label={`Hapus ${item.nama} dari wishlist`}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 stroke-[2]" />
                                    )}
                                </button>
                            </div>

                            {/* Deskripsi & Aksi Belanja */}
                            <div className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                                        {item.nama}
                                    </h4>
                                    <span className="font-black text-xs sm:text-sm text-primary block mt-1 tabular-nums font-mono">
                                        {formatRupiah(item.harga)}
                                    </span>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(item)}
                                        className="w-full inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover active:scale-95 text-white text-[11px] font-bold py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                                    >
                                        <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                                        <span>+ Keranjang</span>
                                    </button>

                                    <Link
                                        href={
                                            item.slug
                                                ? `/produk/${item.slug}`
                                                : "/katalog"
                                        }
                                        className="w-full inline-flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold py-1.5 rounded-xl transition-colors"
                                    >
                                        <span>Detail</span>
                                        <ArrowRight className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
