import {
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../Layouts/StorefrontLayout";
import { usePaymentStatusPolling } from "../Hooks/usePaymentStatusPolling";
import { useKeranjangStore } from "../Stores/useKeranjangStore";
import { useCheckoutStore } from "../Stores/useCheckoutStore";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import FakturHeader from "../Components/Faktur/FakturHeader";
import FakturStatusBanner from "../Components/Faktur/FakturStatusBanner";
import FakturPaymentDetails from "../Components/Faktur/FakturPaymentDetails";
import FakturSupportBanner from "../Components/Faktur/FakturSupportBanner";
import ModalTermsPembayaran from "../Components/Faktur/ModalTermsPembayaran";
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
    pesanan?: OrderData | null;
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

export default function Faktur({ pesanan, is_baru, className }: InvoiceProps) {
    if (!pesanan || !pesanan.nomor_pesanan) {
        return (
            <StorefrontLayout>
                <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 select-none">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
                    <h1 className="text-xl font-bold text-slate-800">
                        Faktur Tidak Ditemukan
                    </h1>
                    <p className="text-sm text-slate-600">
                        Pesanan yang Anda cari tidak tersedia atau nomor pesanan tidak valid.
                    </p>
                    <Link
                        href="/katalog"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all"
                    >
                        Kembali ke Belanja
                    </Link>
                </div>
            </StorefrontLayout>
        );
    }

    const activeOrder = pesanan;
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
                <FakturHeader
                    nomorPesanan={activeOrder.nomor_pesanan}
                    createdAt={activeOrder.created_at}
                    status={statusPesanan}
                    copiedInvoice={copiedInvoice}
                    onCopyInvoice={copyInvoiceId}
                    onPrint={() => window.print()}
                    formatTanggalIndo={formatTanggalIndo}
                />

                {/* Konten Utama */}
                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        {/* Kolom Kiri: Status & Instruksi Pembayaran */}
                        <div className="lg:col-span-7 space-y-5">
                            {/* Banner Status Transaksi */}
                            <FakturStatusBanner
                                statusNormalized={statusNormalized}
                                isHoldManual={isHoldManual}
                                isSuccessSettled={isSuccessSettled}
                                isTerminated={isTerminated}
                                hasWaybill={hasWaybill}
                                courierName={pengiriman.kurir}
                                nomorPesanan={activeOrder.nomor_pesanan}
                                cleanCsPhone={cleanCsPhone}
                                isChecking={isChecking}
                                onManualCheckStatus={handleManualCheckStatus}
                            />

                            {/* Kotak Instruksi Pembayaran Aktif */}
                            {isPendingPayment && (
                                <FakturPaymentDetails
                                    pembayaran={pembayaran}
                                    activeOrder={activeOrder}
                                    isQris={isQris}
                                    isMandiriBill={isMandiriBill}
                                    isChecking={isChecking}
                                    isRefreshingQris={isRefreshingQris}
                                    copiedTotal={copiedTotal}
                                    batasWaktuPembayaran={batasWaktuPembayaran}
                                    onCopyTotal={copyTotalAmount}
                                    onManualCheckStatus={handleManualCheckStatus}
                                    onRefreshQris={handleRefreshQris}
                                    onChangePayment={() => setIsChangePaymentOpen(true)}
                                    onCancelOrder={() => setIsCancelOrderOpen(true)}
                                    formatRupiah={formatRupiah}
                                />
                            )}

                            {/* Banner Customer Service */}
                            <FakturSupportBanner
                                isSuccessSettled={isSuccessSettled}
                                isPendingPayment={isPendingPayment}
                                nomorPesanan={activeOrder.nomor_pesanan}
                                cleanCsPhone={cleanCsPhone}
                                onOpenTerms={() => setIsTermsModalOpen(true)}
                            />
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

                <ModalTermsPembayaran
                    isOpen={isTermsModalOpen}
                    onClose={() => setIsTermsModalOpen(false)}
                />
            </div>
        </StorefrontLayout>
    );
}
