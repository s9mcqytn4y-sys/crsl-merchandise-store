import React from "react";
import { KeyRound, AlertCircle } from "lucide-react";

interface OtpVerifyStepProps {
    targetEmail: string;
    otpCode: string;
    onChangeOtpCode: (val: string) => void;
    countdown: number;
    onResendOtp: () => void;
    onSubmit: (e: React.FormEvent) => void;
    error?: string;
    loading: boolean;
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
}: OtpVerifyStepProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-600 leading-relaxed">
                    Kami telah mengirimkan 6 digit kode OTP verifikasi ke:
                </p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                    {targetEmail}
                </p>
                <p className="text-[11px] text-amber-600 mt-1 font-medium">
                    (Development Mode: gunakan kode OTP 123456)
                </p>
            </div>

            <div>
                <div
                    className={`border rounded-2xl px-4 py-3.5 flex items-center justify-center gap-3 bg-white transition-all ${
                        error
                            ? "border-red-500 bg-red-50/20 ring-1 ring-red-400/40"
                            : "border-slate-300 focus-within:border-slate-800"
                    }`}
                >
                    <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => onChangeOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-full bg-transparent text-base sm:text-lg tracking-[0.3em] text-center text-slate-900 font-bold focus:outline-none border-0 p-0 m-0 outline-none ring-0 shadow-none"
                        autoFocus
                    />
                </div>
                {error && (
                    <p className="text-xs font-medium text-red-600 pl-1 mt-1.5 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {error}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={otpCode.length !== 6 || loading}
                className={`w-full min-h-[46px] py-3 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    otpCode.length === 6 && !loading
                        ? "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xs cursor-pointer active:scale-98"
                        : "bg-red-200 text-white/95 cursor-not-allowed"
                }`}
            >
                {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
            </button>

            <div className="pt-2 text-xs text-slate-500">
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
                        className="text-[#E52027] font-bold hover:underline cursor-pointer"
                    >
                        Kirim Ulang Kode OTP
                    </button>
                )}
            </div>
        </form>
    );
}
