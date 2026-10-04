import { useState, useMemo, useEffect, useCallback } from "react";
import { Head, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import ProductGalleryMagnifier, {
    GalleryImage,
} from "../Components/PDP/ProductGalleryMagnifier";
import VariantSelector, {
    VariantItem,
} from "../Components/PDP/VariantSelector";
import ProductInfo from "../Components/PDP/ProductInfo";
import ProductTrustSection from "../Components/PDP/ProductTrustSection";
import ProductActionButtons from "../Components/PDP/ProductActionButtons";
import MobileStickyCta from "../Components/PDP/MobileStickyCta";
import DeliveryEstimator from "../Components/PDP/DeliveryEstimator";
import DiscountsModal, { VoucherItem } from "../Components/PDP/DiscountsModal";
import InquiryModal from "../Components/PDP/InquiryModal";
import RecentViewed from "../Components/PDP/RecentViewed";
import { toast } from "sonner";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { cn } from "../lib/utils";

export interface SpecItem {
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
    spesifikasi: SpecItem[];
    isBestSeller?: boolean;
}

export interface DetailProdukProps {
    produk?: Record<string, any>;
    product?: Record<string, any>;
    rekomendasi?: Array<Record<string, any>>;
    recommended?: Array<Record<string, any>>;
    vouchers?: VoucherItem[];
    className?: string;
}

const PLACEHOLDER_IMAGE = "/assets/gambar/banner-1.webp";

function normalizeMediaUrl(url?: string | null): string {
    if (!url) return PLACEHOLDER_IMAGE;
    const clean = url.trim();
    if (
        clean.startsWith("http://") ||
        clean.startsWith("https://") ||
        clean.startsWith("data:")
    ) {
        return clean;
    }
    if (clean.startsWith("/assets/")) return clean;
    if (clean.startsWith("assets/")) return `/${clean}`;
    if (clean.startsWith("/storage/")) return clean;
    if (clean.startsWith("storage/")) return `/${clean}`;
    if (clean.startsWith("/")) return clean;
    return `/${clean}`;
}

function normalizeProduct(raw: Record<string, any> = {}): NormalizedProduct {
    const nama = String(raw.nama || raw.name || "Produk Merchandise CRSL");
    const mainImg = normalizeMediaUrl(raw.gambar_utama || raw.main_image);

    const rawListImages =
        Array.isArray(raw.gambar) && raw.gambar.length > 0
            ? raw.gambar
            : Array.isArray(raw.images) && raw.images.length > 0
              ? raw.images
              : [{ id: "main", url: mainImg, alt_teks: nama }];

    const gambar: GalleryImage[] = rawListImages.map((img: any, idx: number) => ({
        id: img.id ?? idx,
        url: normalizeMediaUrl(img.url || mainImg),
        alt_teks: String(img.alt_teks || img.alt_text || nama),
    }));

    const rawSpecs = Array.isArray(raw.spesifikasi)
        ? raw.spesifikasi
        : Array.isArray(raw.specifications)
          ? raw.specifications
          : [];

    const spesifikasi: SpecItem[] = rawSpecs.map((s: any, idx: number) => ({
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
        gambar_varian: v.gambar_varian ? normalizeMediaUrl(v.gambar_varian) : undefined,
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
        kategoriNama: String(raw.kategori?.nama || raw.category?.name || "Official Merchandise"),
        hargaDasar,
        hargaDiskon,
        stokTotal: Number(raw.stok_total ?? raw.stock ?? 0),
        beratGram: Number(raw.berat_gram ?? raw.weight ?? 350),
        deskripsi: String(
            raw.deskripsi ||
                raw.description ||
                "Official merchandise resmi dari CRSL Official Store. Dibuat dengan material berkualitas tinggi dan desain karakter ikonik."
        ),
        gambarUtama: mainImg,
        gambar,
        varian,
        spesifikasi,
        isBestSeller: Boolean(raw.is_best_seller ?? raw.best_seller),
    };
}

export default function DetailProduk({
    produk,
    product,
    rekomendasi = [],
    recommended = [],
    vouchers = [],
    className,
}: DetailProdukProps) {
    const activeProduct = useMemo(
        () => normalizeProduct(produk || product),
        [produk, product]
    );

    const listRekomendasi = useMemo(() => {
        const rawRecs = rekomendasi.length > 0 ? rekomendasi : recommended;
        return rawRecs.map((r) => normalizeProduct(r));
    }, [rekomendasi, recommended]);

    const tambahItemKeranjang = useKeranjangStore((state) => state.tambahItem);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);
    const cartItems = useKeranjangStore((state) => state.items);

    const globalCartTotal = useMemo(() => {
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        return cartItems.reduce(
            (sum, item) => sum + (Number(item.harga) || 0) * (Number(item.jumlah) || 1),
            0
        );
    }, [cartItems]);

    const getSessionKey = useCallback(
        (id: string | number) => `crsl_pdp_selected_${id}`,
        []
    );

    const [selectedVariant, setSelectedVariant] = useState<VariantItem | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>(activeProduct.gambarUtama);
    const [selectedSize, setSelectedSize] = useState<string>("All Size");
    const [quantity, setQuantity] = useState<number>(1);
    const [variantError, setVariantError] = useState<string | null>(null);
    const [isDiscountsModalOpen, setIsDiscountsModalOpen] = useState<boolean>(false);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState<boolean>(false);
    const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

    // Sinkronisasi varian awal & session storage
    useEffect(() => {
        if (!activeProduct.id) return;

        let saved: any = null;
        if (typeof window !== "undefined") {
            try {
                const rawData = sessionStorage.getItem(getSessionKey(activeProduct.id));
                saved = rawData ? JSON.parse(rawData) : null;
            } catch {
                saved = null;
            }
        }

        let matchedVariant: VariantItem | null = null;
        if (saved?.variantId) {
            matchedVariant =
                activeProduct.varian.find(
                    (v) => String(v.id) === String(saved?.variantId)
                ) || null;
        }

        if (!matchedVariant && activeProduct.varian.length > 0) {
            matchedVariant = activeProduct.varian[0];
        }

        setSelectedVariant(matchedVariant);
        if (matchedVariant?.gambar_varian) {
            setSelectedImage(matchedVariant.gambar_varian);
        } else {
            setSelectedImage(activeProduct.gambarUtama);
        }

        if (saved?.size) {
            setSelectedSize(saved.size);
        } else if (matchedVariant?.ukuran) {
            setSelectedSize(matchedVariant.ukuran);
        }

        if (saved?.quantity && typeof saved.quantity === "number") {
            setQuantity(Math.max(1, saved.quantity));
        }
    }, [activeProduct, getSessionKey]);

    // Handle variant selection
    const handleSelectVariant = useCallback(
        (variant: VariantItem) => {
            setSelectedVariant(variant);
            setVariantError(null);

            if (variant.gambar_varian) {
                setSelectedImage(variant.gambar_varian);
            }

            if (variant.ukuran) {
                setSelectedSize(variant.ukuran);
            }

            if (variant.stok !== undefined && quantity > variant.stok) {
                setQuantity(Math.max(1, variant.stok));
            }

            if (typeof window !== "undefined") {
                try {
                    sessionStorage.setItem(
                        getSessionKey(activeProduct.id),
                        JSON.stringify({
                            variantId: variant.id,
                            size: variant.ukuran || selectedSize,
                            quantity,
                        })
                    );
                } catch {
                    // Ignore storage quota
                }
            }
        },
        [activeProduct.id, getSessionKey, quantity, selectedSize]
    );

    const handleSizeChange = useCallback(
        (size: string) => {
            setSelectedSize(size);
            if (typeof window !== "undefined") {
                try {
                    sessionStorage.setItem(
                        getSessionKey(activeProduct.id),
                        JSON.stringify({
                            variantId: selectedVariant?.id,
                            size,
                            quantity,
                        })
                    );
                } catch {
                    // Ignore storage quota
                }
            }
        },
        [activeProduct.id, getSessionKey, quantity, selectedVariant?.id]
    );

    const handleQuantityChange = useCallback(
        (qty: number) => {
            setQuantity(qty);
            if (typeof window !== "undefined") {
                try {
                    sessionStorage.setItem(
                        getSessionKey(activeProduct.id),
                        JSON.stringify({
                            variantId: selectedVariant?.id,
                            size: selectedSize,
                            quantity: qty,
                        })
                    );
                } catch {
                    // Ignore storage quota
                }
            }
        },
        [activeProduct.id, getSessionKey, selectedSize, selectedVariant?.id]
    );

    // Current price calculation based on variant
    const currentPrice = useMemo(() => {
        const base =
            activeProduct.hargaDiskon && activeProduct.hargaDiskon > 0
                ? activeProduct.hargaDiskon
                : activeProduct.hargaDasar;
        const extra = Number(selectedVariant?.harga_tambahan ?? 0);
        return base + extra;
    }, [activeProduct.hargaDasar, activeProduct.hargaDiskon, selectedVariant]);

    const currentStock = useMemo(() => {
        if (selectedVariant && typeof selectedVariant.stok === "number") {
            return selectedVariant.stok;
        }
        return activeProduct.stokTotal;
    }, [activeProduct.stokTotal, selectedVariant]);

    const handleAddToCartQuick = () => {
        if (currentStock <= 0) {
            toast.error("Maaf, produk ini sedang habis.");
            return;
        }

        tambahItemKeranjang(
            {
                id: `cart-${activeProduct.id}-${selectedVariant?.id || "def"}`,
                produk_id: Number(activeProduct.id),
                slug: activeProduct.slug,
                varian_id: selectedVariant ? Number(selectedVariant.id) : undefined,
                nama_produk: activeProduct.nama,
                harga: currentPrice,
                harga_asli: activeProduct.hargaDasar,
                gambar: selectedImage || activeProduct.gambarUtama,
                jumlah: quantity,
                ukuran: selectedSize,
                warna: selectedVariant?.warna,
                sku: selectedVariant?.sku || "CRSL-DEFAULT",
            },
            quantity
        );

        bukaKeranjang();
        toast.success(`${activeProduct.nama} berhasil ditambahkan!`);
    };

    const handleBuyNowQuick = () => {
        if (currentStock <= 0) {
            toast.error("Maaf, produk ini sedang habis.");
            return;
        }

        tambahItemKeranjang(
            {
                id: `cart-${activeProduct.id}-${selectedVariant?.id || "def"}`,
                produk_id: Number(activeProduct.id),
                slug: activeProduct.slug,
                varian_id: selectedVariant ? Number(selectedVariant.id) : undefined,
                nama_produk: activeProduct.nama,
                harga: currentPrice,
                harga_asli: activeProduct.hargaDasar,
                gambar: selectedImage || activeProduct.gambarUtama,
                jumlah: quantity,
                ukuran: selectedSize,
                warna: selectedVariant?.warna,
                sku: selectedVariant?.sku || "CRSL-DEFAULT",
            },
            quantity
        );

        router.visit("/checkout");
    };

    const pageTitle = `${activeProduct.nama} - CRSL Store Official`;
    const pageDescription = activeProduct.deskripsi.slice(0, 160);

    return (
        <StorefrontLayout>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={activeProduct.gambarUtama} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        name: activeProduct.nama,
                        image: activeProduct.gambarUtama,
                        description: activeProduct.deskripsi,
                        brand: {
                            "@type": "Brand",
                            name: "CRSL",
                        },
                        offers: {
                            "@type": "Offer",
                            priceCurrency: "IDR",
                            price: currentPrice,
                            availability:
                                currentStock > 0
                                    ? "https://schema.org/InStock"
                                    : "https://schema.org/OutOfStock",
                        },
                    })}
                </script>
            </Head>

            <main className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-16", className)}>
                {/* 2-Column Responsive Layout: Left Sticky Gallery + Right Product Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* LEFT COLUMN: Sticky Gallery */}
                    <div className="lg:col-span-6 lg:sticky lg:top-24">
                        <ProductGalleryMagnifier
                            images={activeProduct.gambar}
                            selectedImage={selectedImage}
                            onSelectImage={setSelectedImage}
                            productName={activeProduct.nama}
                        />
                    </div>

                    {/* RIGHT COLUMN: Product Information, Variants, Actions & Accordions */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* 1. Header Information & Price */}
                        <ProductInfo
                            nama={activeProduct.nama}
                            kategoriNama={activeProduct.kategoriNama}
                            deskripsi={activeProduct.deskripsi}
                            hargaDasar={activeProduct.hargaDasar}
                            hargaDiskon={activeProduct.hargaDiskon}
                            stokTotal={currentStock}
                            isBestSeller={activeProduct.isBestSeller}
                            onOpenDiscounts={() => setIsDiscountsModalOpen(true)}
                        />

                        {/* 2. Variant Selector */}
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

                        {/* 3. Action Buttons (Add to Cart / Buy Now) */}
                        <ProductActionButtons
                            produkId={activeProduct.id}
                            namaProduk={activeProduct.nama}
                            slug={activeProduct.slug}
                            varianId={selectedVariant ? Number(selectedVariant.id) : undefined}
                            varianNama={selectedVariant?.nama_varian}
                            ukuran={selectedSize}
                            warna={selectedVariant?.warna}
                            sku={selectedVariant?.sku}
                            harga={currentPrice}
                            hargaAsli={activeProduct.hargaDasar}
                            gambar={selectedImage || activeProduct.gambarUtama}
                            stokTersedia={currentStock}
                            kuantitas={quantity}
                            onKuantitasChange={handleQuantityChange}
                            onOpenInquiry={() => setIsInquiryModalOpen(true)}
                            isWishlisted={isWishlisted}
                            onToggleWishlist={() => {
                                setIsWishlisted(!isWishlisted);
                                toast.success(
                                    !isWishlisted
                                        ? "Disimpan ke wishlist favorit!"
                                        : "Dihapus dari wishlist."
                                );
                            }}
                        />

                        {/* 4. Trust Badges Section */}
                        <ProductTrustSection />

                        {/* 5. Biteship Delivery Cost Estimator */}
                        <DeliveryEstimator
                            productWeight={activeProduct.beratGram}
                            productPrice={currentPrice}
                            productName={activeProduct.nama}
                        />
                    </div>
                </div>

                {/* Bottom Section: Recently Viewed & Recommendations Carousel */}
                <div className="mt-16 pt-8 border-t border-slate-200">
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
                </div>
            </main>

            {/* Mobile Fixed Bottom CTA Bar */}
            <MobileStickyCta
                harga={currentPrice}
                hargaAsli={activeProduct.hargaDasar}
                namaVarian={selectedVariant?.nama_varian || selectedSize}
                stokTersedia={currentStock}
                onAddToCart={handleAddToCartQuick}
                onBuyNow={handleBuyNowQuick}
            />

            {/* Discounts Voucher Modal */}
            <DiscountsModal
                isOpen={isDiscountsModalOpen}
                onClose={() => setIsDiscountsModalOpen(false)}
                vouchers={vouchers}
                cartTotal={globalCartTotal > 0 ? globalCartTotal : currentPrice * quantity}
                onApplyVoucher={(code) => {
                    toast.success(`Voucher ${code} berhasil dipasang ke pesanan!`);
                }}
            />

            {/* Inquiry Pertanyaan Modal */}
            <InquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
                produkId={activeProduct.id}
                namaProduk={activeProduct.nama}
                selectedVariantName={selectedVariant?.nama_varian}
            />
        </StorefrontLayout>
    );
}
