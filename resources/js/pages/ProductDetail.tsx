import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import ShippingAreaSelector from "../Components/ShippingAreaSelector";
import {
    Truck,
    MessageCircle,
    Heart,
    ShieldCheck,
    X,
    Plus,
    Minus,
    ShoppingBag,
    Zap,
    Package,
} from "lucide-react";
import { toast } from "sonner";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { SITUS_CONFIG } from "../Config/situsConfig";

interface Variant {
    id: number | string;
    nama_varian?: string;
    variant_name?: string;
    ukuran?: string;
    size_attribute?: string;
    harga_tambahan?: number;
    additional_price?: number;
    stok?: number;
}

interface Specification {
    id: number | string;
    kunci?: string;
    spec_key?: string;
    nilai?: string;
    spec_value?: string;
}

interface ProductImage {
    id: number | string;
    url: string;
    alt_teks?: string;
    alt_text?: string;
}

interface ProductDetailData {
    id: number;
    nama: string;
    name?: string;
    slug: string;
    deskripsi?: string;
    description?: string;
    harga_dasar: number;
    price?: number;
    harga_diskon?: number | null;
    discount_price?: number | null;
    gambar_utama?: string;
    main_image?: string;
    berat_gram?: number;
    stok_total?: number;
    stock?: number;
    kategori?: { nama?: string; name?: string };
    category?: { nama?: string; name?: string };
    gambar?: ProductImage[];
    images?: ProductImage[];
    varian?: Variant[];
    variants?: Variant[];
    spesifikasi?: Specification[];
    specifications?: Specification[];
}

interface AreaDetail {
    id: string;
    nama?: string;
    kota: string;
}

interface ProductDetailProps {
    produk?: ProductDetailData;
    product?: ProductDetailData;
    rekomendasi?: ProductDetailData[];
    recommended?: ProductDetailData[];
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatRupiah(num: number): string {
    return rupiahFormatter.format(num || 0);
}

export default function ProductDetail({
    produk,
    product,
    rekomendasi = [],
    recommended = [],
}: ProductDetailProps) {
    const activeProduct = produk || product || ({} as ProductDetailData);
    const listRekomendasi = rekomendasi.length > 0 ? rekomendasi : recommended;

    const mainImage =
        activeProduct.gambar_utama ||
        activeProduct.main_image ||
        "/assets/gambar/placeholder.webp";
    const images: ProductImage[] =
        activeProduct.gambar && activeProduct.gambar.length > 0
            ? activeProduct.gambar
            : activeProduct.images && activeProduct.images.length > 0
              ? activeProduct.images
              : [
                    {
                        id: "main",
                        url: mainImage,
                        alt_text: activeProduct.nama || activeProduct.name,
                    },
                ];

    const variants: Variant[] =
        activeProduct.varian || activeProduct.variants || [];
    const specs: Specification[] =
        activeProduct.spesifikasi || activeProduct.specifications || [];

    const [selectedImage, setSelectedImage] = useState<string>(
        images[0]?.url || mainImage,
    );
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
        variants[0] || null,
    );
    const [selectedSize, setSelectedSize] = useState<string>(
        selectedVariant?.ukuran ||
            selectedVariant?.size_attribute ||
            "All Size",
    );
    const [quantity, setQuantity] = useState<number>(1);

    // Modals & Estimator
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [deliveryCost, setDeliveryCost] = useState<number | null>(null);
    const [selectedAreaName, setSelectedAreaName] = useState("");
    const [isCalculatingOngkir, setIsCalculatingOngkir] = useState(false);

    const tambahItemStore = useKeranjangStore((state) => state.tambahItem);
    const bukaKeranjang = useKeranjangStore((state) => state.bukaKeranjang);

    useEffect(() => {
        if (images[0]?.url) {
            setSelectedImage(images[0].url);
        }
    }, [activeProduct.id]);

    const price = activeProduct.harga_dasar ?? activeProduct.price ?? 0;
    const discountPrice =
        activeProduct.harga_diskon ?? activeProduct.discount_price ?? price;
    const isDiscounted = discountPrice && discountPrice < price;
    const currentPrice =
        discountPrice +
        (selectedVariant?.harga_tambahan ||
            selectedVariant?.additional_price ||
            0);
    const totalStock = activeProduct.stok_total ?? activeProduct.stock ?? 0;
    const isOutOfStock = totalStock <= 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isOutOfStock) {
            toast.error("Maaf, stok produk ini sedang habis.");
            return;
        }

        const cartItemId = selectedVariant
            ? `${activeProduct.id}-${selectedVariant.id}`
            : String(activeProduct.id);

        if (tambahItemStore) {
            tambahItemStore({
                id: cartItemId,
                nama_produk:
                    activeProduct.nama || activeProduct.name || "Produk CRSL",
                harga: currentPrice,
                gambar: selectedImage,
                jumlah: quantity,
                ukuran: selectedSize,
            });
            toast.success("Produk berhasil masuk ke keranjang!");
            bukaKeranjang?.();
        } else {
            router.post(
                "/keranjang",
                {
                    produk_id: activeProduct.id,
                    varian_id: selectedVariant?.id,
                    jumlah: quantity,
                    ukuran: selectedSize,
                    warna:
                        selectedVariant?.nama_varian ||
                        selectedVariant?.variant_name,
                },
                { preserveScroll: true },
            );
        }
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isOutOfStock) {
            toast.error("Maaf, stok produk ini sedang habis.");
            return;
        }

        const cartItemId = selectedVariant
            ? `${activeProduct.id}-${selectedVariant.id}`
            : String(activeProduct.id);

        if (tambahItemStore) {
            tambahItemStore({
                id: cartItemId,
                nama_produk:
                    activeProduct.nama || activeProduct.name || "Produk CRSL",
                harga: currentPrice,
                gambar: selectedImage,
                jumlah: quantity,
                ukuran: selectedSize,
            });
            router.visit("/pembayaran");
        } else {
            router.post(
                "/keranjang",
                {
                    produk_id: activeProduct.id,
                    varian_id: selectedVariant?.id,
                    jumlah: quantity,
                    ukuran: selectedSize,
                    warna:
                        selectedVariant?.nama_varian ||
                        selectedVariant?.variant_name,
                },
                {
                    onSuccess: () => router.visit("/pembayaran"),
                },
            );
        }
    };

    const handleSelectDeliveryArea = async (area: AreaDetail) => {
        setSelectedAreaName(area.nama || area.kota);
        setIsCalculatingOngkir(true);
        toast.info(`Menghitung estimasi ongkir ke ${area.kota}...`);
        try {
            const res = await fetch("/api/wilayah/ongkir", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    area_id: area.id,
                    items: [
                        {
                            nama: activeProduct.nama || activeProduct.name,
                            harga: currentPrice,
                            jumlah: quantity,
                            berat_gram: activeProduct.berat_gram || 250,
                        },
                    ],
                }),
            });
            const data = await res.json();
            if (
                data.sukses &&
                Array.isArray(data.data) &&
                data.data.length > 0
            ) {
                setDeliveryCost(data.data[0].harga || data.data[0].biaya || 0);
                toast.success("Estimasi ongkir berhasil didapatkan!");
                setIsDeliveryModalOpen(false);
            }
        } catch {
            toast.error("Gagal mengambil estimasi tarif ongkir.");
        } finally {
            setIsCalculatingOngkir(false);
        }
    };

    const handleDirectWhatsAppCS = () => {
        const phone = SITUS_CONFIG.whatsappCS;
        const text = encodeURIComponent(
            `Halo tim CS CRSL, saya ingin bertanya tentang ketersediaan produk: ${activeProduct.nama || activeProduct.name} (${window.location.href})`,
        );
        window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post(
            "/wishlist/toggle",
            { produk_id: activeProduct.id },
            {
                preserveScroll: true,
                onSuccess: () => toast.success("Status wishlist diperbarui!"),
            },
        );
    };

    return (
        <StorefrontLayout>
            <Head
                title={`${activeProduct.nama || activeProduct.name || "Detail Produk"} — CRSL Store`}
            />

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
                        {activeProduct.nama || activeProduct.name}
                    </span>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Kolom 1: Galeri Thumbnail */}
                    <div className="lg:col-span-1 order-2 lg:order-1 flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto max-h-[500px] scrollbar-none">
                        {images.map((img, idx) => (
                            <button
                                key={img.id || idx}
                                type="button"
                                onClick={() => setSelectedImage(img.url)}
                                className={`w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all p-0.5 bg-white ${
                                    selectedImage === img.url
                                        ? "border-[#E52027] shadow-xs scale-105"
                                        : "border-slate-200 opacity-70 hover:opacity-100"
                                }`}
                            >
                                <img
                                    src={img.url}
                                    alt={
                                        img.alt_teks ||
                                        img.alt_text ||
                                        activeProduct.nama
                                    }
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Kolom 2: Gambar Utama */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="aspect-square rounded-3xl bg-slate-100 border border-slate-200 overflow-hidden relative shadow-xs group">
                            <img
                                src={selectedImage}
                                alt={activeProduct.nama || activeProduct.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {isDiscounted && (
                                <span className="absolute top-4 left-4 bg-[#E52027] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs uppercase tracking-wider">
                                    Special Promo
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleToggleWishlist}
                                className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-rose-600 shadow-xs backdrop-blur-xs transition-colors"
                                aria-label="Simpan ke Wishlist"
                            >
                                <Heart className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Kolom 3: Rincian Produk & Aksi Belanja */}
                    <div className="lg:col-span-6 order-3 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs">
                        <div>
                            <span className="text-[11px] font-bold text-[#E52027] uppercase tracking-wider bg-red-50 border border-red-100 px-3 py-1 rounded-full inline-block">
                                {activeProduct.kategori?.nama ||
                                    activeProduct.category?.name ||
                                    "CRSL Official Merch"}
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 leading-tight tracking-tight">
                                {activeProduct.nama || activeProduct.name}
                            </h1>
                        </div>

                        {/* Harga */}
                        <div className="flex items-baseline gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-2xl sm:text-3xl font-black text-[#E52027] tabular-nums">
                                {formatRupiah(currentPrice)}
                            </span>
                            {isDiscounted && (
                                <span className="text-sm font-bold text-slate-400 line-through tabular-nums">
                                    {formatRupiah(price)}
                                </span>
                            )}
                        </div>

                        {/* Estimasi Ongkos Kirim */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <Truck className="w-4 h-4 text-[#E52027]" />
                                    Estimasi Ongkos Kirim (Biteship)
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsDeliveryModalOpen(true)}
                                    className="text-blue-600 font-bold hover:underline"
                                >
                                    Cek Wilayah
                                </button>
                            </div>
                            <p className="text-slate-500 text-[11px]">
                                {selectedAreaName
                                    ? `Tujuan: ${selectedAreaName}`
                                    : "Pilih area kota tujuan untuk melihat tarif kurir resmi."}
                            </p>
                            {deliveryCost !== null && (
                                <div className="font-black text-emerald-600 text-xs tabular-nums">
                                    Mulai dari {formatRupiah(deliveryCost)}{" "}
                                    (Reguler)
                                </div>
                            )}
                        </div>

                        {/* Pilihan Varian */}
                        {variants.length > 0 && (
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                                    Pilih Varian Karakter:
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {variants.map((variant) => {
                                        const isSelected =
                                            selectedVariant?.id === variant.id;
                                        return (
                                            <button
                                                type="button"
                                                key={variant.id}
                                                onClick={() => {
                                                    setSelectedVariant(variant);
                                                    setSelectedSize(
                                                        variant.ukuran ||
                                                            variant.size_attribute ||
                                                            "All Size",
                                                    );
                                                }}
                                                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                                                    isSelected
                                                        ? "border-[#E52027] bg-red-50 text-[#E52027] shadow-xs ring-2 ring-[#E52027]"
                                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                                }`}
                                            >
                                                <span>
                                                    {variant.nama_varian ||
                                                        variant.variant_name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Jumlah Pembelian */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                                Jumlah Pembelian:
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1),
                                            )
                                        }
                                        className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                                        aria-label="Kurangi kuantitas"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-12 text-center font-black text-sm text-slate-800 tabular-nums">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                                        aria-label="Tambah kuantitas"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <span
                                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                                        isOutOfStock
                                            ? "bg-rose-50 text-rose-600"
                                            : "bg-emerald-50 text-emerald-700"
                                    }`}
                                >
                                    {isOutOfStock
                                        ? "Stok Habis"
                                        : `Tersedia (${totalStock} pcs)`}
                                </span>
                            </div>
                        </div>

                        {/* Tombol Aksi Beli */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className="w-full py-3.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-[#E52027] border border-red-200 font-extrabold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Tambah Keranjang
                            </button>
                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className="w-full py-3.5 bg-[#E52027] hover:bg-[#CC1C22] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Zap className="w-4 h-4" />
                                Beli Sekarang
                            </button>
                        </div>

                        {/* Tombol WhatsApp CS */}
                        <button
                            type="button"
                            onClick={handleDirectWhatsAppCS}
                            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            Tanya Produk Ini via WhatsApp
                        </button>

                        {/* Deskripsi & Spesifikasi */}
                        <div className="pt-6 border-t border-slate-100 space-y-4">
                            <div>
                                <h4 className="font-extrabold text-sm text-slate-900 mb-2">
                                    Deskripsi Produk
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                    {activeProduct.deskripsi ||
                                        activeProduct.description ||
                                        "Belum ada deskripsi untuk produk ini."}
                                </p>
                            </div>

                            {specs.length > 0 && (
                                <div className="pt-4 border-t border-slate-100">
                                    <h4 className="font-extrabold text-sm text-slate-900 mb-2">
                                        Spesifikasi Material
                                    </h4>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                                        {specs.map((spec) => (
                                            <div
                                                key={spec.id}
                                                className="grid grid-cols-3 text-xs border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0"
                                            >
                                                <span className="font-bold text-slate-500">
                                                    {spec.kunci ||
                                                        spec.spec_key}
                                                </span>
                                                <span className="col-span-2 font-semibold text-slate-800">
                                                    {spec.nilai ||
                                                        spec.spec_value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 flex items-center gap-2 text-slate-500 text-xs">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                    100% Original CRSL Merchandise Guaranteed
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rekomendasi Produk */}
                {listRekomendasi.length > 0 && (
                    <div className="mt-16 pt-12 border-t border-slate-200">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">
                            Koleksi Terkait Lainnya
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {listRekomendasi.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/produk/${item.slug}`}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all p-3 space-y-2 group"
                                >
                                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                                        <img
                                            src={
                                                item.gambar_utama ||
                                                item.main_image ||
                                                "/assets/gambar/placeholder.webp"
                                            }
                                            alt={item.nama || item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-[#E52027] transition-colors">
                                        {item.nama || item.name}
                                    </h4>
                                    <span className="text-xs font-black text-[#E52027] block tabular-nums">
                                        {formatRupiah(
                                            item.harga_diskon ??
                                                item.harga_dasar ??
                                                item.price ??
                                                0,
                                        )}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Estimasi Ongkir */}
            {isDeliveryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-100">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#E52027]" /> Cek
                                Estimasi Ongkir
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsDeliveryModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                                aria-label="Tutup modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <ShippingAreaSelector
                            onSelectArea={handleSelectDeliveryArea}
                        />
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
