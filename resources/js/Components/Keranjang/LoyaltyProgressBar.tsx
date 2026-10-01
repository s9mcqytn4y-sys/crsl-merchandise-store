import { useMemo } from "react";
import { Link } from "@inertiajs/react";
import { Gift, ChevronRight, Crown, Sparkles } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { useAuthStore } from "../../Stores/useAuthStore";

export interface TierThreshold {
    name: string;
    minSpend: number;
}

export const OFFICIAL_TIERS: TierThreshold[] = [
    { name: "New Freen", minSpend: 0 },
    { name: "Good Freen", minSpend: 500000 },
    { name: "Best Freen", minSpend: 1500000 },
    { name: "Super Freen", minSpend: 3000000 },
];

interface LoyaltyProgressBarProps {
    totalHarga: number;
    onCloseDrawer?: () => void;
}

export default function LoyaltyProgressBar({
    totalHarga = 0,
    onCloseDrawer,
}: LoyaltyProgressBarProps) {
    const authUser = useAuthStore((state) => state.user);

    // Belanja akun yang sudah terselesaikan di database
    const existingSpend = Number(authUser?.total_belanja ?? 0);
    // Proyeksi belanja akumulatif jika keranjang ini di-checkout
    const projectedSpend = existingSpend + Math.max(0, totalHarga);

    const progressData = useMemo(() => {
        // 1. Tentukan tier riil akun saat ini (berdasarkan existingSpend)
        let actualTierIndex = 0;
        for (let i = OFFICIAL_TIERS.length - 1; i >= 0; i--) {
            if (existingSpend >= OFFICIAL_TIERS[i].minSpend) {
                actualTierIndex = i;
                break;
            }
        }
        const currentTier = OFFICIAL_TIERS[actualTierIndex];

        // 2. Jika akun sudah di tier tertinggi (Super Freen)
        if (actualTierIndex === OFFICIAL_TIERS.length - 1) {
            return {
                currentTier,
                targetTier: null,
                sisaBelanja: 0,
                persentase: 100,
                isAlreadyMaxTier: true,
                willUnlockNewTier: false,
                unlockedTierName: null,
            };
        }

        // 3. Tentukan tier yang berhasil dibuka oleh keranjang aktif
        let projectedTierIndex = actualTierIndex;
        for (let i = OFFICIAL_TIERS.length - 1; i > actualTierIndex; i--) {
            if (projectedSpend >= OFFICIAL_TIERS[i].minSpend) {
                projectedTierIndex = i;
                break;
            }
        }

        // Kasus: Pesanan saat ini melampaui ambang dan membuka tier baru
        if (projectedTierIndex > actualTierIndex) {
            const unlockedTier = OFFICIAL_TIERS[projectedTierIndex];
            return {
                currentTier,
                targetTier: unlockedTier,
                sisaBelanja: 0,
                persentase: 100,
                isAlreadyMaxTier: false,
                willUnlockNewTier: true,
                unlockedTierName: unlockedTier.name,
            };
        }

        // Kasus: Pesanan saat ini belum cukup membuka tier berikutnya
        const nextTargetTier = OFFICIAL_TIERS[actualTierIndex + 1];
        const range = nextTargetTier.minSpend - currentTier.minSpend;
        const progressInRange = projectedSpend - currentTier.minSpend;
        const persentase = Math.min(
            100,
            Math.max(0, Math.round((progressInRange / range) * 100)),
        );
        const sisaBelanja = Math.max(
            0,
            nextTargetTier.minSpend - projectedSpend,
        );

        return {
            currentTier,
            targetTier: nextTargetTier,
            sisaBelanja,
            persentase,
            isAlreadyMaxTier: false,
            willUnlockNewTier: false,
            unlockedTierName: null,
        };
    }, [existingSpend, projectedSpend]);

    return (
        <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 select-none shadow-2xs">
            {/* Header Informasi Prospek Tingkatan */}
            <div className="flex items-start gap-2 text-[11px] font-medium text-slate-700 leading-snug">
                {progressData.isAlreadyMaxTier ? (
                    <Crown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : progressData.willUnlockNewTier ? (
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
                ) : (
                    <Gift className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                )}

                <div className="min-w-0 flex-1">
                    {progressData.isAlreadyMaxTier ? (
                        <span className="font-bold text-slate-900">
                            Luar biasa! Akun Anda berada di tingkat tertinggi
                            (Super Freen) 🎉
                        </span>
                    ) : progressData.willUnlockNewTier ? (
                        <span>
                            Pesanan ini akan membuka tingkatan{" "}
                            <strong className="font-bold text-primary">
                                {progressData.unlockedTierName}
                            </strong>
                            ! 🎉
                        </span>
                    ) : (
                        <span>
                            Tambah{" "}
                            <strong className="font-bold text-slate-900 font-mono">
                                {formatRupiah(progressData.sisaBelanja)}
                            </strong>{" "}
                            lagi untuk membuka tingkatan{" "}
                            <strong className="font-bold text-primary">
                                {progressData.targetTier?.name}
                            </strong>
                        </span>
                    )}
                </div>
            </div>

            {/* Bilah Progres Visual dengan ARIA Lengkap */}
            <div
                role="progressbar"
                aria-valuenow={progressData.persentase}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progres pencapaian loyalty tier ${progressData.targetTier?.name || "Maksimal"}`}
                className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden"
            >
                <div
                    className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressData.persentase}%` }}
                />
            </div>

            {/* Label Tier Aktif & Navigasi Rincian Benefit */}
            <div className="flex items-center justify-between text-[10px] pt-0.5">
                <span className="font-semibold text-slate-500">
                    Tier Saat Ini:{" "}
                    <strong className="text-slate-800 font-bold">
                        {progressData.currentTier.name}
                    </strong>
                </span>

                <Link
                    href="/akun"
                    onClick={onCloseDrawer}
                    className="inline-flex items-center gap-0.5 font-bold text-primary hover:underline transition-colors"
                >
                    <span>Rincian Keuntungan</span>
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
