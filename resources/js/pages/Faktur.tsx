import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    Fragment,
} from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
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
    MessageCircle,
    PackageCheck,
    X,
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
import { formatRupiah } from "../Utils/formatters";
import { SITUS_CONFIG } from "../Config/situsConfig";
import { cn } from "../lib/utils";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    sku?: string;
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
    waktu_bayar?: string;
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
    is_dropship?: boolean;
    dropship_pengirim?: string;
    dropship_telepon?: string;
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
    json_payload?: ShippingPayload | string;
}

interface OrderData {
    id?: string | number;
    nomor_pesanan: string;
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
    subtotal: number;
    ongkir: number;
    diskon?: number;
    kode_voucher?: string | null;
    poin_digunakan?: number;
    total: number;
    catatan?: string;
    created_at?: string;
    pembayaran?: PaymentDetail;
    pengiriman?: ShippingDetail;
    items?: OrderItem[];
    is_dropship?: boolean;
    dropship_pengirim?: string;
    dropship_telepon?: string;
    asuransiPengiriman?: boolean;
    asuransi_pengiriman?: boolean;
    biayaAsuransi?: number;
    biaya_asuransi?: number;
}

interface InvoiceProps {
    pesanan: OrderData;
    is_baru?: boolean;
    className?: string;
}

const FALLBACK_IMAGE = "/assets/gambar/banner-1.webp";

function normalizeMediaUrl(url?: string | null): string {
    if (!url) return FALLBACK_IMAGE;
    const clean = url.trim();
    if (
        clean.startsWith("http://") ||
        clean.startsWith("https://") ||
        clean.startsWith("data:")
    ) {
        return clean;
    }
    if (clean.startsWith("/storage/")) return clean;
    if (clean.startsWith("storage/")) return `/${clean}`;
    if (clean.startsWith("/")) return clean;
    return `/storage/${clean}`;
}

function formatTanggalIndo(dateStr?: string): string {
    if (!dateStr) return "-";
    try {
        const d = new Date(
            dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T"),
        );
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
        variant: "bg-amber-50 text-amber-900 border-amber-200/90 font-bold",
        iconColor: "text-amber-600",
    },
    menunggu_verifikasi_manual: {
        label: "Verifikasi Manual CS",
        icon: AlertCircle,
        variant: "bg-amber-100 text-amber-950 border-amber-300 font-bold",
        iconColor: "text-amber-700",
    },
    challenge: {
        label: "Tinjauan Keamanan",
        icon: ShieldAlert,
        variant: "bg-amber-100 text-amber-950 border-amber-300 font-bold",
        iconColor: "text-amber-700",
    },
    akan_dikirim: {
        label: "Diproses Penjual",
        icon: CheckCircle2,
        variant:
            "bg-emerald-50 text-emerald-900 border-emerald-200/90 font-bold",
        iconColor: "text-emerald-600",
    },
    dikirim: {
        label: "Dalam Pengiriman",
        icon: Truck,
        variant: "bg-indigo-50 text-indigo-900 border-indigo-200/90 font-bold",
        iconColor: "text-indigo-600",
    },
    selesai: {
        label: "Pesanan Selesai",
        icon: CheckCircle2,
        variant:
            "bg-emerald-50 text-emerald-900 border-emerald-200/90 font-bold",
        iconColor: "text-emerald-600",
    },
    dibatalkan: {
        label: "Pesanan Dibatalkan",
        icon: XCircle,
        variant: "bg-rose-50 text-rose-900 border-rose-200/90 font-bold",
        iconColor: "text-rose-600",
    },
    expired: {
        label: "Tagihan Kedaluwarsa",
        icon: XCircle,
        variant: "bg-slate-100 text-slate-700 border-slate-200 font-bold",
        iconColor: "text-slate-500",
    },
};

function StatusBadge({ status }: { status: string }) {
    const key = status?.toLowerCase().trim();
    const current = STATUS_CONFIG[key] ?? {
        label: status || "Status Tidak Diketahui",
        icon: AlertCircle,
        variant: "bg-slate-100 text-slate-700 border-slate-200 font-bold",
        iconColor: "text-slate-500",
    };

    const Icon = current.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border shadow-2xs select-none",
                current.variant,
            )}
        >
            <Icon
                className={cn(
                    "w-3.5 h-3.5 shrink-0 stroke-[2.2]",
                    current.iconColor,
                )}
                aria-hidden="true"
            />
            <span>{current.label}</span>
        </span>
    );
}

export default function Faktur({ pesanan, is_baru, className }: InvoiceProps) {
    const activeOrder = pesanan ?? ({} as OrderData);
    const pembayaran = activeOrder.pembayaran || {};
    const pengiriman = activeOrder.pengiriman || {};

    // Normalisasi gambar item pesanan
    const orderItems = useMemo<OrderItem[]>(() => {
        return (activeOrder.items || []).map((item) => ({
            ...item,
            gambar: normalizeMediaUrl(item.gambar),
        }));
    }, [activeOrder.items]);

    const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
    const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
    const [isChangePaymentOpen, setIsChangePaymentOpen] = useState(false);
    const [isRefreshingQris, setIsRefreshingQris] = useState(false);
    const [copiedInvoice, setCopiedInvoice] = useState(false);
    const [copiedTotal, setCopiedTotal] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    // Reset store keranjang & form checkout jika diarahkan dari pemesanan baru
    useEffect(() => {
        if (is_baru) {
            useKeranjangStore.getState().kosongkan();
            useCheckoutStore.getState().resetCheckoutState();
        }
    }, [is_baru]);

    const {
        status: statusPesanan,
        isChecking,
        cekStatusManual,
    } = usePaymentStatusPolling(
        activeOrder.nomor_pesanan || "",
        activeOrder.status || "belum_bayar",
        {
            intervalMs: 4000,
            autoReloadInertia: true,
            onSettled: (statusBaru) => {
                if (
                    ["akan_dikirim", "dikirim", "selesai"].includes(statusBaru)
                ) {
                    toast.success(
                        "Pembayaran berhasil diverifikasi! Pesanan Anda segera diproses.",
                    );
                }
            },
            onHold: (_statusBaru, pesan) => {
                toast.warning(
                    pesan ||
                        "Pembayaran Anda sedang dalam verifikasi manual tim CS.",
                );
            },
        },
    );

    const handleManualCheckStatus = useCallback(async () => {
        if (isChecking) return;
        await cekStatusManual();
    }, [isChecking, cekStatusManual]);

    const statusNormalized = (statusPesanan || "").toLowerCase();
    const isPendingPayment = statusNormalized === "belum_bayar";
    const isHoldManual = [
        "menunggu_verifikasi_manual",
        "challenge",
        "suspect_underpaid",
    ].includes(statusNormalized);
    const isSuccessSettled = ["akan_dikirim", "dikirim", "selesai"].includes(
        statusNormalized,
    );
    const isTerminated = ["dibatalkan", "expired"].includes(statusNormalized);

    const hasWaybill = Boolean(pengiriman.nomor_resi);

    const isQris = Boolean(
        pembayaran.qr_code_url ||
        pembayaran.qr_string ||
        pembayaran.metode_bayar?.toLowerCase().includes("qris"),
    );
    const isMandiriBill = Boolean(
        pembayaran.kode_biller ||
        pembayaran.metode_bayar?.toLowerCase().includes("mandiri"),
    );

    const batasWaktuPembayaran =
        pembayaran.waktu_kedaluwarsa || pembayaran.batas_waktu;

    // Normalisasi slug yang aman terhadap pembatasan server web
    const safeOrderSlug = useMemo(() => {
        return encodeURIComponent(
            (activeOrder.nomor_pesanan || "").replace(/[^a-zA-Z0-9-_]/g, "-"),
        );
    }, [activeOrder.nomor_pesanan]);

    // Sanitasi nomor telepon CS WhatsApp
    const cleanCsPhone = useMemo(() => {
        return (SITUS_CONFIG.whatsappCS || "").replace(/\D/g, "");
    }, []);

    const copyInvoiceId = async () => {
        try {
            await navigator.clipboard.writeText(activeOrder.nomor_pesanan);
            setCopiedInvoice(true);
            toast.success("Nomor pesanan berhasil disalin ke papan klip!");
            setTimeout(() => setCopiedInvoice(false), 2000);
        } catch {
            toast.error("Gagal menyalin nomor pesanan.");
        }
    };

    const copyTotalAmount = async () => {
        try {
            await navigator.clipboard.writeText(String(activeOrder.total));
            setCopiedTotal(true);
            toast.success("Nomor total tagihan berhasil disalin!");
            setTimeout(() => setCopiedTotal(false), 2000);
        } catch {
            toast.error("Gagal menyalin nominal tagihan.");
        }
    };

    const handleRefreshQris = () => {
        if (isRefreshingQris || !safeOrderSlug) return;
        setIsRefreshingQris(true);
        router.post(
            `/faktur/${safeOrderSlug}/refresh-qris`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Kode QRIS berhasil diperbarui!");
                    setIsRefreshingQris(false);
                },
                onError: (err) => {
                    toast.error(
                        typeof err === "string"
                            ? err
                            : "Gagal memperbarui QRIS.",
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
            `/faktur/${safeOrderSlug}/ganti-metode-bayar`,
            { metode_pembayaran: metode.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.dismiss(toastId);
                    toast.success(
                        `Metode pembayaran berhasil diubah ke ${metode.nama}!`,
                    );
                },
                onError: (err) => {
                    toast.dismiss(toastId);
                    toast.error(
                        typeof err === "string"
                            ? err
                            : "Gagal mengubah saluran pembayaran.",
                    );
                },
            },
        );
    };

    // Safe parser untuk json_payload pengiriman
    const parsedPayload = useMemo<ShippingPayload>(() => {
        const raw = pengiriman.json_payload;
        if (!raw) return {};
        if (typeof raw === "object") return raw;
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }, [pengiriman.json_payload]);

    const recipientName =
        parsedPayload.nama_penerima || pengiriman.penerima || "Pelanggan CRSL";
    const recipientPhone = parsedPayload.telepon || pengiriman.telepon || "";
    const recipientAddress =
        parsedPayload.alamat_lengkap || pengiriman.alamat_lengkap || "";
    const currentNotes = activeOrder.catatan || parsedPayload.catatan || "";

    const lockedRegionText = useMemo(() => {
        return [
            parsedPayload.kecamatan,
            parsedPayload.kota,
            parsedPayload.provinsi,
            parsedPayload.kode_pos,
        ]
            .filter(Boolean)
            .join(", ");
    }, [parsedPayload]);

    const isInsuranceActive = Boolean(
        activeOrder.asuransiPengiriman || activeOrder.asuransi_pengiriman,
    );
    const insuranceAmount = Number(
        activeOrder.biayaAsuransi || activeOrder.biaya_asuransi || 0,
    );

    return (
        <StorefrontLayout>
            <Head
                title={`Faktur #${activeOrder.nomor_pesanan || ""} - CRSL Official Store`}
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

            <div className={cn("print:hidden select-none", className)}>
                {/* Header Faktur */}
                <header className="bg-white border-b border-slate-200/90 py-4 sm:py-5 shadow-2xs">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3 sm:space-y-4">
                        <div>
                            <Link
                                href="/katalog"
                                className="group inline-flex items-center gap-1.5 -ml-1 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 ease-out group-hover:-translate-x-0.5 stroke-[2.2]" />
                                <span>Kembali ke Belanja</span>
                            </Link>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                    <span className="font-bold text-slate-800">
                                        Faktur Tagihan
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

                                <div className="flex items-center gap-2 min-w-0">
                                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 font-mono break-all sm:break-normal">
                                        <span className="text-[#E52027] select-none">
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
                                        className={cn(
                                            "inline-flex items-center justify-center p-1.5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] shrink-0 cursor-pointer shadow-2xs",
                                            copiedInvoice
                                                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300"
                                                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
                                        )}
                                    >
                                        {copiedInvoice ? (
                                            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                                        ) : (
                                            <Copy className="w-4 h-4 stroke-[2]" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                                <StatusBadge status={statusPesanan} />

                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="group inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-2xl shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 stroke-[2.2]" />
                                    <span>Cetak Faktur</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Konten Utama */}
                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        {/* Kolom Kiri: Panduan & Status Transaksi */}
                        <div className="lg:col-span-7 space-y-5">
                            {/* State 1: Verifikasi Manual CS */}
                            {isHoldManual && (
                                <section className="bg-amber-50/90 border border-amber-300 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
                                                Pembayaran Dalam Tinjauan Tim CS
                                            </h2>
                                            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                                                Sistem mendeteksi transaksi
                                                memerlukan peninjauan manual
                                                (seperti selisih nominal unik
                                                transfer). Dana Anda aman dan
                                                pesanan sedang diperiksa
                                                langsung oleh tim CS resmi kami.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-1 flex flex-wrap gap-2.5">
                                        <a
                                            href={`https://wa.me/${cleanCsPhone}?text=${encodeURIComponent(
                                                `Halo Tim CS CRSL, saya ingin konfirmasi pembayaran pesanan: #${activeOrder.nomor_pesanan}`,
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer active:scale-95"
                                        >
                                            <MessageCircle className="w-4 h-4 stroke-[2.2]" />
                                            <span>
                                                Kirim Bukti Transfer via
                                                WhatsApp
                                            </span>
                                        </a>

                                        <button
                                            type="button"
                                            onClick={handleManualCheckStatus}
                                            disabled={isChecking}
                                            className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-950 text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                                        >
                                            <RefreshCw
                                                className={cn(
                                                    "w-3.5 h-3.5 stroke-[2.2]",
                                                    isChecking &&
                                                        "animate-spin",
                                                )}
                                            />
                                            <span>
                                                {isChecking
                                                    ? "Memeriksa..."
                                                    : "Periksa Ulang Status"}
                                            </span>
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* State 2: Lunas & Terverifikasi */}
                            {isSuccessSettled && (
                                <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xs">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                            {hasWaybill ? (
                                                <PackageCheck className="w-5 h-5 stroke-[2.2]" />
                                            ) : (
                                                <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
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
                                                        Pesanan Anda telah
                                                        disiapkan oleh tim
                                                        logistik dan nomor resi
                                                        ekspedisi{" "}
                                                        <strong className="font-black text-emerald-950 uppercase font-mono">
                                                            {pengiriman.kurir}
                                                        </strong>{" "}
                                                        telah aktif. Pantau
                                                        pergerakan pengiriman
                                                        paket Anda secara
                                                        real-time.
                                                    </>
                                                ) : (
                                                    "Pesanan Anda sedang dipersiapkan oleh tim gudang CRSL Official. Nomor resi pengiriman akan terbit otomatis saat paket diserahkan ke kurir."
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-1 flex flex-wrap gap-2.5">
                                        <Link
                                            href={`/lacak?nomor=${encodeURIComponent(activeOrder.nomor_pesanan || "")}`}
                                            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-xs active:scale-95"
                                        >
                                            <Truck className="w-4 h-4 stroke-[2.2]" />
                                            <span>Lacak Pengiriman</span>
                                        </Link>
                                        <Link
                                            href="/katalog"
                                            className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-2xs active:scale-95"
                                        >
                                            <ShoppingBag className="w-4 h-4 text-emerald-700 stroke-[2.2]" />
                                            <span>Belanja Lagi</span>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* State 3: Menunggu Pembayaran Aktif */}
                            {isPendingPayment && (
                                <section className="bg-white border border-slate-200/90 rounded-3xl shadow-2xs overflow-hidden">
                                    <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/70">
                                        <div className="space-y-1">
                                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                <CreditCard className="w-4 h-4 text-slate-500 stroke-[2.2]" />
                                                <span>
                                                    {pembayaran.metode_bayar ||
                                                        "Saluran Pembayaran"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
                                                    {formatRupiah(
                                                        activeOrder.total,
                                                    )}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={copyTotalAmount}
                                                    aria-label="Salin nominal total pembayaran"
                                                    className="text-xs text-slate-600 hover:text-slate-900 font-bold inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer"
                                                >
                                                    {copiedTotal ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                                                            <span className="text-emerald-700">
                                                                Tersalin
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
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
                                                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs cursor-pointer active:scale-95"
                                            >
                                                <RefreshCw
                                                    className={cn(
                                                        "w-3.5 h-3.5 stroke-[2.2]",
                                                        isChecking &&
                                                            "animate-spin",
                                                    )}
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
                                        <div className="px-5 sm:px-6 py-3 bg-amber-50/80 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                                            <div className="flex items-center gap-2 text-amber-950 font-medium">
                                                <Clock className="w-4 h-4 text-amber-600 shrink-0 stroke-[2.2]" />
                                                <p>
                                                    Masa aktif kode QRIS adalah{" "}
                                                    <strong className="font-bold font-mono">
                                                        15 Menit
                                                    </strong>
                                                    . Perbarui barcode jika
                                                    waktu habis tanpa
                                                    membatalkan order.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRefreshQris}
                                                disabled={isRefreshingQris}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 bg-amber-200/70 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                                            >
                                                <RotateCcw
                                                    className={cn(
                                                        "w-3.5 h-3.5 stroke-[2.2]",
                                                        isRefreshingQris &&
                                                            "animate-spin",
                                                    )}
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
                                                isDevMode={Boolean(
                                                    import.meta.env.DEV,
                                                )}
                                                onRefreshQris={
                                                    handleRefreshQris
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
                                                isDevMode={Boolean(
                                                    import.meta.env.DEV,
                                                )}
                                                onRefreshVa={
                                                    handleManualCheckStatus
                                                }
                                            />
                                        )}

                                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsChangePaymentOpen(true)
                                                }
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-2xl transition-colors cursor-pointer shadow-2xs active:scale-95"
                                            >
                                                <CreditCard className="w-4 h-4 text-slate-500 stroke-[2.2]" />
                                                <span>
                                                    Ganti Metode Pembayaran
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsCancelOrderOpen(true)
                                                }
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2.5 rounded-2xl transition-colors cursor-pointer active:scale-95"
                                            >
                                                <XCircle className="w-4 h-4 stroke-[2.2]" />
                                                <span>Batalkan Pesanan</span>
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* State 4: Pesanan Selesai / Batal / Expired */}
                            {isTerminated && (
                                <section className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-2xs">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 shadow-2xs">
                                            <XCircle className="w-5 h-5 stroke-[2.2]" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                                Pesanan Ini Telah Berakhir
                                            </h2>
                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                                Faktur ini berstatus{" "}
                                                <strong className="text-slate-900 font-bold">
                                                    {statusNormalized ===
                                                    "dibatalkan"
                                                        ? "Dibatalkan"
                                                        : "Kedaluwarsa"}
                                                </strong>
                                                . Tagihan pembayaran tidak lagi
                                                aktif dan pesanan tidak diproses
                                                lebih lanjut.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-1">
                                        <Link
                                            href="/katalog"
                                            className="inline-flex items-center gap-2 bg-[#E52027] hover:bg-[#CC1C22] text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition-all shadow-xs active:scale-95"
                                        >
                                            <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                                            <span>Buat Pesanan Baru</span>
                                        </Link>
                                    </div>
                                </section>
                            )}

                            {/* Banner Customer Service Adaptif */}
                            <aside
                                aria-label="Bantuan Layanan Pelanggan"
                                className="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600 shadow-2xs"
                            >
                                <div className="flex items-start sm:items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center shrink-0 shadow-2xs">
                                        <HelpCircle
                                            className="w-5 h-5 text-[#E52027] stroke-[2.2]"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="font-black text-slate-900 text-xs sm:text-sm">
                                            {isSuccessSettled
                                                ? "Ada Pertanyaan Mengenai Pesanan Anda?"
                                                : "Mengalami Kendala Pembayaran?"}
                                        </p>
                                        <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                                            {isSuccessSettled
                                                ? "Tim CS dan logistik resmi CRSL siap membantu pengecekan paket dan resi."
                                                : "Tim Customer Service siap membantu konfirmasi status pembayaran Anda."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-200/60 sm:border-0 shrink-0">
                                    {isPendingPayment && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsTermsModalOpen(true)
                                            }
                                            className="text-slate-500 hover:text-slate-900 font-bold text-[11px] underline-offset-4 hover:underline rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer"
                                        >
                                            S&amp;K Pembayaran
                                        </button>
                                    )}

                                    <a
                                        href={`https://wa.me/${cleanCsPhone}?text=${encodeURIComponent(
                                            `Halo Tim CS CRSL, saya butuh bantuan terkait faktur pesanan #${activeOrder.nomor_pesanan}`,
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 cursor-pointer active:scale-95"
                                    >
                                        <span>Chat CS WhatsApp</span>
                                        <ExternalLink
                                            className="w-3.5 h-3.5 stroke-[2.5]"
                                            aria-hidden="true"
                                        />
                                    </a>
                                </div>
                            </aside>
                        </div>

                        {/* Kolom Kanan: Rincian Tagihan & Pengiriman */}
                        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
                            <RincianFaktur
                                nomorPesanan={activeOrder.nomor_pesanan}
                                status={statusPesanan}
                                items={orderItems}
                                subtotal={activeOrder.subtotal}
                                ongkir={activeOrder.ongkir}
                                diskon={activeOrder.diskon}
                                total={activeOrder.total}
                                kodeVoucher={activeOrder.kode_voucher}
                                poinDigunakan={activeOrder.poin_digunakan}
                                pengiriman={pengiriman}
                                isDropship={activeOrder.is_dropship}
                                dropshipPengirim={activeOrder.dropship_pengirim}
                                dropshipTelepon={activeOrder.dropship_telepon}
                                asuransiPengiriman={isInsuranceActive}
                                biayaAsuransi={insuranceAmount}
                                formatRupiah={formatRupiah}
                                onOpenEditRecipient={() =>
                                    setIsEditAddressOpen(true)
                                }
                            />
                        </div>
                    </div>
                </main>

                {/* Modals Terintegrasi */}
                <ModalUbahAlamat
                    isOpen={isEditAddressOpen}
                    onClose={() => setIsEditAddressOpen(false)}
                    nomorPesanan={activeOrder.nomor_pesanan}
                    namaPenerimaDefault={recipientName}
                    teleponDefault={recipientPhone}
                    alamatLengkapDefault={recipientAddress}
                    catatanDefault={currentNotes}
                    wilayahTerkunci={lockedRegionText}
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

                {/* Modal Syarat & Ketentuan Pembayaran Headless UI WAI-ARIA */}
                <Transition show={isTermsModalOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        id="modal-terms-pembayaran"
                        className="relative z-50 select-none"
                        onClose={() => setIsTermsModalOpen(false)}
                    >
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                        </TransitionChild>

                        <div className="fixed inset-0 z-10 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-out duration-200"
                                    enterFrom="opacity-0 scale-95 -translate-y-2"
                                    enterTo="opacity-100 scale-100 translate-y-0"
                                    leave="ease-in duration-150"
                                    leaveFrom="opacity-100 scale-100 translate-y-0"
                                    leaveTo="opacity-0 scale-95 -translate-y-2"
                                >
                                    <DialogPanel className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 text-left transition-all space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#E52027] border border-red-100 flex items-center justify-center shrink-0">
                                                    <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
                                                </div>
                                                <DialogTitle
                                                    as="h3"
                                                    className="font-black text-sm sm:text-base text-slate-900 tracking-tight"
                                                >
                                                    Syarat &amp; Ketentuan
                                                    Pembayaran
                                                </DialogTitle>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsTermsModalOpen(false)
                                                }
                                                aria-label="Tutup jendela syarat dan ketentuan"
                                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                            >
                                                <X className="w-4 h-4 stroke-[2.2]" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1 no-scrollbar font-medium">
                                            <p>
                                                1. Pesanan yang belum
                                                diselesaikan dicadangkan selama{" "}
                                                <strong className="text-slate-900 font-bold font-mono">
                                                    24 jam
                                                </strong>{" "}
                                                sejak faktur terbit.
                                            </p>
                                            <p>
                                                2. Khusus metode{" "}
                                                <strong className="text-slate-900 font-bold">
                                                    QRIS
                                                </strong>
                                                , masa aktif pindai adalah{" "}
                                                <strong className="text-slate-900 font-bold font-mono">
                                                    15 menit
                                                </strong>
                                                . Anda dapat memperbarui kode
                                                jika waktu habis tanpa
                                                membatalkan order.
                                            </p>
                                            <p>
                                                3. Penggantian metode pembayaran
                                                dapat dilakukan kapan saja
                                                sebelum transaksi berstatus
                                                lunas.
                                            </p>
                                            <p>
                                                4. Jika pesanan dibatalkan,
                                                kuota voucher diskon dan Koin
                                                Loyalitas otomatis dikembalikan
                                                ke akun Anda.
                                            </p>
                                            <p>
                                                5. Pesanan yang sudah lunas
                                                langsung dialokasikan ke antrean
                                                gudang dan tidak dapat
                                                dibatalkan sepihak.
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsTermsModalOpen(false)
                                                }
                                                className="w-full bg-[#E52027] hover:bg-[#CC1C22] text-white font-bold py-2.5 rounded-2xl transition-all text-xs shadow-md shadow-red-500/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer"
                                            >
                                                Saya Mengerti
                                            </button>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </StorefrontLayout>
    );
}
