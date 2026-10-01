import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { AlertTriangle, X, Loader2, Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ModalBatalPesananProps {
    isOpen: boolean;
    onClose: () => void;
    nomorPesanan: string;
    total?: number | string;
    onSuccess?: () => void;
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

export default function ModalBatalPesanan({
    isOpen,
    onClose,
    nomorPesanan,
    total,
    onSuccess,
}: ModalBatalPesananProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Aksesibilitas: Navigasi tombol Escape & Body Scroll Lock
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

    const numericTotal = Number(total) || 0;

    const handleConfirmCancel = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Amankan nomor pesanan dari pemenggalan URL web server (%2F)
        const safeOrderSlug = (nomorPesanan || "").replace(/\//g, "-");

        router.post(
            `/faktur/${encodeURIComponent(safeOrderSlug)}/batalkan`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setIsSubmitting(false);

                    // Tangkap pesan flash error dari backend (misal pesanan sudah terlanjur lunas)
                    const flashError =
                        (page.props as Record<string, any>)?.flash?.error ||
                        (page.props as Record<string, any>)?.error;

                    if (flashError) {
                        toast.error(flashError);
                        return;
                    }

                    toast.success(
                        "Pesanan berhasil dibatalkan dan stok produk telah dipulihkan.",
                    );
                    onClose();
                    onSuccess?.();
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    const firstMsg = Object.values(err)[0];
                    toast.error(
                        typeof firstMsg === "string"
                            ? firstMsg
                            : "Gagal membatalkan pesanan. Silakan coba lagi.",
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
            aria-labelledby="modal-batal-title"
            onClick={() => {
                if (!isSubmitting) onClose();
            }}
        >
            <div
                className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                    {/* Header Icon & Close Button */}
                    <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                            aria-label="Tutup jendela"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Deskripsi & Detail Tagihan */}
                    <div className="space-y-1.5">
                        <h3
                            id="modal-batal-title"
                            className="text-base sm:text-lg font-bold text-slate-900 tracking-tight"
                        >
                            Batalkan Pesanan Ini?
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Anda akan membatalkan transaksi{" "}
                            <span className="font-mono font-bold text-slate-900 select-all">
                                #{nomorPesanan}
                            </span>
                            {numericTotal > 0 && (
                                <>
                                    {" "}
                                    senilai{" "}
                                    <strong className="font-bold text-slate-900 font-mono">
                                        {rupiahFormatter.format(numericTotal)}
                                    </strong>
                                </>
                            )}
                            . Tindakan ini tidak dapat diurungkan kembali.
                        </p>
                    </div>

                    {/* Kotak Informasi Dampak Pembatalan */}
                    <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2 text-xs">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Konsekuensi Pembatalan:</span>
                        </p>
                        <ul className="list-disc pl-4 space-y-1.5 text-[11px] leading-relaxed text-slate-600">
                            <li>
                                Stok produk otomatis dikembalikan ke katalog
                                toko[cite: 3].
                            </li>
                            <li>
                                Kode pembayaran QRIS atau nomor Virtual Account
                                akan dinonaktifkan[cite: 3].
                            </li>
                            <li>
                                Kuota voucher promo dan koin loyalitas yang
                                digunakan segera dipulihkan[cite: 3].
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer text-center"
                        >
                            Kembali
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmCancel}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Membatalkan...</span>
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Ya, Batalkan Pesanan</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
