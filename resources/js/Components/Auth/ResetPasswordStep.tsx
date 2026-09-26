import React, { useState } from "react";
import { Lock, KeyRound, Eye, EyeOff, AlertCircle } from "lucide-react";

interface ResetPasswordStepProps {
    resetSuccessMessage: string;
    resetOtp: string;
    newPassword: string;
    confirmNewPassword: string;
    onChangeResetOtp: (val: string) => void;
    onChangeNewPassword: (val: string) => void;
    onChangeConfirmNewPassword: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    errors: Record<string, string>;
    loading: boolean;
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
}: ResetPasswordStepProps) {
    const [showNewPassword, setShowNewPassword] = useState(false);

    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 font-medium leading-relaxed">
                {resetSuccessMessage || "Kode OTP telah dikirim. Masukkan kode tersebut bersama kata sandi baru Anda."}
                <span className="block text-[11px] text-emerald-600 mt-0.5">
                    (Environment Dev: gunakan kode OTP 123456)
                </span>
            </div>

            {/* Input OTP */}
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kode OTP 6 Digit
                </label>
                <div
                    className={`border rounded-2xl px-4 py-3 flex items-center gap-3 bg-white transition-all ${
                        errors.resetOtp
                            ? "border-red-500 bg-red-50/20 ring-1 ring-red-400/40"
                            : "border-slate-300 focus-within:border-slate-800"
                    }`}
                >
                    <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={resetOtp}
                        onChange={(e) => onChangeResetOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-full bg-transparent text-sm tracking-widest text-slate-800 font-bold focus:outline-none"
                        autoFocus
                    />
                </div>
                {errors.resetOtp && (
                    <p className="text-xs font-medium text-red-600 pl-1 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.resetOtp}
                    </p>
                )}
            </div>

            {/* Kata Sandi Baru */}
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kata Sandi Baru (Min. 8 Karakter)
                </label>
                <div
                    className={`border rounded-2xl px-4 py-3 flex items-center gap-3 bg-white transition-all ${
                        errors.newPassword
                            ? "border-red-500 bg-red-50/20 ring-1 ring-red-400/40"
                            : "border-slate-300 focus-within:border-slate-800"
                    }`}
                >
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => onChangeNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="w-full bg-transparent text-xs text-slate-800 focus:outline-none font-medium"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
                    >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.newPassword && (
                    <p className="text-xs font-medium text-red-600 pl-1 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.newPassword}
                    </p>
                )}
            </div>

            {/* Konfirmasi Kata Sandi Baru */}
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ulangi Kata Sandi Baru
                </label>
                <div
                    className={`border rounded-2xl px-4 py-3 flex items-center gap-3 bg-white transition-all ${
                        errors.confirmNewPassword
                            ? "border-red-500 bg-red-50/20 ring-1 ring-red-400/40"
                            : "border-slate-300 focus-within:border-slate-800"
                    }`}
                >
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type={showNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => onChangeConfirmNewPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi baru"
                        className="w-full bg-transparent text-xs text-slate-800 focus:outline-none font-medium"
                    />
                </div>
                {errors.confirmNewPassword && (
                    <p className="text-xs font-medium text-red-600 pl-1 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.confirmNewPassword}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || !resetOtp || !newPassword || !confirmNewPassword}
                className={`w-full min-h-[46px] py-3 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    resetOtp && newPassword && confirmNewPassword && !loading
                        ? "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xs cursor-pointer"
                        : "bg-red-200 text-white/90 cursor-not-allowed"
                }`}
            >
                {loading ? "Menyimpan..." : "Simpan & Masuk ke Akun"}
            </button>
        </form>
    );
}
