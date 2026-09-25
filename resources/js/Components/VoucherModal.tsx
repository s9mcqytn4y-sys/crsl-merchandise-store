import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Truck, Tag } from "lucide-react";

interface VoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinueShopping?: () => void;
}

export default function VoucherModal({
    isOpen,
    onClose,
    onContinueShopping,
}: VoucherModalProps) {
    const handleContinue = () => {
        if (onContinueShopping) {
            onContinueShopping();
        } else {
            onClose();
        }
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
                                {/* Header (Sesuai Screenshot 2: Slate Blue Bar) */}
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
                                        className="absolute right-4 text-white/80 hover:text-white p-1 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                                        aria-label="Tutup modal voucher"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-6 flex flex-col items-center gap-6">
                                    {/* Voucher Ticket Card (Border Putus-putus) */}
                                    <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/60 flex items-center justify-between gap-4">
                                        {/* Kiri: Nilai & Minimal Belanja */}
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold text-slate-900">
                                                Rp 10,000 Off
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium mt-0.5">
                                                Min. Spend Rp 179,000
                                            </span>
                                        </div>

                                        {/* Divider Vertikal Putus-putus & Kanan: Ikon & Kode */}
                                        <div className="flex items-center gap-3 border-l-2 border-dashed border-slate-300 pl-4">
                                            <div className="flex flex-col items-center gap-1 text-slate-500">
                                                <Truck className="w-6 h-6 stroke-[1.8]" />
                                                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600">
                                                    FREEONGKIR
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tombol Aksi: Continue Shopping (Pill Merah Sesuai Screenshot 2) */}
                                    <button
                                        type="button"
                                        onClick={handleContinue}
                                        className="px-8 py-2.5 bg-[#E52027] hover:bg-[#CC1C22] text-white font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:ring-offset-2 focus-visible:outline-none"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
