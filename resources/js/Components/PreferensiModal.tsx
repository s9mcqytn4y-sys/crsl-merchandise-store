import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Globe, X, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface PreferensiModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCountry?: string;
    currentLanguage?: string;
    currentCurrency?: string;
    onSavePreferences?: (
        country: string,
        lang: string,
        currency: string,
    ) => void;
}

// Komponen helper render bendera SVG agar konsisten di Windows OS
function FlagBadge({ code }: { code: string }) {
    switch (code) {
        case "ID":
            return (
                <svg
                    width="18"
                    height="12"
                    viewBox="0 0 18 12"
                    className="rounded-xs border border-slate-200 shrink-0"
                    aria-hidden="true"
                >
                    <rect width="18" height="6" fill="#CE1126" />
                    <rect y="6" width="18" height="6" fill="#FFFFFF" />
                </svg>
            );
        case "MY":
            return (
                <svg
                    width="18"
                    height="12"
                    viewBox="0 0 18 12"
                    className="rounded-xs border border-slate-200 shrink-0"
                    aria-hidden="true"
                >
                    <rect width="18" height="12" fill="#010066" />
                    <path
                        d="M0 0h18v1.5H0zm0 3h18v1.5H0zm0 3h18v1.5H0zm0 3h18v1.5H0z"
                        fill="#CC0000"
                    />
                    <rect width="9" height="7" fill="#010066" />
                    <circle cx="4.5" cy="3.5" r="2" fill="#FFCC00" />
                </svg>
            );
        case "SG":
            return (
                <svg
                    width="18"
                    height="12"
                    viewBox="0 0 18 12"
                    className="rounded-xs border border-slate-200 shrink-0"
                    aria-hidden="true"
                >
                    <rect width="18" height="6" fill="#ED2939" />
                    <rect y="6" width="18" height="6" fill="#FFFFFF" />
                </svg>
            );
        default:
            return (
                <span className="text-xs font-bold text-slate-500">{code}</span>
            );
    }
}

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
    { code: "IDR", label: "IDR - Indonesian Rupiah" },
    { code: "USD", label: "USD - United States Dollar" },
    { code: "SGD", label: "SGD - Singapore Dollar" },
    { code: "MYR", label: "MYR - Malaysian Ringgit" },
];

export default function PreferensiModal({
    isOpen,
    onClose,
    currentCountry = "ID",
    currentLanguage = "id",
    currentCurrency = "IDR",
    onSavePreferences,
}: PreferensiModalProps) {
    const [country, setCountry] = useState(currentCountry);
    const [language, setLanguage] = useState(currentLanguage);
    const [currency, setCurrency] = useState(currentCurrency);

    // Sinkronkan state lokal saat modal dibuka ulang dengan props baru
    useEffect(() => {
        if (isOpen) {
            setCountry(currentCountry);
            setLanguage(currentLanguage);
            setCurrency(currentCurrency);
        }
    }, [isOpen, currentCountry, currentLanguage, currentCurrency]);

    const handleSave = () => {
        onSavePreferences?.(country, language, currency);
        toast.success(
            `Preferensi diperbarui: ${country} • ${language.toUpperCase()} • ${currency}`,
        );
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
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-start justify-center sm:justify-end p-4 sm:pt-16 sm:pr-12">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 -translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-2"
                        >
                            <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-5 text-left shadow-2xl border border-slate-100 transition-all">
                                {/* Header Modal */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-sm font-bold text-slate-800 flex items-center gap-2"
                                    >
                                        <div className="w-6 h-6 rounded-md bg-red-50 text-[#E52027] flex items-center justify-center">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        Region & Language
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:outline-none"
                                        aria-label="Tutup preferensi"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Form Body */}
                                <div className="space-y-4 pt-4 text-xs">
                                    {/* Negera Tujuan Pengiriman */}
                                    <div>
                                        <label
                                            htmlFor="select-deliver-to"
                                            className="font-semibold text-slate-700 block mb-1.5"
                                        >
                                            Deliver to:
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="select-deliver-to"
                                                value={country}
                                                onChange={(e) =>
                                                    setCountry(e.target.value)
                                                }
                                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white transition-all cursor-pointer"
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

                                    {/* Bahasa */}
                                    <div>
                                        <label
                                            htmlFor="select-language"
                                            className="font-semibold text-slate-700 block mb-1.5"
                                        >
                                            Language:
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="select-language"
                                                value={language}
                                                onChange={(e) =>
                                                    setLanguage(e.target.value)
                                                }
                                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white transition-all cursor-pointer"
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
                                            className="font-semibold text-slate-700 block mb-1.5"
                                        >
                                            Currency:
                                        </label>
                                        <div className="relative">
                                            <select
                                                id="select-currency"
                                                value={currency}
                                                onChange={(e) =>
                                                    setCurrency(e.target.value)
                                                }
                                                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E52027] focus:bg-white transition-all cursor-pointer"
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
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            className="w-full py-2.5 bg-[#E52027] hover:bg-[#CC1C22] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all tracking-wide flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#E52027] focus-visible:ring-offset-2 focus-visible:outline-none"
                                        >
                                            <Check
                                                className="w-4 h-4"
                                                strokeWidth={2.5}
                                            />
                                            Simpan Preferensi
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
