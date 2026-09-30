import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, router } from "@inertiajs/react";
import {
    Package,
    Search,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    ReceiptText,
    ChevronRight,
    ChevronLeft,
    Loader2,
    ArrowUpRight,
    ShoppingBag,
    Link2,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "../../Utils/formatters";
import ModalCariPesanan from "./ModalCariPesanan";
import { cn } from "../../lib/utils";

export interface OrderProductItem {
    id: number | string;
    nama?: string;
    nama_produk?: string;
    varian?: string;
    ukuran?: string;
    warna?: string;
    gambar?: string | null;
    harga: number;
    jumlah: number;
}

export interface OrderItem {
    id: number | string;
    order_number?: string;
    nomor_pesanan?: string;
    created_at: string;
    status: string;
    status_raw?: string;
    total: number;
    item_count?: number;
    items?: OrderProductItem[];
    order_items?: OrderProductItem[];
    item?: OrderProductItem[];
}

interface PesananTabProps {
    orders?: OrderItem[];
    onCariPesanan?: () => void;
    userEmail?: string;
    userPhone?: string;
    className?: string;
}

const STATUS_FILTERS = [
    { key: "all", label: "Semua" },
    { key: "belum_bayar", label: "Belum Bayar" },
    { key: "akan_dikirim", label: "Diproses" },
    { key: "dikirim", label: "Dikirim" },
    { key: "selesai", label: "Selesai" },
    { key: "dibatalkan", label: "Dibatalkan" },
];

/** Ekstraksi status normalisasi */
const getRawStatus = (order: OrderItem): string => {
    return (order.status_raw || order.status || "").toLowerCase().trim();
};

/** Ekstraksi order number seragam */
const getOrderNumber = (order: OrderItem): string => {
    return order.nomor_pesanan || order.order_number || String(order.id);
};

/** Helper URL slug yang aman dari pemenggalan path web server */
const getSafeOrderSlug = (orderNumber: string): string => {
    return encodeURIComponent(orderNumber.replace(/[^a-zA-Z0-9-_]/g, "-"));
};

/** Normalisasi path media gambar produk */
function normalizeMediaUrl(url?: string | null): string {
    if (!url) return "";
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

/** Format tanggal standar bahasa Indonesia */
function formatTanggalIndo(dateStr: string): string {
    if (!dateStr) return "-";
    try {
        const normalized = dateStr.includes("T")
            ? dateStr
            : dateStr.replace(" ", "T");
        const d = new Date(normalized);
        if (isNaN(d.getTime())) return dateStr;
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
        return dateStr;
    }
}

function OrderStatusBadge({
    statusRaw,
    statusLabel,
}: {
    statusRaw?: string;
    statusLabel: string;
}) {
    const raw = (statusRaw || statusLabel || "").toLowerCase().trim();

    switch (raw) {
        case "belum_bayar":
            return (
                <span className="bg-amber-50 text-amber-900 border border-amber-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Belum Bayar
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
                    Diproses
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
                <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full text-[11px]">
                    {statusLabel}
                </span>
            );
    }
}

export default function PesananTab({
    orders = [],
    onCariPesanan,
    userEmail,
    userPhone,
    className,
}: PesananTabProps) {
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [isFindOrderModalOpen, setIsFindOrderModalOpen] = useState(false);
    const [processingOrderNumber, setProcessingOrderNumber] = useState<
        string | null
    >(null);

    // Hitung counter tab pesanan secara tepat
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {
            all: orders.length,
            belum_bayar: 0,
            akan_dikirim: 0,
            dikirim: 0,
            selesai: 0,
            dibatalkan: 0,
        };

        orders.forEach((order) => {
            const raw = getRawStatus(order);
            if (raw === "belum_bayar") {
                counts.belum_bayar = (counts.belum_bayar || 0) + 1;
            } else if (
                [
                    "akan_dikirim",
                    "menunggu_verifikasi_manual",
                    "challenge",
                ].includes(raw)
            ) {
                counts.akan_dikirim = (counts.akan_dikirim || 0) + 1;
            } else if (raw === "dikirim") {
                counts.dikirim = (counts.dikirim || 0) + 1;
            } else if (raw === "selesai") {
                counts.selesai = (counts.selesai || 0) + 1;
            } else if (["dibatalkan", "expired"].includes(raw)) {
                counts.dibatalkan = (counts.dibatalkan || 0) + 1;
            }
        });

        return counts;
    }, [orders]);

    // Filter daftar pesanan sesuai status tab
    const filteredOrders = useMemo(() => {
        if (selectedStatus === "all") return orders;

        return orders.filter((order) => {
            const raw = getRawStatus(order);
            if (selectedStatus === "akan_dikirim") {
                return [
                    "akan_dikirim",
                    "menunggu_verifikasi_manual",
                    "challenge",
                ].includes(raw);
            }
            if (selectedStatus === "dibatalkan") {
                return ["dibatalkan", "expired"].includes(raw);
            }
            return raw === selectedStatus.toLowerCase();
        });
    }, [orders, selectedStatus]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredOrders.slice(start, start + pageSize);
    }, [filteredOrders, currentPage, pageSize]);

    const handleStatusChange = (statusKey: string) => {
        setSelectedStatus(statusKey);
        setCurrentPage(1);
    };

    // Konfirmasi Penerimaan Pesanan (Sesuai route web.php pesanan.konfirmasi)
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

        // Path yang benar sesuai routes/web.php: /pesanan/{nomorPesanan}/konfirmasi-selesai
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
                    const firstErr = Object.values(err)[0] as string;
                    toast.error(firstErr || "Gagal mengonfirmasi pesanan.");
                },
                onFinish: () => setProcessingOrderNumber(null),
            },
        );
    }, []);

    return (
        <div className={cn("space-y-6 pt-1 select-none", className)}>
            {/* Header Tindakan & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
                <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Pesanan Saya
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Pantau status pengiriman, faktur pembayaran, dan riwayat
                        belanja Anda.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsFindOrderModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                        <Link2 className="w-3.5 h-3.5 text-[#E52027]" />
                        <span>Tautkan Pesanan Tamu</span>
                    </button>

                    <Link
                        href="/lacak"
                        onClick={onCariPesanan}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs active:scale-95 shrink-0"
                    >
                        <Search className="w-3.5 h-3.5 text-[#E52027]" />
                        <span>Lacak Resi Cepat</span>
                    </Link>
                </div>
            </div>

            {/* Filter Tabs Horizontal WAI-ARIA */}
            <div
                role="tablist"
                aria-label="Filter status pesanan"
                className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200/70"
            >
                {STATUS_FILTERS.map((tab) => {
                    const isActive = selectedStatus === tab.key;
                    const count =
                        tab.key === "all"
                            ? statusCounts.all
                            : statusCounts[tab.key] || 0;

                    return (
                        <button
                            key={tab.key}
                            role="tab"
                            aria-selected={isActive}
                            type="button"
                            onClick={() => handleStatusChange(tab.key)}
                            className={cn(
                                "inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-2xl transition-all cursor-pointer",
                                isActive
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80",
                            )}
                        >
                            <span>{tab.label}</span>
                            {count > 0 && (
                                <span
                                    className={cn(
                                        "px-1.5 py-0.5 rounded-full text-[10px] font-black font-mono",
                                        isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-slate-200 text-slate-700",
                                    )}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Daftar Pesanan atau Empty State */}
            {filteredOrders.length === 0 ? (
                <div className="py-16 px-4 bg-white border border-slate-200/80 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xs">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center mb-3">
                        <Package className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                        Tidak Ada Pesanan
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                        {selectedStatus === "all"
                            ? "Anda belum memiliki riwayat transaksi belanja di CRSL Store."
                            : `Tidak ditemukan pesanan pada filter "${STATUS_FILTERS.find((f) => f.key === selectedStatus)?.label}".`}
                    </p>
                    <Link
                        href="/katalog"
                        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#E52027] hover:bg-[#CC1C22] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Jelajahi Produk</span>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedOrders.map((order) => {
                        const orderNumber = getOrderNumber(order);
                        const items =
                            order.items ||
                            order.order_items ||
                            order.item ||
                            [];
                        const itemUtama = items[0];
                        const sisaVarianItem = Math.max(0, items.length - 1);
                        const isProcessingConfirm =
                            processingOrderNumber === orderNumber;
                        const statusRaw = getRawStatus(order);
                        const safeSlug = getSafeOrderSlug(orderNumber);

                        const namaProduk =
                            itemUtama?.nama ||
                            itemUtama?.nama_produk ||
                            "Produk CRSL Merchandise";

                        const varianProduk =
                            itemUtama?.varian ||
                            [itemUtama?.warna, itemUtama?.ukuran]
                                .filter(Boolean)
                                .join(" / ");

                        const isHoldManual =
                            statusRaw === "menunggu_verifikasi_manual" ||
                            statusRaw === "challenge";

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                            >
                                {/* Header Kartu Pesanan */}
                                <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg select-all">
                                            #{orderNumber}
                                        </span>
                                        <span className="text-slate-300">
                                            •
                                        </span>
                                        <span className="text-slate-500 font-medium">
                                            {formatTanggalIndo(
                                                order.created_at,
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <OrderStatusBadge
                                            statusRaw={order.status_raw}
                                            statusLabel={order.status}
                                        />
                                    </div>
                                </div>

                                {/* Banner Informasi Verifikasi Manual */}
                                {isHoldManual && (
                                    <div className="px-5 py-2.5 bg-amber-50/80 border-b border-amber-200/70 flex items-center justify-between text-xs text-amber-900">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span>
                                                Pembayaran sedang dalam
                                                peninjauan verifikasi CS.
                                            </span>
                                        </div>
                                        <Link
                                            href={`/faktur/${safeSlug}`}
                                            className="text-amber-950 font-bold underline hover:text-amber-800 text-[11px]"
                                        >
                                            Kirim Bukti
                                        </Link>
                                    </div>
                                )}

                                {/* Konten Produk & Aksi */}
                                <div className="p-4 sm:p-5 space-y-4">
                                    {itemUtama ? (
                                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                                                {/* Thumbnail Gambar Produk */}
                                                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-100 border border-slate-200/80 shrink-0 overflow-hidden flex items-center justify-center">
                                                    {itemUtama.gambar ? (
                                                        <img
                                                            src={normalizeMediaUrl(
                                                                itemUtama.gambar,
                                                            )}
                                                            alt={namaProduk}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                            onError={(e) => {
                                                                const target =
                                                                    e.currentTarget;
                                                                target.onerror =
                                                                    null;
                                                                target.className =
                                                                    "w-7 h-7 text-slate-300 opacity-60";
                                                            }}
                                                        />
                                                    ) : (
                                                        <Package className="w-7 h-7 text-slate-300 stroke-[1.5]" />
                                                    )}
                                                </div>

                                                {/* Detail Deskripsi Produk */}
                                                <div className="min-w-0 space-y-1">
                                                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                                                        {namaProduk}
                                                    </h5>

                                                    {varianProduk ? (
                                                        <p className="text-[11px] text-slate-500 truncate">
                                                            Varian:{" "}
                                                            <span className="font-medium text-slate-700">
                                                                {varianProduk}
                                                            </span>
                                                        </p>
                                                    ) : null}

                                                    {sisaVarianItem > 0 && (
                                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-600 text-[10px] font-semibold">
                                                            +{sisaVarianItem}{" "}
                                                            produk lainnya
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Total Harga Item */}
                                            <div className="text-right shrink-0">
                                                <p className="text-xs sm:text-sm font-black text-slate-900 tabular-nums tracking-tight font-mono">
                                                    {formatRupiah(
                                                        itemUtama.harga,
                                                    )}
                                                </p>
                                                <span className="inline-block text-[11px] font-medium text-slate-500 mt-0.5">
                                                    {itemUtama.jumlah}x barang
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-xs">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Package className="w-4 h-4 text-slate-400" />
                                                <span>
                                                    Rincian pesanan (
                                                    {order.item_count || 1}{" "}
                                                    produk)
                                                </span>
                                            </div>
                                            <Link
                                                href={`/faktur/${safeSlug}`}
                                                className="text-[11px] font-bold text-slate-800 hover:text-[#E52027] inline-flex items-center gap-1 transition-colors"
                                            >
                                                <span>Lihat Faktur</span>
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}

                                    {/* Footer & Tombol Aksi */}
                                    <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-baseline justify-between sm:justify-start gap-2 text-xs text-slate-500">
                                            <span>Total Tagihan:</span>
                                            <span className="font-black text-sm sm:text-base text-slate-900 tabular-nums tracking-tight font-mono">
                                                {formatRupiah(order.total)}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
                                            {/* Lacak Paket */}
                                            {[
                                                "akan_dikirim",
                                                "dikirim",
                                                "selesai",
                                            ].includes(statusRaw) && (
                                                <Link
                                                    href={`/lacak?nomor=${encodeURIComponent(orderNumber)}`}
                                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-xs font-bold text-slate-700 transition-all shadow-2xs"
                                                >
                                                    <Truck className="w-3.5 h-3.5 text-[#E52027] shrink-0" />
                                                    <span>Lacak Paket</span>
                                                </Link>
                                            )}

                                            {/* Lihat Faktur */}
                                            <Link
                                                href={`/faktur/${safeSlug}`}
                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs"
                                            >
                                                <ReceiptText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                <span>Lihat Faktur</span>
                                            </Link>

                                            {/* Bayar Sekarang */}
                                            {statusRaw === "belum_bayar" && (
                                                <Link
                                                    href={`/faktur/${safeSlug}`}
                                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
                                                >
                                                    Bayar Sekarang
                                                </Link>
                                            )}

                                            {/* Konfirmasi Selesai */}
                                            {statusRaw === "dikirim" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        isProcessingConfirm
                                                    }
                                                    onClick={() =>
                                                        handleConfirmOrder(
                                                            orderNumber,
                                                        )
                                                    }
                                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
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
                                                            Konfirmasi Selesai
                                                        </span>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                            <span className="text-xs text-slate-500 font-medium">
                                Menampilkan{" "}
                                <strong className="text-slate-900 font-bold">
                                    {(currentPage - 1) * pageSize + 1}
                                </strong>{" "}
                                -{" "}
                                <strong className="text-slate-900 font-bold">
                                    {Math.min(
                                        currentPage * pageSize,
                                        filteredOrders.length,
                                    )}
                                </strong>{" "}
                                dari{" "}
                                <strong className="text-slate-900 font-bold">
                                    {filteredOrders.length}
                                </strong>{" "}
                                pesanan
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                    aria-label="Halaman sebelumnya"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: totalPages }).map(
                                    (_, idx) => {
                                        const pageNum = idx + 1;
                                        const isActive =
                                            pageNum === currentPage;
                                        return (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                onClick={() =>
                                                    setCurrentPage(pageNum)
                                                }
                                                className={cn(
                                                    "min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-mono",
                                                    isActive
                                                        ? "bg-slate-900 text-white shadow-xs"
                                                        : "border border-slate-200 text-slate-700 hover:bg-slate-50",
                                                )}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    },
                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                    aria-label="Halaman selanjutnya"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Tautkan Pesanan Tamu */}
            <ModalCariPesanan
                isOpen={isFindOrderModalOpen}
                onClose={() => setIsFindOrderModalOpen(false)}
                userEmail={userEmail}
                userPhone={userPhone}
            />
        </div>
    );
}
