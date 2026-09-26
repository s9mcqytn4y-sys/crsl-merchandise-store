import React, { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Tag, Truck, Copy, Check, TicketPercent } from "lucide-react";
import { toast } from "sonner";

// 1. Strict Typing
export type VoucherType = "persen" | "ongkir" | "nominal";

export interface VoucherItem {
    id: number | string;
    kode: string;
    judul: string;
    deskripsi?: string;
    nilai: number;
    tipe: VoucherType;
    min_belanja: number;
}

interface DiscountsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyVoucher?: (code: string) => void;
    vouchers?: VoucherItem[];
    cartTotal?: number; // Menentukan voucher aktif atau tidak
}

const DEFAULT_VOUCHERS: VoucherItem[] = [
    {
        id: 1,
        kode: "CRSLYAY25",
        judul: "CRSL PAYDAY 25% OFF",
        deskripsi:
            "Diskon 25% maksimal potongan Rp 25.000 untuk apparel & merchandise.",
        tipe: "persen",
        nilai: 25,
        min_belanja: 50000,
    },
    {
        id: 2,
        kode: "CRSLFREEONGKIR",
        judul: "Potongan Ongkir Rp 10.000",
        deskripsi:
            "Subsidi ongkir Rp 10.000 ke seluruh wilayah pengiriman di Indonesia.",
        tipe: "ongkir",
        nilai: 10000,
        min_belanja: 75000,
    },
];

export default function DiscountsModal({
    isOpen,
    onClose,
    onApplyVoucher,
    vouchers = DEFAULT_VOUCHERS,
    cartTotal = 0,
}: DiscountsModalProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Bersihkan timeout saat modal unmount untuk hindari leak
    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const handleCopy = async (e: React.MouseEvent, code: string) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            toast.success(`Kode ${code} disalin ke clipboard!`);

            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            copyTimeoutRef.current = setTimeout(
                () => setCopiedCode(null),
                2000,
            );
        } catch {
            toast.error("Gagal menyalin kode voucher");
        }
    };

    const handleApply = (code: string) => {
        if (onApplyVoucher) {
            onApplyVoucher(code);
        } else {
            toast.success(`Voucher ${code} berhasil digunakan!`);
        }
        onClose();
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-slate-100">
                                {/* Header: Bersih & Selaras dengan Brand */}
                                <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-red-50 text-red-600">
                                            <TicketPercent className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <Dialog.Title
                                                as="h3"
                                                className="text-base font-bold text-slate-800"
                                            >
                                                Voucher Tersedia
                                            </Dialog.Title>
                                            <p className="text-xs text-slate-400">
                                                Pilih atau salin voucher diskon
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                        aria-label="Tutup modal"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* List Voucher */}
                                <div className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
                                    {vouchers.map((v) => {
                                        const isCopied = copiedCode === v.kode;
                                        const isEligible =
                                            cartTotal >= v.min_belanja;

                                        return (
                                            <div
                                                key={v.id}
                                                className={`group relative rounded-xl border p-4 transition-all ${
                                                    isEligible
                                                        ? "border-dashed border-slate-300 bg-slate-50/50 hover:border-red-300 hover:bg-red-50/20"
                                                        : "border-slate-200 bg-slate-100/50 opacity-60"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            {v.tipe ===
                                                            "ongkir" ? (
                                                                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                                                            ) : (
                                                                <Tag className="w-4 h-4 text-red-600 shrink-0" />
                                                            )}
                                                            <span className="font-bold text-sm text-slate-800">
                                                                {v.judul}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">
                                                            {v.deskripsi}
                                                        </p>
                                                    </div>

                                                    {/* Interactive Badge (Click-to-Copy) */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            handleCopy(
                                                                e,
                                                                v.kode,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all shrink-0 cursor-pointer shadow-2xs"
                                                        title="Salin kode"
                                                    >
                                                        <span>{v.kode}</span>
                                                        {isCopied ? (
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Footer Card */}
                                                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 text-xs">
                                                    <span className="text-[11px] text-slate-500">
                                                        Min. belanja Rp{" "}
                                                        {v.min_belanja.toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        disabled={!isEligible}
                                                        onClick={() =>
                                                            handleApply(v.kode)
                                                        }
                                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                            isEligible
                                                                ? "bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-95 cursor-pointer"
                                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                        }`}
                                                    >
                                                        Gunakan
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
