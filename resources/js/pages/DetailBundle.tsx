import {
    useState,
    useMemo,
    useEffect,
    useCallback,
    useRef,
} from "react";
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
    Layers,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export interface BundleVarian {
    id: number;
    nama: string;
    hex: string;
    sku: string;
    stok?: number;
    gambar_varian?: string;
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

export interface DetailBundleProps {
    bundle: BundleDetailData;
    rekomendasi?: Array<Record<string, any>>;
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

export default function DetailBundle({
    bundle,
    rekomendasi = [],
    className,
}: DetailBundleProps) {
    const tambahItem = useKeranjangStore((state) => state.tambahItem);
    const cartItems = useKeranjangStore((state) => state.items);

    const mainImageNormalized = normalizeMediaUrl(
        bundle.gambar_utama || bundle.galeri?.[0],
    );

    // State
    const [activeImage, setActiveImage] = useState<string>(mainImageNormalized);
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

    // Otomatis pilih varian pertama yang memiliki stok (Smart Default Selection)
    useEffect(() => {
        setActiveImage(
            normalizeMediaUrl(bundle.gambar_utama || bundle.galeri?.[0]),
        );
        setValidationErrors([]);
        setJumlah(1);

        const initialSelected: Record<number, BundleVarian> = {};
        bundle.items?.forEach((item) => {
            if (item.varian && item.varian.length > 0) {
                const availableVariant =
                    item.varian.find((v) => (v.stok ?? 0) > 0) ||
                    item.varian[0];
                if (availableVariant) {
                    initialSelected[item.id] = availableVariant;
                }
            }
        });
        setSelectedVariants(initialSelected);
    }, [bundle.id, bundle.gambar_utama, bundle.galeri, bundle.items]);

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
            return;
        }

        setSelectedVariants((prev) => ({
            ...prev,
            [itemId]: varian,
        }));
        setValidationErrors((prev) => prev.filter((id) => id !== itemId));

        if (varian.gambar_varian) {
            setActiveImage(normalizeMediaUrl(varian.gambar_varian));
        }
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
            const firstErrorEl = document.getElementById(
                `bundle-item-${missing[0]}`,
            );
            if (firstErrorEl) {
                firstErrorEl.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
            toast.error(
                "Harap tentukan varian untuk semua item paket bundle terlebih dahulu.",
            );
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
            gambar: normalizeMediaUrl(item.gambar),
        }));

        const cartSubItems = sortedItems.map((item) => ({
            nama: item.nama,
            variasi: selectedVariants[item.id]?.nama || "Default",
            gambar: normalizeMediaUrl(item.gambar),
        }));

        return {
            id: `bundle-${bundle.id}-${compositeSku}`,
            produk_id: bundle.id,
            slug: bundle.slug,
            nama_produk: bundle.judul,
            bundle_name: bundle.judul,
            warna: compositeVariantNames,
            ukuran: "Paket Bundle",
            harga: bundle.harga_paket,
            harga_asli: bundle.harga_asli,
            gambar: activeImage,
            jumlah,
            sku: `BND-${bundle.id}-${compositeSku}`,
            is_bundle: true,
            bundle_items: bundleSubItemsPayload,
            sub_items: cartSubItems,
            stok: maxAvailableBundleStock,
        };
    }, [
        bundle,
        selectedVariants,
        activeImage,
        jumlah,
        maxAvailableBundleStock,
    ]);

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

            <div
                className={cn(
                    "bg-slate-50 min-h-screen py-6 sm:py-10 select-none",
                    className,
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs Navigasi WAI-ARIA */}
                    <nav
                        className="flex items-center gap-2 text-xs text-slate-500 mb-6"
                        aria-label="Jejak Navigasi Halaman"
                    >
                        <Link
                            href="/"
                            className="hover:text-slate-900 transition-colors"
                        >
                            Beranda
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[2.2]" />
                        <Link
                            href="/katalog"
                            className="hover:text-slate-900 transition-colors"
                        >
                            Paket Hemat
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[2.2]" />
                        <span className="font-bold text-slate-900 line-clamp-1">
                            {bundle.judul}
                        </span>
                    </nav>

                    {/* Main Grid: 2-Kolom Selaras PDP */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Kolom Kiri: Galeri Media Sticky */}
                        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
                            <div className="relative aspect-square sm:aspect-4/3 lg:aspect-square bg-white rounded-3xl border border-slate-200/90 overflow-hidden group shadow-2xs">
                                <span className="absolute top-3.5 left-3.5 z-10 bg-[#E52027] text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-xs tracking-wider font-mono">
                                    Bundle Spesial
                                </span>
                                {bundle.diskon_persen > 0 && (
                                    <span className="absolute top-3.5 right-3.5 z-10 bg-amber-400 text-slate-950 text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-xs font-mono">
                                        Hemat {bundle.diskon_persen}%
                                    </span>
                                )}

                                <img
                                    src={activeImage}
                                    alt={bundle.judul}
                                    width={700}
                                    height={700}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.onerror = null;
                                        target.src = FALLBACK_IMAGE;
                                    }}
                                />
                            </div>

                            {/* Galeri Thumbnail */}
                            {bundle.galeri && bundle.galeri.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                    {bundle.galeri.map((imgUrl, idx) => {
                                        const normalized =
                                            normalizeMediaUrl(imgUrl);
                                        const isSelected =
                                            activeImage === normalized;

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() =>
                                                    setActiveImage(normalized)
                                                }
                                                className={cn(
                                                    "relative w-20 h-20 rounded-2xl overflow-hidden border transition-all shrink-0 cursor-pointer shadow-2xs",
                                                    isSelected
                                                        ? "border-[#E52027] ring-2 ring-[#E52027]/20"
                                                        : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100",
                                                )}
                                                aria-label={`Lihat gambar galeri ${idx + 1}`}
                                            >
                                                <img
                                                    src={normalized}
                                                    alt={`Thumbnail ${idx + 1}`}
                                                    loading="lazy"
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target =
                                                            e.currentTarget;
                                                        target.onerror = null;
                                                        target.src =
                                                            FALLBACK_IMAGE;
                                                    }}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Kartu Freebies & Bonus */}
                            {bundle.freebies && bundle.freebies.length > 0 && (
                                <div className="bg-linear-to-r from-red-50/70 to-orange-50/70 border border-red-200/80 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-2xs">
                                    <div className="flex items-center gap-2 text-[#E52027] font-black text-xs uppercase tracking-wide">
                                        <Gift className="w-4 h-4 shrink-0 stroke-[2.2]" />
                                        <span>
                                            Bonus Spesial Termasuk dalam Paket
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
                        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2.5">
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono">
                                        Paket Komplit
                                    </span>
                                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 font-mono">
                                        {bundle.items?.length || 0} Produk Utama
                                    </span>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                                    {bundle.judul}
                                </h1>

                                <div className="mt-3 flex items-baseline gap-3">
                                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
                                        {formatRupiah(bundle.harga_paket)}
                                    </span>
                                    {bundle.harga_asli > bundle.harga_paket && (
                                        <span className="text-sm font-semibold text-slate-400 line-through font-mono tabular-nums">
                                            {formatRupiah(bundle.harga_asli)}
                                        </span>
                                    )}
                                    {bundle.hemat && (
                                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200/80 font-mono">
                                            {bundle.hemat}
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                                    {bundle.deskripsi}
                                </p>
                            </div>

                            {/* Diskon & Kupon WAI-ARIA Dialog Trigger */}
                            <button
                                type="button"
                                role="button"
                                aria-haspopup="dialog"
                                aria-expanded={isDiscountsModalOpen}
                                aria-controls="modal-discounts-bundle"
                                onClick={() => setIsDiscountsModalOpen(true)}
                                className="w-full flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100/60 rounded-2xl border border-slate-200/90 text-left transition-colors cursor-pointer group shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                            >
                                <div className="flex items-center gap-3 text-xs text-slate-800">
                                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#E52027] shrink-0 shadow-2xs">
                                        <Tag className="w-4 h-4 stroke-[2.2]" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block">
                                            Kupon Diskon Tersedia
                                        </span>
                                        <span className="text-[11px] text-slate-500 font-medium">
                                            Gunakan voucher untuk penawaran
                                            bundle terbaik!
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-700 transition-all" />
                            </button>

                            {/* Konfigurasi Pilihan Item Paket dengan In-field Validation & Stock Mute */}
                            <div
                                ref={itemsContainerRef}
                                className="space-y-4 pt-3 border-t border-slate-100"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-black text-sm text-slate-900 tracking-tight">
                                            Pilih Varian Item Paket:
                                        </h4>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Tentukan variasi warna/tipe untuk
                                            setiap item
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200/80 font-mono">
                                        {Object.keys(selectedVariants).length} /{" "}
                                        {bundle.items?.length || 0} Terpilih
                                    </span>
                                </div>

                                {bundle.items?.map((item, index) => {
                                    const currentVar =
                                        selectedVariants[item.id];
                                    const hasError = validationErrors.includes(
                                        item.id,
                                    );
                                    const itemImg = normalizeMediaUrl(
                                        item.gambar,
                                    );

                                    return (
                                        <div
                                            key={item.id}
                                            id={`bundle-item-${item.id}`}
                                            className={cn(
                                                "rounded-2xl p-4 space-y-3 transition-all border shadow-2xs",
                                                hasError
                                                    ? "bg-rose-50/40 border-rose-400 ring-2 ring-rose-400/20"
                                                    : "bg-slate-50/70 border-slate-200/90",
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                                                    <img
                                                        src={itemImg}
                                                        alt={item.nama}
                                                        loading="lazy"
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target =
                                                                e.currentTarget;
                                                            target.onerror =
                                                                null;
                                                            target.src =
                                                                FALLBACK_IMAGE;
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                                                            Item {index + 1}{" "}
                                                            dari{" "}
                                                            {
                                                                bundle.items
                                                                    .length
                                                            }{" "}
                                                            (1x Termasuk)
                                                        </span>
                                                        {currentVar && (
                                                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1 font-mono">
                                                                <PackageCheck className="w-3 h-3 stroke-[2.5]" />
                                                                Terpilih
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h5 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                                                        {item.nama}
                                                    </h5>
                                                    <span
                                                        className={cn(
                                                            "text-xs block mt-0.5 font-medium",
                                                            currentVar
                                                                ? "text-[#E52027] font-bold"
                                                                : "text-slate-400 italic",
                                                        )}
                                                    >
                                                        Pilihan:{" "}
                                                        {currentVar?.nama ||
                                                            "Belum dipilih"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Swatches Radio Group WAI-ARIA */}
                                            <div
                                                role="radiogroup"
                                                aria-label={`Pilihan variasi untuk ${item.nama}`}
                                                className="flex flex-wrap gap-2 pt-1"
                                            >
                                                {item.varian?.map((v) => {
                                                    const isSelected =
                                                        currentVar?.id === v.id;
                                                    const isOutOfStock =
                                                        typeof v.stok ===
                                                            "number" &&
                                                        v.stok <= 0;

                                                    return (
                                                        <button
                                                            key={v.id}
                                                            role="radio"
                                                            aria-checked={
                                                                isSelected
                                                            }
                                                            disabled={
                                                                isOutOfStock
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectVariant(
                                                                    item.id,
                                                                    v,
                                                                )
                                                            }
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]",
                                                                isOutOfStock
                                                                    ? "opacity-40 bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed"
                                                                    : isSelected
                                                                      ? "bg-slate-900 text-white border-slate-900"
                                                                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 cursor-pointer",
                                                            )}
                                                            title={
                                                                isOutOfStock
                                                                    ? `${v.nama} (Stok Habis)`
                                                                    : v.nama
                                                            }
                                                        >
                                                            <span
                                                                className={cn(
                                                                    "w-2.5 h-2.5 rounded-full border border-black/10 shrink-0",
                                                                    isOutOfStock &&
                                                                        "grayscale",
                                                                )}
                                                                style={{
                                                                    backgroundColor:
                                                                        v.hex,
                                                                }}
                                                            />
                                                            <span>
                                                                {v.nama}
                                                            </span>
                                                            {isOutOfStock && (
                                                                <span className="text-[10px] uppercase font-bold text-slate-500 ml-0.5">
                                                                    (Habis)
                                                                </span>
                                                            )}
                                                            {!isOutOfStock &&
                                                                typeof v.stok ===
                                                                    "number" &&
                                                                v.stok <= 5 && (
                                                                    <span className="text-[10px] text-amber-600 font-bold ml-0.5 font-mono">
                                                                        (
                                                                        {v.stok}
                                                                        )
                                                                    </span>
                                                                )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* In-field Error Notification */}
                                            {hasError && (
                                                <div
                                                    role="alert"
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-100/70 px-3 py-1.5 rounded-xl border border-rose-200 animate-in fade-in"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>
                                                        Harap pilih salah satu
                                                        variasi untuk item ini
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stepper Jumlah Paket & Tombol Transaksi */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-700">
                                        Jumlah Paket Bundle:
                                    </span>
                                    <div className="inline-flex items-center border border-slate-300 rounded-2xl bg-white h-11 p-1 shadow-2xs">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setJumlah((prev) =>
                                                    Math.max(1, prev - 1),
                                                )
                                            }
                                            disabled={jumlah <= 1}
                                            className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                            aria-label="Kurangi jumlah paket"
                                        >
                                            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </button>
                                        <span className="w-10 text-center font-bold text-sm text-slate-900 select-none font-mono">
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
                                            disabled={
                                                jumlah >=
                                                maxAvailableBundleStock
                                            }
                                            className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                            aria-label="Tambah jumlah paket"
                                        >
                                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        className="w-full min-h-[48px] border-2 border-[#E52027] text-[#E52027] hover:bg-red-50/50 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                    >
                                        <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                                        <span>Tambah ke Keranjang</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleBuyNow}
                                        className="w-full min-h-[48px] bg-[#E52027] hover:bg-[#CC1C22] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] shadow-lg shadow-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                    >
                                        <Zap className="w-4 h-4 fill-white stroke-[2]" />
                                        <span>Beli Sekarang</span>
                                    </button>

                                    <button
                                        type="button"
                                        role="button"
                                        aria-haspopup="dialog"
                                        aria-expanded={isInquiryModalOpen}
                                        aria-controls="modal-inquiry-bundle"
                                        onClick={() =>
                                            setIsInquiryModalOpen(true)
                                        }
                                        className="w-full min-h-[44px] border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                    >
                                        <MessageCircle className="w-4 h-4 text-slate-500 stroke-[2.2]" />
                                        <span>Tanya CS Seputar Bundle Ini</span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                                        <span>100% Produk Original CRSL</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-blue-600 stroke-[2.2]" />
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
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                        Kamu Mungkin Juga Suka
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Pilihan merchandise favorit lainnya
                                        untuk melengkapi gayamu
                                    </p>
                                </div>
                                <Link
                                    href="/katalog"
                                    className="text-xs font-bold text-[#E52027] hover:underline flex items-center gap-1"
                                >
                                    <span>Lihat Semua</span>
                                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                {rekomendasi.slice(0, 4).map((p: any) => {
                                    const pImg = normalizeMediaUrl(
                                        p.gambar_utama || p.gambar,
                                    );
                                    return (
                                        <Link
                                            key={p.id}
                                            href={`/produk/${p.slug}`}
                                            className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden group hover:border-slate-300 transition-all shadow-2xs flex flex-col"
                                        >
                                            <div className="aspect-square bg-slate-100 overflow-hidden relative">
                                                <img
                                                    src={pImg}
                                                    alt={p.nama}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        const target =
                                                            e.currentTarget;
                                                        target.onerror = null;
                                                        target.src =
                                                            FALLBACK_IMAGE;
                                                    }}
                                                />
                                            </div>
                                            <div className="p-4 flex flex-col flex-1 justify-between">
                                                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                                                    {p.nama}
                                                </h4>
                                                <p className="text-xs font-black text-slate-900 mt-2 font-mono tabular-nums">
                                                    {formatRupiah(
                                                        p.harga_dasar ||
                                                            p.harga ||
                                                            0,
                                                    )}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
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
                namaProduk={bundle.judul}
            />
        </StorefrontLayout>
    );
}
