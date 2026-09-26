import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Truck, Tag, Sparkles, Check } from "lucide-react";

interface VoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinueShopping?: () => void;
    onSelectVoucher?: (code: string) => void;
    activeVoucherCode?: string;
}

export default function VoucherModal({
    isOpen,
    onClose,
    onContinueShopping,
    onSelectVoucher,
    activeVoucherCode,
}: VoucherModalProps) {
    const vouchers = [
        {
            code: "CRSLYAY25",
            title: "25% Off All Items",
            minSpend: "Min. Belanja Rp 50.000",
            type: "persen",
            icon: Tag,
            badge: "PAYDAY",
        },
        {
            code: "CRSLFREEONGKIR",
            title: "Potongan Ongkir Rp 10.000",
            minSpend: "Min. Belanja Rp 75.000",
            type: "ongkir",
            icon: Truck,
            badge: "HEMAT",
        },
        {
            code: "FREEONGKIR10K",
            title: "Diskon Ongkir Rp 10.000",
            minSpend: "Min. Belanja Rp 179.000",
            type: "ongkir",
            icon: Truck,
            badge: "REGULER",
        },
    ];

    const handleApply = (code: string) => {
        if (onSelectVoucher) {
            onSelectVoucher(code);
        } else if (onContinueShopping) {
            onContinueShopping();
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
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" />
                </Transition.Child>

                {/* Modal Container */}
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all">
                                {/* Header: Slate Blue Bar Sesuai Screenshot 2 */}
                                <div className="bg-[#64748B] text-white px-5 py-3.5 flex items-center justify-between relative">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-base font-bold text-center w-full tracking-wide"
                                    >
                                        Available Voucher
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="absolute right-4 text-white/80 hover:text-white p-1 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
                                        aria-label="Tutup modal voucher"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        {vouchers.map((v) => {
                                            const IconComp = v.icon;
                                            const isSelected = activeVoucherCode === v.code;

                                            return (
                                                <div
                                                    key={v.code}
                                                    className={`w-full border-2 rounded-xl p-4 transition-all flex items-center justify-between gap-3 ${
                                                        isSelected
                                                            ? "border-emerald-500 bg-emerald-50/40"
                                                            : "border-dashed border-slate-300 bg-slate-50/70 hover:border-slate-400"
                                                    }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base font-black text-slate-900">
                                                                {v.title}
                                                            </span>
                                                            <span className="text-[10px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded">
                                                                {v.badge}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-500 font-medium block mt-0.5">
                                                            {v.minSpend}
                                                        </span>
                                                        <span className="text-xs font-mono font-bold text-[#E52027] mt-1 block">
                                                            Kode: {v.code}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-2 border-l-2 border-dashed border-slate-200 pl-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApply(v.code)}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                                                isSelected
                                                                    ? "bg-emerald-600 text-white"
                                                                    : "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-2xs"
                                                            }`}
                                                        >
                                                            {isSelected ? "Terpakai" : "Gunakan"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Tombol Aksi: Continue Shopping */}
                                    <div className="pt-2 text-center">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
