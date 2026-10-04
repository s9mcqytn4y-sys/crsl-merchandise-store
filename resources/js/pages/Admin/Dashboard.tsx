import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "./AdminLayout";
import { formatRupiah } from "../../Utils/formatters";
import {
    DollarSign,
    PackageCheck,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ArrowUpRight,
    ShoppingBag,
    TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface DashboardProps {
    statistik: {
        total_pendapatan: number;
        pesanan_perlu_kirim: number;
        menunggu_pembayaran: number;
        pesanan_selesai: number;
    };
    stok_kritis: Array<{
        id: number;
        produk_nama: string;
        varian_nama: string;
        sku: string;
        stok: number;
    }>;
    pesanan_terbaru: Array<{
        id: number;
        nomor_pesanan: string;
        penerima_nama: string;
        total: number;
        status: string;
        kurir: string;
        tanggal: string;
    }>;
}

const statusBadgeConfig: Record<
    string,
    { label: string; bg: string; text: string; border: string }
> = {
    belum_bayar: {
        label: "Menunggu Bayar",
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
    },
    dibayar: {
        label: "Dibayar",
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
    },
    diproses: {
        label: "Perlu Kirim",
        bg: "bg-indigo-500/10",
        text: "text-indigo-400",
        border: "border-indigo-500/20",
    },
    dikirim: {
        label: "Sedang Dikirim",
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/20",
    },
    selesai: {
        label: "Selesai",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
    },
    dibatalkan: {
        label: "Dibatalkan",
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        border: "border-rose-500/20",
    },
};

export default function Dashboard({
    statistik,
    stok_kritis = [],
    pesanan_terbaru = [],
}: DashboardProps) {
    const kpiCards = [
        {
            title: "Total Omset E-Commerce",
            value: formatRupiah(statistik.total_pendapatan),
            desc: "Akumulasi pembayaran terverifikasi",
            icon: DollarSign,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
        },
        {
            title: "Perlu Segera Dikirim",
            value: String(statistik.pesanan_perlu_kirim),
            desc: "Pesanan lunas menunggu resi kurir",
            icon: PackageCheck,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10 border-indigo-500/20",
        },
        {
            title: "Menunggu Pembayaran",
            value: String(statistik.menunggu_pembayaran),
            desc: "Menunggu VA / QRIS diselesaikan",
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
        },
        {
            title: "Pesanan Selesai",
            value: String(statistik.pesanan_selesai),
            desc: "Fulfillment sukses diterima pelanggan",
            icon: CheckCircle2,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
        },
    ];

    return (
        <AdminLayout title="Dashboard Eksekutif">
            <Head title="Admin Dashboard - CRSL Store" />

            <div className="space-y-8">
                {/* 1. Header Metrik Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map((kpi, idx) => {
                        const Icon = kpi.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400">
                                        {kpi.title}
                                    </span>
                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-xl border flex items-center justify-center",
                                            kpi.bg,
                                            kpi.color,
                                        )}
                                    >
                                        <Icon className="w-4 h-4 stroke-[2.2]" />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-2xl font-black text-white font-mono tracking-tight">
                                        {kpi.value}
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        {kpi.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. Grid Dua Kolom: Pesanan Terbaru & Peringatan Stok */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri (2/3): Pesanan Terbaru */}
                    <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                                        <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-sm text-white">
                                            Pesanan E-Commerce Terbaru
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Aktivitas transaksi pelanggan
                                            realtime
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    href="/admin/pesanan"
                                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                                >
                                    <span>Lihat Semua</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {/* Tabel Pesanan Terbaru */}
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                            <th className="py-2.5 px-3">
                                                Invoice
                                            </th>
                                            <th className="py-2.5 px-3">
                                                Pelanggan
                                            </th>
                                            <th className="py-2.5 px-3">
                                                Total
                                            </th>
                                            <th className="py-2.5 px-3">
                                                Status
                                            </th>
                                            <th className="py-2.5 px-3 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 font-medium">
                                        {pesanan_terbaru.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-8 text-center text-slate-500"
                                                >
                                                    Belum ada pesanan masuk.
                                                </td>
                                            </tr>
                                        ) : (
                                            pesanan_terbaru.map((order) => {
                                                const badge =
                                                    statusBadgeConfig[
                                                        order.status
                                                    ] || {
                                                        label: order.status,
                                                        bg: "bg-slate-800",
                                                        text: "text-slate-300",
                                                        border: "border-slate-700",
                                                    };
                                                return (
                                                    <tr
                                                        key={order.id}
                                                        className="hover:bg-slate-800/30 transition-colors"
                                                    >
                                                        <td className="py-3 px-3 font-mono font-bold text-white">
                                                            {order.nomor_pesanan}
                                                        </td>
                                                        <td className="py-3 px-3 text-slate-300 font-bold">
                                                            {order.penerima_nama}
                                                        </td>
                                                        <td className="py-3 px-3 font-mono font-bold text-white">
                                                            {formatRupiah(
                                                                order.total,
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <span
                                                                className={cn(
                                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                                                    badge.bg,
                                                                    badge.text,
                                                                    badge.border,
                                                                )}
                                                            >
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-right">
                                                            <Link
                                                                href="/admin/pesanan"
                                                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors inline-block"
                                                            >
                                                                Proses
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan (1/3): Peringatan Stok Kritis */}
                    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                        <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-sm text-white">
                                            Peringatan Stok Kritis
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            Varian stok &le; 5 unit
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/admin/produk"
                                    className="text-xs font-bold text-amber-400 hover:text-amber-300"
                                >
                                    Kelola
                                </Link>
                            </div>

                            <div className="mt-4 space-y-2.5">
                                {stok_kritis.length === 0 ? (
                                    <p className="py-6 text-center text-xs text-slate-500">
                                        Seluruh stok varian berada pada batas
                                        aman.
                                    </p>
                                ) : (
                                    stok_kritis.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800"
                                        >
                                            <div className="min-w-0 pr-2">
                                                <p className="text-xs font-bold text-white truncate">
                                                    {item.produk_nama}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {item.varian_nama} •{" "}
                                                    <span className="font-mono">
                                                        {item.sku}
                                                    </span>
                                                </p>
                                            </div>
                                            <span
                                                className={cn(
                                                    "px-2 py-0.5 rounded-full text-[11px] font-mono font-black shrink-0 border",
                                                    item.stok === 0
                                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                                )}
                                            >
                                                {item.stok === 0
                                                    ? "HABIS"
                                                    : `Sisa ${item.stok}`}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800/80">
                            <Link
                                href="/admin/produk"
                                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-center block text-slate-200 transition-colors"
                            >
                                Perbarui Stok Produk
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
