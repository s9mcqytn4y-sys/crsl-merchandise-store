import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Clock, ArrowRight, X, AlertTriangle } from "lucide-react";
import { formatRupiah } from "../Utils/formatters";
import { cn } from "../lib/utils";

export interface PesananBelumBayarItem {
    id: number | string;
    nomor_pesanan: string;
    total: number | string;
    batas_waktu: string;
}

interface SharedProps {
    pesanan_belum_bayar?: PesananBelumBayarItem | null;
    [key: string]: unknown;
}

/**
 * Normalisasi format tanggal SQL ke ISO 8601 agar kebal bug WebKit/Safari
 */
function parseSafeDate(dateStr: string): number {
    if (!dateStr) return 0;
    // Ubah "YYYY-MM-DD HH:mm:ss" menjadi format aman "YYYY-MM-DDTHH:mm:ss"
    const safeStr = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
    const parsed = new Date(safeStr).getTime();
    return isNaN(parsed) ? new Date(dateStr).getTime() || 0 : parsed;
}

export default function PengingatPesananBelumBayar() {
    const page = usePage<SharedProps>();
    const unpaid = page.props.pesanan_belum_bayar;
    const currentUrl = page.url || "";

    const [isDismissed, setIsDismissed] = useState(false);
    const [sisaWaktu, setSisaWaktu] = useState<{
        jam: number;
        menit: number;
        detik: number;
        isExpired: boolean;
    }>({ jam: 0, menit: 0, detik: 0, isExpired: false });

    // Cek apakah banner ditutup oleh user pada sesi browser saat ini
    const storageKey = useMemo(() => {
        return unpaid?.id ? `crsl_dismissed_order_${unpaid.id}` : null;
    }, [unpaid?.id]);

    useEffect(() => {
        if (!storageKey) return;
        try {
            const dismissed = sessionStorage.getItem(storageKey);
            if (dismissed === "true") {
                setIsDismissed(true);
            }
        } catch {
            // Fallback mode private
        }
    }, [storageKey]);

    // Sembunyikan banner di halaman checkout atau pembayaran agar tidak mengganggu transaksi
    const isHiddenPage = useMemo(() => {
        const clean = currentUrl.toLowerCase();
        return (
            clean.includes("/faktur") ||
            clean.includes("/pembayaran") ||
            clean.includes("/checkout")
        );
    }, [currentUrl]);

    // Timer hitung mundur dengan sinkronisasi kadaluwarsa server
    useEffect(() => {
        if (!unpaid?.batas_waktu) return;

        const targetTime = parseSafeDate(unpaid.batas_waktu);
        if (!targetTime) return;

        const hitung = () => {
            const now = Date.now();
            const diff = Math.floor((targetTime - now) / 1000);

            if (diff <= 0) {
                setSisaWaktu({ jam: 0, menit: 0, detik: 0, isExpired: true });
                return;
            }

            const jam = Math.floor(diff / 3600);
            const menit = Math.floor((diff % 3600) / 60);
            const detik = diff % 60;
            setSisaWaktu({ jam, menit, detik, isExpired: false });
        };

        hitung();
        const interval = setInterval(hitung, 1000);
        return () => clearInterval(interval);
    }, [unpaid?.batas_waktu]);

    // Handle aksi tutup sementara pada session
    const handleDismiss = useCallback(() => {
        setIsDismissed(true);
        if (storageKey) {
            try {
                sessionStorage.setItem(storageKey, "true");
            } catch {
                // Abaikan
            }
        }
    }, [storageKey]);

    if (!unpaid || isDismissed || isHiddenPage) {
        return null;
    }

    const formatCountdown = () => {
        if (sisaWaktu.isExpired) {
            return "Waktu Habis";
        }
        const hh = String(sisaWaktu.jam).padStart(2, "0");
        const mm = String(sisaWaktu.menit).padStart(2, "0");
        const ss = String(sisaWaktu.detik).padStart(2, "0");
        return sisaWaktu.jam > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
    };

    // Bersihkan karakter pemisah nomor invoice untuk slug URL
    const fakturSlug = encodeURIComponent(
        (unpaid.nomor_pesanan || "").replace(/[^a-zA-Z0-9-_]/g, "-"),
    );

    const numericTotal = Number(unpaid.total) || 0;

    return (
        <aside
            role="alert"
            aria-label="Pengingat pesanan menunggu pembayaran"
            className="bg-[#E52027] text-white border-b border-[#CC1C22] relative z-40 transition-all duration-300 shadow-xs select-none"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
                {/* Informasi Pesanan */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    </span>
                    <div className="truncate flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-extrabold text-white tracking-tight">
                            Menunggu Pembayaran:
                        </span>
                        <span className="font-mono bg-black/25 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            #{unpaid.nomor_pesanan}
                        </span>
                        <span className="text-white/95 font-bold font-mono">
                            ({formatRupiah(numericTotal)})
                        </span>
                        <span className="text-white/50 hidden sm:inline">
                            •
                        </span>
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 font-mono font-bold text-amber-200",
                                sisaWaktu.isExpired && "text-rose-200",
                            )}
                        >
                            <Clock className="w-3 h-3 text-amber-300 shrink-0" />
                            <span>{formatCountdown()}</span>
                        </span>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href={`/faktur/${fakturSlug}`}
                        className="bg-white hover:bg-slate-100 text-[#E52027] font-black px-3.5 py-1 rounded-full text-xs transition-transform active:scale-95 shadow-sm inline-flex items-center gap-1 cursor-pointer"
                    >
                        <span>Bayar</span>
                        <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </Link>

                    <button
                        type="button"
                        onClick={handleDismiss}
                        aria-label="Tutup notifikasi pembayaran"
                        className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
