import React, {
    useState,
    useEffect,
    useRef,
    Fragment,
    useCallback,
} from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { X, Search, Loader2, AlertCircle, MapPin } from "lucide-react";
import { router } from "@inertiajs/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toastNotifikasi } from "../../Utils/toastNotifikasi";
import { cn } from "../../lib/utils";
import {
    addressSchema,
    type AddressFormData,
} from "../../Validation/addressSchema";
import { AddressItem } from "./AddressSelectModal";

interface BiteshipAreaResult {
    id: string;
    nama?: string;
    provinsi: string;
    kota: string;
    kecamatan: string;
    kelurahan?: string;
    kode_pos?: string;
}

interface AddressFormModalProps {
    isOpen?: boolean;
    onClose: () => void;
    editingAddress?: AddressItem | null;
    onAddressSaved: (savedAddress: AddressItem) => void;
    className?: string;
}

export default function AddressFormModal({
    isOpen = false,
    onClose,
    editingAddress = null,
    onAddressSaved,
    className,
}: AddressFormModalProps) {
    const isVisible = Boolean(isOpen);
    const [loading, setLoading] = useState(false);

    // Biteship autocomplete search state
    const [areaInputText, setAreaInputText] = useState("");
    const [areaResults, setAreaResults] = useState<BiteshipAreaResult[]>([]);
    const [isSearchingArea, setIsSearchingArea] = useState(false);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);

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

    // Sinkronisasi data saat modal dibuka atau editingAddress berubah
    useEffect(() => {
        if (isVisible) {
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
                    adalah_utama: Boolean(editingAddress.adalah_utama),
                });

                const currentText = [
                    editingAddress.kelurahan
                        ? `Kel. ${editingAddress.kelurahan}`
                        : "",
                    editingAddress.kecamatan
                        ? `Kec. ${editingAddress.kecamatan}`
                        : "",
                    editingAddress.kota,
                    editingAddress.provinsi,
                    editingAddress.kode_pos,
                ]
                    .filter(Boolean)
                    .join(", ");

                setAreaInputText(currentText);
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
                setAreaInputText("");
            }
            setAreaResults([]);
            setShowAreaDropdown(false);
            setHighlightedIndex(-1);
        }
    }, [isVisible, editingAddress, reset]);

    // Tutup dropdown jika klik di luar area
    useEffect(() => {
        if (!showAreaDropdown) return;

        function handleOutsideClick(e: MouseEvent | TouchEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setShowAreaDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };
    }, [showAreaDropdown]);

    // Pencarian area dengan Debounce + AbortController anti-race-condition
    useEffect(() => {
        const query = areaInputText.trim();
        if (query.length < 3) {
            setAreaResults([]);
            setIsSearchingArea(false);
            return;
        }

        const controller = new AbortController();
        setIsSearchingArea(true);

        const timer = setTimeout(() => {
            fetch(`/api/wilayah/cari?q=${encodeURIComponent(query)}`, {
                signal: controller.signal,
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data?.sukses && Array.isArray(data?.data)) {
                        setAreaResults(data.data);
                        setShowAreaDropdown(true);
                        setHighlightedIndex(-1);
                    } else {
                        setAreaResults([]);
                    }
                })
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        setAreaResults([]);
                    }
                })
                .finally(() => setIsSearchingArea(false));
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [areaInputText]);

    const pilihArea = useCallback(
        (area: BiteshipAreaResult) => {
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

            setAreaInputText(labelWilayah);
            setShowAreaDropdown(false);
            setAreaResults([]);
            setHighlightedIndex(-1);
        },
        [setValue],
    );

    // Otomatis scroll kontainer dropdown saat keyboard bernavigasi
    useEffect(() => {
        if (highlightedIndex >= 0 && listboxRef.current) {
            const activeEl = listboxRef.current.children[
                highlightedIndex
            ] as HTMLElement;
            if (activeEl) {
                activeEl.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex]);

    // Navigasi keyboard dropdown wilayah (ArrowDown, ArrowUp, Enter, Escape)
    const handleAreaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showAreaDropdown || areaResults.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev < areaResults.length - 1 ? prev + 1 : 0,
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((prev) =>
                prev > 0 ? prev - 1 : areaResults.length - 1,
            );
        } else if (e.key === "Enter" && highlightedIndex >= 0) {
            e.preventDefault();
            pilihArea(areaResults[highlightedIndex]);
        } else if (e.key === "Escape") {
            setShowAreaDropdown(false);
        }
    };

    const onSubmit = (formData: AddressFormData) => {
        setLoading(true);
        const payload = {
            label: formData.label,
            nama_penerima: formData.nama_penerima.trim(),
            telepon: formData.telepon.trim().replace(/\D/g, ""),
            email: formData.email?.trim() || null,
            area_id: formData.area_id || null,
            provinsi: formData.provinsi?.trim() || "",
            kota: formData.kota?.trim() || "",
            kecamatan: formData.kecamatan?.trim() || "",
            kelurahan: formData.kelurahan?.trim() || null,
            kode_pos: formData.kode_pos?.trim() || "",
            alamat_lengkap: formData.alamat_lengkap.trim(),
            adalah_utama: Boolean(formData.adalah_utama),
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
                const firstErr =
                    typeof errs === "object" ? Object.values(errs)[0] : null;
                toastNotifikasi.error(
                    (firstErr as string) ||
                        "Gagal menyimpan alamat pengiriman.",
                );
                setLoading(false);
            },
            onFinish: () => setLoading(false),
        });
    };

    return (
        <Transition show={isVisible} as={Fragment}>
            <Dialog
                as="div"
                id="modal-form-alamat-pengiriman"
                className={cn("relative z-50 select-none", className)}
                onClose={onClose}
            >
                {/* Backdrop Layer */}
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

                {/* Kontainer Modal Tengah */}
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
                            <DialogPanel className="w-full max-w-[540px] transform overflow-hidden rounded-3xl bg-white p-5 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200/90">
                                {/* Header Modal */}
                                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-2xl bg-red-50 text-primary border border-red-100 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4 stroke-[2.2]" />
                                        </div>
                                        <DialogTitle className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                            {editingAddress
                                                ? "Ubah Alamat Pengiriman"
                                                : "Tambah Alamat Pengiriman"}
                                        </DialogTitle>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        aria-label="Tutup form alamat"
                                    >
                                        <X className="w-4 h-4 stroke-[2.2]" />
                                    </button>
                                </div>

                                {/* Form Input */}
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="py-4 space-y-4 max-h-[72vh] overflow-y-auto pr-1 no-scrollbar"
                                    noValidate
                                >
                                    {/* Pilihan Label Alamat */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Label Alamat
                                        </label>
                                        <div className="flex gap-2">
                                            {["Rumah", "Kantor", "Kos"].map(
                                                (l) => (
                                                    <button
                                                        key={l}
                                                        type="button"
                                                        onClick={() =>
                                                            setValue("label", l)
                                                        }
                                                        className={cn(
                                                            "px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                                                            currentLabel === l
                                                                ? "bg-slate-900 text-white shadow-2xs"
                                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                                                        )}
                                                    >
                                                        {l}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    {/* Nama Penerima */}
                                    <div>
                                        <label
                                            htmlFor="modal-nama-penerima"
                                            className="block text-xs font-bold text-slate-700 mb-1"
                                        >
                                            Nama Lengkap Penerima{" "}
                                            <span className="text-primary">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            id="modal-nama-penerima"
                                            type="text"
                                            autoComplete="name"
                                            {...register("nama_penerima")}
                                            placeholder="Nama penerima paket"
                                            aria-invalid={Boolean(
                                                errors.nama_penerima,
                                            )}
                                            aria-describedby={
                                                errors.nama_penerima
                                                    ? "err-nama-penerima"
                                                    : undefined
                                            }
                                            className={cn(
                                                "w-full px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs",
                                                errors.nama_penerima
                                                    ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                                    : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10",
                                            )}
                                        />
                                        {errors.nama_penerima && (
                                            <p
                                                id="err-nama-penerima"
                                                role="alert"
                                                className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in"
                                            >
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>
                                                    {
                                                        errors.nama_penerima
                                                            .message
                                                    }
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Nomor Telepon */}
                                    <div>
                                        <label
                                            htmlFor="modal-telepon"
                                            className="block text-xs font-bold text-slate-700 mb-1"
                                        >
                                            Nomor Handphone / WhatsApp{" "}
                                            <span className="text-primary">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            id="modal-telepon"
                                            type="tel"
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            {...register("telepon")}
                                            placeholder="Contoh: 08123456789"
                                            aria-invalid={Boolean(
                                                errors.telepon,
                                            )}
                                            aria-describedby={
                                                errors.telepon
                                                    ? "err-telepon"
                                                    : undefined
                                            }
                                            className={cn(
                                                "w-full px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-mono text-slate-900 focus:outline-none transition-all shadow-2xs",
                                                errors.telepon
                                                    ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                                    : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10",
                                            )}
                                        />
                                        {errors.telepon && (
                                            <p
                                                id="err-telepon"
                                                role="alert"
                                                className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in"
                                            >
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>
                                                    {errors.telepon.message}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Autocomplete Wilayah Ekspedisi (Biteship Area ID) */}
                                    <div className="relative" ref={dropdownRef}>
                                        <label
                                            htmlFor="modal-area-search"
                                            className="block text-xs font-bold text-slate-700 mb-1"
                                        >
                                            Kecamatan, Kota, atau Kode Pos{" "}
                                            <span className="text-primary">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="modal-area-search"
                                                type="text"
                                                autoComplete="off"
                                                role="combobox"
                                                aria-autocomplete="list"
                                                aria-expanded={showAreaDropdown}
                                                aria-controls="area-results-listbox"
                                                aria-activedescendant={
                                                    highlightedIndex >= 0
                                                        ? `area-option-${highlightedIndex}`
                                                        : undefined
                                                }
                                                value={areaInputText}
                                                onKeyDown={handleAreaKeyDown}
                                                onChange={(e) => {
                                                    setAreaInputText(
                                                        e.target.value,
                                                    );
                                                    setShowAreaDropdown(true);
                                                    setValue("area_id", "");
                                                }}
                                                onFocus={() => {
                                                    if (areaResults.length > 0)
                                                        setShowAreaDropdown(
                                                            true,
                                                        );
                                                }}
                                                placeholder="Ketik min. 3 karakter: Sleman, Johar Baru, 55281..."
                                                aria-invalid={Boolean(
                                                    errors.kota ||
                                                    errors.kode_pos ||
                                                    errors.area_id,
                                                )}
                                                className={cn(
                                                    "w-full pl-9 pr-8 py-2.5 rounded-2xl border text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs",
                                                    errors.kota ||
                                                        errors.kode_pos ||
                                                        errors.area_id
                                                        ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                                        : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10",
                                                )}
                                            />
                                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            {isSearchingArea && (
                                                <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                                            )}
                                        </div>

                                        {/* Dropdown Listbox Hasil Pencarian Wilayah */}
                                        {showAreaDropdown &&
                                            areaResults.length > 0 && (
                                                <div
                                                    id="area-results-listbox"
                                                    ref={listboxRef}
                                                    role="listbox"
                                                    aria-label="Pilihan wilayah pengiriman"
                                                    className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150"
                                                >
                                                    {areaResults.map(
                                                        (area, index) => {
                                                            const isHighlighted =
                                                                highlightedIndex ===
                                                                index;
                                                            return (
                                                                <div
                                                                    key={
                                                                        area.id
                                                                    }
                                                                    id={`area-option-${index}`}
                                                                    role="option"
                                                                    aria-selected={
                                                                        isHighlighted
                                                                    }
                                                                    onClick={() =>
                                                                        pilihArea(
                                                                            area,
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        "p-3 text-left cursor-pointer transition-colors",
                                                                        isHighlighted
                                                                            ? "bg-red-50/50"
                                                                            : "hover:bg-slate-50",
                                                                    )}
                                                                >
                                                                    <div className="text-xs font-bold text-slate-900">
                                                                        {
                                                                            area.kecamatan
                                                                        }
                                                                        ,{" "}
                                                                        {
                                                                            area.kota
                                                                        }
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-500 font-medium">
                                                                        {
                                                                            area.provinsi
                                                                        }{" "}
                                                                        {area.kode_pos
                                                                            ? `• Kode Pos: ${area.kode_pos}`
                                                                            : ""}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            )}

                                        {(errors.kota ||
                                            errors.kode_pos ||
                                            errors.area_id) && (
                                            <p
                                                role="alert"
                                                className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in"
                                            >
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>
                                                    {errors.area_id?.message ||
                                                        errors.kota?.message ||
                                                        errors.kode_pos
                                                            ?.message ||
                                                        "Wajib memilih wilayah resmi dari daftar"}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Alamat Lengkap / Patokan */}
                                    <div>
                                        <label
                                            htmlFor="modal-alamat-lengkap"
                                            className="block text-xs font-bold text-slate-700 mb-1"
                                        >
                                            Alamat Lengkap & Patokan{" "}
                                            <span className="text-primary">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            id="modal-alamat-lengkap"
                                            rows={2}
                                            autoComplete="street-address"
                                            {...register("alamat_lengkap")}
                                            placeholder="Contoh: Jl. Palagan Tentara Pelajar Km 9 No. 42 (Pagar Hitam Depan Indomaret)"
                                            aria-invalid={Boolean(
                                                errors.alamat_lengkap,
                                            )}
                                            aria-describedby={
                                                errors.alamat_lengkap
                                                    ? "err-alamat-lengkap"
                                                    : undefined
                                            }
                                            className={cn(
                                                "w-full px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm text-slate-900 focus:outline-none transition-all shadow-2xs resize-none",
                                                errors.alamat_lengkap
                                                    ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                                    : "border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10",
                                            )}
                                        />
                                        {errors.alamat_lengkap && (
                                            <p
                                                id="err-alamat-lengkap"
                                                role="alert"
                                                className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1 animate-in fade-in"
                                            >
                                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                <span>
                                                    {
                                                        errors.alamat_lengkap
                                                            .message
                                                    }
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Checkbox Jadikan Alamat Utama */}
                                    <div className="pt-1">
                                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                {...register("adalah_utama")}
                                                className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-slate-700">
                                                Jadikan sebagai alamat
                                                pengiriman utama
                                            </span>
                                        </label>
                                    </div>

                                    {/* Tombol Simpan Alamat */}
                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full min-h-[46px] py-3 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>
                                                        Menyimpan Alamat...
                                                    </span>
                                                </>
                                            ) : (
                                                <span>
                                                    Simpan Alamat Pengiriman
                                                </span>
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
    );
}
