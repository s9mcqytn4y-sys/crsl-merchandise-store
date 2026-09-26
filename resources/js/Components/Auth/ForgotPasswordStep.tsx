import React from "react";
import { User, AlertCircle } from "lucide-react";

interface ForgotPasswordStepProps {
    identifier: string;
    onChangeIdentifier: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    error?: string;
    loading: boolean;
}

export default function ForgotPasswordStep({
    identifier,
    onChangeIdentifier,
    onSubmit,
    error,
    loading,
}: ForgotPasswordStepProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
            <p className="text-xs text-slate-600 leading-relaxed">
                Masukkan alamat email atau nomor WhatsApp yang terdaftar untuk menerima 6 digit kode OTP pemulihan kata sandi.
            </p>

            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email / Nomor Handphone Terdaftar
                </label>
                <div
                    className={`border rounded-2xl px-4 py-3 flex items-center gap-3 bg-white transition-all ${
                        error
                            ? "border-red-500 bg-red-50/20 ring-1 ring-red-400/40"
                            : "border-slate-300 focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800"
                    }`}
                >
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="text"
                        value={identifier}
                        onChange={(e) => onChangeIdentifier(e.target.value)}
                        placeholder="Contoh: abdul@crsl-store.id"
                        className="w-full bg-transparent text-xs text-slate-800 focus:outline-none font-medium placeholder-slate-400"
                        autoFocus
                    />
                </div>
                {error && (
                    <p className="text-xs font-medium text-red-600 pl-1 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {error}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={!identifier.trim() || loading}
                className={`w-full min-h-[46px] py-3 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    identifier.trim() && !loading
                        ? "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xs cursor-pointer"
                        : "bg-red-200 text-white/90 cursor-not-allowed"
                }`}
            >
                {loading ? "Mengirim OTP..." : "Kirim Kode OTP"}
            </button>
        </form>
    );
}
