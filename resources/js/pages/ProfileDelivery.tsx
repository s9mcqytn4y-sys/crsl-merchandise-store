import React, { useState, useEffect, useRef, Fragment } from "react";
import { Head, router } from "@inertiajs/react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import ProfileLayout from "../Layouts/ProfileLayout";
import {
    Trash2,
    Pencil,
    Plus,
    X,
    MapPin,
    Search,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Home,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

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
    format_lengkap?: string;
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
    addresses?: AddressItem[];
    className?: string;
}

export default function ProfileDelivery({
    user,
    addresses = [],
    className,
}: ProfileDeliveryProps) {
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
    const searchAbortRef = useRef<AbortController | null>(null);

    // In-field error states
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Debounced search for Biteship Area dengan AbortController
    useEffect(() => {
        if (areaSearchQuery.trim().length < 3) {
            setAreaResults([]);
            setIsSearchingArea(false);
            return;
        }

        searchAbortRef.current?.abort();
        const controller = new AbortController();
        searchAbortRef.current = controller;

        setIsSearchingArea(true);
        const timer = setTimeout(() => {
            fetch(
                `/api/wilayah/cari?q=${encodeURIComponent(areaSearchQuery.trim())}`,
                {
                    signal: controller.signal,
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data?.sukses && Array.isArray(data?.data)) {
                        setAreaResults(data.data);
                    } else {
                        setAreaResults([]);
                    }
                })
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        setAreaResults([]);
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setIsSearchingArea(false);
                    }
                });
        }, 350);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [areaSearchQuery]);

    // Close area dropdown when clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowAreaDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
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
        if (
            !confirm("Apakah Anda yakin ingin menghapus alamat pengiriman ini?")
        )
            return;
        setIsDeleting(id);

        router.delete(`/profile/delivery/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Alamat berhasil dihapus.");
                setIsDeleting(null);
            },
            onError: () => {
                toast.error("Gagal menghapus alamat pengiriman.");
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
            errs.alamatLengkap =
                "Alamat lengkap jalan/nomor rumah wajib diisi.";
        } else if (alamatLengkap.trim().length < 8) {
            errs.alamatLengkap =
                "Alamat lengkap terlalu pendek (minimal 8 karakter).";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSimpanAlamat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validasiForm()) return;

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
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Alamat berhasil diperbarui!");
                    setIsModalOpen(false);
                    setSedangSimpan(false);
                },
                onError: (serverErrors: any) => {
                    setErrors(serverErrors || {});
                    toast.error(
                        "Gagal memperbarui alamat. Periksa kembali formulir.",
                    );
                    setSedangSimpan(false);
                },
                onFinish: () => setSedangSimpan(false),
            });
        } else {
            router.post("/profile/delivery", payload, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Alamat baru berhasil ditambahkan!");
                    setIsModalOpen(false);
                    setSedangSimpan(false);
                },
                onError: (serverErrors: any) => {
                    setErrors(serverErrors || {});
                    toast.error(
                        "Gagal menambahkan alamat baru. Periksa kembali formulir.",
                    );
                    setSedangSimpan(false);
                },
                onFinish: () => setSedangSimpan(false),
            });
        }
    };

    return (
        <ProfileLayout activeMenu="delivery">
            <Head title="Alamat Pengiriman - CRSL Official Store" />

            <div className={cn("space-y-6 select-none", className)}>
                {/* Header Alamat Pengiriman */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                        <span className="text-xs font-black text-[#E52027] uppercase tracking-wider">
                            Informasi Pengiriman
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            Buku Alamat Saya
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Kelola alamat pengiriman untuk mempermudah
                            perhitungan ongkos kirim otomatis saat checkout.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={bukaModalTambah}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-xs shadow-red-500/20 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Tambah Alamat</span>
                    </button>
                </div>

                {/* List Alamat Pengguna */}
                <div className="space-y-4">
                    {addresses.length === 0 ? (
                        <div className="p-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200/90 space-y-2">
                            <MapPin className="w-10 h-10 text-slate-300 mx-auto stroke-[1.5]" />
                            <p className="text-sm font-black text-slate-800 tracking-tight">
                                Belum Ada Alamat Tersimpan
                            </p>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                Tambahkan alamat pengiriman utama Anda sekarang
                                agar proses checkout belanja CRSL menjadi
                                instan.
                            </p>
                        </div>
                    ) : (
                        addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className="bg-[#F8F9FA] rounded-3xl p-6 relative border border-slate-200/90 flex flex-col justify-between transition-all hover:border-slate-300 shadow-2xs"
                            >
                                <div className="space-y-2 pr-24">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                                            {addr.nama_penerima}
                                        </h3>
                                        {addr.label && (
                                            <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md font-mono">
                                                {addr.label}
                                            </span>
                                        )}
                                        {addr.adalah_utama && (
                                            <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-[#E52027] px-2.5 py-0.5 rounded-full border border-red-200/80 font-mono">
                                                Alamat Utama
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-600 font-mono">
                                        {addr.telepon}{" "}
                                        {addr.email ? `• ${addr.email}` : ""}
                                    </p>

                                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                        {addr.alamat_lengkap}
                                    </p>

                                    {(addr.kota || addr.kecamatan) && (
                                        <p className="text-xs text-slate-500 font-medium">
                                            {[
                                                addr.kelurahan,
                                                addr.kecamatan,
                                                addr.kota,
                                                addr.provinsi,
                                                addr.kode_pos,
                                            ]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </p>
                                    )}

                                    {addr.area_id && (
                                        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80 mt-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                                            <span>
                                                Wilayah Biteship Terverifikasi
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Tombol Aksi Kanan Bawah */}
                                <div className="absolute right-5 bottom-5 flex items-center gap-2">
                                    {/* Tombol Hapus */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleHapusAlamat(addr.id)
                                        }
                                        disabled={isDeleting === addr.id}
                                        className="w-9 h-9 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 border border-rose-200/70 shadow-2xs active:scale-95"
                                        aria-label="Hapus alamat pengiriman"
                                        title="Hapus alamat"
                                    >
                                        <Trash2 className="w-4 h-4 stroke-[2.2]" />
                                    </button>

                                    {/* Tombol Edit */}
                                    <button
                                        type="button"
                                        onClick={() => bukaModalEdit(addr)}
                                        className="w-9 h-9 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200 shadow-2xs active:scale-95"
                                        aria-label="Ubah alamat pengiriman"
                                        title="Ubah alamat"
                                    >
                                        <Pencil className="w-4 h-4 stroke-[2.2]" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Tambah / Edit Alamat Headless UI WAI-ARIA */}
            <Transition show={isModalOpen} as={Fragment}>
                <Dialog
                    as="div"
                    id="modal-kelola-alamat"
                    className="relative z-50 select-none"
                    onClose={() => !sedangSimpan && setIsModalOpen(false)}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                    </TransitionChild>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-200"
                                enterFrom="opacity-0 scale-95 -translate-y-2"
                                enterTo="opacity-100 scale-100 translate-y-0"
                                leave="ease-in duration-150"
                                leaveFrom="opacity-100 scale-100 translate-y-0"
                                leaveTo="opacity-0 scale-95 -translate-y-2"
                            >
                                <DialogPanel className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 text-left transition-all max-h-[calc(100dvh-3rem)] flex flex-col">
                                    {/* Header Modal */}
                                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-2xl bg-red-50 text-[#E52027] border border-red-100 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4 stroke-[2.2]" />
                                            </div>
                                            <div>
                                                <DialogTitle
                                                    as="h3"
                                                    className="text-base sm:text-lg font-black text-slate-900 tracking-tight"
                                                >
                                                    {editTarget
                                                        ? "Ubah Alamat Pengiriman"
                                                        : "Tambah Alamat Pengiriman"}
                                                </DialogTitle>
                                                <p className="text-[11px] text-slate-500">
                                                    Pastikan data alamat dan
                                                    kecamatan akurat untuk
                                                    Biteship
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsModalOpen(false)
                                            }
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                            aria-label="Tutup jendela alamat"
                                        >
                                            <X className="w-4 h-4 stroke-[2.2]" />
                                        </button>
                                    </div>

                                    {/* Form Content */}
                                    <form
                                        onSubmit={handleSimpanAlamat}
                                        className="space-y-4 pt-4 overflow-y-auto no-scrollbar overscroll-contain flex-1 pr-0.5"
                                    >
                                        {/* Label Alamat */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="form-label-alamat"
                                                className="block text-xs font-bold text-slate-700"
                                            >
                                                Label Alamat
                                            </label>
                                            <input
                                                id="form-label-alamat"
                                                type="text"
                                                value={label}
                                                onChange={(e) =>
                                                    setLabel(e.target.value)
                                                }
                                                placeholder="Contoh: Rumah, Kantor, Kos"
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 transition-all shadow-2xs font-medium"
                                            />
                                        </div>

                                        {/* Nama Penerima */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="form-nama-penerima"
                                                className="block text-xs font-bold text-slate-700"
                                            >
                                                Nama Penerima{" "}
                                                <span className="text-[#E52027]">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                id="form-nama-penerima"
                                                type="text"
                                                value={namaPenerima}
                                                onChange={(e) => {
                                                    setNamaPenerima(
                                                        e.target.value,
                                                    );
                                                    if (errors.namaPenerima) {
                                                        setErrors((prev) => {
                                                            const u = {
                                                                ...prev,
                                                            };
                                                            delete u.namaPenerima;
                                                            return u;
                                                        });
                                                    }
                                                }}
                                                required
                                                aria-invalid={Boolean(
                                                    errors.namaPenerima,
                                                )}
                                                aria-describedby={
                                                    errors.namaPenerima
                                                        ? "err-nama-penerima"
                                                        : undefined
                                                }
                                                placeholder="Nama lengkap penerima paket"
                                                className={cn(
                                                    "w-full px-3.5 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs font-medium",
                                                    errors.namaPenerima
                                                        ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                                        : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10",
                                                )}
                                            />
                                            {errors.namaPenerima && (
                                                <p
                                                    id="err-nama-penerima"
                                                    role="alert"
                                                    className="text-xs text-rose-600 flex items-center gap-1.5 font-semibold pt-0.5 animate-in fade-in"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>
                                                        {errors.namaPenerima}
                                                    </span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Telepon & Email */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label
                                                    htmlFor="form-telepon"
                                                    className="block text-xs font-bold text-slate-700"
                                                >
                                                    Nomor Telepon WhatsApp{" "}
                                                    <span className="text-[#E52027]">
                                                        *
                                                    </span>
                                                </label>
                                                <input
                                                    id="form-telepon"
                                                    type="tel"
                                                    value={telepon}
                                                    onChange={(e) => {
                                                        setTelepon(
                                                            e.target.value,
                                                        );
                                                        if (errors.telepon) {
                                                            setErrors(
                                                                (prev) => {
                                                                    const u = {
                                                                        ...prev,
                                                                    };
                                                                    delete u.telepon;
                                                                    return u;
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    required
                                                    aria-invalid={Boolean(
                                                        errors.telepon,
                                                    )}
                                                    aria-describedby={
                                                        errors.telepon
                                                            ? "err-telepon"
                                                            : undefined
                                                    }
                                                    placeholder="08xxxxxxxxxx"
                                                    className={cn(
                                                        "w-full px-3.5 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs font-mono font-bold",
                                                        errors.telepon
                                                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                                            : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10",
                                                    )}
                                                />
                                                {errors.telepon && (
                                                    <p
                                                        id="err-telepon"
                                                        role="alert"
                                                        className="text-xs text-rose-600 flex items-center gap-1.5 font-semibold pt-0.5 animate-in fade-in"
                                                    >
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        <span>
                                                            {errors.telepon}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                <label
                                                    htmlFor="form-email"
                                                    className="block text-xs font-bold text-slate-700"
                                                >
                                                    Email Konfirmasi
                                                </label>
                                                <input
                                                    id="form-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    placeholder="alamat@email.com"
                                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 transition-all shadow-2xs font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* Autocomplete Pencarian Wilayah Pengiriman */}
                                        <div
                                            className="space-y-1.5 relative"
                                            ref={dropdownRef}
                                        >
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="form-cari-wilayah"
                                                    className="block text-xs font-bold text-slate-700"
                                                >
                                                    Kecamatan / Kota (Biteship){" "}
                                                    <span className="text-[#E52027]">
                                                        *
                                                    </span>
                                                </label>
                                                {areaId && (
                                                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                                                        Terverifikasi
                                                    </span>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <input
                                                    id="form-cari-wilayah"
                                                    type="text"
                                                    value={areaSearchQuery}
                                                    onChange={(e) => {
                                                        setAreaSearchQuery(
                                                            e.target.value,
                                                        );
                                                        setShowAreaDropdown(
                                                            true,
                                                        );
                                                    }}
                                                    onFocus={() =>
                                                        setShowAreaDropdown(
                                                            true,
                                                        )
                                                    }
                                                    placeholder="Ketik minimal 3 huruf (contoh: Sleman, Tebet)..."
                                                    aria-invalid={Boolean(
                                                        errors.area_id,
                                                    )}
                                                    aria-describedby={
                                                        errors.area_id
                                                            ? "err-area-id"
                                                            : undefined
                                                    }
                                                    className={cn(
                                                        "w-full pl-9 pr-9 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs font-medium",
                                                        errors.area_id
                                                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                                            : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10",
                                                    )}
                                                />
                                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none stroke-[2.2]" />
                                                {isSearchingArea && (
                                                    <Loader2 className="w-4 h-4 text-[#E52027] animate-spin absolute right-3 top-3" />
                                                )}
                                            </div>

                                            {errors.area_id && (
                                                <p
                                                    id="err-area-id"
                                                    role="alert"
                                                    className="text-xs text-rose-600 flex items-center gap-1.5 font-semibold pt-0.5 animate-in fade-in"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>
                                                        {errors.area_id}
                                                    </span>
                                                </p>
                                            )}

                                            {/* Dropdown Hasil Pencarian Biteship */}
                                            {showAreaDropdown &&
                                                areaSearchQuery.trim().length >=
                                                    3 && (
                                                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto no-scrollbar">
                                                        {areaResults.length ===
                                                        0 ? (
                                                            <div className="p-3.5 text-xs text-slate-500 text-center font-medium">
                                                                {isSearchingArea
                                                                    ? "Mencari data wilayah..."
                                                                    : "Tidak ditemukan wilayah yang sesuai."}
                                                            </div>
                                                        ) : (
                                                            areaResults.map(
                                                                (item) => (
                                                                    <button
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            pilihAreaBiteship(
                                                                                item,
                                                                            )
                                                                        }
                                                                        className="w-full text-left px-4 py-2.5 hover:bg-red-50/40 text-xs border-b border-slate-100 last:border-b-0 cursor-pointer flex flex-col gap-0.5 transition-colors"
                                                                    >
                                                                        <span className="font-bold text-slate-900">
                                                                            {item.nama ||
                                                                                `${item.kecamatan}, ${item.kota}`}
                                                                        </span>
                                                                        <span className="text-[11px] text-slate-500">
                                                                            {[
                                                                                item.kelurahan,
                                                                                item.kecamatan,
                                                                                item.kota,
                                                                                item.provinsi,
                                                                                item.kode_pos,
                                                                            ]
                                                                                .filter(
                                                                                    Boolean,
                                                                                )
                                                                                .join(
                                                                                    ", ",
                                                                                )}
                                                                        </span>
                                                                    </button>
                                                                ),
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                            {/* Pratinjau Wilayah Terpilih */}
                                            {selectedAreaText && (
                                                <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-2.5 text-xs shadow-2xs">
                                                    <MapPin className="w-4 h-4 text-[#E52027] shrink-0 mt-0.5 stroke-[2.2]" />
                                                    <div className="flex-1 space-y-0.5">
                                                        <span className="font-bold text-slate-900 block">
                                                            {selectedAreaText}
                                                        </span>
                                                        {areaId && (
                                                            <span className="text-[10px] text-slate-500 font-mono">
                                                                ID Wilayah
                                                                Biteship:{" "}
                                                                {areaId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Detail Alamat Lengkap */}
                                        <div className="space-y-1.5">
                                            <label
                                                htmlFor="form-alamat-lengkap"
                                                className="block text-xs font-bold text-slate-700"
                                            >
                                                Alamat Lengkap (Jalan, No Rumah,
                                                RT/RW, Patokan){" "}
                                                <span className="text-[#E52027]">
                                                    *
                                                </span>
                                            </label>
                                            <textarea
                                                id="form-alamat-lengkap"
                                                value={alamatLengkap}
                                                onChange={(e) => {
                                                    setAlamatLengkap(
                                                        e.target.value,
                                                    );
                                                    if (errors.alamatLengkap) {
                                                        setErrors((prev) => {
                                                            const u = {
                                                                ...prev,
                                                            };
                                                            delete u.alamatLengkap;
                                                            return u;
                                                        });
                                                    }
                                                }}
                                                required
                                                rows={3}
                                                aria-invalid={Boolean(
                                                    errors.alamatLengkap,
                                                )}
                                                aria-describedby={
                                                    errors.alamatLengkap
                                                        ? "err-alamat-lengkap"
                                                        : undefined
                                                }
                                                placeholder="Contoh: Jl. Kaliurang Km 5 No. 12, RT 02/RW 03, Depan Masjid"
                                                className={cn(
                                                    "w-full px-3.5 py-2.5 bg-white border rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none resize-none transition-all shadow-2xs font-medium",
                                                    errors.alamatLengkap
                                                        ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                                        : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10",
                                                )}
                                            />
                                            {errors.alamatLengkap && (
                                                <p
                                                    id="err-alamat-lengkap"
                                                    role="alert"
                                                    className="text-xs text-rose-600 flex items-center gap-1.5 font-semibold pt-0.5 animate-in fade-in"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                    <span>
                                                        {errors.alamatLengkap}
                                                    </span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Checkbox Alamat Utama */}
                                        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                                            <input
                                                type="checkbox"
                                                checked={adalahUtama}
                                                onChange={(e) =>
                                                    setAdalahUtama(
                                                        e.target.checked,
                                                    )
                                                }
                                                className="rounded-md text-[#E52027] focus:ring-[#E52027] w-4 h-4 cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-slate-800">
                                                Jadikan sebagai alamat
                                                pengiriman utama
                                            </span>
                                        </label>

                                        {/* Sticky Action Footer */}
                                        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsModalOpen(false)
                                                }
                                                disabled={sedangSimpan}
                                                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                Batal
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={sedangSimpan}
                                                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                {sedangSimpan ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>
                                                            Menyimpan...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span>Simpan Alamat</span>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </ProfileLayout>
    );
}
