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
} from "lucide-react";
import { toast } from "sonner";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { SITUS_CONFIG } from "../Config/situsConfig";
import { formatRupiah } from "../Utils/formatters";

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

interface ProductDetailProps {
    produk?: Record<string, any>;
    product?: Record<string, any>;
    rekomendasi?: Array<Record<string, any>>;
    recommended?: Array<Record<string, any>>;
}

// ==========================================
// 2. DATA NORMALIZER (Clean Boundary Layer)
// ==========================================
function normalizeProduct(raw: Record<string, any> = {}): NormalizedProduct {
    const nama = String(raw.nama || raw.name || "Produk CRSL");
    const mainImg = String(
        raw.gambar_utama || raw.main_image || "/assets/gambar/placeholder.webp",
    );

    const rawListImages =
        Array.isArray(raw.gambar) && raw.gambar.length > 0
            ? raw.gambar
            : Array.isArray(raw.images) && raw.images.length > 0
              ? raw.images
              : [{ id: "main", url: mainImg, alt_teks: nama }];

    const gambar: GalleryImage[] = rawListImages.map(
        (img: any, idx: number) => ({
            id: img.id ?? idx,
            url: String(img.url || mainImg),
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
            raw.kategori?.nama || raw.category?.name || "CRSL Official Merch",
        ),
        hargaDasar,
        hargaDiskon,
        stokTotal: Number(raw.stok_total ?? raw.stock ?? 0),
        beratGram: Number(raw.berat_gram ?? raw.weight ?? 0),
        deskripsi: String(
            raw.deskripsi || raw.description || "Official merchandise CRSL.",
        ),
        gambarUtama: mainImg,
        gambar,
        varian: (raw.varian || raw.variants || []) as VariantItem[],
        spesifikasi,
    };
}

export default function DetailProduk({
    produk,
    product,
    rekomendasi = [],
    recommended = [],
}: ProductDetailProps) {
    // Normalisasi data produk aktif dan rekomendasi
    const activeProduct = useMemo(
        () => normalizeProduct(produk || product),
        [produk, product],
    );

    const listRekomendasi = useMemo(() => {
        const rawRecs = rekomendasi.length > 0 ? rekomendasi : recommended;
        return rawRecs.map((r) => normalizeProduct(r));
    }, [rekomendasi, recommended]);

    // Store Keranjang
    const tambahItemStore = useKeranjangStore((state) => state.tambahItem);
    const cartItems = useKeranjangStore((state) => state.items);

    // Hitung total nilai belanja aktif
    const globalCartTotal = useMemo(() => {
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        return cartItems.reduce(
            (sum, item) =>
                sum + (Number(item.harga) || 0) * (Number(item.jumlah) || 1),
            0,
        );
    }, [cartItems]);

    // Helper session storage per produk
    const getSessionKey = useCallback(
        (id: string | number) => `crsl_pdp_selected_${id}`,
        [],
    );

    // State Internal
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
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState<boolean>(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);

    // Sinkronisasi state saat navigasi client-side berganti produk
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

        const matchedVariant = saved?.variantId
            ? activeProduct.varian.find(
                  (v) => String(v.id) === String(saved?.variantId),
              ) || null
            : null;

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

    // Simpan preferensi pilihan ke Session Storage
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
                // Ignore storage limits / incognito security errors
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

    // Perhitungan Harga & Stok
    const isDiscounted =
        activeProduct.hargaDiskon !== undefined &&
        activeProduct.hargaDiskon < activeProduct.hargaDasar;

    const basePrice = isDiscounted
        ? (activeProduct.hargaDiskon as number)
        : activeProduct.hargaDasar;

    const currentPrice = basePrice + (selectedVariant?.harga_tambahan || 0);
    const currentStock = selectedVariant
        ? (selectedVariant.stok ?? 0)
        : activeProduct.stokTotal;
    const isOutOfStock = currentStock <= 0;

    // Handlers
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
                `Kuantitas melebihi stok yang tersedia (Maks. ${currentStock} pcs).`,
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
        toast.success("Produk berhasil ditambahkan ke keranjang!");
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!validatePurchase()) return;

        const payload = createCartPayload();

        // Hanya isi session checkout instan tanpa menduplikasi ke keranjang reguler
        if (typeof window !== "undefined") {
            try {
                sessionStorage.setItem(
                    "crsl_buy_now_item",
                    JSON.stringify(payload),
                );
            } catch {
                // Ignore storage limits
            }
        }
        router.visit("/pembayaran?buy_now=1");
    };

    const handleDirectWhatsAppCS = () => {
        const currentUrl =
            typeof window !== "undefined" ? window.location.href : "";
        const phone = SITUS_CONFIG.whatsappCS;
        const text = encodeURIComponent(
            `Halo tim CS CRSL, saya ingin bertanya seputar produk: ${activeProduct.nama}\nLink: ${currentUrl}`,
        );
        window.open(
            `https://wa.me/${phone}?text=${text}`,
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
                onSuccess: () => toast.success("Status wishlist diperbarui!"),
                onError: () => toast.error("Gagal memperbarui wishlist."),
                onFinish: () => setIsWishlistLoading(false),
            },
        );
    };

    return (
        <StorefrontLayout>
            <Head title={`${activeProduct.nama} - CRSL Store`} />

            {/* Breadcrumb Navigation */}
            <nav
                aria-label="Breadcrumb"
                className="bg-slate-50 border-b border-slate-200/80 py-3 text-xs text-slate-500"
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
                    <div className="lg:col-span-6 space-y-5 bg-white p-6 sm:p-7 rounded-xl border border-slate-200/90 shadow-xs">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-xs font-semibold px-2.5 py-1 rounded ${
                                            isOutOfStock
                                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                : "bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        {isOutOfStock
                                            ? "Stok Habis"
                                            : "Tersedia"}
                                    </span>
                                    {activeProduct.kategoriNama && (
                                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                                            {activeProduct.kategoriNama}
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleToggleWishlist}
                                    disabled={isWishlistLoading}
                                    className="p-2 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                                    aria-label="Simpan ke Wishlist"
                                >
                                    <Heart className="w-5 h-5" />
                                </button>
                            </div>

                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-normal">
                                {activeProduct.nama}
                            </h1>

                            {/* Harga */}
                            <div className="flex items-baseline gap-2.5 pt-1">
                                <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                                    {formatRupiah(currentPrice)}
                                </span>
                                {isDiscounted && (
                                    <span className="text-sm font-semibold text-slate-400 line-through tabular-nums">
                                        {formatRupiah(activeProduct.hargaDasar)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Banner Voucher Promo */}
                        <button
                            type="button"
                            onClick={() => setIsDiscountsModalOpen(true)}
                            className="w-full flex items-center justify-between px-3.5 py-3 bg-[#F8F9FA] border border-slate-200/90 rounded-lg text-left hover:border-slate-300 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                                    <TicketPercent className="w-4 h-4 text-slate-700" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">
                                        Kupon Diskon Tersedia
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        Gunakan voucher untuk penawaran harga
                                        terbaik!
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
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
                                className="w-full h-12 bg-white hover:bg-red-50 disabled:opacity-50 text-primary border-2 border-primary font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                            >
                                <ShoppingBag className="w-4 h-4" />
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
                                className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                            >
                                <Zap className="w-4 h-4" />
                                <span>Beli Sekarang</span>
                            </button>
                        </div>

                        {/* Lookbook Campaign Banner */}
                        <div className="rounded-lg overflow-hidden border border-slate-200">
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
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsInquiryModalOpen(true)}
                                className="w-full py-2.5 min-h-11 bg-white hover:bg-red-50 text-primary border border-primary font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                                <MessageCircle className="w-4 h-4 text-primary" />
                                <span>Tanya Produk</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleDirectWhatsAppCS}
                                className="w-full py-2.5 min-h-11 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                                <MessageCircle className="w-4 h-4 text-emerald-600" />
                                <span>WhatsApp CS</span>
                            </button>
                        </div>

                        {/* Spesifikasi Teknis & Material */}
                        {activeProduct.spesifikasi.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <h4 className="font-extrabold text-sm text-slate-900">
                                    Spesifikasi Material & Detail
                                </h4>
                                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 space-y-2">
                                    {activeProduct.spesifikasi.map((spec) => (
                                        <div
                                            key={spec.id}
                                            className="grid grid-cols-3 text-xs border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0"
                                        >
                                            <span className="font-bold text-slate-500">
                                                {spec.kunci}
                                            </span>
                                            <span className="col-span-2 font-semibold text-slate-800">
                                                {spec.nilai}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-1 flex items-center gap-2 text-slate-500 text-xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
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

            <StickyCartBar />
        </StorefrontLayout>
    );
}
