import React from "react";
import { AlertCircle, Truck } from "lucide-react";
import { cn } from "../../lib/utils";

interface DropshipSectionProps {
    isDropship: boolean;
    onToggleDropship: (checked: boolean) => void;
    dropshipSender: string;
    onSenderChange: (val: string) => void;
    dropshipPhone: string;
    onPhoneChange: (val: string) => void;
    senderError?: string;
    phoneError?: string;
    className?: string;
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
    className,
}: DropshipSectionProps) {
    const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Membersihkan karakter non-numerik untuk menjamin kompatibilitas nomor ekspedisi
        const numeric = e.target.value.replace(/\D/g, "");
        onPhoneChange(numeric);
    };

    return (
        <div
            className={cn(
                "pt-3 border-t border-slate-100 select-none",
                className,
            )}
        >
            {/* Checkbox Sakelar Dropship */}
            <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isDropship}
                    onChange={(e) => onToggleDropship(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-[#E52027] focus:ring-[#E52027] cursor-pointer"
                />
                <span>Kirim sebagai pesanan dropship</span>
            </label>

            {/* Panel Form Data Pengirim Dropship */}
            {isDropship && (
                <div className="mt-3 p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl space-y-3.5 transition-all shadow-2xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-2 text-slate-600 text-xs pb-1 border-b border-slate-200/60">
                        <Truck className="w-3.5 h-3.5 text-[#E52027] shrink-0" />
                        <span className="text-[11px] leading-relaxed">
                            Nama dan nomor kontak pengirim berikut akan tercetak
                            pada label resi pengiriman kurir.
                        </span>
                    </div>

                    {/* Nama Pengirim */}
                    <div>
                        <label
                            htmlFor="dropship-sender-name"
                            className="block text-xs font-bold text-slate-700 mb-1"
                        >
                            Nama Pengirim / Nama Toko{" "}
                            <span className="text-[#E52027]">*</span>
                        </label>
                        <input
                            id="dropship-sender-name"
                            type="text"
                            value={dropshipSender}
                            onChange={(e) => onSenderChange(e.target.value)}
                            placeholder="Contoh: Bestie Merchandise / Toko Anda"
                            aria-invalid={Boolean(senderError)}
                            aria-describedby={
                                senderError
                                    ? "dropship-sender-error"
                                    : undefined
                            }
                            className={cn(
                                "w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm rounded-xl border focus:outline-none transition-all shadow-2xs font-medium text-slate-900 placeholder:text-slate-400",
                                senderError
                                    ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                    : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10",
                            )}
                        />
                        {senderError && (
                            <p
                                id="dropship-sender-error"
                                role="alert"
                                className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold animate-in fade-in"
                            >
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{senderError}</span>
                            </p>
                        )}
                    </div>

                    {/* Nomor Telepon Pengirim */}
                    <div>
                        <label
                            htmlFor="dropship-sender-phone"
                            className="block text-xs font-bold text-slate-700 mb-1"
                        >
                            Nomor WhatsApp / Telepon Pengirim{" "}
                            <span className="text-[#E52027]">*</span>
                        </label>
                        <input
                            id="dropship-sender-phone"
                            type="tel"
                            inputMode="numeric"
                            value={dropshipPhone}
                            onChange={handlePhoneInput}
                            placeholder="Contoh: 08123456789"
                            aria-invalid={Boolean(phoneError)}
                            aria-describedby={
                                phoneError ? "dropship-phone-error" : undefined
                            }
                            className={cn(
                                "w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm rounded-xl border focus:outline-none transition-all shadow-2xs font-mono font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400",
                                phoneError
                                    ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                                    : "border-slate-300 focus:border-[#E52027] focus:ring-2 focus:ring-[#E52027]/10",
                            )}
                        />
                        {phoneError && (
                            <p
                                id="dropship-phone-error"
                                role="alert"
                                className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-semibold animate-in fade-in"
                            >
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{phoneError}</span>
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
