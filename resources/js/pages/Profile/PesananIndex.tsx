import { useMemo, useState, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import StorefrontLayout from "../../Layouts/StorefrontLayout";
import {
    ArrowRight,
    Download,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    CreditCard,
    AlertCircle,
    Loader2,
    ShoppingBag,
    Package,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "../../Utils/formatters";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    gambar?: string | null;
}

interface Order {
    id: string | number;
    nomor_pesanan: string;
    status:
        | "belum_bayar"
        | "akan_dikirim"
        | "menunggu_verifikasi_manual"
        | "challenge"
        | "dikirim"
        | "selesai"
        | "dibatalkan"
        | "expired"
        | string;
    subtotal: number;
    ongkir: number;
    diskon: number;
    total: number;
    created_at: string;
    snap_token?: string | null;
    items?: OrderItem[];
    pengiriman?: {
        kurir: string;
        layanan: string;
        nomor_resi?: string;
    };
    pembayaran?: {
        metode_bayar: string;
        midtrans_status?: string;
    };
}

interface PesananIndexProps {
    pesanan: {
        data: Order[];
    };
}

const FALLBACK_IMAGE = "/assets/gambar/banner-1.webp";

/** Helper URL slug yang aman dari pemotongan path Nginx/Apache */
const getSafeOrderSlug = (orderNumber: string): string => {
    return encodeURIComponent(orderNumber.replace(/[^a-zA-Z0-9-_]/g, "-"));
};

/** Normalisasi path URL media */
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

function formatTanggal(tanggalString: string): string {
    if (!tanggalString) return "-";
    try {
        const normalized = tanggalString.includes("T")
            ? tanggalString
            : tanggalString.replace(" ", "T");
        const date = new Date(normalized);
        if (isNaN(date.getTime())) return tanggalString;
        return (
            date.toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }) + " WIB"
        );
    } catch {
        return tanggalString;
    }
}

function StatusBadge({ status }: { status: string }) {
    const raw = (status || "").toLowerCase().trim();

    switch (raw) {
        case "belum_bayar":
            return (
                <span className="bg-amber-50 text-amber-900 border border-amber-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Menunggu Pembayaran
                </span>
            );
        case "menunggu_verifikasi_manual":
        case "challenge":
            return (
                <span className="bg-amber-100 text-amber-950 border border-amber-300 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    Verifikasi CS
                </span>
            );
        case "akan_dikirim":
            return (
                <span className="bg-emerald-50 text-emerald-900 border border-emerald-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Diproses Penjual
                </span>
            );
        case "dikirim":
            return (
                <span className="bg-indigo-50 text-indigo-900 border border-indigo-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    Dalam Pengiriman
                </span>
            );
        case "selesai":
            return (
                <span className="bg-blue-50 text-blue-900 border border-blue-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Selesai
                </span>
            );
        case "dibatalkan":
        case "expired":
            return (
                <span className="bg-rose-50 text-rose-900 border border-rose-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    {raw === "expired" ? "Kedaluwarsa" : "Dibatalkan"}
                </span>
            );
        default:
            return (
                <span className="bg-slate-100 text-slate-700 border border-slate-200 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {status}
                </span>
            );
    }
}

export default function PesananIndex({ pesanan }: PesananIndexProps) {
    const ordersList = useMemo(() => pesanan?.data || [], [pesanan]);
    const [processingOrderNumber, setProcessingOrderNumber] = useState<
        string | null
    >(null);

    const handleConfirmOrder = useCallback((orderNumber: string) => {
        if (
            !window.confirm(
                `Konfirmasi penerimaan barang untuk Pesanan #${orderNumber}?\nPoin loyalitas akan otomatis ditambahkan ke akun Anda.`,
            )
        ) {
            return;
        }

        setProcessingOrderNumber(orderNumber);
        const safeSlug = getSafeOrderSlug(orderNumber);

        router.post(
            `/pesanan/${safeSlug}/konfirmasi-selesai`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `Pesanan #${orderNumber} berhasil diselesaikan. Terima kasih!`,
                    );
                },
                onError: (err) => {
                    const firstErr =
                        typeof err === "object" ? Object.values(err)[0] : null;
                    toast.error(
                        (firstErr as string) || "Gagal mengonfirmasi pesanan.",
                    );
                },
                onFinish: () => setProcessingOrderNumber(null),
            },
        );
    }, []);

    return (
        <StorefrontLayout>
            <Head title="Riwayat Pesanan Saya - CRSL Official Store" />

            {/* Header Halaman */}
            <div className="bg-slate-50/80 border-b border-slate-200/80 py-8 select-none">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="text-xs font-black text-primary uppercase tracking-wider">
                                Order History
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                                Riwayat Pesanan
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                                Pantau status pengiriman, unduh faktur
                                pembayaran, dan konfirmasi penerimaan barang
                                belanjaan Anda.
                            </p>
                        </div>
                        <Link
                            href="/katalog"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all active:scale-95"
                        >
                            <span>Belanja Lagi</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Kontainer Utama */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 select-none">
                {ordersList.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-slate-200/80 shadow-2xs space-y-3.5 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center mx-auto shadow-2xs">
                            <Package className="w-8 h-8 stroke-[1.5]" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-base text-slate-900 tracking-tight">
                                Belum Ada Pesanan
                            </h3>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                Pilih merchandise CRSL favorit Anda sekarang dan
                                nikmati pengalaman berbelanja terbaik!
                            </p>
                        </div>
                        <div className="pt-2">
                            <Link
                                href="/katalog"
                                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-all active:scale-95"
                            >
                                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                                <span>Jelajahi Katalog</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ordersList.map((ord) => {
                            const safeSlug = getSafeOrderSlug(
                                ord.nomor_pesanan,
                            );
                            const isProcessingConfirm =
                                processingOrderNumber === ord.nomor_pesanan;

                            return (
                                <div
                                    key={ord.id}
                                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
                                >
                                    {/* Header Card Pesanan */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <span className="font-mono font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg select-all">
                                                    #{ord.nomor_pesanan}
                                                </span>
                                                <StatusBadge
                                                    status={ord.status}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium">
                                                Dipesan pada{" "}
                                                {formatTanggal(ord.created_at)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <Link
                                                href={`/faktur/${safeSlug}`}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors shadow-2xs"
                                            >
                                                <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                                                <span>Faktur Invoice</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* List Item Produk */}
                                    <div className="space-y-2.5">
                                        {ord.items?.map((item, idx) => {
                                            const imageUrl = normalizeMediaUrl(
                                                item.gambar,
                                            );
                                            return (
                                                <div
                                                    key={`${ord.id}-${item.id || idx}`}
                                                    className="bg-slate-50/70 p-3 sm:p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                                                            <img
                                                                src={imageUrl}
                                                                alt={
                                                                    item.nama_produk
                                                                }
                                                                loading="lazy"
                                                                className="w-full h-full object-cover"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    const target =
                                                                        e.currentTarget;
                                                                    target.onerror =
                                                                        null;
                                                                    target.src =
                                                                        FALLBACK_IMAGE;
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="min-w-0 space-y-0.5">
                                                            <div className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                                                                {
                                                                    item.nama_produk
                                                                }
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 flex items-center gap-1 flex-wrap">
                                                                {item.ukuran && (
                                                                    <span>
                                                                        Ukuran:{" "}
                                                                        {
                                                                            item.ukuran
                                                                        }{" "}
                                                                        •{" "}
                                                                    </span>
                                                                )}
                                                                {item.warna && (
                                                                    <span>
                                                                        Warna:{" "}
                                                                        {
                                                                            item.warna
                                                                        }{" "}
                                                                        •{" "}
                                                                    </span>
                                                                )}
                                                                <span className="font-mono font-semibold">
                                                                    {item.jumlah ||
                                                                        1}
                                                                    x barang
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <div className="text-slate-400 text-[10px] hidden sm:block font-mono">
                                                            {formatRupiah(
                                                                item.harga,
                                                            )}{" "}
                                                            / pcs
                                                        </div>
                                                        <div className="font-black text-slate-900 font-mono tabular-nums text-xs sm:text-sm">
                                                            {formatRupiah(
                                                                (item.harga ||
                                                                    0) *
                                                                    (item.jumlah ||
                                                                        1),
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer Card: Ekspedisi & Aksi Pembayaran */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3.5 border-t border-slate-100 text-xs">
                                        {/* Informasi Kurir */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Truck className="w-4 h-4 text-slate-400 shrink-0 stroke-2" />
                                            <span className="text-slate-500 font-medium">
                                                Ekspedisi:
                                            </span>
                                            <span className="font-bold text-slate-900 uppercase">
                                                {ord.pengiriman?.kurir ||
                                                    "Kurir Standar"}{" "}
                                                (
                                                {ord.pengiriman?.layanan ||
                                                    "REG"}
                                                )
                                            </span>
                                            {ord.pengiriman?.nomor_resi && (
                                                <span className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/90 font-bold">
                                                    Resi:{" "}
                                                    {ord.pengiriman.nomor_resi}
                                                </span>
                                            )}
                                        </div>

                                        {/* Total & Action Buttons */}
                                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                                            <div className="text-left sm:text-right">
                                                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                                                    Total Tagihan:
                                                </span>
                                                <span className="text-primary font-black text-sm sm:text-base font-mono tabular-nums">
                                                    {formatRupiah(ord.total)}
                                                </span>
                                            </div>

                                            {/* Rute Aksi Terkoreksi */}
                                            <div className="flex items-center gap-2">
                                                {ord.status ===
                                                    "belum_bayar" && (
                                                    <Link
                                                        href={`/faktur/${safeSlug}`}
                                                        className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs active:scale-95 shrink-0"
                                                    >
                                                        <CreditCard className="w-3.5 h-3.5 stroke-[2.2]" />
                                                        <span>
                                                            Bayar Sekarang
                                                        </span>
                                                    </Link>
                                                )}

                                                {ord.status === "dikirim" && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isProcessingConfirm
                                                        }
                                                        onClick={() =>
                                                            handleConfirmOrder(
                                                                ord.nomor_pesanan,
                                                            )
                                                        }
                                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {isProcessingConfirm ? (
                                                            <>
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                <span>
                                                                    Memproses...
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <span>
                                                                Konfirmasi
                                                                Selesai
                                                            </span>
                                                        )}
                                                    </button>
                                                )}

                                                {[
                                                    "akan_dikirim",
                                                    "dikirim",
                                                    "selesai",
                                                ].includes(ord.status) && (
                                                    <Link
                                                        href={`/lacak?nomor=${encodeURIComponent(ord.nomor_pesanan)}`}
                                                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs active:scale-95 shrink-0"
                                                    >
                                                        <span>Lacak</span>
                                                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
