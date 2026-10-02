import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface LoginPasswordStepProps {
    identifier: string;
    password: string;
    onChangePassword: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onChangeIdentifierClick: () => void;
    onForgotPasswordClick: () => void;
    error?: string;
    loading: boolean;
    className?: string;
}

export default function LoginPasswordStep({
    identifier,
    password,
    onChangePassword,
    onSubmit,
    onChangeIdentifierClick,
    onForgotPasswordClick,
    error,
    loading,
    className,
}: LoginPasswordStepProps) {
    const [showPassword, setShowPassword] = useState(false);

    const canSubmit = Boolean(password.trim()) && !loading;

    return (
        <form
            onSubmit={onSubmit}
            className={cn("space-y-4 pt-1 select-none", className)}
            noValidate
        >
            {/* Field Identifier Readonly Card */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none">
                            Akun
                        </span>
                        <span className="block text-xs font-bold text-slate-800 truncate mt-0.5 font-mono">
                            {identifier}
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onChangeIdentifierClick}
                    disabled={loading}
                    className="text-xs text-primary hover:text-primary-hover font-bold hover:underline shrink-0 cursor-pointer disabled:opacity-50"
                >
                    Ubah
                </button>
            </div>

            {/* Field Input Password */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label
                        htmlFor="login-password-input"
                        className="block text-xs font-bold text-slate-700"
                    >
                        Kata Sandi <span className="text-primary">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={onForgotPasswordClick}
                        disabled={loading}
                        className="text-xs font-bold text-primary hover:text-primary-hover hover:underline cursor-pointer disabled:opacity-50"
                    >
                        Lupa sandi?
                    </button>
                </div>

                <div
                    className={cn(
                        "border rounded-2xl px-3.5 py-2.5 sm:py-3 flex items-center gap-2.5 bg-white transition-all shadow-2xs",
                        error
                            ? "border-rose-400 bg-rose-50/20 ring-2 ring-rose-400/20"
                            : "border-slate-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10",
                    )}
                >
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        id="login-password-input"
                        type={showPassword ? "text" : "password"}
                        disabled={loading}
                        value={password}
                        onChange={(e) => onChangePassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun"
                        aria-invalid={Boolean(error)}
                        aria-describedby={
                            error ? "login-password-error" : undefined
                        }
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
                        autoFocus
                        autoComplete="current-password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
                        aria-label={
                            showPassword
                                ? "Sembunyikan kata sandi"
                                : "Lihat kata sandi"
                        }
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                </div>
                {error && (
                    <p
                        id="login-password-error"
                        role="alert"
                        className="text-xs font-semibold text-rose-600 pl-1 mt-1.5 flex items-center gap-1 animate-in fade-in"
                    >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{error}</span>
                    </p>
                )}
            </div>

            {/* Tombol Submit */}
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={cn(
                        "w-full min-h-12 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs",
                        canSubmit
                            ? "bg-primary hover:bg-primary-hover active:scale-[0.99] text-white cursor-pointer"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed select-none",
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Memproses Autentikasi...</span>
                        </>
                    ) : (
                        <span>Masuk ke Akun</span>
                    )}
                </button>
            </div>
        </form>
    );
}
