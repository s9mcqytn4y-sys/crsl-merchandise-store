import React from "react";
import { Link } from "@inertiajs/react";
import { Gift, ChevronRight } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";

interface LoyaltyProgressBarProps {
    totalHarga: number;
    threshold?: number;
    onCloseDrawer?: () => void;
}

export default function LoyaltyProgressBar({
    totalHarga,
    threshold = 200000,
    onCloseDrawer,
}: LoyaltyProgressBarProps) {
    const sisaLoyalty = Math.max(0, threshold - totalHarga);
    const loyaltyProgress = Math.min(
        100,
        Math.round((totalHarga / threshold) * 100)
    );

    return (
        <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <Gift className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                    {sisaLoyalty > 0 ? (
                        <>Spend {formatRupiah(sisaLoyalty)} more to reach New Freen</>
                    ) : (
                        <>You have unlocked New Freen Loyalty Tier!</>
                    )}
                </span>
            </div>

            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${loyaltyProgress}%` }}
                />
            </div>

            <div>
                <Link
                    href="/akun"
                    onClick={onCloseDrawer}
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <span>View Loyalty benefit</span>
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
