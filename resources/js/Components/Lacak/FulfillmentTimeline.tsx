import { useState } from "react";
import {
    Truck,
    Package,
    Copy,
    Check,
    ExternalLink,
    Radio,
    Calendar,
    Building2,
    Clock,
    MessageCircle,
    CheckCircle2,
    AlertCircle,
    MapPin,
} from "lucide-react";
import { toast } from "sonner";

export interface TrackingHistoryItem {
    note: string;
    updated_at: string;
    status?: string;
}

export interface BiteshipTrackingData {
    sukses: boolean;
    waybill_id?: string;
    kurir?: string;
    layanan?: string;
    status?: string;
    link?: string;
    history?: TrackingHistoryItem[];
    is_mock?: boolean;
    is_pre_dispatch?: boolean;
    sumber?: string;
}

interface FulfillmentTimelineProps {
    orderStatus: string;
    kurir?: string;
    layanan?: string;
    nomorResi?: string;
    tracking?: BiteshipTrackingData | null;
    alamatPenerima?: string;
    namaPenerima?: string;
    asalGudang?: string;
    formatTanggal: (iso: string) => string;
}

/**
 * Normalisasi format nama kurir dan layanan agar ramah pengguna (bebas underscore)
 */
function formatKurirLayanan(
    kurir?: string,
    layanan?: string,
): { namaKurir: string; namaLayanan: string } {
    const k = (kurir || "jne").toLowerCase().trim();
    let namaKurir = (kurir || "JNE").toUpperCase();

    if (k === "pos") namaKurir = "POS Indonesia";
    else if (k === "jne") namaKurir = "JNE Express";
    else if (k === "jnt") namaKurir = "J&T Express";
    else if (k === "sicepat") namaKurir = "SiCepat Ekspres";
    else if (k === "tiki") namaKurir = "TIKI";

    const cleanLayanan = (layanan || "REG").replace(/_/g, " ").trim();
    const namaLayanan = cleanLayanan.toLowerCase().includes("reg")
        ? cleanLayanan.replace(/reg/i, "Reguler")
        : cleanLayanan.toUpperCase();

    return { namaKurir, namaLayanan };
}

export default function FulfillmentTimeline({
    orderStatus,
    kurir = "jne",
    layanan = "reg",
    nomorResi,
    tracking,
    alamatPenerima,
    namaPenerima,
    asalGudang = "Gudang Logistik Pusat CRSL (Johar Baru, Jakarta Pusat)",
    formatTanggal,
}: FulfillmentTimelineProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyResi = async () => {
        if (!nomorResi) return;
        try {
            await navigator.clipboard.writeText(nomorResi);
            setCopied(true);
            toast.success("Nomor resi berhasil disalin!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin nomor resi.");
        }
    };

    const { namaKurir, namaLayanan } = formatKurirLayanan(kurir, layanan);
    const trackingHistory = tracking?.history || [];
    const isRealLiveTracking = Boolean(tracking?.link && !tracking?.is_mock);

    const statusNorm = (orderStatus || "").toLowerCase().trim();
    const isPaid = ["akan_dikirim", "dikirim", "selesai"].includes(statusNorm);
    const isDelivered = statusNorm === "selesai";
    const isTerminated = ["dibatalkan", "expired"].includes(statusNorm);

    // KASUS 1: Nomor Resi Sudah Terbit
    if (nomorResi) {
        return (
            <div className="space-y-4">
                {/* Info Kartu Resi Ekspedisi */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 bg-white border border-slate-200/90 px-2.5 py-1 rounded-lg">
                                {namaKurir} ({namaLayanan})
                            </span>
                            {isDelivered ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Paket Diterima
                                </span>
                            ) : (
                                <span className="text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 text-[10px] font-bold uppercase">
                                    Resi Terverifikasi
                                </span>
                            )}
                        </div>
                        <div className="font-mono font-bold text-base sm:text-lg text-slate-900 select-all pt-0.5 tracking-tight">
                            {nomorResi}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleCopyResi}
                            aria-label="Salin nomor resi pengiriman"
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{copied ? "Tersalin" : "Salin Resi"}</span>
                        </button>

                        {isRealLiveTracking && tracking?.link && (
                            <a
                                href={tracking.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#E52027] hover:bg-[#CC1C22] px-4 py-2.5 rounded-xl transition-all shadow-2xs"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Live Tracking</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Riwayat Manifest Tracking */}
                {trackingHistory.length > 0 ? (
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                                <span>Aktivitas Pengiriman Terkini</span>
                            </div>
                            {tracking?.is_mock && (
                                <span className="text-[10px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                    Simulasi Dispatch
                                </span>
                            )}
                        </div>

                        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {trackingHistory.map((log, idx) => (
                                <div key={idx} className="relative group">
                                    <div
                                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                                            idx === 0
                                                ? "bg-[#E52027] ring-2 ring-red-100"
                                                : "bg-slate-300"
                                        }`}
                                    />
                                    <div className="space-y-0.5">
                                        <p
                                            className={`text-xs ${
                                                idx === 0
                                                    ? "font-bold text-slate-900"
                                                    : "font-medium text-slate-600"
                                            }`}
                                        >
                                            {log.note}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span>
                                                {formatTanggal(log.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>
                            Resi terdaftar. Menunggu pemindaian check-in pertama
                            di agen sortir ekspedisi.
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // KASUS 2: Resi Belum Terbit & Pesanan Kedaluwarsa/Batal
    if (isTerminated) {
        return (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3.5 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <h4 className="font-bold text-rose-900 text-sm">
                        Alokasi Pengiriman Dibatalkan
                    </h4>
                    <p className="text-rose-700 leading-relaxed text-[11px]">
                        Pengemasan dan pengiriman paket tidak diproses karena
                        status pesanan telah dibatalkan atau kedaluwarsa.
                    </p>
                </div>
            </div>
        );
    }

    // KASUS 3: Resi Belum Terbit (Jujur sesuai Status Pembayaran)
    return (
        <div className="space-y-4">
            <div
                className={`p-5 rounded-2xl border space-y-4 ${
                    isPaid
                        ? "bg-amber-50/70 border-amber-200/80"
                        : "bg-slate-50 border-slate-200/80"
                }`}
            >
                <div className="flex items-start gap-3.5">
                    <div
                        className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-2xs ${
                            isPaid ? "bg-amber-500" : "bg-slate-400"
                        }`}
                    >
                        {isPaid ? (
                            <Package className="w-5 h-5" />
                        ) : (
                            <Clock className="w-5 h-5" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">
                            {isPaid
                                ? "Paket Sedang Dikemas di Gudang Logistik"
                                : "Menunggu Konfirmasi Pembayaran"}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            {isPaid
                                ? "Pembayaran Anda telah terverifikasi. Tim gudang sedang melakukan quality control, pengemasan rapi, dan mencetak label resi pengiriman."
                                : "Pesanan Anda belum dialokasikan ke gudang pengemasan. Selesaikan pembayaran sesuai petunjuk pada faktur untuk memproses pengiriman."}
                        </p>
                    </div>
                </div>

                {/* Rincian Ekspedisi & Asal Gudang */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                            Ekspedisi Pilihan:
                        </span>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#E52027]" />
                            <span>
                                {namaKurir} ({namaLayanan})
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            {isPaid
                                ? "Resi otomatis aktif saat kurir melakukan penjemputan barang."
                                : "Tarif terkunci sesuai opsi ekspedisi saat checkout."}
                        </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                            Lokasi Asal Pengiriman:
                        </span>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span className="truncate">{asalGudang}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Pusat Distribusi & Operasional Toko
                        </p>
                    </div>
                </div>

                {/* Info Alamat Penerima (Jika Ada) */}
                {alamatPenerima && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs flex items-start gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Tujuan Pengiriman:
                            </span>
                            <p className="text-slate-800 font-medium leading-relaxed">
                                {namaPenerima ? (
                                    <strong className="text-slate-900">
                                        {namaPenerima} —{" "}
                                    </strong>
                                ) : null}
                                {alamatPenerima}
                            </p>
                        </div>
                    </div>
                )}

                {/* Bantuan CS Logistik */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-200/70">
                    <div className="text-xs text-slate-600">
                        Butuh info prioritas pengiriman atau koreksi alamat?
                    </div>
                    <a
                        href="https://wa.me/6281234567890?text=Halo%20CRSL,%20saya%20ingin%20menanyakan%20status%20pengiriman%20pesanan%20saya"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Hubungi CS Logistik</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
