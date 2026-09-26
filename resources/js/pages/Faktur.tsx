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
    AlertCircle,
    PackageCheck,
    ReceiptText,
    CreditCard,
    Copy,
    Check,
    ArrowLeft,
    RotateCcw,
    HelpCircle,
    FileText,
    ShieldCheck,
    ExternalLink,
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

function StatusBadge({ status }: { status: string }) {
    switch (status?.toLowerCase()) {
        case "belum_bayar":
            return (
                <span className="bg-amber-50 text-amber-800 border border-amber-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Menunggu Pembayaran
                </span>
            );
        case "akan_dikirim":
            return (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Sudah Bayar / Diproses
                </span>
            );
        case "dikirim":
            return (
                <span className="bg-indigo-50 text-indigo-800 border border-indigo-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    Dalam Pengiriman
                </span>
            );
        case "selesai":
            return (
                <span className="bg-blue-50 text-blue-800 border border-blue-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                    Selesai
                </span>
            );
        case "dibatalkan":
        case "expired":
            return (
                <span className="bg-rose-50 text-rose-800 border border-rose-200/90 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Pesanan Dibatalkan / Kedaluwarsa
                </span>
            );
        default:
            return (
                <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-xs inline-flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {status || "Unknown"}
                </span>
            );
    }
}

export default function Faktur({ pesanan, is_baru }: InvoiceProps) {
    const activeOrder = useMemo(() => pesanan || ({} as OrderData), [pesanan]);
    const pembayaran = activeOrder.pembayaran || {};
    const pengiriman = activeOrder.pengiriman || {};
    const orderItems = activeOrder.items || [];

    // State Modals
    const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
    const [isCancelOrderOpen, setIsCancelOrderOpen] = useState(false);
    const [isChangePaymentOpen, setIsChangePaymentOpen] = useState(false);
    const [isRefreshingQris, setIsRefreshingQris] = useState(false);
    const [copiedInvoice, setCopiedInvoice] = useState(false);
    const [copiedTotal, setCopiedTotal] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    // Auto-clean keranjang dan checkout state jika pesanan baru
    useEffect(() => {
        if (is_baru) {
            useKeranjangStore.getState().kosongkan();
            useCheckoutStore.getState().resetCheckoutState();
        }
    }, [is_baru]);

    // Polling status pembayaran realtime via usePaymentStatusPolling
    const {
        status: statusPesanan,
        isSettled,
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
                        "🎉 Pembayaran terverifikasi! Pesanan Anda segera disiapkan.",
                        { duration: 5000 },
                    );
                }
            },
        },
    );

    const handleManualCheckStatus = useCallback(async () => {
        if (isChecking) return;
        await cekStatusManual();
    }, [isChecking, cekStatusManual]);

    const isPendingPayment = statusPesanan === "belum_bayar";
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

    // Batas waktu pesanan otomatis batal (24 jam dari created_at)
    const batasWaktuOrder24Jam = useMemo(() => {
        if (!activeOrder.created_at) return undefined;
        const d = new Date(activeOrder.created_at);
        d.setHours(d.getHours() + 24);
        return d.toISOString();
    }, [activeOrder.created_at]);

    // Copy handlers
    const copyInvoiceId = () => {
        navigator.clipboard.writeText(activeOrder.nomor_pesanan);
        setCopiedInvoice(true);
        toast.success("Nomor Pesanan berhasil disalin!");
        setTimeout(() => setCopiedInvoice(false), 2000);
    };

    const copyTotalAmount = () => {
        navigator.clipboard.writeText(String(activeOrder.total));
        setCopiedTotal(true);
        toast.success("Total Nominal berhasil disalin!");
        setTimeout(() => setCopiedTotal(false), 2000);
    };

    // Handler refresh QRIS
    const handleRefreshQris = () => {
        if (isRefreshingQris) return;
        setIsRefreshingQris(true);
        router.post(
            `/faktur/${encodeURIComponent(activeOrder.nomor_pesanan)}/refresh-qris`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Kode QRIS baru berhasil diperbarui!");
                    setIsRefreshingQris(false);
                },
                onError: (err) => {
                    toast.error(
                        typeof err === "string"
                            ? err
                            : "Gagal memperbarui QRIS. Silakan coba lagi.",
                    );
                    setIsRefreshingQris(false);
                },
            },
        );
    };

    // Handler konfirmasi ganti metode pembayaran
    const handleConfirmChangePayment = (metode: PaymentOption) => {
        setIsChangePaymentOpen(false);
        const toastId = toast.loading("Memperbarui metode pembayaran ke Midtrans...");

        router.post(
            `/faktur/${encodeURIComponent(activeOrder.nomor_pesanan)}/ganti-metode-bayar`,
            {
                metode_pembayaran: metode.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.dismiss(toastId);
                    toast.success(`Metode pembayaran berhasil diubah ke ${metode.name}!`);
                },
                onError: (err) => {
                    toast.dismiss(toastId);
                    toast.error(
                        typeof err === "string"
                            ? err
                            : "Gagal mengubah metode pembayaran. Silakan coba lagi.",
                    );
                },
            },
        );
    };

    // Data alamat untuk modal ubah alamat
    const recipientName =
        pengiriman.json_payload?.nama_penerima ||
        pengiriman.penerima ||
        "Pelanggan";
    const recipientPhone =
        pengiriman.json_payload?.telepon || pengiriman.telepon || "";
    const recipientAddress =
        pengiriman.json_payload?.alamat_lengkap ||
        pengiriman.alamat_lengkap ||
        "";
    const currentNotes =
        activeOrder.catatan || pengiriman.json_payload?.catatan || "";

    return (
        <StorefrontLayout>
            <Head
                title={`Faktur #${activeOrder.nomor_pesanan || ""} - CRSL Store`}
            />

            {/* Header Tindakan (Web & Cetak) */}
            <header className="bg-white border-b border-slate-200/80 py-6 print:py-2">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest inline-flex items-center gap-1">
                                <ReceiptText className="w-3.5 h-3.5 text-primary" />{" "}
                                Faktur Pesanan Resmi
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] font-mono text-slate-500">
                                {activeOrder.created_at || "Hari ini"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                #{activeOrder.nomor_pesanan}
                            </h1>
                            <button
                                type="button"
                                onClick={copyInvoiceId}
                                title="Salin nomor pesanan"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                                {copiedInvoice ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end print:hidden">
                        <StatusBadge status={statusPesanan} />
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            Cetak Faktur
                        </button>
                    </div>
                </div>
            </header>

            {/* Konten Utama 2 Kolom */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 print:py-4 print:px-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* KOLOM KIRI (7 Kolom): Status, Aksi Pembayaran & Progres */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Banner Pelunasan */}
                        {isSettled &&
                            statusPesanan !== "dibatalkan" &&
                            statusPesanan !== "expired" && (
                                <div className="bg-emerald-50/90 border border-emerald-200 p-6 rounded-3xl shadow-2xs space-y-4 print:hidden">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h2 className="font-black text-lg text-emerald-950 tracking-tight">
                                                Pembayaran Sukses Diverifikasi!
                                            </h2>
                                            <p className="text-xs text-emerald-800 leading-relaxed">
                                                Pesanan Anda sedang dikemas dan
                                                disiapkan oleh tim logistik CRSL
                                                Store. Resi pengiriman otomatis
                                                aktif setelah kurir melakukan
                                                pick-up.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-2 flex flex-wrap gap-2.5">
                                        <Link
                                            href={`/lacak?nomor=${encodeURIComponent(activeOrder.nomor_pesanan || "")}`}
                                            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
                                        >
                                            <Truck className="w-3.5 h-3.5" />
                                            Lacak Pengiriman
                                        </Link>
                                        <Link
                                            href="/katalog"
                                            className="inline-flex items-center gap-1.5 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                                            Belanja Lagi
                                        </Link>
                                    </div>
                                </div>
                            )}

                        {/* Modul Instruksi Pembayaran (Hanya tampil jika belum lunas) */}
                        {isPendingPayment && (
                            <section className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden print:hidden">
                                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
                                    <div className="space-y-1">
                                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                                            <CreditCard className="w-4 h-4" />
                                            {pembayaran.metode_bayar ||
                                                "Midtrans Core API"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xl font-black text-slate-900">
                                                {formatRupiah(activeOrder.total)}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={copyTotalAmount}
                                                className="text-[11px] text-primary hover:text-primary-hover font-bold inline-flex items-center gap-1 ml-1"
                                            >
                                                {copiedTotal ? (
                                                    <Check className="w-3 h-3 text-emerald-600" />
                                                ) : (
                                                    <Copy className="w-3 h-3" />
                                                )}
                                                <span>{copiedTotal ? "Tersalin" : "Salin"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                        <HitungMundurKedaluwarsa
                                            batasWaktu={batasWaktuPembayaran}
                                            createdAt={activeOrder.created_at}
                                            onExpired={handleManualCheckStatus}
                                        />

                                        <button
                                            type="button"
                                            onClick={handleManualCheckStatus}
                                            disabled={isChecking}
                                            className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                                        >
                                            <RefreshCw
                                                className={`w-3.5 h-3.5 text-slate-500 ${isChecking ? "animate-spin" : ""}`}
                                            />
                                            {isChecking
                                                ? "Memeriksa..."
                                                : "Cek Status"}
                                        </button>
                                    </div>
                                </div>

                                {/* Dual Countdown Alert Banner (Order Expiry 24h vs QRIS Expiry 15m) */}
                                {isQris && (
                                    <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-amber-900">
                                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span>
                                                Masa aktif QR Code <strong>15 Menit</strong>. Pesanan dibatalkan otomatis jika belum lunas dalam <strong>24 Jam</strong>.
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRefreshQris}
                                            disabled={isRefreshingQris}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            <RotateCcw className={`w-3.5 h-3.5 ${isRefreshingQris ? "animate-spin" : ""}`} />
                                            <span>{isRefreshingQris ? "Memperbarui..." : "Perbarui QRIS"}</span>
                                        </button>
                                    </div>
                                )}

                                <div className="p-6 space-y-6">
                                    {isQris && (
                                        <InstruksiQris
                                            qrCodeUrl={pembayaran.qr_code_url}
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
                                            kodeBiller={pembayaran.kode_biller}
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
                                        />
                                    )}

                                    {/* Action Buttons: Ganti Metode Bayar & Batalkan Pesanan */}
                                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsChangePaymentOpen(true)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                                        >
                                            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                            <span>Ganti Metode Pembayaran</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsCancelOrderOpen(true)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            <span>Batalkan Pesanan</span>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Banner Bantuan & Info Layanan */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600 print:hidden">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-primary shadow-2xs">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Mengalami Kendala Pembayaran?</p>
                                    <p className="text-slate-500 text-[11px]">Tim Customer Service CRSL siap membantu via WhatsApp Official.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href="https://wa.me/6281234567890?text=Halo%20CRSL%2C%20saya%20butuh%20bantuan%20terkait%20pesanan%20"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                                >
                                    <span>Chat CS WhatsApp</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setIsTermsModalOpen(true)}
                                    className="text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 text-[11px]"
                                >
                                    S&K Pembayaran
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN (5 Kolom): Rincian Pengiriman & Item */}
                    <div className="lg:col-span-5">
                        <RincianFaktur
                            items={orderItems}
                            subtotal={activeOrder.subtotal}
                            ongkir={activeOrder.ongkir}
                            diskon={activeOrder.diskon}
                            total={activeOrder.total}
                            pengiriman={pengiriman}
                            isDropship={activeOrder.is_dropship}
                            dropshipPengirim={activeOrder.dropship_pengirim}
                            dropshipTelepon={activeOrder.dropship_telepon}
                            asuransiPengiriman={activeOrder.asuransi_pengiriman}
                            biayaAsuransi={activeOrder.biaya_asuransi}
                            formatRupiah={formatRupiah}
                            canEditAddress={isPendingPayment}
                            onOpenEditRecipient={() => setIsEditAddressOpen(true)}
                        />
                    </div>
                </div>
            </main>

            {/* Modal Edit Alamat Penerima */}
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

            {/* Modal Batalkan Pesanan */}
            <ModalBatalPesanan
                isOpen={isCancelOrderOpen}
                onClose={() => setIsCancelOrderOpen(false)}
                nomorPesanan={activeOrder.nomor_pesanan}
                total={activeOrder.total}
                onSuccess={() => {
                    router.reload({ only: ["pesanan"] });
                }}
            />

            {/* Modal Ganti Metode Pembayaran */}
            <PaymentSelectModal
                isOpen={isChangePaymentOpen}
                onClose={() => setIsChangePaymentOpen(false)}
                selectedPaymentId={pembayaran.metode_bayar?.toLowerCase() || "qris"}
                onConfirmPayment={handleConfirmChangePayment}
            />

            {/* Modal Syarat & Ketentuan Pembayaran */}
            {isTermsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Syarat & Ketentuan Pembayaran CRSL
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsTermsModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-80 overflow-y-auto pr-1">
                            <p>
                                1. Pesanan yang belum dibayar akan dicadangkan selama <strong>24 jam</strong> sejak pembuatan faktur.
                            </p>
                            <p>
                                2. Khusus metode <strong>QRIS</strong>, QR Code berlaku selama <strong>15 menit</strong>. Anda dapat menekan tombol <em>"Perbarui QRIS"</em> jika QR Code kedaluwarsa tanpa membatalkan nomor pesanan.
                            </p>
                            <p>
                                3. Penggantian metode pembayaran dapat dilakukan kapan saja selama pesanan belum lunas melalui tombol <em>"Ganti Metode Pembayaran"</em>.
                            </p>
                            <p>
                                4. Jika pesanan dibatalkan, kuota voucher dan saldo loyalty point yang terpakai akan dikembalikan secara otomatis ke akun Anda.
                            </p>
                            <p>
                                5. Pesanan yang sudah lunas tidak dapat dibatalkan secara sepihak dan langsung diteruskan ke proses packing logistik.
                            </p>
                        </div>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setIsTermsModalOpen(false)}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-xs"
                            >
                                Saya Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </StorefrontLayout>
    );
}
