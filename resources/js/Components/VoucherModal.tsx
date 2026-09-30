import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogDescription,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import {
    X,
    Check,
    Copy,
    TicketPercent,
    ShoppingBag,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "../Utils/formatters";
import { cn } from "../lib/utils";

export type VoucherType = "persen" | "persentase" | "ongkir" | "nominal";

export interface VoucherItem {
    id: number | string;
    kode: string;
    judul: string;
    deskripsi?: string;
    nilai: number | string;
    tipe: VoucherType;
    min_belanja?: number | string;
    minimal_belanja?: number | string;
    maksimal_diskon?: number | string | null;
    badge?: string;
}

interface VoucherModalProps {
    isOpen?: boolean;
    onClose: () => void;
    onContinueShopping?: () => void;
    onSelectVoucher?: (code: string) => void;
    activeVoucherCode?: string | null;
    vouchers?: VoucherItem[];
    cartTotal?: number | string;
    className?: string;
}

export default function VoucherModal({
    isOpen = false,
    onClose,
    onContinueShopping,
    onSelectVoucher,
    activeVoucherCode,
    vouchers = [],
    cartTotal = 0,
    className,
}: VoucherModalProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const numericCartTotal = Math.max(0, Number(cartTotal) || 0);
    const isVisible = Boolean(isOpen ?? false);

    // Pembersihan timer klip saat komponen di-unmount
    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const handleCopy = async (e: React.MouseEvent, code: string) => {
        e.stopPropagation();
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = code;
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }

            setCopiedCode(code);
            toast.success(`Kode voucher ${code} berhasil disalin!`);

            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            copyTimeoutRef.current = setTimeout(
                () => setCopiedCode(null),
                2000,
            );
        } catch {
            toast.error("Gagal menyalin kode voucher ke clipboard.");
        }
    };

    const handleApply = (code: string) => {
        if (onSelectVoucher) {
            onSelectVoucher(code);
        } else if (onContinueShopping) {
            onContinueShopping();
        }
        onClose();
    };

    return (
        <Transition show={isVisible} as={React.Fragment}>
            <Dialog
                as="div"
                className={cn("relative z-50 select-none", className)}
                onClose={onClose}
            >
                {/* Backdrop Layer */}
                <TransitionChild
                    as={React.Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                {/* Viewport Kontainer Modal */}
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200/80 flex flex-col max-h-[calc(100dvh-2.5rem)]">
                                {/* Header Modal Bersih Standar CRSL */}
                                <div className="border-b border-slate-100 px-5 sm:px-6 py-4 flex items-center justify-between bg-white shrink-0">
                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                        <div className="p-2.5 rounded-2xl bg-red-50 text-[#E52027] border border-red-100 shrink-0">
                                            <TicketPercent className="w-5 h-5 stroke-[2.2]" />
                                        </div>
                                        <div className="min-w-0">
                                            <DialogTitle
                                                as="h3"
                                                className="text-base font-bold text-slate-900 tracking-tight leading-tight"
                                            >
                                                Voucher Belanja
                                            </DialogTitle>
                                            <DialogDescription className="text-xs text-slate-500 truncate">
                                                Gunakan kode promo untuk
                                                potongan ekstra
                                            </DialogDescription>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-2 -mr-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                        aria-label="Tutup jendela voucher"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Body: Daftar Kupon / Empty State */}
                                <div className="p-5 space-y-3.5 overflow-y-auto overscroll-contain flex-1">
                                    {vouchers.length === 0 ? (
                                        <div className="py-10 px-4 text-center space-y-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                                <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-slate-800 text-sm">
                                                    Belum Ada Voucher Tersedia
                                                </h4>
                                                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                    Nantikan penawaran diskon
                                                    spesial dan voucher gratis
                                                    ongkir pada event promo CRSL
                                                    mendatang.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        vouchers.map((v) => {
                                            const minSpend = Number(
                                                v.minimal_belanja ??
                                                    v.min_belanja ??
                                                    0,
                                            );
                                            const isEligible =
                                                numericCartTotal >= minSpend;
                                            const deficit = Math.max(
                                                0,
                                                minSpend - numericCartTotal,
                                            );
                                            const isSelected =
                                                activeVoucherCode === v.kode;
                                            const isCopied =
                                                copiedCode === v.kode;

                                            const isShipping =
                                                v.tipe === "ongkir";
                                            const isPercent =
                                                v.tipe === "persen" ||
                                                v.tipe === "persentase";

                                            return (
                                                <div
                                                    key={v.kode}
                                                    className={cn(
                                                        "group relative rounded-2xl border p-4 transition-all duration-200 flex items-start justify-between gap-3",
                                                        isSelected &&
                                                            "border-emerald-400 bg-emerald-50/40 ring-1 ring-emerald-300",
                                                        !isSelected &&
                                                            isEligible &&
                                                            "border-dashed border-slate-300 bg-white hover:border-[#E52027] hover:bg-red-50/10 shadow-2xs",
                                                        !isSelected &&
                                                            !isEligible &&
                                                            "border-slate-200/90 bg-slate-50/70 opacity-70",
                                                    )}
                                                >
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                                                                {v.judul}
                                                            </span>

                                                            {v.badge && (
                                                                <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                                    {v.badge}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {v.deskripsi && (
                                                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                                                {v.deskripsi}
                                                            </p>
                                                        )}

                                                        <div className="pt-0.5 space-y-0.5">
                                                            <span className="text-[11px] text-slate-500 block">
                                                                Min. belanja:{" "}
                                                                <strong className="font-bold text-slate-800">
                                                                    {formatRupiah(
                                                                        minSpend,
                                                                    )}
                                                                </strong>
                                                            </span>

                                                            {!isEligible && (
                                                                <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                                                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                                                    <span>
                                                                        Kurang{" "}
                                                                        {formatRupiah(
                                                                            deficit,
                                                                        )}{" "}
                                                                        lagi
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Kode Voucher & Tombol Salin */}
                                                        <div className="pt-1">
                                                            <button
                                                                type="button"
                                                                onClick={(e) =>
                                                                    handleCopy(
                                                                        e,
                                                                        v.kode,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer"
                                                                title="Salin kode kupon"
                                                                aria-label={`Salin kode voucher ${v.kode}`}
                                                            >
                                                                <span className="text-[#E52027]">
                                                                    {v.kode}
                                                                </span>
                                                                {isCopied ? (
                                                                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                                                                ) : (
                                                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Kolom Tombol Aksi Pakai */}
                                                    <div className="flex flex-col items-end justify-center self-center pl-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !isEligible
                                                            }
                                                            onClick={() =>
                                                                handleApply(
                                                                    v.kode,
                                                                )
                                                            }
                                                            className={cn(
                                                                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs select-none",
                                                                isSelected
                                                                    ? "bg-emerald-600 text-white cursor-default"
                                                                    : isEligible
                                                                      ? "bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.98] text-white cursor-pointer"
                                                                      : "bg-slate-200 text-slate-400 cursor-not-allowed",
                                                            )}
                                                        >
                                                            {isSelected
                                                                ? "Terpasang"
                                                                : "Gunakan"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Footer: Tombol Tutup */}
                                <div className="p-4 bg-slate-50/80 border-t border-slate-100 shrink-0 flex items-center justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
