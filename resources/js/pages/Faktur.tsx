import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import { usePaymentStatusPolling } from "../Hooks/usePaymentStatusPolling";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { useCheckoutStore } from "../Stores/useCheckoutStore";
import {
    Clock,
    RefreshCw,
    Printer,
    CheckCircle2,
    Truck,
    XCircle,
    ShoppingBag,
    CreditCard,
    Copy,
    Check,
    ArrowLeft,
    RotateCcw,
    HelpCircle,
    ExternalLink,
    ShieldAlert,
    AlertCircle,
    type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import HitungMundurKedaluwarsa from "../Components/Faktur/HitungMundurKedaluwarsa";
import InstruksiQris from "../Components/Faktur/InstruksiQris";
import InstruksiVirtualAccount from "../Components/Faktur/InstruksiVirtualAccount";
import InstruksiMandiriBill from "../Components/Faktur/InstruksiMandiriBill";
import RincianFaktur from "../Components/Faktur/RincianFaktur";
import ModalUbahAlamat from "../Components/Faktur/ModalUbahAlamat";
import ModalBatalPesanan from "../Components/Faktur/ModalBatalPesanan";
import PaymentSelectModal from "../Components/Checkout/PaymentSelectModal";
import { PaymentOption } from "../Components/Checkout/PaymentMethodSection";
import PrintableA4Invoice from "../Components/Faktur/PrintableA4Invoice";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    gambar?: string;
}

interface PaymentDetail {
    metode_bayar?: string;
    nomor_va?: string;
    qr_code_url?: string;
    qr_string?: string;
    kode_biller?: string;
    bill_key?: string;
    instruksi_bayar?: string[];
    waktu_kedaluwarsa?: string;
    batas_waktu?: string;
}

interface ShippingDetail {
    kurir?: string;
    layanan?: string;
    nomor_resi?: string;
    penerima?: string;
    alamat_lengkap?: string;
    telepon?: string;
    email?: string;
    catatan?: string;
    json_payload?: {
        nama_penerima?: string;
        telepon?: string;
        email?: string;
        alamat_lengkap?: string;
        catatan?: string;
        is_dropship?: boolean;
        dropship_pengirim?: string;
        dropship_telepon?: string;
    };
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
        | "expired"
        | string;
    subtotal: number;
    ongkir: number;
    diskon?: number;
    total: number;
    catatan?: string;
    created_at?: string;
    pembayaran?: PaymentDetail;
    pengiriman?: ShippingDetail;
    items?: OrderItem[];
    is_dropship?: boolean;
    dropship_pengirim?: string;
    dropship_telepon?: string;
    asuransi_pengiriman?: boolean;
    biaya_asuransi?: number;
}

interface InvoiceProps {
    pesanan: OrderData;
    is_baru?: boolean;
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

function formatTanggalIndo(dateStr?: string): string {
    if (!dateStr) return "-";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return (
            d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }) + " WIB"
        );
    } catch {
        return dateStr;
    }
}

interface StatusConfig {
    label: string;
    icon: LucideIcon;
    variant: string;
    iconColor: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    belum_bayar: {
        label: "Menunggu Pembayaran",
        icon: Clock,
        variant: "bg-amber-50 text-amber-900 border-amber-200/80",
        iconColor: "text-amber-600",
    },
    akan_dikirim: {
        label: "Diproses",
        icon: CheckCircle2,
        variant: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
        iconColor: "text-emerald-600",
    },
    dikirim: {
        label: "Dalam Pengiriman",
        icon: Truck,
        variant: "bg-sky-50 text-sky-900 border-sky-200/80",
        iconColor: "text-sky-600",
    },
    selesai: {
        label: "Selesai",
        icon: CheckCircle2,
        variant: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
        iconColor: "text-emerald-600",
    },
    dibatalkan: {
        label: "Dibatalkan",
        icon: XCircle,
        variant: "bg-rose-50 text-rose-900 border-rose-200/80",
        iconColor: "text-rose-600",
    },
    expired: {
        label: "Kedaluwarsa",
        icon: XCircle,
        variant: "bg-slate-100 text-slate-700 border-slate-200",
        iconColor: "text-slate-500",
    },
};

function StatusBadge({ status }: { status: string }) {
    const key = status?.toLowerCase().trim();
    const current = STATUS_CONFIG[key] ?? {
        label: status || "Unknown",
        icon: AlertCircle,
        variant: "bg-slate-100 text-slate-700 border-slate-200",
        iconColor: "text-slate-500",
    };

    const Icon = current.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${current.variant} select-none`}
        >
            <Icon
                className={`w-3.5 h-3.5 shrink-0 ${current.iconColor}`}
                aria-hidden="true"
            />
            <span>{current.label}</span>
        </span>
    );
}

export default function Faktur({ pesanan, is_baru }: InvoiceProps) {
    const activeOrder = pesanan ?? ({} as OrderData);
    const pembayaran = activeOrder.pembayaran || {};
    const pengiriman = activeOrder.pengiriman || {};
    const orderItems = activeOrder.items || [];

    const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
    const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
    const [isChangePaymentOpen, setIsChangePaymentOpen] = useState(false);
    const [isRefreshingQris, setIsRefreshingQris] = useState(false);
    const [copiedInvoice, setCopiedInvoice] = useState(false);
    const [copiedTotal, setCopiedTotal] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    useEffect(() => {
        if (is_baru) {
            useKeranjangStore.getState().kosongkan();
            useCheckoutStore.getState().resetCheckoutState();
        }
    }, [is_baru]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isTermsModalOpen) {
                setIsTermsModalOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isTermsModalOpen]);

    const {
        status: statusPesanan,
        isChecking,
        cekStatusManual,
    } = usePaymentStatusPolling(
        activeOrder.nomor_pesanan || "",
        activeOrder.status || "belum_bayar",
        {
            intervalMs: 4000,
            onSettled: (statusBaru) => {
                if (
                    ["akan_dikirim", "dikirim", "selesai"].includes(statusBaru)
                ) {
                    toast.success(
                        "Pembayaran terverifikasi! Pesanan Anda segera disiapkan.",
                        {
                            duration: 5000,
                        },
                    );
                }
            },
        },
    );

    const handleManualCheckStatus = useCallback(async () => {
        if (isChecking) return;
        await cekStatusManual();
    }, [isChecking, cekStatusManual]);

    const statusNormalized = (statusPesanan || "").toLowerCase();
    const isPendingPayment = statusNormalized === "belum_bayar";
    const isSuccessSettled = ["akan_dikirim", "dikirim", "selesai"].includes(
        statusNormalized,
    );
    const isTerminated = ["dibatalkan", "expired"].includes(statusNormalized);

    const isQris = Boolean(
        pembayaran.qr_code_url ||
        pembayaran.metode_bayar?.toLowerCase().includes("qris"),
    );
    const isMandiriBill = Boolean(
        pembayaran.kode_biller ||
        pembayaran.metode_bayar?.toLowerCase().includes("mandiri"),
    );

    const batasWaktuPembayaran =
        pembayaran.waktu_kedaluwarsa || pembayaran.batas_waktu;

    const copyInvoiceId = async () => {
        try {
            await navigator.clipboard.writeText(activeOrder.nomor_pesanan);
            setCopiedInvoice(true);
            toast.success("Nomor pesanan berhasil disalin");
            setTimeout(() => setCopiedInvoice(false), 2000);
        } catch {
            toast.error("Gagal menyalin nomor pesanan");
        }
    };

    const copyTotalAmount = async () => {
        try {
            await navigator.clipboard.writeText(String(activeOrder.total));
            setCopiedTotal(true);
            toast.success("Total tagihan berhasil disalin");
            setTimeout(() => setCopiedTotal(false), 2000);
        } catch {
            toast.error("Gagal menyalin nominal");
        }
    };

    const handleRefreshQris = () => {
        if (isRefreshingQris) return;
        setIsRefreshingQris(true);
        router.post(
            `/faktur/${encodeURIComponent(activeOrder.nomor_pesanan)}/refresh-qris`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Kode QRIS berhasil diperbarui");
                    setIsRefreshingQris(false);
                },
                onError: (err) => {
                    toast.error(
                        typeof err === "string"
                            ? err
                            : "Gagal memperbarui QRIS",
                    );
                    setIsRefreshingQris(false);
                },
            },
        );
    };

    const handleConfirmChangePayment = (metode: PaymentOption) => {
        setIsChangePaymentOpen(false);
        const toastId = toast.loading("Memperbarui metode pembayaran...");

        router.post(
            `/faktur/${encodeURIComponent(activeOrder.nomor_pesanan)}/ganti-metode-bayar`,
            { metode_pembayaran: metode.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.dismiss(toastId);
                    toast.success(`Metode pembayaran diubah ke ${metode.nama}`);
                },
                onError: (err) => {
                    toast.dismiss(toastId);
                    toast.error(
                        typeof err === "string"
                            ? err
                            : "Gagal mengubah metode pembayaran",
                    );
                },
            },
        );
    };

    const recipientPayload = pengiriman.json_payload;
    const recipientName =
        recipientPayload?.nama_penerima || pengiriman.penerima || "Pelanggan";
    const recipientPhone =
        recipientPayload?.telepon || pengiriman.telepon || "";
    const recipientAddress =
        recipientPayload?.alamat_lengkap || pengiriman.alamat_lengkap || "";
    const currentNotes = activeOrder.catatan || recipientPayload?.catatan || "";

    return (
        <StorefrontLayout>
            <Head
                title={`Faktur #${activeOrder.nomor_pesanan || ""} - CRSL Store`}
            />

            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 10mm 15mm; }
                    html, body {
                        background-color: #ffffff !important;
                        color: #0f172a !important;
                        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    header, footer, nav, aside, [role="dialog"], .sonner-toast, button, .print\\:hidden {
                        display: none !important;
                    }
                    #printable-a4-invoice {
                        display: block !important;
                    }
                }
            `}</style>

            <PrintableA4Invoice
                pesanan={activeOrder}
                statusPesanan={statusPesanan}
                formatRupiah={formatRupiah}
                formatTanggalIndo={formatTanggalIndo}
            />

            <div className="print:hidden">
                <header className="bg-white border-b border-slate-200 py-5">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
                        <div>
                            <Link
                                href="/katalog"
                                className="group inline-flex items-center gap-1.5 -ml-1 px-2 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 ease-out group-hover:-translate-x-0.5" />
                                <span>Kembali ke Belanja</span>
                            </Link>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-medium text-slate-700">
                                        Faktur Pesanan
                                    </span>
                                    <span
                                        className="text-slate-300"
                                        aria-hidden="true"
                                    >
                                        •
                                    </span>
                                    <time dateTime={activeOrder.created_at}>
                                        {formatTanggalIndo(
                                            activeOrder.created_at,
                                        )}
                                    </time>
                                </div>

                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-mono">
                                        <span className="text-slate-400 select-none">
                                            #
                                        </span>
                                        <span>{activeOrder.nomor_pesanan}</span>
                                    </h1>

                                    <button
                                        type="button"
                                        onClick={copyInvoiceId}
                                        title={
                                            copiedInvoice
                                                ? "Tersalin!"
                                                : "Salin nomor pesanan"
                                        }
                                        aria-label="Salin nomor pesanan"
                                        className={`inline-flex items-center justify-center p-1.5 rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                                            copiedInvoice
                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                        }`}
                                    >
                                        {copiedInvoice ? (
                                            <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in-75 duration-150" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                                <StatusBadge status={statusPesanan} />

                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="group inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-700 transition-colors" />
                                    <span>Cetak Faktur</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7 space-y-5">
                            {/* Settlement State */}
                            {isSuccessSettled && (
                                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 sm:p-6 space-y-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-base sm:text-lg font-semibold text-emerald-950 tracking-tight">
                                                Pembayaran Berhasil Diverifikasi
                                            </h2>
                                            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                                                Pesanan Anda sedang dipersiapkan
                                                oleh tim logistik CRSL Store.
                                                Nomor resi pengiriman akan
                                                diperbarui otomatis setelah
                                                paket diserahkan ke pihak
                                                ekspedisi.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-1 flex flex-wrap gap-2.5">
                                        <Link
                                            href={`/lacak?nomor=${encodeURIComponent(activeOrder.nomor_pesanan || "")}`}
                                            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                                        >
                                            <Truck className="w-3.5 h-3.5" />
                                            <span>Lacak Pengiriman</span>
                                        </Link>
                                        <Link
                                            href="/katalog"
                                            className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 font-medium text-xs px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                                            <span>Belanja Lagi</span>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Pending Payment State */}
                            {isPendingPayment && (
                                <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                                    <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/60">
                                        <div className="space-y-1">
                                            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                                <span>
                                                    {pembayaran.metode_bayar ||
                                                        "Metode Pembayaran"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight tabular-nums">
                                                    {formatRupiah(
                                                        activeOrder.total,
                                                    )}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={copyTotalAmount}
                                                    aria-label="Salin nominal total pembayaran"
                                                    className="min-w-16 text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
                                                >
                                                    {copiedTotal ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span className="text-emerald-700">
                                                                Tersalin
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Salin</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <HitungMundurKedaluwarsa
                                                batasWaktu={
                                                    batasWaktuPembayaran
                                                }
                                                createdAt={
                                                    activeOrder.created_at
                                                }
                                                onExpired={
                                                    handleManualCheckStatus
                                                }
                                            />

                                            <button
                                                type="button"
                                                onClick={
                                                    handleManualCheckStatus
                                                }
                                                disabled={isChecking}
                                                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                                            >
                                                <RefreshCw
                                                    className={`w-3.5 h-3.5 text-slate-500 ${isChecking ? "animate-spin" : ""}`}
                                                />
                                                <span>
                                                    {isChecking
                                                        ? "Memeriksa..."
                                                        : "Cek Status"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {isQris && (
                                        <div className="px-5 sm:px-6 py-3 bg-amber-50/70 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-2 text-amber-950">
                                                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                                <p>
                                                    Masa aktif QRIS{" "}
                                                    <strong className="font-semibold">
                                                        15 Menit
                                                    </strong>
                                                    . Lakukan perpanjangan kode
                                                    jika waktu habis tanpa
                                                    membatalkan pesanan.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRefreshQris}
                                                disabled={isRefreshingQris}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                                            >
                                                <RotateCcw
                                                    className={`w-3.5 h-3.5 ${isRefreshingQris ? "animate-spin" : ""}`}
                                                />
                                                <span>
                                                    {isRefreshingQris
                                                        ? "Memperbarui..."
                                                        : "Perbarui QRIS"}
                                                </span>
                                            </button>
                                        </div>
                                    )}

                                    <div className="p-5 sm:p-6 space-y-6">
                                        {isQris && (
                                            <InstruksiQris
                                                qrCodeUrl={
                                                    pembayaran.qr_code_url
                                                }
                                                qrString={pembayaran.qr_string}
                                                nomorPesanan={
                                                    activeOrder.nomor_pesanan
                                                }
                                                instruksiBayar={
                                                    pembayaran.instruksi_bayar
                                                }
                                            />
                                        )}

                                        {isMandiriBill && (
                                            <InstruksiMandiriBill
                                                kodeBiller={
                                                    pembayaran.kode_biller
                                                }
                                                billKey={
                                                    pembayaran.bill_key ||
                                                    pembayaran.nomor_va
                                                }
                                                instruksiBayar={
                                                    pembayaran.instruksi_bayar
                                                }
                                            />
                                        )}

                                        {!isQris && !isMandiriBill && (
                                            <InstruksiVirtualAccount
                                                metodeBayar={
                                                    pembayaran.metode_bayar
                                                }
                                                nomorVa={pembayaran.nomor_va}
                                                instruksiBayar={
                                                    pembayaran.instruksi_bayar
                                                }
                                                nomorPesanan={
                                                    activeOrder.nomor_pesanan
                                                }
                                            />
                                        )}

                                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsChangePaymentOpen(true)
                                                }
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors"
                                            >
                                                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                                <span>
                                                    Ganti Metode Pembayaran
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsCancelOrderOpen(true)
                                                }
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                <span>Batalkan Pesanan</span>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Terminated State (Dibatalkan / Expired) */}
                            {isTerminated && (
                                <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                                            <XCircle className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
                                                Pesanan Ini Telah Berakhir
                                            </h2>
                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                                Faktur ini berstatus{" "}
                                                <strong className="text-slate-800">
                                                    {statusNormalized ===
                                                    "dibatalkan"
                                                        ? "Dibatalkan"
                                                        : "Kedaluwarsa"}
                                                </strong>
                                                . Tagihan pembayaran tidak lagi
                                                aktif dan pesanan tidak dapat
                                                diproses lebih lanjut.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Link
                                            href="/katalog"
                                            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-colors"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            <span>Buat Pesanan Baru</span>
                                        </Link>
                                    </div>
                                </section>
                            )}

                            {/* Customer Support Banner */}
                            <aside
                                aria-label="Bantuan Pembayaran"
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600"
                            >
                                <div className="flex items-start sm:items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                                        <HelpCircle
                                            className="w-4 h-4 text-slate-500"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-semibold text-slate-900 leading-snug">
                                            Mengalami Kendala Pembayaran?
                                        </p>
                                        <p className="text-slate-500 text-[11px] leading-relaxed">
                                            Tim Customer Service resmi CRSL siap
                                            membantu kendala Anda.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-200/60 sm:border-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsTermsModalOpen(true)
                                        }
                                        className="text-slate-500 hover:text-slate-900 font-medium text-[11px] underline-offset-4 hover:underline rounded px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                    >
                                        S&K Pembayaran
                                    </button>

                                    <a
                                        href={`https://wa.me/6281234567890?text=Halo%20CRSL%2C%20saya%20butuh%20bantuan%20terkait%20pesanan%20${encodeURIComponent(activeOrder.nomor_pesanan || "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-2 rounded-lg transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                                    >
                                        <span>Chat CS WhatsApp</span>
                                        <ExternalLink
                                            className="w-3.5 h-3.5 opacity-80"
                                            aria-hidden="true"
                                        />
                                    </a>
                                </div>
                            </aside>
                        </div>

                        {/* Order Summary & Shipping Details Column */}
                        <div className="lg:col-span-5">
                            <RincianFaktur
                                nomorPesanan={activeOrder.nomor_pesanan}
                                status={statusPesanan}
                                items={orderItems}
                                subtotal={activeOrder.subtotal}
                                ongkir={activeOrder.ongkir}
                                diskon={activeOrder.diskon}
                                total={activeOrder.total}
                                pengiriman={pengiriman}
                                isDropship={activeOrder.is_dropship}
                                dropshipPengirim={activeOrder.dropship_pengirim}
                                dropshipTelepon={activeOrder.dropship_telepon}
                                asuransiPengiriman={
                                    activeOrder.asuransi_pengiriman
                                }
                                biayaAsuransi={activeOrder.biaya_asuransi}
                                formatRupiah={formatRupiah}
                                onOpenEditRecipient={() =>
                                    setIsEditAddressOpen(true)
                                }
                            />
                        </div>
                    </div>
                </main>

                <ModalUbahAlamat
                    isOpen={isEditAddressOpen}
                    onClose={() => setIsEditAddressOpen(false)}
                    nomorPesanan={activeOrder.nomor_pesanan}
                    namaPenerimaDefault={recipientName}
                    teleponDefault={recipientPhone}
                    alamatLengkapDefault={recipientAddress}
                    catatanDefault={currentNotes}
                    onSuccess={() => {
                        router.reload({ only: ["pesanan"] });
                    }}
                />

                <ModalBatalPesanan
                    isOpen={isCancelOrderOpen}
                    onClose={() => setIsCancelOrderOpen(false)}
                    nomorPesanan={activeOrder.nomor_pesanan}
                    total={activeOrder.total}
                    onSuccess={() => {
                        router.reload({ only: ["pesanan"] });
                    }}
                />

                <PaymentSelectModal
                    isOpen={isChangePaymentOpen}
                    onClose={() => setIsChangePaymentOpen(false)}
                    selectedPaymentId={
                        pembayaran.metode_bayar?.toLowerCase() || "qris"
                    }
                    onConfirmPayment={handleConfirmChangePayment}
                />

                {isTermsModalOpen && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="terms-modal-title"
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
                    >
                        <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl border border-slate-200">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-slate-700" />
                                    <h3
                                        id="terms-modal-title"
                                        className="font-semibold text-sm text-slate-900"
                                    >
                                        Syarat & Ketentuan Pembayaran
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsTermsModalOpen(false)}
                                    aria-label="Tutup jendela syarat dan ketentuan"
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1">
                                <p>
                                    1. Pesanan yang belum diselesaikan
                                    dicadangkan selama <strong>24 jam</strong>{" "}
                                    sejak faktur terbit.
                                </p>
                                <p>
                                    2. Khusus metode <strong>QRIS</strong>, masa
                                    aktif scan adalah <strong>15 menit</strong>.
                                    Anda dapat memperbarui kode jika waktu habis
                                    tanpa membatalkan order.
                                </p>
                                <p>
                                    3. Penggantian metode pembayaran dapat
                                    dilakukan kapan saja sebelum transaksi
                                    berstatus lunas.
                                </p>
                                <p>
                                    4. Jika pesanan dibatalkan, kuota voucher
                                    dan koin loyalty point otomatis dikembalikan
                                    ke akun Anda.
                                </p>
                                <p>
                                    5. Pesanan lunas langsung dialokasikan ke
                                    antrean logistik dan tidak dapat dibatalkan
                                    sepihak.
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsTermsModalOpen(false)}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition-colors text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                                >
                                    Saya Mengerti
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
