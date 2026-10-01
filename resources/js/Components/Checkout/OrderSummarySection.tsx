import { useEffect, useRef, useMemo } from "react";
import { Lock, Loader2 } from "lucide-react";
import gsap from "gsap";
import { formatRupiah } from "../../Utils/formatters";
import { VoucherItem } from "./VoucherSelectModal";
import DeliveryMessageRow from "./DeliveryMessageRow";
import VoucherRow from "./VoucherRow";
import LoyaltyPointRow from "./LoyaltyPointRow";
import PaymentBreakdownSection from "./PaymentBreakdownSection";
import { cn } from "../../lib/utils";

export interface BundleSubItemPayload {
    item_id?: number | string;
    item_nama?: string;
    nama?: string;
    varian_id?: number | string;
    varian_nama?: string;
    variasi?: string;
    sku?: string;
    gambar?: string;
}

export interface CartItem {
    id: string | number;
    produk_id?: number;
    varian_id?: number;
    nama_produk?: string;
    harga?: number;
    harga_asli?: number;
    jumlah?: number;
    gambar?: string | null;
    ukuran?: string | null;
    warna?: string | null;
    is_bundle?: boolean;
    bundle_name?: string;
    sub_items?: BundleSubItemPayload[];
    bundle_items?: BundleSubItemPayload[];
}

interface OrderSummarySectionProps {
    items: CartItem[];
    subtotal: number;
    productDiscount?: number;
    bundleDiscount?: number;
    shippingCost: number;
    totalWeightKg?: number;
    insuranceFee?: number;
    hasInsurance?: boolean;
    appliedVoucher: VoucherItem | null;
    voucherDiscount: number;
    loyaltyPoints: number;
    useLoyaltyPoints: boolean;
    onToggleLoyaltyPoints: (use: boolean) => void;
    loyaltyDiscount: number;
    totalPayment: number;
    deliveryMessage: string;
    onOpenDeliveryMessageModal: () => void;
    onOpenVoucherModal: () => void;
    onSubmitOrder: () => void;
    isSubmitting: boolean;
    className?: string;
}

const FALLBACK_IMAGE = "/assets/gambar/banner-1.webp";

/** Normalisasi URL media relatif vs absolut */
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

export default function OrderSummarySection({
    items,
    subtotal,
    productDiscount = 0,
    bundleDiscount = 0,
    shippingCost,
    totalWeightKg = 1.0,
    insuranceFee = 2500,
    hasInsurance = true,
    appliedVoucher,
    voucherDiscount,
    loyaltyPoints,
    useLoyaltyPoints,
    onToggleLoyaltyPoints,
    loyaltyDiscount,
    totalPayment,
    deliveryMessage,
    onOpenDeliveryMessageModal,
    onOpenVoucherModal,
    onSubmitOrder,
    isSubmitting,
    className,
}: OrderSummarySectionProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Animasi GSAP aman memory leak dengan dukungan prefers-reduced-motion
    useEffect(() => {
        if (!cardRef.current) return;

        const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                cardRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
            );
        }, cardRef);

        return () => ctx.revert();
    }, []);

    // Total kuantitas item
    const totalItemsCount = useMemo(() => {
        return items.reduce((acc, it) => acc + (Number(it.jumlah) || 1), 0);
    }, [items]);

    // Batas maksimal potongan koin loyalitas (hanya boleh memotong sisa subtotal belanja)
    const maksimalPotonganPoin = useMemo(() => {
        const sisa =
            Number(subtotal) -
            Number(productDiscount) -
            Number(bundleDiscount) -
            Number(voucherDiscount);
        return Math.max(0, sisa);
    }, [subtotal, productDiscount, bundleDiscount, voucherDiscount]);

    return (
        <aside
            aria-label="Ringkasan Pesanan"
            className={cn("space-y-4 select-none", className)}
        >
            <div
                ref={cardRef}
                className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5"
            >
                {/* 1. Header Ringkasan & Counter Item */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                        Ringkasan Pesanan
                    </h3>
                    <span className="text-xs font-bold text-slate-500 font-mono bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {totalItemsCount} Barang
                    </span>
                </div>

                {/* 2. Daftar Item Belanja */}
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1 no-scrollbar overscroll-contain">
                    {items.map((item, idx) => {
                        const itemQty = Number(item.jumlah) || 1;
                        const itemPrice = Number(item.harga) || 0;
                        const itemOriginalPrice =
                            Number(item.harga_asli) || itemPrice;
                        const hasDiscount = itemOriginalPrice > itemPrice;
                        const subItemList =
                            item.bundle_items || item.sub_items || [];
                        const imageUrl = normalizeMediaUrl(item.gambar);

                        return (
                            <div
                                key={item.id || idx}
                                className="space-y-2.5 border-b border-slate-100 pb-3.5 last:border-0 last:pb-0"
                            >
                                <div className="flex gap-3.5 items-start">
                                    {/* Thumbnail Produk */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80">
                                        <img
                                            src={imageUrl}
                                            alt={
                                                item.nama_produk ||
                                                "Produk CRSL"
                                            }
                                            loading="lazy"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.onerror = null;
                                                target.src = FALLBACK_IMAGE;
                                            }}
                                        />
                                    </div>

                                    {/* Detail Produk */}
                                    <div className="flex-1 min-w-0">
                                        {item.is_bundle && (
                                            <span className="text-[10px] font-black text-primary tracking-wider uppercase block mb-0.5">
                                                PAKET BUNDLE
                                            </span>
                                        )}
                                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                                            {item.nama_produk ||
                                                "Produk Merchandise"}
                                        </h4>

                                        {(item.warna || item.ukuran) && (
                                            <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5 line-clamp-1">
                                                {[item.warna, item.ukuran]
                                                    .filter(Boolean)
                                                    .join(" • ")}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between gap-2 mt-2">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                                                    {formatRupiah(itemPrice)}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="text-[11px] text-slate-400 line-through font-mono">
                                                        {formatRupiah(
                                                            itemOriginalPrice,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500 font-bold font-mono">
                                                x{itemQty}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Komponen Sub-Item Paket Bundle */}
                                {item.is_bundle && subItemList.length > 0 && (
                                    <div className="pl-4 sm:pl-5 border-l-2 border-slate-200 space-y-1.5 ml-4 sm:ml-5">
                                        {subItemList.map((sub, sIdx) => {
                                            const subName =
                                                sub.item_nama ||
                                                sub.nama ||
                                                "Item Bundle";
                                            const subVariant =
                                                sub.varian_nama ||
                                                sub.variasi ||
                                                "Default";
                                            const subImg = normalizeMediaUrl(
                                                sub.gambar,
                                            );

                                            return (
                                                <div
                                                    key={sIdx}
                                                    className="flex items-center gap-2 text-[11px] text-slate-600"
                                                >
                                                    {sub.gambar && (
                                                        <div className="w-5 h-5 rounded-md bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                                                            <img
                                                                src={subImg}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    const target =
                                                                        e.currentTarget;
                                                                    target.onerror =
                                                                        null;
                                                                    target.src =
                                                                        FALLBACK_IMAGE;
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="truncate font-medium">
                                                        {subName}
                                                    </span>
                                                    <span className="text-slate-400 shrink-0 font-medium">
                                                        ({subVariant})
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* 3. Catatan Pengiriman */}
                <DeliveryMessageRow
                    message={deliveryMessage}
                    onOpenModal={onOpenDeliveryMessageModal}
                />

                {/* 4. Baris Kupon Diskon */}
                <VoucherRow
                    appliedVoucher={appliedVoucher}
                    voucherDiscount={voucherDiscount}
                    onOpenModal={onOpenVoucherModal}
                />

                {/* 5. Penggunaan Poin Loyalitas dengan Batas Potongan Terkunci */}
                <LoyaltyPointRow
                    loyaltyPoints={loyaltyPoints}
                    useLoyaltyPoints={useLoyaltyPoints}
                    onToggle={onToggleLoyaltyPoints}
                    maksimalPotongan={maksimalPotonganPoin}
                />

                <div className="border-t border-slate-100" />

                {/* 6. Rincian Biaya Pembayaran */}
                <PaymentBreakdownSection
                    subtotal={subtotal}
                    totalItemsCount={totalItemsCount}
                    productDiscount={productDiscount}
                    bundleDiscount={bundleDiscount}
                    voucherDiscount={voucherDiscount}
                    appliedVoucher={appliedVoucher}
                    useLoyaltyPoints={useLoyaltyPoints}
                    loyaltyDiscount={loyaltyDiscount}
                    shippingCost={shippingCost}
                    totalWeightKg={totalWeightKg}
                    insuranceFee={insuranceFee}
                    hasInsurance={hasInsurance}
                    totalPayment={totalPayment}
                />

                {/* 7. Jaminan Keamanan Pembayaran */}
                <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                            Pembayaran Resmi Terenkripsi & Dilindungi Midtrans
                        </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-500 text-center leading-relaxed">
                        Total tagihan sudah termasuk PPN 11% sesuai peraturan
                        perundangan perpajakan Indonesia.
                    </div>
                </div>

                {/* 8. Tombol Eksekusi Order */}
                <div className="space-y-2.5 pt-2">
                    <button
                        type="button"
                        onClick={onSubmitOrder}
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                        className="w-full min-h-[50px] px-6 rounded-2xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Memproses Pesanan...</span>
                            </>
                        ) : (
                            <span>
                                Bayar Sekarang • {formatRupiah(totalPayment)}
                            </span>
                        )}
                    </button>

                    <p className="text-center text-[10px] sm:text-[11px] text-slate-400 leading-relaxed">
                        Dengan menekan tombol di atas, Anda menyetujui{" "}
                        <a
                            href="/syarat-ketentuan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-slate-600 transition-colors"
                        >
                            Syarat & Ketentuan
                        </a>{" "}
                        serta Kebijakan Pengembalian CRSL Store.
                    </p>
                </div>
            </div>
        </aside>
    );
}
