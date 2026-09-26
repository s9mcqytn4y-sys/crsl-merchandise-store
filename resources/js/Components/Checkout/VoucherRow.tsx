import React from "react";
import { Tag, ChevronRight } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";
import { VoucherItem } from "./VoucherSelectModal";

interface VoucherRowProps {
    appliedVoucher: VoucherItem | null;
    voucherDiscount: number;
    onOpenModal: () => void;
}

export default function VoucherRow({
    appliedVoucher,
    voucherDiscount,
    onOpenModal,
}: VoucherRowProps) {
    return (
        <div
            onClick={onOpenModal}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 cursor-pointer bg-slate-50/50"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenModal();
                }
            }}
            aria-label="Pilih atau masukkan voucher diskon"
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs sm:text-sm text-slate-700 truncate">
                    {appliedVoucher ? (
                        <span className="text-emerald-700 font-semibold">
                            Voucher: {appliedVoucher.kode} (-{formatRupiah(voucherDiscount)})
                        </span>
                    ) : (
                        "Vouchers"
                    )}
                </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
    );
}
