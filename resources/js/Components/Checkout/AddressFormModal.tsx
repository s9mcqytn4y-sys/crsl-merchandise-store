import React, { useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Search, Loader2, AlertCircle } from "lucide-react";
import { router } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastNotifikasi } from "../../Utils/toastNotifikasi";
import { cn } from "../../lib/utils";
import { addressSchema, type AddressFormData } from "../../Validation/addressSchema";
import { AddressItem } from "./AddressSelectModal";

interface BiteshipAreaResult {
    id: string;
    nama: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan?: string;
    kode_pos?: string;
}

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingAddress: AddressItem | null;
    onAddressSaved: (savedAddress: AddressItem) => void;
}

export default function AddressFormModal({
    isOpen,
    onClose,
    editingAddress,
    onAddressSaved,
}: AddressFormModalProps) {
    const [loading, setLoading] = useState(false);

    // Biteship autocomplete search
    const [areaSearchQuery, setAreaSearchQuery] = useState("");
    const [areaResults, setAreaResults] = useState<BiteshipAreaResult[]>([]);
    const [isSearchingArea, setIsSearchingArea] = useState(false);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);
    const [selectedAreaText, setSelectedAreaText] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<AddressFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            label: "Rumah",
            nama_penerima: "",
            telepon: "",
            email: "",
            area_id: "",
            provinsi: "",
            kota: "",
            kecamatan: "",
            kelurahan: "",
            kode_pos: "",
            alamat_lengkap: "",
            adalah_utama: false,
        },
    });

    const currentLabel = watch("label");

    useEffect(() => {
        if (isOpen) {
            if (editingAddress) {
                reset({
                    label: editingAddress.label || "Rumah",
                    nama_penerima: editingAddress.nama_penerima || "",
                    telepon: editingAddress.telepon || "",
                    email: editingAddress.email || "",
                    area_id: editingAddress.area_id || "",
                    provinsi: editingAddress.provinsi || "",
                    kota: editingAddress.kota || "",
                    kecamatan: editingAddress.kecamatan || "",
                    kelurahan: editingAddress.kelurahan || "",
                    kode_pos: editingAddress.kode_pos || "",
                    alamat_lengkap: editingAddress.alamat_lengkap || "",
                    adalah_utama: editingAddress.adalah_utama || false,
                });

                const currentText = [
                    editingAddress.kelurahan ? `Kel. ${editingAddress.kelurahan}` : "",
                    editingAddress.kecamatan ? `Kec. ${editingAddress.kecamatan}` : "",
                    editingAddress.kota,
                    editingAddress.provinsi,
                    editingAddress.kode_pos,
                ]
                    .filter(Boolean)
                    .join(", ");
                setSelectedAreaText(currentText);
            } else {
                reset({
                    label: "Rumah",
                    nama_penerima: "",
                    telepon: "",
                    email: "",
                    area_id: "",
                    provinsi: "",
                    kota: "",
                    kecamatan: "",
                    kelurahan: "",
                    kode_pos: "",
                    alamat_lengkap: "",
                    adalah_utama: false,
                });
                setSelectedAreaText("");
            }
            setAreaSearchQuery("");
            setShowAreaDropdown(false);
        }
    }, [isOpen, editingAddress, reset]);

    // Debounce search area
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
                .catch(() => setAreaResults([]))
                .finally(() => setIsSearchingArea(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [areaSearchQuery]);

    const pilihArea = (area: BiteshipAreaResult) => {
        setValue("area_id", area.id, { shouldValidate: true });
        setValue("provinsi", area.provinsi || "");
        setValue("kota", area.kota || "", { shouldValidate: true });
        setValue("kecamatan", area.kecamatan || "");
        setValue("kelurahan", area.kelurahan || "");
        setValue("kode_pos", area.kode_pos || "", { shouldValidate: true });

        const labelWilayah = [
            area.kelurahan ? `Kel. ${area.kelurahan}` : "",
            area.kecamatan ? `Kec. ${area.kecamatan}` : "",
            area.kota,
            area.provinsi,
            area.kode_pos,
        ]
            .filter(Boolean)
            .join(", ");

        setSelectedAreaText(labelWilayah);
        setShowAreaDropdown(false);
        setAreaSearchQuery("");
    };

    const onSubmit = (formData: AddressFormData) => {
        setLoading(true);
        const payload = {
            label: formData.label,
            nama_penerima: formData.nama_penerima.trim(),
            telepon: formData.telepon.trim(),
            email: formData.email?.trim() || null,
            area_id: formData.area_id || null,
            provinsi: formData.provinsi,
            kota: formData.kota,
            kecamatan: formData.kecamatan,
            kelurahan: formData.kelurahan || null,
            kode_pos: formData.kode_pos,
            alamat_lengkap: formData.alamat_lengkap.trim(),
            adalah_utama: formData.adalah_utama,
        };

        const targetUrl = editingAddress
            ? `/profile/delivery/${editingAddress.id}`
            : "/profile/delivery";

        const method = editingAddress ? "put" : "post";

        router[method](targetUrl, payload, {
            preserveScroll: true,
            onSuccess: () => {
                toastNotifikasi.sukses("Alamat pengiriman berhasil disimpan.");
                setLoading(false);
                onClose();
                const formatLengkap = [
                    formData.alamat_lengkap,
                    formData.kecamatan,
                    formData.kota,
                    formData.provinsi,
                    formData.kode_pos,
                ]
                    .filter(Boolean)
                    .join(", ");

                onAddressSaved({
                    id: editingAddress?.id || Date.now(),
                    ...payload,
                    format_lengkap: formatLengkap,
                } as AddressItem);
            },
            onError: (errs) => {
                toastNotifikasi.error(
                    (Object.values(errs)[0] as string) || "Gagal menyimpan alamat."
                );
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-[540px] transform overflow-hidden rounded-[28px] bg-white p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <Dialog.Title className="text-base sm:text-lg font-bold text-slate-900">
                                        {editingAddress ? "Ubah Alamat Pengiriman" : "Tambah Alamat Pengiriman"}
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                                    {/* Label */}
                                    <div className="flex gap-2">
                                        {["Rumah", "Kantor", "Kos"].map((l) => (
                                            <button
                                                key={l}
                                                type="button"
                                                onClick={() => setValue("label", l)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                                                    currentLabel === l
                                                        ? "bg-slate-900 text-white"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                )}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Nama Penerima */}
                                    <div>
                                        <label htmlFor="modal-nama-penerima" className="block text-xs font-semibold text-slate-700 mb-1">
                                            Nama Penerima*
                                        </label>
                                        <input
                                            id="modal-nama-penerima"
                                            type="text"
                                            autoComplete="name"
                                            {...register("nama_penerima")}
                                            placeholder="Nama lengkap penerima"
                                            aria-invalid={!!errors.nama_penerima}
                                            aria-describedby={errors.nama_penerima ? "err-nama-penerima" : undefined}
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 focus:outline-none transition-all",
                                                errors.nama_penerima
                                                    ? "border-red-500 bg-red-50/20"
                                                    : "border-slate-300 focus:border-slate-800"
                                            )}
                                        />
                                        {errors.nama_penerima && (
                                            <p id="err-nama-penerima" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                {errors.nama_penerima.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* No Telepon */}
                                    <div>
                                        <label htmlFor="modal-telepon" className="block text-xs font-semibold text-slate-700 mb-1">
                                            Nomor Handphone*
                                        </label>
                                        <input
                                            id="modal-telepon"
                                            type="tel"
                                            autoComplete="tel"
                                            {...register("telepon")}
                                            placeholder="Contoh: 08123456789"
                                            aria-invalid={!!errors.telepon}
                                            aria-describedby={errors.telepon ? "err-telepon" : undefined}
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 focus:outline-none transition-all",
                                                errors.telepon
                                                    ? "border-red-500 bg-red-50/20"
                                                    : "border-slate-300 focus:border-slate-800"
                                            )}
                                        />
                                        {errors.telepon && (
                                            <p id="err-telepon" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                {errors.telepon.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Autocomplete Wilayah Pengiriman */}
                                    <div className="relative" ref={dropdownRef}>
                                        <label htmlFor="modal-area-search" className="block text-xs font-semibold text-slate-700 mb-1">
                                            Kecamatan / Kota / Kode Pos*
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="modal-area-search"
                                                type="text"
                                                autoComplete="off"
                                                value={areaSearchQuery || selectedAreaText}
                                                onChange={(e) => {
                                                    setAreaSearchQuery(e.target.value);
                                                    setShowAreaDropdown(true);
                                                }}
                                                onFocus={() => setShowAreaDropdown(true)}
                                                placeholder="Ketik min. 3 karakter: Sleman, Johar Baru, 10560..."
                                                className={cn(
                                                    "w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 focus:outline-none transition-all",
                                                    errors.kota || errors.kode_pos
                                                        ? "border-red-500 bg-red-50/20"
                                                        : "border-slate-300 focus:border-slate-800"
                                                )}
                                            />
                                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            {isSearchingArea && (
                                                <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                                            )}
                                        </div>

                                        {/* Dropdown hasil */}
                                        {showAreaDropdown && areaResults.length > 0 && (
                                            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                                                {areaResults.map((area) => (
                                                    <div
                                                        key={area.id}
                                                        onClick={() => pilihArea(area)}
                                                        className="p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="text-xs font-bold text-slate-800">
                                                            {area.kecamatan}, {area.kota}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500">
                                                            {area.provinsi} {area.kode_pos ? `• ${area.kode_pos}` : ""}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {(errors.kota || errors.kode_pos) && (
                                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                {errors.kota?.message || errors.kode_pos?.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Alamat Lengkap */}
                                    <div>
                                        <label htmlFor="modal-alamat-lengkap" className="block text-xs font-semibold text-slate-700 mb-1">
                                            Alamat Lengkap (Jalan, RT/RW, No. Rumah)*
                                        </label>
                                        <textarea
                                            id="modal-alamat-lengkap"
                                            rows={2}
                                            autoComplete="street-address"
                                            {...register("alamat_lengkap")}
                                            placeholder="Contoh: Jl. Kaliurang Km 5 No. 12, RT 01 / RW 02"
                                            aria-invalid={!!errors.alamat_lengkap}
                                            aria-describedby={errors.alamat_lengkap ? "err-alamat-lengkap" : undefined}
                                            className={cn(
                                                "w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-slate-800 focus:outline-none transition-all",
                                                errors.alamat_lengkap
                                                    ? "border-red-500 bg-red-50/20"
                                                    : "border-slate-300 focus:border-slate-800"
                                            )}
                                        />
                                        {errors.alamat_lengkap && (
                                            <p id="err-alamat-lengkap" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                {errors.alamat_lengkap.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-[#E52027] hover:bg-[#CC1C22] active:scale-98 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            {loading ? "Menyimpan..." : "Simpan Alamat"}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
