import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogDescription,
    DialogBackdrop,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { Globe, X, Check, ChevronDown, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

export interface PreferensiModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    currentCountry?: string;
    currentLanguage?: string;
    currentCurrency?: string;
    onSavePreferences?: (
        country: string,
        lang: string,
        currency: string,
    ) => void;
    className?: string;
}

const STORAGE_KEY = "crsl_user_preferences";

const COUNTRIES = [
    { code: "ID", name: "Indonesia" },
    { code: "MY", name: "Malaysia" },
    { code: "SG", name: "Singapore" },
];

const LANGUAGES = [
    { code: "id", name: "Bahasa Indonesia" },
    { code: "en", name: "English (US)" },
];

const CURRENCIES = [
    { code: "IDR", label: "IDR - Indonesian Rupiah (Rp)", isPrimary: true },
    { code: "USD", label: "USD - United States Dollar ($)", isPrimary: false },
    { code: "SGD", label: "SGD - Singapore Dollar (S$)", isPrimary: false },
    { code: "MYR", label: "MYR - Malaysian Ringgit (RM)", isPrimary: false },
];

export default function PreferensiModal({
    isOpen = false,
    onClose,
    currentCountry = "ID",
    currentLanguage = "id",
    currentCurrency = "IDR",
    onSavePreferences,
    className,
}: PreferensiModalProps) {
    // Normalisasi visibilitas ke boolean murni untuk mencegah kegagalan rekonsiliasi DOM
    const isVisible = Boolean(isOpen ?? false);

    const [country, setCountry] = useState(currentCountry);
    const [language, setLanguage] = useState(currentLanguage);
    const [currency, setCurrency] = useState(currentCurrency);

    // Sinkronisasi preferensi tersimpan dari localStorage atau props saat modal dibuka
    useEffect(() => {
        if (isVisible) {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setCountry(parsed.country || currentCountry);
                    setLanguage(parsed.language || currentLanguage);
                    setCurrency(parsed.currency || currentCurrency);
                    return;
                }
            } catch {
                // Fallback jika localStorage tidak tersedia
            }

            setCountry(currentCountry);
            setLanguage(currentLanguage);
            setCurrency(currentCurrency);
        }
    }, [isVisible, currentCountry, currentLanguage, currentCurrency]);

    const handleClose = () => {
        onClose?.();
    };

    const handleSave = () => {
        // Simpan preferensi secara persisten ke localStorage
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ country, language, currency }),
            );
        } catch {
            // Abaikan mode private browsing
        }

        onSavePreferences?.(country, language, currency);

        toast.success(
            language === "en"
                ? `Preferences saved: ${country} • ${currency}`
                : `Preferensi disimpan: ${country} • ${language.toUpperCase()} • ${currency}`,
        );
        handleClose();
    };

    return (
        <Transition show={isVisible} as={React.Fragment}>
            <Dialog
                as="div"
                id="modal-preferensi-wilayah"
                className={cn("relative z-50 select-none", className)}
                onClose={handleClose}
            >
                {/* Backdrop Blur Overlay */}
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

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center sm:justify-end p-4 sm:pt-16 sm:pr-12">
                        <TransitionChild
                            as={React.Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <DialogPanel className="w-full max-w-sm rounded-3xl bg-white p-5 text-left shadow-2xl border border-slate-200/80 transition-all">
                                {/* Header Modal */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-red-50 text-[#E52027] border border-red-100 flex items-center justify-center shrink-0">
                                            <Globe className="w-4 h-4 stroke-[2.2]" />
                                        </div>
                                        <div>
                                            <DialogTitle
                                                as="h3"
                                                className="text-sm font-bold text-slate-900 tracking-tight"
                                            >
                                                Wilayah & Bahasa
                                            </DialogTitle>
                                            <DialogDescription className="text-[11px] text-slate-500">
                                                Sesuaikan pengaturan tampilan
                                                toko
                                            </DialogDescription>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="p-1.5 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027] cursor-pointer"
                                        aria-label="Tutup pengaturan preferensi"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Form Body */}
                                <div className="space-y-4 pt-4 text-xs">
                                    {/* Negara Pengiriman */}
                                    <div>
                                        <label
                                            htmlFor="select-deliver-to"
                                            className="font-bold text-slate-700 block mb-1.5 tracking-tight"
                                        >
                                            Negara Tujuan (Deliver to):
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="select-deliver-to"
                                                value={country}
                                                onChange={(e) =>
                                                    setCountry(e.target.value)
                                                }
                                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 focus:bg-white transition-all cursor-pointer"
                                            >
                                                {COUNTRIES.map((item) => (
                                                    <option
                                                        key={item.code}
                                                        value={item.code}
                                                    >
                                                        {item.name} ({item.code}
                                                        )
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Bahasa Antarmuka */}
                                    <div>
                                        <label
                                            htmlFor="select-language"
                                            className="font-bold text-slate-700 block mb-1.5 tracking-tight"
                                        >
                                            Bahasa Antarmuka (Language):
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="select-language"
                                                value={language}
                                                onChange={(e) =>
                                                    setLanguage(e.target.value)
                                                }
                                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 focus:bg-white transition-all cursor-pointer"
                                            >
                                                {LANGUAGES.map((item) => (
                                                    <option
                                                        key={item.code}
                                                        value={item.code}
                                                    >
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Mata Uang */}
                                    <div>
                                        <label
                                            htmlFor="select-currency"
                                            className="font-bold text-slate-700 block mb-1.5 tracking-tight"
                                        >
                                            Mata Uang (Currency):
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="select-currency"
                                                value={currency}
                                                onChange={(e) =>
                                                    setCurrency(e.target.value)
                                                }
                                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10 focus:bg-white transition-all cursor-pointer font-mono"
                                            >
                                                {CURRENCIES.map((item) => (
                                                    <option
                                                        key={item.code}
                                                        value={item.code}
                                                    >
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>

                                        {currency !== "IDR" && (
                                            <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2 text-[11px] text-amber-900 leading-snug animate-in fade-in duration-150">
                                                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                                <span>
                                                    Pembayaran akhir pada
                                                    checkout tetap diproses
                                                    dalam{" "}
                                                    <strong>
                                                        IDR (Rupiah)
                                                    </strong>{" "}
                                                    sesuai regulasi Bank
                                                    Indonesia.
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tombol Simpan */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            className="w-full py-2.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all tracking-wide flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E52027]"
                                        >
                                            <Check className="w-4 h-4 stroke-[2.5]" />
                                            <span>Simpan Preferensi</span>
                                        </button>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
