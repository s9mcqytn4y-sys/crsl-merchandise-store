import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Globe, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PreferensiModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCountry?: string;
    currentLanguage?: string;
    currentCurrency?: string;
    onSavePreferences?: (country: string, lang: string, currency: string) => void;
}

export default function PreferensiModal({
    isOpen,
    onClose,
    currentCountry = 'ID',
    currentLanguage = 'id',
    currentCurrency = 'IDR',
    onSavePreferences
}: PreferensiModalProps) {
    const [country, setCountry] = useState(currentCountry);
    const [language, setLanguage] = useState(currentLanguage);
    const [currency, setCurrency] = useState(currentCurrency);

    const handleSave = () => {
        if (onSavePreferences) {
            onSavePreferences(country, language, currency);
        }
        toast.success(`Preferensi disimpan: ${country} | ${language.toUpperCase()} | ${currency}`);
        onClose();
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-slate-100">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <Dialog.Title as="h3" className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-[#E52027]" /> Region & Language Preferences
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold p-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4 text-xs pt-4">
                                    {/* Country / Deliver To */}
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1.5">Deliver to:</label>
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-[#E52027]"
                                        >
                                            <option value="ID">🇮🇩 Indonesia</option>
                                            <option value="MY">🇲🇾 Malaysia</option>
                                            <option value="SG">🇸🇬 Singapore</option>
                                        </select>
                                    </div>

                                    {/* Language */}
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1.5">Language:</label>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-[#E52027]"
                                        >
                                            <option value="id">🌐 Bahasa Indonesia</option>
                                            <option value="en">🇬🇧 English</option>
                                        </select>
                                    </div>

                                    {/* Currency */}
                                    <div>
                                        <label className="font-bold text-slate-700 block mb-1.5">Currency:</label>
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-[#E52027]"
                                        >
                                            <option value="IDR">IDR - Indonesian Rupiah</option>
                                            <option value="USD">USD - United States Dollar</option>
                                            <option value="SGD">SGD - Singapore Dollar</option>
                                            <option value="MYR">MYR - Malaysian Ringgit</option>
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="w-full py-3 bg-[#E52027] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1 mt-2"
                                    >
                                        <Check className="w-4 h-4" /> Save Preferences
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
