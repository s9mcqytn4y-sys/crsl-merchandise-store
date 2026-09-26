import React, { useState, useEffect } from "react";
import { ChevronRight, CreditCard, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export interface PaymentOption {
    id: string;
    nama: string;
    subjudul?: string;
    tipe: string;
    ikon?: string;
}

interface PaymentMethodSectionProps {
    selectedPayment: PaymentOption | null;
    onOpenModal: () => void;
    error?: string;
}

export default function PaymentMethodSection({
    selectedPayment,
    onOpenModal,
    error,
}: PaymentMethodSectionProps) {
    const [imageError, setImageError] = useState<boolean>(false);

    // Reset error gambar saat pilihan metode pembayaran berganti
    useEffect(() => {
        setImageError(false);
    }, [selectedPayment?.id]);

    const renderPaymentBadge = () => {
        if (!selectedPayment?.ikon || imageError) {
            return (
                <div className="w-10 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <CreditCard className="w-4 h-4" />
                </div>
            );
        }

        return (
            <div className="w-12 h-7 sm:w-14 sm:h-8 bg-slate-50 border border-slate-200/80 rounded-lg p-1 flex items-center justify-center shrink-0">
                <img
                    src={selectedPayment.ikon}
                    alt={selectedPayment.nama}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    };

    return (
        <section aria-labelledby="payment-heading" className="space-y-3">
            <h2
                id="payment-heading"
                className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
            >
                Metode Pembayaran
            </h2>

            {/* Tombol Pemicu Modal Pemilihan Pembayaran */}
            <button
                type="button"
                onClick={onOpenModal}
                aria-haspopup="dialog"
                className={cn(
                    "w-full text-left rounded-xl border bg-white p-4 shadow-xs transition-all cursor-pointer hover:border-slate-300 flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-[#E52027]/20",
                    error
                        ? "border-red-400 ring-1 ring-red-400"
                        : "border-slate-200",
                )}
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    {renderPaymentBadge()}

                    <div className="min-w-0">
                        {selectedPayment ? (
                            <>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {selectedPayment.nama}
                                </p>
                                {selectedPayment.subjudul && (
                                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                        {selectedPayment.subjudul}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">
                                Pilih metode pembayaran
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
            </button>

            {error && (
                <p className="text-[11px] text-red-600 flex items-center gap-1 font-medium pl-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </section>
    );
}
