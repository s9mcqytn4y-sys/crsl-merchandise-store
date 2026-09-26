import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, Check, ChevronDown, AlertCircle } from "lucide-react";

interface RegisterStepProps {
    fullName: string;
    regEmail: string;
    regPassword: string;
    birthDay: string;
    birthMonth: string;
    birthYear: string;
    onChangeFullName: (val: string) => void;
    onChangeRegEmail: (val: string) => void;
    onChangeRegPassword: (val: string) => void;
    onChangeBirthDay: (val: string) => void;
    onChangeBirthMonth: (val: string) => void;
    onChangeBirthYear: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onSwitchToLogin: () => void;
    errors: Record<string, string>;
    loading: boolean;
}

export default function RegisterStep({
    fullName,
    regEmail,
    regPassword,
    birthDay,
    birthMonth,
    birthYear,
    onChangeFullName,
    onChangeRegEmail,
    onChangeRegPassword,
    onChangeBirthDay,
    onChangeBirthMonth,
    onChangeBirthYear,
    onSubmit,
    onSwitchToLogin,
    errors,
    loading,
}: RegisterStepProps) {
    const [showPassword, setShowPassword] = useState(false);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim());
    const isRegisterComplete =
        Boolean(fullName.trim()) && isEmailValid && regPassword.length >= 8;

    return (
        <form onSubmit={onSubmit} className="space-y-3.5 pt-4">
            <p className="text-xs text-slate-600 leading-relaxed">
                Daftar untuk menjadi member CRSL, kumpulkan poin loyalitas, dapatkan voucher eksklusif, dan rilisan terbaru lebih awal.
            </p>

            {/* Full Name */}
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap*
                </label>
                <div
                    className={`border rounded-2xl px-4 py-3 bg-white transition-all ${
                        errors.fullName
                            ? "border-red-500 bg-red-50/20 ring-1 ring-red-400/40"
                            : "border-slate-300 focus-within:border-slate-800"
                    }`}
                >
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => onChangeFullName(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none border-0 p-0 m-0 outline-none ring-0 shadow-none font-medium"
                        required
                    />
                </div>
                {errors.fullName && (
                    <p className="text-xs font-medium text-red-600 pl-1 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.fullName}
                    </p>
                )}
            </div>

            {/* Email */}
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Email*
                </label>
                <div
                    className={`border rounded-2xl px-4 py-3 flex items-center gap-3 bg-white transition-all ${
                        errors.regEmail
                            ? "border-red-500 bg-red-50/20 ring-1 ring-red-400/40"
                            : "border-slate-300 focus-within:border-slate-800"
                    }`}
                >
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => onChangeRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none border-0 p-0 m-0 outline-none ring-0 shadow-none font-medium"
                        required
                    />
                    {isEmailValid && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                </div>
                {errors.regEmail && (
                    <p className="text-xs font-medium text-red-600 pl-1 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.regEmail}
                    </p>
                )}
            </div>

            {/* Password */}
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi (Min. 8 Karakter)*
                </label>
                <div
                    className={`border rounded-2xl px-4 py-3 flex items-center gap-3 bg-white transition-all ${
                        errors.regPassword
                            ? "border-red-500 bg-red-50/20 ring-1 ring-red-400/40"
                            : "border-slate-300 focus-within:border-slate-800"
                    }`}
                >
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => onChangeRegPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none border-0 p-0 m-0 outline-none ring-0 shadow-none font-medium"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.regPassword && (
                    <p className="text-xs font-medium text-red-600 pl-1 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.regPassword}
                    </p>
                )}
            </div>

            {/* Dropdowns Tanggal Lahir */}
            <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tanggal Lahir
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                    <div className="relative">
                        <select
                            aria-label="Hari Kelahiran"
                            value={birthDay}
                            onChange={(e) => onChangeBirthDay(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-300 rounded-2xl px-3 py-2.5 text-xs text-slate-800 pr-8 focus:outline-none focus:border-slate-800 cursor-pointer font-medium"
                        >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                <option key={d} value={String(d).padStart(2, "0")}>
                                    {String(d).padStart(2, "0")}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            aria-label="Bulan Kelahiran"
                            value={birthMonth}
                            onChange={(e) => onChangeBirthMonth(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-300 rounded-2xl px-3 py-2.5 text-xs text-slate-800 pr-8 focus:outline-none focus:border-slate-800 cursor-pointer font-medium"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <option key={m} value={String(m).padStart(2, "0")}>
                                    {String(m).padStart(2, "0")}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            aria-label="Tahun Kelahiran"
                            value={birthYear}
                            onChange={(e) => onChangeBirthYear(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-300 rounded-2xl px-3 py-2.5 text-xs text-slate-800 pr-8 focus:outline-none focus:border-slate-800 cursor-pointer font-medium"
                        >
                            {Array.from({ length: 70 }, (_, i) => 2026 - i).map((y) => (
                                <option key={y} value={String(y)}>
                                    {y}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={!isRegisterComplete || loading}
                className={`w-full min-h-[46px] py-3 rounded-full text-xs sm:text-sm font-semibold transition-all mt-2 ${
                    isRegisterComplete && !loading
                        ? "bg-[#E52027] hover:bg-[#CC1C22] text-white shadow-xs cursor-pointer active:scale-98"
                        : "bg-red-200 text-white/95 cursor-not-allowed"
                }`}
            >
                {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>

            <div className="text-center text-xs text-slate-600 pt-2">
                Sudah memiliki akun? Masuk{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-[#E52027] font-bold hover:underline cursor-pointer"
                >
                    di sini
                </button>
            </div>
        </form>
    );
}
