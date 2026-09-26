import React, { useMemo } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Heart, ShoppingBag, Plus } from "lucide-react";
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

export interface ProductData {
    id: number;
    nama: string;
    slug: string;
    harga_dasar: number;
    harga_diskon?: number | null;
    gambar_utama?: string | null;
    stok_total?: number;
    status_stok?: string;
    kategori?: {
        id?: number;
        nama: string;
        slug?: string;
    } | string;
    varian?: VarianItem[];
    warna_tersedia?: string[];
    badge?: string;
}

interface ProductCardProps {
    produk: ProductData;
    priority?: boolean;
    className?: string;
}

export default function ProductCard({
    produk,
    priority = false,
    className = "",
}: ProductCardProps) {
    const page = usePage();
    const isLoggedIn = Boolean((page.props as any)?.auth?.user || (page.props as any)?.user);

    const openCartModal = useCartModalStore((state) => state.openCartModal);
    const tambahItem = useKeranjangStore((state) => state.tambahItem);

    const isWishlisted = useWishlistStore((state) => state.isWishlisted(produk.id));
    const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

    const hargaDasar = produk.harga_dasar || 0;
    const hargaDiskon = produk.harga_diskon || null;
    const effectivePrice = hargaDiskon && hargaDiskon < hargaDasar ? hargaDiskon : hargaDasar;
    const hasDiscount = hargaDiskon !== null && hargaDiskon < hargaDasar;
    const diskonPersen = hasDiscount
        ? Math.round(((hargaDasar - hargaDiskon) / hargaDasar) * 100)
        : 0;

    const varianList = produk.varian || [];
    const hasVariants = varianList.length > 0;
    const productUrl = `/produk/${encodeURIComponent(produk.slug)}`;

    // Menghitung jumlah warna unik jika tersedia
    const colorCount = useMemo(() => {
        if (produk.warna_tersedia && produk.warna_tersedia.length > 0) {
            return produk.warna_tersedia.length;
        }
        if (varianList.length > 0) {
            const uniqueColors = new Set(
                varianList.map((v) => v.warna || v.nama_varian).filter(Boolean)
            );
            return uniqueColors.size;
        }
        return 0;
    }, [produk.warna_tersedia, varianList]);

    // Handle Wishlist Toggle
    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        toggleWishlist(
            {
                id: produk.id,
                nama: produk.nama,
                slug: produk.slug,
                harga: effectivePrice,
                gambar: produk.gambar_utama,
            },
            isLoggedIn
        );
    };

    // Handle Cart Button (JANGAN LANGSUNG TRIGGER DRAWER)
    const handleCartClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (hasVariants) {
            // Jika ada varian: buka AddToCartModal untuk memilih size/warna
            openCartModal(produk as any);
        } else {
            // Jika produk tunggal tanpa varian: langsung tambahkan ke store tanpa membuka drawer
            tambahItem({
                id: `cart-${produk.id}-default`,
                produk_id: produk.id,
                nama_produk: produk.nama,
                harga: effectivePrice,
                harga_asli: hargaDasar,
                gambar: produk.gambar_utama || "/assets/gambar/produk-placeholder.webp",
                jumlah: 1,
                sku: `CRSL-${produk.id}`,
            });
            toast.success(`${produk.nama} berhasil ditambahkan ke keranjang!`);
        }
    };

    return (
        <article
            className={`w-full bg-white rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group border border-slate-100/90 relative ${className}`}
        >
            {/* Media Container Aspect 4:5 Sesuai Screenshot Resmi */}
            <div className="relative aspect-[4/5] bg-[#F7F8FA] overflow-hidden">
                <Link
                    href={productUrl}
                    className="block w-full h-full cursor-pointer relative"
                    aria-label={`Detail produk ${produk.nama}`}
                >
                    <img
                        src={produk.gambar_utama || "/assets/gambar/produk-placeholder.webp"}
                        alt={produk.nama}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading={priority ? "eager" : "lazy"}
                        width={320}
                        height={400}
                        onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/assets/gambar/produk-placeholder.webp";
                        }}
                    />
                </Link>

                {/* Badge Diskon di Kanan Atas */}
                {diskonPersen > 0 && (
                    <span
                        className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight pointer-events-none"
                        aria-label={`Diskon ${diskonPersen}%`}
                    >
                        {diskonPersen}%
                    </span>
                )}

                {/* Badge Available in X Colors jika ada varian */}
                {colorCount > 1 && (
                    <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs border border-slate-200/60 pointer-events-none">
                        Available in <span className="text-[#E52027]">{colorCount} Colors</span>
                    </span>
                )}

                {/* Tombol Wishlist Reaktif (Love Button) */}
                <button
                    type="button"
                    onClick={handleWishlistClick}
                    className={`absolute bottom-2.5 right-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm active:scale-125 z-10 ${
                        isWishlisted
                            ? "bg-rose-50 text-[#E52027] shadow-rose-100"
                            : "bg-white/95 text-slate-400 hover:text-[#E52027] hover:bg-white"
                    }`}
                    aria-label={isWishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"}
                >
                    <Heart
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${
                            isWishlisted ? "fill-[#E52027] text-[#E52027] scale-110" : "hover:scale-110"
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
                    >
                        {produk.nama}
                    </Link>

                    <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
                        <span className="text-xs sm:text-sm font-black text-slate-900 tabular-nums">
                            {formatRupiah(effectivePrice)}
                        </span>
                        {hasDiscount && (
                            <span className="text-[11px] text-slate-400 line-through tabular-nums">
                                {formatRupiah(hargaDasar)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Quick Add to Cart Button (Tidak langsung trigger drawer) */}
                <div className="pt-1">
                    <button
                        type="button"
                        onClick={handleCartClick}
                        className="w-full py-2 px-3 rounded-xl border border-[#E52027] text-[#E52027] hover:bg-[#E52027] hover:text-white active:scale-98 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs group/btn cursor-pointer"
                        aria-label={`Tambah ${produk.nama} ke keranjang`}
                    >
                        <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform duration-200" />
                        <span>{hasVariants ? "Pilih Opsi" : "Beli"}</span>
                    </button>
                </div>
            </div>
        </article>
    );
}
