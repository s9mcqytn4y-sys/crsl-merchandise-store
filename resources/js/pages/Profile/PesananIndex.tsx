import React, { useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
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
} from "lucide-react";

interface OrderItem {
    id: number | string;
    nama_produk: string;
    harga: number;
    jumlah: number;
    ukuran?: string;
    warna?: string;
    gambar?: string;
}

interface Order {
    id: string | number;
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

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

function formatRupiah(nominal: number): string {
    return rupiahFormatter.format(nominal || 0);
}

function formatTanggal(tanggalString: string): string {
    try {
        const date = new Date(tanggalString);
        if (isNaN(date.getTime())) return tanggalString;
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return tanggalString;
    }
}

// Ilustrasi Empty Box Minimalis
function EmptyBoxIcon() {
    return (
        <svg
            className="w-16 h-16 mx-auto text-slate-300 stroke-[1.2]"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M32 6L8 18V46L32 58L56 46V18L32 6Z" />
            <path d="M32 58V32" />
            <path d="M56 18L32 32L8 18" />
            <path d="M44 12L20 25" />
        </svg>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status.toLowerCase()) {
        case "belum_bayar":
            return (
                <span className="bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Menunggu Pembayaran
                </span>
            );
        case "akan_dikirim":
            return (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Diproses Penjual
                </span>
            );
        case "dikirim":
            return (
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <Truck className="w-3.5 h-3.5 text-indigo-600" />
                    Dalam Pengiriman
                </span>
            );
        case "selesai":
            return (
                <span className="bg-blue-50 text-blue-700 border border-blue-200/80 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Selesai
                </span>
            );
        case "dibatalkan":
            return (
                <span className="bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Dibatalkan
                </span>
            );
        default:
            return (
                <span className="bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {status}
                </span>
            );
    }
}

export default function PesananIndex({ pesanan }: PesananIndexProps) {
    const ordersList = useMemo(() => pesanan?.data || [], [pesanan]);

    return (
        <StorefrontLayout>
            <Head title="Riwayat Pesanan Saya - CRSL Official Store" />

            {/* Header Halaman */}
            <div className="bg-slate-50/80 border-b border-slate-200/80 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="text-xs font-bold text-[#E52027] uppercase tracking-wider">
                                Order History
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-normal mt-1">
                                Riwayat Pesanan
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                                Pantau status transaksi, unduh faktur, dan lacak
                                resi pengiriman barang belanjaanmu.
                            </p>
                        </div>
                        <Link
                            href="/katalog"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-full border border-slate-200 shadow-2xs transition-colors"
                        >
                            Belanja Lagi{" "}
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Kontainer Utama */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                {ordersList.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-slate-200/80 shadow-2xs space-y-3 max-w-md mx-auto">
                        <EmptyBoxIcon />
                        <h3 className="font-semibold text-base text-slate-800 pt-2">
                            Belum Ada Pesanan
                        </h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                            Yuk, pilih merchandise CRSL favoritmu sekarang dan
                            buat pesanan pertamamu!
                        </p>
                        <div className="pt-3">
                            <Link
                                href="/katalog"
                                className="inline-flex items-center justify-center gap-2 bg-[#E52027] hover:bg-[#CC1C22] text-white font-semibold text-xs px-6 py-3 rounded-full shadow-xs transition-all active:scale-95"
                            >
                                Jelajahi Katalog{" "}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ordersList.map((ord) => (
                            <div
                                key={ord.id}
                                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
                            >
                                {/* Header Card Pesanan */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className="font-mono font-bold text-sm text-slate-900">
                                                #{ord.nomor_pesanan}
                                            </span>
                                            <StatusBadge status={ord.status} />
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            Dipesan pada{" "}
                                            {formatTanggal(ord.created_at)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <Link
                                            href={`/faktur/${ord.nomor_pesanan}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Invoice
                                        </Link>
                                    </div>
                                </div>

                                {/* List Item Produk */}
                                <div className="space-y-2.5">
                                    {ord.items?.map((item, idx) => (
                                        <div
                                            key={`${ord.id}-${item.id || idx}`}
                                            className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={
                                                        item.gambar ||
                                                        "/assets/gambar/placeholder.webp"
                                                    }
                                                    alt={item.nama_produk}
                                                    className="w-12 h-12 object-cover rounded-xl bg-white border border-slate-200 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-800 truncate">
                                                        {item.nama_produk}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                                        {item.ukuran && (
                                                            <span>
                                                                Ukuran:{" "}
                                                                {item.ukuran}{" "}
                                                                •{" "}
                                                            </span>
                                                        )}
                                                        {item.warna && (
                                                            <span>
                                                                Warna:{" "}
                                                                {item.warna}{" "}
                                                                •{" "}
                                                            </span>
                                                        )}
                                                        <span>
                                                            {item.jumlah || 1}{" "}
                                                            pcs
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="text-slate-400 text-[10px] hidden sm:block">
                                                    {formatRupiah(item.harga)} /
                                                    pcs
                                                </div>
                                                <div className="font-bold text-slate-800">
                                                    {formatRupiah(
                                                        (item.harga || 0) *
                                                            (item.jumlah || 1),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer Card: Ekspedisi & Aksi Pembayaran */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-slate-100 text-xs">
                                    {/* Informasi Kurir */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-slate-500">
                                            Ekspedisi:
                                        </span>
                                        <span className="font-semibold text-slate-800 uppercase">
                                            {ord.pengiriman?.kurir ||
                                                "Kurir Standar"}{" "}
                                            ({ord.pengiriman?.layanan || "REG"})
                                        </span>
                                        {ord.pengiriman?.nomor_resi && (
                                            <span className="ml-1 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 font-bold">
                                                Resi:{" "}
                                                {ord.pengiriman.nomor_resi}
                                            </span>
                                        )}
                                    </div>

                                    {/* Total & Action Buttons */}
                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                                        <div className="text-left sm:text-right">
                                            <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
                                                Total Pembayaran:
                                            </span>
                                            <span className="text-[#E52027] font-black text-base">
                                                {formatRupiah(ord.total)}
                                            </span>
                                        </div>

                                        {/* Rute Aksi Terkoreksi Selaras web.php */}
                                        {ord.status === "belum_bayar" ? (
                                            <Link
                                                href={`/faktur/${ord.nomor_pesanan}`}
                                                className="inline-flex items-center gap-1.5 bg-[#E52027] hover:bg-[#CC1C22] text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs active:scale-95 shrink-0"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                Bayar Sekarang
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/lacak"
                                                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 shrink-0"
                                            >
                                                Lacak Pesanan
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
