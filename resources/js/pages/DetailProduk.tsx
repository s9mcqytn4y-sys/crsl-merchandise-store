import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import ProductGalleryMagnifier, {
    GalleryImage,
} from "../Components/PDP/ProductGalleryMagnifier";
import VariantSelector, {
    VariantItem,
} from "../Components/PDP/VariantSelector";
import DeliveryEstimator from "../Components/PDP/DeliveryEstimator";
import DiscountsModal from "../Components/PDP/DiscountsModal";
import InquiryModal from "../Components/PDP/InquiryModal";
import RecentViewed from "../Components/PDP/RecentViewed";
import StickyCartBar from "../Components/StickyCartBar";
import {
    ShoppingBag,
    Zap,
    MessageCircle,
    Heart,
    ShieldCheck,
    TicketPercent,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { SITUS_CONFIG } from "../Config/situsConfig";
import { formatRupiah } from "../Utils/formatters";
import { cn } from "../lib/utils";

// ==========================================
// 1. STRICT TYPE DEFINITIONS
// ==========================================
export interface ProductSpec {
    id: number | string;
    kunci: string;
    nilai: string;
}

export interface NormalizedProduct {
    id: number | string;
    nama: string;
    slug: string;
    kategoriNama: string;
    hargaDasar: number;
    hargaDiskon?: number;
    stokTotal: number;
    beratGram: number;
    deskripsi: string;
    gambarUtama: string;
    gambar: GalleryImage[];
    varian: VariantItem[];
    spesifikasi: ProductSpec[];
}

export interface CartPayloadItem {
    id: string;
    produk_id: number;
    slug: string;
    varian_id?: number;
    nama_produk: string;
    harga: number;
    harga_asli: number;
    gambar: string;
    jumlah: number;
    ukuran: string;
    warna?: string;
    sku: string;
}

export interface DetailProdukProps {
    produk?: Record<string, any>;
    product?: Record<string, any>;
    rekomendasi?: Array<Record<string, any>>;
    recommended?: Array<Record<string, any>>;
    className?: string;
}

const FALLBACK_IMAGE = "/assets/gambar/banner-1.webp";

/** Helper normalisasi URL media terintegrasi storage Laravel */
function normalizeMediaUrl(url?: string | null): string {
    if (!url) return FALLBACK_IMAGE;
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

// ==========================================
// 2. DATA NORMALIZER
// ==========================================
function normalizeProduct(raw: Record<string, any> = {}): NormalizedProduct {
    const nama = String(raw.nama || raw.name || "Produk Merchandise CRSL");
    const mainImg = normalizeMediaUrl(raw.gambar_utama || raw.main_image);

    const rawListImages =
        Array.isArray(raw.gambar) && raw.gambar.length > 0
            ? raw.gambar
            : Array.isArray(raw.images) && raw.images.length > 0
              ? raw.images
              : [{ id: "main", url: mainImg, alt_teks: nama }];

    const gambar: GalleryImage[] = rawListImages.map(
        (img: any, idx: number) => ({
            id: img.id ?? idx,
            url: normalizeMediaUrl(img.url || mainImg),
            alt_teks: String(img.alt_teks || img.alt_text || nama),
        }),
    );

    const rawSpecs = Array.isArray(raw.spesifikasi)
        ? raw.spesifikasi
        : Array.isArray(raw.specifications)
          ? raw.specifications
          : [];

    const spesifikasi: ProductSpec[] = rawSpecs.map((s: any, idx: number) => ({
        id: s.id ?? idx,
        kunci: String(s.kunci || s.spec_key || "Detail"),
        nilai: String(s.nilai || s.spec_value || "-"),
    }));

    const rawVariants = Array.isArray(raw.varian)
        ? raw.varian
        : Array.isArray(raw.variants)
          ? raw.variants
          : [];

    const varian: VariantItem[] = rawVariants.map((v: any) => ({
        ...v,
        gambar_varian: v.gambar_varian
            ? normalizeMediaUrl(v.gambar_varian)
            : undefined,
    }));

    const hargaDasar = Number(raw.harga_dasar ?? raw.price ?? 0);
    const rawDiscount = raw.harga_diskon ?? raw.discount_price;
    const hargaDiskon =
        rawDiscount !== undefined && rawDiscount !== null
            ? Number(rawDiscount)
            : undefined;

    return {
        id: raw.id ?? "",
        nama,
        slug: String(raw.slug || (raw.id ? String(raw.id) : "produk-crsl")),
        kategoriNama: String(
            raw.kategori?.nama || raw.category?.name || "Official Merchandise",
        ),
        hargaDasar,
        hargaDiskon,
        stokTotal: Number(raw.stok_total ?? raw.stock ?? 0),
        beratGram: Number(raw.berat_gram ?? raw.weight ?? 350),
        deskripsi: String(
            raw.deskripsi ||
                raw.description ||
                "Official merchandise resmi dari CRSL Official Store.",
        ),
        gambarUtama: mainImg,
        gambar,
        varian,
        spesifikasi,
    };
}

export default function DetailProduk({
    produk,
    product,
    rekomendasi = [],
    recommended = [],
    className,
}: DetailProdukProps) {
    const activeProduct = useMemo(
        () => normalizeProduct(produk || product),
        [produk, product],
    );

    const listRekomendasi = useMemo(() => {
        const rawRecs = rekomendasi.length > 0 ? rekomendasi : recommended;
        return rawRecs.map((r) => normalizeProduct(r));
    }, [rekomendasi, recommended]);

    const tambahItemStore = useKeranjangStore((state) => state.tambahItem);
    const cartItems = useKeranjangStore((state) => state.items);

    const globalCartTotal = useMemo(() => {
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        return cartItems.reduce(
            (sum, item) =>
                sum + (Number(item.harga) || 0) * (Number(item.jumlah) || 1),
            0,
        );
    }, [cartItems]);

    const getSessionKey = useCallback(
        (id: string | number) => `crsl_pdp_selected_${id}`,
        [],
    );

    const [selectedVariant, setSelectedVariant] = useState<VariantItem | null>(
        null,
    );
    const [selectedImage, setSelectedImage] = useState<string>(
        activeProduct.gambarUtama,
    );
    const [selectedSize, setSelectedSize] = useState<string>("All Size");
    const [quantity, setQuantity] = useState<number>(1);
    const [variantError, setVariantError] = useState<string | null>(null);
    const [isDiscountsModalOpen, setIsDiscountsModalOpen] =
        useState<boolean>(false);
    const [isInquiryModalOpen, setIsInquiryModalOpen] =
        useState<boolean>(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);

    // Sinkronisasi state varian dengan fallback varian default
    useEffect(() => {
        if (!activeProduct.id) return;

        let saved: {
            variantId?: string | number;
            size?: string;
            quantity?: number;
        } | null = null;

        if (typeof window !== "undefined") {
            try {
                const rawData = sessionStorage.getItem(
                    getSessionKey(activeProduct.id),
                );
                saved = rawData ? JSON.parse(rawData) : null;
            } catch {
                saved = null;
            }
        }

        let matchedVariant: VariantItem | null = null;
        if (saved?.variantId) {
            matchedVariant =
                activeProduct.varian.find(
                    (v) => String(v.id) === String(saved?.variantId),
                ) || null;
        }

        // Jika belum ada pilihan tersimpan, pilih varian pertama yang memiliki stok
        if (!matchedVariant && activeProduct.varian.length > 0) {
            matchedVariant =
                activeProduct.varian.find((v) => (v.stok ?? 0) > 0) ||
                activeProduct.varian[0];
        }

        setSelectedVariant(matchedVariant);
        setSelectedImage(
            matchedVariant?.gambar_varian ||
                activeProduct.gambar[0]?.url ||
                activeProduct.gambarUtama,
        );
        setSelectedSize(saved?.size || matchedVariant?.ukuran || "All Size");
        setQuantity(saved?.quantity && saved.quantity > 0 ? saved.quantity : 1);
        setVariantError(null);
    }, [
        activeProduct.id,
        activeProduct.varian,
        activeProduct.gambar,
        activeProduct.gambarUtama,
        getSessionKey,
    ]);

    const persistSelection = useCallback(
        (variantId?: string | number, size?: string, qty?: number) => {
            if (typeof window === "undefined" || !activeProduct.id) return;
            try {
                sessionStorage.setItem(
                    getSessionKey(activeProduct.id),
                    JSON.stringify({
                        variantId: variantId ?? selectedVariant?.id,
                        size: size ?? selectedSize,
                        quantity: qty ?? quantity,
                    }),
                );
            } catch {
                // Ignore storage quota
            }
        },
        [
            activeProduct.id,
            selectedVariant?.id,
            selectedSize,
            quantity,
            getSessionKey,
        ],
    );

    const isDiscounted =
        activeProduct.hargaDiskon !== undefined &&
        activeProduct.hargaDiskon < activeProduct.hargaDasar;

    const basePrice = Number(isDiscounted
        ? (activeProduct.hargaDiskon as number)
        : activeProduct.hargaDasar);

    const currentPrice = basePrice + Number(selectedVariant?.harga_tambahan || 0);
    const currentStock = selectedVariant
        ? (selectedVariant.stok ?? 0)
        : activeProduct.stokTotal;
    const isOutOfStock = currentStock <= 0;

    const handleSelectVariant = (v: VariantItem) => {
        setSelectedVariant(v);
        setVariantError(null);
        if (v.gambar_varian) setSelectedImage(v.gambar_varian);
        const nextSize = v.ukuran || selectedSize;
        if (v.ukuran) setSelectedSize(v.ukuran);
        persistSelection(v.id, nextSize, quantity);
    };

    const handleQuantityChange = (newQty: number) => {
        setQuantity(newQty);
        persistSelection(undefined, undefined, newQty);
    };

    const handleSizeChange = (newSize: string) => {
        setSelectedSize(newSize);
        persistSelection(undefined, newSize, quantity);
    };

    const validatePurchase = (): boolean => {
        if (isOutOfStock) {
            toast.error("Maaf, stok produk untuk pilihan ini sedang habis.");
            return false;
        }
        if (activeProduct.varian.length > 0 && !selectedVariant) {
            const errorMsg =
                "Silakan tentukan pilihan varian produk terlebih dahulu.";
            setVariantError(errorMsg);
            toast.error(errorMsg);
            return false;
        }
        if (quantity > currentStock) {
            toast.error(
                `Kuantitas melebihi stok yang tersedia (Maksimal ${currentStock} pcs).`,
            );
            return false;
        }
        return true;
    };

    const createCartPayload = (): CartPayloadItem => {
        const cartItemId = selectedVariant
            ? `${activeProduct.id}-${selectedVariant.id}`
            : String(activeProduct.id);

        return {
            id: cartItemId,
            produk_id: Number(activeProduct.id),
            slug: activeProduct.slug,
            varian_id: selectedVariant?.id
                ? Number(selectedVariant.id)
                : undefined,
            nama_produk: activeProduct.nama,
            harga: currentPrice,
            harga_asli: activeProduct.hargaDasar,
            gambar: selectedVariant?.gambar_varian || selectedImage,
            jumlah: quantity,
            ukuran: selectedSize,
            warna: selectedVariant?.warna || selectedVariant?.nama_varian,
            sku: selectedVariant?.sku || `CRSL-${activeProduct.id}`,
        };
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!validatePurchase()) return;

        tambahItemStore(createCartPayload());
        toast.success("Produk berhasil ditambahkan ke keranjang belanja!");
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!validatePurchase()) return;

        const payload = createCartPayload();
        if (typeof window !== "undefined") {
            try {
                sessionStorage.setItem(
                    "crsl_buy_now_item",
                    JSON.stringify(payload),
                );
            } catch {
                // Ignore storage quota
            }
        }
        router.visit("/pembayaran?buy_now=1");
    };

    const handleDirectWhatsAppCS = () => {
        const currentUrl =
            typeof window !== "undefined" ? window.location.href : "";
        const cleanPhone = (SITUS_CONFIG.whatsappCS || "").replace(/\D/g, "");
        const text = encodeURIComponent(
            `Halo tim CS CRSL, saya ingin bertanya seputar produk: ${activeProduct.nama}\nTautan: ${currentUrl}`,
        );
        window.open(
            `https://wa.me/${cleanPhone}?text=${text}`,
            "_blank",
            "noopener,noreferrer",
        );
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isWishlistLoading) return;

        setIsWishlistLoading(true);
        router.post(
            "/wishlist/toggle",
            { produk_id: activeProduct.id },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        "Status wishlist produk berhasil diperbarui!",
                    ),
                onError: () =>
                    toast.error("Gagal memperbarui status wishlist."),
                onFinish: () => setIsWishlistLoading(false),
            },
        );
    };

    return (
        <StorefrontLayout>
            <Head title={`${activeProduct.nama} - CRSL Official Store`} />

            {/* Breadcrumb Navigation WAI-ARIA */}
            <nav
                aria-label="Navigasi Jejak Halaman"
                className="bg-slate-50/80 border-b border-slate-200/80 py-3 text-xs text-slate-500 select-none"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
                    <Link
                        href="/"
                        className="hover:text-slate-900 transition-colors"
                    >
                        Beranda
                    </Link>
                    <span>/</span>
                    <Link
                        href="/katalog"
                        className="hover:text-slate-900 transition-colors"
                    >
                        Katalog
                    </Link>
                    <span>/</span>
                    <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
                        {activeProduct.nama}
                    </span>
                </div>
            </nav>

            <main
                className={cn(
                    "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 select-none",
                    className,
                )}
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                    {/* Media Magnifier Gallery */}
                    <div className="lg:col-span-6">
                        <ProductGalleryMagnifier
                            images={activeProduct.gambar}
                            selectedImage={selectedImage}
                            onSelectImage={setSelectedImage}
                            productName={activeProduct.nama}
                        />
                    </div>

                    {/* Panel Transaksi & Informasi Produk */}
                    <div className="lg:col-span-6 space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            "text-xs font-bold px-2.5 py-1 rounded-full border shadow-2xs font-mono",
                                            isOutOfStock
                                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                                : "bg-emerald-50 text-emerald-800 border-emerald-200",
                                        )}
                                    >
                                        {isOutOfStock
                                            ? "Stok Habis"
                                            : "Stok Tersedia"}
                                    </span>
                                    {activeProduct.kategoriNama && (
                                        <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-full font-mono">
                                            {activeProduct.kategoriNama}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleToggleWishlist}
                                    disabled={isWishlistLoading}
                                    className="p-2 text-slate-400 hover:text-[#E52027] rounded-xl hover:bg-red-50/50 transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                    aria-label="Simpan ke Wishlist Saya"
                                >
                                    {isWishlistLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-[#E52027]" />
                                    ) : (
                                        <Heart className="w-5 h-5 stroke-[2]" />
                                    )}
                                </button>
                            </div>

                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
                                {activeProduct.nama}
                            </h1>

                            {/* Harga Produk */}
                            <div className="flex items-baseline gap-2.5 pt-1">
                                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
                                    {formatRupiah(currentPrice)}
                                </span>
                                {isDiscounted && (
                                    <span className="text-sm font-semibold text-slate-400 line-through font-mono tabular-nums">
                                        {formatRupiah(activeProduct.hargaDasar)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Banner Pemicu Modal Kupon Diskon WAI-ARIA */}
                        <button
                            type="button"
                            role="button"
                            aria-haspopup="dialog"
                            aria-expanded={isDiscountsModalOpen}
                            aria-controls="modal-diskon-produk"
                            onClick={() => setIsDiscountsModalOpen(true)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-left hover:border-slate-300 hover:bg-slate-100/60 transition-all cursor-pointer group shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#E52027] shrink-0 shadow-2xs">
                                    <TicketPercent className="w-4 h-4 stroke-[2.2]" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900">
                                        Kupon Diskon Tersedia
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        Klaim voucher belanja untuk potongan
                                        harga terbaik
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-700 transition-all" />
                        </button>

                        {/* Pemilih Varian & Ukuran */}
                        <VariantSelector
                            variants={activeProduct.varian}
                            selectedVariant={selectedVariant}
                            onSelectVariant={handleSelectVariant}
                            selectedSize={selectedSize}
                            onSelectSize={handleSizeChange}
                            quantity={quantity}
                            onQuantityChange={handleQuantityChange}
                            totalStock={currentStock}
                            errorMessage={variantError}
                        />

                        {/* Tombol Aksi Keranjang / Beli */}
                        <div className="space-y-3 pt-2">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="w-full min-h-[48px] bg-white hover:bg-red-50/40 disabled:opacity-50 text-[#E52027] border-2 border-[#E52027] font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-2xs active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                            >
                                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                                <span>
                                    {isOutOfStock
                                        ? "Stok Habis"
                                        : "Tambah ke Keranjang"}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className="w-full min-h-[48px] bg-[#E52027] hover:bg-[#CC1C22] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-red-500/20 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                            >
                                <Zap className="w-4 h-4 stroke-[2.2]" />
                                <span>Beli Sekarang</span>
                            </button>
                        </div>

                        {/* Lookbook Campaign Banner */}
                        <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs">
                            <img
                                src="/assets/gambar/banner-lookbook.webp"
                                alt="CRSL Campaign Lookbook"
                                className="w-full h-auto object-cover max-h-72 sm:max-h-80"
                                loading="lazy"
                                width={600}
                                height={320}
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display =
                                        "none";
                                }}
                            />
                        </div>

                        {/* Estimasi Ongkir */}
                        <DeliveryEstimator
                            productWeight={activeProduct.beratGram}
                            productPrice={currentPrice}
                            productName={activeProduct.nama}
                        />

                        {/* Layanan Tanya Produk & WhatsApp CS */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                role="button"
                                aria-haspopup="dialog"
                                aria-expanded={isInquiryModalOpen}
                                aria-controls="modal-inquiry-produk"
                                onClick={() => setIsInquiryModalOpen(true)}
                                className="w-full py-2.5 min-h-[44px] bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                            >
                                <MessageCircle className="w-4 h-4 text-[#E52027] stroke-[2.2]" />
                                <span>Tanya Produk</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDirectWhatsAppCS}
                                className="w-full py-2.5 min-h-[44px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                                <MessageCircle className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                                <span>WhatsApp CS</span>
                            </button>
                        </div>

                        {/* Spesifikasi Teknis & Material */}
                        {activeProduct.spesifikasi.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-2.5">
                                <h4 className="font-black text-sm text-slate-900 tracking-tight">
                                    Spesifikasi Material &amp; Detail
                                </h4>
                                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 space-y-2 shadow-2xs">
                                    {activeProduct.spesifikasi.map((spec) => (
                                        <div
                                            key={spec.id}
                                            className="grid grid-cols-3 text-xs border-b border-slate-200/60 pb-2 last:border-0 last:pb-0"
                                        >
                                            <span className="font-bold text-slate-500">
                                                {spec.kunci}
                                            </span>
                                            <span className="col-span-2 font-semibold text-slate-900">
                                                {spec.nilai}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-1 flex items-center gap-2 text-slate-500 text-xs font-medium">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.2]" />
                            <span>
                                100% Produk Original Merchandise CRSL Terjamin
                            </span>
                        </div>
                    </div>
                </div>

                {/* Riwayat Produk Terakhir Dilihat */}
                <RecentViewed
                    currentProduct={{
                        id: activeProduct.id,
                        nama: activeProduct.nama,
                        slug: activeProduct.slug,
                        harga: activeProduct.hargaDasar,
                        harga_diskon: activeProduct.hargaDiskon,
                        gambar: activeProduct.gambarUtama,
                    }}
                    fallbackRecommendations={listRekomendasi.map((item) => ({
                        id: item.id,
                        nama: item.nama,
                        slug: item.slug,
                        harga: item.hargaDasar,
                        harga_diskon: item.hargaDiskon,
                        gambar: item.gambarUtama,
                    }))}
                />
            </main>

            {/* Modal Kupon & Diskon */}
            <DiscountsModal
                isOpen={isDiscountsModalOpen}
                onClose={() => setIsDiscountsModalOpen(false)}
                cartTotal={
                    globalCartTotal > 0
                        ? globalCartTotal
                        : currentPrice * quantity
                }
                onApplyVoucher={(code) => {
                    toast.success(
                        `Voucher ${code} berhasil dipasang ke pesanan!`,
                    );
                }}
            />

            {/* Modal Inquiry Pertanyaan Produk */}
            <InquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
                produkId={activeProduct.id}
                namaProduk={activeProduct.nama}
                selectedVariantName={selectedVariant?.nama_varian}
            />

            {/* Sticky Bottom Cart Bar */}
            <StickyCartBar />
        </StorefrontLayout>
    );
}
