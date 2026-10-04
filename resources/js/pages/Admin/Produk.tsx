import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "./AdminLayout";
import { formatRupiah } from "../../Utils/formatters";
import {
    Search,
    Package,
    Edit3,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface VarianData {
    id: number;
    nama: string;
    sku: string;
    stok: number;
    harga_tambahan: number;
}

interface ProductData {
    id: number;
    nama: string;
    slug: string;
    kategori: string;
    harga_dasar: number;
    harga_diskon?: number | null;
    stok_total: number;
    aktif: boolean;
    gambar: string;
    varians: VarianData[];
}

interface ProdukProps {
    produk: {
        data: ProductData[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    cari: string;
}

export default function Produk({ produk, cari }: ProdukProps) {
    const [searchTerm, setSearchTerm] = useState(cari || "");
    const [expandedProductId, setExpandedProductId] = useState<number | null>(
        null,
    );
    const [editingVarianId, setEditingVarianId] = useState<number | null>(null);
    const [stokInput, setStokInput] = useState<string>("");
    const [isSavingStock, setIsSavingStock] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/admin/produk",
            { cari: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSaveStock = (varianId: number) => {
        const val = parseInt(stokInput, 10);
        if (isNaN(val) || val < 0) {
            toast.error("Stok harus berupa angka positif.");
            return;
        }

        setIsSavingStock(true);
        router.post(
            `/admin/produk/varian/${varianId}/stok`,
            {
                stok: val,
            },
            {
                onSuccess: () => {
                    toast.success("Stok varian berhasil diperbarui!");
                    setEditingVarianId(null);
                    setStokInput("");
                },
                onError: () => toast.error("Gagal memperbarui stok varian."),
                onFinish: () => setIsSavingStock(false),
            },
        );
    };

    return (
        <AdminLayout title="Katalog Produk & Kontrol Stok">
            <Head title="Katalog & Stok - Admin CRSL" />

            <div className="space-y-6">
                {/* 1. Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl shadow-xs">
                    <div>
                        <h3 className="font-extrabold text-sm text-white">
                            Total {produk.total} Produk Aktif
                        </h3>
                        <p className="text-xs text-slate-400">
                            Kelola varian, SKU, dan kuota inventori gudang
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2"
                    >
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari nama produk..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 w-56 sm:w-64"
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

                {/* 2. Daftar Produk Table */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                    <th className="py-3 px-4">Produk</th>
                                    <th className="py-3 px-4">Kategori</th>
                                    <th className="py-3 px-4">Harga Dasar</th>
                                    <th className="py-3 px-4">Total Stok</th>
                                    <th className="py-3 px-4">Varian</th>
                                    <th className="py-3 px-4 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-medium">
                                {produk.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 text-center text-slate-500"
                                        >
                                            Tidak ada produk yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    produk.data.map((p) => {
                                        const isExpanded =
                                            expandedProductId === p.id;
                                        return (
                                            <React.Fragment key={p.id}>
                                                <tr className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                                                                <img
                                                                    src={
                                                                        p.gambar
                                                                    }
                                                                    alt={p.nama}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(
                                                                        e,
                                                                    ) => {
                                                                        (
                                                                            e.currentTarget as HTMLElement
                                                                        ).style.display =
                                                                            "none";
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="min-w-0 max-w-xs">
                                                                <p className="font-bold text-white truncate">
                                                                    {p.nama}
                                                                </p>
                                                                <p className="text-[10px] text-slate-500 font-mono">
                                                                    slug:{" "}
                                                                    {p.slug}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                                                            {p.kategori}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-bold text-white">
                                                        {formatRupiah(
                                                            p.harga_dasar,
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 font-mono font-bold">
                                                        <span
                                                            className={cn(
                                                                "px-2 py-0.5 rounded-full text-[11px] border",
                                                                p.stok_total ===
                                                                    0
                                                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                                    : p.stok_total <=
                                                                        5
                                                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                                            )}
                                                        >
                                                            {p.stok_total} unit
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-400 text-xs">
                                                        {p.varians.length}{" "}
                                                        Varian
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedProductId(
                                                                    isExpanded
                                                                        ? null
                                                                        : p.id,
                                                                )
                                                            }
                                                            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                                        >
                                                            <span>
                                                                {isExpanded
                                                                    ? "Tutup"
                                                                    : "Kelola Stok"}
                                                            </span>
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <ChevronDown className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Variant Sub-Row */}
                                                {isExpanded && (
                                                    <tr>
                                                        <td
                                                            colSpan={6}
                                                            className="p-4 bg-slate-950/60 border-y border-slate-800"
                                                        >
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                                                        Daftar
                                                                        Varian
                                                                        & Stok
                                                                        Gudang
                                                                    </p>
                                                                    <span className="text-[11px] text-slate-500">
                                                                        Klik
                                                                        ikon
                                                                        pensil
                                                                        untuk
                                                                        mengubah
                                                                        kuantitas
                                                                        stok
                                                                    </span>
                                                                </div>

                                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                                    {p.varians.map(
                                                                        (v) => {
                                                                            const isEditing =
                                                                                editingVarianId ===
                                                                                v.id;
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        v.id
                                                                                    }
                                                                                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                                                                                >
                                                                                    <div className="min-w-0">
                                                                                        <p className="font-bold text-white text-xs truncate">
                                                                                            {
                                                                                                v.nama
                                                                                            }
                                                                                        </p>
                                                                                        <p className="text-[10px] text-slate-500 font-mono">
                                                                                            {
                                                                                                v.sku
                                                                                            }
                                                                                        </p>
                                                                                    </div>

                                                                                    {isEditing ? (
                                                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                                                            <input
                                                                                                type="number"
                                                                                                min={
                                                                                                    0
                                                                                                }
                                                                                                value={
                                                                                                    stokInput
                                                                                                }
                                                                                                onChange={(
                                                                                                    e,
                                                                                                ) =>
                                                                                                    setStokInput(
                                                                                                        e
                                                                                                            .target
                                                                                                            .value,
                                                                                                    )
                                                                                                }
                                                                                                className="w-16 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none focus:border-red-500"
                                                                                            />
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                    handleSaveStock(
                                                                                                        v.id,
                                                                                                    )
                                                                                                }
                                                                                                disabled={
                                                                                                    isSavingStock
                                                                                                }
                                                                                                className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                                                                                title="Simpan Stok"
                                                                                            >
                                                                                                <Check className="w-3.5 h-3.5" />
                                                                                            </button>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                    setEditingVarianId(
                                                                                                        null,
                                                                                                    )
                                                                                                }
                                                                                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                                                                                                title="Batal"
                                                                                            >
                                                                                                <X className="w-3.5 h-3.5" />
                                                                                            </button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="flex items-center gap-2 shrink-0">
                                                                                            <span
                                                                                                className={cn(
                                                                                                    "font-mono font-bold text-xs px-2 py-0.5 rounded-lg border",
                                                                                                    v.stok ===
                                                                                                        0
                                                                                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                                                                        : v.stok <=
                                                                                                            5
                                                                                                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                                                                          : "bg-slate-800 text-white border-slate-700",
                                                                                                )}
                                                                                            >
                                                                                                {
                                                                                                    v.stok
                                                                                                }{" "}
                                                                                                pcs
                                                                                            </span>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    setEditingVarianId(
                                                                                                        v.id,
                                                                                                    );
                                                                                                    setStokInput(
                                                                                                        String(
                                                                                                            v.stok,
                                                                                                        ),
                                                                                                    );
                                                                                                }}
                                                                                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                                                                                title="Edit Stok"
                                                                                            >
                                                                                                <Edit3 className="w-3.5 h-3.5" />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {produk.last_page > 1 && (
                        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                                Halaman {produk.current_page} dari{" "}
                                {produk.last_page}
                            </span>
                            <div className="flex items-center gap-1">
                                {produk.links.map((link, idx) => (
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
        </AdminLayout>
    );
}
