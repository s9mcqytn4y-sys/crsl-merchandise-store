import React from "react";
import { Link } from "@inertiajs/react";
import { formatRupiah } from "../../Utils/formatters";
import LoyaltyProgressBar from "./LoyaltyProgressBar";

interface DrawerFooterProps {
    totalItem: number;
    totalHarga: number;
    totalHemat: number;
    onClose: () => void;
}

export default function DrawerFooter({
    totalItem,
    totalHarga,
    totalHemat,
    onClose,
}: DrawerFooterProps) {
    return (
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 space-y-3 shadow-xl shrink-0">
            {/* Total Price & Savings */}
            <div className="flex items-baseline justify-between">
                <div>
                    <span className="text-xs font-bold text-slate-700">
                        Total Price ({totalItem})
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                        {formatRupiah(totalHarga)}
                    </span>
                    {totalHemat > 0 && (
                        <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                            Save {formatRupiah(totalHemat)}
                        </p>
                    )}
                </div>
            </div>

            {/* Loyalty Tier Milestone Progress */}
            <LoyaltyProgressBar
                totalHarga={totalHarga}
                threshold={200000}
                onCloseDrawer={onClose}
            />

            {/* Red CTA Button (44px min tap height) */}
            <div className="space-y-1.5 pt-1">
                <Link
                    href="/pembayaran"
                    onClick={onClose}
                    className="w-full min-h-11 py-3.5 px-6 rounded-full bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg flex items-center justify-center text-center transition-all cursor-pointer"
                >
                    Checkout with Discount
                </Link>

                <p className="text-center text-[10px] text-slate-500">
                    Spend Rp 200.000 to unlock loyalty rewards!
                </p>
            </div>
        </div>
    );
}
