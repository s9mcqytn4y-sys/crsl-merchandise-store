import { useState, useEffect, Fragment } from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { X, MessageSquare, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface DeliveryMessageModalProps {
    isOpen?: boolean;
    onClose: () => void;
    initialMessage?: string;
    onSaveMessage: (msg: string) => void;
    className?: string;
}

const QUICK_NOTES = [
    "Titip di pos satpam / security",
    "Hubungi via WhatsApp sebelum antar",
    "Taruh di depan pintu rumah",
    "Tolong packing aman & rapi",
];

const MAX_CHAR = 250;

export default function DeliveryMessageModal({
    isOpen = false,
    onClose,
    initialMessage = "",
    onSaveMessage,
    className,
}: DeliveryMessageModalProps) {
    const isVisible = Boolean(isOpen);
    const [message, setMessage] = useState(initialMessage);

    useEffect(() => {
        if (isVisible) {
            setMessage(initialMessage || "");
        }
    }, [isVisible, initialMessage]);

    const handleSave = () => {
        onSaveMessage(message.trim());
        onClose();
    };

    const handleSelectQuickNote = (note: string) => {
        setMessage((prev) => {
            const clean = prev.trim();
            if (!clean) return note;
            if (clean.includes(note)) return clean;
            const combined = `${clean}, ${note}`;
            return combined.slice(0, MAX_CHAR);
        });
    };

    return (
        <Transition show={isVisible} as={Fragment}>
            <Dialog
                as="div"
                id="modal-catatan-pengiriman"
                className={cn("relative z-50 select-none", className)}
                onClose={onClose}
            >
                {/* Backdrop Layer */}
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <DialogBackdrop className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" />
                </TransitionChild>

                {/* Kontainer Modal Tengah */}
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-5 sm:p-7 text-left align-middle shadow-2xl transition-all border border-slate-200/90 space-y-4">
                                {/* Header Modal */}
                                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-2xl bg-red-50 text-[#E52027] border border-red-100 flex items-center justify-center shrink-0">
                                            <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                                Catatan Pengiriman
                                            </DialogTitle>
                                            <p className="text-[11px] text-slate-500">
                                                Instruksi pengantaran untuk
                                                kurir ekspedisi
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                        aria-label="Tutup catatan pengiriman"
                                    >
                                        <X className="w-4 h-4 stroke-[2.2]" />
                                    </button>
                                </div>

                                {/* Body Catatan */}
                                <div className="space-y-3">
                                    {/* Quick Preset Chips */}
                                    <div>
                                        <span className="block text-[11px] font-bold text-slate-600 mb-1.5">
                                            Pilihan Cepat:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {QUICK_NOTES.map((note) => {
                                                const isIncluded =
                                                    message.includes(note);
                                                return (
                                                    <button
                                                        key={note}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectQuickNote(
                                                                note,
                                                            )
                                                        }
                                                        className={cn(
                                                            "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border text-left",
                                                            isIncluded
                                                                ? "bg-red-50 text-[#E52027] border-red-200"
                                                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
                                                        )}
                                                    >
                                                        {note}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Textarea Input */}
                                    <div>
                                        <label
                                            htmlFor="delivery-message-textarea"
                                            className="block text-xs font-bold text-slate-700 mb-1"
                                        >
                                            Pesan Khusus
                                        </label>
                                        <textarea
                                            id="delivery-message-textarea"
                                            rows={4}
                                            maxLength={MAX_CHAR}
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(e.target.value)
                                            }
                                            placeholder="Tulis instruksi khusus pengiriman di sini..."
                                            className="w-full px-3.5 py-3 text-xs sm:text-sm border border-slate-300 rounded-2xl focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 focus:outline-none transition-all resize-none shadow-2xs text-slate-900 placeholder:text-slate-400 font-medium"
                                            autoFocus
                                        />
                                        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
                                            <span>Maksimal 250 karakter</span>
                                            <span
                                                className={cn(
                                                    message.length >= MAX_CHAR
                                                        ? "text-rose-600 font-bold"
                                                        : "text-slate-500",
                                                )}
                                            >
                                                {message.length}/{MAX_CHAR}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Simpan Catatan</span>
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
