import React, { useState, useEffect, useCallback } from "react";
import { Head, Link } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import {
    Copy,
    Check,
    Clock,
    RefreshCw,
    QrCode,
    CreditCard,
    Printer,
    ArrowLeft,
    CheckCircle2,
    Truck,
    XCircle,
    ShoppingBag,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    gambar?: string;
}

interface PaymentDetail {
    metode_bayar?: string;
    nomor_va?: string;
    qr_code_url?: string;
    kode_biller?: string;
    bill_key?: string;
    instruksi_bayar?: string[];
    batas_waktu?: string;
}

interface ShippingDetail {
    kurir?: string;
    layanan?: string;
    nomor_resi?: string;
}

interface OrderData {
    id?: string | number;
    nomor_pesanan: string;
    status:
        | "belum_bayar"
        | "akan_dikirim"
        | "dikirim"
        | "selesai"
        | "dibatalkan"
        | string;
    subtotal: number;
    ongkir: number;
    diskon?: number;
    total: number;
    created_at?: string;
    pembayaran?: PaymentDetail;
    pengiriman?: ShippingDetail;
    items?: OrderItem[];
    item?: OrderItem[];
}

interface InvoiceProps {
    pesanan: OrderData;
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatRupiah(num: number): string {
    return rupiahFormatter.format(num || 0);
}

function StatusBadge({ status }: { status: string }) {
    switch (status.toLowerCase()) {
        case "belum_bayar":
            return (
                <span className="bg-amber-50 text-amber-800 border border-amber-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Menunggu Pembayaran
                </span>
            );
        case "akan_dikirim":
            return (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Sudah Bayar / Diproses
                </span>
            );
        case "dikirim":
            return (
                <span className="bg-indigo-50 text-indigo-800 border border-indigo-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    Dalam Pengiriman
                </span>
            );
        case "selesai":
            return (
                <span className="bg-blue-50 text-blue-800 border border-blue-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Selesai
                </span>
            );
        case "dibatalkan":
            return (
                <span className="bg-rose-50 text-rose-800 border border-rose-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Dibatalkan
                </span>
            );
        default:
            return (
                <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {status}
                </span>
            );
    }
}

export default function Invoice({ pesanan }: InvoiceProps) {
    const activeOrder = pesanan || ({} as OrderData);
    const pembayaran = activeOrder.pembayaran || {};
    const pengiriman = activeOrder.pengiriman || {};
    const orderItems = activeOrder.items || activeOrder.item || [];

    const [statusPesanan, setStatusPesanan] = useState<string>(
        activeOrder.status || "belum_bayar",
    );
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Polling status pembayaran otomatis jika belum dibayar
    useEffect(() => {
        if (statusPesanan !== "belum_bayar") return;

        const nomor = activeOrder.nomor_pesanan;
        if (!nomor) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch(
                    `/api/pesanan/${encodeURIComponent(nomor)}/status`,
                );
                const res = await response.json();
                if (res.sukses && res.status && res.status !== statusPesanan) {
                    setStatusPesanan(res.status);
                    if (res.status === "akan_dikirim") {
                        toast.success(
                            "🎉 Pembayaran berhasil dikonfirmasi! Pesanan sedang disiapkan.",
                        );
                    }
                }
            } catch (err) {
                console.error("Gagal mengecek status pesanan:", err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [statusPesanan, activeOrder.nomor_pesanan]);

    const handleCopy = async (text: string, keyName: string) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(keyName);
            toast.success("Tersalin ke clipboard!");
            setTimeout(() => setCopiedKey(null), 2000);
        } catch {
            toast.error("Gagal menyalin teks.");
        }
    };

    const handleManualCheckStatus = useCallback(async () => {
        if (isChecking) return;
        setIsChecking(true);
        try {
            const nomor = activeOrder.nomor_pesanan;
            const response = await fetch(
                `/api/pesanan/${encodeURIComponent(nomor)}/status`,
            );
            const res = await response.json();
            if (res.sukses && res.status) {
                setStatusPesanan(res.status);
                if (res.status === "akan_dikirim") {
                    toast.success(
                        "🎉 Pembayaran Lunas! Status pesanan otomatis diperbarui.",
                    );
                } else {
                    toast.info(`Status pesanan saat ini: ${res.status}`);
                }
            }
        } catch {
            toast.error("Gagal mengecek status pembayaran.");
        } finally {
            setIsChecking(false);
        }
    }, [activeOrder.nomor_pesanan, isChecking]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <StorefrontLayout>
            <Head title={`Faktur #${activeOrder.nomor_pesanan} — CRSL Store`} />

            {/* Header Area */}
            <div className="bg-slate-50 border-b border-slate-200/80 py-8 print:hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> FAKTUR RESMI
                            PESANAN
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                            Invoice #{activeOrder.nomor_pesanan}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={statusPesanan} />
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Cetak
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Instruksi Pembayaran Midtrans Direct Charge (Jika belum bayar) */}
                {statusPesanan === "belum_bayar" && (
                    <div className="bg-gradient-to-r from-slate-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-5 border border-slate-800 print:hidden">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                            <div>
                                <h3 className="font-bold text-base flex items-center gap-2 text-white">
                                    <CreditCard className="w-5 h-5 text-amber-400" />
                                    Instruksi Pembayaran (
                                    {pembayaran.metode_bayar || "Direct Charge"}
                                    )
                                </h3>
                                <p className="text-xs text-slate-300 mt-1">
                                    Selesaikan pembayaran tepat sebesar{" "}
                                    <strong className="text-amber-300 text-base font-black">
                                        {formatRupiah(activeOrder.total)}
                                    </strong>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleManualCheckStatus}
                                disabled={isChecking}
                                className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-900 text-xs font-black px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`}
                                />
                                {isChecking
                                    ? "Mengecek..."
                                    : "Cek Status Pembayaran"}
                            </button>
                        </div>

                        {/* Tampilan QRIS */}
                        {pembayaran.qr_code_url && (
                            <div className="bg-white p-5 rounded-2xl text-slate-900 text-center space-y-3 max-w-xs mx-auto shadow-md">
                                <div className="font-bold text-xs text-slate-800 flex items-center justify-center gap-1.5">
                                    <QrCode className="w-4 h-4 text-[#E52027]" />
                                    Scan QRIS via E-Wallet / Mobile Banking
                                </div>
                                <img
                                    src={pembayaran.qr_code_url}
                                    alt="Kode QRIS Pembayaran"
                                    className="w-48 h-48 mx-auto border border-slate-200 rounded-xl"
                                />
                                <p className="text-[11px] text-slate-500 leading-tight">
                                    Mendukung GoPay, OVO, ShopeePay, Dana,
                                    LinkAja, BCA Mobile, & Semua Bank QRIS.
                                </p>
                            </div>
                        )}

                        {/* Tampilan Nomor Virtual Account */}
                        {pembayaran.nomor_va && (
                            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                                <span className="text-xs text-slate-400 block font-medium">
                                    Nomor Virtual Account (
                                    {pembayaran.metode_bayar}):
                                </span>
                                <div className="flex items-center justify-between gap-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                                    <span className="font-mono text-lg sm:text-xl font-black tracking-widest text-amber-300">
                                        {pembayaran.nomor_va}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopy(
                                                pembayaran.nomor_va!,
                                                "va",
                                            )
                                        }
                                        className="bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                                    >
                                        {copiedKey === "va" ? (
                                            <Check className="w-3.5 h-3.5" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                        {copiedKey === "va"
                                            ? "Tersalin"
                                            : "Salin VA"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tampilan Mandiri Biller Code */}
                        {pembayaran.kode_biller && (
                            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                                    <div>
                                        <span className="text-slate-400 block">
                                            Kode Perusahaan (Biller):
                                        </span>
                                        <div className="flex items-center justify-between mt-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                            <span className="font-bold text-base text-amber-300">
                                                {pembayaran.kode_biller}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        pembayaran.kode_biller!,
                                                        "biller",
                                                    )
                                                }
                                                className="text-slate-400 hover:text-white p-1"
                                            >
                                                {copiedKey === "biller" ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">
                                            Kode Pelanggan (Bill Key):
                                        </span>
                                        <div className="flex items-center justify-between mt-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                            <span className="font-bold text-base text-amber-300">
                                                {pembayaran.bill_key ||
                                                    pembayaran.kode_biller}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        pembayaran.bill_key ||
                                                            pembayaran.kode_biller!,
                                                        "billkey",
                                                    )
                                                }
                                                className="text-slate-400 hover:text-white p-1"
                                            >
                                                {copiedKey === "billkey" ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instruksi Langkah Pembayaran */}
                        {Array.isArray(pembayaran.instruksi_bayar) &&
                            pembayaran.instruksi_bayar.length > 0 && (
                                <div className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-800">
                                    <span className="font-bold text-white block">
                                        Panduan Pembayaran:
                                    </span>
                                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400 leading-relaxed">
                                        {pembayaran.instruksi_bayar.map(
                                            (step, idx) => (
                                                <li key={idx}>{step}</li>
                                            ),
                                        )}
                                    </ol>
                                </div>
                            )}
                    </div>
                )}

                {/* Card Ringkasan & Produk */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6">
                        <div>
                            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                                Informasi Rincian Pesanan
                            </h4>
                            <div className="space-y-1 text-slate-700 font-medium leading-relaxed">
                                <div>
                                    Nomor Faktur:{" "}
                                    <strong className="text-slate-900 font-mono">
                                        #{activeOrder.nomor_pesanan}
                                    </strong>
                                </div>
                                <div>
                                    Kurir Pengiriman:{" "}
                                    <strong>
                                        {(
                                            pengiriman.kurir || "JNE"
                                        ).toUpperCase()}{" "}
                                        ({pengiriman.layanan || "REG"})
                                    </strong>
                                </div>
                                <div>
                                    Nomor Resi:{" "}
                                    <strong className="text-emerald-600 font-mono">
                                        {pengiriman.nomor_resi ||
                                            "Menunggu Pembayaran"}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                                Rincian Pembayaran
                            </h4>
                            <div className="space-y-1.5 text-slate-700">
                                <div className="flex justify-between">
                                    <span>Subtotal Produk:</span>
                                    <span className="font-bold text-slate-800 tabular-nums">
                                        {formatRupiah(
                                            activeOrder.subtotal || 0,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Ongkos Kirim:</span>
                                    <span className="font-bold text-slate-800 tabular-nums">
                                        {formatRupiah(activeOrder.ongkir || 0)}
                                    </span>
                                </div>
                                {activeOrder.diskon &&
                                activeOrder.diskon > 0 ? (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Diskon Kupon:</span>
                                        <span className="tabular-nums">
                                            - {formatRupiah(activeOrder.diskon)}
                                        </span>
                                    </div>
                                ) : null}
                                <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-100 text-sm">
                                    <span>Total Tagihan:</span>
                                    <span className="text-[#E52027] text-base tabular-nums">
                                        {formatRupiah(activeOrder.total || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabel Produk */}
                    <div>
                        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">
                            Item Produk Dalam Pesanan
                        </h4>
                        <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                            {orderItems.map((item, idx) => (
                                <div
                                    key={item.id ? `${item.id}-${idx}` : idx}
                                    className="p-3.5 bg-slate-50/50 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <img
                                            src={
                                                item.gambar ||
                                                "/assets/gambar/placeholder.webp"
                                            }
                                            alt={item.nama_produk}
                                            className="w-12 h-12 object-cover rounded-lg bg-white border border-slate-200 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <div className="font-bold text-slate-900 truncate">
                                                {item.nama_produk}
                                            </div>
                                            {item.ukuran && (
                                                <span className="text-[10px] text-slate-500">
                                                    Ukuran: {item.ukuran}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-slate-400 text-[10px]">
                                            {item.jumlah} ×{" "}
                                            {formatRupiah(item.harga)}
                                        </div>
                                        <div className="font-black text-slate-900 tabular-nums">
                                            {formatRupiah(
                                                item.harga * item.jumlah,
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Navigasi */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100 print:hidden">
                        <Link
                            href="/lacak"
                            className="text-xs font-bold text-[#E52027] hover:underline inline-flex items-center gap-1.5"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Lacak Status & Resi Pengiriman
                        </Link>
                        <Link
                            href="/katalog"
                            className="bg-[#E52027] hover:bg-[#CC1C22] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Kembali Belanja
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
