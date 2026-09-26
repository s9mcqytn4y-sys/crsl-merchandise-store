import React from "react";
import { AlertCircle } from "lucide-react";

interface DropshipSectionProps {
    isDropship: boolean;
    onToggleDropship: (checked: boolean) => void;
    dropshipSender: string;
    onSenderChange: (val: string) => void;
    dropshipPhone: string;
    onPhoneChange: (val: string) => void;
    senderError?: string;
    phoneError?: string;
}

export default function DropshipSection({
    isDropship,
    onToggleDropship,
    dropshipSender,
    onSenderChange,
    dropshipPhone,
    onPhoneChange,
    senderError,
    phoneError,
}: DropshipSectionProps) {
    return (
        <div className="pt-2 border-t border-slate-100">
            <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={isDropship}
                    onChange={(e) => onToggleDropship(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#E52027] focus:ring-[#E52027]"
                />
                <span>Kirim sebagai pesanan dropship (Make as a dropship order)</span>
            </label>

            {isDropship && (
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 transition-all animate-fadeIn">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Nama Pengirim Dropship *
                        </label>
                        <input
                            type="text"
                            value={dropshipSender}
                            onChange={(e) => onSenderChange(e.target.value)}
                            placeholder="Contoh: Nama Toko / Reseller Anda"
                            className={`w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border rounded-xl focus:outline-none transition-all ${
                                senderError
                                    ? "border-red-500 ring-1 ring-red-500"
                                    : "border-slate-200 focus:border-slate-800"
                            }`}
                        />
                        {senderError && (
                            <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {senderError}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Nomor Telepon Pengirim *
                        </label>
                        <input
                            type="tel"
                            value={dropshipPhone}
                            onChange={(e) => onPhoneChange(e.target.value)}
                            placeholder="0812xxxxxxxx"
                            className={`w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm border rounded-xl focus:outline-none transition-all font-mono ${
                                phoneError
                                    ? "border-red-500 ring-1 ring-red-500"
                                    : "border-slate-200 focus:border-slate-800"
                            }`}
                        />
                        {phoneError && (
                            <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {phoneError}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
