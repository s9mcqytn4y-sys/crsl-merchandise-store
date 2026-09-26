import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { formatRupiah } from "../Utils/formatters";
import DiscountsModal from "../Components/PDP/DiscountsModal";
import DeliveryEstimator from "../Components/PDP/DeliveryEstimator";
import InquiryModal from "../Components/PDP/InquiryModal";
import {
    CheckCircle2,
    ShieldCheck,
    Gift,
    Sparkles,
    ChevronRight,
    ShoppingBag,
    Tag,
    MessageCircle,
    AlertCircle,
    Zap,
    Minus,
    Plus,
    PackageCheck,
} from "lucide-react";
import { toast } from "sonner";

export interface BundleVarian {
    id: number;
    nama: string;
    hex: string;
    sku: string;
    stok?: number;
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
    rekomendasi?: Array<Record<string, any>>;
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
    const [isInquiryModalOpen, setIsInquiryModalOpen] =
        useState<boolean>(false);

    const itemsContainerRef = useRef<HTMLDivElement>(null);

    // Reset state saat navigasi antar bundle
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

    // Hitung stok maksimum paket berdasarkan varian yang dipilih
    const maxAvailableBundleStock = useMemo(() => {
        const selectedList = Object.values(selectedVariants);
        if (selectedList.length === 0) return 99;
        const stocks = selectedList
            .map((v) => (typeof v.stok === "number" ? v.stok : 99))
            .filter((s) => s > 0);
        return stocks.length > 0 ? Math.min(...stocks) : 0;
    }, [selectedVariants]);

    const handleSelectVariant = (itemId: number, varian: BundleVarian) => {
        if (typeof varian.stok === "number" && varian.stok <= 0) {
            return; // Variant habis, tidak dapat dipilih
        }

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

            // Smooth scroll ke elemen yang belum dipilih
            const firstErrorEl = document.getElementById(`bundle-item-${missing[0]}`);
            if (firstErrorEl) {
                firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return false;
        }

        setValidationErrors([]);
        return true;
    }, [bundle.items, selectedVariants]);

    // Builder payload cart terstruktur & konsisten
    const createBundlePayload = useCallback(() => {
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

        const cartSubItems = sortedItems.map((item) => ({
            nama: item.nama,
            variasi: selectedVariants[item.id]?.nama || "Default",
            gambar: item.gambar,
        }));

        return {
            id: `bundle-${bundle.id}-${compositeSku}`,
            produk_id: bundle.id,
            slug: bundle.slug,
            nama_produk: bundle.judul,
            bundle_name: bundle.judul,
            warna: compositeVariantNames,
            ukuran: "Bundle Set",
            harga: bundle.harga_paket,
            harga_asli: bundle.harga_asli,
            gambar: bundle.gambar_utama || activeImage,
            jumlah,
            sku: `BND-${bundle.id}-${compositeSku}`,
            is_bundle: true,
            bundle_items: bundleSubItemsPayload,
            sub_items: cartSubItems,
            stok: maxAvailableBundleStock,
        };
    }, [bundle, selectedVariants, activeImage, jumlah, maxAvailableBundleStock]);

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

                    {/* Main Grid: 2-Kolom Selaras PDP */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Kolom Kiri: Galeri Media Sticky */}
                        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
                            <div className="relative aspect-square sm:aspect-4/3 lg:aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden group shadow-xs">
                                <span className="absolute top-3 left-3 z-10 bg-primary text-white text-[11px] font-bold uppercase px-2.5 py-1 rounded shadow-xs tracking-wider">
                                    Bundle Special
                                </span>
                                {bundle.diskon_persen > 0 && (
                                    <span className="absolute top-3 right-3 z-10 bg-amber-400 text-slate-950 text-[11px] font-bold uppercase px-2.5 py-1 rounded shadow-xs">
                                        {bundle.diskon_persen}% OFF
                                    </span>
                                )}

                                <img
                                    src={activeImage}
                                    alt={bundle.judul}
                                    width={700}
                                    height={700}
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
                                            className={`relative w-20 h-20 rounded-lg overflow-hidden border transition-all shrink-0 cursor-pointer ${
                                                activeImage === imgUrl
                                                    ? "border-primary ring-2 ring-red-100"
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
                                <div className="bg-linear-to-r from-red-50/70 to-orange-50/70 border border-red-200/80 rounded-lg p-4 space-y-2.5">
                                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wide">
                                        <Gift className="w-4 h-4 shrink-0" />
                                        <span>
                                            Freebies & Bonus Termasuk dalam Paket
                                        </span>
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                                        {bundle.freebies.map((bonus, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2"
                                            >
                                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span>{bonus}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Delivery Estimator Biteship */}
                            <DeliveryEstimator
                                productWeight={bundleWeight}
                                productPrice={bundle.harga_paket}
                                productName={bundle.judul}
                            />
                        </div>

                        {/* Kolom Kanan: Detail & Konfigurasi Paket */}
                        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 sm:p-7 shadow-xs space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2.5">
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                                        Paket Komplit
                                    </span>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                        {bundle.items?.length || 0} Produk Utama
                                    </span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                                    {bundle.judul}
                                </h1>

                                <div className="mt-3 flex items-baseline gap-3">
                                    <span className="text-2xl font-black text-slate-900">
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

                                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                                    {bundle.deskripsi}
                                </p>
                            </div>

                            {/* Diskon & Kupon */}
                            <button
                                type="button"
                                onClick={() => setIsDiscountsModalOpen(true)}
                                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-left transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-2.5 text-xs text-slate-800">
                                    <Tag className="w-4 h-4 text-primary shrink-0" />
                                    <div>
                                        <span className="font-semibold text-slate-900 block">
                                            Kupon Diskon Tersedia
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                            Gunakan voucher untuk penawaran bundle terbaik!
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </button>

                            {/* Konfigurasi Pilihan Item Paket dengan In-field Validation & Stock Mute */}
                            <div
                                ref={itemsContainerRef}
                                className="space-y-4 pt-3 border-t border-slate-100"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900">
                                            Pilih Varian Item Paket:
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                            Tentukan variasi warna/tipe untuk setiap item
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                        {Object.keys(selectedVariants).length} / {bundle.items?.length || 0} Terpilih
                                    </span>
                                </div>

                                {bundle.items?.map((item, index) => {
                                    const currentVar = selectedVariants[item.id];
                                    const hasError = validationErrors.includes(item.id);

                                    return (
                                        <div
                                            key={item.id}
                                            id={`bundle-item-${item.id}`}
                                            className={`rounded-lg p-4 space-y-3 transition-all border ${
                                                hasError
                                                    ? "bg-red-50/50 border-red-500 ring-1 ring-red-300"
                                                    : "bg-slate-50/80 border-slate-200"
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
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                            Item {index + 1} of {bundle.items.length} (1x Termasuk)
                                                        </span>
                                                        {currentVar && (
                                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
                                                                <PackageCheck className="w-3 h-3" />
                                                                Terpilih
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                                                        {item.nama}
                                                    </h5>
                                                    <span
                                                        className={`text-xs font-medium block mt-0.5 ${
                                                            currentVar
                                                                ? "text-primary font-semibold"
                                                                : "text-slate-400 italic"
                                                        }`}
                                                    >
                                                        Pilihan: {currentVar?.nama || "Belum dipilih"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Swatches dengan Stock Validation & 0-Stock Muting */}
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {item.varian?.map((v) => {
                                                    const isSelected = currentVar?.id === v.id;
                                                    const isOutOfStock = typeof v.stok === "number" && v.stok <= 0;

                                                    return (
                                                        <button
                                                            key={v.id}
                                                            type="button"
                                                            disabled={isOutOfStock}
                                                            onClick={() => handleSelectVariant(item.id, v)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                                                                isOutOfStock
                                                                    ? "opacity-40 bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed"
                                                                    : isSelected
                                                                      ? "bg-slate-900 text-white border-slate-900 shadow-xs cursor-pointer"
                                                                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 cursor-pointer"
                                                            }`}
                                                            title={isOutOfStock ? `${v.nama} (Stok Habis)` : v.nama}
                                                        >
                                                            <span
                                                                className={`w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 ${isOutOfStock ? "grayscale" : ""}`}
                                                                style={{ backgroundColor: v.hex }}
                                                            />
                                                            <span>{v.nama}</span>
                                                            {isOutOfStock && (
                                                                <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">
                                                                    (Habis)
                                                                </span>
                                                            )}
                                                            {!isOutOfStock && typeof v.stok === "number" && v.stok <= 5 && (
                                                                <span className="text-[10px] text-amber-600 font-bold ml-0.5">
                                                                    ({v.stok})
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* In-field Error Notification */}
                                            {hasError && (
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-100/70 px-2.5 py-1.5 rounded border border-red-200">
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>Harap pilih salah satu variasi warna untuk item ini</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stepper Jumlah Paket & Tombol Transaksi */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-700">
                                        Jumlah Paket Bundle:
                                    </span>
                                    <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white h-10">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setJumlah((prev) =>
                                                    Math.max(1, prev - 1),
                                                )
                                            }
                                            disabled={jumlah <= 1}
                                            className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Kurangi jumlah"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-10 text-center font-bold text-sm text-slate-900 select-none">
                                            {jumlah}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setJumlah((prev) =>
                                                    Math.min(
                                                        maxAvailableBundleStock,
                                                        prev + 1,
                                                    ),
                                                )
                                            }
                                            disabled={jumlah >= maxAvailableBundleStock}
                                            className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            aria-label="Tambah jumlah"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
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
                                        onClick={() => setIsInquiryModalOpen(true)}
                                        className="w-full h-11 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                    >
                                        <MessageCircle className="w-4 h-4 text-slate-500" />
                                        <span>Message CRSL?</span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
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

                    {/* Rekomendasi Produk Tambahan */}
                    {rekomendasi && rekomendasi.length > 0 && (
                        <div className="mt-16 pt-10 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                        You Might Also Like
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Pilihan merchandise favorit lainnya untuk melengkapi gayamu
                                    </p>
                                </div>
                                <Link
                                    href="/katalog"
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    <span>Lihat Semua</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                {rekomendasi.slice(0, 4).map((p: any) => (
                                    <Link
                                        key={p.id}
                                        href={`/produk/${p.slug}`}
                                        className="bg-white border border-slate-200 rounded-lg overflow-hidden group hover:border-slate-300 transition-all shadow-xs flex flex-col"
                                    >
                                        <div className="aspect-square bg-slate-100 overflow-hidden relative">
                                            <img
                                                src={
                                                    p.gambar_utama ||
                                                    "/assets/gambar/placeholder.webp"
                                                }
                                                alt={p.nama}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <div className="p-3.5 flex flex-col flex-1 justify-between">
                                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                                                {p.nama}
                                            </h4>
                                            <p className="text-xs font-black text-slate-900 mt-2">
                                                {formatRupiah(p.harga_dasar || 0)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
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

            {/* Modal Pertanyaan Produk (Inquiry) */}
            <InquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
                produkId={bundle.id}
                produkNama={bundle.judul}
            />
        </StorefrontLayout>
    );
}
