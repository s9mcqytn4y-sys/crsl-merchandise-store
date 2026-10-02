import { Link } from "@inertiajs/react";
import {
    AlertCircle,
    CheckCircle2,
    MessageCircle,
    PackageCheck,
    RefreshCw,
    ShoppingBag,
    Truck,
    XCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface FakturStatusBannerProps {
    statusNormalized: string;
    isHoldManual: boolean;
    isSuccessSettled: boolean;
    isTerminated: boolean;
    hasWaybill: boolean;
    courierName?: string;
    nomorPesanan: string;
    cleanCsPhone: string;
    isChecking: boolean;
    onManualCheckStatus: () => void;
}

export default function FakturStatusBanner({
    statusNormalized,
    isHoldManual,
    isSuccessSettled,
    isTerminated,
    hasWaybill,
    courierName,
    nomorPesanan,
    cleanCsPhone,
    isChecking,
    onManualCheckStatus,
}: FakturStatusBannerProps) {
    if (isHoldManual) {
        return (
            <section className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <AlertCircle className="w-5 h-5 stroke-2" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
                            Pembayaran Dalam Tinjauan Tim CS
                        </h2>
                        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                            Sistem mendeteksi transaksi memerlukan peninjauan manual
                            (seperti selisih nominal unik transfer). Dana Anda aman dan
                            pesanan sedang diperiksa langsung oleh tim CS resmi kami.
                        </p>
                    </div>
                </div>

                <div className="pt-1 flex flex-wrap gap-2.5">
                    <a
                        href={`https://wa.me/${cleanCsPhone}?text=${encodeURIComponent(
                            `Halo Tim CS CRSL, saya ingin konfirmasi pembayaran pesanan: #${nomorPesanan}`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                        <MessageCircle className="w-4 h-4 stroke-2" />
                        <span>Kirim Bukti Transfer via WhatsApp</span>
                    </a>

                    <button
                        type="button"
                        onClick={onManualCheckStatus}
                        disabled={isChecking}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-950 text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                        <RefreshCw
                            className={cn(
                                "w-3.5 h-3.5 stroke-2",
                                isChecking && "animate-spin",
                            )}
                        />
                        <span>
                            {isChecking ? "Memeriksa..." : "Periksa Ulang Status"}
                        </span>
                    </button>
                </div>
            </section>
        );
    }

    if (isSuccessSettled) {
        return (
            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        {hasWaybill ? (
                            <PackageCheck className="w-5 h-5 stroke-2" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 stroke-2" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-base sm:text-lg font-black text-emerald-950 tracking-tight">
                            {hasWaybill
                                ? "Pembayaran Diterima & Resi Diterbitkan"
                                : "Pembayaran Berhasil Diverifikasi"}
                        </h2>
                        <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">
                            {hasWaybill ? (
                                <>
                                    Pesanan Anda telah disiapkan oleh tim logistik dan nomor resi ekspedisi{" "}
                                    <strong className="font-black text-emerald-950 uppercase font-mono">
                                        {courierName || "Kurir Ekspedisi"}
                                    </strong>{" "}
                                    telah aktif. Pantau pergerakan pengiriman paket Anda secara real-time.
                                </>
                            ) : (
                                "Pesanan Anda sedang dipersiapkan oleh tim gudang CRSL Official. Nomor resi pengiriman akan terbit otomatis saat paket diserahkan ke kurir."
                            )}
                        </p>
                    </div>
                </div>

                <div className="pt-1 flex flex-wrap gap-2.5">
                    <Link
                        href={`/lacak?nomor=${encodeURIComponent(nomorPesanan || "")}`}
                        className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-xs active:scale-95"
                    >
                        <Truck className="w-4 h-4 stroke-2" />
                        <span>Lacak Pengiriman</span>
                    </Link>
                    <Link
                        href="/katalog"
                        className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-2xs active:scale-95"
                    >
                        <ShoppingBag className="w-4 h-4 text-emerald-700 stroke-2" />
                        <span>Belanja Lagi</span>
                    </Link>
                </div>
            </div>
        );
    }

    if (isTerminated) {
        return (
            <section className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 shadow-2xs">
                        <XCircle className="w-5 h-5 stroke-2" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            Pesanan Ini Telah Berakhir
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                            Faktur ini berstatus{" "}
                            <strong className="text-slate-900 font-bold">
                                {statusNormalized === "dibatalkan"
                                    ? "Dibatalkan"
                                    : "Kedaluwarsa"}
                            </strong>
                            . Tagihan pembayaran tidak lagi aktif dan pesanan tidak diproses lebih lanjut.
                        </p>
                    </div>
                </div>

                <div className="pt-1">
                    <Link
                        href="/katalog"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition-all shadow-xs active:scale-95"
                    >
                        <ShoppingBag className="w-4 h-4 stroke-2" />
                        <span>Buat Pesanan Baru</span>
                    </Link>
                </div>
            </section>
        );
    }

    return null;
}
