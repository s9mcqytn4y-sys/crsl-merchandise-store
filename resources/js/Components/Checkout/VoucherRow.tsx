import React from "react";
import { ChevronRight, X, TicketPercent } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { VoucherItem } from "./VoucherSelectModal";
import { cn } from "../../lib/utils";

interface VoucherRowProps {
    appliedVoucher?: VoucherItem | null;
    voucherDiscount?: number;
    onOpenModal: () => void;
    onRemoveVoucher?: () => void;
    className?: string;
}

export default function VoucherRow({
    appliedVoucher = null,
    voucherDiscount = 0,
    onOpenModal,
    onRemoveVoucher,
    className,
}: VoucherRowProps) {
    const isApplied = Boolean(appliedVoucher);

    const handleRemove = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();
        onRemoveVoucher?.();
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onOpenModal}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenModal();
                }
            }}
            aria-label={
                isApplied
                    ? `Voucher aktif ${appliedVoucher?.kode}, hemat ${formatRupiah(voucherDiscount)}. Klik untuk ubah voucher.`
                    : "Gunakan voucher atau kode promo diskon"
            }
            className={cn(
                "p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                isApplied
                    ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-300/30 shadow-2xs"
                    : "bg-slate-50/60 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/70 shadow-2xs",
                className,
            )}
        >
            <div className="flex items-center gap-3 min-w-0 pr-1">
                <div
                    className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs",
                        isApplied
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-slate-400 border border-slate-200/80 group-hover:text-slate-600",
                    )}
                >
                    <TicketPercent className="w-5 h-5 stroke-[2]" />
                </div>

                <div className="space-y-0.5 min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                        {isApplied ? (
                            <div className="text-emerald-950 flex items-center gap-2 flex-wrap">
                                <span>Voucher Aktif:</span>
                                <span className="font-mono text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200 text-xs font-bold">
                                    {appliedVoucher?.kode}
                                </span>
                            </div>
                        ) : (
                            <span>Gunakan Voucher / Kode Promo</span>
                        )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate">
                        {isApplied ? (
                            <span className="font-bold text-emerald-700 font-mono">
                                Berhasil hemat -{formatRupiah(voucherDiscount)}
                            </span>
                        ) : (
                            "Klaim potongan ongkir atau diskon belanja"
                        )}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {isApplied && onRemoveVoucher ? (
                    <button
                        type="button"
                        onClick={handleRemove}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                handleRemove(e);
                            }
                        }}
                        title="Batalkan penggunaan voucher"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 border border-transparent hover:border-rose-100"
                        aria-label="Hapus voucher aktif"
                    >
                        <X className="w-4 h-4 stroke-[2.2]" />
                    </button>
                ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                )}
            </div>
        </div>
    );
}
