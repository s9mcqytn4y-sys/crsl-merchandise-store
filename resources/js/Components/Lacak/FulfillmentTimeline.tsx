import React, { useState } from "react";
import {
    Truck,
    Package,
    CheckCircle2,
    Copy,
    Check,
    ExternalLink,
    Radio,
    Calendar,
    MapPin,
    MessageCircle,
    Building2,
    Clock,
    AlertCircle,
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
}

interface FulfillmentTimelineProps {
    orderStatus: string;
    kurir?: string;
    layanan?: string;
    nomorResi?: string;
    tracking?: BiteshipTrackingData | null;
    alamatPenerima?: string;
    namaPenerima?: string;
    formatTanggal: (iso: string) => string;
}

export default function FulfillmentTimeline({
    orderStatus,
    kurir = "JNE",
    layanan = "REG",
    nomorResi,
    tracking,
    alamatPenerima,
    namaPenerima,
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

    const courierName = (kurir || "JNE").toUpperCase();
    const serviceName = (layanan || "REG").toUpperCase();
    const trackingHistory = tracking?.history || [];

    // Kasus 1: Nomor resi sudah terbit dan siap dilacak
    if (nomorResi) {
        return (
            <div className="space-y-4">
                {/* Info Resi Ekspedisi & Aksi */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 bg-white border border-slate-200/90 px-2.5 py-1 rounded-lg">
                                {courierName} ({serviceName})
                            </span>
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-black uppercase">
                                Resi Terverifikasi
                            </span>
                        </div>
                        <div className="font-mono font-black text-base sm:text-lg text-slate-900 select-all pt-0.5">
                            {nomorResi}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleCopyResi}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{copied ? "Tersalin" : "Salin Resi"}</span>
                        </button>

                        {tracking?.link && (
                            <a
                                href={tracking.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 text-xs font-bold text-primary bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Biteship Live</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Riwayat Tracking Perjalanan */}
                {trackingHistory.length > 0 ? (
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                                <span>Aktivitas Pengiriman Terakhir (Biteship API)</span>
                            </div>
                            {tracking?.is_mock && (
                                <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                    Mode Dev Simulasi
                                </span>
                            )}
                        </div>

                        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                            {trackingHistory.map((log, idx) => (
                                <div key={idx} className="relative group">
                                    <div
                                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                                            idx === 0
                                                ? "bg-primary ring-2 ring-red-100"
                                                : "bg-slate-300"
                                        }`}
                                    />
                                    <div>
                                        <p
                                            className={`text-xs ${
                                                idx === 0
                                                    ? "font-bold text-slate-900"
                                                    : "font-medium text-slate-600"
                                            }`}
                                        >
                                            {log.note}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            <span>{formatTanggal(log.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Resi terdaftar. Menunggu pembaruan check-in pertama di gateway sortir kurir.</span>
                    </div>
                )}
            </div>
        );
    }

    // Kasus 2: Smart Fulfillment Timeline saat resi belum terbit (Sedang Dipersiapkan di Gudang)
    return (
        <div className="space-y-4">
            <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-4">
                <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Package className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">
                            Paket Sedang Dikemas di Gudang Sleman
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Pesanan Anda telah masuk antrean fulfillment CRSL. Tim logistik sedang melakukan quality control, packing rapi, dan menempelkan label pengiriman.
                        </p>
                    </div>
                </div>

                {/* Rincian Ekspedisi & Gudang Asal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                            Ekspedisi Pilihan:
                        </span>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-primary" />
                            <span>{courierName} ({serviceName})</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Resi otomatis aktif saat kurir melakukan penjemputan (pick-up).
                        </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                            Gudang Asal Pengiriman:
                        </span>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-600" />
                            <span>CRSL Warehouse Sleman</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Depok, Sleman, D.I. Yogyakarta 55281
                        </p>
                    </div>
                </div>

                {/* Bantuan CS WhatsApp */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-amber-200/60">
                    <div className="text-xs text-slate-600">
                        Butuh info prioritas pengiriman atau perubahan alamat?
                    </div>
                    <a
                        href="https://wa.me/628567060477?text=Halo%20CRSL,%20saya%20ingin%20menanyakan%20status%20pesanan%20saya"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs shrink-0"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Hubungi CS Logistik</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
