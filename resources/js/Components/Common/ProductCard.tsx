import React, { useState, useRef, useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Heart, Plus, Ban } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { useCartModalStore } from "../../Stores/useCartModalStore";
import { useKeranjangStore } from "../../Stores/useKeranjangStore";
import { useWishlistStore } from "../../Stores/useWishlistStore";
import { toast } from "sonner";

export interface VarianItem {
    id: number | string;
    nama_varian?: string;
    warna?: string;
    ukuran?: string;
    harga_tambahan?: number;
    gambar_varian?: string | null;
    sku?: string;
    stok?: number;
}

export interface GambarItem {
    id?: number | string;
    url_gambar?: string;
    url?: string;
    is_utama?: boolean;
    urutan?: number;
}

export interface ProductData {
    id: number;
    nama: string;
    slug: string;
    harga_dasar: number | string;
    harga_diskon?: number | string | null;
    gambar_utama?: string | null;
    gambar_sekunder?: string | null;
    video_url?: string | null;
    stok_total?: number;
    status_stok?: string;
    is_best_seller?: boolean;
    badge?: string;
    kategori?:
        | {
              id?: number;
              nama: string;
              slug?: string;
          }
        | string;
    varian?: VarianItem[];
    gambar?: GambarItem[];
    warna_tersedia?: string[];
}

export interface ProductCardProps {
    produk: ProductData;
    priority?: boolean;
    className?: string;
}

const PLACEHOLDER_IMAGE = "/assets/gambar/produk-placeholder.webp";

/**
 * Normalisasi URL gambar lokal storage vs remote CDN
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

export default function ProductCard({
    produk,
    priority = false,
    className = "",
}: ProductCardProps) {
    const page = usePage();
    const isLoggedIn = Boolean(
        (page.props as any)?.auth?.user || (page.props as any)?.user,
    );

    const openModal = useCartModalStore((state) => state.openModal);
    const tambah = useKeranjangStore((state) => state.tambah);

    const isWishlisted = useWishlistStore((state) =>
        state.isWishlisted(produk.id),
    );
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

    const [isHovered, setIsHovered] = useState(false);
    const [secondaryImageFailed, setSecondaryImageFailed] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // 1. Normalisasi numerik ketat (Anti-Lexicographical String Comparison)
    const hargaDasar = Number(produk.harga_dasar) || 0;
    const rawDiskon =
        produk.harga_diskon !== null && produk.harga_diskon !== undefined
            ? Number(produk.harga_diskon)
            : null;

    const hasDiscount =
        rawDiskon !== null &&
        !isNaN(rawDiskon) &&
        rawDiskon < hargaDasar &&
        rawDiskon > 0;
    const effectivePrice =
        hasDiscount && rawDiskon !== null ? rawDiskon : hargaDasar;
    const diskonPersen =
        hasDiscount && hargaDasar > 0
            ? Math.round(
                  ((hargaDasar - (rawDiskon as number)) / hargaDasar) * 100,
              )
            : 0;

    // 2. Evaluasi Ketersediaan Stok
    const stokTersedia =
        typeof produk.stok_total === "number" ? produk.stok_total : undefined;
    const isOutOfStock =
        (stokTersedia !== undefined && stokTersedia <= 0) ||
        produk.status_stok === "out_of_stock" ||
        produk.status_stok === "habis";

    const varianList = produk.varian || [];
    const hasVariants = varianList.length > 0;
    const productUrl = `/produk/${encodeURIComponent(produk.slug)}`;

    // 3. Ekstraksi Gambar & Video
    const gambarUtamaUrl =
        normalizeMediaUrl(produk.gambar_utama) || PLACEHOLDER_IMAGE;

    const gambarSekunderUrl = useMemo(() => {
        if (produk.gambar_sekunder)
            return normalizeMediaUrl(produk.gambar_sekunder);
        if (produk.gambar && produk.gambar.length > 1) {
            const secondary =
                produk.gambar.find((g) => !g.is_utama) || produk.gambar[1];
            return normalizeMediaUrl(secondary?.url_gambar || secondary?.url);
        }
        return null;
    }, [produk.gambar_sekunder, produk.gambar]);

    const videoUrl = produk.video_url
        ? normalizeMediaUrl(produk.video_url)
        : null;

    // Hover Video Autoplay
    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current && videoUrl) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current && videoUrl) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    // Hitung Jumlah Pilihan Warna
    const colorCount = useMemo(() => {
        if (produk.warna_tersedia && produk.warna_tersedia.length > 0) {
            return produk.warna_tersedia.length;
        }
        if (varianList.length > 0) {
            const uniqueColors = new Set(
                varianList.map((v) => v.warna || v.nama_varian).filter(Boolean),
            );
            return uniqueColors.size;
        }
        return 0;
    }, [produk.warna_tersedia, varianList]);

    // Handle Wishlist Click
    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        toggleWishlist(
            {
                id: produk.id,
                nama: produk.nama,
                slug: produk.slug,
                harga: effectivePrice,
                gambar: gambarUtamaUrl,
            },
            isLoggedIn,
        );
    };

    // Handle Cart Button
    const handleCartClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

        if (hasVariants) {
            // Buka modal pemilihan varian
            openModal({
                id: produk.id,
                nama: produk.nama,
                slug: produk.slug,
                harga: effectivePrice,
                harga_diskon: rawDiskon ?? undefined,
                gambar_utama: produk.gambar_utama ?? null,
                stok_total: typeof produk.stok_total === "number" ? produk.stok_total : undefined,
                varians: (produk.varian || []).map((v) => ({
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
        } else {
            tambah({
                id: `cart-${produk.id}-default`,
                produk_id: produk.id,
                nama_produk: produk.nama,
                harga: effectivePrice,
                harga_asli: hargaDasar,
                gambar: gambarUtamaUrl,
                jumlah: 1,
                sku: `CRSL-${produk.id}`,
            });
            toast.success(`${produk.nama} berhasil ditambahkan ke keranjang!`);
        }
    };

    return (
        <article
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`w-full bg-white rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group border border-slate-200/80 relative select-none ${className}`}
        >
            {/* Media Container Aspect 4:5 Fit */}
            <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                <Link
                    href={productUrl}
                    className="block w-full h-full cursor-pointer relative"
                    aria-label={`Detail produk ${produk.nama}`}
                >
                    {/* Gambar Utama */}
                    <img
                        src={gambarUtamaUrl}
                        alt={produk.nama}
                        className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
                            isHovered &&
                            gambarSekunderUrl &&
                            !secondaryImageFailed &&
                            !videoUrl
                                ? "opacity-0 scale-105"
                                : "opacity-100 group-hover:scale-105"
                        } ${isOutOfStock ? "grayscale-[60%] opacity-80" : ""}`}
                        loading={priority ? "eager" : "lazy"}
                        width={320}
                        height={400}
                        onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = PLACEHOLDER_IMAGE;
                        }}
                    />

                    {/* Gambar Sekunder Flip Saat Hover */}
                    {gambarSekunderUrl &&
                        !secondaryImageFailed &&
                        !videoUrl && (
                            <img
                                src={gambarSekunderUrl}
                                alt={`${produk.nama} - Tampilan 2`}
                                className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out ${
                                    isHovered
                                        ? "opacity-100 scale-105"
                                        : "opacity-0 scale-100 pointer-events-none"
                                } ${isOutOfStock ? "grayscale-[60%] opacity-80" : ""}`}
                                loading="lazy"
                                width={320}
                                height={400}
                                onError={() => setSecondaryImageFailed(true)}
                            />
                        )}

                    {/* Video Hover Autoplay */}
                    {videoUrl && (
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            muted
                            loop
                            playsInline
                            preload="none"
                            disablePictureInPicture
                            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${
                                isHovered
                                    ? "opacity-100 z-1"
                                    : "opacity-0 pointer-events-none"
                            }`}
                        />
                    )}

                    {/* Overlay Khusus Produk Habis */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center p-3 pointer-events-none z-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white font-black text-xs uppercase tracking-wider shadow-md border border-white/20">
                                <Ban className="w-3.5 h-3.5 text-rose-400" />
                                <span>Stok Habis</span>
                            </span>
                        </div>
                    )}
                </Link>

                {/* Badge Diskon di Kanan Atas */}
                {hasDiscount && diskonPersen > 0 && !isOutOfStock && (
                    <span
                        className="absolute top-2.5 right-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight pointer-events-none z-10 font-mono"
                        aria-label={`Diskon ${diskonPersen}%`}
                    >
                        -{diskonPersen}%
                    </span>
                )}

                {/* Badge Promo / Best Seller di Kiri Atas */}
                {(produk.badge || produk.is_best_seller) && !isOutOfStock && (
                    <span className="absolute top-2.5 left-2.5 bg-[#E52027] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs uppercase tracking-wider pointer-events-none z-10">
                        {produk.badge || "Best Seller"}
                    </span>
                )}

                {/* Badge Pilihan Warna di Kiri Atas (Jika tidak ada badge promo) */}
                {!produk.badge &&
                    !produk.is_best_seller &&
                    colorCount > 1 &&
                    !isOutOfStock && (
                        <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-slate-800 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs border border-slate-200/60 pointer-events-none z-10">
                            <span className="text-[#E52027] font-black">
                                {colorCount}
                            </span>{" "}
                            Pilihan Warna
                        </span>
                    )}

                {/* Tombol Wishlist */}
                <button
                    type="button"
                    onClick={handleWishlistClick}
                    className={`absolute bottom-2.5 right-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm active:scale-125 z-10 cursor-pointer ${
                        isWishlisted
                            ? "bg-rose-50 text-[#E52027] shadow-rose-100"
                            : "bg-white/95 text-slate-400 hover:text-[#E52027] hover:bg-white"
                    }`}
                    aria-label={
                        isWishlisted
                            ? "Hapus dari wishlist"
                            : "Simpan ke wishlist"
                    }
                >
                    <Heart
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${
                            isWishlisted
                                ? "fill-[#E52027] text-[#E52027] scale-110"
                                : "hover:scale-110"
                        }`}
                    />
                </button>
            </div>

            {/* Informasi Produk: Nama & Harga */}
            <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1 justify-between">
                <div className="space-y-1">
                    <Link
                        href={productUrl}
                        className="text-xs sm:text-[13px] text-slate-800 hover:text-[#E52027] font-semibold leading-snug line-clamp-2 transition-colors block"
                        title={produk.nama}
                    >
                        {produk.nama}
                    </Link>

                    <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
                        <span className="text-xs sm:text-sm font-black text-slate-900 tabular-nums font-mono">
                            {formatRupiah(effectivePrice)}
                        </span>
                        {hasDiscount && (
                            <span className="text-[11px] text-slate-400 line-through tabular-nums font-mono">
                                {formatRupiah(hargaDasar)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Tombol Aksi Keranjang */}
                <div className="pt-1">
                    {isOutOfStock ? (
                        <button
                            type="button"
                            disabled
                            className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                            aria-label={`Stok ${produk.nama} habis`}
                        >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Stok Habis</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleCartClick}
                            className="w-full py-2 px-3 rounded-xl border border-[#E52027] text-[#E52027] hover:bg-[#E52027] hover:text-white active:scale-[0.98] text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs group/btn cursor-pointer"
                            aria-label={`Tambah ${produk.nama} ke keranjang`}
                        >
                            <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform duration-200" />
                            <span>{hasVariants ? "Pilih Opsi" : "Beli"}</span>
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
