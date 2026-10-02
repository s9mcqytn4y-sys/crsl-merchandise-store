import { Coins } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { cn } from "../../lib/utils";

interface LoyaltyPointRowProps {
    loyaltyPoints?: number;
    useLoyaltyPoints: boolean;
    onToggle: (checked: boolean) => void;
    /** Maksimal poin yang dapat dipotong sesuai sisa subtotal belanja */
    maksimalPotongan?: number;
    className?: string;
}

export default function LoyaltyPointRow({
    loyaltyPoints = 0,
    useLoyaltyPoints,
    onToggle,
    maksimalPotongan,
    className,
}: LoyaltyPointRowProps) {
    const isAvailable = loyaltyPoints > 0;

    // Hitung poin riil yang akan dipakai (1 Poin = Rp 1)
    const estimasiPoinDipakai =
        maksimalPotongan !== undefined
            ? Math.min(loyaltyPoints, Math.max(0, maksimalPotongan))
            : loyaltyPoints;

    const canRedeem =
        isAvailable && (maksimalPotongan === undefined || maksimalPotongan > 0);

    const handleToggleClick = () => {
        if (!canRedeem) return;
        onToggle(!useLoyaltyPoints);
    };

    return (
        <div
            onClick={handleToggleClick}
            className={cn(
                "flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all select-none",
                !canRedeem
                    ? "bg-slate-50/70 border-slate-200/80 opacity-60 cursor-not-allowed"
                    : useLoyaltyPoints
                      ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-300/30 cursor-pointer shadow-2xs"
                      : "bg-white border-slate-200 hover:border-slate-300 cursor-pointer shadow-2xs",
                className,
            )}
        >
            <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                    className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs",
                        useLoyaltyPoints && canRedeem
                            ? "bg-amber-500 text-white"
                            : "bg-amber-100 text-amber-700",
                    )}
                >
                    <Coins className="w-5 h-5 stroke-2" />
                </div>

                <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            Tukarkan Koin CRSL
                        </span>
                        {isAvailable && (
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-200">
                                {loyaltyPoints.toLocaleString("id-ID")} Pts
                            </span>
                        )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed truncate">
                        {!isAvailable ? (
                            "Belum ada saldo koin loyalitas di akun Anda"
                        ) : maksimalPotongan !== undefined &&
                          maksimalPotongan <= 0 ? (
                            "Tagihan belanja sudah terpotong penuh oleh voucher"
                        ) : useLoyaltyPoints && estimasiPoinDipakai > 0 ? (
                            <span className="text-amber-900 font-semibold">
                                Hemat potongan{" "}
                                {formatRupiah(estimasiPoinDipakai)} (1 Poin = Rp
                                1)
                            </span>
                        ) : (
                            "Gunakan saldo koin untuk potongan langsung tagihan"
                        )}
                    </p>
                </div>
            </div>

            {/* Switch Toggle Berbasis WAI-ARIA */}
            <div className="shrink-0 pl-2">
                <input
                    id="loyalty-point-toggle"
                    type="checkbox"
                    checked={useLoyaltyPoints && canRedeem}
                    disabled={!canRedeem}
                    onChange={(e) => onToggle(e.target.checked)}
                    className="sr-only"
                    aria-label="Gunakan koin loyalitas CRSL"
                />
                <button
                    type="button"
                    role="switch"
                    aria-checked={useLoyaltyPoints && canRedeem}
                    aria-disabled={!canRedeem}
                    disabled={!canRedeem}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleClick();
                    }}
                    className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed",
                        !canRedeem
                            ? "bg-slate-200"
                            : useLoyaltyPoints
                              ? "bg-amber-500"
                              : "bg-slate-300",
                    )}
                >
                    <span
                        className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs",
                            useLoyaltyPoints && canRedeem
                                ? "translate-x-6"
                                : "translate-x-1",
                        )}
                    />
                </button>
            </div>
        </div>
    );
}
