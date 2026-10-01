import React, { useRef } from "react";
import { KeyRound, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface OtpVerifyStepProps {
    targetEmail: string;
    otpCode: string;
    onChangeOtpCode: (val: string) => void;
    countdown: number;
    onResendOtp: () => void;
    onSubmit: (e: React.FormEvent) => void;
    error?: string;
    loading: boolean;
    className?: string;
}

export default function OtpVerifyStep({
    targetEmail,
    otpCode,
    onChangeOtpCode,
    countdown,
    onResendOtp,
    onSubmit,
    error,
    loading,
    className,
}: OtpVerifyStepProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Menangani paste teks OTP dari clipboard (misal dari notifikasi SMS/Email)
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        if (pastedData) {
            onChangeOtpCode(pastedData);
        }
    };

    const isOtpComplete = otpCode.trim().length === 6;
    const canSubmit = isOtpComplete && !loading;

    return (
        <form
            onSubmit={onSubmit}
            className={cn("space-y-4 pt-1 text-center select-none", className)}
            noValidate
        >
            {/* Informasi Pengiriman OTP */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
                <p className="text-xs text-slate-600 leading-relaxed">
                    Kami telah mengirimkan 6 digit kode OTP verifikasi ke:
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1 font-mono break-all">
                    {targetEmail}
                </p>
                {import.meta.env.DEV && (
                    <span className="block text-[11px] text-amber-700 mt-1.5 font-mono">
                        (Khusus Mode Dev: Kode OTP simulasi: 123456)
                    </span>
                )}
            </div>

            {/* Input OTP 6 Digit */}
            <div>
                <label htmlFor="otp-verification-input" className="sr-only">
                    Masukkan 6 Digit Kode OTP Verifikasi
                </label>
                <div
                    className={cn(
                        "border rounded-2xl px-4 py-3 flex items-center justify-center gap-3 bg-white transition-all shadow-2xs",
                        error
                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                            : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                    )}
                >
                    <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        id="otp-verification-input"
                        ref={inputRef}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        disabled={loading}
                        value={otpCode}
                        onChange={(e) =>
                            onChangeOtpCode(e.target.value.replace(/\D/g, ""))
                        }
                        onPaste={handlePaste}
                        placeholder="••••••"
                        aria-invalid={Boolean(error)}
                        aria-describedby={
                            error ? "otp-error-message" : undefined
                        }
                        className="w-full bg-transparent text-base sm:text-lg tracking-[0.35em] text-center text-slate-900 font-black font-mono focus:outline-none placeholder:text-slate-300 placeholder:tracking-widest"
                        autoFocus
                        autoComplete="one-time-code"
                    />
                </div>
                {error && (
                    <p
                        id="otp-error-message"
                        role="alert"
                        className="text-xs font-semibold text-rose-600 pl-1 mt-1.5 flex items-center justify-center gap-1 animate-in fade-in"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                    </p>
                )}
            </div>

            {/* Tombol Submit */}
            <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                    "w-full min-h-[48px] py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs",
                    canSubmit
                        ? "bg-primary hover:bg-primary-hover active:scale-[0.99] text-white cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed select-none",
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi Akun...</span>
                    </>
                ) : (
                    <span>Verifikasi & Masuk</span>
                )}
            </button>

            {/* Hitung Mundur & Tombol Kirim Ulang OTP */}
            <div className="pt-1.5 text-xs text-slate-500">
                {countdown > 0 ? (
                    <p>
                        Kirim ulang kode dalam{" "}
                        <span className="font-bold text-slate-800 font-mono">
                            {Math.floor(countdown / 60)}:
                            {String(countdown % 60).padStart(2, "0")}
                        </span>
                    </p>
                ) : (
                    <button
                        type="button"
                        onClick={onResendOtp}
                        disabled={loading}
                        className="text-primary hover:text-primary-hover font-bold hover:underline cursor-pointer disabled:opacity-50"
                    >
                        Kirim Ulang Kode OTP
                    </button>
                )}
            </div>
        </form>
    );
}
