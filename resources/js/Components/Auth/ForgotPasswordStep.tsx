import React from "react";
import { User, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface ForgotPasswordStepProps {
    identifier: string;
    onChangeIdentifier: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    error?: string;
    loading: boolean;
    className?: string;
}

export default function ForgotPasswordStep({
    identifier,
    onChangeIdentifier,
    onSubmit,
    error,
    loading,
    className,
}: ForgotPasswordStepProps) {
    const canSubmit = Boolean(identifier.trim()) && !loading;

    return (
        <form
            onSubmit={onSubmit}
            className={cn("space-y-4 pt-1 select-none", className)}
            noValidate
        >
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-600 leading-relaxed shadow-2xs">
                Masukkan alamat email atau nomor WhatsApp yang terdaftar pada
                akun CRSL Anda untuk menerima 6 digit kode OTP pemulihan kata
                sandi.
            </div>

            <div>
                <label
                    htmlFor="forgot-identifier-input"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                    Email atau Nomor Handphone{" "}
                    <span className="text-primary">*</span>
                </label>
                <div
                    className={cn(
                        "border rounded-2xl px-3.5 py-2.5 sm:py-3 flex items-center gap-2.5 bg-white transition-all shadow-2xs",
                        error
                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                            : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                    )}
                >
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        id="forgot-identifier-input"
                        type="text"
                        disabled={loading}
                        value={identifier}
                        onChange={(e) => onChangeIdentifier(e.target.value)}
                        placeholder="Contoh: bestie@crsl-store.id atau 08123456789"
                        aria-invalid={Boolean(error)}
                        aria-describedby={
                            error ? "forgot-identifier-error" : undefined
                        }
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                        autoFocus
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                    />
                </div>
                {error && (
                    <p
                        id="forgot-identifier-error"
                        role="alert"
                        className="text-xs font-semibold text-rose-600 pl-1 mt-1.5 flex items-center gap-1 animate-in fade-in"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                    </p>
                )}
            </div>

            <div className="pt-1">
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
                            <span>Mengirim Kode OTP...</span>
                        </>
                    ) : (
                        <span>Kirim Kode OTP</span>
                    )}
                </button>
            </div>
        </form>
    );
}
