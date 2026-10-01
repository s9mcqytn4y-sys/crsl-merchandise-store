import React, { useState, useEffect, useCallback } from "react";
import { router } from "@inertiajs/react";
import {
    X,
    User,
    Phone,
    MapPin,
    FileText,
    Loader2,
    AlertTriangle,
    Lock,
    Save,
} from "lucide-react";
import { toast } from "sonner";

interface InitialAddressData {
    nama_penerima?: string;
    telepon?: string;
    alamat_lengkap?: string;
    catatan?: string;
}

interface ModalUbahAlamatProps {
    isOpen: boolean;
    onClose: () => void;
    nomorPesanan: string;
    initialData?: InitialAddressData;
    namaPenerimaDefault?: string;
    teleponDefault?: string;
    alamatLengkapDefault?: string;
    catatanDefault?: string;
    wilayahTerkunci?: string;
    onSuccess?: () => void;
}

export default function ModalUbahAlamat({
    isOpen,
    onClose,
    nomorPesanan,
    initialData,
    namaPenerimaDefault = "",
    teleponDefault = "",
    alamatLengkapDefault = "",
    catatanDefault = "",
    wilayahTerkunci = "",
    onSuccess,
}: ModalUbahAlamatProps) {
    const resolveInitialData = useCallback(
        () => ({
            nama_penerima:
                initialData?.nama_penerima || namaPenerimaDefault || "",
            telepon: initialData?.telepon || teleponDefault || "",
            alamat_lengkap:
                initialData?.alamat_lengkap || alamatLengkapDefault || "",
            catatan: initialData?.catatan || catatanDefault || "",
        }),
        [
            initialData,
            namaPenerimaDefault,
            teleponDefault,
            alamatLengkapDefault,
            catatanDefault,
        ],
    );

    const [formData, setFormData] = useState(resolveInitialData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sinkronisasi data saat modal terbuka
    useEffect(() => {
        if (isOpen) {
            setFormData(resolveInitialData());
        }
    }, [isOpen, resolveInitialData]);

    // Aksesibilitas: Keyboard Escape & Body Scroll Lock
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const handleFormChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const namaBersih = formData.nama_penerima.trim();
        const teleponBersih = formData.telepon.trim();
        const alamatBersih = formData.alamat_lengkap.trim();

        if (!namaBersih) {
            toast.error("Nama penerima wajib diisi.");
            return;
        }
        if (!teleponBersih) {
            toast.error("Nomor telepon wajib diisi.");
            return;
        }
        if (teleponBersih.length < 9) {
            toast.error("Nomor telepon minimal 9 digit angka.");
            return;
        }
        if (!alamatBersih) {
            toast.error("Detail alamat jalan wajib diisi.");
            return;
        }

        setIsSubmitting(true);

        // Amankan nomor pesanan dari pemenggalan URL web server (%2F)
        const safeOrderSlug = (nomorPesanan || "").replace(/\//g, "-");

        router.post(
            `/faktur/${encodeURIComponent(safeOrderSlug)}/ubah-alamat`,
            {
                nama_penerima: namaBersih,
                telepon: teleponBersih,
                alamat_lengkap: alamatBersih,
                catatan: formData.catatan.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setIsSubmitting(false);

                    // Tangkal false-positive jika backend mengembalikan flash error
                    const flashError = (page.props as Record<string, any>)
                        ?.flash?.error;
                    if (flashError) {
                        toast.error(flashError);
                        return;
                    }

                    toast.success(
                        "Informasi alamat penerima berhasil diperbarui!",
                    );
                    onSuccess?.();
                    onClose();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    const firstMsg = Object.values(errors)[0];
                    toast.error(
                        typeof firstMsg === "string"
                            ? firstMsg
                            : "Gagal memperbarui alamat pengiriman.",
                    );
                },
            },
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-ubah-alamat-title"
            onClick={() => {
                if (!isSubmitting) onClose();
            }}
        >
            <div
                className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                    <div>
                        <h3
                            id="modal-ubah-alamat-title"
                            className="text-base font-bold text-slate-900 tracking-tight"
                        >
                            Koreksi Alamat Pengiriman
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Perubahan detail penerima pada faktur aktif
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        aria-label="Tutup modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Banner Proteksi Tarif Wilayah Logistik */}
                <div className="px-5 sm:px-6 py-3 bg-amber-50/80 border-b border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-950 shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-amber-900">
                        <strong className="font-bold text-amber-950">
                            Pemberitahuan Tarif:
                        </strong>{" "}
                        Biaya ongkir telah terkunci berdasarkan kecamatan dan
                        kota tujuan awal. Anda hanya dapat memperbaiki nomor
                        rumah, nama jalan, RT/RW, dan patokan gedung.
                    </p>
                </div>

                {/* Form Body Scrollable */}
                <form
                    onSubmit={handleSubmit}
                    className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain"
                >
                    {/* Badge Wilayah Terkunci */}
                    {wilayahTerkunci && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>Wilayah Logistik Tujuan (Terkunci)</span>
                            </span>
                            <p className="text-xs font-bold text-slate-900">
                                {wilayahTerkunci}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Nama Penerima */}
                        <div>
                            <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Nama Penerima</span>
                                    <span className="text-rose-500">*</span>
                                </span>
                            </label>
                            <input
                                type="text"
                                maxLength={255}
                                value={formData.nama_penerima}
                                onChange={(e) =>
                                    handleFormChange(
                                        "nama_penerima",
                                        e.target.value,
                                    )
                                }
                                required
                                placeholder="Contoh: Budi Santoso"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        {/* Nomor Telepon */}
                        <div>
                            <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <span>No. WhatsApp / HP</span>
                                    <span className="text-rose-500">*</span>
                                </span>
                            </label>
                            <input
                                type="tel"
                                maxLength={25}
                                value={formData.telepon}
                                onChange={(e) =>
                                    handleFormChange(
                                        "telepon",
                                        e.target.value.replace(
                                            /[^0-9+\s-]/g,
                                            "",
                                        ),
                                    )
                                }
                                required
                                placeholder="Contoh: 081234567890"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Alamat Lengkap */}
                    <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>Detail Alamat Jalan & Patokan</span>
                                <span className="text-rose-500">*</span>
                            </span>
                            <span className="text-[10px] font-normal text-slate-400">
                                {formData.alamat_lengkap.length}/1000
                            </span>
                        </div>
                        <textarea
                            value={formData.alamat_lengkap}
                            onChange={(e) =>
                                handleFormChange(
                                    "alamat_lengkap",
                                    e.target.value,
                                )
                            }
                            maxLength={1000}
                            rows={3}
                            required
                            placeholder="Nama jalan, nomor rumah/kantor, RT/RW, dan patokan penjemputan terdekat..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                        />
                    </div>

                    {/* Catatan untuk Kurir */}
                    <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                            <span className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>Catatan untuk Kurir (Opsional)</span>
                            </span>
                            <span className="text-[10px] font-normal text-slate-400">
                                {formData.catatan.length}/500
                            </span>
                        </div>
                        <input
                            type="text"
                            maxLength={500}
                            value={formData.catatan}
                            onChange={(e) =>
                                handleFormChange("catatan", e.target.value)
                            }
                            placeholder="Contoh: Titipkan ke satpam jika penerima tidak ada di tempat"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
