import React, { useEffect, useRef, useMemo } from "react";
import { Lock, Loader2 } from "lucide-react";
import gsap from "gsap";
import { formatRupiah } from "../../Utils/formatters";
import { VoucherItem } from "./VoucherSelectModal";
import DeliveryMessageRow from "./DeliveryMessageRow";
import VoucherRow from "./VoucherRow";
import LoyaltyPointRow from "./LoyaltyPointRow";
import PaymentBreakdownSection from "./PaymentBreakdownSection";

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
    gambar?: string;
    ukuran?: string;
    warna?: string;
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
}: OrderSummarySectionProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Animasi GSAP yang aman terhadap memory leak dengan gsap.context()
    useEffect(() => {
        if (!cardRef.current) return;

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

    return (
        <aside aria-label="Ringkasan Pesanan" className="space-y-4">
            <div
                ref={cardRef}
                className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5"
            >
                {/* 1. Daftar Item Belanja */}
                <div className="space-y-4 max-h-95 overflow-y-auto pr-1">
                    {items.map((item, idx) => {
                        const itemQty = Number(item.jumlah) || 1;
                        const itemPrice = Number(item.harga) || 0;
                        const itemOriginalPrice =
                            Number(item.harga_asli) || itemPrice;
                        const hasDiscount = itemOriginalPrice > itemPrice;
                        const subItemList =
                            item.bundle_items || item.sub_items || [];

                        return (
                            <div
                                key={item.id || idx}
                                className="space-y-2.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                            >
                                <div className="flex gap-3.5 items-start">
                                    {/* Thumbnail Produk */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80">
                                        <img
                                            src={
                                                item.gambar ||
                                                "/assets/gambar/produk-placeholder.webp"
                                            }
                                            alt={item.nama_produk || "Produk"}
                                            loading="lazy"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.src =
                                                    "/assets/gambar/produk-placeholder.webp";
                                            }}
                                        />
                                    </div>

                                    {/* Detail Produk */}
                                    <div className="flex-1 min-w-0">
                                        {item.is_bundle && (
                                            <span className="text-[10px] font-bold text-red-600 tracking-wider uppercase block mb-0.5">
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
                                                <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                                                    {formatRupiah(itemPrice)}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="text-[11px] text-slate-400 line-through">
                                                        {formatRupiah(
                                                            itemOriginalPrice,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium">
                                                Qty: {itemQty}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Komponen Sub-Item Paket Bundle */}
                                {item.is_bundle && subItemList.length > 0 && (
                                    <div className="pl-4 sm:pl-6 border-l-2 border-slate-100 space-y-1.5 ml-4 sm:ml-5">
                                        {subItemList.map((sub, sIdx) => {
                                            const subName =
                                                sub.item_nama ||
                                                sub.nama ||
                                                "Item Bundle";
                                            const subVariant =
                                                sub.varian_nama ||
                                                sub.variasi ||
                                                "Default";

                                            return (
                                                <div
                                                    key={sIdx}
                                                    className="flex items-center gap-2 text-[11px] text-slate-600"
                                                >
                                                    {sub.gambar && (
                                                        <div className="w-5 h-5 rounded bg-slate-100 overflow-hidden shrink-0">
                                                            <img
                                                                src={sub.gambar}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="truncate font-medium">
                                                        {subName}
                                                    </span>
                                                    <span className="text-slate-400 shrink-0">
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

                {/* 2. Catatan Pengiriman */}
                <DeliveryMessageRow
                    message={deliveryMessage}
                    onOpenModal={onOpenDeliveryMessageModal}
                />

                {/* 3. Baris Kupon Diskon */}
                <VoucherRow
                    appliedVoucher={appliedVoucher}
                    voucherDiscount={voucherDiscount}
                    onOpenModal={onOpenVoucherModal}
                />

                {/* 4. Penggunaan Poin Loyalitas */}
                <LoyaltyPointRow
                    loyaltyPoints={loyaltyPoints}
                    useLoyaltyPoints={useLoyaltyPoints}
                    onToggle={onToggleLoyaltyPoints}
                />

                <div className="border-t border-slate-100" />

                {/* 5. Rincian Biaya Pembayaran */}
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

                {/* 6. Jaminan Keamanan & Pajak */}
                <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pembayaran Aman & Terenkripsi</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-500 text-center leading-relaxed">
                        Pajak atau bea masuk mungkin dikenakan bergantung pada
                        regulasi wilayah tujuan pengiriman.
                    </div>
                </div>

                {/* 7. Tombol Eksekusi Order */}
                <div className="space-y-2.5 pt-2">
                    <button
                        type="button"
                        onClick={onSubmitOrder}
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                        className="w-full h-12 px-6 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Memproses Pesanan...</span>
                            </>
                        ) : (
                            <span>Bayar Sekarang</span>
                        )}
                    </button>

                    <p className="text-center text-[10px] sm:text-[11px] text-slate-400">
                        Dengan menekan tombol di atas, Anda menyetujui{" "}
                        <a
                            href="/syarat-ketentuan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-slate-600 transition-colors"
                        >
                            Syarat & Ketentuan
                        </a>{" "}
                        pembelian CRSL.
                    </p>
                </div>
            </div>
        </aside>
    );
}
