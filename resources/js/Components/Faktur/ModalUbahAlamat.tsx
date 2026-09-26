import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { X, User, Phone, MapPin, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ModalUbahAlamatProps {
    isOpen: boolean;
    onClose: () => void;
    nomorPesanan: string;
    initialData: {
        nama_penerima?: string;
        telepon?: string;
        alamat_lengkap?: string;
        catatan?: string;
    };
}

export default function ModalUbahAlamat({
    isOpen,
    onClose,
    nomorPesanan,
    initialData,
}: ModalUbahAlamatProps) {
    const [formData, setFormData] = useState({
        nama_penerima: initialData.nama_penerima || "",
        telepon: initialData.telepon || "",
        alamat_lengkap: initialData.alamat_lengkap || "",
        catatan: initialData.catatan || "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                nama_penerima: initialData.nama_penerima || "",
                telepon: initialData.telepon || "",
                alamat_lengkap: initialData.alamat_lengkap || "",
                catatan: initialData.catatan || "",
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nama_penerima.trim()) {
            toast.error("Nama penerima wajib diisi");
            return;
        }
        if (!formData.telepon.trim()) {
            toast.error("Nomor telepon wajib diisi");
            return;
        }
        if (!formData.alamat_lengkap.trim()) {
            toast.error("Alamat lengkap wajib diisi");
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/faktur/${nomorPesanan}/ubah-alamat`,
            formData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast.success("Data penerima berhasil diperbarui!");
                    onClose();
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    const firstMsg = Object.values(err)[0] as string;
                    toast.error(firstMsg || "Gagal memperbarui data penerima");
                },
            }
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-800">
                        Ubah Informasi Penerima
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                            <User className="w-3.5 h-3.5 text-primary" />
                            Nama Penerima <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.nama_penerima}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    nama_penerima: e.target.value,
                                }))
                            }
                            required
                            placeholder="Contoh: Budi Santoso"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            Nomor Telepon / WhatsApp <span className="text-primary">*</span>
                        </label>
                        <input
                            type="tel"
                            value={formData.telepon}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    telepon: e.target.value,
                                }))
                            }
                            required
                            placeholder="Contoh: 081234567890"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            Alamat Lengkap Rumah / Kantor <span className="text-primary">*</span>
                        </label>
                        <textarea
                            value={formData.alamat_lengkap}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    alamat_lengkap: e.target.value,
                                }))
                            }
                            rows={3}
                            required
                            placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, dan patokan..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            Catatan untuk Kurir (Opsional)
                        </label>
                        <input
                            type="text"
                            value={formData.catatan}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    catatan: e.target.value,
                                }))
                            }
                            placeholder="Contoh: Tolong titipkan di pos satpam jika tidak ada orang"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
