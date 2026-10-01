import React, { useState, useEffect, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import {
    Search,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    Check,
    CreditCard,
    ArrowRight,
    ExternalLink,
    Loader2,
    RefreshCw,
    AlertCircle,
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
    warna?: string;
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
    layanan?: string;
    status?: string;
    link?: string;
    history?: TrackingHistoryItem[];
    is_mock?: boolean;
    is_pre_dispatch?: boolean;
}

interface ShippingPayload {
    nama_penerima?: string;
    telepon?: string;
    email?: string;
    alamat_lengkap?: string;
    catatan?: string;
    kota?: string;
    kecamatan?: string;
    provinsi?: string;
    kode_pos?: string;
}

interface OrderDetail {
    id?: string | number;
    nomor_pesanan?: string;
    order_number?: string;
    status:
        | "belum_bayar"
        | "menunggu_verifikasi_manual"
        | "challenge"
        | "akan_dikirim"
        | "dikirim"
        | "selesai"
        | "dibatalkan"
        | "expired"
        | string;
    total: number;
    created_at?: string;
    pengiriman?: {
        kurir?: string;
        layanan?: string;
        nomor_resi?: string;
        alamat_lengkap?: string;
        nama_penerima?: string;
        telepon?: string;
        penerima?: string;
        json_payload?: ShippingPayload | string;
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

function formatRupiah(num: number | string | undefined | null): string {
    if (num === null || num === undefined) return "Rp 0";
    const val = typeof num === "string" ? parseFloat(num) : num;
    return rupiahFormatter.format(!isNaN(val) ? val : 0);
}

function formatTanggal(isoString: string): string {
    try {
        const d = new Date(
            isoString.includes("T") ? isoString : isoString.replace(" ", "T"),
        );
        if (isNaN(d.getTime())) return isoString;
        return (
            d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }) + " WIB"
        );
    } catch {
        return isoString;
    }
}

function formatNamaKurirLayanan(kurir?: string, layanan?: string): string {
    if (!kurir) return "Ekspedisi";
    const c = kurir.toLowerCase().trim();
    let namaKurir = kurir.toUpperCase();
    if (c === "pos") namaKurir = "POS Indonesia";
    if (c === "jne") namaKurir = "JNE Express";
    if (c === "jnt") namaKurir = "J&T Express";
    if (c === "sicepat") namaKurir = "SiCepat Ekspres";
    if (c === "tiki") namaKurir = "TIKI";

    if (!layanan) return namaKurir;
    const cleanLayanan = layanan.replace(/_/g, " ").trim();
    const namaLayanan = cleanLayanan.toLowerCase().includes("reg")
        ? cleanLayanan.replace(/reg/i, "Reguler")
        : cleanLayanan.toUpperCase();

    return `${namaKurir} (${namaLayanan})`;
}

function StatusBadge({ status }: { status: string }) {
    switch (status?.toLowerCase().trim()) {
        case "belum_bayar":
            return (
                <span className="bg-amber-50 text-amber-900 border border-amber-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Menunggu Pembayaran
                </span>
            );
        case "menunggu_verifikasi_manual":
        case "challenge":
            return (
                <span className="bg-amber-100 text-amber-950 border border-amber-300 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    Verifikasi Manual CS
                </span>
            );
        case "akan_dikirim":
            return (
                <span className="bg-emerald-50 text-emerald-900 border border-emerald-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Sedang Diproses
                </span>
            );
        case "dikirim":
            return (
                <span className="bg-sky-50 text-sky-900 border border-sky-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <Truck className="w-3.5 h-3.5 text-sky-600" />
                    Dalam Pengiriman
                </span>
            );
        case "selesai":
            return (
                <span className="bg-emerald-50 text-emerald-900 border border-emerald-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Pesanan Selesai
                </span>
            );
        case "dibatalkan":
        case "expired":
            return (
                <span className="bg-rose-50 text-rose-900 border border-rose-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    {status.toLowerCase() === "expired"
                        ? "Kedaluwarsa"
                        : "Dibatalkan"}
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

function LiveTrackingEmbed({
    trackingUrl,
    resi,
    kurir,
}: {
    trackingUrl: string;
    resi?: string;
    kurir?: string;
}) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden mt-6">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            Pelacakan Langsung Ekspedisi
                            {kurir && (
                                <span className="text-[10px] font-bold text-slate-600 uppercase bg-slate-200/70 px-2 py-0.5 rounded">
                                    {kurir}
                                </span>
                            )}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                            Peta rute dan status pergerakan paket{" "}
                            {resi ? `(#${resi})` : ""}
                        </p>
                    </div>
                </div>

                <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl font-medium text-xs transition-colors shadow-2xs"
                >
                    <ExternalLink className="w-3.5 h-3.5 text-[#E52027]" />
                    <span>Buka Layar Penuh</span>
                </a>
            </div>

            <div className="relative w-full h-[520px] bg-slate-50">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10 gap-3">
                        <Loader2 className="w-7 h-7 text-[#E52027] animate-spin" />
                        <span className="text-xs font-semibold text-slate-500">
                            Memuat server pelacakan kurir...
                        </span>
                    </div>
                )}
                <iframe
                    src={trackingUrl}
                    title="Pelacakan Pengiriman Resmi"
                    className="w-full h-full border-0"
                    loading="lazy"
                    onLoad={() => setIsLoading(false)}
                />
            </div>
        </div>
    );
}

export default function TrackOrder({
    nomorPesanan = "",
    orderNumber = "",
    pesanan = null,
    order = null,
    tracking = null,
}: TrackOrderProps) {
    const activeNumber = (nomorPesanan || orderNumber || "").trim();
    const activeOrder = pesanan || order || null;

    const [inputNumber, setInputNumber] = useState(activeNumber);
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    const handleRefresh = () => {
        if (!activeNumber || isRefreshing) return;
        setIsRefreshing(true);
        router.reload({
            only: ["pesanan", "tracking"],
            onFinish: () => {
                setIsRefreshing(false);
                toast.success("Informasi status pengiriman diperbarui");
            },
            onError: () => {
                setIsRefreshing(false);
                toast.error("Gagal memperbarui status pengiriman");
            },
        });
    };

    // Safe parser untuk json_payload pengiriman
    const parsedPayload = useMemo<ShippingPayload>(() => {
        const raw = activeOrder?.pengiriman?.json_payload;
        if (!raw) return {};
        if (typeof raw === "object") return raw;
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }, [activeOrder?.pengiriman?.json_payload]);

    const recipientName =
        parsedPayload.nama_penerima ||
        activeOrder?.pengiriman?.nama_penerima ||
        activeOrder?.pengiriman?.penerima ||
        "Pelanggan";

    const recipientPhone =
        parsedPayload.telepon || activeOrder?.pengiriman?.telepon;

    const recipientAddress =
        parsedPayload.alamat_lengkap ||
        activeOrder?.pengiriman?.alamat_lengkap ||
        "Alamat tidak tercatat";

    const recipientNotes =
        parsedPayload.catatan || (activeOrder?.pengiriman as { catatan?: string } | undefined)?.catatan;

    const hasWaybill = Boolean(activeOrder?.pengiriman?.nomor_resi);

    // Stepper responsif berdasarkan realitas alur logistik
    const getStepIndex = (status: string, withResi: boolean): number => {
        const s = status.toLowerCase().trim();
        if (s === "selesai") return 4;
        if (s === "dikirim") return 3;
        if (s === "akan_dikirim") {
            return withResi ? 3 : 2;
        }
        if (
            ["belum_bayar", "menunggu_verifikasi_manual", "challenge"].includes(
                s,
            )
        ) {
            return 1;
        }
        return 1;
    };

    const currentStep = activeOrder
        ? getStepIndex(activeOrder.status, hasWaybill)
        : 0;

    const orderItems = activeOrder?.items || activeOrder?.item || [];

    const isTerminated =
        activeOrder?.status === "dibatalkan" ||
        activeOrder?.status === "expired";

    const isHoldManual =
        activeOrder?.status === "menunggu_verifikasi_manual" ||
        activeOrder?.status === "challenge";

    // URL faktur aman terhadap pemenggalan URL web server
    const safeOrderSlug = activeNumber ? activeNumber.replace(/\//g, "-") : "";
    const fakturUrl = safeOrderSlug
        ? `/faktur/${encodeURIComponent(safeOrderSlug)}`
        : "/katalog";

    const displayCourierText = formatNamaKurirLayanan(
        activeOrder?.pengiriman?.kurir,
        activeOrder?.pengiriman?.layanan,
    );

    return (
        <StorefrontLayout>
            <Head title="Lacak Pesanan & Status Pengiriman - CRSL Official Store" />

            {/* Header & Form Pencarian */}
            <div className="bg-slate-50 border-b border-slate-200/80 py-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E52027] flex items-center justify-center mx-auto mb-3">
                        <Truck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Lacak Status Pengiriman
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                        Masukkan Nomor Faktur Pesanan (contoh:{" "}
                        <code className="text-slate-800 font-semibold font-mono">
                            INV/CRSL/...
                        </code>
                        ) untuk memeriksa posisi paket dan riwayat kurir secara
                        real-time.
                    </p>

                    <form
                        onSubmit={handleSearch}
                        className="mt-6 flex flex-col sm:flex-row max-w-md mx-auto gap-2"
                    >
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputNumber}
                                onChange={(e) => setInputNumber(e.target.value)}
                                placeholder="Nomor Pesanan / Invoice..."
                                className="w-full bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm font-semibold rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E52027]/20 focus:border-[#E52027] shadow-2xs"
                                required
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button
                            type="submit"
                            className="bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl shadow-xs transition-all cursor-pointer shrink-0"
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
                            tidak terdaftar. Pastikan format nomor invoice sudah
                            sesuai.
                        </p>
                    </div>
                )}

                {activeOrder && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
                        {/* Header Ringkasan Pesanan */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-5">
                            <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-black text-slate-900 text-base sm:text-lg font-mono truncate">
                                        #
                                        {activeOrder.nomor_pesanan ||
                                            activeOrder.order_number}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        title="Perbarui status pengiriman"
                                        aria-label="Perbarui status pengiriman"
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                                    >
                                        <RefreshCw
                                            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                                        />
                                    </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                                    <span>
                                        Total Tagihan:{" "}
                                        <strong className="text-slate-900 font-bold font-mono">
                                            {formatRupiah(activeOrder.total)}
                                        </strong>
                                    </span>
                                    <span>•</span>
                                    <span>{displayCourierText}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <StatusBadge status={activeOrder.status} />
                            </div>
                        </div>

                        {/* Banner Verifikasi Manual CS */}
                        {isHoldManual && (
                            <aside className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-950">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-bold">
                                        Pembayaran Memerlukan Verifikasi Manual
                                    </p>
                                    <p className="text-[11px] leading-relaxed text-amber-800">
                                        Alokasi kurir sedang ditahan sementara
                                        karena nominal transfer sedang ditinjau
                                        oleh Customer Service kami.
                                    </p>
                                </div>
                            </aside>
                        )}

                        {/* Visual Step Timeline */}
                        {!isTerminated ? (
                            <div
                                className="py-2"
                                aria-label="Progres pengiriman pesanan"
                            >
                                <div className="grid grid-cols-4 gap-2 text-center text-xs relative">
                                    {/* Background Track Line (Melintang dari tengah Step 1 ke tengah Step 4) */}
                                    <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200 z-0" />

                                    {/* Active Progress Line (Delta per step adalah 25%) */}
                                    <div
                                        className="absolute top-4 left-[12.5%] h-0.5 bg-[#E52027] z-0 transition-all duration-500 ease-out"
                                        style={{
                                            width: `${Math.max(0, Math.min(3, currentStep - 1)) * 25}%`,
                                        }}
                                    />

                                    {/* Step 1: Pesanan Dibuat */}
                                    <div className="space-y-2 relative z-10">
                                        <div
                                            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-xs transition-colors shadow-xs ${
                                                currentStep > 1
                                                    ? "bg-[#E52027] text-white"
                                                    : "bg-[#E52027] text-white ring-4 ring-red-100"
                                            }`}
                                        >
                                            {currentStep > 1 ? (
                                                <Check className="w-4 h-4 stroke-[2.5]" />
                                            ) : (
                                                "1"
                                            )}
                                        </div>
                                        <p className="font-bold text-slate-900 text-[11px] sm:text-xs">
                                            Pesanan Dibuat
                                        </p>
                                    </div>

                                    {/* Step 2: Diproses */}
                                    <div className="space-y-2 relative z-10">
                                        <div
                                            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-xs transition-colors ${
                                                currentStep > 2
                                                    ? "bg-[#E52027] text-white shadow-xs"
                                                    : currentStep === 2
                                                      ? "bg-[#E52027] text-white shadow-xs ring-4 ring-red-100"
                                                      : "bg-slate-100 text-slate-400 border border-slate-200"
                                            }`}
                                        >
                                            {currentStep > 2 ? (
                                                <Check className="w-4 h-4 stroke-[2.5]" />
                                            ) : (
                                                "2"
                                            )}
                                        </div>
                                        <p
                                            className={`text-[11px] sm:text-xs ${
                                                currentStep >= 2
                                                    ? "font-bold text-slate-900"
                                                    : "font-medium text-slate-400"
                                            }`}
                                        >
                                            Diproses
                                        </p>
                                    </div>

                                    {/* Step 3: Pengiriman */}
                                    <div className="space-y-2 relative z-10">
                                        <div
                                            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-xs transition-colors ${
                                                currentStep > 3
                                                    ? "bg-[#E52027] text-white shadow-xs"
                                                    : currentStep === 3
                                                      ? "bg-[#E52027] text-white shadow-xs ring-4 ring-red-100"
                                                      : "bg-slate-100 text-slate-400 border border-slate-200"
                                            }`}
                                        >
                                            {currentStep > 3 ? (
                                                <Check className="w-4 h-4 stroke-[2.5]" />
                                            ) : (
                                                "3"
                                            )}
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

                                    {/* Step 4: Selesai */}
                                    <div className="space-y-2 relative z-10">
                                        <div
                                            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center mx-auto text-xs transition-colors ${
                                                currentStep >= 4
                                                    ? "bg-[#E52027] text-white shadow-xs ring-4 ring-red-100"
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
                        ) : (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-1">
                                <p className="text-xs font-bold text-rose-800">
                                    Alur Pengiriman Tidak Aktif
                                </p>
                                <p className="text-[11px] text-rose-600">
                                    Pesanan ini telah dibatalkan atau
                                    kedaluwarsa sehingga pengiriman barang tidak
                                    diproses.
                                </p>
                            </div>
                        )}

                        {/* Fulfillment Timeline */}
                        <FulfillmentTimeline
                            orderStatus={activeOrder.status}
                            kurir={activeOrder.pengiriman?.kurir}
                            layanan={activeOrder.pengiriman?.layanan}
                            nomorResi={activeOrder.pengiriman?.nomor_resi}
                            tracking={tracking}
                            alamatPenerima={recipientAddress}
                            namaPenerima={recipientName}
                            formatTanggal={formatTanggal}
                        />

                        {/* Live Tracking Iframe (Hanya jika tracking link resmi HTTP aktif & bukan mock) */}
                        {typeof tracking?.link === "string" &&
                            tracking.link.startsWith("http") &&
                            !tracking?.is_mock && (
                                <LiveTrackingEmbed
                                    trackingUrl={tracking.link}
                                    resi={activeOrder.pengiriman?.nomor_resi}
                                    kurir={activeOrder.pengiriman?.kurir}
                                />
                            )}

                        {/* Banner Aksi Bayar jika status belum bayar */}
                        {activeOrder.status === "belum_bayar" && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-2.5 text-xs text-amber-900">
                                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>
                                        Pesanan ini menunggu pembayaran sebelum
                                        dapat diteruskan ke gudang logistik.
                                    </span>
                                </div>
                                <Link
                                    href={fakturUrl}
                                    className="inline-flex items-center gap-1.5 bg-[#E52027] hover:bg-[#CC1C22] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Bayar Sekarang</span>
                                </Link>
                            </div>
                        )}

                        {/* Detail Rincian Paket */}
                        <RincianPaket
                            items={orderItems}
                            penerima={recipientName}
                            telepon={recipientPhone}
                            alamatLengkap={recipientAddress}
                            catatan={recipientNotes}
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
                                href={fakturUrl}
                                className="text-[#E52027] hover:underline font-bold inline-flex items-center gap-1"
                            >
                                <span>Lihat Faktur Lengkap</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
