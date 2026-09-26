import React, { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import ProfileLayout from "../Layouts/ProfileLayout";
import { Trash2, Pencil, Plus, X, MapPin, Search, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export interface AddressItem {
    id: number;
    label?: string;
    nama_penerima: string;
    telepon: string;
    email?: string;
    area_id?: string;
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    kelurahan?: string;
    kode_pos?: string;
    alamat_lengkap: string;
    format_lengkap: string;
    adalah_utama: boolean;
}

interface BiteshipAreaResult {
    id: string;
    nama: string;
    negara: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan?: string;
    kode_pos?: string;
}

interface ProfileDeliveryProps {
    user: {
        name?: string;
        email?: string;
    };
    addresses: AddressItem[];
}

export default function ProfileDelivery({ user, addresses = [] }: ProfileDeliveryProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AddressItem | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // Form fields
    const [label, setLabel] = useState("Rumah");
    const [namaPenerima, setNamaPenerima] = useState(user?.name || "");
    const [telepon, setTelepon] = useState("");
    const [email, setEmail] = useState(user?.email || "");
    const [areaId, setAreaId] = useState("");
    const [provinsi, setProvinsi] = useState("");
    const [kota, setKota] = useState("");
    const [kecamatan, setKecamatan] = useState("");
    const [kelurahan, setKelurahan] = useState("");
    const [kodePos, setKodePos] = useState("");
    const [alamatLengkap, setAlamatLengkap] = useState("");
    const [adalahUtama, setAdalahUtama] = useState(false);
    const [sedangSimpan, setSedangSimpan] = useState(false);

    // Biteship autocomplete search state
    const [areaSearchQuery, setAreaSearchQuery] = useState("");
    const [areaResults, setAreaResults] = useState<BiteshipAreaResult[]>([]);
    const [isSearchingArea, setIsSearchingArea] = useState(false);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);
    const [selectedAreaText, setSelectedAreaText] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // In-field error states
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Debounced search for Biteship Area
    useEffect(() => {
        if (areaSearchQuery.trim().length < 3) {
            setAreaResults([]);
            setIsSearchingArea(false);
            return;
        }

        setIsSearchingArea(true);
        const timer = setTimeout(() => {
            fetch(`/api/wilayah/cari?q=${encodeURIComponent(areaSearchQuery.trim())}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.sukses && Array.isArray(data?.data)) {
                        setAreaResults(data.data);
                    } else {
                        setAreaResults([]);
                    }
                })
                .catch(() => {
                    setAreaResults([]);
                })
                .finally(() => {
                    setIsSearchingArea(false);
                });
        }, 350);

        return () => clearTimeout(timer);
    }, [areaSearchQuery]);

    // Close area dropdown when clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowAreaDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const pilihAreaBiteship = (area: BiteshipAreaResult) => {
        setAreaId(area.id);
        setProvinsi(area.provinsi || "");
        setKota(area.kota || "");
        setKecamatan(area.kecamatan || "");
        setKelurahan(area.kelurahan || "");
        setKodePos(area.kode_pos || "");

        const formattedText = [
            area.kelurahan ? `Kel. ${area.kelurahan}` : "",
            area.kecamatan ? `Kec. ${area.kecamatan}` : "",
            area.kota,
            area.provinsi,
            area.kode_pos,
        ]
            .filter(Boolean)
            .join(", ");

        setSelectedAreaText(formattedText);
        setAreaSearchQuery("");
        setShowAreaDropdown(false);

        // Clear error if any
        if (errors.area_id) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated.area_id;
                return updated;
            });
        }
    };

    const bukaModalTambah = () => {
        setEditTarget(null);
        setLabel("Rumah");
        setNamaPenerima(user?.name || "");
        setTelepon("");
        setEmail(user?.email || "");
        setAreaId("");
        setProvinsi("");
        setKota("");
        setKecamatan("");
        setKelurahan("");
        setKodePos("");
        setAlamatLengkap("");
        setSelectedAreaText("");
        setAreaSearchQuery("");
        setAdalahUtama(addresses.length === 0);
        setErrors({});
        setIsModalOpen(true);
    };

    const bukaModalEdit = (addr: AddressItem) => {
        setEditTarget(addr);
        setLabel(addr.label || "Rumah");
        setNamaPenerima(addr.nama_penerima);
        setTelepon(addr.telepon);
        setEmail(addr.email || user?.email || "");
        setAreaId(addr.area_id || "");
        setProvinsi(addr.provinsi || "");
        setKota(addr.kota || "");
        setKecamatan(addr.kecamatan || "");
        setKelurahan(addr.kelurahan || "");
        setKodePos(addr.kode_pos || "");
        setAlamatLengkap(addr.alamat_lengkap);
        setAdalahUtama(addr.adalah_utama);

        const currentAreaText = [
            addr.kelurahan ? `Kel. ${addr.kelurahan}` : "",
            addr.kecamatan ? `Kec. ${addr.kecamatan}` : "",
            addr.kota,
            addr.provinsi,
            addr.kode_pos,
        ]
            .filter(Boolean)
            .join(", ");

        setSelectedAreaText(currentAreaText);
        setAreaSearchQuery("");
        setErrors({});
        setIsModalOpen(true);
    };

    const handleHapusAlamat = (id: number) => {
        if (!confirm("Hapus alamat pengiriman ini?")) return;
        setIsDeleting(id);

        router.delete(`/profile/delivery/${id}`, {
            onSuccess: () => {
                toast.success("Alamat berhasil dihapus.");
                setIsDeleting(null);
            },
            onError: () => {
                toast.error("Gagal menghapus alamat.");
                setIsDeleting(null);
            },
            onFinish: () => setIsDeleting(null),
        });
    };

    const validasiForm = (): boolean => {
        const errs: Record<string, string> = {};

        if (!namaPenerima.trim()) {
            errs.namaPenerima = "Nama penerima wajib diisi.";
        } else if (namaPenerima.trim().length < 3) {
            errs.namaPenerima = "Nama penerima minimal 3 karakter.";
        }

        if (!telepon.trim()) {
            errs.telepon = "Nomor telepon wajib diisi.";
        } else if (!/^[0-9+()\- ]{9,20}$/.test(telepon.trim())) {
            errs.telepon = "Nomor telepon tidak valid.";
        }

        if (!areaId && !kota.trim()) {
            errs.area_id = "Pilih lokasi kecamatan/kota tujuan pengiriman.";
        }

        if (!alamatLengkap.trim()) {
            errs.alamatLengkap = "Alamat lengkap jalan/nomor rumah wajib diisi.";
        } else if (alamatLengkap.trim().length < 8) {
            errs.alamatLengkap = "Alamat lengkap terlalu pendek (minimal 8 karakter).";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSimpanAlamat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validasiForm()) {
            return;
        }

        setSedangSimpan(true);

        const payload = {
            label: label.trim() || "Rumah",
            nama_penerima: namaPenerima.trim(),
            telepon: telepon.trim(),
            email: email.trim(),
            area_id: areaId || null,
            provinsi: provinsi.trim(),
            kota: kota.trim(),
            kecamatan: kecamatan.trim(),
            kelurahan: kelurahan.trim(),
            kode_pos: kodePos.trim(),
            alamat_lengkap: alamatLengkap.trim(),
            adalah_utama: adalahUtama,
        };

        if (editTarget) {
            router.put(`/profile/delivery/${editTarget.id}`, payload, {
                onSuccess: () => {
                    toast.success("Alamat berhasil diperbarui!");
                    setIsModalOpen(false);
                    setSedangSimpan(false);
                },
                onError: (serverErrors: any) => {
                    setErrors(serverErrors || {});
                    toast.error("Gagal memperbarui alamat. Silakan periksa kembali data Anda.");
                    setSedangSimpan(false);
                },
                onFinish: () => setSedangSimpan(false),
            });
        } else {
            router.post("/profile/delivery", payload, {
                onSuccess: () => {
                    toast.success("Alamat baru berhasil ditambahkan!");
                    setIsModalOpen(false);
                    setSedangSimpan(false);
                },
                onError: (serverErrors: any) => {
                    setErrors(serverErrors || {});
                    toast.error("Gagal menambahkan alamat. Silakan periksa kembali data Anda.");
                    setSedangSimpan(false);
                },
                onFinish: () => setSedangSimpan(false),
            });
        }
    };

    return (
        <ProfileLayout activeMenu="delivery">
            <Head title="Addresses - CRSL Official Store" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                        Buyer - Delivery info
                    </h1>
                </div>

                {/* List Alamat Pengguna (Sesuai Screenshot 5) */}
                <div className="space-y-4">
                    {addresses.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-600">
                                Belum ada alamat pengiriman tersimpan.
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Tambahkan alamat agar mempermudah proses checkout pesanan.
                            </p>
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className="bg-[#F8F9FA] rounded-2xl p-6 relative border border-slate-100 flex flex-col justify-between transition-all hover:border-slate-200"
                            >
                                <div className="space-y-1.5 pr-20">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-slate-900">
                                            {addr.nama_penerima}
                                        </h3>
                                        {addr.label && (
                                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                                                {addr.label}
                                            </span>
                                        )}
                                        {addr.adalah_utama && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-primary px-2 py-0.5 rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-600">
                                        {addr.telepon} {addr.email ? `• ${addr.email}` : ""}
                                    </p>

                                    <p className="text-xs text-slate-700 leading-relaxed pt-1">
                                        {addr.alamat_lengkap}
                                    </p>

                                    {(addr.kota || addr.kecamatan) && (
                                        <p className="text-xs text-slate-500 font-medium">
                                            {[addr.kelurahan, addr.kecamatan, addr.kota, addr.provinsi, addr.kode_pos]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </p>
                                    )}

                                    {addr.area_id && (
                                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            <span>Alamat Terverifikasi</span>
                                        </div>
                                    )}
                                </div>

                                {/* Tombol Aksi Kanan Bawah (Sesuai Screenshot 5: Ikon Hapus & Edit dalam Lingkaran) */}
                                <div className="absolute right-6 bottom-6 flex items-center gap-2">
                                    {/* Delete Button (Lingkaran Merah Muda) */}
                                    <button
                                        type="button"
                                        onClick={() => handleHapusAlamat(addr.id)}
                                        disabled={isDeleting === addr.id}
                                        className="w-8 h-8 rounded-full bg-red-100/70 hover:bg-red-200/80 text-red-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                                        aria-label="Hapus alamat"
                                        title="Hapus alamat"
                                    >
                                        <Trash2 className="w-4 h-4 stroke-[2]" />
                                    </button>

                                    {/* Edit Button (Lingkaran Abu-Abu) */}
                                    <button
                                        type="button"
                                        onClick={() => bukaModalEdit(addr)}
                                        className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                                        aria-label="Ubah alamat"
                                        title="Ubah alamat"
                                    >
                                        <Pencil className="w-4 h-4 stroke-[2]" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Tombol + Add New di Kanan Bawah (Sesuai Screenshot 5) */}
                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={bukaModalTambah}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add New</span>
                    </button>
                </div>
            </div>

            {/* Modal Tambah / Edit Alamat dengan Biteship Autocomplete Integration */}
            {isModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-address-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
                >
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 id="modal-address-title" className="text-lg font-bold text-slate-900">
                                {editTarget ? "Edit Delivery Address" : "Add Delivery Address"}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSimpanAlamat} className="space-y-4 pt-4">
                            {/* Label Alamat */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-600">
                                    Label Alamat (Contoh: Rumah, Kantor)
                                </label>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="Rumah"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                                />
                            </div>

                            {/* Nama Penerima */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-600">
                                    Nama Penerima *
                                </label>
                                <input
                                    type="text"
                                    value={namaPenerima}
                                    onChange={(e) => {
                                        setNamaPenerima(e.target.value);
                                        if (errors.namaPenerima) {
                                            setErrors((prev) => {
                                                const u = { ...prev };
                                                delete u.namaPenerima;
                                                return u;
                                            });
                                        }
                                    }}
                                    required
                                    placeholder="Nama Lengkap Penerima"
                                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-800 focus:outline-none ${
                                        errors.namaPenerima
                                            ? "border-red-400 focus:ring-1 focus:ring-red-400"
                                            : "border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                                    }`}
                                />
                                {errors.namaPenerima && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{errors.namaPenerima}</span>
                                    </p>
                                )}
                            </div>

                            {/* Telepon & Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Nomor Telepon *
                                    </label>
                                    <input
                                        type="tel"
                                        value={telepon}
                                        onChange={(e) => {
                                            setTelepon(e.target.value);
                                            if (errors.telepon) {
                                                setErrors((prev) => {
                                                    const u = { ...prev };
                                                    delete u.telepon;
                                                    return u;
                                                });
                                            }
                                        }}
                                        required
                                        placeholder="08xxxxxxxxxx"
                                        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-800 focus:outline-none ${
                                            errors.telepon
                                                ? "border-red-400 focus:ring-1 focus:ring-red-400"
                                                : "border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                                        }`}
                                    />
                                    {errors.telepon && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>{errors.telepon}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@domain.com"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                                    />
                                </div>
                            </div>

                            {/* Autocomplete Pencarian Wilayah Pengiriman */}
                            <div className="space-y-1 relative" ref={dropdownRef}>
                                <label className="block text-xs font-semibold text-slate-600 flex items-center justify-between">
                                    <span>Cari Wilayah / Kecamatan *</span>
                                    {areaId && (
                                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Terverifikasi
                                        </span>
                                    )}
                                </label>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={areaSearchQuery}
                                        onChange={(e) => {
                                            setAreaSearchQuery(e.target.value);
                                            setShowAreaDropdown(true);
                                        }}
                                        onFocus={() => setShowAreaDropdown(true)}
                                        placeholder="Ketik min 3 huruf (contoh: Sleman, Johar Baru, Tebet)..."
                                        className={`w-full pl-9 pr-9 py-2.5 bg-white border rounded-xl text-sm text-slate-800 focus:outline-none ${
                                            errors.area_id
                                                ? "border-red-400 focus:ring-1 focus:ring-red-400"
                                                : "border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                                        }`}
                                    />
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                    {isSearchingArea && (
                                        <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-3 top-3" />
                                    )}
                                </div>

                                {errors.area_id && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{errors.area_id}</span>
                                    </p>
                                )}

                                {/* Dropdown Hasil Pencarian Biteship */}
                                {showAreaDropdown && areaSearchQuery.trim().length >= 3 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto">
                                        {areaResults.length === 0 ? (
                                            <div className="p-3 text-xs text-slate-500 text-center">
                                                {isSearchingArea
                                                    ? "Mencari data wilayah..."
                                                    : "Tidak ditemukan wilayah yang sesuai."}
                                            </div>
                                        ) : (
                                            areaResults.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => pilihAreaBiteship(item)}
                                                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 text-xs border-b border-slate-100 last:border-b-0 cursor-pointer flex flex-col gap-0.5 transition-colors"
                                                >
                                                    <span className="font-semibold text-slate-800">
                                                        {item.nama || `${item.kecamatan}, ${item.kota}`}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500">
                                                        {[item.kelurahan, item.kecamatan, item.kota, item.provinsi, item.kode_pos]
                                                            .filter(Boolean)
                                                            .join(", ")}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Selected Area Preview Card */}
                                {selectedAreaText && (
                                    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2 text-xs">
                                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="font-semibold text-slate-800 block">
                                                {selectedAreaText}
                                            </span>
                                            {areaId && (
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    ID Wilayah: {areaId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Detail Alamat Lengkap */}
                            <div className="space-y-1">
                                <label className="block text-xs font-semibold text-slate-600">
                                    Alamat Lengkap (Jalan, No Rumah, RT/RW, Patokan) *
                                </label>
                                <textarea
                                    value={alamatLengkap}
                                    onChange={(e) => {
                                        setAlamatLengkap(e.target.value);
                                        if (errors.alamatLengkap) {
                                            setErrors((prev) => {
                                                const u = { ...prev };
                                                delete u.alamatLengkap;
                                                return u;
                                            });
                                        }
                                    }}
                                    required
                                    rows={3}
                                    placeholder="Contoh: Jl. Kaliurang Km 5 No. 12, RT 02/RW 03, Depan Masjid"
                                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-800 focus:outline-none resize-none ${
                                        errors.alamatLengkap
                                            ? "border-red-400 focus:ring-1 focus:ring-red-400"
                                            : "border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                                    }`}
                                />
                                {errors.alamatLengkap && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{errors.alamatLengkap}</span>
                                    </p>
                                )}
                            </div>

                            {/* Checkbox Alamat Utama */}
                            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={adalahUtama}
                                    onChange={(e) => setAdalahUtama(e.target.checked)}
                                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                />
                                <span className="text-xs font-medium text-slate-700">
                                    Jadikan sebagai alamat pengiriman utama
                                </span>
                            </label>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={sedangSimpan}
                                    className="px-6 py-2 bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold text-sm rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {sedangSimpan ? "Menyimpan..." : "Simpan Alamat"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ProfileLayout>
    );
}
