import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Clock, ArrowRight, X, AlertTriangle } from "lucide-react";
import type { SharedPageProps } from "../types";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

export default function PengingatPesananBelumBayar() {
    const page = usePage<SharedPageProps>();
    const unpaid = page.props.pesanan_belum_bayar;
    const currentUrl = page.url || "";

    const [isDismissed, setIsDismissed] = useState(false);
    const [sisaWaktu, setSisaWaktu] = useState<{
        jam: number;
        menit: number;
        detik: number;
        expired: boolean;
    }>({ jam: 0, menit: 0, detik: 0, expired: false });

    // Jangan tampilkan jika di halaman faktur atau checkout/pembayaran
    const isHiddenPage =
        currentUrl.includes("/faktur") ||
        currentUrl.includes("/pembayaran") ||
        currentUrl.includes("/checkout");

    useEffect(() => {
        if (!unpaid?.batas_waktu) return;

        const hitung = () => {
            const target = new Date(unpaid.batas_waktu).getTime();
            const now = Date.now();
            const diff = Math.floor((target - now) / 1000);

            if (diff <= 0) {
                setSisaWaktu({ jam: 0, menit: 0, detik: 0, expired: true });
                return;
            }

            const jam = Math.floor(diff / 3600);
            const menit = Math.floor((diff % 3600) / 60);
            const detik = diff % 60;
            setSisaWaktu({ jam, menit, detik, expired: false });
        };

        hitung();
        const interval = setInterval(hitung, 1000);
        return () => clearInterval(interval);
    }, [unpaid?.batas_waktu]);

    if (!unpaid || isDismissed || isHiddenPage) {
        return null;
    }

    const formatCountdown = () => {
        if (sisaWaktu.expired) {
            return "Segera Selesaikan";
        }
        const hh = String(sisaWaktu.jam).padStart(2, "0");
        const mm = String(sisaWaktu.menit).padStart(2, "0");
        const ss = String(sisaWaktu.detik).padStart(2, "0");
        return sisaWaktu.jam > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
    };

    const fakturSlug = (unpaid.nomor_pesanan || "").replace(/\//g, "-");

    return (
        <aside
            aria-label="Pengingat pesanan belum bayar"
            className="bg-linear-to-r from-red-600 via-rose-600 to-red-700 text-white border-b border-red-800/40 relative z-40 transition-all duration-300 shadow-xs"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    </span>
                    <div className="truncate flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-extrabold text-white tracking-tight">
                            Pesanan Menunggu Pembayaran:
                        </span>
                        <span className="font-mono bg-black/25 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            #{unpaid.nomor_pesanan}
                        </span>
                        <span className="text-white/90">
                            ({rupiahFormatter.format(unpaid.total)})
                        </span>
                        <span className="text-white/60 hidden sm:inline">•</span>
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-200">
                            <Clock className="w-3 h-3 text-amber-300" />
                            {formatCountdown()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href={`/faktur/${fakturSlug}`}
                        className="bg-white hover:bg-slate-100 text-red-600 font-extrabold px-3.5 py-1 rounded-full text-xs transition-transform active:scale-95 shadow-sm inline-flex items-center gap-1 cursor-pointer"
                    >
                        <span>Bayar</span>
                        <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsDismissed(true)}
                        aria-label="Tutup pengingat"
                        className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
