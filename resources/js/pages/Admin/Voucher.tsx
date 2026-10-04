import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "./AdminLayout";
import { formatRupiah } from "../../Utils/formatters";
import {
    TicketPercent,
    Plus,
    X,
    Check,
    Power,
    Tag,
    Clock,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface VoucherData {
    id: number;
    kode: string;
    judul: string;
    deskripsi?: string | null;
    tipe: string;
    nilai: number;
    min_belanja: number;
    maksimal_diskon?: number | null;
    kuota: number;
    terpakai: number;
    berlaku_sampai: string;
    aktif: boolean;
}

interface VoucherProps {
    vouchers: VoucherData[];
}

export default function Voucher({ vouchers = [] }: VoucherProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        kode: "",
        judul: "",
        deskripsi: "",
        tipe: "persentase",
        nilai: "",
        min_belanja: "",
        maksimal_diskon: "",
        kuota: "100",
        berlaku_sampai: "",
    });

    const handleToggleVoucher = (id: number) => {
        router.post(
            `/admin/voucher/${id}/toggle`,
            {},
            {
                onSuccess: () =>
                    toast.success("Status voucher berhasil diubah!"),
                onError: () => toast.error("Gagal mengubah status voucher."),
            },
        );
    };

    const handleCreateVoucher = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.kode.trim() || !form.judul.trim() || !form.nilai) {
            toast.error("Kode, judul, dan nilai diskon wajib diisi.");
            return;
        }

        setIsSubmitting(true);
        router.post("/admin/voucher", form, {
            onSuccess: () => {
                toast.success("Voucher promo berhasil dibuat!");
                setIsCreateModalOpen(false);
                setForm({
                    kode: "",
                    judul: "",
                    deskripsi: "",
                    tipe: "persentase",
                    nilai: "",
                    min_belanja: "",
                    maksimal_diskon: "",
                    kuota: "100",
                    berlaku_sampai: "",
                });
            },
            onError: (err) => {
                toast.error(
                    Object.values(err)[0] || "Gagal menambahkan voucher.",
                );
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AdminLayout title="Manajemen Kupon & Voucher Diskon">
            <Head title="Kelola Voucher - Admin CRSL" />

            <div className="space-y-6">
                {/* 1. Header & Tombol Buat Voucher */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl shadow-xs">
                    <div>
                        <h3 className="font-extrabold text-sm text-white">
                            Total {vouchers.length} Kupon Promo Terdaftar
                        </h3>
                        <p className="text-xs text-slate-400">
                            Sinkron otomatis ke Storefront & Checkout Pelanggan
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-red-600/20"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Buat Voucher Baru</span>
                    </button>
                </div>

                {/* 2. Grid Voucher Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vouchers.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            Belum ada voucher terdaftar. Klik tombol diatas
                            untuk membuat.
                        </div>
                    ) : (
                        vouchers.map((v) => (
                            <div
                                key={v.id}
                                className={cn(
                                    "p-5 rounded-3xl border bg-slate-900/70 shadow-xs flex flex-col justify-between transition-all",
                                    v.aktif
                                        ? "border-slate-800"
                                        : "border-slate-800/40 opacity-60 bg-slate-900/30",
                                )}
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-black text-sm text-red-400 bg-red-500/10 px-2.5 py-1 rounded-xl border border-red-500/20">
                                            {v.kode}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggleVoucher(v.id)
                                            }
                                            className={cn(
                                                "p-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1",
                                                v.aktif
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700",
                                            )}
                                            title={
                                                v.aktif
                                                    ? "Klik untuk nonaktifkan"
                                                    : "Klik untuk aktifkan"
                                            }
                                        >
                                            <Power className="w-3.5 h-3.5" />
                                            <span>
                                                {v.aktif ? "Aktif" : "Mati"}
                                            </span>
                                        </button>
                                    </div>

                                    <h4 className="font-extrabold text-sm text-white mt-3 line-clamp-1">
                                        {v.judul}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                        {v.deskripsi || "Tanpa deskripsi promo"}
                                    </p>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-800/60 space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between text-slate-300">
                                        <span>Potongan Diskon:</span>
                                        <strong className="font-mono font-bold text-white">
                                            {v.tipe === "persentase"
                                                ? `${v.nilai}%`
                                                : formatRupiah(v.nilai)}
                                        </strong>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                        <span>Minimal Belanja:</span>
                                        <span className="font-mono">
                                            {formatRupiah(v.min_belanja)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                                        <span>Penggunaan Kuota:</span>
                                        <span className="font-mono font-bold text-slate-200">
                                            {v.terpakai} / {v.kuota}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1">
                                        <span>Kedaluwarsa:</span>
                                        <span>{v.berlaku_sampai}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 3. Modal Form Buat Voucher */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div>
                                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                    <TicketPercent className="w-5 h-5 text-red-500" />
                                    <span>Buat Voucher Promo Baru</span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Akan langsung aktif dan tampil di aplikasi
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateVoucher}
                            className="space-y-3.5 text-xs"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">
                                        Kode Voucher
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="CONTOH: BESTFREEN20"
                                        value={form.kode}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                kode: e.target.value.toUpperCase(),
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold uppercase focus:outline-none focus:border-red-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">
                                        Tipe Potongan
                                    </label>
                                    <select
                                        value={form.tipe}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                tipe: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                                    >
                                        <option value="persentase">
                                            Persentase (%)
                                        </option>
                                        <option value="nominal">
                                            Nominal Rupiah (Rp)
                                        </option>
                                        <option value="ongkir">
                                            Gratis Ongkir
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-300 mb-1">
                                    Judul Kampanye
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Diskon Eksklusif Pelanggan Baru"
                                    value={form.judul}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            judul: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">
                                        Nilai Diskon (
                                        {form.tipe === "persentase"
                                            ? "%"
                                            : "Rp"}
                                        )
                                    </label>
                                    <input
                                        type="number"
                                        placeholder={
                                            form.tipe === "persentase"
                                                ? "10"
                                                : "25000"
                                        }
                                        value={form.nilai}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                nilai: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-red-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">
                                        Minimal Belanja (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={form.min_belanja}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                min_belanja: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">
                                        Kuota Penggunaan
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.kuota}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                kuota: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-red-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-300 mb-1">
                                        Berlaku Sampai (Opsional)
                                    </label>
                                    <input
                                        type="date"
                                        value={form.berlaku_sampai}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                berlaku_sampai: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-red-600/20"
                                >
                                    {isSubmitting
                                        ? "Menyimpan..."
                                        : "Simpan Voucher"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
