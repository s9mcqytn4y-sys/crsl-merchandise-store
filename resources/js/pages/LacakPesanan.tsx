import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import {
    Search,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    Copy,
    Check,
    CreditCard,
    ArrowRight,
    MapPin,
    ExternalLink,
    Calendar,
    Radio,
} from "lucide-react";
import { toast } from "sonner";
import FulfillmentTimeline from "../Components/Lacak/FulfillmentTimeline";
import RincianPaket from "../Components/Lacak/RincianPaket";

interface OrderItem {
    id: number | string;
    nama_produk?: string;
    product_name?: string;
    harga?: number;
    price?: number;
    jumlah?: number;
    quantity?: number;
    gambar?: string;
    ukuran?: string;
}

interface TrackingHistoryItem {
    note: string;
    updated_at: string;
    status?: string;
}

interface BiteshipTrackingData {
    sukses: boolean;
    waybill_id?: string;
    kurir?: string;
    status?: string;
    link?: string;
    history?: TrackingHistoryItem[];
    is_mock?: boolean;
}

interface OrderDetail {
    id?: string | number;
    nomor_pesanan?: string;
    order_number?: string;
    status:
        | "belum_bayar"
        | "akan_dikirim"
        | "dikirim"
        | "selesai"
        | "dibatalkan"
        | string;
    total: number;
    created_at?: string;
    pengiriman?: {
        kurir?: string;
        layanan?: string;
        nomor_resi?: string;
    };
    items?: OrderItem[];
    item?: OrderItem[];
}

interface TrackOrderProps {
    nomorPesanan?: string;
    orderNumber?: string;
    pesanan?: OrderDetail | null;
    order?: OrderDetail | null;
    tracking?: BiteshipTrackingData | null;
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatRupiah(num: number): string {
    return rupiahFormatter.format(num || 0);
}

function formatTanggal(isoString: string): string {
    try {
        const d = new Date(isoString);
        return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return isoString;
    }
}

function StatusBadge({ status }: { status: string }) {
    switch (status.toLowerCase()) {
        case "belum_bayar":
            return (
                <span className="bg-amber-50 text-amber-700 border border-amber-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Menunggu Pembayaran
                </span>
            );
        case "akan_dikirim":
            return (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Sedang Diproses
                </span>
            );
        case "dikirim":
            return (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    Dalam Pengiriman
                </span>
            );
        case "selesai":
            return (
                <span className="bg-blue-50 text-blue-700 border border-blue-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Selesai
                </span>
            );
        case "dibatalkan":
            return (
                <span className="bg-rose-50 text-rose-700 border border-rose-200/80 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Dibatalkan
                </span>
            );
        default:
            return (
                <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-xs">
                    {status}
                </span>
            );
    }
}

export default function TrackOrder({
    nomorPesanan = "",
    orderNumber = "",
    pesanan = null,
    order = null,
    tracking = null,
}: TrackOrderProps) {
    const activeNumber = nomorPesanan || orderNumber || "";
    const activeOrder = pesanan || order || null;

    const [inputNumber, setInputNumber] = useState(activeNumber);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setInputNumber(activeNumber);
    }, [activeNumber]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputNumber.trim();
        if (trimmed) {
            router.get("/lacak", { nomor: trimmed }, { preserveState: true });
        }
    };

    const handleCopyResi = async (resi: string) => {
        try {
            await navigator.clipboard.writeText(resi);
            setCopied(true);
            toast.success("Nomor resi tersalin ke clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin nomor resi.");
        }
    };

    const getStepIndex = (status: string) => {
        switch (status.toLowerCase()) {
            case "belum_bayar":
                return 1;
            case "akan_dikirim":
                return 2;
            case "dikirim":
                return 3;
            case "selesai":
                return 4;
            default:
                return 0;
        }
    };

    const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;
    const orderItems = activeOrder?.items || activeOrder?.item || [];
    const trackingHistory = tracking?.history || [];

    return (
        <StorefrontLayout>
            <Head title="Lacak Pesanan & Resi Pengiriman - CRSL Official Store" />

            {/* Header Area & Form Lacak */}
            <div className="bg-slate-50 border-b border-slate-200/80 py-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center mx-auto mb-3">
                        <Truck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Lacak Status Pesanan
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                        Masukkan Nomor Invoice Pesanan Anda (contoh:{" "}
                        <code>INV/CRSL/...</code>) untuk memantau status
                        pengiriman secara real-time.
                    </p>

                    <form
                        onSubmit={handleSearch}
                        className="mt-6 flex max-w-md mx-auto gap-2"
                    >
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputNumber}
                                onChange={(e) => setInputNumber(e.target.value)}
                                placeholder="Nomor Pesanan / Invoice..."
                                className="w-full bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                                required
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-xs transition-all cursor-pointer"
                        >
                            Lacak
                        </button>
                    </form>
                </div>
            </div>

            {/* Hasil Pelacakan */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                {activeNumber && !activeOrder && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-3 shadow-2xs max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <XCircle className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">
                            Pesanan Tidak Ditemukan
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Nomor pesanan{" "}
                            <strong className="text-slate-800 font-mono">
                                "{activeNumber}"
                            </strong>{" "}
                            tidak terdaftar dalam sistem. Pastikan format nomor
                            invoice sudah sesuai.
                        </p>
                    </div>
                )}

                {activeOrder && (
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-8">
                        {/* Header Kartu Pesanan */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-5">
                            <div>
                                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                                    Pesanan #
                                    {activeOrder.nomor_pesanan ||
                                        activeOrder.order_number}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Total Tagihan:{" "}
                                    <strong className="text-primary font-bold">
                                        {formatRupiah(activeOrder.total)}
                                    </strong>
                                </p>
                            </div>
                            <div>
                                <StatusBadge status={activeOrder.status} />
                            </div>
                        </div>

                        {/* Visual Step Timeline */}
                        <div className="py-2">
                            <div className="grid grid-cols-4 gap-2 text-center text-xs relative">
                                <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 z-0" />
                                <div
                                    className="absolute top-4 left-[12.5%] h-0.5 bg-primary z-0 transition-all duration-500"
                                    style={{
                                        width: `${Math.max(0, Math.min(3, currentStep - 1)) * 33.33}%`,
                                    }}
                                />

                                {/* Step 1 */}
                                <div className="space-y-2 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto text-xs shadow-xs">
                                        1
                                    </div>
                                    <p className="font-bold text-slate-900 text-[11px] sm:text-xs">
                                        Pesanan Dibuat
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div className="space-y-2 relative z-10">
                                    <div
                                        className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-xs transition-colors ${
                                            currentStep >= 2
                                                ? "bg-primary text-white shadow-xs"
                                                : "bg-slate-100 text-slate-400 border border-slate-200"
                                        }`}
                                    >
                                        2
                                    </div>
                                    <p
                                        className={`text-[11px] sm:text-xs ${
                                            currentStep >= 2
                                                ? "font-bold text-slate-900"
                                                : "font-medium text-slate-400"
                                        }`}
                                    >
                                        Pembayaran
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div className="space-y-2 relative z-10">
                                    <div
                                        className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-xs transition-colors ${
                                            currentStep >= 3
                                                ? "bg-primary text-white shadow-xs"
                                                : "bg-slate-100 text-slate-400 border border-slate-200"
                                        }`}
                                    >
                                        3
                                    </div>
                                    <p
                                        className={`text-[11px] sm:text-xs ${
                                            currentStep >= 3
                                                ? "font-bold text-slate-900"
                                                : "font-medium text-slate-400"
                                        }`}
                                    >
                                        Pengiriman
                                    </p>
                                </div>

                                {/* Step 4 */}
                                <div className="space-y-2 relative z-10">
                                    <div
                                        className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-xs transition-colors ${
                                            currentStep >= 4
                                                ? "bg-primary text-white shadow-xs"
                                                : "bg-slate-100 text-slate-400 border border-slate-200"
                                        }`}
                                    >
                                        4
                                    </div>
                                    <p
                                        className={`text-[11px] sm:text-xs ${
                                            currentStep >= 4
                                                ? "font-bold text-slate-900"
                                                : "font-medium text-slate-400"
                                        }`}
                                    >
                                        Selesai
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fulfillment Timeline Section (Smart Fallback & Live Biteship) */}
                        <FulfillmentTimeline
                            orderStatus={activeOrder.status}
                            kurir={activeOrder.pengiriman?.kurir}
                            layanan={activeOrder.pengiriman?.layanan}
                            nomorResi={activeOrder.pengiriman?.nomor_resi}
                            tracking={tracking}
                            alamatPenerima={
                                activeOrder.pengiriman?.alamat_lengkap ||
                                activeOrder.pengiriman?.json_payload?.alamat_lengkap
                            }
                            namaPenerima={
                                activeOrder.pengiriman?.nama_penerima ||
                                activeOrder.pengiriman?.json_payload?.nama_penerima ||
                                activeOrder.pengiriman?.penerima
                            }
                            formatTanggal={formatTanggal}
                        />

                        {/* CTA Bayar Jika Status Belum Bayar */}
                        {activeOrder.status === "belum_bayar" && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-2.5 text-xs text-amber-900">
                                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>
                                        Pesanan ini masih menunggu pembayaran
                                        untuk segera diproses.
                                    </span>
                                </div>
                                <Link
                                    href={`/faktur/${(activeOrder.nomor_pesanan || activeOrder.order_number || "").replace(/\//g, "-")}`}
                                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Bayar Sekarang
                                </Link>
                            </div>
                        )}

                        {/* Rincian Produk & Tujuan Pengiriman */}
                        <RincianPaket
                            items={orderItems}
                            penerima={
                                activeOrder.pengiriman?.nama_penerima ||
                                activeOrder.pengiriman?.json_payload?.nama_penerima ||
                                activeOrder.pengiriman?.penerima
                            }
                            telepon={
                                activeOrder.pengiriman?.telepon ||
                                activeOrder.pengiriman?.json_payload?.telepon
                            }
                            alamatLengkap={
                                activeOrder.pengiriman?.alamat_lengkap ||
                                activeOrder.pengiriman?.json_payload?.alamat_lengkap
                            }
                            catatan={
                                activeOrder.pengiriman?.catatan ||
                                activeOrder.pengiriman?.json_payload?.catatan
                            }
                            total={activeOrder.total}
                        />

                        {/* Navigasi Footer */}
                        <div className="pt-2 flex justify-between items-center text-xs">
                            <Link
                                href="/katalog"
                                className="text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1"
                            >
                                ← Kembali ke Katalog
                            </Link>
                            <Link
                                href={`/faktur/${(activeOrder.nomor_pesanan || activeOrder.order_number || "").replace(/\//g, "-")}`}
                                className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                            >
                                Lihat Faktur Lengkap{" "}
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
