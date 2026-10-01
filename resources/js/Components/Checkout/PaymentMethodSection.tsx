import { useState, useEffect } from "react";
import {
    ChevronRight,
    CreditCard,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { cn } from "../../lib/utils";

export interface PaymentOption {
    id: string;
    nama: string;
    subjudul?: string;
    tipe: string;
    ikon?: string;
}

interface PaymentMethodSectionProps {
    selectedPayment?: PaymentOption | null;
    onOpenModal: () => void;
    error?: string;
    isModalOpen?: boolean;
    className?: string;
}

/** Normalisasi path URL logo metode pembayaran */
function normalizePaymentIcon(url?: string | null): string {
    if (!url) return "";
    const clean = url.trim();
    if (
        clean.startsWith("http://") ||
        clean.startsWith("https://") ||
        clean.startsWith("data:")
    ) {
        return clean;
    }
    if (clean.startsWith("/storage/")) return clean;
    if (clean.startsWith("storage/")) return `/${clean}`;
    if (clean.startsWith("/")) return clean;
    return `/storage/${clean}`;
}

export default function PaymentMethodSection({
    selectedPayment = null,
    onOpenModal,
    error,
    isModalOpen = false,
    className,
}: PaymentMethodSectionProps) {
    const [imageError, setImageError] = useState<boolean>(false);

    // Reset error gambar saat metode pembayaran berganti
    useEffect(() => {
        setImageError(false);
    }, [selectedPayment?.id]);

    const iconUrl = normalizePaymentIcon(selectedPayment?.ikon);

    const renderPaymentBadge = () => {
        if (!iconUrl || imageError) {
            return (
                <div className="w-12 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/60 shadow-2xs">
                    <CreditCard className="w-4 h-4 stroke-[2.2]" />
                </div>
            );
        }

        return (
            <div className="w-12 h-8 sm:w-14 sm:h-9 bg-white border border-slate-200/80 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                <img
                    src={iconUrl}
                    alt={selectedPayment?.nama || "Metode Pembayaran"}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    };

    return (
        <section
            aria-labelledby="payment-heading"
            className={cn("space-y-3 select-none", className)}
        >
            <div className="flex items-center justify-between">
                <h2
                    id="payment-heading"
                    className="text-base sm:text-lg font-black tracking-tight text-slate-900"
                >
                    Metode Pembayaran
                </h2>
                {selectedPayment && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 inline-flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                        <span>Terpilih</span>
                    </span>
                )}
            </div>

            {/* Tombol Pemicu Modal Pemilihan Pembayaran WAI-ARIA */}
            <button
                type="button"
                onClick={onOpenModal}
                role="button"
                aria-haspopup="dialog"
                aria-expanded={isModalOpen}
                aria-controls="modal-pilih-metode-pembayaran"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "payment-method-error" : undefined}
                className={cn(
                    "w-full text-left rounded-2xl border p-4 shadow-2xs transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 group",
                    error
                        ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                        : selectedPayment
                          ? "border-slate-300 bg-white hover:border-slate-400 hover:shadow-xs"
                          : "border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300",
                )}
            >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    {renderPaymentBadge()}

                    <div className="min-w-0 space-y-0.5">
                        {selectedPayment ? (
                            <>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {selectedPayment.nama}
                                </p>
                                {selectedPayment.subjudul && (
                                    <p className="text-[11px] text-slate-500 font-medium truncate">
                                        {selectedPayment.subjudul}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                Pilih saluran pembayaran (QRIS, VA Bank,
                                E-Wallet)
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors">
                    <span className="text-[11px] font-bold text-primary hidden sm:inline-block">
                        {selectedPayment ? "Ubah" : "Pilih"}
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </button>

            {/* Pesan Kesalahan Validasi */}
            {error && (
                <p
                    id="payment-method-error"
                    role="alert"
                    className="text-xs text-rose-600 flex items-center gap-1.5 font-semibold pl-1 animate-in fade-in"
                >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </section>
    );
}
