import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, MessageSquare } from "lucide-react";

interface DeliveryMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMessage: string;
    onSaveMessage: (msg: string) => void;
}

export default function DeliveryMessageModal({
    isOpen,
    onClose,
    initialMessage,
    onSaveMessage,
}: DeliveryMessageModalProps) {
    const [message, setMessage] = useState(initialMessage);

    useEffect(() => {
        if (isOpen) {
            setMessage(initialMessage);
        }
    }, [isOpen, initialMessage]);

    const handleSave = () => {
        onSaveMessage(message);
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[28px] bg-white p-6 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-slate-700" />
                                        <Dialog.Title className="text-base font-bold text-slate-900">
                                            Catatan Pengiriman
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

                                <div className="py-4 space-y-3">
                                    <p className="text-xs text-slate-500">
                                        Tinggalkan pesan khusus untuk kurir atau penjual (misal: "Titip di pos satpam", "Warna packaging netral", dll).
                                    </p>
                                    <textarea
                                        rows={4}
                                        maxLength={250}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tulis catatan pengiriman di sini..."
                                        className="w-full px-3.5 py-3 text-xs sm:text-sm border border-slate-200 rounded-2xl focus:border-slate-800 focus:outline-none transition-all resize-none"
                                    />
                                    <div className="text-right text-[11px] text-slate-400">
                                        {message.length}/250 karakter
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
                                    >
                                        Simpan Pesan
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
