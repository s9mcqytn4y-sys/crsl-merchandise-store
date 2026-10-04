import { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { Coins, ChevronRight, TrendingUp } from "lucide-react";
import { useAuthStore } from "../../Stores/useAuthStore";

export interface TierConfig {
    name: string;
    nama?: string;
    minSpend: number;
    syarat_belanja?: number;
    badgeColor?: string;
    textColor?: string;
}

export const LOYALTY_TIERS: TierConfig[] = [
    {
        name: "New Freen",
        minSpend: 0,
        badgeColor: "bg-slate-100 border-slate-200",
        textColor: "text-slate-700",
    },
    {
        name: "Good Freen",
        minSpend: 500000,
        badgeColor: "bg-emerald-50 border-emerald-200",
        textColor: "text-emerald-700",
    },
    {
        name: "Best Freen",
        minSpend: 1500000,
        badgeColor: "bg-amber-50 border-amber-200",
        textColor: "text-amber-700",
    },
    {
        name: "Super Freen",
        minSpend: 3000000,
        badgeColor: "bg-rose-50 border-rose-200",
        textColor: "text-rose-700",
    },
];

interface KartuLoyalitasProps {
    poin?: number;
    totalBelanja?: number;
    tier?: string;
    progressText?: string;
    tiers?: Array<{
        name?: string;
        nama?: string;
        minSpend?: number;
        syarat_belanja?: number;
    }>;
    onLihatDetail?: () => void;
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

export default function KartuLoyalitas({
    poin: propPoin,
    totalBelanja: propTotalBelanja,
    tier: propTier,
    progressText: propProgressText,
    tiers: propTiers,
    onLihatDetail,
}: KartuLoyalitasProps) {
    const authUser = useAuthStore((state) => state.user);
    const pageProps = usePage().props as {
        loyalitas?: {
            tiers?: Array<{
                name?: string;
                nama?: string;
                minSpend?: number;
                syarat_belanja?: number;
            }>;
        };
    };

    const resolvedTiers: TierConfig[] = useMemo(() => {
        const raw = (propTiers && propTiers.length > 0)
            ? propTiers
            : (pageProps.loyalitas?.tiers && pageProps.loyalitas.tiers.length > 0)
                ? pageProps.loyalitas.tiers
                : LOYALTY_TIERS;

        return raw.map((t, idx) => {
            const fallbackConfig = LOYALTY_TIERS[idx] || LOYALTY_TIERS[0];
            return {
                name: t.name || t.nama || fallbackConfig.name,
                minSpend: Number(t.minSpend ?? t.syarat_belanja ?? fallbackConfig.minSpend),
                badgeColor: fallbackConfig.badgeColor,
                textColor: fallbackConfig.textColor,
            };
        });
    }, [propTiers, pageProps.loyalitas?.tiers]);

    // Prioritaskan nilai dari props, fallback ke data user di useAuthStore
    const activePoin =
        propPoin !== undefined ? propPoin : Number(authUser?.poin ?? 0);
    const activeSpend =
        propTotalBelanja !== undefined
            ? propTotalBelanja
            : Number(authUser?.total_belanja ?? 0);

    // Kalkulasi Tier & Progress Belanja secara dinamis
    const tierData = useMemo(() => {
        let currentTier = resolvedTiers[0] || LOYALTY_TIERS[0];
        let nextTier: TierConfig | null = resolvedTiers[1] || null;

        for (let i = resolvedTiers.length - 1; i >= 0; i--) {
            if (activeSpend >= resolvedTiers[i].minSpend) {
                currentTier = resolvedTiers[i];
                nextTier = resolvedTiers[i + 1] || null;
                break;
            }
        }

        // Hitung persentase progress menuju tier berikutnya
        let percentage = 100;
        let remainingSpend = 0;

        if (nextTier) {
            const range = nextTier.minSpend - currentTier.minSpend;
            const currentProgress = activeSpend - currentTier.minSpend;
            percentage = Math.min(
                100,
                Math.max(0, Math.round((currentProgress / range) * 100)),
            );
            remainingSpend = Math.max(0, nextTier.minSpend - activeSpend);
        }

        return {
            currentTier: propTier || currentTier.name,
            currentConfig: currentTier,
            nextTier,
            percentage,
            remainingSpend,
        };
    }, [activeSpend, propTier, resolvedTiers]);

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            {/* Header: Label & Tombol Detail */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status Loyalitas
                    </span>
                    <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${tierData.currentConfig.badgeColor} ${tierData.currentConfig.textColor}`}
                    >
                        {tierData.currentTier}
                    </span>
                </div>

                {onLihatDetail && (
                    <button
                        type="button"
                        onClick={onLihatDetail}
                        className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                        <span>Rincian Benefit</span>
                        <ChevronRight className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Saldo Poin & Akumulasi Belanja */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span>Koin CRSL</span>
                    </div>
                    <p className="text-base sm:text-lg font-black font-mono text-amber-950 tabular-nums">
                        {activePoin.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[10px] text-amber-700 font-medium">
                        1 Koin = Rp 1 Potongan
                    </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                        <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                        <span>Total Belanja</span>
                    </div>
                    <p className="text-xs sm:text-sm font-black font-mono text-slate-900 tabular-nums truncate">
                        {rupiahFormatter.format(activeSpend)}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                        Akumulasi Selesai
                    </p>
                </div>
            </div>

            {/* Progress Bar Tier Membership */}
            <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-600">
                        {tierData.nextTier
                            ? propProgressText ||
                              `Belanja ${rupiahFormatter.format(tierData.remainingSpend)} lagi untuk ${tierData.nextTier.name}`
                            : "Tingkat Membership Tertinggi (Super Freen)"}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                        {tierData.percentage}%
                    </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${tierData.percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
