import { useRef, useEffect } from "react";
import gsap from "gsap";
import { formatRupiah } from "../../Utils/formatters";
import { VoucherItem } from "./VoucherSelectModal";
import { cn } from "../../lib/utils";

interface PaymentBreakdownSectionProps {
    subtotal: number;
    totalItemsCount: number;
    productDiscount: number;
    bundleDiscount?: number;
    voucherDiscount: number;
    appliedVoucher: VoucherItem | null;
    useLoyaltyPoints: boolean;
    loyaltyDiscount: number;
    shippingCost: number;
    totalWeightKg: number;
    insuranceFee: number;
    hasInsurance: boolean;
    totalPayment: number;
    className?: string;
}

export default function PaymentBreakdownSection({
    subtotal,
    totalItemsCount,
    productDiscount = 0,
    bundleDiscount = 0,
    voucherDiscount = 0,
    appliedVoucher,
    useLoyaltyPoints,
    loyaltyDiscount = 0,
    shippingCost,
    totalWeightKg = 1.0,
    insuranceFee = 0,
    hasInsurance = false,
    totalPayment,
    className,
}: PaymentBreakdownSectionProps) {
    const totalRef = useRef<HTMLSpanElement>(null);

    // Animasi GSAP aman memory leak dengan dukungan prefers-reduced-motion
    useEffect(() => {
        if (!totalRef.current) return;

        const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                totalRef.current,
                { scale: 1.04, color: "#E52027" },
                {
                    scale: 1,
                    color: "#0f172a",
                    duration: 0.35,
                    ease: "power2.out",
                    overwrite: "auto",
                },
            );
        }, totalRef);

        return () => ctx.revert();
    }, [totalPayment]);

    return (
        <div
            className={cn(
                "space-y-3.5 text-xs sm:text-sm select-none",
                className,
            )}
        >
            {/* Rincian Komponen Biaya */}
            <div className="space-y-2.5 text-slate-600">
                {/* Subtotal Item */}
                <div className="flex items-center justify-between">
                    <span>Subtotal • {totalItemsCount} produk</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums">
                        {formatRupiah(subtotal)}
                    </span>
                </div>

                {/* Diskon Produk */}
                {productDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                        <span>Diskon Produk</span>
                        <span className="font-bold font-mono tabular-nums">
                            -{formatRupiah(productDiscount)}
                        </span>
                    </div>
                )}

                {/* Diskon Paket Bundle */}
                {bundleDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                        <span>Diskon Paket Bundle</span>
                        <span className="font-bold font-mono tabular-nums">
                            -{formatRupiah(bundleDiscount)}
                        </span>
                    </div>
                )}

                {/* Diskon Voucher */}
                {voucherDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-medium">
                        <span>
                            Diskon Voucher{" "}
                            {appliedVoucher ? `(${appliedVoucher.kode})` : ""}
                        </span>
                        <span className="font-bold font-mono tabular-nums">
                            -{formatRupiah(voucherDiscount)}
                        </span>
                    </div>
                )}

                {/* Diskon Koin Loyalitas */}
                {useLoyaltyPoints && loyaltyDiscount > 0 && (
                    <div className="flex items-center justify-between text-amber-700 font-medium">
                        <span>Diskon Koin Loyalitas</span>
                        <span className="font-bold font-mono tabular-nums">
                            -{formatRupiah(loyaltyDiscount)}
                        </span>
                    </div>
                )}

                {/* Ongkos Kirim */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span>Ongkos Kirim • {totalWeightKg.toFixed(1)}kg</span>
                        <span className="font-bold text-slate-900 font-mono tabular-nums">
                            {shippingCost > 0
                                ? formatRupiah(shippingCost)
                                : "Gratis / Belum Dipilih"}
                        </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                        Tarif ekspedisi resmi dihitung berdasarkan berat aktual
                        dan volumetrik pesanan.
                    </p>
                </div>

                {/* Asuransi Ekspedisi */}
                {hasInsurance && insuranceFee > 0 && (
                    <div className="flex items-center justify-between">
                        <span>Biaya Asuransi Pengiriman</span>
                        <span className="font-bold text-slate-900 font-mono tabular-nums">
                            {formatRupiah(insuranceFee)}
                        </span>
                    </div>
                )}
            </div>

            {/* Garis Pembatas */}
            <div className="border-t border-slate-100" />

            {/* Total Pembayaran Akhir */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="flex items-center justify-between pt-1"
            >
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    Total Pembayaran
                </span>
                <span
                    ref={totalRef}
                    className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight inline-block transition-transform font-mono tabular-nums"
                >
                    {formatRupiah(totalPayment)}
                </span>
            </div>
        </div>
    );
}
