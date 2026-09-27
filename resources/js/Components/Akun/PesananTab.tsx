import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import ModalCariPesanan from "./ModalCariPesanan";

export interface OrderProductItem {
    id: number | string;
    nama?: string;
    nama_produk?: string;
    varian?: string;
    ukuran?: string;
    warna?: string;
    gambar?: string;
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
    return (order.status_raw || order.status || "").toLowerCase();
};

/** Ekstraksi order number seragam */
const getOrderNumber = (order: OrderItem): string => {
    return order.order_number || order.nomor_pesanan || String(order.id);
};

function OrderStatusBadge({
    statusRaw,
    statusLabel,
}: {
    statusRaw?: string;
    statusLabel: string;
}) {
    const raw = (statusRaw || statusLabel || "").toLowerCase();

    switch (raw) {
        case "belum_bayar":
            return (
                <span className="bg-amber-50 text-amber-800 border border-amber-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    Belum Bayar
                </span>
            );
        case "akan_dikirim":
            return (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Diproses
                </span>
            );
        case "dikirim":
            return (
                <span className="bg-indigo-50 text-indigo-800 border border-indigo-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    Dalam Pengiriman
                </span>
            );
        case "selesai":
            return (
                <span className="bg-blue-50 text-blue-800 border border-blue-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Selesai
                </span>
            );
        case "dibatalkan":
        case "expired":
            return (
                <span className="bg-rose-50 text-rose-800 border border-rose-200/90 font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Dibatalkan
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
}: PesananTabProps) {
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const [isFindOrderModalOpen, setIsFindOrderModalOpen] = useState(false);
    const [processingOrderNumber, setProcessingOrderNumber] = useState<
        string | null
    >(null);

    // Hitung jumlah order per status untuk badge tab filter
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: orders.length };
        orders.forEach((order) => {
            const statusKey = getRawStatus(order);
            counts[statusKey] = (counts[statusKey] || 0) + 1;
        });
        return counts;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        if (selectedStatus === "all") return orders;
        return orders.filter(
            (order) => getRawStatus(order) === selectedStatus.toLowerCase(),
        );
    }, [orders, selectedStatus]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

    // Cegah currentPage out of bounds jika data berubah dari luar
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

    const handleConfirmOrder = (orderNumber: string) => {
        if (
            !confirm(
                "Pastikan seluruh paket pesanan sudah diterima dan sesuai. Selesaikan pesanan ini?",
            )
        ) {
            return;
        }

        setProcessingOrderNumber(orderNumber);
        router.post(
            `/pesanan/${encodeURIComponent(orderNumber)}/konfirmasi`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingOrderNumber(null),
            },
        );
    };

    return (
        <div className="space-y-6 pt-1">
            {/* Header Tindakan & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
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
                        <Link2 className="w-3.5 h-3.5 text-primary" />
                        Tautkan Pesanan Tamu
                    </button>

                    <Link
                        href="/lacak"
                        onClick={onCariPesanan}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl transition-all shadow-2xs active:scale-95 shrink-0"
                    >
                        <Search className="w-3.5 h-3.5 text-primary" />
                        Lacak Resi Cepat
                    </Link>
                </div>
            </div>

            {/* Filter Tabs Horizontal */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/70">
                {STATUS_FILTERS.map((tab) => {
                    const isActive = selectedStatus === tab.key;
                    const count =
                        tab.key === "all"
                            ? statusCounts.all
                            : statusCounts[tab.key] || 0;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleStatusChange(tab.key)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-xl transition-all cursor-pointer ${
                                isActive
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                            }`}
                        >
                            <span>{tab.label}</span>
                            {count > 0 && (
                                <span
                                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                                        isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-slate-200/80 text-slate-700"
                                    }`}
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
                <div className="py-16 px-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center mb-3">
                        <Package className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                        Tidak Ada Pesanan
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        {selectedStatus === "all"
                            ? "Anda belum melakukan transaksi belanja apapun di CRSL Store."
                            : `Tidak ditemukan transaksi dengan filter status "${
                                  STATUS_FILTERS.find(
                                      (f) => f.key === selectedStatus,
                                  )?.label
                              }".`}
                    </p>
                    <Link
                        href="/katalog"
                        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Jelajahi Produk
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

                        const namaProduk =
                            itemUtama?.nama ||
                            itemUtama?.nama_produk ||
                            "Produk CRSL Merchandise";

                        const varianProduk =
                            itemUtama?.varian ||
                            [itemUtama?.warna, itemUtama?.ukuran]
                                .filter(Boolean)
                                .join(" / ");

                        const fakturSlug = encodeURIComponent(
                            orderNumber.replace(/\//g, "-"),
                        );

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
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
                                            {order.created_at}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <OrderStatusBadge
                                            statusRaw={order.status_raw}
                                            statusLabel={order.status}
                                        />
                                    </div>
                                </div>

                                {/* Konten Produk & Aksi */}
                                <div className="p-4 sm:p-5 space-y-4">
                                    {itemUtama ? (
                                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                                                {/* Thumbnail Gambar Produk */}
                                                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0 overflow-hidden flex items-center justify-center">
                                                    {itemUtama.gambar ? (
                                                        <img
                                                            src={(() => {
                                                                const g =
                                                                    itemUtama.gambar.trim();
                                                                if (
                                                                    g.startsWith(
                                                                        "http://",
                                                                    ) ||
                                                                    g.startsWith(
                                                                        "https://",
                                                                    ) ||
                                                                    g.startsWith(
                                                                        "data:",
                                                                    )
                                                                )
                                                                    return g;
                                                                if (
                                                                    g.startsWith(
                                                                        "/storage/",
                                                                    )
                                                                )
                                                                    return g;
                                                                if (
                                                                    g.startsWith(
                                                                        "storage/",
                                                                    )
                                                                )
                                                                    return `/${g}`;
                                                                if (
                                                                    g.startsWith(
                                                                        "/",
                                                                    )
                                                                )
                                                                    return g;
                                                                return `/storage/${g}`;
                                                            })()}
                                                            alt={namaProduk}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                            onError={(e) => {
                                                                const target =
                                                                    e.currentTarget;
                                                                target.onerror =
                                                                    null;
                                                                // Fallback SVG netral langsung tanpa ketergantungan file lokal eksternal
                                                                target.src =
                                                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m21 16-4-4a3.5 3.5 0 0 0-4.95 0L4 20'/%3E%3Cpath d='m14.5 13.5 1-1a3.5 3.5 0 0 1 4.95 0L21 13'/%3E%3Ccircle cx='9' cy='8' r='2'/%3E%3Crect width='18' height='18' x='3' y='3' rx='2'/%3E%3C/svg%3E";
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
                                                <p className="text-xs sm:text-sm font-black text-slate-900 tabular-nums tracking-tight">
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
                                        <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 text-xs">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Package className="w-4 h-4 text-slate-400" />
                                                <span>
                                                    Rincian pesanan (
                                                    {order.item_count || 1}{" "}
                                                    produk)
                                                </span>
                                            </div>
                                            <Link
                                                href={`/faktur/${fakturSlug}`}
                                                className="text-[11px] font-bold text-slate-800 hover:text-primary inline-flex items-center gap-1 transition-colors"
                                            >
                                                Lihat Faktur{" "}
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}

                                    {/* Footer & Tombol Aksi */}
                                    <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-baseline justify-between sm:justify-start gap-2 text-xs text-slate-500">
                                            <span>Total Tagihan:</span>
                                            <span className="font-black text-sm sm:text-base text-slate-900 tabular-nums tracking-tight">
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
                                                    <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
                                                    <span>Lacak Paket</span>
                                                </Link>
                                            )}

                                            {/* Lihat Faktur */}
                                            <Link
                                                href={`/faktur/${fakturSlug}`}
                                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs"
                                            >
                                                <ReceiptText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                <span>Lihat Faktur</span>
                                            </Link>

                                            {/* Bayar Sekarang */}
                                            {statusRaw === "belum_bayar" && (
                                                <Link
                                                    href={`/faktur/${fakturSlug}`}
                                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
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
                                                            Memproses...
                                                        </>
                                                    ) : (
                                                        "Konfirmasi Selesai"
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
                                                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    isActive
                                                        ? "bg-slate-900 text-white shadow-xs"
                                                        : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                                                }`}
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
