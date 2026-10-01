import { useEffect, useMemo } from "react";
import { X, Crown, Sparkles, Check, Lock } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { useAuthStore } from "../../Stores/useAuthStore";

export interface TierItem {
    id?: number | string;
    nama: string;
    syarat_belanja: number;
    multiplier?: number;
    deskripsi?: string;
    benefit_poin?: string;
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

// Skema Tier Resmi CRSL Storefront (Sinkron dengan KartuLoyalitas.tsx)
export const OFFICIAL_CRSL_TIERS: TierItem[] = [
    {
        nama: "New Freen",
        syarat_belanja: 0,
        multiplier: 1.0,
        benefit_poin: "1x Poin Belanja",
        deskripsi:
            "Tier awal otomatis untuk seluruh member. Dapatkan 10 Poin per kelipatan belanja Rp 10.000.",
    },
    {
        nama: "Good Freen",
        syarat_belanja: 500000,
        multiplier: 1.2,
        benefit_poin: "1.2x Poin Belanja",
        deskripsi:
            "Multiplier poin belanja 1.2x, voucher eksklusif bulanan, dan prioritas layanan pelanggan.",
    },
    {
        nama: "Best Freen",
        syarat_belanja: 1500000,
        multiplier: 1.5,
        benefit_poin: "1.5x Poin Belanja",
        deskripsi:
            "Multiplier 1.5x, kado ulang tahun khusus member, serta akses awal (early access) ke rilisan produk baru.",
    },
    {
        nama: "Super Freen",
        syarat_belanja: 3000000,
        multiplier: 2.0,
        benefit_poin: "2.0x Poin Belanja",
        deskripsi:
            "Tingkatan tertinggi! Multiplier poin 2.0x, undangan eksklusif event CRSL, dan merchandise edisi terbatas tahunan.",
    },
];

export default function ModalLoyaltyTiers({
    isOpen,
    onClose,
    currentTierName: propTierName,
    currentPoints: propPoints,
    totalSpend: propTotalSpend,
    progressText: propProgressText,
    tiers = OFFICIAL_CRSL_TIERS,
}: ModalLoyaltyTiersProps) {
    const authUser = useAuthStore((state) => state.user);

    // Prioritaskan nilai dari props, fallback ke data user riil di useAuthStore
    const activePoints =
        propPoints !== undefined ? propPoints : Number(authUser?.poin ?? 0);
    const activeSpend =
        propTotalSpend !== undefined
            ? propTotalSpend
            : Number(authUser?.total_belanja ?? 0);

    const tierList = tiers.length > 0 ? tiers : OFFICIAL_CRSL_TIERS;

    // Kalkulasi Tier Aktif Pelanggan secara dinamis
    const determinedTier = useMemo(() => {
        let current = tierList[0];
        let next: TierItem | null = tierList[1] || null;

        for (let i = tierList.length - 1; i >= 0; i--) {
            if (activeSpend >= tierList[i].syarat_belanja) {
                current = tierList[i];
                next = tierList[i + 1] || null;
                break;
            }
        }

        return {
            activeName: propTierName || current.nama,
            currentTier: current,
            nextTier: next,
            remainingSpend: next
                ? Math.max(0, next.syarat_belanja - activeSpend)
                : 0,
        };
    }, [activeSpend, propTierName, tierList]);

    // Keyboard Accessibility (Escape key)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loyalty-modal-title"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Banner */}
                <div className="p-6 bg-linear-to-r from-primary to-rose-600 text-white flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 uppercase tracking-widest">
                            <Crown className="w-4 h-4 text-amber-300" />
                            <span>CRSL Freen Membership</span>
                        </div>
                        <h3
                            id="loyalty-modal-title"
                            className="text-xl font-black tracking-tight text-white"
                        >
                            Tingkatan & Keuntungan Member
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        aria-label="Tutup"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-header User Summary */}
                <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Tingkatan Anda
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-black text-slate-900 text-base">
                                {determinedTier.activeName}
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Aktif
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Saldo Koin
                        </span>
                        <p className="font-mono font-black text-amber-600 text-base mt-0.5 tabular-nums">
                            {activePoints.toLocaleString("id-ID")} Pts
                        </p>
                    </div>
                </div>

                {/* Body: Tiers Cards */}
                <div className="p-6 overflow-y-auto space-y-4">
                    {/* Banner Progress Sisa Belanja */}
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="leading-snug">
                            {propProgressText ||
                                (determinedTier.nextTier
                                    ? `Belanja ${formatRupiah(determinedTier.remainingSpend)} lagi untuk naik ke tingkat ${determinedTier.nextTier.nama}!`
                                    : "Selamat! Anda telah mencapai tingkatan membership tertinggi di CRSL Store.")}
                        </span>
                    </div>

                    <div className="space-y-3 pt-1">
                        {tierList.map((tier, idx) => {
                            const isCurrent =
                                tier.nama.toLowerCase() ===
                                determinedTier.activeName.toLowerCase();
                            const isReached =
                                activeSpend >= tier.syarat_belanja;

                            return (
                                <div
                                    key={tier.nama || idx}
                                    className={`p-4 rounded-2xl border transition-all ${
                                        isCurrent
                                            ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                                            : isReached
                                              ? "border-slate-200 bg-white"
                                              : "border-slate-200/60 bg-slate-50/40 opacity-75"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                    isCurrent
                                                        ? "bg-primary text-white shadow-xs"
                                                        : isReached
                                                          ? "bg-slate-900 text-white"
                                                          : "bg-slate-200 text-slate-500"
                                                }`}
                                            >
                                                {isCurrent ? (
                                                    <Crown className="w-4 h-4 text-amber-300 stroke-[2.5]" />
                                                ) : isReached ? (
                                                    <Check className="w-4 h-4 stroke-[2.5]" />
                                                ) : (
                                                    <Lock className="w-4 h-4" />
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                                    <span>{tier.nama}</span>
                                                    {isCurrent && (
                                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                                                            Tier Anda
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    Syarat Belanja:{" "}
                                                    <strong className="text-slate-700">
                                                        {tier.syarat_belanja ===
                                                        0
                                                            ? "Rp 0 (Otomatis)"
                                                            : formatRupiah(
                                                                  tier.syarat_belanja,
                                                              )}
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>

                                        {tier.multiplier &&
                                            tier.multiplier > 1 && (
                                                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg shrink-0 font-mono">
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
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] text-slate-500 pl-2">
                        1 Koin Loyalty bernilai potongan Rp 1 saat checkout.
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
