import React from "react";
import { X, Gift, Crown, Sparkles, Check, ChevronRight } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";

export interface TierItem {
    id?: number | string;
    nama: string;
    syarat_belanja: number;
    multiplier?: number;
    deskripsi?: string;
}

interface ModalLoyaltyTiersProps {
    isOpen: boolean;
    onClose: () => void;
    currentTierName?: string;
    currentPoints?: number;
    totalSpend?: number;
    progressText?: string;
    tiers?: TierItem[];
}

const DEFAULT_TIERS: TierItem[] = [
    {
        nama: "Non-Member",
        syarat_belanja: 0,
        multiplier: 1.0,
        deskripsi: "Dapatkan 10 Poin per kelipatan belanja Rp 10.000.",
    },
    {
        nama: "New Freen",
        syarat_belanja: 200000,
        multiplier: 1.2,
        deskripsi: "Bonus 1.000 Poin aktivasi, multiplier 1.2x, dan voucher eksklusif.",
    },
    {
        nama: "Bestfreen",
        syarat_belanja: 500000,
        multiplier: 1.5,
        deskripsi: "Bonus 2.000 Poin aktivasi, multiplier 1.5x, kado ulang tahun & early access produk baru.",
    },
];

export default function ModalLoyaltyTiers({
    isOpen,
    onClose,
    currentTierName = "Non-Member",
    currentPoints = 0,
    totalSpend = 0,
    progressText = "Spend Rp 200,000 more to reach New Freen",
    tiers = DEFAULT_TIERS,
}: ModalLoyaltyTiersProps) {
    if (!isOpen) return null;

    const tierList = tiers.length > 0 ? tiers : DEFAULT_TIERS;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 bg-linear-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 uppercase tracking-widest">
                            <Crown className="w-4 h-4 text-amber-300" />
                            CRSL Freen Membership
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-white">
                            Loyalty Tiers & Benefits
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-header User Summary */}
                <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Tier Saat Ini
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-black text-slate-900 text-base">
                                {currentTierName}
                            </span>
                            <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                Active
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Saldo Poin
                        </span>
                        <p className="font-mono font-black text-amber-600 text-base mt-0.5">
                            {currentPoints.toLocaleString("id-ID")} Pts
                        </p>
                    </div>
                </div>

                {/* Body: Tiers Cards */}
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="leading-snug">{progressText}</span>
                    </div>

                    <div className="space-y-3 pt-2">
                        {tierList.map((tier, idx) => {
                            const isCurrent =
                                tier.nama.toLowerCase() ===
                                currentTierName.toLowerCase();
                            const isReached = totalSpend >= tier.syarat_belanja;

                            return (
                                <div
                                    key={tier.nama || idx}
                                    className={`p-4 rounded-2xl border transition-all ${
                                        isCurrent
                                            ? "border-red-500 bg-red-50/40 shadow-xs ring-1 ring-red-500"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                    isCurrent
                                                        ? "bg-red-600 text-white"
                                                        : isReached
                                                          ? "bg-slate-900 text-white"
                                                          : "bg-slate-100 text-slate-400"
                                                }`}
                                            >
                                                {isReached ? (
                                                    <Check className="w-4 h-4 stroke-3" />
                                                ) : (
                                                    <Gift className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                                    {tier.nama}
                                                    {isCurrent && (
                                                        <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.2 rounded-full uppercase">
                                                            Tier Anda
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    Syarat Belanja:{" "}
                                                    {tier.syarat_belanja === 0
                                                        ? "Rp 0 (Otomatis)"
                                                        : formatRupiah(
                                                              tier.syarat_belanja,
                                                          )}
                                                </p>
                                            </div>
                                        </div>

                                        {tier.multiplier && tier.multiplier > 1 && (
                                            <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg shrink-0">
                                                {tier.multiplier}x Pts
                                            </span>
                                        )}
                                    </div>

                                    {tier.deskripsi && (
                                        <p className="text-xs text-slate-600 mt-2.5 pl-12 leading-relaxed">
                                            {tier.deskripsi}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
