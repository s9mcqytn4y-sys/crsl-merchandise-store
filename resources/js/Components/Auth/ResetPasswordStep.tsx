import React, { useState } from "react";
import {
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface ResetPasswordStepProps {
    resetSuccessMessage?: string;
    resetOtp: string;
    newPassword: string;
    confirmNewPassword: string;
    onChangeResetOtp: (val: string) => void;
    onChangeNewPassword: (val: string) => void;
    onChangeConfirmNewPassword: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    errors: Record<string, string>;
    loading: boolean;
    className?: string;
}

export default function ResetPasswordStep({
    resetSuccessMessage,
    resetOtp,
    newPassword,
    confirmNewPassword,
    onChangeResetOtp,
    onChangeNewPassword,
    onChangeConfirmNewPassword,
    onSubmit,
    errors,
    loading,
    className,
}: ResetPasswordStepProps) {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isOtpComplete = resetOtp.trim().length === 6;
    const isPasswordValid = newPassword.length >= 8;
    const isConfirmValid = confirmNewPassword.length >= 8;
    const isFormValid =
        isOtpComplete && isPasswordValid && isConfirmValid && !loading;

    return (
        <form
            onSubmit={onSubmit}
            className={cn("space-y-4 pt-1 select-none", className)}
            noValidate
        >
            {/* Banner Informasi Pengiriman OTP */}
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 text-xs text-emerald-900 font-medium leading-relaxed shadow-2xs">
                <p>
                    {resetSuccessMessage ||
                        "Kode OTP verifikasi telah dikirimkan. Masukkan kode tersebut bersama kata sandi baru Anda."}
                </p>
                {import.meta.env.DEV && (
                    <span className="block text-[11px] text-emerald-700/80 mt-1 font-mono">
                        (Khusus Mode Dev: Kode OTP simulasi: 123456)
                    </span>
                )}
            </div>

            {/* Input OTP 6 Digit */}
            <div>
                <label
                    htmlFor="reset-otp-input"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                    Kode OTP 6 Digit <span className="text-primary">*</span>
                </label>
                <div
                    className={cn(
                        "border rounded-2xl px-3.5 py-3 flex items-center gap-2.5 bg-white transition-all shadow-2xs",
                        errors.resetOtp
                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                            : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                    )}
                >
                    <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        id="reset-otp-input"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        disabled={loading}
                        value={resetOtp}
                        onChange={(e) =>
                            onChangeResetOtp(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="••••••"
                        aria-invalid={Boolean(errors.resetOtp)}
                        aria-describedby={
                            errors.resetOtp ? "reset-otp-error" : undefined
                        }
                        className="w-full bg-transparent text-sm tracking-[0.35em] text-slate-900 font-bold font-mono focus:outline-none placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                        autoFocus
                        autoComplete="one-time-code"
                    />
                </div>
                {errors.resetOtp && (
                    <p
                        id="reset-otp-error"
                        role="alert"
                        className="text-xs font-semibold text-rose-600 pl-1 mt-1.5 flex items-center gap-1 animate-in fade-in"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.resetOtp}</span>
                    </p>
                )}
            </div>

            {/* Kata Sandi Baru */}
            <div>
                <label
                    htmlFor="reset-new-password"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                    Kata Sandi Baru <span className="text-primary">*</span>
                </label>
                <div
                    className={cn(
                        "border rounded-2xl px-3.5 py-3 flex items-center gap-2.5 bg-white transition-all shadow-2xs",
                        errors.newPassword
                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                            : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                    )}
                >
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        id="reset-new-password"
                        type={showNewPassword ? "text" : "password"}
                        disabled={loading}
                        value={newPassword}
                        onChange={(e) => onChangeNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        aria-invalid={Boolean(errors.newPassword)}
                        aria-describedby={
                            errors.newPassword
                                ? "new-password-error"
                                : undefined
                        }
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-900 focus:outline-none font-medium"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
                        aria-label={
                            showNewPassword
                                ? "Sembunyikan kata sandi"
                                : "Tampilkan kata sandi"
                        }
                    >
                        {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {errors.newPassword && (
                    <p
                        id="new-password-error"
                        role="alert"
                        className="text-xs font-semibold text-rose-600 pl-1 mt-1.5 flex items-center gap-1 animate-in fade-in"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.newPassword}</span>
                    </p>
                )}
            </div>

            {/* Konfirmasi Kata Sandi Baru */}
            <div>
                <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                    Ulangi Kata Sandi Baru{" "}
                    <span className="text-primary">*</span>
                </label>
                <div
                    className={cn(
                        "border rounded-2xl px-3.5 py-3 flex items-center gap-2.5 bg-white transition-all shadow-2xs",
                        errors.confirmNewPassword
                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                            : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                    )}
                >
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        id="reset-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        disabled={loading}
                        value={confirmNewPassword}
                        onChange={(e) =>
                            onChangeConfirmNewPassword(e.target.value)
                        }
                        placeholder="Ketik ulang kata sandi baru"
                        aria-invalid={Boolean(errors.confirmNewPassword)}
                        aria-describedby={
                            errors.confirmNewPassword
                                ? "confirm-password-error"
                                : undefined
                        }
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-900 focus:outline-none font-medium"
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
                        aria-label={
                            showConfirmPassword
                                ? "Sembunyikan konfirmasi kata sandi"
                                : "Tampilkan konfirmasi kata sandi"
                        }
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {errors.confirmNewPassword && (
                    <p
                        id="confirm-password-error"
                        role="alert"
                        className="text-xs font-semibold text-rose-600 pl-1 mt-1.5 flex items-center gap-1 animate-in fade-in"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.confirmNewPassword}</span>
                    </p>
                )}
            </div>

            {/* Tombol Simpan & Masuk */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={cn(
                        "w-full min-h-[48px] py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs",
                        isFormValid
                            ? "bg-primary hover:bg-primary-hover active:scale-[0.99] text-white cursor-pointer"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed select-none",
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Menyimpan Kata Sandi...</span>
                        </>
                    ) : (
                        <span>Simpan & Masuk ke Akun</span>
                    )}
                </button>
            </div>
        </form>
    );
}
