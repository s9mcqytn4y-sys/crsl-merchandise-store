import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "./AdminLayout";
import { formatRupiah } from "../../Utils/formatters";
import {
    Search,
    Truck,
    CheckCircle2,
    Eye,
    X,
    Filter,
    Package,
    Phone,
    MapPin,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface OrderItemData {
    nama: string;
    varian: string;
    jumlah: number;
    harga: number;
}

interface OrderData {
    id: number;
    nomor_pesanan: string;
    penerima_nama: string;
    penerima_telepon: string;
    alamat_lengkap: string;
    total: number;
    status: string;
    kurir: string;
    layanan: string;
    nomor_resi?: string | null;
    metode_bayar: string;
    tanggal: string;
    item_count: number;
    items: OrderItemData[];
}

interface PesananProps {
    pesanan: {
        data: OrderData[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filter: {
        status: string;
        cari: string;
    };
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

export default function Pesanan({ pesanan, filter }: PesananProps) {
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
    const [nomorResiInput, setNomorResiInput] = useState("");
    const [isSubmittingResi, setIsSubmittingResi] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filter.cari || "");

    const handleFilterStatus = (st: string) => {
        router.get(
            "/admin/pesanan",
            {
                status: st,
                cari: searchTerm,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/admin/pesanan",
            {
                status: filter.status,
                cari: searchTerm,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleUpdateResi = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || !nomorResiInput.trim()) {
            toast.error("Nomor resi wajib diisi");
            return;
        }

        setIsSubmittingResi(true);
        router.post(
            `/admin/pesanan/${encodeURIComponent(selectedOrder.nomor_pesanan)}/resi`,
            {
                nomor_resi: nomorResiInput,
            },
            {
                onSuccess: () => {
                    toast.success("Nomor resi berhasil disimpan!");
                    setSelectedOrder(null);
                    setNomorResiInput("");
                },
                onError: (err) => {
                    toast.error(err.nomor_resi || "Gagal menyimpan resi.");
                },
                onFinish: () => setIsSubmittingResi(false),
            },
        );
    };

    const handleUpdateStatus = (orderNumber: string, newStatus: string) => {
        router.post(
            `/admin/pesanan/${encodeURIComponent(orderNumber)}/status`,
            {
                status: newStatus,
            },
            {
                onSuccess: () => {
                    toast.success(`Status berhasil diubah menjadi ${newStatus}`);
                    if (selectedOrder) {
                        setSelectedOrder((prev) =>
                            prev ? { ...prev, status: newStatus } : null,
                        );
                    }
                },
                onError: () => toast.error("Gagal memperbarui status."),
            },
        );
    };

    const tabs = [
        { key: "semua", label: "Semua Pesanan" },
        { key: "belum_bayar", label: "Belum Bayar" },
        { key: "diproses", label: "Perlu Kirim" },
        { key: "dikirim", label: "Sedang Dikirim" },
        { key: "selesai", label: "Selesai" },
        { key: "dibatalkan", label: "Dibatalkan" },
    ];

    return (
        <AdminLayout title="Manajemen & Fulfillment Pesanan">
            <Head title="Kelola Pesanan - Admin CRSL" />

            <div className="space-y-6">
                {/* 1. Header Filter & Pencarian */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl shadow-xs">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                        {tabs.map((tab) => {
                            const isActive =
                                (filter.status || "semua") === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleFilterStatus(tab.key)}
                                    className={cn(
                                        "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none",
                                        isActive
                                            ? "bg-red-600 text-white shadow-sm font-extrabold"
                                            : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800",
                                    )}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2 shrink-0"
                    >
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari invoice / nama..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 w-52 sm:w-64"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* 2. Tabel Data Pesanan */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                    <th className="py-3 px-4">Nomor Invoice</th>
                                    <th className="py-3 px-4">Pelanggan</th>
                                    <th className="py-3 px-4">Kurir</th>
                                    <th className="py-3 px-4">Total</th>
                                    <th className="py-3 px-4">Resi</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">
                                        Tindakan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-medium">
                                {pesanan.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-12 text-center text-slate-500"
                                        >
                                            Tidak ditemukan pesanan pada kriteria
                                            ini.
                                        </td>
                                    </tr>
                                ) : (
                                    pesanan.data.map((order) => {
                                        const badge = statusBadgeConfig[
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
                                                <td className="py-3.5 px-4 font-mono font-bold text-white">
                                                    {order.nomor_pesanan}
                                                    <span className="block text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                                                        {order.tanggal}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <p className="font-bold text-slate-200">
                                                        {order.penerima_nama}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-mono">
                                                        {order.penerima_telepon}
                                                    </p>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-bold text-slate-300 uppercase">
                                                        {order.kurir}
                                                    </span>{" "}
                                                    <span className="text-[10px] text-slate-500">
                                                        ({order.layanan})
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-mono font-bold text-white">
                                                    {formatRupiah(order.total)}
                                                </td>
                                                <td className="py-3.5 px-4 font-mono">
                                                    {order.nomor_resi ? (
                                                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                                                            {order.nomor_resi}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500 italic text-[11px]">
                                                            Belum input
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
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
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedOrder(
                                                                order,
                                                            );
                                                            setNomorResiInput(
                                                                order.nomor_resi ||
                                                                    "",
                                                            );
                                                        }}
                                                        className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Kelola</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pesanan.last_page > 1 && (
                        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                                Total {pesanan.total} pesanan
                            </span>
                            <div className="flex items-center gap-1">
                                {pesanan.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        className={cn(
                                            "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                                            link.active
                                                ? "bg-red-600 text-white"
                                                : "bg-slate-800 text-slate-300 hover:bg-slate-700",
                                            !link.url &&
                                                "opacity-30 cursor-not-allowed",
                                        )}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Modal Detail & Input Resi Pesanan */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                    <span>#{selectedOrder.nomor_pesanan}</span>
                                    <span
                                        className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                            statusBadgeConfig[
                                                selectedOrder.status
                                            ]?.bg,
                                            statusBadgeConfig[
                                                selectedOrder.status
                                            ]?.text,
                                            statusBadgeConfig[
                                                selectedOrder.status
                                            ]?.border,
                                        )}
                                    >
                                        {statusBadgeConfig[selectedOrder.status]
                                            ?.label || selectedOrder.status}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {selectedOrder.tanggal}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Customer & Shipping Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-500">
                                    Penerima
                                </span>
                                <p className="font-bold text-white">
                                    {selectedOrder.penerima_nama}
                                </p>
                                <p className="text-slate-400 font-mono">
                                    {selectedOrder.penerima_telepon}
                                </p>
                                <p className="text-slate-400 text-[11px] leading-tight pt-1">
                                    {selectedOrder.alamat_lengkap}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
                                <span className="text-[10px] font-bold uppercase text-slate-500">
                                    Pengiriman & Bayar
                                </span>
                                <p className="font-bold text-white uppercase">
                                    {selectedOrder.kurir}{" "}
                                    <span className="text-slate-400 text-xs">
                                        ({selectedOrder.layanan})
                                    </span>
                                </p>
                                <p className="text-slate-300">
                                    Metode: {selectedOrder.metode_bayar}
                                </p>
                                <p className="text-emerald-400 font-mono font-bold pt-1">
                                    Total: {formatRupiah(selectedOrder.total)}
                                </p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase text-slate-500">
                                Item Dipesan ({selectedOrder.items?.length || 0}
                                )
                            </span>
                            <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl bg-slate-800/30 overflow-hidden">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 flex items-center justify-between text-xs"
                                    >
                                        <div>
                                            <p className="font-bold text-white">
                                                {item.nama}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Varian: {item.varian || "-"} •{" "}
                                                {item.jumlah}x
                                            </p>
                                        </div>
                                        <p className="font-mono font-bold text-white">
                                            {formatRupiah(
                                                item.harga * item.jumlah,
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Input Resi Kurir */}
                        <form
                            onSubmit={handleUpdateResi}
                            className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3"
                        >
                            <label className="block text-xs font-bold text-white">
                                Update Nomor Resi Pengiriman
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Contoh: JP8291029103"
                                    value={nomorResiInput}
                                    onChange={(e) =>
                                        setNomorResiInput(e.target.value)
                                    }
                                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-red-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmittingResi}
                                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {isSubmittingResi
                                        ? "Menyimpan..."
                                        : "Simpan Resi"}
                                </button>
                            </div>
                        </form>

                        {/* Quick Status Change */}
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-slate-400 font-medium">
                                Ubah Status Manual:
                            </span>
                            <div className="flex items-center gap-1.5">
                                {["diproses", "dikirim", "selesai"].map(
                                    (st) => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    selectedOrder.nomor_pesanan,
                                                    st,
                                                )
                                            }
                                            className={cn(
                                                "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer capitalize",
                                                selectedOrder.status === st
                                                    ? "bg-slate-700 text-white border border-slate-600"
                                                    : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700",
                                            )}
                                        >
                                            {st}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
