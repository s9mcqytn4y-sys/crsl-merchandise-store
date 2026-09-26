import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

interface LoginPasswordStepProps {
    identifier: string;
    password: string;
    onChangePassword: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onChangeIdentifierClick: () => void;
    onForgotPasswordClick: () => void;
    error?: string;
    loading: boolean;
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
}: LoginPasswordStepProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
            {/* Field Identifier Readonly */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                            Akun
                        </span>
                        <span className="block text-xs font-semibold text-slate-800 truncate">
                            {identifier}
                        </span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onChangeIdentifierClick}
                    className="text-xs text-[#E52027] font-semibold hover:underline shrink-0 cursor-pointer"
                >
                    Ubah
                </button>
            </div>

            {/* Field Password */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                        Kata Sandi
                    </label>
                    <button
                        type="button"
                        onClick={onForgotPasswordClick}
                        className="text-xs font-semibold text-[#E52027] hover:underline cursor-pointer"
                    >
                        Lupa sandi?
                    </button>
                </div>

                <div
                    className={`border rounded-2xl px-4 py-3 flex items-center gap-3 bg-white relative transition-all ${
                        error
                            ? "border-red-500 bg-red-50/20 ring-1 ring-red-400/40"
                            : "border-slate-300 focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800"
                    }`}
                >
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => onChangePassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun"
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none border-0 p-0 m-0 outline-none ring-0 shadow-none font-medium"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
                        aria-label={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
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
                disabled={!password || loading}
                className={`w-full min-h-[46px] py-3 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                    password && !loading
                        ? "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xs cursor-pointer active:scale-98"
                        : "bg-red-200 text-white/95 cursor-not-allowed"
                }`}
            >
                {loading ? "Memproses..." : "Masuk"}
            </button>
        </form>
    );
}
