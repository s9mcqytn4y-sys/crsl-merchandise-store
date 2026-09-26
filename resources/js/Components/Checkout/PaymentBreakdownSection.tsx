import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { formatRupiah } from "../../Utils/formatters";
import { VoucherItem } from "./VoucherSelectModal";

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
}

export default function PaymentBreakdownSection({
    subtotal,
    totalItemsCount,
    productDiscount,
    bundleDiscount = 0,
    voucherDiscount,
    appliedVoucher,
    useLoyaltyPoints,
    loyaltyDiscount,
    shippingCost,
    totalWeightKg,
    insuranceFee,
    hasInsurance,
    totalPayment,
}: PaymentBreakdownSectionProps) {
    const totalRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (totalRef.current) {
            gsap.fromTo(
                totalRef.current,
                { scale: 1.05, color: "#E52027" },
                { scale: 1, color: "#0f172a", duration: 0.35, ease: "power2.out" }
            );
        }
    }, [totalPayment]);

    return (
        <div className="space-y-3.5 text-xs sm:text-sm">
            {/* Breakdown Items */}
            <div className="space-y-2.5 text-slate-600">
                <div className="flex items-center justify-between">
                    <span>Subtotal • {totalItemsCount} items</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
                </div>

                {productDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600">
                        <span>Product Discount</span>
                        <span className="font-semibold">-{formatRupiah(productDiscount)}</span>
                    </div>
                )}

                {bundleDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600">
                        <span>Bundle product discount</span>
                        <span className="font-semibold">-{formatRupiah(bundleDiscount)}</span>
                    </div>
                )}

                {voucherDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600">
                        <span>Voucher Discount {appliedVoucher ? `(${appliedVoucher.kode})` : ""}</span>
                        <span className="font-semibold">-{formatRupiah(voucherDiscount)}</span>
                    </div>
                )}

                {useLoyaltyPoints && loyaltyDiscount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600">
                        <span>Loyalty Point Discount</span>
                        <span className="font-semibold">-{formatRupiah(loyaltyDiscount)}</span>
                    </div>
                )}

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span>Shipping • {totalWeightKg.toFixed(1)}kg</span>
                        <span className="font-semibold text-slate-900">
                            {shippingCost > 0 ? formatRupiah(shippingCost) : "Rp 0"}
                        </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                        Shipping might be charged by volumetric weight, based on parcel size rather than actual weight.
                    </p>
                </div>

                {hasInsurance && (
                    <div className="flex items-center justify-between">
                        <span>Shipment Insurance Fee</span>
                        <span className="font-semibold text-slate-900">{formatRupiah(insuranceFee)}</span>
                    </div>
                )}
            </div>

            {/* Separator */}
            <div className="border-t border-slate-100" />

            {/* Total Payment */}
            <div className="flex items-center justify-between pt-1">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                    Total Payment
                </span>
                <span
                    ref={totalRef}
                    className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight inline-block transition-transform"
                >
                    {formatRupiah(totalPayment)}
                </span>
            </div>
        </div>
    );
}
