import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { formatRupiah } from "../Utils/formatters";
import { SITUS_CONFIG } from "../Config/situsConfig";
import { toast } from "sonner";
import DiscountsModal from "../Components/PDP/DiscountsModal";
import DeliveryEstimator from "../Components/PDP/DeliveryEstimator";
import {
    CheckCircle2,
    ShieldCheck,
    Gift,
    Sparkles,
    ChevronRight,
    ShoppingBag,
    Tag,
    MessageSquare,
    AlertCircle,
    Zap,
} from "lucide-react";

export interface BundleVarian {
    id: number;
    nama: string;
    hex: string;
    sku: string;
}

export interface BundleSubItem {
    id: number;
    nama: string;
    harga: number;
    gambar: string;
    varian: BundleVarian[];
}

export interface BundleDetailData {
    id: number;
    judul: string;
    slug: string;
    harga_paket: number;
    harga_asli: number;
    diskon_persen: number;
    hemat?: string;
    berat_total?: number;
    gambar_utama: string;
    galeri: string[];
    deskripsi: string;
    items: BundleSubItem[];
    freebies?: string[];
}

interface DetailBundleProps {
    bundle: BundleDetailData;
    rekomendasi?: Array<Record<string, unknown>>;
}

interface BundleCartPayload {
    id: string;
    produk_id: number;
    slug: string;
    nama_produk: string;
    warna: string;
    ukuran: string;
    harga: number;
    gambar: string;
    jumlah: number;
    sku: string;
    is_bundle: boolean;
    bundle_items: Array<{
        item_id: number;
        item_nama: string;
        varian_id: number;
        varian_nama: string;
        sku: string;
    }>;
}

export default function DetailBundle({
    bundle,
    rekomendasi = [],
}: DetailBundleProps) {
    const tambahItem = useKeranjangStore((state) => state.tambahItem);
    const cartItems = useKeranjangStore((state) => state.items);

    // State
    const [activeImage, setActiveImage] = useState<string>(
        bundle.gambar_utama || bundle.galeri?.[0] || "",
    );
    const [selectedVariants, setSelectedVariants] = useState<
        Record<number, BundleVarian>
    >({});
    const [validationErrors, setValidationErrors] = useState<number[]>([]);
    const [jumlah, setJumlah] = useState<number>(1);
    const [isDiscountsModalOpen, setIsDiscountsModalOpen] =
        useState<boolean>(false);

    // Reset state saat navigasi antar bundle (Inertia soft navigation)
    useEffect(() => {
        setActiveImage(bundle.gambar_utama || bundle.galeri?.[0] || "");
        setSelectedVariants({});
        setValidationErrors([]);
        setJumlah(1);
    }, [bundle.id, bundle.gambar_utama, bundle.galeri]);

    // Subtotal keranjang reguler untuk modal kupon
    const globalCartTotal = useMemo(() => {
        if (!cartItems || !Array.isArray(cartItems)) return 0;
        return cartItems.reduce(
            (sum, item) =>
                sum + (Number(item.harga) || 0) * (Number(item.jumlah) || 1),
            0,
        );
    }, [cartItems]);

    // Berat paket untuk kurir/estimator (fallback 800g jika tidak ada dari backend)
    const bundleWeight = useMemo(() => {
        return Number(bundle.berat_total) > 0
            ? Number(bundle.berat_total)
            : 800;
    }, [bundle.berat_total]);

    const handleSelectVariant = (itemId: number, varian: BundleVarian) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [itemId]: varian,
        }));
        setValidationErrors((prev) => prev.filter((id) => id !== itemId));
    };

    const validateSelections = useCallback((): boolean => {
        const missing: number[] = [];
        bundle.items?.forEach((item) => {
            if (
                item.varian &&
                item.varian.length > 0 &&
                !selectedVariants[item.id]
            ) {
                missing.push(item.id);
            }
        });

        if (missing.length > 0) {
            setValidationErrors(missing);
            toast.error(
                "Harap pilih varian warna untuk semua item dalam paket bundle.",
            );
            return false;
        }

        setValidationErrors([]);
        return true;
    }, [bundle.items, selectedVariants]);

    // Builder payload cart terstruktur & konsisten
    const createBundlePayload = useCallback((): BundleCartPayload => {
        const sortedItems = [...(bundle.items || [])].sort(
            (a, b) => a.id - b.id,
        );
        const compositeSku = sortedItems
            .map((item) => selectedVariants[item.id]?.sku || `DEF${item.id}`)
            .join("-");
        const compositeVariantNames = sortedItems
            .map(
                (item) =>
                    `${item.nama} (${selectedVariants[item.id]?.nama || "Default"})`,
            )
            .join(" + ");

        const bundleSubItemsPayload = sortedItems.map((item) => ({
            item_id: item.id,
            item_nama: item.nama,
            varian_id: selectedVariants[item.id]?.id,
            varian_nama: selectedVariants[item.id]?.nama,
            sku: selectedVariants[item.id]?.sku,
        }));

        return {
            id: `bundle-${bundle.id}-${compositeSku}`,
            produk_id: bundle.id,
            slug: bundle.slug,
            nama_produk: bundle.judul,
            warna: compositeVariantNames,
            ukuran: "Bundle Set",
            harga: bundle.harga_paket,
            gambar: bundle.gambar_utama || activeImage,
            jumlah,
            sku: `BND-${bundle.id}-${compositeSku}`,
            is_bundle: true,
            bundle_items: bundleSubItemsPayload,
        };
    }, [bundle, selectedVariants, activeImage, jumlah]);

    const handleAddToCart = () => {
        if (!validateSelections()) return;

        tambahItem(createBundlePayload());
        toast.success(`${bundle.judul} berhasil ditambahkan ke keranjang!`);
    };

    const handleBuyNow = () => {
        if (!validateSelections()) return;

        const buyNowItem = createBundlePayload();

        if (typeof window !== "undefined") {
            try {
                sessionStorage.setItem(
                    "crsl_buy_now_item",
                    JSON.stringify(buyNowItem),
                );
            } catch {
                // Ignore storage limits
            }
        }

        router.visit("/pembayaran?buy_now=1");
    };

    const handleDirectWhatsAppCS = () => {
        const phone = SITUS_CONFIG?.whatsappCS || "628567060477";
        const currentUrl =
            typeof window !== "undefined" ? window.location.href : "";
        const text = encodeURIComponent(
            `Halo tim CS CRSL, saya ingin bertanya tentang paket: ${bundle.judul}\nLink: ${currentUrl}`,
        );
        window.open(
            `https://wa.me/${phone}?text=${text}`,
            "_blank",
            "noopener,noreferrer",
        );
    };

    return (
        <StorefrontLayout>
            <Head title={`${bundle.judul} - CRSL Official Store`} />

            <div className="bg-slate-50 min-h-screen py-6 sm:py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs */}
                    <nav
                        className="flex items-center gap-2 text-xs text-slate-500 mb-6"
                        aria-label="Breadcrumb"
                    >
                        <Link
                            href="/"
                            className="hover:text-slate-900 transition-colors"
                        >
                            Beranda
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <Link
                            href="/katalog"
                            className="hover:text-slate-900 transition-colors"
                        >
                            Bundles
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-900 line-clamp-1">
                            {bundle.judul}
                        </span>
                    </nav>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Kolom Kiri: Galeri Media */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="relative aspect-4/3 sm:aspect-square bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden group">
                                <span className="absolute top-4 left-4 z-10 bg-primary text-white text-xs font-black uppercase px-3 py-1.5 rounded-md shadow-md tracking-wider">
                                    BUNDLE SPECIAL
                                </span>
                                {bundle.diskon_persen > 0 && (
                                    <span className="absolute top-4 right-4 z-10 bg-amber-400 text-slate-950 text-xs font-black uppercase px-3 py-1.5 rounded-md shadow-md">
                                        {bundle.diskon_persen}% OFF
                                    </span>
                                )}

                                <img
                                    src={activeImage}
                                    alt={bundle.judul}
                                    width={600}
                                    height={600}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* Galeri Thumbnail */}
                            {bundle.galeri && bundle.galeri.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {bundle.galeri.map((imgUrl, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() =>
                                                setActiveImage(imgUrl)
                                            }
                                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                                activeImage === imgUrl
                                                    ? "border-primary ring-2 ring-red-100 scale-95"
                                                    : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                                            }`}
                                        >
                                            <img
                                                src={imgUrl}
                                                alt={`Thumbnail ${idx + 1}`}
                                                loading="lazy"
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Freebies Card */}
                            {bundle.freebies && bundle.freebies.length > 0 && (
                                <div className="bg-linear-to-r from-red-50 to-orange-50 border border-red-200/70 rounded-xl p-5 space-y-3">
                                    <div className="flex items-center gap-2.5 text-primary font-black text-sm">
                                        <Gift className="w-5 h-5" />
                                        <span>
                                            FREEBIES & BONUS SPESIAL (TERMASUK
                                            DALAM PAKET)
                                        </span>
                                    </div>
                                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                                        {bundle.freebies.map((bonus, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2.5"
                                            >
                                                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                                                <span>{bonus}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Delivery Estimator */}
                            <DeliveryEstimator
                                productWeight={bundleWeight}
                                productPrice={bundle.harga_paket}
                                productName={bundle.judul}
                            />
                        </div>

                        {/* Kolom Kanan: Detail & Konfigurasi Paket */}
                        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-6 sm:p-7 shadow-xs space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-700 text-white">
                                        In Stock
                                    </span>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-600 text-white">
                                        Bundle Collection
                                    </span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                                    {bundle.judul}
                                </h1>

                                <div className="mt-3 flex items-baseline gap-3">
                                    <span className="text-2xl font-bold text-slate-900">
                                        {formatRupiah(bundle.harga_paket)}
                                    </span>
                                    {bundle.harga_asli > bundle.harga_paket && (
                                        <span className="text-sm font-semibold text-slate-400 line-through">
                                            {formatRupiah(bundle.harga_asli)}
                                        </span>
                                    )}
                                    {bundle.hemat && (
                                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded border border-emerald-200">
                                            {bundle.hemat}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs sm:text-sm text-slate-500 mt-3 leading-relaxed">
                                    {bundle.deskripsi}
                                </p>
                            </div>

                            {/* Diskon & Kupon */}
                            <button
                                type="button"
                                onClick={() => setIsDiscountsModalOpen(true)}
                                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 text-left transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-2.5 text-xs text-slate-800">
                                    <Tag className="w-4 h-4 text-primary shrink-0" />
                                    <div>
                                        <span className="font-semibold text-slate-800 block">
                                            Kupon Diskon Tersedia
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                            Gunakan voucher untuk penawaran
                                            bundle terbaik!
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </button>

                            {/* Konfigurasi Pilihan Item Paket */}
                            <div className="space-y-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-slate-900">
                                        Pilih Varian Item Paket:
                                    </h4>
                                    <span className="text-xs font-medium text-slate-500">
                                        {Object.keys(selectedVariants).length}{" "}
                                        dari {bundle.items?.length || 0} dipilih
                                    </span>
                                </div>

                                {bundle.items?.map((item, index) => {
                                    const currentVar =
                                        selectedVariants[item.id];
                                    const hasError = validationErrors.includes(
                                        item.id,
                                    );

                                    return (
                                        <div
                                            key={item.id}
                                            className={`rounded-lg p-3.5 space-y-2.5 transition-all border ${
                                                hasError
                                                    ? "bg-red-50/50 border-red-400 ring-1 ring-red-200"
                                                    : "bg-slate-50/70 border-slate-200/80"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                                                    <img
                                                        src={item.gambar}
                                                        alt={item.nama}
                                                        loading="lazy"
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                        Item {index + 1}
                                                    </span>
                                                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                                                        {item.nama}
                                                    </h5>
                                                    <span
                                                        className={`text-xs font-semibold ${
                                                            currentVar
                                                                 ? "text-primary"
                                                                : "text-slate-400 italic"
                                                        }`}
                                                    >
                                                        Pilihan:{" "}
                                                        {currentVar?.nama ||
                                                            "Belum dipilih"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Swatches */}
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {item.varian?.map((v) => {
                                                    const isSelected =
                                                        currentVar?.id === v.id;
                                                    return (
                                                        <button
                                                            key={v.id}
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectVariant(
                                                                    item.id,
                                                                    v,
                                                                )
                                                            }
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                                                                isSelected
                                                                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                                                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                                            }`}
                                                        >
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                                                                style={{
                                                                    backgroundColor:
                                                                        v.hex,
                                                                }}
                                                            />
                                                            <span>
                                                                {v.nama}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {hasError && (
                                                <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 pt-1">
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>
                                                        Harap pilih salah satu
                                                        warna untuk item ini
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stepper Jumlah & Tombol Transaksi */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white h-10">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setJumlah((prev) =>
                                                    Math.max(1, prev - 1),
                                                )
                                            }
                                            className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors text-base"
                                            aria-label="Kurangi jumlah"
                                        >
                                            -
                                        </button>
                                        <span className="w-10 text-center font-bold text-sm text-slate-900">
                                            {jumlah}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setJumlah((prev) => prev + 1)
                                            }
                                            className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors text-base"
                                            aria-label="Tambah jumlah"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        className="w-full h-12 border-2 border-primary text-primary hover:bg-red-50/70 font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                                    >
                                        <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                                        <span>Add to Cart</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleBuyNow}
                                        className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                                    >
                                        <Zap className="w-4 h-4 fill-white" />
                                        <span>Buy It Now</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDirectWhatsAppCS}
                                        className="w-full h-11 border border-primary text-primary hover:bg-red-50/50 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Message CRSL?</span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2">
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        <span>100% Produk Original CRSL</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                        <span>Garansi Retur 7 Hari</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Diskon Terkoneksi */}
            <DiscountsModal
                isOpen={isDiscountsModalOpen}
                onClose={() => setIsDiscountsModalOpen(false)}
                cartTotal={
                    globalCartTotal > 0
                        ? globalCartTotal
                        : bundle.harga_paket * jumlah
                }
                onApplyVoucher={(code) => {
                    toast.success(
                        `Voucher ${code} berhasil dipasang ke pesanan!`,
                    );
                }}
            />
        </StorefrontLayout>
    );
}
