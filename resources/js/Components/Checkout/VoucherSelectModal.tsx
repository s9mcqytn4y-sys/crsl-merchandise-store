import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Tag, Check, AlertCircle } from "lucide-react";
import { formatRupiah } from "../../Utils/formatters";

export interface VoucherItem {
    id: number;
    kode: string;
    judul: string;
    tipe: string;
    nilai: number;
    min_belanja: number;
    discount?: string;
}

interface VoucherSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    vouchers: VoucherItem[];
    subtotal: number;
    appliedVoucher: VoucherItem | null;
    onApplyVoucher: (voucher: VoucherItem | null) => void;
}

export default function VoucherSelectModal({
    isOpen,
    onClose,
    vouchers,
    subtotal,
    appliedVoucher,
    onApplyVoucher,
}: VoucherSelectModalProps) {
    const [manualCode, setManualCode] = useState("");
    const [manualError, setManualError] = useState("");

    const handleApplyManual = (e: React.FormEvent) => {
        e.preventDefault();
        setManualError("");

        const codeClean = manualCode.trim().toUpperCase();
        if (!codeClean) {
            setManualError("Masukkan kode voucher terlebih dahulu.");
            return;
        }

        const found = vouchers.find((v) => v.kode.toUpperCase() === codeClean);
        if (!found) {
            setManualError("Kode voucher tidak valid atau sudah kedaluwarsa.");
            return;
        }

        if (subtotal < found.min_belanja) {
            setManualError(
                `Minimal belanja untuk voucher ini adalah ${formatRupiah(found.min_belanja)}.`
            );
            return;
        }

        onApplyVoucher(found);
        setManualCode("");
        onClose();
    };

    const handleSelectVoucher = (voucher: VoucherItem) => {
        if (subtotal < voucher.min_belanja) {
            setManualError(
                `Minimal belanja untuk voucher ini adalah ${formatRupiah(voucher.min_belanja)}.`
            );
            return;
        }
        onApplyVoucher(voucher);
        onClose();
    };

    const handleRemoveVoucher = () => {
        onApplyVoucher(null);
        onClose();
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[28px] bg-white p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-slate-700" />
                                        <Dialog.Title className="text-base font-bold text-slate-900">
                                            Pilih Voucher Belanja
                                        </Dialog.Title>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Manual Input Code */}
                                <form onSubmit={handleApplyManual} className="py-4 border-b border-slate-100">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Punya Kode Voucher Promo?
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={manualCode}
                                            onChange={(e) => {
                                                setManualCode(e.target.value.toUpperCase());
                                                setManualError("");
                                            }}
                                            placeholder="CONTOH: CRSLDISC10"
                                            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:border-slate-800 focus:outline-none uppercase font-mono transition-all"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                                        >
                                            Terapkan
                                        </button>
                                    </div>
                                    {manualError && (
                                        <p className="mt-1.5 text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            {manualError}
                                        </p>
                                    )}
                                </form>

                                {/* Applied Voucher Banner */}
                                {appliedVoucher && (
                                    <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-emerald-900">
                                                Voucher Digunakan: {appliedVoucher.kode}
                                            </p>
                                            <p className="text-[11px] text-emerald-700">
                                                {appliedVoucher.judul}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveVoucher}
                                            className="text-xs font-semibold text-red-600 hover:text-red-700 underline cursor-pointer"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                )}

                                {/* Available Vouchers List */}
                                <div className="py-3 space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Voucher Tersedia
                                    </p>

                                    {vouchers.length === 0 ? (
                                        <p className="text-center py-6 text-xs text-slate-400">
                                            Tidak ada voucher aktif saat ini.
                                        </p>
                                    ) : (
                                        vouchers.map((v) => {
                                            const isSelected = appliedVoucher?.id === v.id;
                                            const isEligible = subtotal >= v.min_belanja;

                                            return (
                                                <div
                                                    key={v.id}
                                                    onClick={() => isEligible && handleSelectVoucher(v)}
                                                    className={`p-3.5 rounded-2xl border transition-all ${
                                                        isSelected
                                                            ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600"
                                                            : isEligible
                                                            ? "border-slate-200 bg-white hover:border-slate-300 cursor-pointer"
                                                            : "border-slate-100 bg-slate-50/70 opacity-60 cursor-not-allowed"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                                                    {v.kode}
                                                                </span>
                                                                <span className="text-xs font-bold text-slate-800">
                                                                    {v.judul}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500">
                                                                Min. belanja {formatRupiah(v.min_belanja)}
                                                            </p>
                                                        </div>

                                                        {isSelected ? (
                                                            <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                                                                <Check className="w-4 h-4" />
                                                                <span>Dipakai</span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled={!isEligible}
                                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                                                    isEligible
                                                                        ? "bg-slate-900 text-white hover:bg-slate-800"
                                                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                                }`}
                                                            >
                                                                Pakai
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
