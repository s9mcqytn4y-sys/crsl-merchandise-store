import React from "react";
import { User, AlertCircle } from "lucide-react";

interface LoginIdentifierStepProps {
    identifier: string;
    onChangeIdentifier: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onSwitchToRegister: () => void;
    error?: string;
    loading: boolean;
}

export default function LoginIdentifierStep({
    identifier,
    onChangeIdentifier,
    onSubmit,
    onSwitchToRegister,
    error,
    loading,
}: LoginIdentifierStepProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email atau Nomor Handphone
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
                        placeholder="Contoh: bestie@crsl-store.id atau 08123456789"
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none border-0 p-0 m-0 outline-none ring-0 shadow-none font-medium"
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
                        ? "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xs cursor-pointer active:scale-98"
                        : "bg-red-200 text-white/95 cursor-not-allowed"
                }`}
            >
                Lanjutkan
            </button>

            <div className="text-center text-xs text-slate-600 pt-2">
                Belum punya akun? Daftar{" "}
                <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-[#E52027] font-bold hover:underline cursor-pointer"
                >
                    di sini
                </button>
            </div>

            <p className="text-[11px] text-center text-slate-400 leading-relaxed pt-2">
                Situs ini dilindungi reCAPTCHA dan berlaku Kebijakan Privasi serta Syarat & Ketentuan CRSL Gengs.
            </p>
        </form>
    );
}
