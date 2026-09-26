import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ModalBatalPesananProps {
    isOpen: boolean;
    onClose: () => void;
    nomorPesanan: string;
    total?: number;
    onSuccess?: () => void;
}

export default function ModalBatalPesanan({
    isOpen,
    onClose,
    nomorPesanan,
    total,
    onSuccess,
}: ModalBatalPesananProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleConfirmCancel = () => {
        setIsSubmitting(true);
        router.post(
            `/faktur/${nomorPesanan}/batalkan`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast.success("Pesanan berhasil dibatalkan.");
                    onClose();
                    onSuccess?.();
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    const firstMsg = Object.values(err)[0] as string;
                    toast.error(firstMsg || "Gagal membatalkan pesanan");
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
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900">
                        Batalkan Pesanan Ini?
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Apakah Anda yakin ingin membatalkan pesanan <span className="font-mono font-bold text-slate-700">{nomorPesanan}</span>? Seluruh item produk akan dikembalikan ke stok toko dan tagihan pembayaran Midtrans akan dibatalkan.
                    </p>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 leading-snug">
                    Tindakan ini tidak dapat diurungkan. Jika ingin memesan kembali, Anda harus memilih produk dari awal.
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Kembali
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmCancel}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Ya, Batalkan Pesanan
                    </button>
                </div>
            </div>
        </div>
    );
}
